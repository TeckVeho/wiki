---
title: openai-admin（PM 向け API キー発行）
---

# openai-admin（Project Manager 向け OpenAI API キー発行）

Project Manager（PM）が、プロジェクト単位で OpenAI API キーを発行するための手順です。  
運用ルール（Project／環境ごとのキー分離など）は [OpenAI API 利用方針](./openapi-use-policy) に従ってください。

---

## 全体の流れ

次の **どちらか一方** で進めます。

1. **OpenAI の管理画面から行う** — [1. OpenAI の管理画面から行う](#manual-web-ui) を参照。**OpenAI API Admin Key は不要**です。
2. **openai-admin-tool を使う** — まず **OpenAI API Admin Key** を **自分で発行**するか、**@Kido** に依頼して受け取るか、**どちらか**で用意する。そのうえで [2. openai-admin-tool を使う](#openai-admin-tool) を参照。

---

## 運用上の前提（いずれの方法でも共通）

- [OpenAI API 利用方針](./openapi-use-policy) に沿って、**システム／プロジェクトごとに OpenAI Project** を分ける。
- **環境ごと（prod / stg / dev）に別々の API キー** を発行する。

---

## 1. OpenAI の管理画面から行う {#manual-web-ui}

**OpenAI Platform** のブラウザ画面のみで、Project と API キーを用意する方法です。  
組織の権限やプロダクトの UI 変更により、メニュー名や操作は異なる場合があります。

### アカウント・権限の前提

- 組織で許可されたアカウントで [OpenAI Platform](https://platform.openai.com/) にサインインできること。
- **Project の作成** と **API キーの発行** の権限があること（無い場合は **@Kido** に依頼）。

### 手順の概要

1. ブラウザで **https://platform.openai.com/** を開き、ログインする。
2. **Organization** のコンテキストで作業する（画面上部や設定で、正しい組織が選ばれているか確認）。
3. **Project を作成**（または既存の Project を開く）。  
   - 多くの場合 **Settings** 配下の **Projects**、またはダッシュボードから Project 管理に進みます。
4. **API keys**（**View all API keys** など）から、**Create new secret key** を選択する。
5. 可能なら **キーのスコープを対象 Project に限定**する（UI に「Restrict to project」やプロジェクト選択がある場合）。
6. **名前**は利用方針に合わせる（例: `{project-name}-dev`, `{project-name}-stg`, `{project-name}-prod`）。
7. 生成された **シークレット** をコピーし、**ソースコードやチャットに貼らず**、**GCP Secret Manager** に保存する（もしくはエンジニアに依頼してキーを更新する）。
8. **prod / stg / dev** で別キーを使う場合は、**キー作成を環境ごとに繰り返す**。

### 補足

- キーは **漏洩したらすぐにローテーション**（旧キー失効・新キー発行）し、保存先を更新する。
- 利用量は [Usage](https://platform.openai.com/usage) 等で、意図した Project に計上されているか確認する。

---

## 2. openai-admin-tool を使う {#openai-admin-tool}

本ページの **openai-admin-tool** は、社内リポジトリ **openai-admin**（Node 製 CLI。YAML 定義に沿って OpenAI Project と環境別 API キーを扱う）を指します。

組織レベルの操作に **OpenAI API Admin Key** が必要です。

**コマンド・ファイル構成・注意事項の正本は、clone 先の `openai-admin/README.md` と `openai-admin/docs/key-management.md` です。** 以下は PM が初めて触る際の抜粋にすぎないので、操作前に README を読むか、**Cursor** で当該ファイルを開いて確認してください（`openai-admin` をワークスペースに追加する、エクスプローラー／**@** で `README.md` を参照する、など）。

### OpenAI API Admin Key の準備

openai-admin-tool は **OpenAI API Admin Key**（Admin API 用のキー）なしでは動かしません。  
次の **どちらか一方** で用意してください。

- **自分で発行する**  
  OpenAI の管理画面 [OpenAI Platform](https://platform.openai.com/) の組織設定（**Admin keys** 等、画面名は変更されうる）から発行する。
- **@Kido に依頼する**  
  上記の権限がない、または運用上こちらに任せる場合は、**@Kido** に Slack 等で依頼し、発行・受け渡しをしてもらう。

### openai-admin のセットアップ（.env など）

README の手順の概要は次のとおりです（**詳細・更新は `openai-admin/README.md` 優先**）。

- リポジトリを **clone** し、ルートで `npm install` を実行する。
- **`.env.example` をコピーして `.env` を作成**する（Windows 例: `copy .env.example .env`。macOS / Linux は `cp`）。
- **`.env` の `OPENAI_ADMIN_API_KEY`** に、Admin API キー（`sk-admin-...`）を記入する。
- **`.env` は Git にコミットしない**（`.gitignore` 対象）。Admin キーは権限が強いため漏洩に注意（README にも記載あり）。
- 接続確認の例: `npm run verify-admin`

### ツールでの作業の流れ（発行）

1. **`projects/<名前>.yml`** にプロジェクト定義を用意する。雛形は `projects/_template.yml`。**フィールドの意味・禁止事項・削除時の扱いは `docs/key-management.md`**（実データの YAML はリポジトリに載せない運用のため、README も併読）。
2. **`npm run issue-keys -- projects/<名前>.yml`** で、定義に従いプロジェクト作成・環境別キーの払い出しなどを実行する（README のコマンド表。ログにシークレットは出さない設計）。
3. 必要に応じ **`npm run list-projects`** 等で組織内の OpenAI プロジェクトを確認する（オプションは README 参照）。
4. 発行結果の扱いは **`docs/key-management.md`** に従う（例: YAML の `key` に平文が保存される点、ローカルファイルの取り扱い）。**GCP Secret Manager** へ登録するか、**エンジニアに依頼してキーを更新**する。**再表示できない前提**で、受け取り後すぐ移す。
5. [OpenAI API 利用方針](./openapi-use-policy) の「新規利用時の手順」に沿って動作確認し、**Usage** で利用量が想定どおりの Project に載っているか確認する。

権限や Organization の設定で詰まった場合は、**@Kido** に相談してください。

---

## 関連ドキュメント

- [OpenAI API 利用方針](./openapi-use-policy)（Project／キー命名・モデル・移行ルール）
- **openai-admin** リポジトリ: `README.md`（セットアップ・`npm run`）、`docs/key-management.md`（YAML 仕様・シークレット運用）
