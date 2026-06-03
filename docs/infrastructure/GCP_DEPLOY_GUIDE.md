# GCP Deployment Guide (Kumu)

This document describes the **infrastructure deployment workflow** on Google Cloud Platform for the Kumu project: creating GCP projects, CLI authentication, running Terraform/Terragrunt stacks in order, and deploying the application once infra is ready.

Internal policy (naming, tiers, IAM): [infra/wiki.md](infra/wiki.md).  
Infra code layout: [infra/README.md](infra/README.md).

---

## Table of contents

1. [Architecture overview](#1-architecture-overview)
2. [Prerequisites](#2-prerequisites)
3. [Create GCP projects (manual)](#3-create-gcp-projects-manual)
4. [Local login and permissions](#4-local-login-and-permissions)
5. [Terraform apply order](#5-terraform-apply-order)
6. [Configure `terraform.tfvars`](#6-configure-terraformtfvars)
   - [6.5 Dev / Stg: SQL schedule & API cron (on by default)](#65-dev--stg-sql-schedule--api-cron-on-by-default)
   - [6.6 Secrets — Secret Manager (required)](#66-secrets--secret-manager-required)
   - [6.7 Production: Cloud SQL backup & deletion protection (required)](#67-production-cloud-sql-backup--deletion-protection-required)
7. [Terragrunt commands (recommended)](#7-terragrunt-commands-recommended)
8. [Plain Terraform (per stack)](#8-plain-terraform-per-stack)
9. [After infra apply](#9-after-infra-apply)
10. [CI/CD and GitHub Actions](#10-cicd-and-github-actions)
11. [Common troubleshooting](#11-common-troubleshooting)

---

## 1. Architecture overview

### Four-project model

Per the wiki, each service uses **four separate projects**:

| Project | Role | Terraform stack |
|---------|------|-----------------|
| `{org}-{service}-common` | Artifact Registry, Terraform state bucket, (usually) Cloud Build | `bootstrap` → `common` |
| `{org}-{service}-dev` | Development | `dev/network` → `dev/app` |
| `{org}-{service}-stg` | Staging | `stg/network` → `stg/app` |
| `{org}-{service}-prod` | Production | `prod/network` → `prod/app` |

**Naming examples** (wiki): `veho-kumu-common`, `veho-kumu-dev`, `veho-kumu-stg`, `veho-kumu-prod`.

> **Note:** Terraform in this repo **does not create GCP projects**. You (or the platform team) create projects in the Console / org first, then set `project_id` in `terraform.tfvars`.

### Stack order and state

```mermaid
flowchart TD
  A[bootstrap<br/>GCS state bucket<br/>state: local] --> B[common<br/>Artifact Registry<br/>prefix: common/main]
  B --> C[network / env<br/>VPC + PSA<br/>prefix: network/dev|stg|prod]
  C --> D[app / env<br/>Cloud Run, SQL, GCS...<br/>prefix: app/dev|stg|prod]
```

| Terragrunt unit | Terraform source | State prefix (GCS) |
|-----------------|------------------|---------------------|
| `infra/live/bootstrap` | `infra/environments/bootstrap` | *(local in bootstrap dir)* |
| `infra/live/common` | `infra/environments/common` | `common/main` |
| `infra/live/dev/network` | `_shared/network` + `dev/network/terraform.tfvars` | `network/dev` |
| `infra/live/dev/app` | `_shared/app` + `dev/app/terraform.tfvars` | `app/dev` |
| `infra/live/stg/...` | same pattern | `network/stg`, `app/stg` |
| `infra/live/prod/...` | same pattern | `network/prod`, `app/prod` |

Default state bucket in code (after bootstrap): `dx-kumu-common-terraform-state` — change at bootstrap if your org uses another name, and update `backend.tf` / `terragrunt.hcl` to match.

### Runtime flow (after infra)

```
Cloud Build (build image) → Artifact Registry (common) → Cloud Run (app project) → Cloud SQL (private IP via network stack)
```

---

## 2. Prerequisites

### Tools

| Tool | Version / notes |
|------|-----------------|
| [Terraform](https://developer.hashicorp.com/terraform/downloads) | `>= 1.5` |
| [Terragrunt](https://terragrunt.gruntwork.io/docs/getting-started/install/) | Recommended when running multiple stacks (dependency order) |
| [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) | `gcloud` |

### Minimum IAM (user running first apply)

On the **common** project (bootstrap + common):

- Create GCS bucket, enable Storage API
- Create / manage Artifact Registry
- Write Terraform state to the bucket

On **each app project** (dev/stg/prod):

- `roles/editor` or equivalent (Cloud Run, Cloud SQL, VPC, Secret Manager, IAM bindings within modules)
- Ability to enable APIs via `google_project_service`

Prod: the wiki recommends restricted access (PAM/JIT); prod apply should go through PR + review, not from a personal laptop if policy forbids it.

---

## 3. Create GCP projects (manual)

### Step 1 — Create projects in GCP

1. Open [Google Cloud Console](https://console.cloud.google.com/) → **IAM & Admin** → **Create Project**.
2. **Project ID** per wiki format: `{org-prefix}-{service}-{env}` (lowercase, max 30 characters).
3. Attach a **billing account** to each project (required for Cloud Run / SQL).
4. Repeat for: `common`, `dev`, `stg`, `prod`.

### Step 2 — Record project numbers (cross-project IAM)

The **common** Artifact Registry must allow app projects to **pull images**. Get the project number:

```bash
gcloud projects describe PROJECT_ID --format='value(projectNumber)'
```

Cloud Run Service Agent (cross-project image pull):

```text
serviceAccount:service-PROJECT_NUMBER@serverless-robot-prod.iam.gserviceaccount.com
```

Cloud Build SA (project where builds run, often common or app):

```text
serviceAccount:PROJECT_NUMBER@cloudbuild.gserviceaccount.com
```

Declare these in `infra/environments/common/terraform.tfvars` (`reader_project_ids`, `additional_artifact_registry_reader_members`, `additional_artifact_registry_writer_members`). See [terraform.tfvars.example](infra/environments/common/terraform.tfvars.example).

### Step 3 — (Optional) Project `tier` label

The app module can set the `tier` label on the project (`manage_gcp_project_labels`). The first time you enable this you may need:

```bash
cd infra/live/dev/app   # or the matching app unit
terragrunt import 'module.app_compose.module.iam.google_project.wiki_labels[0]' YOUR_PROJECT_ID
```

Details: comments in [dev/app/terraform.tfvars.example](infra/environments/dev/app/terraform.tfvars.example).

---

## 4. Local login and permissions

The Terraform `google` provider uses **Application Default Credentials (ADC)**. You need **two** login steps:

### 4.1 CLI login (`gcloud`, manual build/deploy)

```bash
gcloud auth login
```

- Opens a browser; pick a Google account with access to the projects.
- Used for: `gcloud builds submit`, `gcloud run deploy`, logs, etc.

### 4.2 ADC for Terraform

```bash
gcloud auth application-default login
```

- Credentials stored at `~/.config/gcloud/application_default_credentials.json`.
- **Required** for `terraform plan/apply` and `terragrunt`.

### 4.3 Default project (optional, for `gcloud` only)

```bash
# Example when working on dev
gcloud config set project veho-kumu-dev
gcloud config get-value project
```

Terraform does **not** use `gcloud config project` as the source of truth; `project_id` comes from `terraform.tfvars`. Set config only for convenience when running `gcloud` manually.

### 4.4 Verify login

```bash
gcloud auth list
gcloud auth application-default print-access-token >/dev/null && echo "ADC OK"
```

ADC tokens expire — if Terraform reports credential errors, run `gcloud auth application-default login` again.

### 4.5 (Advanced) Impersonate a service account

If your org disallows direct user apply and only allows SA impersonation:

```bash
export GOOGLE_IMPERSONATE_SERVICE_ACCOUNT=terraform@veho-kumu-common.iam.gserviceaccount.com
gcloud auth application-default login --impersonate-service-account="$GOOGLE_IMPERSONATE_SERVICE_ACCOUNT"
```

Only when the platform team has granted `roles/iam.serviceAccountTokenCreator`.

---

## 5. Terraform apply order

Run **once per new org/environment**, then only `plan/apply` when code or tfvars change.

| Step | Stack | Purpose | Depends on |
|------|-------|---------|------------|
| 1 | **bootstrap** | GCS bucket for Terraform state | **common** project exists |
| 2 | **common** | Docker Artifact Registry (`kumu-docker`), cross-project IAM | Bootstrap done; copy/rename `backend.tf` if needed |
| 3 | **`<env>/network`** | VPC, connector subnet, Private Service Access (Cloud SQL private IP) | State bucket; env **app** project |
| 4 | **`<env>/app`** | Cloud Run API/Web, Cloud SQL, GCS, secrets, cron, migrate job, … | Network applied; images can be pushed later |
| 5 | **Deploy app** | Build images + deploy Cloud Run / run migrate job | Common registry + app stack |

**Important:** If `enable_cloud_sql = true` in the app stack, you must set `network_remote_state_bucket` and `network_remote_state_prefix` to that env’s network state, and **apply network before app**.

---

## 6. Configure `terraform.tfvars`

`terraform.tfvars` files are **not committed** (gitignored). Copy from `*.example`:

```bash
# Common
cp infra/environments/common/terraform.tfvars.example infra/environments/common/terraform.tfvars

# Dev (example)
cp infra/environments/dev/network/terraform.tfvars.example infra/environments/dev/network/terraform.tfvars
cp infra/environments/dev/app/terraform.tfvars.example infra/environments/dev/app/terraform.tfvars
```

### 6.1 Bootstrap (`environments/bootstrap/terraform.tfvars`)

| Variable | Meaning |
|----------|---------|
| `project_id` | **common** project |
| `region` | Bucket region (e.g. `asia-northeast1`) |
| `state_bucket_name` | Globally unique GCS bucket name (e.g. `veho-kumu-common-terraform-state`) |

### 6.2 Common

| Variable | Meaning |
|----------|---------|
| `project_id` | common project |
| `artifact_repo_id` | Docker repo (default `kumu-docker`) |
| `reader_project_ids` | App projects allowed to **pull** images |
| `additional_artifact_registry_reader_members` | Cross-project Cloud Run SAs |
| `additional_artifact_registry_writer_members` | Cloud Build SAs that **push** images |

After bootstrap, enable remote backend: in `infra/environments/common/`, `backend.tf` must point at `state_bucket_name` (sample in repo: `dx-kumu-common-terraform-state`).

### 6.3 Network (per env)

| Variable | Meaning |
|----------|---------|
| `project_id` | Env app project (e.g. `veho-kumu-dev`) |
| `env_suffix` | `dev` / `stg` / `prod` |
| `region` | Usually `asia-northeast1` |

### 6.4 App (per env)

Minimum required:

- `project_id`, `env_suffix`
- `container_image` — Artifact Registry URL (image must **exist** before first Cloud Run deploy, or use a placeholder and redeploy after build)
- `create_artifact_registry = false` if the registry lives in **common** (four-project layout)
- With SQL: `enable_cloud_sql = true`, `network_remote_state_bucket`, `network_remote_state_prefix` (e.g. bucket `dx-kumu-common-terraform-state`, prefix `network/dev`)
- **All secret values** must live in **Secret Manager** (never in `terraform.tfvars`, git, or plain `env_vars`) — see [§6.6](#66-secrets--secret-manager-required)
- `resource_tier` — `tier1` … `tier4` (Cloud Run / SQL sizing — see wiki)
- **Dev / Stg:** enable `enable_sql_night_weekend_schedule` and `enable_cron_cloud_scheduler` by default — see [§6.5](#65-dev--stg-sql-schedule--api-cron-on-by-default)
- **Prod:** with Cloud SQL, **backups on** and **deletion protection on** — see [§6.7](#67-production-cloud-sql-backup--deletion-protection-required)

Full sample: [infra/environments/dev/app/terraform.tfvars.example](infra/environments/dev/app/terraform.tfvars.example).

### 6.5 Dev / Stg: SQL schedule & API cron (on by default)

On **dev** and **stg**, when deploying the app stack with Cloud SQL, the project convention is to **enable** both features in `terraform.tfvars` (`.example` files reflect this). **Prod** keeps both off unless operations decides otherwise.

| Terraform variable | Dev / Stg (recommended) | Prod |
|--------------------|-------------------------|------|
| `enable_sql_night_weekend_schedule` | `true` | `false` |
| `enable_cron_cloud_scheduler` | `true` | `false` |

> In the Terraform module, both variables default to `false` (all envs if omitted). Dev/stg **must set `true` explicitly** in tfvars — do not rely on module defaults.

#### Cloud SQL: start/stop schedule (`enable_sql_night_weekend_schedule`)

- **Purpose:** Reduce dev/stg cost — stop Cloud SQL at night and on weekends (JST).
- **Requires:** `enable_cloud_sql = true`.
- **Extra infra:** Cloud Scheduler (start/stop) + Cloud Functions Gen2 ([`infra/functions/sql-activation/`](infra/functions/sql-activation/)) toggling `activation_policy` NEVER/ALWAYS.
- **Default schedule** (overridable):

| Variable | Default | Meaning |
|----------|---------|---------|
| `sql_schedule_timezone` | `Asia/Tokyo` | Scheduler timezone |
| `sql_schedule_start_cron` | `0 8 * * 1-5` | Start SQL 08:00 Mon–Fri |
| `sql_schedule_stop_cron` | `0 22 * * 1-5` | Stop SQL 22:00 Mon–Fri (Fri 22:00 → Mon 08:00 stays off) |

Example in `dev/app/terraform.tfvars` / `stg/app/terraform.tfvars`:

```hcl
enable_cloud_sql                    = true
enable_sql_night_weekend_schedule   = true
# sql_schedule_timezone   = "Asia/Tokyo"   # optional
# sql_schedule_start_cron = "0 8 * * 1-5"
# sql_schedule_stop_cron  = "0 22 * * 1-5"
```

After apply, check job names: `terragrunt output` in `infra/live/dev/app` (or stg) — `sql_schedule_stop_job_name`, `sql_schedule_start_job_name`.

**Operations note:** API requests while SQL is STOPPED will fail DB connections until the start job runs (or you start the instance manually in the Console). Stg uses the same schedule — start SQL manually or adjust cron for off-hours testing.

#### API cron: Cloud Scheduler required (`enable_cron_cloud_scheduler`)

Dev/stg **must not** run cron inside the Node process (`node-cron`). Cron **must** go through **Cloud Scheduler → OIDC → POST** to `/internal/cron/*` on the API Cloud Run service.

| Component | Behavior when `enable_cron_cloud_scheduler = true` |
|-----------|------------------------------------------------------|
| Terraform | Creates SA `kumu-cron-api-{env_suffix}@...`, Scheduler jobs (token cleanup, TBS batch, recommendations) |
| Cloud Run API env | `DISABLE_IN_PROCESS_CRON=1`, `CRON_SCHEDULER_SERVICE_ACCOUNT=<SA email>` |
| Backend | `cron.service` does **not** register in-process jobs; work runs only when Scheduler hits `/internal/cron/...` (OIDC middleware) |

Default job schedules (`cron_timezone`, default `Asia/Tokyo` — align with `TIMEZONE` in `env_vars`):

| Job | Cron variable | Default |
|-----|---------------|---------|
| Refresh token cleanup | `cron_schedule_cleanup_tokens` | `0 2 * * *` (02:00 daily) |
| TBS batch | `cron_schedule_tbs_batch` | `0 2 * * 6` (Sat 02:00; API skips unless `RUN_TBS_CRON=1`) |
| AI recommendations | `cron_schedule_recommendations` | `0 3 * * 0` (Sun 03:00) |

Example tfvars (dev/stg):

```hcl
enable_cron_cloud_scheduler = true
# cron_timezone = "Asia/Tokyo"
```

**Before apply:**

1. Prisma migration `cron_invocations` applied on the DB (migrate job / `prisma migrate deploy`).
2. After apply, confirm API Cloud Run env: `DISABLE_IN_PROCESS_CRON=1` and `CRON_SCHEDULER_SERVICE_ACCOUNT` matches output `cron_scheduler_service_account_email`.

**Prod:** keep `enable_cron_cloud_scheduler = false` until Scheduler is ready; when enabling prod cron, use the same Scheduler mechanism (no in-process cron on Cloud Run).

Code references: [infra/modules/app_cron/](infra/modules/app_cron/), [infra/modules/sql_schedule/](infra/modules/sql_schedule/), [backend/src/cron/cron.service.ts](backend/src/cron/cron.service.ts).

### 6.6 Secrets — Secret Manager (required)

On GCP (dev / stg / prod), **every API key, password, token, and connection string must be stored in [Secret Manager](https://cloud.google.com/secret-manager)** on the **app project** for that environment. Do **not**:

- Put secrets in `terraform.tfvars`, `env_vars`, or `web_env_vars`
- Commit them to git (including `.env` with real values)
- Pass them as plain Cloud Build substitutions in CI

Non-sensitive configuration (URLs, `NODE_ENV`, `LOG_LEVEL`, `TIMEZONE`, feature flags without secrets) belongs in `env_vars` / `web_env_vars` in tfvars or Terraform.

#### How secrets reach Cloud Run

| Mechanism | What it does |
|-----------|----------------|
| **Terraform `cloud_sql` module** | When `enable_cloud_sql = true`, creates secret `kumu-database-url-{env_suffix}`, stores the MySQL URL, grants the Cloud Run runtime SA `secretAccessor`, and mounts `DATABASE_URL` on the API service and migrate job |
| **`api_secret_env_from_sm` / `web_secret_env_from_sm`** | Maps additional Secret Manager secrets to env var names on API / web Cloud Run; Terraform grants `secretAccessor` per `secret_id` ([`infra/modules/secrets/`](infra/modules/secrets/)) |

Wire extra secrets in `terraform.tfvars`:

```hcl
api_secret_env_from_sm = [
  { env_name = "JWT_SECRET", secret_id = "kumu-jwt-secret-dev", version = "latest" },
  # { env_name = "STRIPE_SECRET_KEY", secret_id = "kumu-stripe-secret-dev", version = "latest" },
]
# web_secret_env_from_sm = []   # only if the web service needs secrets from SM
```

Create the secret **in GCP first** (Console or `gcloud`), add a **version** with the payload, then reference `secret_id` in tfvars and re-apply the app stack.

#### Required secrets (API must start)

Aligned with [`backend/src/config/env.ts`](backend/src/config/env.ts) (Zod validation on boot):

| Env var | Secret Manager | Notes |
|---------|----------------|-------|
| `DATABASE_URL` | `kumu-database-url-{env_suffix}` | **Created by Terraform** when `enable_cloud_sql = true`; do not duplicate manually unless you manage SQL outside this module |
| `JWT_SECRET` | e.g. `kumu-jwt-secret-{env_suffix}` | **You must create** and add to `api_secret_env_from_sm` (min 10 characters) |

If either is missing or the runtime SA cannot read the secret, the API container exits on startup or fails DB/auth.

#### Optional secrets (enable when the feature is used)

Create in Secret Manager and map via `api_secret_env_from_sm` when needed:

| Env var | Typical use |
|---------|-------------|
| `GEMINI_API_KEY` | AI features via AI Studio — **omit when** `enable_vertex_ai = true` (use Vertex; do not add `GEMINI_API_KEY` to Secret Manager per tfvars.example) |
| `OPENAI_API_KEY` | TBS fallback when Gemini is unavailable |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Billing (read at runtime; not in Zod schema but required for checkout/webhooks) |
| `STRIPE_BASIC_PRICE_ID`, `STRIPE_PRO_PRICE_ID` | Can be non-secret env vars in `env_vars` if you prefer, or secrets if treated as sensitive |
| `CONNECTOR_TOKEN_ENCRYPTION_KEY` | Encrypt connector tokens at rest (`openssl rand -base64 32`) |
| `CONNECTOR_OAUTH_STATE_SECRET` | OAuth state HMAC (optional; falls back to `JWT_SECRET`) |
| `GOOGLE_OAUTH_CLIENT_SECRET`, `SLACK_OAUTH_CLIENT_SECRET` | Optional server fallbacks; connectors are often configured per team in the DB |
| `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` | Only if `STORAGE_BACKEND=s3` instead of GCS |

Web (Next.js): only put values in `web_secret_env_from_sm` if the **web** Cloud Run service needs them. Do not use `NEXT_PUBLIC_*` for secrets — those are exposed to the browser.

#### Create or update a secret (CLI example)

```bash
export PROJECT_ID='veho-kumu-dev'
export SECRET_ID='kumu-jwt-secret-dev'

# Create secret resource (once)
gcloud secrets create "${SECRET_ID}" \
  --project="${PROJECT_ID}" \
  --replication-policy=automatic

# Add a new version (rotate by adding versions; Cloud Run uses "latest" if configured)
echo -n 'your-long-random-jwt-secret' | gcloud secrets versions add "${SECRET_ID}" \
  --project="${PROJECT_ID}" \
  --data-file=-
```

After rotation, a new version is enough if tfvars use `version = "latest"`; otherwise pin a version number and re-deploy.

#### IAM

- Cloud Run **runtime** SA (project default compute SA): `roles/secretmanager.secretAccessor` on each referenced secret — Terraform applies this for `api_secret_env_from_sm` / `web_secret_env_from_sm` and for the Terraform-managed `DATABASE_URL` secret.
- Humans: use Console or `gcloud secrets` with org-approved roles; never paste production secrets into chat or tickets.

#### Order of operations

1. Apply app stack with `enable_cloud_sql = true` → `DATABASE_URL` secret exists and is wired.
2. Create remaining secrets in Secret Manager (at minimum `JWT_SECRET`).
3. Update `api_secret_env_from_sm` in tfvars → `terragrunt apply` on `live/<env>/app`.
4. Run migrate job, then verify API health.

Ops handoff checklist: [docs/issues/gcp-dev-environment/infra-213-secrets-ops-handoff.md](docs/issues/gcp-dev-environment/infra-213-secrets-ops-handoff.md). Local reference only: [backend/.env.example](backend/.env.example) (not used on Cloud Run).

### 6.7 Production: Cloud SQL backup & deletion protection (required)

**Production must not run Cloud SQL without automated backups or without deletion protection.** This matches the org wiki (prod: daily backup + PITR where tier allows).

| Terraform variable | Prod (required when `enable_cloud_sql = true`) | Dev (typical) |
|--------------------|-----------------------------------------------|---------------|
| `sql_deletion_protection` | `true` — **do not set `false`** | `false` allowed for disposable stacks |
| `sql_backup_enabled` | `true` — module default is `false`; **must set in prod tfvars** | `false` OK |
| `sql_point_in_time_recovery_enabled` | `true` recommended (needs `sql_backup_enabled = true`) | usually `false` |
| `sql_backup_start_time` | e.g. `"17:00"` UTC (≈ 02:00 JST next day) | same if backups enabled |
| `enable_sql_night_weekend_schedule` | `false` — prod SQL stays running | `true` in dev/stg (§6.5) |
| `gcs_force_destroy` | `false` (default) — do not empty prod uploads bucket on destroy | `false` |

**What deletion protection does**

- **GCP API:** `deletion_protection_enabled` on the instance — Console/gcloud cannot delete until disabled deliberately.
- **Terraform:** root `deletion_protection` on `google_sql_database_instance` — `terraform destroy` fails until you set `sql_deletion_protection = false` and apply (two-step process; avoids accidental wipe).

**Backups**

- Daily automated backup window when `sql_backup_enabled = true`.
- With `sql_point_in_time_recovery_enabled = true`, transaction log retention enables point-in-time restore (extra cost; standard for prod per wiki).

Example `prod/app/terraform.tfvars`:

```hcl
env_suffix = "prod"
enable_cloud_sql = true

sql_deletion_protection            = true
sql_backup_enabled                 = true
sql_backup_start_time              = "17:00"
sql_point_in_time_recovery_enabled = true
```

**Enforcement:** `terraform plan` / `apply` for `env_suffix = "prod"` fails the check in [`infra/modules/app_compose/checks.tf`](infra/modules/app_compose/checks.tf) if Cloud SQL is enabled but either flag is wrong.

**To decommission prod SQL (exception only):** disable API protection and Terraform protection in a controlled change (tfvars → apply → destroy), with backups verified and ops approval — never leave prod with `sql_deletion_protection = false` in steady state.

Sample: [infra/environments/prod/app/terraform.tfvars.example](infra/environments/prod/app/terraform.tfvars.example).

---

## 7. Terragrunt commands (recommended)

Entry point: [infra/live/](infra/live/). Terragrunt loads tfvars, generates `backend.tf`, and orders dependencies (`common` after `bootstrap`, `app` after `network` + `common`).

### 7.1 Plan everything (no GCP changes)

```bash
cd infra/live
terragrunt run-all plan
```

| Part | Explanation |
|------|-------------|
| `run-all` | Runs `plan` on child units in dependency order |
| `plan` | Compares code + tfvars to state; **does not** create or change resources |

When infra is stable, expect: `Plan: 0 to add, 0 to change, 0 to destroy` (or `No changes`).

### 7.2 Staged apply (first time — safer)

```bash
cd infra/live/bootstrap
terragrunt init      # Download providers, local backend
terragrunt plan      # Preview GCS bucket
terragrunt apply     # Create bucket — confirm yes (or -auto-approve in CI)

cd ../common
terragrunt init -reconfigure   # Connect GCS backend after bucket exists
terragrunt plan
terragrunt apply

cd ../dev/network
terragrunt init -reconfigure
terragrunt plan
terragrunt apply

cd ../app
terragrunt plan
terragrunt apply
```

Repeat for `stg` and `prod` when projects and tfvars exist.

### 7.3 Single stack

```bash
cd infra/live/dev/network
terragrunt plan
terragrunt apply
```

### 7.4 Terraform command meanings (via Terragrunt)

| Command | Purpose |
|---------|---------|
| `init` | Download providers, configure backend (GCS), create `.terraform` |
| `init -reconfigure` | Required when changing backend bucket/prefix or first switch from local to GCS |
| `plan` | Dry-run: show add/change/destroy |
| `apply` | Apply changes on GCP; update state |
| `destroy` | Remove resources in the stack (careful, especially prod) |
| `output` | Print outputs (service URLs, migrate job name, …) |
| `state list` | List resources in state |
| `import` | Import existing GCP resources into state (project labels, etc.) |

Terragrunt cache: `infra/live/**/.terragrunt-cache/` (gitignored) — delete if init behaves oddly.

Lock: [infra/live/root.hcl](infra/live/root.hcl) sets `-lock-timeout=20m` for locking commands.

---

## 8. Plain Terraform (per stack)

Use when Terragrunt is not installed or when debugging a single `environments/*` directory.

### Bootstrap (local state)

```bash
cd infra/environments/bootstrap
cp terraform.tfvars.example terraform.tfvars   # edit project_id, state_bucket_name
terraform init
terraform plan
terraform apply
```

### Common (GCS remote state)

Ensure `backend.tf` exists and `bucket` matches bootstrap.

```bash
cd infra/environments/common
cp terraform.tfvars.example terraform.tfvars
terraform init -reconfigure
terraform plan -var-file=terraform.tfvars
terraform apply -var-file=terraform.tfvars
```

### Dev network / app

With Terragrunt layout, logic lives in `_shared`; tfvars stay under `environments/dev/...`:

```bash
# Network — needs backend.tf (Terragrunt-generated, or copy pattern from live/dev/network)
cd infra/environments/_shared/network
terraform init -reconfigure
terraform plan -var-file=../../dev/network/terraform.tfvars
terraform apply -var-file=../../dev/network/terraform.tfvars
```

In practice, prefer **Terragrunt** at `infra/live/dev/network` so you do not wire the backend by hand.

---

## 9. After infra apply

### 9.1 Secret Manager

**Policy:** All keys and secrets required on GCP must be in **Secret Manager** on the app project — see [§6.6](#66-secrets--secret-manager-required).

Quick steps:

1. Confirm Terraform created `kumu-database-url-{env_suffix}` after app apply (`enable_cloud_sql = true`).
2. Create `kumu-jwt-secret-{env_suffix}` (and any optional secrets your env needs).
3. List them in `api_secret_env_from_sm`, apply app stack, run migrate job, smoke-test API.

Never commit secret values to git or `terraform.tfvars`.

### 9.2 Build and push Docker images

Images live in **common** (example):

```text
asia-northeast1-docker.pkg.dev/veho-kumu-common/kumu-docker/kumu-api:dev
```

Local / scripts ([scripts/gcp/README.md](scripts/gcp/README.md)):

```bash
export AR_PROJECT_ID='veho-kumu-common'
export DEPLOY_PROJECT_ID='veho-kumu-dev'
export NEXT_PUBLIC_API_URL='https://YOUR-API.run.app/api/v1'
export NEXT_PUBLIC_BASE_URL='https://YOUR-WEB.run.app'
bash scripts/gcp/cloud-build-submit.sh cloudbuild/cloudbuild.dev.yaml
```

Docker registry login (once / when expired):

```bash
gcloud auth configure-docker asia-northeast1-docker.pkg.dev
```

### 9.3 Update `container_image` and re-apply app (if needed)

After build, update the tag in `terraform.tfvars` or deploy via Cloud Build (configs call `gcloud run deploy`).

### 9.4 Run database migrations

```bash
export PROJECT_ID='veho-kumu-dev'
export MIGRATE_JOB_NAME="$(cd infra/live/dev/app && terragrunt output -raw cloud_run_migrate_job_name)"
bash scripts/gcp/run-migrate-job.sh
```

The migrate job is defined in the Cloud Run module; default name `kumu-migrate-{env_suffix}`.

### 9.5 Custom domains & env URLs

After apply, get URLs:

```bash
cd infra/live/dev/app
terragrunt output
```

Set `CORS_ORIGINS`, `API_URL`, `NEXT_PUBLIC_*` in tfvars or Console; optional `api_custom_domain` / `web_custom_domain` in Terraform (see tfvars.example comments).

---

## 10. CI/CD and GitHub Actions

| Workflow / doc | Purpose |
|----------------|---------|
| [.github/workflows/terraform-plan.yml](.github/workflows/terraform-plan.yml) | `terraform plan` on PRs that touch `infra/**` |
| [cloudbuild/GITHUB_ACTIONS_WIF.md](cloudbuild/GITHUB_ACTIONS_WIF.md) | WIF + SA for deploy without JSON keys |
| [cloudbuild/README.md](cloudbuild/README.md) | Cloud Build triggers, IAM writer/reader |
| `.github/workflows/cd-gcp.yml` | Build + deploy via GitHub Environments |

CI uses **Workload Identity Federation**, not `gcloud auth login` on runners — secrets: `GCP_WORKLOAD_IDENTITY_PROVIDER`, `GCP_SERVICE_ACCOUNT`.

---

## 11. Common troubleshooting

| Symptom | What to do |
|---------|------------|
| `Error 403` / `Requested entity was not found` on plan/apply | Re-run ADC; verify `project_id` and IAM on the correct project |
| `storage.googleapis.com` / API not enabled | User needs permission to enable APIs; or enable in Console and re-apply |
| App plan fails: network remote state | Apply `network` first; set `network_remote_state_bucket` + `network_remote_state_prefix` |
| Cloud Run deploy: image not found | Build and push to Artifact Registry first |
| Cross-project image pull denied | Add project to `reader_project_ids` and Cloud Run service agent to `additional_artifact_registry_reader_members` (common stack) |
| `terraform init` backend error | Confirm bootstrap bucket exists; `init -reconfigure` |
| State lock | Wait for other CI job; or `terraform force-unlock` only if sure nothing is applying |
| Org policy blocks `allUsers` | Set `allow_unauthenticated = false`; use IAP/LB or internal access |
| Cron not running on dev/stg | Check `enable_cron_cloud_scheduler = true`, migration `cron_invocations`, env `DISABLE_IN_PROCESS_CRON=1`, Scheduler jobs in Console |
| API DB errors outside business hours (dev/stg) | SQL may be STOPPED — wait for start job or temporarily disable `enable_sql_night_weekend_schedule` while debugging |
| API exits on startup / invalid env | Ensure `JWT_SECRET` and `DATABASE_URL` exist in Secret Manager and are listed in `api_secret_env_from_sm` (JWT) or wired by Terraform (DB); check SA has `secretAccessor` |
| `Permission denied` on secret | Re-apply app stack after updating `api_secret_env_from_sm`; confirm `secret_id` matches the Secret Manager resource ID |
| Terraform check fails on prod app plan | Set `sql_deletion_protection = true` and `sql_backup_enabled = true` when `env_suffix = "prod"` and `enable_cloud_sql = true` (§6.7) |

State migration (`app_compose` refactor): [infra/.migration-snapshots/README.md](infra/.migration-snapshots/README.md).

---

## New environment checklist (dev)

- [ ] Create GCP projects: common, dev (billing, IAM groups per wiki)
- [ ] `gcloud auth login` + `gcloud auth application-default login`
- [ ] `terraform.tfvars` for bootstrap, common, dev/network, dev/app
- [ ] In **dev/app** tfvars: `enable_sql_night_weekend_schedule = true`, `enable_cron_cloud_scheduler = true` (same for stg; prod: `false`)
- [ ] `terragrunt apply` bootstrap → common → dev/network → dev/app
- [ ] Configure Artifact Registry readers/writers (common) with dev project number
- [ ] After app apply: verify Terraform secret `kumu-database-url-dev`; create `kumu-jwt-secret-dev` (and other keys per §6.6) in Secret Manager
- [ ] Set `api_secret_env_from_sm` in dev/app tfvars (at least `JWT_SECRET`); re-apply app stack — **no secrets in tfvars plain env**
- [ ] Cloud Build / GitHub WIF (if using CI)
- [ ] Build `kumu-api` / `kumu-web` images, deploy or re-apply app
- [ ] Run migrate job, verify Cloud Run health
- [ ] `terragrunt run-all plan` → zero diff (confirm sync)

---

## New environment checklist (prod)

- [ ] All dev checklist items adapted for prod project IDs and `network/prod` state prefix
- [ ] `prod/app/terraform.tfvars`: `sql_deletion_protection = true`, `sql_backup_enabled = true` (and PITR per policy) — §6.7
- [ ] `enable_sql_night_weekend_schedule = false`; no night/weekend SQL stop on prod
- [ ] `gcs_force_destroy = false`; secrets only in Secret Manager (§6.6)
- [ ] Prod apply via PR + reviewer; verify backup window and deletion protection in Cloud SQL Console after apply

---

## Related documentation

| Topic | Path |
|-------|------|
| GCP wiki (tier, IAM, naming) | [infra/wiki.md](infra/wiki.md) |
| Infra layout | [infra/README.md](infra/README.md) |
| Terragrunt live | [infra/live/README.md](infra/live/README.md) |
| Environments / tfvars | [infra/environments/README.md](infra/environments/README.md) |
| Local deploy scripts | [scripts/gcp/README.md](scripts/gcp/README.md) |
| Cloud Build | [cloudbuild/README.md](cloudbuild/README.md) |
