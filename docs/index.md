---
sidebar_position: 0
id: index
title: Veho Wiki
---

# Veho Wiki

Veho のナレッジベースです。開発ルール・AI駆動開発・GitHub運用・インフラ設定などのドキュメントをまとめています。

---

## 開発 (Development)

開発プロセスとルール全般です。

| ドキュメント | 説明 |
|-------------|------|
| [Issue 作成ルール](development/issue-rule) | GitHub Issue のテンプレートと作成ルール |
| [Pull Request ルール](development/pull-request-rule) | PR の書き方・レビュールール |
| [E2E テスト](development/e2etest) | E2E テストの進め方・シナリオ |
| [ディレクトリテンプレート](development/directory-template) | プロジェクトの推奨ディレクトリ構成 |
| [OpenAI API 利用方針](development/openapi-use-policy) | APIキー・Project・モデル選定のルール（ベトナム語・英語・日本語の同一ページ） |
| [openai-admin（PM 向けキー発行）](development/openai-admin) | Admin Key（自行発行または @Kido 依頼）と openai-admin-tool／管理画面での API キー発行手順 |

### AI駆動開発 (Cursor)

Cursor を使った AI 駆動開発のワークフローとツールです。

| ドキュメント | 説明 |
|-------------|------|
| [開発フロー (Workflow)](development/ai-driven-development/workflow) | Cursor AI 開発のフェーズと流れ |
| [Cursor マニュアル](development/ai-driven-development/cursor_manual) | Cursor の使い方 |
| [Cursor ガイダンス](development/ai-driven-development/guidance_cursor) | Cursor 利用のガイドライン |
| [Cursor コマンド](development/ai-driven-development/cursor/README) | カスタムコマンド（/issue, /breakdown, /plan など）のセットアップと使い方 |
| [ドキュメントテンプレート](development/ai-driven-development/document_templates/requirements_definition) | 要件定義・画面マップ・DB設計・API 等のテンプレート一覧 |

---

## GitHub

GitHub の運用ルールとツールです。

| ドキュメント | 説明 |
|-------------|------|
| [Issue / SP 定義](github/issue-creation-rule) | Issue 作成対象タスクと SP 計上ルール |
| [ラベル・SP 定義](github/git_issue_rule) | ラベル定義と Story Point の考え方 |
| [Dependabot](github/dependabot) | Dependabot の設定と運用 |
| [Issue 作成ツール（スプレッドシート）](github/issue-creator-tool) | スプレッドシート連携での Issue 一括作成 |

---

## インフラ (Infrastructure)

外部サービス・クラウドの設定手順です。

| ドキュメント | 説明 |
|-------------|------|
| [リソース命名ルール](infrastructure/resource-naming-rules) | S3・EC2・PM2・GitHub・DB・GCP などの命名規約 |
| [権限ユースケース（AWS / GCP）](infrastructure/permission-use-cases) | 共通ルール・ポリシー設計とユースケース別手順（ベトナム語・英語・日本語の同一ページ） |
| [AWS SES / SMTP](infrastructure/aws-ses-smtp) | Amazon SES 送信サーバー設定マニュアル |
| [Google Cloud API](infrastructure/google-cloud-api) | GCP IAM・API（Google Maps 等）の管理と設定 |
| [CI/CD デプロイパターン（EC2 / Laravel / Cloud Run）](infrastructure/cicd-deployment-patterns) | GitHub Actions・EC2（AWS）・Cloud Run（GCP）の標準フロー（ベトナム語・英語・日本語の同一ページ） |