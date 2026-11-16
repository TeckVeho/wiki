# Chuyển dữ liệu từ AWS sang GCP

> **Language**: [🇻🇳 Tiếng Việt](gcp-migration-aws.vi.md) | [🇯🇵 日本語](gcp-migration-aws.ja.md)

Chuyển dữ liệu ứng dụng sau khi hạ tầng GCP đã có. Làm từng môi trường một: dev, rồi stg, rồi prod. Chép biến môi trường, dump SQL rồi import bằng Console, tải object S3 về máy local rồi đẩy lên Cloud Storage bằng `gcloud`. Import xong thì mở app và kiểm tra dữ liệu cùng ảnh trước khi xóa file local.

`gcloud` chỉ chạy trên máy local. Không cài và không chạy `gcloud` trên server AWS. Dump SQL và bản sao S3 phải nằm trên máy local trước. Từ đó mới `gcloud storage cp` hoặc `gcloud storage rsync`.

Kiến trúc đích: [gcp-infra.vi.md](gcp-infra.vi.md).

## Mục lục

1. [Trước khi chuyển](#trước-khi-chuyển)
2. [Biến môi trường](#biến-môi-trường)
3. [Database](#database)
4. [File trên S3](#file-trên-s3)
5. [Sau khi import](#sau-khi-import)
6. [Ví dụ: DriveeLink](#ví-dụ-driveelink)

## Trước khi chuyển

- Cloud SQL của môi trường đó đã apply và nhận kết nối private. Dev nằm trên SQL hub. Stg và prod dùng chung instance, mỗi môi trường một database và một user.
- Bucket upload của môi trường đã có. Service account runtime của Cloud Run đã có quyền ghi bucket đó.
- Máy local đã `gcloud auth login`. Lệnh `aws` có thể chạy trên máy local hoặc trên server, tùy chỗ đang giữ dữ liệu. Không commit file dump, bản sao S3, hay file env có giá trị thật.
- Server AWS không có `gcloud`. File `.sql` và thư mục S3 được tải về máy local bằng `scp` hoặc `aws s3 sync`, rồi mới đẩy lên GCP từ máy đó.

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

### Dump trên server, rồi tải file về máy local

Dump chạy trên server, nơi nối được MySQL. Không gọi `gcloud` ở bước này. Một file cho một database.

```bash
# Trên server AWS
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
# Trên máy local
scp user@AWS_SERVER:/tmp/DATABASE_NAME.sql ./DATABASE_NAME.sql
```

`--single-transaction` giữ dump nhất quán với InnoDB mà không khóa bảng đọc. Không dump user và quyền của RDS. User trên Cloud SQL do Terraform tạo. Xóa `/tmp/DATABASE_NAME.sql` trên server sau khi `scp` xong.

### Đưa file dump từ máy local lên Cloud Storage

Console của Cloud SQL chỉ import từ một object trên Cloud Storage. Lệnh `gcloud` chạy trên máy local, đọc file vừa tải về.

```bash
# Trên máy local
gcloud storage cp ./DATABASE_NAME.sql gs://PROJECT_ID-sql-import/DATABASE_NAME.sql \
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

Giữ object dump và file `.sql` local cho đến khi mục [Sau khi import](#sau-khi-import) xác nhận app đọc đúng dữ liệu.

## File trên S3

Tải bucket S3 về một thư mục trên máy local. Không chạy `gcloud` trên server. Sau khi thư mục local đã đủ, mới `gcloud storage rsync` từ máy local lên bucket GCS.

```bash
# Trên máy local. Nếu AWS CLI chỉ có trên server thì sync ra đĩa server,
# rồi scp -r thư mục đó về máy local. Không cài gcloud trên server.
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

Giữ `./s3-export` cho đến khi ảnh trên app hiển thị đúng. Số file khớp chưa đủ để xóa.

## Sau khi import

Operation SQL là Done và `rsync` lên GCS xong thì chưa kết thúc việc chuyển. Mở app của đúng môi trường đó và kiểm tra dữ liệu vừa đưa sang.

- App khởi động và thao tác chính chạy đúng: đăng nhập, danh sách, bản ghi lấy từ dump.
- Ảnh và file đính kèm hiển thị đúng như bản đã lưu trên S3. Mở vài bản ghi có ảnh và so với cùng object trên S3: đúng file, không vỡ, không thiếu. URL không còn trỏ về bucket AWS.
- Số file trên GCS khớp thư mục local đã tải từ S3.

Chỉ xóa file dump, object import trên Cloud Storage và thư mục local sau khi các mục trên đúng.

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
