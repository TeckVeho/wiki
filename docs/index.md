---
sidebar_position: 0
id: index
title: Veho Wiki
---

# Veho Wiki

**Tiếng Việt:** Đây là kho tài liệu nội bộ của Veho: quy trình phát triển, quy tắc cho AI hỗ trợ, vận hành GitHub và cấu hình hạ tầng.

**English:** This is Veho’s internal knowledge base covering development practices, AI-assisted workflows, GitHub operations, and infrastructure guides.

**日本語:** Veho のナレッジベースです。開発プロセス・AI 駆動開発・GitHub 運用・インフラ設定などのドキュメントをまとめています。

---

## Development — Phát triển — 開発

Quy trình & quy tắc phát triển / Development process & rules / 開発プロセスとルール全般

| Document | Tiếng Việt | English | 日本語 |
| -------- | ---------- | ------- | ------ |
| [basic-workflow](development/basic-workflow) | Quy trình dev cơ bản (Issue → branch → PR → merge), không phụ thuộc AI | Basic workflow from Issue to merge | Issue 作成からマージまでの基本フロー（AI 非依存） |
| [issue-rule](development/issue-rule) | Quy tắc & template tạo Issue trên GitHub | GitHub Issue templates and creation rules | GitHub Issue のテンプレートと作成ルール |
| [pull-request-rule](development/pull-request-rule) | Cách viết PR và quy tắc review | PR conventions and review rules | PR の書き方・レビュールール |
| [dependabot-pr-consolidation-playbook](development/dependabot-pr-consolidation-playbook) | Gộp nhiều PR Dependabot thành một PR | Playbook: consolidate Dependabot PRs into one | Dependabot 複数 PR を1本にまとめる手順 |
| [e2etest](development/e2etest) | Tiến trình & kịch bản E2E | E2E testing flow and scenarios | E2E テストの進め方・シナリオ |
| [directory-template](development/directory-template) | Cấu trúc thư mục dự án đề xuất | Recommended project directory layout | プロジェクトの推奨ディレクトリ構成 |
| [openapi-use-policy](development/openapi-use-policy) | Quy tắc API key, Project, chọn model *(trang VI / EN / JA)* | OpenAI API usage policy *(same page: VI / EN / JA)* | API キー・Project・モデル選定のルール（同一ページで VI / EN / JA） |
| [openai-admin](development/openai-admin) | Admin Key & phát hành key qua openai-admin-tool / console *(đa ngữ trong trang)* | Admin keys and issuing keys via tools/console *(in-doc languages)* | Admin Key とキー発行（ツール・管理画面）の手順（ページ内で多言語） |

### AI-assisted development (Cursor) — Phát triển với AI (Cursor) — AI 駆動開発（Cursor）

| Document | Tiếng Việt | English | 日本語 |
| -------- | ---------- | ------- | ------ |
| [workflow](development/ai-driven-development/workflow) | Các phase & luồng làm việc với Cursor AI | Cursor AI development phases and flow | Cursor AI 開発のフェーズと流れ |
| [cursor_manual](development/ai-driven-development/cursor_manual) | Hướng dẫn sử dụng Cursor | Cursor usage manual | Cursor の使い方 |
| [guidance_cursor](development/ai-driven-development/guidance_cursor) | Nguyên tắc & best practice khi dùng Cursor | Guidance for using Cursor effectively | Cursor 利用のガイドライン |
| [cursor](development/ai-driven-development/cursor) | Custom commands (/issue, /breakdown, /plan, …): cài đặt & cách dùng | Custom Cursor commands setup and usage | カスタムコマンド（/issue, /breakdown, /plan など）のセットアップと使い方 |
| [requirements_definition](development/ai-driven-development/document_templates/requirements_definition) | Danh sách template: đặc tả, screen map, DB, API, … | Templates for requirements, UI maps, DB/API specs, etc. | 要件定義・画面マップ・DB・API 等のテンプレートへの入口 |

---

## GitHub

Quy tắc & công cụ GitHub / GitHub operations & tooling / GitHub の運用ルールとツール

| Document | Tiếng Việt | English | 日本語 |
| -------- | ---------- | ------- | ------ |
| [Issue / SP definition](github/issue-and-sp-definition) | Phạm vi tạo Issue và quy tắc ghi SP | Which tasks need Issues and SP accounting rules | Issue 作成対象タスクと SP 計上ルール |
| [git_issue_rule](github/git_issue_rule) | Định nghĩa label & Story Points | Label definitions and Story Points | ラベル定義と Story Point の考え方 |
| [dependabot](github/dependabot) | Cấu hình & vận hành Dependabot | Dependabot configuration and usage | Dependabot の設定と運用 |
| [issue-creator-tool](github/issue-creator-tool) | Tạo hàng loạt Issue từ Google Spreadsheet | Bulk Issue creation via spreadsheet | スプレッドシート連携での Issue 一括作成 |

---

## Infrastructure — Hạ tầng — インフラ

Hướng dẫn cloud & dịch vụ ngoài / Cloud & external services / 外部サービス・クラウドの設定手順

| Document | Tiếng Việt | English | 日本語 |
| -------- | ---------- | ------- | ------ |
| [resource-naming-rules](infrastructure/resource-naming-rules) | Quy tắc đặt tên (S3, EC2, PM2, GitHub, DB, GCP, …) | Naming conventions across AWS/GCP/GitHub and more | S3・EC2・PM2・GitHub・DB・GCP などの命名規約 |
| [permission-use-cases](infrastructure/permission-use-cases) | IAM / policy & thao tác theo use case *(VI / EN / JA một trang)* | AWS/GCP permission patterns *(same page: VI / EN / JA)* | 権限・ポリシー設計とユースケース別手順（同一ページで VI / EN / JA） |
| [aws-ses-smtp](infrastructure/aws-ses-smtp) | Thiết lập gửi mail Amazon SES / SMTP | Amazon SES / SMTP setup manual | Amazon SES 送信サーバー設定マニュアル |
| [gmail-aws-ses-smtp](infrastructure/gmail-aws-ses-smtp) | Cấu hình Gmail gửi mail qua Amazon SES | Gmail outgoing mail setup via Amazon SES | Gmail × Amazon SES 送信設定 |
| [google-cloud-api](infrastructure/google-cloud-api) | IAM GCP & API (Google Maps, …) | GCP IAM and Google APIs management | GCP IAM・API（Google Maps 等）の管理と設定 |
| [cicd-deployment-patterns](infrastructure/cicd-deployment-patterns) | GitHub Actions, EC2, Cloud Run *(VI / EN / JA một trang)* | CI/CD patterns for Actions / EC2 / Cloud Run *(same page)* | GitHub Actions・EC2・Cloud Run の標準フロー（同一ページで VI / EN / JA） |
| [gcp-deployment-rules](infrastructure/gcp-deployment-rules) | Chuẩn triển khai GCP (tier, IaC, CI/CD, secrets…) *(menu ngôn ngữ trong trang)* | GCP deployment standards *(toc/languages inside doc)* | GCP デプロイ規約（構成・IaC・CI/CD 等／ページ内で言語切替） |
| [post-deploy-checklist](infrastructure/post-deploy-checklist) | Checklist sau deploy dịch vụ web | Post-deploy verification checklist for web services | Web サービス公開後の確認チェックリスト |
| [xserver-api](infrastructure/xserver-api) | Phát hành & sử dụng API key Xserver (DNS, mail, MySQL, …) | Xserver API key issuance and usage with Cursor | Xserver API キーの発行・利用（DNS・メール・MySQL 等） |

---

## Company rules — Quy định công ty — 社内規程

| Document | Tiếng Việt | English | 日本語 |
| -------- | ---------- | ------- | ------ |
| [VN](company-rule/VN) | Quy định làm việc & remote **(tiếng Việt)** | VEHO working & remote policy **(Vietnamese)** | 勤務・リモート規程 **（ベトナム語版）** |
| [EN](company-rule/EN) | Quy định làm việc & remote **(tiếng Anh)** | VEHO working & remote policy **(English)** | 勤務・リモート規程 **（英語版）** |
| [JP](company-rule/JP) | Quy định làm việc & remote **(tiếng Nhật)** | VEHO working & remote policy **(Japanese)** | 勤務・リモート規程 **（日本語版）** |
| [remote-rule](company-rule/remote-rule) | Chính sách remote (áp dụng từ 2026-04-01), EN/JA trong trang | Remote work policy with EN/JA sections | リモートワーク方針（適用日・英日併記） |
