---
sidebar_position: 15
id: permission-use-cases
title: 権限ユースケース（AWS / GCP）
---

Tài liệu được sắp xếp theo thứ tự **Tiếng Việt → English → 日本語**.  
This document is organized as **Vietnamese → English → Japanese**.  
このドキュメントは **ベトナム語 → 英語 → 日本語** の順で構成しています。

---

# Tiếng Việt

*Vietnamese / ベトナム語*

## Chi tiết use case quyền (AWS / GCP)

Trình bày trước quy tắc chung về quyền·chính sách và thiết kế theo vai trò, sau đó tổng hợp console·quy trình và người phụ trách chính theo từng use case.

### Định nghĩa quyền

#### Quy tắc chung

* Quản lý IAM theo **role** (cấm gắn policy trực tiếp cho user).
* Thống nhất thao tác máy chủ qua **Session Manager**.
* Môi trường production (**DX**) ưu tiên hạn chế bắt buộc.
* Môi trường phát triển (**VEHO**) ưu tiên linh hoạt.

#### AWS (DX / VEHO chung)

* Truy cập cá nhân thống nhất qua **IAM user** và **Session Manager**.
* User OS chỉ dùng tài khoản chung (`deploy` / `admin`).
* Log thao tác quản lý theo đơn vị IAM.

**※Hiện trạng**

* Chỉ **AWS (DX)** tích hợp Vface và có user OS cá nhân.
* **AWS (VEHO)** đã tạo IAM user group và gắn role; user cho engineer chưa đăng ký.

Tham khảo: [Bảng tính quản lý quyền](https://docs.google.com/spreadsheets/d/1_ujCqe7P9_cauTjOxgn5p6TRM9E6S99sL9-LBiPmo_o/edit?gid=1510942008#gid=1510942008)

#### GCP (giả định Cloud Run)

* Không có user OS.
* **IAM** là trung tâm.

**※Hiện trạng**

* Đã tạo một phần user group trong [Google Admin](https://admin.google.com/u/6/ac/groups?journey=218&hl=ja); đã đăng ký user cho engineer dạng `tên@veho-works.com`.
* Gắn policy trong [GCP IAM Console](https://console.cloud.google.com/iam-admin/iam?organizationId=592970437621).

#### IAM cho người và ứng dụng

```
IAM user (người)
   ↓
Thao tác Cloud Run / GCP

Service account (ứng dụng)
   ↓
Truy cập DB / Secret / API
```

#### Thiết kế policy

| Phân loại | Đối tượng | Policy | Nội dung quyền (thiết kế) |
| --------- | --------- | ------ | ------------------------- |
| AWS (DX) | IAM user | Admin | Toàn quyền (gồm IAM). Có Session Manager |
| AWS (DX) | IAM user | Infra Engineer | EC2 / RDS / S3 / CloudWatch (IAM hạn chế) + Session Manager |
| AWS (DX) | IAM user | App Engineer | Chủ yếu ReadOnly + ghi S3 một phần + Session Manager |
| AWS (VEHO) | IAM user | Admin | Toàn quyền |
| AWS (VEHO) | IAM user | Infra Engineer | EC2 / S3 / RDS / CloudWatch gần full + Session Manager |
| AWS (VEHO) | IAM user | App Engineer | Operator (bật/tắt EC2 / S3 / xem log) + Session Manager |
| GCP | IAM | Admin | Owner project (toàn quyền) |
| GCP | IAM | Infra Engineer | Quản lý Cloud Run / Artifact Registry / Cloud SQL / Logging |
| GCP | IAM | App Engineer | Deploy Cloud Run / xem log / tham chiếu Artifact Registry |

---

### Bảng use case

| Use case | AWS | GCP | Người phụ trách chính |
| -------- | --- | --- | --------------------- |
| Xem log hàng ngày | Xem **Amazon CloudWatch Logs**. Khi cần kết nối **EC2 → Session Manager** để xem log thô | Log **Cloud Run** trong **Cloud Logging** | App Engineer |
| Triển khai | Deploy app lên EC2. Khi cần **Session Manager** kiểm server, **CloudWatch Logs** xem log | Deploy **Cloud Run**, xác nhận **Revisions** và **Cloud Logging**. Khi cần xem image **Artifact Registry** | App Engineer |
| Xác nhận sau triển khai | **CloudWatch Logs**, **Session Manager**, kiểm tra app | **Cloud Logging**, **Cloud Run Revisions**, kiểm tra app | App Engineer |
| Điều tra sự cố (log) | **CloudWatch Logs**, khi cần **Session Manager** vào EC2 xem log app/OS | **Cloud Logging**, log lỗi **Cloud Run** | App Engineer |
| Điều tra sự cố (server/môi trường) | **Session Manager** vào EC2: process, RAM, disk, cấu hình | Cấu hình **Cloud Run**, biến môi trường, service account, **Revisions** | App Engineer / Infra Engineer |
| Điều tra sự cố (dữ liệu DB) | **Session Manager** → EC2, **mysql client** → **RDS/Aurora** read-only, chỉ `SELECT` | **Cloud SQL Studio** → **Cloud SQL for MySQL** read-only, chỉ `SELECT` | App Engineer |
| Điều tra sự cố (tải/kết nối DB) | Metric **Amazon RDS**, khi cần **CloudWatch** | Metric **Cloud SQL**, số kết nối, sự kiện lỗi | Infra Engineer |
| Điều tra dữ liệu | **Session Manager** → EC2 → **mysql client** → RDS/Aurora | **Cloud SQL Studio** hoặc client được phép → Cloud SQL | App Engineer |
| Xây dựng môi trường | **EC2 / RDS / S3 / CloudWatch / IAM role** | **Cloud Run / Cloud SQL / Artifact Registry / Secret Manager / IAM** | Infra Engineer |
| Thay đổi cấu hình | EC2, S3, giám sát, RDS khi cần | Cloud Run, Secret, kết nối Cloud SQL, IAM | Infra Engineer |
| Rollback sau release | Về phiên bản cũ, khi cần **Session Manager** | **Cloud Run Revisions** chọn revision cũ | App Engineer / Infra Engineer |
| Thay đổi quyền | **IAM role / IAM group** | **Google Cloud IAM / Google Group** | Admin / Infra Engineer |

---

### 1. AWS

#### 1-1. Xem log hàng ngày

* App Engineer dùng **Amazon CloudWatch Logs** xem log ứng dụng.
* Log không có trên CloudWatch hoặc cần file log thô: **EC2 console → instance → Connect → Session Manager**.
* Sau khi kết nối: log app, web server, pm2, systemd, v.v.

#### 1-2. Triển khai

* App Engineer thực hiện deploy.
* Sau deploy: **Amazon CloudWatch Logs** kiểm lỗi.
* Khi cần: **Session Manager** vào EC2 kiểm process và file cấu hình.

#### 1-3. Xác nhận sau triển khai

* App Engineer kiểm tra kết nối app.
* Log: **CloudWatch Logs**.
* Khi cần trạng thái trong server: **Session Manager** vào EC2.

#### 1-4. Điều tra sự cố (log)

* App Engineer xem **CloudWatch Logs** (nội dung lỗi, thời điểm, phạm vi).
* Chi tiết: **Session Manager** vào EC2, log app và OS.

#### 1-5. Điều tra sự cố (server/môi trường)

* App Engineer **Session Manager** vào EC2, kiểm:

  * Trạng thái process
  * Bộ nhớ
  * Disk
  * Biến môi trường
  * File cấu hình
* Điều tra sâu OS/middleware: Infra Engineer.

#### 1-6. Điều tra sự cố (dữ liệu DB)

* App Engineer: **EC2 console → Connect → Session Manager** tới app server hoặc bastion tương đương.
* Trên EC2 dùng **mysql client**, kết nối read-only tới **Amazon RDS / Aurora MySQL**.
* Nguyên tắc chỉ `SELECT`.
* `UPDATE / DELETE / ALTER / DROP`: chỉ Infra Engineer hoặc Admin.

#### 1-7. Điều tra sự cố (tải/kết nối DB)

* Infra Engineer: **Amazon RDS console** trạng thái instance.
* CPU, bộ nhớ, số kết nối, độ trễ.
* Khi cần: metric DB trên **Amazon CloudWatch**.

#### 1-8. Điều tra dữ liệu

* App Engineer **Session Manager** → EC2, **mysql client** read-only RDS/Aurora.
* Chỉ tra cứu phục vụ điều tra, không cập nhật.

#### 1-9. Xây dựng môi trường

* Infra Engineer xây **EC2 / RDS / S3 / CloudWatch / IAM role**.
* App Engineer khi cần: đặt app, kiểm tra kết nối và hoạt động.

#### 1-10. Thay đổi cấu hình

* Infra Engineer: cấu hình EC2, giám sát, RDS khi cần.
* App Engineer: xác nhận phản ánh cấu hình app / `.env` tương đương.

#### 1-11. Rollback sau release

* App Engineer rollback phiên bản app cũ.
* Khi cần **Session Manager** vào EC2 kiểm tra.
* Thay đổi hạ tầng: Infra Engineer.

#### 1-12. Thay đổi quyền

* **Admin** hoặc **Infra Engineer** thay đổi **IAM role / IAM group**.
* App Engineer không tự thực hiện thay đổi quyền.

---

### 2. GCP

#### 2-1. Xem log hàng ngày

* App Engineer mở service **Cloud Run**, xem log trong **Cloud Logging**.
* Tập trung request log, app log, error log.

#### 2-2. Triển khai

* App Engineer deploy **Cloud Run**.
* Sau deploy: **Cloud Run Revisions** xác nhận revision mới.
* Khi cần: **Artifact Registry** xem image.
* Log: **Cloud Logging**.

#### 2-3. Xác nhận sau triển khai

* App Engineer kiểm tra kết nối Cloud Run.
* **Cloud Logging** kiểm lỗi.
* **Revisions** xác nhận revision đúng đang chạy.

#### 2-4. Điều tra sự cố (log)

* App Engineer **Cloud Logging** log Cloud Run.
* 5xx, exception, timeout, lỗi khởi động, v.v.

#### 2-5. Điều tra sự cố (môi trường chạy)

* App Engineer cấu hình service **Cloud Run**:

  * Biến môi trường
  * Tham chiếu Secret
  * Service account
  * Cấu hình đích kết nối
  * Revisions
* Vấn đề nền tảng/kết nối: Infra Engineer.

#### 2-6. Điều tra sự cố (dữ liệu DB)

* App Engineer: **Google Cloud console → Cloud SQL → instance → Cloud SQL Studio**.
* **Cloud SQL for MySQL** read-only, chỉ `SELECT`.
* `UPDATE / DELETE / ALTER / DROP`: chỉ Infra Engineer hoặc Admin.

#### 2-7. Điều tra sự cố (tải/kết nối DB)

* Infra Engineer **Cloud SQL console** instance.
* CPU, bộ nhớ, kết nối, sự kiện lỗi, bất thường kết nối.
* Khi cần: cấu hình kết nối Cloud SQL và quyền service account.

#### 2-8. Điều tra dữ liệu

* App Engineer **Cloud SQL Studio** hoặc SQL client được phép, **Cloud SQL for MySQL** read-only.
* Chỉ tra cứu điều tra, không cập nhật.

#### 2-9. Xây dựng môi trường

* Infra Engineer **Cloud Run / Cloud SQL / Artifact Registry / Secret Manager / IAM**.
* App Engineer: cấu hình app, deploy, kiểm tra kết nối.

#### 2-10. Thay đổi cấu hình

* Infra Engineer: Cloud Run, kết nối Cloud SQL, Secret, IAM.
* App Engineer: cấu hình phía app và xác nhận hoạt động.

#### 2-11. Rollback sau release

* App Engineer **Cloud Run Revisions** về revision cũ.
* Sau rollback: **Cloud Logging** kiểm tra bất thường.
* Thay đổi DB/hạ tầng: Infra Engineer.

#### 2-12. Thay đổi quyền

* **Admin** hoặc **Infra Engineer** thay đổi **Google Cloud IAM** và **Google Group**.
* App Engineer không tự thực hiện thay đổi quyền.

---

# English

*English / 英語*

## Permission use cases (AWS / GCP)

This document first describes common permission and policy rules and role-based design, then lists consoles, procedures, and primary owners by use case.

### Permission definitions

#### Common rules

* Manage IAM in a **role-based** way (direct policy attachment to users is not allowed).
* Standardize server access through **Session Manager**.
* Production (**DX**) prioritizes mandatory restrictions.
* Development (**VEHO**) prioritizes flexibility.

#### AWS (DX / VEHO common)

* Personal access is standardized via **IAM users** and **Session Manager**.
* OS accounts are limited to shared users (`deploy` / `admin`).
* Operation logs are managed per IAM principal.

**Current state**

* Only **AWS (DX)** integrates with Vface and has per-person OS users.
* **AWS (VEHO)** has IAM user groups with roles attached; engineer IAM users are not yet registered.

Reference: [Permission management spreadsheet](https://docs.google.com/spreadsheets/d/1_ujCqe7P9_cauTjOxgn5p6TRM9E6S99sL9-LBiPmo_o/edit?gid=1510942008#gid=1510942008)

#### GCP (Cloud Run assumed)

* No OS users.
* **IAM** is central.

**Current state**

* Some groups exist in [Google Admin](https://admin.google.com/u/6/ac/groups?journey=218&hl=ja); engineer accounts use `username@veho-works.com`.
* Policies are attached in the [GCP IAM console](https://console.cloud.google.com/iam-admin/iam?organizationId=592970437621).

#### IAM for people vs applications

```
IAM user (human)
   ↓
Cloud Run / GCP operations

Service account (application)
   ↓
DB / Secret / API access
```

#### Policy design

| Scope | Target | Policy | Permission content (design) |
| ----- | ------ | ------ | --------------------------- |
| AWS (DX) | IAM user | Admin | Full access including IAM. Session Manager allowed |
| AWS (DX) | IAM user | Infra Engineer | EC2 / RDS / S3 / CloudWatch (IAM limited) + Session Manager |
| AWS (DX) | IAM user | App Engineer | Mostly ReadOnly + limited S3 write + Session Manager |
| AWS (VEHO) | IAM user | Admin | Full access |
| AWS (VEHO) | IAM user | Infra Engineer | EC2 / S3 / RDS / CloudWatch near-full + Session Manager |
| AWS (VEHO) | IAM user | App Engineer | Operator (EC2 start/stop / S3 / log viewing) + Session Manager |
| GCP | IAM | Admin | Project owner (full access) |
| GCP | IAM | Infra Engineer | Cloud Run / Artifact Registry / Cloud SQL / Logging management |
| GCP | IAM | App Engineer | Cloud Run deploy / log viewing / Artifact Registry read |

---

### Use case matrix

| Use case | AWS | GCP | Primary owner |
| -------- | --- | --- | --------------- |
| Daily log review | **Amazon CloudWatch Logs**; use **EC2 → Session Manager** for raw logs when needed | **Cloud Run** logs in **Cloud Logging** | App Engineer |
| Deployment | Deploy to EC2; **Session Manager** and **CloudWatch Logs** as needed | Deploy to **Cloud Run**; **Revisions** and **Cloud Logging**; **Artifact Registry** for images when needed | App Engineer |
| Post-deploy verification | **CloudWatch Logs**, **Session Manager**, app smoke test | **Cloud Logging**, **Cloud Run Revisions**, app smoke test | App Engineer |
| Troubleshooting (logs) | **CloudWatch Logs**; **Session Manager** on EC2 for app/OS logs when needed | **Cloud Logging**, **Cloud Run** error logs | App Engineer |
| Troubleshooting (server/runtime) | **Session Manager** on EC2: process, memory, disk, config | **Cloud Run** settings, env vars, service account, **Revisions** | App Engineer / Infra Engineer |
| Troubleshooting (DB data) | **Session Manager** → EC2 **mysql client** → **RDS/Aurora** read-only `SELECT` | **Cloud SQL Studio** → **Cloud SQL for MySQL** read-only `SELECT` | App Engineer |
| Troubleshooting (DB load/conn) | **Amazon RDS** metrics; **CloudWatch** as needed | **Cloud SQL** metrics, connections, incidents | Infra Engineer |
| Data investigation | **Session Manager** → EC2 → **mysql client** → RDS/Aurora | **Cloud SQL Studio** or approved client → Cloud SQL | App Engineer |
| Environment setup | **EC2 / RDS / S3 / CloudWatch / IAM roles** | **Cloud Run / Cloud SQL / Artifact Registry / Secret Manager / IAM** | Infra Engineer |
| Configuration change | EC2, S3, monitoring, RDS as needed | Cloud Run, Secret, Cloud SQL connectivity, IAM | Infra Engineer |
| Rollback after release | Revert app; **Session Manager** as needed | **Cloud Run Revisions** to previous revision | App Engineer / Infra Engineer |
| Permission change | **IAM roles / IAM groups** | **Google Cloud IAM / Google Group** | Admin / Infra Engineer |

---

### 1. AWS

#### 1-1. Daily log review

* App Engineers use **Amazon CloudWatch Logs** for application logs.
* For logs not in CloudWatch or raw files: **EC2 console → instance → Connect → Session Manager**.
* After connecting: app logs, web server logs, pm2, systemd, etc.

#### 1-2. Deployment

* App Engineers deploy the application.
* After deploy: check errors in **Amazon CloudWatch Logs**.
* Optionally **Session Manager** to EC2 for processes and config files.

#### 1-3. Post-deploy verification

* App Engineers run app connectivity checks.
* Logs in **CloudWatch Logs**.
* **Session Manager** to EC2 when in-server state is needed.

#### 1-4. Troubleshooting (logs)

* App Engineers first use **CloudWatch Logs** for error content, time, and scope.
* For details: **Session Manager** to EC2 for app and OS logs.

#### 1-5. Troubleshooting (server/runtime)

* App Engineers use **Session Manager** on EC2 to check:

  * Process state
  * Memory
  * Disk
  * Environment variables
  * Config files
* Deeper OS/middleware work: Infra Engineer.

#### 1-6. Troubleshooting (DB data)

* App Engineers: **EC2 console → Connect → Session Manager** to the app server or equivalent bastion.
* On EC2 use **mysql client** with read-only access to **Amazon RDS / Aurora MySQL**.
* Generally `SELECT` only.
* `UPDATE / DELETE / ALTER / DROP`: Infra Engineer or Admin only.

#### 1-7. Troubleshooting (DB load/connections)

* Infra Engineers use **Amazon RDS console** for instance health.
* CPU, memory, connections, latency.
* **Amazon CloudWatch** DB metrics when needed.

#### 1-8. Data investigation

* App Engineers **Session Manager** → EC2 → **mysql client** read-only to RDS/Aurora.
* Investigation only; no updates.

#### 1-9. Environment setup

* Infra Engineers provision **EC2 / RDS / S3 / CloudWatch / IAM roles**.
* App Engineers may place apps and run connectivity checks.

#### 1-10. Configuration change

* Infra Engineers change EC2, monitoring, and RDS when needed.
* App Engineers verify app config and `.env`-equivalent rollout.

#### 1-11. Rollback after release

* App Engineers roll back to a previous app version.
* **Session Manager** to EC2 when needed.
* Infra handles infrastructure-related rollbacks.

#### 1-12. Permission change

* **Admin** or **Infra Engineer** changes **IAM roles / IAM groups**.
* App Engineers do not perform permission changes directly.

---

### 2. GCP

#### 2-1. Daily log review

* App Engineers open the **Cloud Run** service and use **Cloud Logging**.
* Focus on request, application, and error logs.

#### 2-2. Deployment

* App Engineers deploy to **Cloud Run**.
* After deploy: **Cloud Run Revisions** for the new revision.
* **Artifact Registry** for images when needed.
* Logs in **Cloud Logging**.

#### 2-3. Post-deploy verification

* App Engineers smoke-test Cloud Run.
* **Cloud Logging** for errors.
* **Revisions** to confirm the expected revision is serving.

#### 2-4. Troubleshooting (logs)

* App Engineers use **Cloud Logging** for Cloud Run.
* 5xx, exceptions, timeouts, startup failures, etc.

#### 2-5. Troubleshooting (runtime)

* App Engineers review **Cloud Run** service settings:

  * Environment variables
  * Secret references
  * Service account
  * Connection targets
  * Revisions
* Platform/connectivity issues: Infra Engineer.

#### 2-6. Troubleshooting (DB data)

* App Engineers: **Google Cloud console → Cloud SQL → instance → Cloud SQL Studio**.
* **Cloud SQL for MySQL** read-only; `SELECT` only.
* `UPDATE / DELETE / ALTER / DROP`: Infra Engineer or Admin only.

#### 2-7. Troubleshooting (DB load/connections)

* Infra Engineers use **Cloud SQL console** for the instance.
* CPU, memory, connections, incidents, connection anomalies.
* Cloud SQL connectivity and service account permissions when needed.

#### 2-8. Data investigation

* App Engineers use **Cloud SQL Studio** or an approved SQL client, **Cloud SQL for MySQL** read-only.
* Investigation only; no updates.

#### 2-9. Environment setup

* Infra Engineers provision **Cloud Run / Cloud SQL / Artifact Registry / Secret Manager / IAM**.
* App Engineers handle app config, deploy, and checks.

#### 2-10. Configuration change

* Infra Engineers change Cloud Run, Cloud SQL connectivity, Secret, IAM.
* App Engineers verify app-side settings and behavior.

#### 2-11. Rollback after release

* App Engineers use **Cloud Run Revisions** to roll back.
* Then **Cloud Logging** for anomalies.
* DB or platform changes: Infra Engineer.

#### 2-12. Permission change

* **Admin** or **Infra Engineer** changes **Google Cloud IAM** and **Google Group** settings.
* App Engineers do not perform permission changes directly.

---

# 日本語

*Japanese / 日本語*

## 権限ユースケース詳細

権限・ポリシーの共通ルールとロール別の設計を先に示し、その後にユースケースごとのコンソール・手順と主担当を整理する。

### 権限の定義

#### 共通ルール

* IAM はロールベースで管理する（ユーザーへのポリシー直付けは禁止）。
* サーバ操作は **Session Manager** 経由に統一する。
* 本番（**DX**）は強制制限を優先する。
* 開発（**VEHO**）は柔軟性を優先する。

#### AWS（DX / VEHO 共通）

* 個人アクセスは **IAM ユーザー** と **Session Manager** 経由に統一する。
* OS ユーザーは共通ユーザー（`deploy` / `admin`）のみ利用する。
* 操作ログは IAM 単位で管理する。

**※現状**

* **AWS（DX）** のみ Vface と連携し、個人 OS ユーザーがある。
* **AWS（VEHO）** は IAM ユーザーグループを作成し、そこにロールをアタッチ済み。エンジニア分のユーザーは未登録。

参考: [権限管理スプレッドシート](https://docs.google.com/spreadsheets/d/1_ujCqe7P9_cauTjOxgn5p6TRM9E6S99sL9-LBiPmo_o/edit?gid=1510942008#gid=1510942008)

#### GCP（Cloud Run 前提）

* OS ユーザーはない。
* **IAM** が中心となる。

**※現状**

* [Google Admin](https://admin.google.com/u/6/ac/groups?journey=218&hl=ja) で一部ユーザーグループを作成済み。「ユーザー名＋@veho-works.com」でエンジニア分のユーザーを登録済み。
* [GCP IAM コンソール](https://console.cloud.google.com/iam-admin/iam?organizationId=592970437621) でポリシーをアタッチする。

#### 人とアプリの IAM

```
IAM ユーザー（人）
   ↓
Cloud Run / GCP 操作

サービスアカウント（アプリ）
   ↓
DB / Secret / API アクセス
```

#### ポリシー設計

| 区分 | 対象 | ポリシー | 権限内容（設計） |
| ---- | ---- | -------- | ---------------- |
| AWS（DX） | IAM ユーザー | Admin | フル権限（IAM 含む）。Session Manager 接続可 |
| AWS（DX） | IAM ユーザー | Infra Engineer | EC2 / RDS / S3 / CloudWatch 操作可（IAM は限定）＋ Session Manager |
| AWS（DX） | IAM ユーザー | App Engineer | ReadOnly 中心＋ S3 一部書き込み＋ Session Manager 接続 |
| AWS（VEHO） | IAM ユーザー | Admin | フル権限 |
| AWS（VEHO） | IAM ユーザー | Infra Engineer | EC2 操作 / S3 / RDS / CloudWatch フルに近い操作＋ Session Manager |
| AWS（VEHO） | IAM ユーザー | App Engineer | Operator 権限（EC2 起動停止 / S3 操作 / ログ閲覧）＋ Session Manager |
| GCP | IAM | Admin | プロジェクトオーナー（フル権限） |
| GCP | IAM | Infra Engineer | Cloud Run / Artifact Registry / Cloud SQL / Logging 管理 |
| GCP | IAM | App Engineer | Cloud Run デプロイ / ログ閲覧 / Artifact Registry 参照 |

---

### ユースケース一覧

| ユースケース          | AWS                                                                                                  | GCP                                                                                             | 主担当                           |
| --------------------- | ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ----------------------------- |
| 普段のログ確認         | **Amazon CloudWatch Logs** を確認。必要に応じて **EC2 → Session Manager** で接続し生ログ確認                            | **Cloud Run** のログを **Cloud Logging** で確認                                                        | App Engineer                  |
| デプロイ作業          | アプリを EC2 にデプロイ。必要に応じて **Session Manager** でサーバ確認、**CloudWatch Logs** でログ確認                           | **Cloud Run** にデプロイし、**Revisions** と **Cloud Logging** で確認。必要に応じて **Artifact Registry** のイメージ確認 | App Engineer                  |
| デプロイ後確認         | **CloudWatch Logs**、**Session Manager**、アプリ疎通確認                                                      | **Cloud Logging**、**Cloud Run Revisions**、アプリ疎通確認                                               | App Engineer                  |
| 不具合調査（ログ）       | **CloudWatch Logs**、必要に応じて **Session Manager** で EC2 に入りアプリ/OSログ確認                                   | **Cloud Logging**、**Cloud Run** のエラーログ確認                                                        | App Engineer                  |
| 不具合調査（サーバ/実行環境） | **Session Manager** で EC2 に入り、プロセス・メモリ・ディスク・設定確認                                                     | **Cloud Run** の設定、環境変数、サービスアカウント、**Revisions** を確認                                              | App Engineer / Infra Engineer |
| 不具合調査（DBデータ）    | **Session Manager** で EC2 に入り、EC2 上の **mysql クライアント** から **RDS/Aurora** に read-only 接続して `SELECT` 実行 | **Cloud SQL Studio** で **Cloud SQL for MySQL** に read-only 接続して `SELECT` 実行                     | App Engineer                  |
| 不具合調査（DB負荷/接続）  | **Amazon RDS** メトリクス、必要に応じて **CloudWatch** で確認                                                       | **Cloud SQL** のメトリクス、接続数、障害イベントを確認                                                              | Infra Engineer                |
| データ調査           | **Session Manager** → EC2 → **mysql クライアント** → RDS/Aurora 参照                                         | **Cloud SQL Studio** または許可済みクライアントで Cloud SQL 参照                                                | App Engineer                  |
| 環境構築            | **EC2 / RDS / S3 / CloudWatch / IAMロール** を構築・設定                                                      | **Cloud Run / Cloud SQL / Artifact Registry / Secret Manager / IAM** を構築・設定                     | Infra Engineer                |
| 設定変更            | EC2 の設定変更、S3 設定、監視設定、必要に応じて RDS 設定変更                                                                 | Cloud Run 設定、Secret、Cloud SQL 接続設定、IAM 設定変更                                                     | Infra Engineer                |
| リリース後のロールバック    | 旧バージョンへ戻し、必要に応じて **Session Manager** で確認                                                             | **Cloud Run Revisions** から旧リビジョンへ切り戻し                                                           | App Engineer / Infra Engineer |
| 権限変更            | **IAMロール / IAMグループ** を変更                                                                             | **Google Cloud IAM / Google Group** を変更                                                         | Admin / Infra Engineer        |

---

### 1. AWS

#### 1-1. 普段のログ確認

* App Engineer は **Amazon CloudWatch Logs** を使ってアプリログを確認する。
* CloudWatch に出ていないログや、生のログファイル確認が必要な場合は **Amazon EC2 コンソール → 対象インスタンス → Connect → Session Manager** から接続する。
* 接続後、アプリログ、Web サーバログ、pm2 ログ、systemd ログなどを確認する。

#### 1-2. デプロイ作業

* App Engineer がアプリのデプロイを行う。
* デプロイ後は **Amazon CloudWatch Logs** でエラー有無を確認する。
* 必要に応じて **Session Manager** で EC2 に接続し、プロセス状態や配置ファイルを確認する。

#### 1-3. デプロイ後確認

* App Engineer はアプリ疎通確認を行う。
* ログは **CloudWatch Logs** で確認する。
* サーバ内の状態確認が必要な場合は **Session Manager** で EC2 に接続する。

#### 1-4. 不具合調査（ログ）

* App Engineer はまず **CloudWatch Logs** でエラー内容、発生時刻、影響範囲を確認する。
* 詳細確認が必要な場合は **Session Manager** で EC2 に接続し、アプリログや OS ログを確認する。

#### 1-5. 不具合調査（サーバ/実行環境）

* App Engineer は **Session Manager** で EC2 に接続し、以下を確認する。

  * プロセス状態
  * メモリ使用量
  * ディスク使用量
  * 環境変数
  * 設定ファイル
* OS やミドルウェアの深い調査は Infra Engineer が担当する。

#### 1-6. 不具合調査（DBデータ）

* App Engineer は **Amazon EC2 コンソール → Connect → Session Manager** でアプリサーバまたは運用用踏み台相当の EC2 に接続する。
* EC2 上で **mysql クライアント** を使い、**Amazon RDS / Aurora MySQL** に read-only ユーザーで接続する。
* 実行可能なのは原則 `SELECT` のみとする。
* `UPDATE / DELETE / ALTER / DROP` は Infra Engineer または Admin のみ実施する。

#### 1-7. 不具合調査（DB負荷/接続）

* Infra Engineer は **Amazon RDS コンソール** で DB インスタンスの状態を確認する。
* CPU、メモリ、接続数、遅延などを確認する。
* 必要に応じて **Amazon CloudWatch** の DB 関連メトリクスも確認する。

#### 1-8. データ調査

* App Engineer は **Session Manager** で EC2 に入り、**mysql クライアント** から RDS/Aurora に read-only 接続して必要なデータを参照する。
* 調査用途に限定し、更新は行わない。

#### 1-9. 環境構築

* Infra Engineer が **EC2 / RDS / S3 / CloudWatch / IAMロール** を構築・設定する。
* App Engineer は必要に応じてアプリ配置、疎通確認、動作確認を行う。

#### 1-10. 設定変更

* Infra Engineer が EC2 の設定、監視設定、必要に応じて RDS 設定を変更する。
* App Engineer はアプリ設定や `.env` 相当の反映確認を行う。

#### 1-11. リリース後のロールバック

* App Engineer がアプリの旧バージョンへの切り戻しを行う。
* 必要に応じて **Session Manager** で EC2 に入り状態を確認する。
* インフラ変更を伴う場合は Infra Engineer が対応する。

#### 1-12. 権限変更

* Admin または Infra Engineer が **IAMロール / IAMグループ** を変更する。
* App Engineer は権限変更を直接実施しない。

---

### 2. GCP

#### 2-1. 普段のログ確認

* App Engineer は **Cloud Run** の対象サービスを開き、**Cloud Logging** でログを確認する。
* リクエストログ、アプリログ、エラーログを中心に確認する。

#### 2-2. デプロイ作業

* App Engineer が **Cloud Run** にデプロイする。
* デプロイ後は **Cloud Run Revisions** で新リビジョンを確認する。
* 必要に応じて **Artifact Registry** で対象イメージも確認する。
* ログは **Cloud Logging** で確認する。

#### 2-3. デプロイ後確認

* App Engineer は Cloud Run の疎通確認を行う。
* **Cloud Logging** でエラー有無を確認する。
* **Revisions** で期待するリビジョンが稼働しているか確認する。

#### 2-4. 不具合調査（ログ）

* App Engineer は **Cloud Logging** で Cloud Run のログを確認する。
* 5xx、例外、タイムアウト、起動失敗などを確認する。

#### 2-5. 不具合調査（実行環境）

* App Engineer は **Cloud Run** のサービス設定を確認する。
* 以下を中心に確認する。

  * 環境変数
  * Secret 参照設定
  * サービスアカウント
  * 接続先設定
  * Revisions
* 基盤や接続方式の問題は Infra Engineer が確認する。

#### 2-6. 不具合調査（DBデータ）

* App Engineer は **Google Cloud コンソール → Cloud SQL → 対象インスタンス → Cloud SQL Studio** を開く。
* **Cloud SQL for MySQL** に read-only 権限で接続し、`SELECT` のみ実行する。
* `UPDATE / DELETE / ALTER / DROP` は Infra Engineer または Admin のみ実施する。

#### 2-7. 不具合調査（DB負荷/接続）

* Infra Engineer は **Cloud SQL コンソール** で対象インスタンスを確認する。
* CPU、メモリ、接続数、障害イベント、接続異常を確認する。
* Cloud SQL 接続設定やサービスアカウント権限も必要に応じて確認する。

#### 2-8. データ調査

* App Engineer は **Cloud SQL Studio** または許可済み SQL クライアントで **Cloud SQL for MySQL** に read-only 接続して参照する。
* 調査用途に限定し、更新は行わない。

#### 2-9. 環境構築

* Infra Engineer が **Cloud Run / Cloud SQL / Artifact Registry / Secret Manager / IAM** を構築・設定する。
* App Engineer はアプリ設定、デプロイ、疎通確認を行う。

#### 2-10. 設定変更

* Infra Engineer が Cloud Run 設定、Cloud SQL 接続設定、Secret、IAM 設定を変更する。
* App Engineer はアプリ側設定や動作確認を行う。

#### 2-11. リリース後のロールバック

* App Engineer は **Cloud Run Revisions** から旧リビジョンへ切り戻す。
* ロールバック後は **Cloud Logging** で異常がないか確認する。
* DB や基盤変更を伴う場合は Infra Engineer が対応する。

#### 2-12. 権限変更

* Admin または Infra Engineer が **Google Cloud IAM** や **Google Group** の設定を変更する。
* App Engineer は権限変更を直接実施しない。
