---
id: issue-and-sp-definition
title: GitHub Issue tasks and SP logging definition
version: 0.1.0
updated: 2026-01-16
---
# Definition of Tasks That Require a GitHub Issue / Eligible for SP Logging

## Purpose

- Make tasks visible and trackable (who / what / by when / for what)
- Standardize the criteria for logging effort (SP) to reduce variance in KPIs and progress tracking

---

## Tasks That Require Creating a GitHub Issue (Default: Create One)

The following should generally have an Issue because they **leave deliverables, have dependencies or impact scope, or require estimation**.

### Covered Categories

- **Reading / Reviewing Materials**
  - Examples: reading specifications, existing implementations, PRs, logs, design docs; understanding the current state
- **Development**
  - Examples: feature additions, modifications, refactoring, configuration changes (when behavior changes)
- **Design**
  - Examples: interface design, DB design, architecture review, creating state machines / sequence diagrams, addressing design review comments
- **Testing**
  - Examples: test planning, writing E2E/integration tests, fixing tests, verification work (including reproduction and confirmation)
- **Bug Investigation**
  - Examples: root cause analysis, identifying impact scope, writing reproduction steps, deciding a fix approach
- **Technical Research**
  - Examples: library selection, PoC, performance/security validation, comparing alternatives

---

## Tasks That Do Not Require Creating a GitHub Issue (Exception: Do Not Create One)

### Production Deployment Work (Finishes Within 1 Hour)
- Examples: routine deployments with an established, repeatable procedure
- However, create an Issue if any of the following apply:
  - Deployment involves **change work** (config changes, cutover steps, data adjustments, etc.)
  - High **uncertainty** (rollback risk, coordination with stakeholders, etc.)
  - Likely to exceed 1 hour / requires multiple attempts
  - Has dependencies or requires preparation (updating runbooks, validation, release notes, etc.)


# GitHub Issue tasks and SP logging definition (Japanese)

## 目的

- タスクの可視化と追跡（誰が・何を・いつまでに・何のために）
- 工数（SP）の計上基準を統一し、KPIや進捗のブレを減らす

---

## GitHub Issue を作成する（原則：作る）

以下は **「作業成果が残る / 依存や影響範囲がある / 見積もりが必要」** ため、基本的に Issue を作成する。

### 対象カテゴリ

- **資料読み込み**
  - 例：仕様書・既存実装・PR・ログ・設計資料の読み込み、現状把握
- **開発**
  - 例：機能追加、改修、リファクタ、設定変更（動作変更を伴うもの）
- **設計**
  - 例：IF設計、DB設計、アーキ検討、状態遷移/シーケンス図作成、設計レビュー対応
- **テスト**
  - 例：テスト設計、E2E/統合テスト作成、テスト修正、検証作業（再現・確認含む）
- **不具合調査**
  - 例：原因調査、影響範囲特定、再現手順作成、修正方針の決定
- **技術調査**
  - 例：ライブラリ選定、PoC、性能/セキュリティ検証、代替案比較

---

## GitHub Issue を作成しない（例外：作らない）

### 本番へのデプロイ作業（1時間未満で終わる）
- 例：手順が確立されていて、定型で終わるデプロイ
- ただし、以下に該当する場合は Issue 化する
  - デプロイに伴う **変更作業** が発生する（設定修正、切替作業、データ調整など）
  - 失敗時のロールバックや関係者調整など **不確実性** が高い
  - 1時間を超えそう / 複数回の試行が見込まれる
  - 依存タスクや事前準備が必要（手順書更新、検証、リリースノート等）

---

# Định nghĩa các tác vụ cần tạo GitHub Issue / Được ghi nhận SP

## Mục đích

- Hiển thị hóa và theo dõi công việc (Ai / Làm gì / Khi nào xong / Vì mục đích gì)
- Chuẩn hóa tiêu chí ghi nhận nỗ lực (SP) để giảm thiểu sự sai lệch trong các chỉ số KPI và quản lý tiến độ

---

## Các tác vụ yêu cầu tạo GitHub Issue (Mặc định: Phải tạo)

Thông thường, các tác vụ sau đây cần phải có Issue vì chúng **để lại sản phẩm bàn giao (deliverables), có sự phụ thuộc hoặc ảnh hưởng đến phạm vi dự án, hoặc cần được ước tính (estimation)**.

### Danh mục áp dụng

- **Đọc / Xem xét tài liệu (Reading / Reviewing Materials)**
  - Ví dụ: đọc tài liệu đặc tả (specifications), mã nguồn hiện có, PRs, logs, tài liệu thiết kế; nắm bắt trạng thái hiện tại
- **Phát triển (Development)**
  - Ví dụ: thêm tính năng, chỉnh sửa, tái cấu trúc (refactoring), thay đổi cấu hình (khi làm thay đổi hành vi hệ thống)
- **Thiết kế (Design)**
  - Ví dụ: thiết kế giao diện, thiết kế DB, review kiến trúc, tạo sơ đồ trạng thái (state machines) / sơ đồ tuần tự (sequence diagrams), xử lý các phản hồi sau review thiết kế
- **Kiểm thử (Testing)**
  - Ví dụ: lập kế hoạch kiểm thử, viết E2E/integration tests, sửa lỗi test, thực hiện xác nhận (bao gồm tái hiện lỗi và xác nhận kết quả)
- **Điều tra lỗi (Bug Investigation)**
  - Ví dụ: phân tích nguyên nhân gốc rễ (root cause analysis), xác định phạm vi ảnh hưởng, viết các bước tái hiện lỗi, quyết định phương án khắc phục
- **Nghiên cứu kỹ thuật (Technical Research)**
  - Ví dụ: lựa chọn thư viện, PoC, xác thực hiệu năng/bảo mật, so sánh các giải pháp thay thế

---

## Các tác vụ không bắt buộc tạo GitHub Issue (Ngoại lệ: Không cần tạo)

### Công việc triển khai môi trường Production (Hoàn thành trong vòng 1 giờ)
- Ví dụ: các hoạt động triển khai định kỳ theo quy trình đã thiết lập và có tính lặp lại
- Tuy nhiên, hãy tạo Issue nếu thuộc bất kỳ trường hợp nào sau đây:
  - Việc triển khai bao gồm **công việc thay đổi** (thay đổi cấu hình, các bước chuyển đổi (cutover), điều chỉnh dữ liệu, v.v.)
  - Có tính **không chắc chắn** cao (rủi ro rollback, cần điều phối với các bên liên quan, v.v.)
  - Có khả năng kéo dài quá 1 giờ / cần thực hiện nhiều lần
  - Có các sự phụ thuộc hoặc yêu cầu chuẩn bị (cập nhật runbooks, xác thực, viết release notes, v.v.)
