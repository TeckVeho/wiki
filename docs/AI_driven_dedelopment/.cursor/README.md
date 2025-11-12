# Cursor Custom Commands

このディレクトリには、プロジェクト用のカスタムCursorコマンドが含まれています。

## セットアップ（前提条件）

Cursor Devコマンドを使用する前に、以下のセットアップを完了してください：

### 0. Cursorカスタムコマンドのセットアップ

`.cursor`ディレクトリと`.cursorrules`ファイルは専用のWikiリポジトリで管理されています。

**リポジトリから取得してセットアップ:**
```bash
# 1. カスタムコマンドリポジトリをクローン
git clone https://github.com/your-org/cursor-commands.git /tmp/cursor-commands

# 2. プロジェクトルートに移動
cd /path/to/your/project

# 3. .cursorディレクトリをコピー
cp -r /tmp/cursor-commands/.cursor .

# 4. .cursorrulesファイルをコピー
cp /tmp/cursor-commands/.cursorrules .

# 5. 一時ディレクトリを削除
rm -rf /tmp/cursor-commands

# 6. スクリプトに実行権限を付与（macOS/Linux）
chmod +x .cursor/script/setsp.ps
```

### 1. GitHub CLI認証
```bash
# GitHub CLIのインストール（未インストールの場合）
# macOS: brew install gh
# Windows: winget install --id GitHub.cli

# GitHubにログイン
gh auth login

# GitHub Projects用の必須スコープを追加
gh auth refresh -h github.com -s read:project -s project

# 認証の確認
gh auth status
```

### 2. 必須ツール
- **jq**: JSONプロセッサ（SPスクリプトで必要）
  ```bash
  # macOS
  brew install jq
  
  # Linux (Ubuntu/Debian)
  sudo apt-get install jq
  
  # Windows
  winget install jqlang.jq
  ```

### 3. GitHub Projectsの設定
- GitHub Project Boardを作成または確認
- プロジェクトに**"SP"**または**"Story Points"**という名前のカスタムフィールドを追加
- フィールドタイプ: TEXT、NUMBER、またはSINGLE_SELECT

### 4. 必要な権限
- リポジトリへの書き込みアクセス
- GitHub Projectsへの書き込みアクセス

---

## 利用可能なコマンド

このプロジェクトでは、`.cursor/commands/`ディレクトリにCursor Devコマンドを使用します。

### `/issue {issue_number}` - Issue取得・ブランチ作成・ドキュメント保存

指定されたGitHub issueの情報を取得し、開発ブランチを作成し、issue.mdを保存します。

**パラメータ:**
- `issue_number` または `issue_url` (必須): GitHub issue番号（例：115）または完全なURL
- `--auto` / `--workflow` (オプション): フルパイプライン実行（`/issue → /plan → /breakdown → /dev → /test → /pr`）
- `--skip-plan` / `--skip-breakdown` (オプション): 自動モードで特定のフェーズをスキップ

**使用例:**
```
/issue 129
/issue https://github.com/owner/repo/issues/129
/issue 129 --auto
/issue 129 --workflow --skip-plan
```

**出力:** `docs/issues/{issue_number}/issue.md`

---

### `/plan {issue_number}` - 実装計画の作成

issueの詳細な実装計画ドキュメントを生成します。

**パラメータ:**
- `issue_number` (オプション): GitHub issue番号。省略時は最近処理したissueを使用

**計画ドキュメントの構造:**
- 機能要件のマッピング
- ディレクトリ構造とファイルリスト
- アーキテクチャ設計
- データモデル
- 実装タスク（タイプ、説明、依存関係、推定工数を含む）

**使用例:**
```
/plan 129
/plan
```

**出力:** `docs/issues/{issue_number}/plan.md`

---

### `/breakdown {issue_number}` - FE/BE個別issue作成とSP算出

Plan情報を元に、Frontend/Backend別の個別issueを作成し、Story Point (SP)を算出してGitHub Projectsに登録します。

**パラメータ:**
- `issue_number` (オプション): 対象のissue番号（省略時は現在のブランチから自動検出）
- `--dry-run` (オプション): 実際にissueを作成せず、分解計画のみを表示

**主な機能:**
- Plan.mdを解析してタスクをFE/BE個別issueに分解
- 各issueに対してSP（1 SP = 1時間）を算出
- バイリンガル（日本語/ベトナム語）のissue作成
- GitHub issueを作成し、SP値をGitHub Projectsに自動登録

**Issueタイトル形式:**
- `[FE] {日本語タイトル} / {Vietnamese Title}` for Frontend
- `[BE] {日本語タイトル} / {Vietnamese Title}` for Backend

**SP算出ガイドライン:**
- 1-2 SP: シンプルなコンポーネント/エンドポイント
- 3-5 SP: 標準的な機能、中程度の複雑さ
- 5-8 SP: 複雑な機能、広範なテスト
- 8-13 SP: 大規模な機能、アーキテクチャ変更（分割を検討）
- 13+ SP: 大きすぎる、小さなissueに分割必須

**使用例:**
```
/breakdown 129
/breakdown 129 --dry-run
/breakdown
```

**出力:** GitHub Issues（ラベルとSP値が登録済み）

---

### `/dev {issue_number}` - 開発実行

柔軟な開発手法（TDDまたは直接実装）でコードを開発します。

**パラメータ:**
- `issue_number` (オプション): Issue番号。省略時は最近処理したissueを使用
- `output_path` (オプション): 出力ディレクトリパス
- `--parent` (オプション): 親issue番号（`/breakdown`で作成された子issue用）

**開発フェーズ:**
1. 要件分析
2. 実装（TDDまたは直接実装）
3. 検証
4. リファクタリング

**使用例:**
```
/dev 130
/dev --parent 129
/dev
```

**出力:** `docs/issues/{issue_number}/dev.md`

---

### `/test {issue_number}` - テスト実行と証拠保存

テストを実行し、結果を記録します。

**パラメータ:**
- `issue_number` (オプション): Issue番号。省略時は最近処理したissueを使用
- `output_path` (オプション): 出力ディレクトリパス

**主な機能:**
- テストフレームワークの自動検出
- テストスイートの実行
- 生の出力を`docs/issues/{issue_number}/evidence/`に保存
- 構造化されたテストレポートを生成
- Issue要件 vs 実装 vs テスト結果の比較
- レビューノートと改善提案の提供

**使用例:**
```
/test 130
/test
```

**出力:** 
- `docs/issues/{issue_number}/evidence/` (テスト出力、カバレッジ、スクリーンショット)
- `docs/issues/{issue_number}/test.md` (構造化レポート)

---

### `/pr {issue_number}` - プルリクエスト作成

変更をコミットし、自動issue紐付けでGitHub PRを作成します。

**パラメータ:**
- `issue_number` (オプション): Issue番号。省略時は最近処理したissueを使用
- `auto_link` (オプション): PRをissueに自動紐付け（デフォルト: true）

**主な機能:**
- 変更をステージングしてコミット
- 包括的なコミットメッセージを生成（"Closes #{issue_number}"を含む）
- テスト結果とスクリーンショットを含むPR本文を生成
- `docs/issues/{issue_number}/pr.md`にPR本文を保存
- リモートにプッシュ
- GitHub PRを作成（issue自動紐付け）

**PR本文に含まれる内容:**
- Issue参照と自動クローズ紐付け
- 実装サマリーと主な変更
- スクリーンショット（GitHub raw URLs使用）
- 証拠セクション（テスト結果と実行詳細）

**使用例:**
```
/pr 130
/pr
```

**出力:** 
- `docs/issues/{issue_number}/pr.md`
- GitHub Pull Request（issue紐付け済み）

---

## 開発ワークフロー

### フェーズ1: 計画とIssue分解（担当: TL）
PMが作成した要件issueに基づいて、ブランチ作成、計画、SP算出、FE/BEタスクへの分割を行います。

1. `/issue {requirement_issue_number}` - Issueを取得、ブランチ作成、ドキュメント化
2. `/plan {requirement_issue_number}` - 実装計画を作成
3. `/breakdown {requirement_issue_number}` - Planに基づいて個別FE/BE issueを作成し、Story Pointsを算出

### フェーズ2: 開発とデプロイサイクル（担当: 個別エンジニア）
フェーズ1で作成された**FE/BE Issues**によってトリガーされ、各issueに対して以下の開発サイクルを実行します。

1. `/dev {issue_number}` - 開発実行（FEまたはBE issue用）
2. `/test {issue_number}` - テスト実行と証拠収集
3. `/pr {issue_number}` - プルリクエスト作成（デプロイと手動テストをトリガー）

---

### 自動ワークフロー（新機能）
*ワークフローシーケンス（plan → breakdown）を反映*

1. `/issue {issue_number} --auto` - フルパイプラインを自動実行（issue → plan → breakdown → dev → test → pr）
2. `/issue {issue_number} --auto --skip-plan` - 迅速な開発のためにplanをスキップ

---

## ファイル構成

```
.cursor/
├── commands/
│   ├── issue.md         # Issue取得・ブランチ作成コマンド
│   ├── plan.md          # 実装計画作成コマンド
│   ├── breakdown.md     # FE/BE issue分解・SP算出コマンド
│   ├── dev.md           # 開発実行コマンド
│   ├── test.md          # テスト実行コマンド
│   └── pr.md            # プルリクエスト作成コマンド
├── script/
│   ├── setsp.ps         # macOS/Linux用SP登録スクリプト
│   └── setsp.ps1        # Windows用SP登録スクリプト
└── README.md            # このファイル

docs/
└── issues/
    └── {issue_number}/
        ├── issue.md       # Issue詳細
        ├── plan.md        # 実装計画
        ├── dev.md         # 開発ログ
        ├── test.md        # テストレポート
        ├── pr.md          # PR本文
        └── evidence/      # テスト証拠とカバレッジデータ
```

---

## プロジェクトコンテキスト

- **言語**: 日本語レスポンス推奨
- **技術スタック**: Node.js, TypeScript, Nuxt.js, PostgreSQL, Jest
- 既存のプロジェクト規約とパターンに従う

---

## コマンド

```bash
# Backend
yarn dev              # 開発サーバー起動
yarn test:unit        # テスト実行
yarn db:migrate       # データベースマイグレーション実行
yarn build            # 本番ビルド

# Frontend
yarn dev              # 開発サーバー起動
yarn test             # テスト実行
yarn build            # 本番ビルド
```

---

## 重要な注意事項

### ファイル作成制限
- **検証ファイルの禁止場所:**
  - `docs/issues/{issue_number}/evidence/`（最終レポート以外）
  - プロジェクトルートディレクトリ
  - `backend/`または`frontend/`ディレクトリ
  - その他のプロジェクトディレクトリ

### Git コミット制限
- `/issue`、`/plan`、`/breakdown`、`/dev`、`/test`コマンドでは**コミット禁止**
- コミットは`/pr`コマンドでのみ実行
- これにより適切なワークフロー分離とテストが保証されます

---

## 必要な権限とツール

- **GitHub CLI** (`gh`) - 認証済み
- **jq** - JSONプロセッサ
- **Git** - バージョン管理
- **Node.js / Yarn** - パッケージ管理とスクリプト実行
- **Cursor IDE** - コマンド実行環境
