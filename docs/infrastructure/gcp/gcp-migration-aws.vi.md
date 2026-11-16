# Chuyển dữ liệu từ AWS sang GCP

> **Language**: [🇻🇳 Tiếng Việt](gcp-migration-aws.vi.md) | [🇯🇵 日本語](gcp-migration-aws.ja.md)

Chuyển dữ liệu ứng dụng sau khi hạ tầng GCP đã có. Làm từng môi trường một: dev, rồi stg, rồi prod. Ba việc: chép biến môi trường, dump SQL rồi import bằng Console, tải object S3 về máy local rồi đẩy lên Cloud Storage bằng `gcloud`.

Kiến trúc đích: [gcp-infra.vi.md](gcp-infra.vi.md).

## Mục lục

1. [Trước khi chuyển](#trước-khi-chuyển)
2. [Biến môi trường](#biến-môi-trường)
3. [Database](#database)
4. [File trên S3](#file-trên-s3)
5. [Ví dụ: DriveeLink](#ví-dụ-driveelink)

## Trước khi chuyển

- Cloud SQL của môi trường đó đã apply và nhận kết nối private. Dev nằm trên SQL hub. Stg và prod dùng chung instance, mỗi môi trường một database và một user.
- Bucket upload của môi trường đã có. Service account runtime của Cloud Run đã có quyền ghi bucket đó.
- Máy làm việc đã `gcloud auth login` và `aws` login vào đúng account. Không commit file dump, bản sao S3, hay file env có giá trị thật.

Thứ tự trong một môi trường: biến môi trường, database, rồi file.

## Biến môi trường

Lấy file env đang chạy trên AWS (EC2 hoặc bản secret đang dùng). Tách hai nhóm.

| Nhóm | Đích trên GCP | Ví dụ |
|------|----------------|-------|
| Bí mật | Secret Manager, một secret bundle mỗi môi trường | `JWT_SECRET`, API key, mật khẩu mail |
| Không bí mật | `env_vars` của Cloud Run | địa chỉ mail gửi đi, tên hiển thị |

`DATABASE_URL` không chép từ AWS. Terraform tạo secret `driveelink-database-url-{env}` khi stack quản lý database. URL mới trỏ socket Cloud SQL, không trỏ host RDS.

Tạo hoặc ghi đè bundle:

```bash
bash google_cloud/scripts/gcp/create-app-secrets-bundle.sh dev \
  --project PROJECT_ID \
  --data-file /path/to/app-secrets.dev.env
```

File `app-secrets.dev.env` chỉ chứa khóa bí mật, dạng `.env`. Không đặt file này vào git. Sau khi Cloud Run mount bundle, xóa bản env trên máy làm việc.

## Database

### Dump từ RDS hoặc MySQL trên AWS

Chạy từ máy được phép nối tới database nguồn. Một file cho một database.

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

`--single-transaction` giữ dump nhất quán với InnoDB mà không khóa bảng đọc. Không dump user và quyền của RDS. User trên Cloud SQL do Terraform tạo.

### Đưa file dump lên Cloud Storage

Console của Cloud SQL chỉ import từ một object trên Cloud Storage, không nhận file từ máy local. Đặt file vào một bucket của chính project, ngoài bucket upload của ứng dụng.

```bash
gcloud storage cp DATABASE_NAME.sql gs://PROJECT_ID-sql-import/DATABASE_NAME.sql \
  --project=PROJECT_ID
```

Service account của Cloud SQL instance cần đọc object đó. Trong Console: Cloud SQL → instance → chọn service account của instance → cấp `Storage Object Viewer` trên bucket import. Gỡ quyền này sau khi import xong.

### Import bằng Console

1. Mở [Cloud SQL](https://console.cloud.google.com/sql) đúng project.
2. Chọn instance đích. Stg và prod là cùng instance. Dev là instance trên hub.
3. **Import**.
4. **Browse** tới `gs://PROJECT_ID-sql-import/DATABASE_NAME.sql`.
5. Định dạng **SQL**.
6. Database đích: database của đúng môi trường, đã được Terraform tạo.
7. **Import** và đợi operation chuyển sang Done.

Import ghi đè dữ liệu trùng khóa. Chạy trên database trống của lần chuyển đầu. Không import file stg vào database prod.

Sau khi ứng dụng đọc được dữ liệu, xóa object dump và file local.

## File trên S3

Tải bucket S3 về một thư mục local, rồi `gcloud storage rsync` thư mục đó lên bucket GCS của môi trường.

```bash
aws s3 sync s3://AWS_BUCKET ./s3-export --only-show-errors

gcloud storage rsync ./s3-export gs://GCS_BUCKET \
  --recursive \
  --project=PROJECT_ID
```

`sync` và `rsync` chỉ tải phần còn thiếu. Kiểm tra số file trước khi xóa bản local:

```bash
find ./s3-export -type f | wc -l
gcloud storage ls gs://GCS_BUCKET --recursive --project=PROJECT_ID | wc -l
```

Không thêm `--delete-unmatched-destination-objects` ở lần đầu nếu bucket GCS đã có file cần giữ. Chỉ thêm cờ đó khi muốn GCS thành bản sao đúng của thư mục local.

Xóa `./s3-export` sau khi số file khớp.

## Ví dụ: DriveeLink

Repo: [TeckVeho/drivee-link-2](https://github.com/TeckVeho/drivee-link-2), nhánh `develop`. Project `dx-driveelink`.

| Việc | Giá trị |
|------|---------|
| Bundle secret | `driveelink-app-secrets-{env}` |
| Database dev | `dx_driveelink_dev` trên hub `dev-sql-hub` |
| Database stg | `dx_driveelink_stg` trên instance `dx-driveelink-prod` |
| Database prod | `dx_driveelink_prod` trên instance `dx-driveelink-prod` |
| Bucket upload prod | `dx-driveelink-driveelink-uploads-prod` |
| Thư mục local đã tải từ S3 | `bucket-stg-prod-aws/` |

Đẩy thư mục local lên GCS:

```bash
SOURCE_DIR=/path/to/bucket-stg-prod-aws \
PROJECT_ID=dx-driveelink \
BUCKET=dx-driveelink-driveelink-uploads-prod \
  bash google_cloud/scripts/gcp/upload-bucket-stg-prod-aws-to-gcs.sh
```

Script này rsync và xóa object GCS không còn trong thư mục nguồn. Dùng khi thư mục local là bản đủ của bucket.
