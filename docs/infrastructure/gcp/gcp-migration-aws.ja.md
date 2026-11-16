# AWS から GCP へのデータ移行

> **Language**: [🇻🇳 Tiếng Việt](gcp-migration-aws.vi.md) | [🇯🇵 日本語](gcp-migration-aws.ja.md)

GCP のインフラができてから、アプリケーションのデータを移す。環境は一つずつ行う。dev、次に stg、最後に prod。環境変数を写す。SQL を dump して Console から import する。S3 のオブジェクトをローカルへ落としてから `gcloud` で Cloud Storage へ上げる。import のあと、ローカルファイルを消す前にアプリを開き、データと画像を確認する。

`gcloud` はローカルマシンだけで実行する。AWS のサーバーには入れず、サーバー上では実行しない。SQL の dump と S3 のコピーを先にローカルへ置く。そのあとローカルから `gcloud storage cp` または `gcloud storage rsync` する。

移行先の構成: [gcp-infra.ja.md](gcp-infra.ja.md)。

## 目次

1. [移行の前](#移行の前)
2. [環境変数](#環境変数)
3. [データベース](#データベース)
4. [S3 のファイル](#s3-のファイル)
5. [import のあと](#import-のあと)
6. [例: DriveeLink](#例-driveelink)

## 移行の前

- その環境の Cloud SQL は apply 済みで、プライベート接続できる。dev は SQL hub 上にある。stg と prod は一つのインスタンスを共有し、環境ごとにデータベースとユーザーを分ける。
- その環境のアップロード用バケットがある。Cloud Run のランタイムサービスアカウントはそのバケットへ書き込める。
- ローカルマシンは `gcloud auth login` 済みである。`aws` は、データがある場所に応じてローカルまたはサーバーで実行してよい。dump、S3 のコピー、値の入った env ファイルはコミットしない。
- AWS のサーバーに `gcloud` は置かない。`.sql` と S3 のディレクトリは `scp` または `aws s3 sync` でローカルへ取り、GCP への送信はそのマシンから行う。

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

### サーバーで dump し、ファイルをローカルへ取る

dump は MySQL に繋がるサーバーで実行する。この段階では `gcloud` を呼ばない。データベースごとに一つのファイル。

```bash
# AWS のサーバー上
mysqldump \
  --host=RDS_HOST \
  --user=RDS_USER \
  --password \
  --single-transaction \
  --set-gtid-purged=OFF \
  --routines \
  --triggers \
  --databases DATABASE_NAME \
  > /tmp/DATABASE_NAME.sql
```

```bash
# ローカルマシン上
scp user@AWS_SERVER:/tmp/DATABASE_NAME.sql ./DATABASE_NAME.sql
```

`--single-transaction` は、読み取りをロックせずに InnoDB の一貫した dump を取る。RDS のユーザーと権限は dump しない。Cloud SQL のユーザーは Terraform が作る。`scp` が終わったらサーバーの `/tmp/DATABASE_NAME.sql` を消す。

### ローカルの dump を Cloud Storage に置く

Cloud SQL の Console は Cloud Storage 上のオブジェクトだけを import する。`gcloud` はローカルマシンで実行し、さっき取ったファイルを読む。

```bash
# ローカルマシン上
gcloud storage cp ./DATABASE_NAME.sql gs://PROJECT_ID-sql-import/DATABASE_NAME.sql \
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

dump のオブジェクトとローカルの `.sql` は、[import のあと](#import-のあと) でアプリがデータを正しく読むまで残す。

## S3 のファイル

S3 バケットをローカルマシンのディレクトリへ落とす。サーバーでは `gcloud` を実行しない。ローカルのディレクトリが揃ってから、ローカルの `gcloud storage rsync` で環境の GCS バケットへ上げる。

```bash
# ローカルマシン上。AWS CLI がサーバーにしか無い場合は、サーバーのディスクへ sync し、
# scp -r でそのディレクトリをローカルへ取る。サーバーに gcloud は入れない。
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

アプリ上の画像が正しく出るまで `./s3-export` は残す。ファイル数が一致しただけでは消さない。

## import のあと

SQL の operation が Done になり、GCS への `rsync` が終わっても、移行は完了していない。その環境のアプリを開き、移したデータを確認する。

- アプリが起動し、主な操作が動く。ログイン、一覧、dump から入ったレコード。
- 画像と添付ファイルが、S3 に保存されていたものと同じように表示される。画像のあるレコードをいくつか開き、S3 の同じオブジェクトと比べる。ファイルが一致し、壊れておらず、欠けていない。URL が AWS のバケットを指していない。
- GCS のファイル数が、S3 から落としたローカルディレクトリと一致する。

上の確認が通ってから、dump ファイル、Cloud Storage 上の import 用オブジェクト、ローカルディレクトリを消す。

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
