# GCP インフラ

> **Language**: [🇻🇳 Tiếng Việt](gcp-infra.vi.md) | [🇯🇵 日本語](gcp-infra.ja.md)

アプリケーションを Google Cloud に載せるときの知識と構成をまとめる。末尾のデプロイ順は [TeckVeho/drivee-link-2](https://github.com/TeckVeho/drivee-link-2)（ブランチ `develop`）を例にする。英語版は後で追加する。

## 目次

1. [概要](#概要)
2. [構成](#構成)
3. [Cloud Run の Tier](#cloud-run-の-tier)
4. [サービスアカウント](#サービスアカウント)
5. [データの削除とバックアップ](#データの削除とバックアップ)
6. [例: DriveeLink](#例-driveelink)

## 概要

アプリケーションは **Cloud Run** で動かす。Compute Engine の仮想マシンは使わない。ビルド、イメージの保管、実行は分ける。

| コンポーネント | 役割 |
|----------------|------|
| Cloud Build | ソースからイメージをビルドする |
| Artifact Registry | Docker イメージを保管する |
| Cloud Run | API、Web、ジョブ（migrate、キュー、バックグラウンド処理）を動かす |
| VPC + Direct VPC egress | Cloud Run からプライベート資源への経路。Serverless VPC Access connector は使わない |
| Cloud SQL | データベース。プライベート IP のみ、SSL を有効にする |
| Cloud Storage | アップロードファイル |
| Secret Manager | パスワード、API キー、接続文字列 |
| Cloud Scheduler | OIDC 付き HTTP をスケジュール実行する。Cron は Cloud Run のプロセス内では動かさない |

`dev`、`stg`、`prod` はリソース名の接尾辞と Terraform state の prefix で分ける。一つの GCP プロジェクトにまとめてよい。Terraform はプロジェクトを作らない。プロジェクトと課金は先に Console で作る。

IaC は三つの stack に分け、依存の順に apply する。

| Stack | 内容 | いつ apply するか |
|-------|------|-------------------|
| `bootstrap` | state バケットと Artifact Registry | プロジェクトにつき一度 |
| `network/{env}` | VPC と Private Service Access の範囲。同一プロジェクト内の CIDR は重ねない | その VPC を使う app stack の前 |
| `app/{env}` | Cloud Run、SQL の接続、バケット、secret、scheduler | network の後（その環境が実際に使う VPC の後） |

Terraform がリソースを作り、維持する。Cloud Build は動いているイメージの更新と migrate ジョブの起動だけを行う。秘密の値は Terraform にも git にも Cloud Run の通常の環境変数にも置かない。Terraform は secret の読み取り権限を付ける。値は運用が Secret Manager に書く。

Cloud Run から Cloud SQL へはプライベート IP 上のソケットでつなぐ。サービスとデータベースは同じ VPC にいる必要がある。プライベート IP は別の VPC を越えて届かない。Cloud Run は、接続先インスタンスがある VPC へ egress する。

本番は毎日バックアップし、30 日分を残し、インスタンスの削除を防ぐ。

## 構成

```mermaid
flowchart LR
  src[Source] --> cb[Cloud Build]
  cb --> ar[Artifact Registry]
  ar --> run[Cloud Run]
  run -->|Direct VPC egress| vpc[VPC]
  vpc --> sql[Cloud SQL private IP]
  run --> gcs[Cloud Storage]
  run --> sm[Secret Manager]
  sch[Cloud Scheduler] -->|OIDC| run
```

```mermaid
flowchart TD
  b[bootstrap<br/>state + Artifact Registry] --> n[network / env<br/>VPC + PSA]
  n --> a[app / env<br/>Cloud Run, SQL, GCS, secret, cron]
```

`bootstrap` の state は bootstrap ディレクトリのローカルに置く。`network` と `app` の state は GCS バケットにあり、環境ごとに prefix を分ける（`network/{env}`、`app/{env}`）。一つの環境を消してもプロジェクトの API は無効にしない。ほかの環境が同じ API を使っている。

| 層 | Terraform が持つもの | Cloud Build / 運用が持つもの |
|----|----------------------|------------------------------|
| インフラ | Service、job、VPC、SQL インスタンス、IAM、secret のマウント | — |
| イメージ | 最初に宣言したイメージ名 | ビルドごとの新しいタグ |
| 秘密 | 空の secret、または SQL モジュールが作る secret と `secretAccessor` | API キーとアプリのパスワード |
| スケジュール | Scheduler ジョブと OIDC 用サービスアカウント | — |

稼働後の経路:

```text
ユーザー → Cloud Run（API / Web）
Cloud Run → Secret Manager（設定を読む）
Cloud Run → Cloud SQL（プライベート IP、同じ VPC）
Cloud Scheduler → Cloud Run（OIDC、内部エンドポイント）
```

この図が成り立つ条件:

- 同一プロジェクト内の VPC で、サブネット CIDR と PSA 範囲が重ならない。
- Cloud SQL のパブリック IP は無効。`ssl_mode` は `ENCRYPTED_ONLY`。
- SQL とプライベート範囲だけに届ければよいとき、Cloud Run の egress は `PRIVATE_RANGES_ONLY`。
- 複数環境が一つのインスタンスを共有するときは、環境ごとに SQL ユーザーを分ける。
- 本番のバックアップは毎日取り、30 世代（30 日）残す。ポイントインタイムリカバリは任意で、バイナリログが必要。

## Cloud Run の Tier

すべてのプロジェクト、すべての環境（`dev`、`stg`、`prod`）は `resource_tier = "tier3"` にする。tfvars の `resource_tier` が `tier_specs` から Cloud Run のサイズを選ぶ。min instance は tier の値をそのまま使う。tier3 は API も Web も `min_instances = 0` である。

`tier3` 以外は例外である。tier を上げる前に承認が必要である。

`cloud_run_api_min_instances` と `cloud_run_web_min_instances` は tfvars に書かない。空なら Terraform は tier の min instance、つまり 0 を使う。

コンテナがメモリ不足で起動しないときは、override 変数で memory を上げる。その対処に min instance は上げず、tier も変えない。

```hcl
resource_tier        = "tier3"
cloud_run_api_memory = "512Mi"
cloud_run_web_memory = "512Mi"
```

本番で `cloud_run_api_min_instances = 1` にするには、先に PM の承認がいる。承認は API から。Web は別の承認があるまで tier の min instance のままにする。

## サービスアカウント

Cloud Run はデフォルトの `PROJECT_NUMBER-compute@developer.gserviceaccount.com` では動かさない。Cloud Build はレガシーの `PROJECT_NUMBER@cloudbuild.gserviceaccount.com` では動かさない。役割ごとに ID を分ける。ランタイムは環境ごとに分ける。dev が prod の ID を持たない。

| ID | 範囲 | 許可すること | 付与しないこと |
|----|------|--------------|----------------|
| ランタイム `{project}-run-{env}` | その環境の API、Web、ジョブが共有する一つの SA | ログとメトリクスの書き込み。その環境の secret の読み取り。`cloudsql.client`。その環境のアップロードバケットへの `objectAdmin`。署名付き URL のため自分自身への `serviceAccountTokenCreator` | ビルド、デプロイ、プロジェクトの editor |
| Scheduler `{service}-cron-api-{env}` | 環境ごとの一つの SA | その環境の API への `run.invoker`。OIDC で呼ぶ | secret の読み取り、SQL への接続 |
| WIF（GitHub Actions） | リポジトリにつき一つの SA。プールは対象リポジトリとデプロイブランチの OIDC だけを受ける | `cloudbuild.builds.editor`、`serviceusage.serviceUsageConsumer`、`artifactregistry.writer`。バケット `gs://PROJECT_ID_cloudbuild` の読み書き。ビルド SA への `serviceAccountUser` のみ | `run.admin`、`storage.admin`、プロジェクトスコープの `serviceAccountUser` |
| ビルド `{project}-cd-build` | Cloud Build の YAML が `serviceAccount` でこの SA を指定する | `logging.logWriter`、`artifactregistry.writer`、`run.developer`。WIF と同じ Cloud Build バケット権限。各環境のランタイム SA への `serviceAccountUser` のみ。Cloud Build エージェントはこの SA を actAs できる | `run.admin`、プロジェクトスコープの `storage.admin` と `serviceAccountUser` |

`serviceAccountUser` は対象の SA に付ける。プロジェクトには付けない。CD がビルド SA で通ったあと、未使用ならデフォルトの compute SA とレガシー Cloud Build SA の IAM を外す。

## データの削除とバックアップ

`bootstrap` stack がビルド成果物を二つ片付ける。アップロード用バケットのアプリデータには削除ライフサイクルを付けない。

| 対象 | ルール |
|------|--------|
| Artifact Registry の Docker イメージ | プレフィックス `prod`、`stg`、`dev` のタグを残す。パッケージごとに最新 10 世代を残す。タグなしイメージは 7 日で削除する。KEEP に合わないものは削除する |
| Cloud Build のソース | `gs://{project}_cloudbuild` の `source/` を 7 日で削除する |

データベースのバックアップは本番インスタンスにだけ置く。毎日取り、**30 世代（30 日）**残す。インスタンスを共有している場合、staging のデータベースも同じバックアップに入る。SQL hub 上の dev データベースは、このプロジェクトのバックアップ対象外である。ポイントインタイムリカバリは任意で、バイナリログが必要。

## 例: DriveeLink

リポジトリ: [TeckVeho/drivee-link-2](https://github.com/TeckVeho/drivee-link-2)、ブランチ `develop`。

| 内容 | パス |
|------|------|
| 構成 | [`google_cloud/README.md`](https://github.com/TeckVeho/drivee-link-2/blob/develop/google_cloud/README.md) |
| Terraform | [`google_cloud/terraform/README.md`](https://github.com/TeckVeho/drivee-link-2/blob/develop/google_cloud/terraform/README.md) |
| SQL トポロジ | [`google_cloud/terraform/SQL_TOPOLOGY.md`](https://github.com/TeckVeho/drivee-link-2/blob/develop/google_cloud/terraform/SQL_TOPOLOGY.md) |

DriveeLink は上の構成を、一つのプロジェクト `dx-driveelink`、リージョン `asia-northeast1` で使っている。すべての環境は `resource_tier = "tier3"`。Cloud Run の min instance は tier どおり 0。prod の `cloud_run_api_min_instances = 1` は PM の承認のあとだけ。`tier3` から tier を上げるには、先に承認がいる。

| ID | メール |
|----|--------|
| ランタイム dev / stg / prod | `dx-driveelink-run-dev@`、`dx-driveelink-run-stg@`、`dx-driveelink-run-prod@` |
| Scheduler | `driveelink-cron-api-{env}@dx-driveelink.iam.gserviceaccount.com` |
| WIF（GitHub Actions） | `github-actions-dx-driveelink@dx-driveelink.iam.gserviceaccount.com` |
| Cloud Build 実行 | `dx-driveelink-cd-build@dx-driveelink.iam.gserviceaccount.com` |

プール `github-pool` / プロバイダ `github-provider` は、`TeckVeho/drivee-link-2` のブランチ `develop`、`staging`、`production` の OIDC だけを信頼する。WIF の SA は `attribute.repository` で `workloadIdentityUser` を受け、`serviceAccountUser` は `dx-driveelink-cd-build` にだけ付く。ビルド SA の `serviceAccountUser` は上の三つのランタイム SA にだけ付く。`google_cloud/cloudbuild/cloudbuild.*.yaml` はすべてビルド SA を `serviceAccount` に書く。これらの binding を作り、広い権限を外すスクリプトは [`google_cloud/scripts/setup-github-actions-wif.sh`](https://github.com/TeckVeho/drivee-link-2/blob/develop/google_cloud/scripts/setup-github-actions-wif.sh)。

| 項目 | 値 |
|------|-----|
| state バケット | `dx-driveelink-terraform-state` |
| Artifact Registry | `asia-northeast1-docker.pkg.dev/dx-driveelink/driveelink-docker` |
| Cloud Run | `driveelink-api-{env}`、`driveelink-web-{env}` |
| ジョブ | `driveelink-migrate-{env}`、`driveelink-queue-{env}`、`driveelink-pdf-{env}` |

**ネットワークと SQL。** dev は SQL hub `gcp-dev-sql-hub` へ、hub の Shared VPC 経由で接続する。stg と prod は hub とは別の一つのネットワークを使い、一つの Cloud SQL インスタンスを共有する。インスタンス上のデータベースとユーザーは環境ごとに分ける。

| 環境 | ネットワーク | インスタンス | データベース | ユーザー |
|------|--------------|--------------|--------------|----------|
| dev | hub の Shared VPC | `gcp-dev-sql-hub:asia-northeast1:dev-sql-hub` | `dx_driveelink_dev` | `driveelink_dev` |
| stg | stg/prod 共通ネットワーク（`driveelink-vpc-prod`） | `dx-driveelink-prod` | `dx_driveelink_stg` | `driveelink_stg` |
| prod | stg/prod 共通ネットワーク（`driveelink-vpc-prod`） | `dx-driveelink-prod` | `dx_driveelink_prod` | `driveelink` |

共有インスタンスの所有者は prod である。毎日のバックアップは `17:00` UTC に始まり、30 世代残す（`retained_backups = 30`）。ポイントインタイムリカバリは現在オフ。stg のデータベースは同じインスタンス上なので、同じバックアップに含まれる。hub 上の dev はこのバックアップを使わない。

この例のビルドデータ削除:

| 対象 | 値 |
|------|-----|
| Artifact Registry `driveelink-docker` | プレフィックス `prod`、`stg`、`dev` を残す。パッケージごとに最新 10 世代。タグなしイメージは 7 日で削除 |
| `gs://dx-driveelink_cloudbuild/source/` | 7 日で削除 |

### デプロイ順

共通のネットワークとインスタンスは prod の stack が作る。そのため prod を stg より先に apply する。dev は hub に接続し、stg/prod のネットワークは使わない。

| 手順 | Stack | 条件 |
|------|-------|------|
| 1 | `google_cloud/terraform/live/bootstrap` | プロジェクト `dx-driveelink` に課金がある |
| 2 | `live/prod/network` のあと `live/prod/app` | state バケットがある。prod が stg/prod 共通ネットワークと共有 SQL インスタンスを作る |
| 3 | `live/stg/app` | 同じ state `network/prod` と同じインスタンス。stg は自分のデータベースとユーザーだけを作る |
| 4 | `live/dev/app` | hub がこのプロジェクトを Shared VPC に参加させている。dev は stg/prod のネットワークを apply しない |
| 5 | Cloud Build | レジストリと Cloud Run サービスがある |

```bash
cd google_cloud/terraform/live/bootstrap
terragrunt init && terragrunt apply

cd ../prod/network
terragrunt init -reconfigure && terragrunt apply

cd ../app
terragrunt apply
```

その後に `live/stg/app` と `live/dev/app` を apply する。`terraform.tfvars` は `google_cloud/terraform/environments/` の `*.example` からコピーし、コミットしない。

app が読む state の prefix:

- stg と prod: `network/prod`（一つの共通ネットワーク）
- dev: SQL hub の VPC。stg/prod のネットワークは読まない

イメージ:

```text
asia-northeast1-docker.pkg.dev/dx-driveelink/driveelink-docker/driveelink-api:{dev|stg|prod}
asia-northeast1-docker.pkg.dev/dx-driveelink/driveelink-docker/driveelink-web:{dev|stg|prod}
```

```bash
gcloud builds submit --project=dx-driveelink \
  --config=google_cloud/cloudbuild/cloudbuild.dev.yaml
```

stg と prod は `cloudbuild.stg.yaml` と `cloudbuild.prod.yaml` を使う。ビルドはイメージを更新したあと `driveelink-migrate-{env}` を実行する。`_SKIP_MIGRATE=true` のときは実行しない。

Secret:

| Secret | 値を書く人 |
|--------|------------|
| `driveelink-database-url-{env}` | Terraform。stack がそのデータベースを管理するとき |
| `driveelink-app-secrets-{env}` | 運用。`/secrets/app.env` としてマウントする |

```bash
bash google_cloud/scripts/gcp/create-app-secrets-bundle.sh dev \
  --project dx-driveelink \
  --data-file /path/to/app-secrets.dev.env
```

Scheduler（OIDC、サービスアカウント `driveelink-cron-api-{env}`）:

| ジョブ | Cron（`Asia/Tokyo`） | エンドポイント |
|--------|----------------------|----------------|
| `driveelink2-hr-visa-expire-reminder-{env}` | `0 10 1 * *` | `POST /api/scheduler/hr-visa-expire-reminder` |
| `driveelink2-hr-recalc-{env}` | `0 9 * * *` | `POST /api/scheduler/recalculate` |
| `driveelink2-hr-status-yearly-snapshot-{env}` | dev/stg は `0 9 1 1 *`、prod は `0 1 1 1 *` | `POST /api/scheduler/freeze-hr-status-yearly-snapshot` |

CI: [`.github/workflows/cd-gcp-drivee.yml`](https://github.com/TeckVeho/drivee-link-2/blob/develop/.github/workflows/cd-gcp-drivee.yml) は、backend、frontend、または `google_cloud/**` が変わったとき、ブランチ `develop`、`staging`、`production` で動く。認証は Workload Identity Federation。説明は [`google_cloud/cloudbuild/GITHUB_ACTIONS_WIF.md`](https://github.com/TeckVeho/drivee-link-2/blob/develop/google_cloud/cloudbuild/GITHUB_ACTIONS_WIF.md)。YAML の `_CLOUDSQL_INSTANCE` は稼働中のインスタンスと一致させる。古い値はサービスの SQL 接続を上書きする。

ドメイン:

| 環境 | API | Web |
|------|-----|-----|
| dev | `driveelink-api.vw-dev.com` | `driveelink.vw-dev.com` |
| stg | `v2-stage-api.driveelink.co.jp` | `v2-stage.driveelink.co.jp` |
| prod | `v2-api.driveelink.co.jp` | `v2.driveelink.co.jp` |

ドメイン割り当てスクリプトと state の import コマンドは [`google_cloud/README.md`](https://github.com/TeckVeho/drivee-link-2/blob/develop/google_cloud/README.md) にある。
