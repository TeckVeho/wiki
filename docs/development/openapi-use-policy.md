---
title: OpenAI API usage policy
---

Tài liệu được sắp xếp theo thứ tự **Tiếng Việt → English → 日本語**.  
This document is organized as **Vietnamese → English → Japanese**.  
このドキュメントは **ベトナム語 → 英語 → 日本語** の順で構成しています。

---

# Tiếng Việt

*Vietnamese / ベトナム語*

## OpenAI API — Chính sách sử dụng

### Mục đích

Để quản lý khối lượng sử dụng, chi phí và bảo mật OpenAI API một cách phù hợp, quy định các nguyên tắc cơ bản về API key, Project và lựa chọn model.

### Nguyên tắc cơ bản

Khi sử dụng OpenAI API, nguyên tắc quản lý theo các đơn vị sau.

* **Tạo OpenAI Project riêng cho từng hệ thống / dự án**
* **Tạo API key theo từng môi trường**

  * prod
  * stg
  * dev

Ví dụ:

| Đơn vị            | Ví dụ                 |
| ----------------- | --------------------- |
| OpenAI Project    | `{project-name}`      |
| API Key (prod)    | `{project-name}-prod` |
| API Key (stg)     | `{project-name}-stg`  |
| API Key (dev)     | `{project-name}-dev`  |

Không được dùng chung một API key cho nhiều hệ thống vì sẽ không theo dõi được hệ thống nào dùng model nào và mức độ sử dụng ra sao.

### Quy tắc quản lý API key

* Không dùng API key cá nhân cho hệ thống production
* Không dùng chung một API key giữa nhiều hệ thống
* Không dùng chung một API key giữa prod / stg / dev
* Không ghi API key trực tiếp vào mã nguồn
* Không dán API key dạng plaintext lên GitHub, Slack hoặc tài liệu
* Quản lý API key qua Secret Manager / GitHub Secrets / biến môi trường, v.v.

### Khóa phát triển cá nhân (local)

* Khóa OpenAI API dùng cho phát triển và kiểm tra cục bộ được **phát hành riêng cho từng cá nhân**
* Khóa cá nhân phát triển được quản lý trong OpenAI Project **`local-development`**
* Đặt tên khóa sao cho nhận biết được người (ví dụ: `kosuke-kido-local`)
* Khóa cá nhân **chỉ** dùng cho phát triển và kiểm tra trên máy cục bộ của chính người đó
* Không chia sẻ khóa cá nhân giữa nhiều người
* Không dán khóa cá nhân lên GitHub, Slack, tài liệu, v.v.
* Không dùng khóa cá nhân trên môi trường máy chủ như dev / stg / prod
* Trên máy chủ, dùng API key được phát hành **theo từng dự án và từng môi trường**
* Khi cần API key cho môi trường máy chủ, **liên hệ PM để được phát hành**

### Quy trình khi bắt đầu sử dụng mới

1. Tạo OpenAI Project
2. Tạo API key cho từng môi trường
3. Quyết định model sử dụng
4. Cấu hình API key và tên model vào Secret / biến môi trường
5. Kiểm tra hoạt động
6. Xác nhận trên Usage rằng lượng dùng được ghi nhận đúng Project

### Quy trình chuyển đổi hệ thống hiện có

Nếu đang dùng chung API key giữa các hệ thống, chuyển đổi theo thứ tự sau.

1. Xác định API key đang dùng
2. Liệ kê các hệ thống đang dùng API key đó
3. Tạo OpenAI Project riêng cho từng hệ thống
4. Tạo API key mới cho từng môi trường
5. Thay Secret / biến môi trường sang key mới
6. Kiểm tra hoạt động
7. Xác nhận Usage được ghi vào Project mới
8. Xóa API key cũ

### Chính sách chọn model

Chọn model theo cân bằng giữa mục đích, chất lượng và chi phí.

#### Quy tắc cơ bản

* Không dùng model quá cũ hoặc đã deprecated
* Với chat thông thường, tóm tắt, phân loại, trích xuất: **ưu tiên model nhẹ như mini / nano**
* Model hiệu năng cao chỉ dùng khi thực sự cần (suy luận phức tạp, thiết kế, sinh code, v.v.)
* Nếu dùng model hiệu năng cao trên prod: xác nhận mục đích, lý do và chi phí dự kiến
* Không hard-code tên model trong code; quản lý qua biến môi trường hoặc file cấu hình

Ví dụ:

```env
OPENAI_MODEL=gpt-4.1-mini
OPENAI_API_KEY=xxxx
```

### Tóm tắt

Khi dùng OpenAI API, nguyên tắc như sau.

* **Tách OpenAI Project theo hệ thống / dự án**
* **Tách API key theo môi trường**
* **Không dùng chung API key**
* **Quản lý API key qua Secret / biến môi trường**
* **Ưu tiên model nhẹ cho use case thông thường**
* **Không dùng model cũ / deprecated**
* **Theo dõi Usage theo Project / API key**
* **Khóa phát triển cá nhân: một người một key trong Project `local-development`, chỉ dùng local; trên máy chủ dùng key theo dự án/môi trường và xin PM phát hành**

---

# English

*English / 英語*

## OpenAI API usage policy

### Purpose

This policy defines basic rules for API keys, OpenAI Projects, and model selection so that usage, cost, and security of the OpenAI API are managed appropriately.

### Basic principles

When using the OpenAI API, manage resources along the following lines.

* **Create one OpenAI Project per system / project**
* **Create API keys per environment**

  * prod
  * stg
  * dev

Examples:

| Scope           | Example               |
| --------------- | --------------------- |
| OpenAI Project  | `{project-name}`      |
| prod API key    | `{project-name}-prod` |
| stg API key     | `{project-name}-stg`  |
| dev API key     | `{project-name}-dev`  |

Sharing one API key across systems is prohibited because it prevents attributing usage and model consumption per system.

### API key management rules

* Do not use personal API keys for production systems
* Do not reuse the same API key across multiple systems
* Do not reuse the same API key across prod / stg / dev
* Do not embed API keys directly in source code
* Do not paste API keys in plaintext on GitHub, Slack, or documentation
* Store API keys in Secret Manager, GitHub Secrets, environment variables, or equivalent

### Personal development keys (local)

* **Issue OpenAI API keys per individual** for local development and verification
* Manage personal development keys under the OpenAI **`local-development`** project
* Name keys so the owner is identifiable (for example: `kosuke-kido-local`)
* Personal keys are **limited** to development and verification on that person's local PC only
* Do not share personal keys among multiple people
* Do not paste personal keys into GitHub, Slack, documentation, or similar
* Do not use personal keys on server environments such as dev / stg / prod
* On servers, use API keys issued **per project and per environment**
* When an API key is needed for a server environment, **request issuance from the PM**

### Steps for new adoption

1. Create an OpenAI Project
2. Create API keys per environment
3. Decide which models to use
4. Configure the API key and model name in secrets / environment variables
5. Run verification tests
6. Confirm on Usage that consumption is recorded for the intended Project

### Migration from existing setups

If keys are currently shared, migrate in this order.

1. Identify the API keys in use
2. List all systems using those keys
3. Create one OpenAI Project per system
4. Create new API keys per environment
5. Point secrets / environment variables to the new keys
6. Verify behavior
7. Confirm Usage is attributed to the new Projects
8. Revoke the old API keys

### Model selection policy

Choose models based on use case, quality, and cost.

#### Basic rules

* Do not use outdated or deprecated models
* For typical chat, summarization, classification, and extraction, **prefer lighter models such as mini / nano variants**
* Use high-capability models only when needed (complex reasoning, design, code generation, etc.)
* For high-capability models in prod, confirm purpose, rationale, and expected cost
* Do not hard-code model names; manage them via environment variables or configuration files

Example:

```env
OPENAI_MODEL=gpt-4.1-mini
OPENAI_API_KEY=xxxx
```

### Summary

When using the OpenAI API, follow these principles.

* **Separate OpenAI Projects per system / project**
* **Separate API keys per environment**
* **Do not share API keys across systems or environments**
* **Manage API keys via secrets / environment variables**
* **Prefer lighter models for routine workloads**
* **Do not use old or deprecated models**
* **Keep Usage traceable per Project / API key**
* **Personal keys: one per person under `local-development`, local PC only; on servers use per-project/environment keys and request issuance from the PM**

---

# 日本語

*Japanese / 日本語*

## OpenAI API 利用方針

### 目的

OpenAI API の利用量・費用・セキュリティを適切に管理するため、APIキー・Project・モデル選定の基本方針を定める。

### 基本方針

OpenAI API を利用する場合は、原則として以下の単位で分けて管理する。

* **システム / プロジェクトごとに OpenAI Project を作成する**
* **環境ごとに APIキーを作成する**

  * prod
  * stg
  * dev

例：

| 単位             | 例                     |
| -------------- | --------------------- |
| OpenAI Project | `{project-name}`      |
| prod API Key   | `{project-name}-prod` |
| stg API Key    | `{project-name}-stg`  |
| dev API Key    | `{project-name}-dev`  |

APIキーを複数システムで使い回すと、どのシステムがどのモデルをどの程度利用したか分からなくなるため、使い回しは禁止する。

### APIキー管理ルール

* 個人のAPIキーを本番システムで利用しない
* 複数システムで同じAPIキーを使い回さない
* prod / stg / dev で同じAPIキーを使い回さない
* APIキーをソースコードに直接書かない
* APIキーをGitHub、Slack、ドキュメントに平文で貼らない
* APIキーは Secret Manager / GitHub Secrets / 環境変数などで管理する

### 個人開発用キー（ローカル開発・検証）

* ローカル開発・検証で使用する OpenAI APIキーは、**個人ごとに発行する**
* 開発用の個人キーは、OpenAI の **`local-development`** プロジェクト配下で管理する
* キー名は、個人名が分かる形式にする（例：`kosuke-kido-local`）
* 個人キーは、**本人のローカルPC**での開発・検証用途に限定する
* 個人キーを複数人で共有しない
* 個人キーを GitHub、Slack、ドキュメントなどに貼り付けない
* dev / stg / prod などの**サーバー環境**では、個人キーを使用しない
* サーバー環境では、**各プロジェクト・各環境ごとに発行された** APIキーを使用する
* APIキーが必要な場合は、**PMに発行を依頼する**

### 新規利用時の手順

1. OpenAI Project を作成する
2. 環境ごとに APIキーを作成する
3. 利用モデルを決める
4. Secret / 環境変数に APIキーとモデル名を設定する
5. 動作確認する
6. Usage 上で対象 Project に利用量が計上されていることを確認する

### 既存システムの移行手順

既存システムでAPIキーを使い回している場合は、以下の順で移行する。

1. 現在利用しているAPIキーを確認する
2. そのAPIキーを利用しているシステムを洗い出す
3. システムごとに OpenAI Project を作成する
4. 環境ごとに新しいAPIキーを作成する
5. Secret / 環境変数を新しいキーに置き換える
6. 動作確認する
7. 新しい Project に Usage が計上されていることを確認する
8. 旧APIキーを削除する

### モデル選定方針

モデルは、用途・品質・コストのバランスで選定する。

#### 基本ルール

* 古すぎるモデル、非推奨モデルは使わない
* 通常のチャット、要約、分類、抽出では **mini / nano 系など軽量モデルを優先**する
* 高性能モデルは、複雑な推論・設計・コード生成など、必要性がある場合に利用する
* prod で高性能モデルを使う場合は、用途・理由・想定コストを確認する
* モデル名はコードにベタ書きせず、環境変数や設定ファイルで管理する

例：

```env
OPENAI_MODEL=gpt-4.1-mini
OPENAI_API_KEY=xxxx
```

### まとめ

OpenAI API 利用時は、以下を原則とする。

* **システム / プロジェクトごとに OpenAI Project を分ける**
* **環境ごとに APIキーを分ける**
* **APIキーを使い回さない**
* **APIキーは Secret / 環境変数で管理する**
* **通常用途では軽量モデルを優先する**
* **古いモデル・非推奨モデルは使わない**
* **Usage を Project / APIキー単位で追跡できる状態にする**
* **個人開発用キーは `local-development` 配下で個人ごとに発行しローカル限定とする；サーバーではプロジェクト／環境ごとのキーを使い、必要時は PM に発行を依頼する**
