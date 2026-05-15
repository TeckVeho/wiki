---
sidebar_position: 11
title: CI/CD deployment patterns (EC2 / Laravel / Cloud Run)
---

> **Ngôn ngữ / Language / 言語**: [🇻🇳 Tiếng Việt](#vietnamese) | [🇬🇧 English](#english) | [🇯🇵 日本語](#japanese)

Tài liệu được sắp xếp theo thứ tự **Tiếng Việt → English → 日本語**.  
This document is organized as **Vietnamese → English → Japanese**.  
このドキュメントは **ベトナム語 → 英語 → 日本語** の順で構成しています。

---

## Vietnamese

*Tiếng Việt*

### CI/CD — các mẫu triển khai (EC2 / Laravel / Cloud Run)

Tóm tắt các luồng triển khai điển hình khi dùng GitHub Actions làm điểm xuất phát.

**Phạm vi áp dụng (quan trọng — không mâu thuẫn với GCP):**

- Phần **EC2** trong tài liệu này là **AWS EC2** (ví dụ deploy qua SSH, pm2, systemd như các hệ thống hiện có).
- Phần **Cloud Run** là **GCP**. Kiến trúc mục tiêu GCP (**Cloud Run**, không dùng Compute Engine cho workload mới), CI/CD Service Account, **Workload Identity Federation**, và **Secret Manager** tuân theo [GCP deployment rules](./gcp-deployment-rules.md).

Chi tiết dự án GCP, Terraform và Service Account xem [GCP deployment rules](./gcp-deployment-rules.md).

---

### Runner của GitHub Actions

**Nguyên tắc: dùng GitHub-hosted runner.**

- Bảo trì và scale do GitHub đảm nhận.
- **Self-hosted runner** chỉ khi bắt buộc: phải vào mạng nội bộ trực tiếp, license/phần cứng đặc thù cho build, hoặc trường hợp runner được host không đủ.

---

### Triển khai EC2 (Node.js, v.v.)

Luồng điển hình:

1. **GitHub Actions SSH vào EC2** — khóa bí mật, known_hosts, host đích quản lý bằng GitHub Secrets; thống nhất một cách (`appleboy/ssh-action`, lệnh `ssh`, …).
2. **Cập nhật mã trên EC2** — `git pull` (branch/tag theo quy định) hoặc artifact build sẵn trên Actions rồi đưa lên EC2 (SCP / rsync / S3, …).
3. **`npm ci` trên EC2** — khóa theo `package-lock.json`; production ưu tiên `npm ci` hơn `npm install`.
4. **`npm run build` trên EC2** — chỉ khi thiết kế build trên server; nếu chỉ triển khai artifact đã build thì bỏ qua.
5. **Khởi động lại tiến trình** — **`pm2 restart`** (nếu dùng PM2) hoặc **`systemctl restart <tên-dịch-vụ>`** (systemd), theo cấu hình server.

Checklist sau triển khai: [Post-Deploy Checklist](./post-deploy-checklist.md).

---

### Laravel trên EC2

Ví dụ luồng PHP trên EC2:

1. **SSH từ GitHub Actions** (như trên).
2. **`composer install` trên EC2** — production thường kèm `--no-dev --optimize-autoloader` (theo môi trường).
3. **`php artisan migrate --force`** — môi trường không tương tác cần `--force`; thống nhất thời điểm và quyền migrate trong team.
4. **`php artisan config:cache`** — sau đổi `.env` hoặc sau deploy.
5. **`php artisan queue:restart`** — để worker không giữ code cũ.

※ `storage:link`, cron, supervisor: gắn vào setup / vận hành ban đầu.

---

### Cloud Run

Luồng container — tách build và runtime.

1. **GitHub Actions kích hoạt Cloud Build** (trigger/API/`gcloud`/`google-github-actions` theo chuẩn repo).
2. **Cloud Build chạy `docker build`** — Dockerfile trong repo.
3. **Multi-stage Dockerfile**: stage build chạy **`npm ci` / `npm run build`**; chỉ copy artifact cần thiết sang stage runtime.
4. **Cloud Build push image lên Artifact Registry**.
5. **Deploy Cloud Run** — do Cloud Build hoặc GitHub Actions; thống nhất một nơi cho `gcloud run deploy` (hoặc bước deploy CI tương đương).

**Không chạy `npm install` / `npm run build` sau khi container Cloud Run đã khởi động.** Cài đặt và build hoàn tất tại thời điểm build image; lệnh khởi động chỉ chạy ứng dụng (tránh cold start / scale-out chậm và không ổn định).

**Khớp với quy định GCP (không mâu thuẫn):** xác thực CI/CD với GCP dùng **Service Account chuyên dụng** và **Workload Identity Federation**, không commit key SA; secret ứng dụng/GCP dùng **Secret Manager** — xem mục 7 và 8 trong [GCP deployment rules](./gcp-deployment-rules.md).

---

### So sánh nhanh

| Hạng mục | EC2 (Node ví dụ) | Laravel trên EC2 | Cloud Run |
| -------- | ---------------- | ---------------- | --------- |
| Kết nối / kích hoạt | SSH (GitHub Actions) | SSH (GitHub Actions) | Cloud Build (từ Actions) |
| Dependency / build | `npm ci` (+ build nếu cần) trên EC2 | Composer + Artisan trên EC2 | Trong **image build** (multi-stage, npm, v.v.) |
| DB / cấu hình | Theo server / app | `migrate` / `config:cache` / `queue:restart` | Theo container / dịch vụ quản lý |
| Khởi động lại | pm2 / systemd, v.v. | Tương tự + queue restart | Rolling revision khi deploy |

---

### Tài liệu liên quan

- [GCP deployment rules](./gcp-deployment-rules.md) — GCP, Terraform, CI/CD Service Account
- [Post-Deploy Checklist](./post-deploy-checklist.md)
- [Resource naming rules](./resource-naming-rules.md)

---

## English

*English*

### CI/CD deployment patterns (EC2 / Laravel / Cloud Run)

This page summarizes typical deployment flows that start from GitHub Actions.

**Scope (important — consistent with GCP rules):**

- **EC2** sections refer to **AWS EC2** (e.g. SSH, pm2, systemd patterns used by existing systems).
- **Cloud Run** is **GCP**. GCP’s target stack (**Cloud Run**, not Compute Engine for new workloads), CI/CD service accounts, **Workload Identity Federation**, and **Secret Manager** follow [GCP deployment rules](./gcp-deployment-rules.md).

For GCP project layout, Terraform, and service accounts, see [GCP deployment rules](./gcp-deployment-rules.md).

---

### GitHub Actions runners

**Default: use GitHub-hosted runners.**

- Maintenance and scaling are handled by GitHub.
- Use **self-hosted runners** only when required: private network access, special licenses/hardware for builds, or other cases hosted runners cannot cover.

---

### EC2 deployment (Node.js, etc.)

Typical sequence:

1. **SSH from GitHub Actions to EC2** — store keys, known_hosts, and targets in GitHub Secrets; use one agreed approach (`appleboy/ssh-action`, plain `ssh`, etc.).
2. **Update code on EC2** — `git pull` (branch/tag per policy) or ship a pre-built artifact from Actions (SCP / rsync / S3, etc.).
3. **`npm ci` on EC2** — locked by `package-lock.json`; prefer `npm ci` over `npm install` in production.
4. **`npm run build` on EC2** — only if you intentionally build on the server; skip if you deploy pre-built assets only.
5. **Restart processes** — **`pm2 restart`** (PM2) or **`systemctl restart <service>`** (systemd), per server setup.

Post-deploy checks: [Post-Deploy Checklist](./post-deploy-checklist.md).

---

### Laravel on EC2

Example PHP flow on EC2:

1. **SSH from GitHub Actions** (as above).
2. **`composer install` on EC2** — production typically adds `--no-dev --optimize-autoloader` (as appropriate).
3. **`php artisan migrate --force`** — non-interactive environments need `--force`; agree migration timing and ownership in the team.
4. **`php artisan config:cache`** — after `.env` changes or deploy.
5. **`php artisan queue:restart`** — so workers do not keep running old code.

※ `storage:link`, cron, supervisor: cover in initial setup / operations design.

---

### Cloud Run

Container flow — separate build and runtime.

1. **GitHub Actions triggers Cloud Build** (per repo policy: triggers, API, `gcloud`, `google-github-actions`, etc.).
2. **Cloud Build runs `docker build`** — Dockerfile lives in the repo.
3. **Multi-stage Dockerfile**: run **`npm ci` / `npm run build`** in a build stage; copy only required artifacts into the runtime stage.
4. **Cloud Build pushes the image to Artifact Registry**.
5. **Deploy to Cloud Run** — either Cloud Build or GitHub Actions; pick one place for `gcloud run deploy` (or equivalent CI step).

**Do not run `npm install` or `npm run build` after the Cloud Run container has started.** Install and build finish at image build time; the start command should only run the application (avoids slow/unstable cold starts and scale-out).

**Align with GCP policy:** authenticate CI/CD to GCP using a **dedicated service account** and **Workload Identity Federation** — no SA keys in the repo; application/GCP secrets live in **Secret Manager** — see sections 7 and 8 in [GCP deployment rules](./gcp-deployment-rules.md).

---

### Quick comparison

| Item | EC2 (Node example) | Laravel on EC2 | Cloud Run |
| ---- | ------------------ | ---------------- | --------- |
| Connect / trigger | SSH (GitHub Actions) | SSH (GitHub Actions) | Cloud Build (from Actions) |
| Dependencies / build | `npm ci` (+ optional build) on EC2 | Composer + Artisan on EC2 | Inside **image build** (multi-stage, npm, etc.) |
| DB / config | Depends on server / app | `migrate` / `config:cache` / `queue:restart` | Depends on container / managed services |
| Restart | pm2 / systemd, etc. | Same + queue restart | Rolling update via new revision |

---

### Related documents

- [GCP deployment rules](./gcp-deployment-rules.md) — GCP, Terraform, CI/CD service accounts
- [Post-Deploy Checklist](./post-deploy-checklist.md)
- [Resource naming rules](./resource-naming-rules.md)

---

## Japanese

*日本語*

### CI/CD デプロイパターン（EC2 / Laravel / Cloud Run）

GitHub Actions を起点とした代表的なデプロイ方式を整理する。

**適用範囲（GCP ルールとの関係）:**

- 本書の **EC2** は **AWS 上の EC2** を想定する（SSH・pm2・systemd など、既存システムで使われるパターン）。
- **Cloud Run** は **GCP** 向け。GCP の標準構成（**Cloud Run** を前提とし、**Compute Engine に新規ワークロードを載せない**）、CI/CD 用 Service Account、**Workload Identity Federation**、**Secret Manager** は [GCP デプロイメントルール](./gcp-deployment-rules.md) に従う。

GCP のプロジェクト構成・Terraform・Service Account の詳細は [GCP デプロイメントルール](./gcp-deployment-rules.md) を参照。

---

### GitHub Actions の Runner

**原則として GitHub-hosted runner を使う。**

- メンテナンスやスケールは GitHub 側に任せられる。
- **セルフホスト runner** が必要になるのは、社内ネットワークへの直接到達が必要なとき、特殊的なライセンス・ハードウェアが必要なビルドがあるとき、ホスト型 runner では足りないときなどに限定する。

---

### EC2 デプロイ（Node.js など）

典型的な流れは次のとおり。

1. **GitHub Actions から EC2 に SSH 接続する** — 秘密鍵・ホスト鍵・接続先は GitHub Secrets で管理する。`appleboy/ssh-action` や `ssh` コマンドなど、チームで統一した方法を使う。
2. **EC2 上でソースを更新する** — リポジトリを直接運用する場合は `git pull`（デプロイ用ブランチ・タグは運用ルールに合わせる）。またはビルド済みアーティファクトを Actions で生成し、SCP / rsync / S3 経由などで EC2 に展開する。
3. **EC2 上で `npm ci`** — `package-lock.json` にロックされた依存関係でインストールする（本番では `npm install` より `npm ci` を優先）。
4. **必要なら EC2 上で `npm run build`** — サーバー上でビルドする設計のときのみ。ビルド成果物のみを配る構成なら省略する。
5. **プロセス再起動** — Node アプリは **`pm2 restart`**（PM2 運用時）、または **`systemctl restart <サービス名>`**（systemd 運用時）など、サーバー側の定義に合わせる。

デプロイ後の確認項目は [デプロイ後チェックリスト](./post-deploy-checklist.md) を参照。

---

### Laravel on EC2

PHP アプリケーションを EC2 で動かす場合のデプロイフロー例。

1. **GitHub Actions から EC2 に SSH 接続する**（前述と同様）。
2. **EC2 上で `composer install`** — 本番では `--no-dev --optimize-autoloader` など、環境に応じたフラグを付ける。
3. **`php artisan migrate --force`** — 非対話環境のため `--force` が必要。マイグレーション方針（タイミング・権限）はチームで合意する。
4. **`php artisan config:cache`** — 設定キャッシュを更新する（`.env` 変更後やデプロイ後に実行）。
5. **`php artisan queue:restart`** — キューワーカーが古いコードを握ったまま動き続けないよう指示する。

※ `storage:link` やジョブスケジューラ（cron / supervisor）は初回セットアップや運用設計に含める。

---

### Cloud Run

コンテナベースのフロー。ビルドとランタイムを分離する。

1. **GitHub Actions から Cloud Build を起動する** — リポジトリ連携・トリガーはプロジェクト方針に合わせる（手動トリガー API、gcloud、`google-github-actions` など）。
2. **Cloud Build が `docker build` を実行する** — Dockerfile はリポジトリに置くのが一般的。
3. **Dockerfile の multi-stage build** で、ビルド用ステージで **`npm ci` / `npm run build`** を実行する。ランタイムステージには必要な成果物だけをコピーする。
4. **Cloud Build が Artifact Registry にイメージを push する**。
5. **Cloud Build または GitHub Actions から Cloud Run にデプロイする** — どちらで `gcloud run deploy`（または CI 用の Deploy ステップ）を実行するかはリポジトリで統一する。

**Cloud Run のコンテナ起動後に `npm install` や `npm run build` は行わない。** 依存インストールとビルドはイメージビルド時に完了させ、起動コマンドはアプリケーションの実行のみにする。

**GCP ルールとの整合:** Actions から GCP に接続するときは **専用 Service Account** と **Workload Identity Federation** を用い、SA キーをリポジトリに置かない。アプリ／GCP のシークレットは **Secret Manager** に置く — 詳細は [GCP デプロイメントルール](./gcp-deployment-rules.md) の §7・§8。

---

### 方式の比較（概要）

| 項目 | EC2（Node 例） | Laravel on EC2 | Cloud Run |
|------|----------------|----------------|-----------|
| 接続・トリガー | SSH（GitHub Actions） | SSH（GitHub Actions） | Cloud Build（Actions から起動） |
| 依存・ビルド | EC2 上で `npm ci`（＋必要なら build） | EC2 上で Composer・Artisan | **イメージ build 内**（multi-stage で npm 等） |
| DB・設定 | サーバー／アプリに依存 | `migrate` / `config:cache` / `queue:restart` | コンテナ・マネージドサービスに依存 |
| 再起動 | pm2 / systemd 等 | 同上 + キュー再起動 | 新リビジョンのデプロイでローリング更新 |

---

### 関連ドキュメント

- [GCP デプロイメントルール](./gcp-deployment-rules.md) — GCP・Terraform・CI/CD Service Account など
- [デプロイ後チェックリスト](./post-deploy-checklist.md) — リリース後の確認項目
- [リソース命名ルール](./resource-naming-rules.md) — EC2・GitHub・GCP などの命名
