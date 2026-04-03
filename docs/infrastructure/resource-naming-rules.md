---
sidebar_position: 10
id: resource-naming-rules
title: リソース命名ルール
---

Tài liệu được sắp xếp theo thứ tự **Tiếng Việt → English → 日本語**.  
This document is organized as **Vietnamese → English → Japanese**.  
このドキュメントは **ベトナム語 → 英語 → 日本語** の順で構成しています。

---

# Tiếng Việt

*Vietnamese / ベトナム語*

## Quy tắc đặt tên tài nguyên

Quy tắc thống nhất cách đặt tên để nhận biết ngay khách hàng, hệ thống và môi trường, phục vụ tìm kiếm, tự động hóa và tách quyền.

## Mẫu cơ bản

**Dạng lõi** (tiền tố / hậu tố theo loại tài nguyên sẽ thêm riêng):

```
{tên-khách-hàng}-{tên-hệ-thống}-{môi-trường}
```

| Thành phần | Mô tả | Ví dụ |
|------------|-------|-------|
| Tên khách hàng | Mã nội bộ hoặc tên viết tắt của khách hàng / bên ký hợp đồng | `centlex` |
| Tên hệ thống | Định danh theo sản phẩm hoặc dịch vụ | `atmtc` |
| Môi trường | Nơi triển khai | `dev` / `stg` / `prod` |

**Viết tắt môi trường (cố định)**

| Giá trị | Ý nghĩa |
|---------|---------|
| `dev` | Phát triển, kiểm thử |
| `stg` | Staging (kiểm thử tích hợp gần giống production) |
| `prod` | Production |

## Quy tắc chuẩn hóa chung

Áp dụng trong phạm vi cho phép của từng nền tảng:

1. **Ưu tiên chữ thường tiếng Anh và dấu gạch ngang (`-`)**  
   Chữ hoa, khoảng trắng, tiếng Nhật: thay bằng quy tắc riêng nếu nền tảng không cho phép hoặc theo thông lệ.
2. **Xác định trước một dạng chuẩn cho tên khách hàng và hệ thống, dùng thống nhất trên mọi tài nguyên**  
   Tránh lệch dạng viết tắt (`Centlex` / `centlex` / `CENTLEX`).
3. **Tên phải phân biệt rõ production (`prod`) và không phải production**  
   Giảm nhầm lẫn và kết nối sai.
4. **Tránh tên quá dài**  
   Tuân thủ giới hạn độ dài (ví dụ project ID GCP 30 ký tự); giữ tên hệ thống ngắn gọn.

## AWS (S3, EC2, v.v.)

### Bucket S3

- Vì **toàn cầu duy nhất** và **tương thích DNS**, nên thêm tiền tố tổ chức / mục đích để giảm trùng.
- **Khuyến nghị**: `{org-hoặc-viết-tắt}-{khách-hàng}-{hệ-thống}-{môi-trường}-{mục-đích}`  
  Ví dụ: `veho-centlex-atmtc-prod-app-assets`
- Tên bucket: **chữ thường, số, gạch ngang** (không dấu gạch dưới). **Tối đa 63 ký tự**.
- Có thể thêm hậu tố như `-logs`, `-backup`.

### EC2 (tên instance, security group, tag)

- **Tag Name / tên hiển thị**: dạng lõi + vai trò.  
  Ví dụ: `centlex-atmtc-prod-web`, `centlex-atmtc-stg-bastion`
- **Security group**: `{khách-hàng}-{hệ-thống}-{môi-trường}-{vai-trò}-sg`  
  Ví dụ: `centlex-atmtc-prod-web-sg`
- Bắt buộc tag `Customer`, `System`, `Environment` giúp gom chi phí và giám sát.

### AWS khác (RDS, ALB, v.v.)

- Dịch vụ **không cho phép gạch ngang hoặc giới hạn chặt**: dùng **gạch dưới**.  
  Ví dụ: `centlex_atmtc_prod` (theo thông lệ identifier instance RDS).

## PM2 (tên process / ứng dụng)

- **Khuyến nghị**: `{khách-hàng}-{hệ-thống}-{môi-trường}`; nếu **trong cùng một hệ thống có nhiều process** (API, worker, v.v.) thì thêm `-api` / `-worker`.  
  Ví dụ: `centlex-atmtc-prod-api`, `centlex-atmtc-prod-worker`
- Trong `ecosystem.config`, trường `name` và đường log / script deploy dùng **cùng một chuỗi**.
- **Tên process cho production (`prod`) phải có tên môi trường** để không nhầm với dev / kiểm thử.

## Tên repository GitHub

Giới hạn GitHub: **tối đa 100 ký tự**, ASCII **chữ số, chữ cái, gạch ngang, gạch dưới, dấu chấm** (một số ký tự đầu/cuối không được). **Không phân biệt hoa thường** khi so khớp (hiển thị có thể giữ hoa thường).

### Quy tắc khuyến nghị

| Hướng | Dạng | Ví dụ |
|-------|------|-------|
| **Repo theo khách hàng** | `{khách-hàng}-{hệ-thống}` (**không** gắn môi trường; tách bằng branch / biến môi trường) | `centlex-atmtc` |
| **Monorepo** | `{khách-hàng}-{hệ-thống}` hoặc `{khách-hàng}-{hệ-thống-cha}` | `centlex-atmtc` |
| **Thư viện dùng chung nội bộ** | Tiền tố tổ chức `veho-{mục-đích}` | `veho-auth-lib` |

**Vì sao không đưa môi trường vào tên repo**: một codebase thường dùng chung cho dev / stg / prod; môi trường tách bằng **cấu hình deploy, Secrets, chiến lược branch**.

- Chia nhiều repo: thống nhất hậu tố `-api`, `-web`, `-infra`.
- Tên khách hàng và hệ thống: **chữ thường và gạch ngang**.

## Tên cơ sở dữ liệu (DB)

Nhiều RDBMS với identifier **không đặt trong ngoặc kép** thường **không cho gạch ngang**; khuyến nghị **gạch dưới**.

### Dạng khuyến nghị

```
{tên_khách_hàng}_{tên_hệ_thống}_{môi_trường}
```

Ví dụ: `centlex_atmtc_prod`, `centlex_atmtc_stg`

### Ghi chú

- **PostgreSQL**: identifier không ngoặc bị cắt **63 byte**. Định nghĩa dạng rút gọn nếu cần.
- **MySQL**: chú ý giới hạn độ dài (thường 64 ký tự).
- **Nhiều DB trên cùng instance**: cùng quy tắc.
- **Tách môi trường bằng schema**: có thể chỉ dùng `{khách_hàng}_{hệ_thống}` cho tên DB; ghi rõ chính sách schema `dev` / `stg` / `prod`.

## Tên tài khoản thanh toán GCP (tên hiển thị)

Người thường chọn billing account trên console; ưu tiên **dễ đọc** và tiền tố để **sắp xếp danh sách**.

### Dạng khuyến nghị

```
{tên khách hàng (chính thức hoặc hợp đồng)} - {bổ sung mục đích / hệ thống}
```

Ví dụ: `Centlex株式会社 - ATMTC`, `Centlex - ATMTC（拡張機能）`

### Ghi chú

- **Billing account ID** do GCP cấp; quy tắc đặt tên chủ yếu áp dụng cho **tên hiển thị**.
- Nhiều billing cho một khách: **đặt tên khách ở đầu** để dễ tìm.
- Nên có **một bảng tra** mã nội bộ (`centlex`) ↔ tên chính thức trên Wiki hoặc bảng tính.

## Tên dự án GCP

### Project ID (toàn cầu duy nhất, không đổi)

Tóm tắt ràng buộc:

- **6–30 ký tự**
- **Chữ thường, số, gạch ngang**
- **Ký tự đầu là chữ cái**
- **Không nên kết thúc bằng gạch ngang**

Khi **tách project theo môi trường**, khuyến nghị:

```
{khách-hàng}-{hệ-thống}-{môi-trường}
```

Ví dụ: `centlex-atmtc-dev`, `centlex-atmtc-stg`, `centlex-atmtc-prod`  
(Rút gọn tên khách / hệ thống nếu vượt 30 ký tự.)

### Tên hiển thị project

Lỏng hơn ID; có thể ghi **cách đọc đầy đủ** để khỏi nhầm trên console.

Ví dụ: `Centlex ATMTC (Production)`

### Ghi chú

- **Một project chứa nhiều môi trường**: ID có thể không gắn môi trường, ví dụ `centlex-atmtc`; ghi rõ chính sách **tách môi trường bằng network / naming**.
- Nếu tổ chức bắt buộc **tiền tố project ID** (ví dụ `veho-`), ưu tiên quy tắc đó.

## Vận hành bảng tra

Gom **tên hiển thị**, **mã viết tắt (chữ thường)** và **tên pháp nhân** của khách vào **một bảng**; dùng cùng mã trên S3, GitHub, GCP để ổn định vận hành.

| Mục | Ví dụ |
|-----|-------|
| Mã khách (tài nguyên) | `centlex` |
| Mã hệ thống | `atmtc` |
| Repo GitHub | `centlex-atmtc` |
| Tên DB (prod) | `centlex_atmtc_prod` |
| GCP project ID (prod) | `centlex-atmtc-prod` (rút gọn nếu dài) |
| Tên hiển thị billing GCP | `Centlex株式会社 - ATMTC` |

## Lịch sử thay đổi

| Ngày | Nội dung |
|------|----------|
| 2026-04-03 | Bản đầu |
| 2026-04-03 | Thống nhất ví dụ khách `centlex`, hệ thống `atmtc` |
| 2026-04-03 | PM2: đổi diễn đạt từ host sang hệ thống; thống nhất prod/dev theo môi trường |

---

# English

*English / 英語*

## Resource naming rules

Conventions to keep names consistent so customer, system, and environment are obvious—supporting search, automation, and access separation.

## Core pattern

**Core form** (add resource-type prefixes/suffixes separately):

```
{customer}-{system}-{environment}
```

| Part | Description | Example |
|------|-------------|---------|
| Customer | Internal code or short name for the contracting customer | `centlex` |
| System | Product or service identifier | `atmtc` |
| Environment | Deployment target | `dev` / `stg` / `prod` |

**Environment abbreviations (fixed)**

| Value | Meaning |
|-------|---------|
| `dev` | Development and verification |
| `stg` | Staging (integration testing close to production) |
| `prod` | Production |

## Shared normalization rules

Apply wherever the platform allows:

1. **Prefer lowercase Latin letters and hyphens (`-`)**  
   Replace uppercase, spaces, or Japanese when the platform forbids them or by local convention.
2. **Define one canonical spelling for customer and system names and reuse it everywhere**  
   Avoid drift (`Centlex` / `centlex` / `CENTLEX`).
3. **Names must clearly separate production (`prod`) from non-production**  
   Reduces mistaken operations and connections.
4. **Avoid overly long names**  
   Respect limits (e.g. GCP project ID 30 characters); keep system names short.

## AWS (S3, EC2, etc.)

### S3 buckets

- **Globally unique** and **DNS-compatible** names; add an org or purpose prefix to reduce collisions.
- **Recommended**: `{org-or-short}-{customer}-{system}-{environment}-{purpose}`  
  Example: `veho-centlex-atmtc-prod-app-assets`
- Bucket names: **lowercase letters, digits, hyphens only** (no underscores). **Max 63 characters**.
- Optional suffixes such as `-logs`, `-backup`.

### EC2 (instance names, security groups, tags)

- **Name tag / display name**: core pattern plus role.  
  Examples: `centlex-atmtc-prod-web`, `centlex-atmtc-stg-bastion`
- **Security group**: `{customer}-{system}-{environment}-{role}-sg`  
  Example: `centlex-atmtc-prod-web-sg`
- Require tags `Customer`, `System`, `Environment` for cost and monitoring rollups.

### Other AWS (RDS, ALB, etc.)

- Services that **disallow hyphens or have strict limits**: use **underscores**.  
  Example: `centlex_atmtc_prod` (RDS DB instance identifier convention).

## PM2 (process / app names)

- **Recommended**: `{customer}-{system}-{environment}`; if **multiple processes exist in the same system** (e.g. API vs worker), add `-api` / `-worker`.  
  Examples: `centlex-atmtc-prod-api`, `centlex-atmtc-prod-worker`
- Use the **same string** in `ecosystem.config` `name`, log paths, and deploy scripts.
- **Production (`prod`) process names must include the environment** so they are not confused with dev / test.

## GitHub repository names

GitHub limits: **100 characters max**, ASCII **letters, digits, hyphen, underscore, period** (some leading/trailing characters invalid). **Case-insensitive** matching (display case may be preserved).

### Recommended rules

| Approach | Pattern | Example |
|----------|---------|---------|
| **Per-customer repos** | `{customer}-{system}` (**no** environment in the name; separate via branches / env vars) | `centlex-atmtc` |
| **Monorepo** | `{customer}-{system}` or `{customer}-{parent-system}` | `centlex-atmtc` |
| **Shared internal libraries** | Org prefix `veho-{purpose}` | `veho-auth-lib` |

**Why omit environment from repo names**: one codebase usually spans dev / stg / prod; separate environments with **deploy config, Secrets, and branch strategy**.

- If splitting repos, align suffixes: `-api`, `-web`, `-infra`.
- Customer and system names: **lowercase and hyphens**.

## Database names

Many RDBMS **unquoted identifiers** **do not allow hyphens**; prefer **underscores**.

### Recommended form

```
{customer}_{system}_{environment}
```

Examples: `centlex_atmtc_prod`, `centlex_atmtc_stg`

### Notes

- **PostgreSQL**: unquoted identifiers truncate at **63 bytes**. Define short forms if needed.
- **MySQL**: mind identifier length limits (often 64 characters).
- **Multiple databases on one instance**: same rules.
- **Environment via schema**: DB name may be `{customer}_{system}` only; document policy for schemas `dev` / `stg` / `prod`.

## GCP billing account name (display name)

People often pick billing accounts in the console; prioritize **readability** and a **sortable prefix**.

### Recommended form

```
{customer (legal or contract name)} - {purpose or system note}
```

Examples: `Centlex株式会社 - ATMTC`, `Centlex - ATMTC（拡張機能）`

### Notes

- **Billing account IDs** are assigned by GCP; naming rules mainly apply to the **display name**.
- Multiple billings per customer: **lead with the customer name** for easier search.
- Keep a **single mapping table** of internal code (`centlex`) ↔ legal name on the wiki or a spreadsheet.

## GCP project names

### Project ID (globally unique, immutable)

Key constraints:

- **6–30 characters**
- **Lowercase letters, digits, hyphens**
- **Must start with a letter**
- **Avoid a trailing hyphen**

When **splitting projects by environment**, recommended:

```
{customer}-{system}-{environment}
```

Examples: `centlex-atmtc-dev`, `centlex-atmtc-stg`, `centlex-atmtc-prod`  
(Shorten customer/system if you exceed 30 characters.)

### Project display name

More flexible than the ID; you may use a **full readable label** on the console.

Example: `Centlex ATMTC (Production)`

### Notes

- **Multiple environments in one project**: ID may omit environment, e.g. `centlex-atmtc`; document **separation via network and naming**.
- If org policy requires a **project ID prefix** (e.g. `veho-`), follow that rule.

## Operating a mapping table

Maintain one table for the customer’s **display name**, **lowercase code**, and **legal name**; reuse the same short codes on S3, GitHub, and GCP for stable operations.

| Item | Example |
|------|---------|
| Customer code (resources) | `centlex` |
| System code | `atmtc` |
| GitHub repository | `centlex-atmtc` |
| DB name (prod) | `centlex_atmtc_prod` |
| GCP project ID (prod) | `centlex-atmtc-prod` (shorten if long) |
| GCP billing display name | `Centlex株式会社 - ATMTC` |

## Revision history

| Date | Change |
|------|--------|
| 2026-04-03 | Initial version |
| 2026-04-03 | Examples unified to customer `centlex`, system `atmtc` |
| 2026-04-03 | PM2: wording from host to system; prod/dev phrasing aligned to environments |

---

# 日本語

*Japanese / 日本語*

## リソース命名ルール

顧客・システム・環境が一目で分かり、検索・自動化・権限分離に使えるよう、命名を揃えるためのルールです。

## 基本パターン

**コア形式**（リソース種別のプレフィックスやサフィックスは別途付与）:

```
{顧客名}-{システム名}-{環境}
```

| 要素 | 説明 | 例 |
|------|------|-----|
| 顧客名 | 契約主体・顧客の識別子（社内コードや略称） | `centlex` |
| システム名 | プロダクト／サービス単位の識別子 | `atmtc` |
| 環境 | デプロイ先 | `dev` / `stg` / `prod` |

**環境の略語（固定）**

| 値 | 意味 |
|----|------|
| `dev` | 開発・検証 |
| `stg` | ステージング（本番相当の結合試験） |
| `prod` | 本番 |

## 共通の正規化ルール

どのリソースでも、可能な範囲で次を守ります。

1. **英小文字とハイフン（`-`）を基本とする**  
   大文字・スペース・日本語は、プラットフォームが許さない場合や慣習に合わせて別ルール（後述）に置き換える。
2. **顧客名・システム名は事前に「正規形」を1つ決め、全リソースで同じ綴りを使う**  
   略称の揺れ（`Centlex` / `centlex` / `CENTLEX`）を防ぐ。
3. **本番（`prod`）と非本番を名前から必ず区別できるようにする**  
   誤操作・誤接続を防ぐため。
4. **長すぎる名前は避ける**  
   各クラウド・ツールの上限（プロジェクトID 30 文字など）に合わせ、システム名は短く保つ。

## AWS（S3・EC2 など）

### S3 バケット

- **グローバルで一意**かつ **DNS 互換**の制約があるため、プレフィックスで用途や組織を付けると衝突しにくい。
- **推奨**: `{orgまたは略称}-{顧客名}-{システム名}-{環境}-{用途}`  
  例: `veho-centlex-atmtc-prod-app-assets`
- バケット名は **小文字・数字・ハイフンのみ**（アンダースコア不可）。**63 文字以内**。
- ログバケットなど用途が分かる語尾（`-logs`, `-backup`）を付けてもよい。

### EC2（インスタンス名・セキュリティグループ・タグ）

- **Name タグ / 表示名**: コア形式に役割を足す。  
  例: `centlex-atmtc-prod-web`, `centlex-atmtc-stg-bastion`
- **セキュリティグループ**: `{顧客名}-{システム名}-{環境}-{役割}-sg`  
  例: `centlex-atmtc-prod-web-sg`
- リソースは **タグ**で `Customer`, `System`, `Environment` を必須にすると、コスト・監視の集計がしやすい。

### その他 AWS（RDS・ALB など）

- 識別子に **ハイフンが使えない／制限が厳しい** サービスは、**アンダースコア**に置き換える。  
  例: `centlex_atmtc_prod`（RDS DB インスタンス識別子の慣習に合わせる）。

## PM2（プロセス名・アプリ名）

- **推奨**: `{顧客名}-{システム名}-{環境}` に、**同一システム内で複数プロセス**（API・ワーカーなど役割が分かれる場合）があるときは `-api` / `-worker` などを付与。  
  例: `centlex-atmtc-prod-api`, `centlex-atmtc-prod-worker`
- `ecosystem.config` 内の `name` とログパス・デプロイスクリプトで **同じ文字列**を参照する。
- **本番（`prod`）向けのプロセス名では環境名を必ず含め**、開発・検証（`dev` など）と混同しないようにする。

## GitHub リポジトリ名

GitHub の制約: **100 文字以内**、ASCII の **英数字・ハイフン・アンダースコア・ピリオド**（先頭末尾の一部文字は不可）。**大文字小文字は区別されない**（表示は維持される）。

### 推奨ルール

| 方針 | 形式 | 例 |
|------|------|-----|
| **顧客ごとにリポジトリを分ける** | `{顧客名}-{システム名}`（環境は **含めない**。ブランチ・環境変数で分離） | `centlex-atmtc` |
| **モノレポ** | `{顧客名}-{システム名}` または `{顧客名}-{親システム名}` | `centlex-atmtc` |
| **社内共通ライブラリ** | `veho-{用途}` など組織プレフィックス | `veho-auth-lib` |

**環境をリポジトリ名に含めない理由**: 同一コードベースを dev / stg / prod で共有するのが一般的なため。環境は **デプロイ設定・Secrets・ブランチ戦略**で区別する。

- 複数リポジトリに分割する場合は、サフィックスで役割を揃える: `-api`, `-web`, `-infra`。
- 顧客名・システム名は **小文字とハイフン**に統一する。

## データベース名（DB 名）

RDBMS により **引用符なし識別子**では **ハイフン不可**なことが多いため、**アンダースコア区切り**を推奨する。

### 推奨形式

```
{顧客名}_{システム名}_{環境}
```

例: `centlex_atmtc_prod`, `centlex_atmtc_stg`

### 補足

- **PostgreSQL**: 未引用の識別子は **63 バイト**に丸められる。長い名前は短縮形を定義する。
- **MySQL**: 識別子長の上限に注意（通常 64 文字）。
- **同一インスタンス内で複数 DB** を使う場合も、上記と同じ規則で統一する。
- **スキーマで環境を分ける**運用の場合は、DB 名は `{顧客名}_{システム名}` のみとし、スキーマを `dev` / `stg` / `prod` にするか、方針をドキュメントで固定する。

## GCP 請求先名（表示名）

請求先は **人がコンソールで選ぶ**ことが多いため、**読みやすさ**を優先しつつ、一覧で並べやすい先頭プレフィックスを付ける。

### 推奨形式

```
{顧客名（正式または契約名）} - {用途やシステムの補足}
```

例: `Centlex株式会社 - ATMTC`, `Centlex - ATMTC（拡張機能）`

### 補足

- **請求先 ID** は GCP が採番するため、命名ルールの対象は主に **「請求先アカウントの表示名」**。
- 複数請求先がある顧客は、**顧客名を先頭に**そろえると検索しやすい。
- 社内コード（`centlex`）と正式名称の対応表を Wiki やスプレッドシートで一元管理するとよい。

## GCP プロジェクト名

### プロジェクト ID（グローバル一意・変更不可）

制約の要点:

- **6〜30 文字**
- **小文字の英字・数字・ハイフン**
- **先頭は英字**
- **末尾をハイフンにしない**のが無難

環境ごとに **プロジェクトを分ける**場合の推奨:

```
{顧客名}-{システム名}-{環境}
```

例: `centlex-atmtc-dev`, `centlex-atmtc-stg`, `centlex-atmtc-prod`  
（30 文字に収まるよう、顧客名・システム名は短い略称にする。）

### プロジェクト名（表示名）

ID より緩いが、コンソールで迷わないよう **正式な読み方**を書いてよい。

例: `Centlex ATMTC (Production)`

### 補足

- **1 プロジェクトに複数環境を載せる**構成の場合は、ID に環境を含めず `centlex-atmtc` のようにし、**ネットワークや命名で環境分離**する方針を明文化する。
- 組織ポリシーで **プロジェクト ID のプレフィックス**（例: `veho-`）を必須にしている場合は、そのルールを優先する。

## 対応表の運用

顧客の「表示名」「略称（英小文字）」「正式社名」を **1 枚の対応表**にし、S3・GitHub・GCP で同じ略称を使うと運用が安定します。

| 項目 | 例 |
|------|-----|
| 顧客略称（リソース用） | `centlex` |
| システム略称 | `atmtc` |
| GitHub リポジトリ | `centlex-atmtc` |
| DB 名（prod） | `centlex_atmtc_prod` |
| GCP プロジェクト ID（prod） | `centlex-atmtc-prod`（長い場合は短縮） |
| GCP 請求先表示名 | `Centlex株式会社 - ATMTC` |

## 変更履歴

| 日付 | 内容 |
|------|------|
| 2026-04-03 | 初版 |
| 2026-04-03 | 例を顧客 `centlex`・システム `atmtc` に統一 |
| 2026-04-03 | PM2: 複数プロセスの説明を「ホスト」から「システム」に修正。本番／開発の表記を環境ベースに統一 |
| 2026-04-03 | ベトナム語・英語・日本語の3言語構成に再編 |
