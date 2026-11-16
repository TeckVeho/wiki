# AWS から GCP へのデータ移行

> **Language**: [🇻🇳 Tiếng Việt](gcp-migration-aws.vi.md) | [🇯🇵 日本語](gcp-migration-aws.ja.md)

GCP のインフラができてから、アプリケーションのデータを移す。環境は一つずつ行う。dev、次に stg、最後に prod。作業は三つ。環境変数を写す。SQL を dump して Console から import する。S3 のオブジェクトをローカルへ落としてから `gcloud` で Cloud Storage へ上げる。

移行先の構成: [gcp-infra.ja.md](gcp-infra.ja.md)。

## 目次

1. [移行の前](#移行の前)
2. [環境変数](#環境変数)
3. [データベース](#データベース)
4. [S3 のファイル](#s3-のファイル)
5. [例: DriveeLink](#例-driveelink)

## 移行の前

- その環境の Cloud SQL は apply 済みで、プライベート接続できる。dev は SQL hub 上にある。stg と prod は一つのインスタンスを共有し、環境ごとにデータベースとユーザーを分ける。
- その環境のアップロード用バケットがある。Cloud Run のランタイムサービスアカウントはそのバケットへ書き込める。
- 作業マシンは `gcloud auth login` 済みで、`aws` は正しいアカウントにログインしている。dump、S3 のコピー、値の入った env ファイルはコミットしない。

一つの環境の中の順は、環境変数、データベース、ファイル。

## 環境変数

AWS で動いている env ファイル（EC2 または利用中の secret）を取る。二つに分ける。

| 区分 | GCP での置き場所 | 例 |
|------|------------------|-----|
| 秘密 | Secret Manager。環境ごとに一つの bundle | `JWT_SECRET`、API キー、メールのパスワード |
| 秘密でないもの | Cloud Run の `env_vars` | 送信元メールアドレス、表示名 |

`DATABASE_URL` は AWS から写さない。Terraform がデータベースを管理するとき、secret `driveelink-database-url-{env}` を作る。新しい URL は Cloud SQL のソケットを指す。RDS のホストは指さない。

bundle を作る、または上書きする:

```bash
bash google_cloud/scripts/gcp/create-app-secrets-bundle.sh dev \
  --project PROJECT_ID \
  --data-file /path/to/app-secrets.dev.env
```

`app-secrets.dev.env` は秘密のキーだけを `.env` 形式で持つ。このファイルは git に置かない。Cloud Run が bundle をマウントしたあと、作業マシンの env ファイルを消す。

## データベース

### RDS または AWS 上の MySQL から dump する

ソースデータベースへ接続できるマシンで実行する。データベースごとに一つのファイル。

```bash
mysqldump \
  --host=RDS_HOST \
  --user=RDS_USER \
  --password \
  --single-transaction \
  --set-gtid-purged=OFF \
  --routines \
  --triggers \
  --databases DATABASE_NAME \
  > DATABASE_NAME.sql
```

`--single-transaction` は、読み取りをロックせずに InnoDB の一貫した dump を取る。RDS のユーザーと権限は dump しない。Cloud SQL のユーザーは Terraform が作る。

### dump を Cloud Storage に置く

Cloud SQL の Console は Cloud Storage 上のオブジェクトだけを import する。ローカルファイルは直接選べない。ファイルはアプリケーションのアップロード用バケットとは別の、同じプロジェクトのバケットに置く。

```bash
gcloud storage cp DATABASE_NAME.sql gs://PROJECT_ID-sql-import/DATABASE_NAME.sql \
  --project=PROJECT_ID
```

Cloud SQL インスタンスのサービスアカウントがそのオブジェクトを読める必要がある。Console で Cloud SQL → インスタンス → インスタンスのサービスアカウントを確認し、import 用バケットに `Storage Object Viewer` を付ける。import が終わったらこの権限を外す。

### Console で import する

1. 正しいプロジェクトの [Cloud SQL](https://console.cloud.google.com/sql) を開く。
2. 移行先インスタンスを選ぶ。stg と prod は同じインスタンスである。dev は hub 上のインスタンスである。
3. **Import** を開く。
4. **Browse** で `gs://PROJECT_ID-sql-import/DATABASE_NAME.sql` を選ぶ。
5. 形式は **SQL**。
6. 移行先データベースは、Terraform が作ったその環境のデータベース。
7. **Import** を押し、operation が Done になるまで待つ。

import は同じキーのデータを上書きする。初回の移行は空のデータベースに対して行う。stg のファイルを prod のデータベースへ import しない。

アプリケーションがデータを読めたら、dump のオブジェクトとローカルファイルを消す。

## S3 のファイル

S3 バケットをローカルディレクトリへ落とし、そのディレクトリを環境の GCS バケットへ `gcloud storage rsync` する。

```bash
aws s3 sync s3://AWS_BUCKET ./s3-export --only-show-errors

gcloud storage rsync ./s3-export gs://GCS_BUCKET \
  --recursive \
  --project=PROJECT_ID
```

`sync` と `rsync` は不足分だけを転送する。ローカルを消す前にファイル数を確認する。

```bash
find ./s3-export -type f | wc -l
gcloud storage ls gs://GCS_BUCKET --recursive --project=PROJECT_ID | wc -l
```

GCS に残したいファイルが既にある初回は、`--delete-unmatched-destination-objects` を付けない。ローカルディレクトリをバケットの完全なコピーにしたいときだけ付ける。

ファイル数が一致したら `./s3-export` を消す。

## 例: DriveeLink

リポジトリ: [TeckVeho/drivee-link-2](https://github.com/TeckVeho/drivee-link-2)、ブランチ `develop`。プロジェクト `dx-driveelink`。

| 作業 | 値 |
|------|-----|
| secret bundle | `driveelink-app-secrets-{env}` |
| dev のデータベース | hub `dev-sql-hub` 上の `dx_driveelink_dev` |
| stg のデータベース | インスタンス `dx-driveelink-prod` 上の `dx_driveelink_stg` |
| prod のデータベース | インスタンス `dx-driveelink-prod` 上の `dx_driveelink_prod` |
| prod のアップロードバケット | `dx-driveelink-driveelink-uploads-prod` |
| S3 から落としたローカルディレクトリ | `bucket-stg-prod-aws/` |

ローカルディレクトリを GCS へ上げる:

```bash
SOURCE_DIR=/path/to/bucket-stg-prod-aws \
PROJECT_ID=dx-driveelink \
BUCKET=dx-driveelink-driveelink-uploads-prod \
  bash google_cloud/scripts/gcp/upload-bucket-stg-prod-aws-to-gcs.sh
```

このスクリプトは rsync し、ソースディレクトリに無い GCS オブジェクトを削除する。ローカルディレクトリがバケットの完全なコピーであるときに使う。
