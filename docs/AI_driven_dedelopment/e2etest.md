# E2Eテスト自動化ガイド

本ドキュメントは、 **①Claudeデスクトップアプリ＋Playwright MCP**　または　 **②Cursor＋Playwright MCP**　を利用して、<br>
開発したWebシステムのE2Eテストを自動化するためのガイドです。

## 🛠 1.セットアップ手順

<details>
  <summary><mark> ①Claudeのデスクトップアプリ＋Playwright MCP</mark>　利用の場合</summary>
  <div>
    
### 1. Claudeデスクトップアプリのインストール・ログイン
- [Claude公式サイト](https://claude.ai/download)からインストールし、ログインする 
- ログインアカウントがわからない場合、PMに確認する

### 2. Node.jsをインストール
- [公式サイト](https://nodejs.org/en)からインストールする

※既にインストール済みで、Node.js バージョンを確認する方法（18.0.0以上が必要）<br>
ターミナルを開いて、次のコマンドを実行する
```
node --version
```

### 3. Playwright MCPサーバーをインストール
- ターミナルを開いて、次のコマンドを実行する
```
npm install -g @executeautomation/playwright-mcp-server
```

### 4. ClaudeデスクトップアプリにPlaywrite MCPを追加
- Claudeのデスクトップアプリのclaude_desktop_config.jsonファイルに以下の設定を追加する  　<br>
※Claudeのデスクトップアプリ　ファイル＞設定＞開発者＞設定を編集＞フォルダ内のclaude_desktop_config.jsonを開く
```
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@executeautomation/playwright-mcp-server"]
    }
  }
}
```
<img width="800" alt="image" src="https://github.com/user-attachments/assets/44cc330d-4186-4391-b409-82d2c49958c9" />

### 5. Claudeデスクトップアプリを再起動する
- 設定が完了したらClaudeを起動する（ファイル＞終了　でアプリを閉じ、再度アプリを開く）
- Playwright MCPサーバーが認識されているか確認する
<img width="800" alt="image" src="https://github.com/user-attachments/assets/a9f6de07-ae42-40d5-a9bf-00232da07c78" />

- Playwright MCPが動いているか確認する方法
Claudeのチャットで以下を質問して、実行できるか確認する
```
https://www.google.com/を開いてスクリーンショットを取って。
```
  </div>
</details>

<details>
  <summary><mark> ②Cursor＋Playwright MCP </mark>　利用の場合</summary>
  <div>
    
### 1. Cursor のインストール・ログイン
- [Cursor公式](https://www.cursor.com/) からインストールし、ログインする  
- ログインアカウントがわからない場合、 PM に確認する
  
### 2. Node.js をインストール
- [公式サイト](https://nodejs.org/en) から **v18.0.0 以上**をインストールする

※既にインストール済みで、Node.js バージョンを確認する方法（18.0.0以上が必要）<br>
ターミナルを開いて、次のコマンドを実行する
```bash
node --version
```

### 3. Playwright MCPサーバーをインストール
- ターミナルを開いて、次のコマンドを実行する
- Windows（PowerShell）
```PowerShell
npm install @playwright/mcp
```

### 4. Cursor に Playwright MCP を追加（mcp.json 設定）
Cursor の設定画面 → Settings → MCP & Integrations → New MCP Server（`mcp.json` を開く）で、以下の設定を追加・保存する。
```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": [
        "@playwright/mcp@latest"
      ]
    }
  }
}
```

### 5. Cursorを再起動する
- `mcp.json` 保存後、Cursor を完全終了 → 再起動
- 再起動後、Settings → MCP & Integrations で playwright が表示されることを確認
<img width="749" height="336" alt="image" src="https://github.com/user-attachments/assets/3d64db0b-f05f-4649-952f-f8379bf6eb7d" />


- Playwright MCPが動いているか確認する方法
Cursor のチャットで以下を質問して、実行できるか確認する
```
https://www.google.com/を開いてスクリーンショットを取って。
```

  </div>
</details>

## 🧩 2.E2Eテストの作成

Sample : https://github.com/TeckVeho/360-degree-feedback/tree/develop/e2e

### 1. 機能一覧作成フェーズ
- **担当:** PM / BA  
- **目的:** テスト対象システムにおける主要機能の一覧を整理し、後続のシナリオ作成フェーズのベースを作る。  

#### 1.1 入力
- ユーザーマニュアル  
- 機能設計書  
- 実システム構成情報  

#### 1.2 出力
- **出力形式:** Markdown (`.md`)  
- **保存場所:** `e2e/features/`  
- **ファイル名:** `feature-list.md`  

#### 1.3 内容構成（Markdownフォーマット例）
```md
# 機能一覧（システム名: 360-degree-feedback）

| No | 機能名 | 概要 | 担当BA | 備考 |
|----|---------|------|--------|------|
| 1  | ログイン | ユーザーが正しい認証情報でログインできる | Tanaka | |
| 2  | マスタ管理 | マスタデータの登録・更新・削除 | Sato | |
| 3  | フィードバック送信 | フィードバックの投稿機能 | Suzuki | |
| 4  | レポート出力 | 結果をPDFでダウンロード | Kato | |
```

#### 1.4 注意点
- テスト観点から**画面・機能単位で粒度を統一**すること。  
- 後続フェーズでは、この一覧の各行が1つの「シナリオファイル」と対応する。  
- 新機能追加時は本一覧を更新してからシナリオ作成に進む。  

---

### 2. テストシナリオの作成フェーズ
- **担当:** BA  
- **目的:** ユーザーマニュアルと実システム操作をもとに、機能単位のテストシナリオを作成する。  

#### 2.1 入力
- ユーザーマニュアル  
- 対象システム情報
  - **システム名:** {`システム名`}
  - **URL:** {`Stgなどの環境URL`}
  - **ログイン情報:**
    - ID: {`入力`}
    - PW: {`入力`}

#### 2.2 出力
- **出力形式:** Markdown (`.md`)
- **保存場所:** `e2e/scenarios/`
- **ファイル名:**  
  - 各機能単位に1ファイル  
  - 例：  
    - `e2e/scenarios/login.md`  
    - `e2e/scenarios/master_data.md`  
    - `e2e/scenarios/delivery_management.md`

#### 2.3 内容構成（Markdownフォーマット）
```md
# 機能名: ログイン機能

## 概要
ログイン画面にて正しいユーザー情報を入力し、システムに正常ログインできることを確認する。

## テストケース

### TC001: 正常系ログイン
**前提条件:** 有効なユーザーアカウントが存在する  
**テスト手順:**
1. ログイン画面を開く  
2. IDとパスワードを入力  
3. 「ログイン」ボタンをクリック  
4. ダッシュボード画面が表示されることを確認  
**期待結果:** ログイン成功、トップページに遷移する

### TC002: 誤ったパスワード
**前提条件:** 有効なユーザーアカウントが存在する  
**テスト手順:**
1. ログイン画面を開く  
2. IDは正しく、パスワードを誤って入力  
3. 「ログイン」ボタンをクリック  
**期待結果:** 「認証に失敗しました」等のエラーメッセージが表示される
```

#### 2.4 注意点
- **Playwright生成用のプロンプトやコードは記載不要。**  
- **手順は明確に、「画面操作がわかる粒度」で記載する。**  
- 一度に全機能を作成せず、機能単位で分割して段階的に整備する。

---

### 3. Playwrightコード生成フェーズ
- **担当:** Dev 
- **目的:** Cursor上でMCPを用いて、MarkdownシナリオからPlaywright E2Eテストコードを自動生成する。

#### 3.1 実施手順
1. Cursorで対象シナリオファイルを開く（例：`e2e/scenarios/login.md`）  
2. 以下のプロンプトを入力してMCPを実行：
   ```bash
   Please generate Playwright E2E test code using MCP,
   based on the scenario file: e2e/scenarios/login.md
   ```
3. MCPが自動的にPlaywrightテストコード（`.test.js`）を生成。  

#### 3.2 出力
- **コード形式:** JavaScript（Playwright形式）
- **保存場所:** `e2e/src/tests/`
- **ファイル名:**  
  - `scn-<機能名>.test.js`
  - 例：`scn-login.test.js`

- **コード要件:**
  - シナリオIDやテストケース名がわかるコメントを記載
  - 可読性重視
  - 共通処理・認証・設定値は `e2e/src/config` および `e2e/src/utils` にまとめる

---

### 4. ディレクトリ構造
E2Eテスト環境は以下のように構成します。

```
e2e/
├── .env                    # Playwright実行時の環境変数
├── package.json            # E2Eテスト環境の依存関係とスクリプト
└── src/
    ├── config/             # 環境設定ファイル・ログイン情報・URL定義など
    │   ├── env.config.js
    │   ├── auth.config.js
    │   └── urls.js
    ├── tests/              # 各機能のテストコード（MCP生成結果）
    │   ├── scn-login.test.js
    │   ├── scn-master-data.test.js
    │   └── scn-delivery.test.js
    └── utils/              # 共通関数（ログイン処理・スクリーンショット管理など）
        ├── login.js
        ├── screenshot.js
        └── helpers.js
```

---

### 5. テスト実行フェーズ
- **担当:** QA/CI(GithubActions)  
- **目的:** 生成済みPlaywrightテストコードを実行し、結果・証跡を収集する。

#### 5.1 入力
- テストシナリオ（Markdown）
- Playwrightテストコード（`.test.js`）
- サンプルデータ（必要な場合）

#### 5.2 実行内容
1. `cd e2e`  
2. `npx playwright test src/tests/scn-login.test.js` を実行  
3. 各シナリオごとにスクリーンショットを保存  
   - **保存場所:** `e2e/screenshots/`
   - **ファイル名:** `{シナリオID}-{シナリオ名}.png`

#### 5.3 出力
- **テスト結果:**  
  テストシナリオ（MarkdownまたはHTML）に追記する。
  - 実行結果: PASS / FAIL / SKIP / BLOCK  
  - 実行備考・実測データ: 結果詳細や理由を記載  

- **成果物:**
  - Playwrightテストコード (`.test.js`)
  - 実行結果付きシナリオ (`.md` or `.html`)
  - スクリーンショット (`.png`)

---

### 6. 不具合・修正対応フェーズ
- **担当:** Dev  
- **目的:** 失敗シナリオの修正・再実行

#### 6.1 修正依頼テンプレート
```md
シナリオID `TC002` について以下を修正し、再度テストを行ってください。  
テストコード・テスト結果も更新し、再度スクリーンショットを取得してください。

修正指示例：  
- 「ログイン」ボタンではなく「Sign in」ボタンをクリックしてください。
```

---

### 7. 成果物一覧
| 成果物 | 格納場所 | ファイル例 |
|---------|------------|-------------|
| 機能一覧 | `e2e/features/` | `feature-list.md` |
| Markdownテストシナリオ | `e2e/scenarios/` | `login.md` |
| Playwrightテストコード | `e2e/src/tests/` | `scn-login.test.js` |
| 共通設定・関数 | `e2e/src/config/`, `e2e/src/utils/` | `env.config.js`, `login.js` |
| スクリーンショット | `e2e/screenshots/` | `TC001-正常系ログイン.png` |
| テスト結果付きシナリオ | `e2e/results/` | `scn-login.html` |

---

### 8. 運用サイクルまとめ
1. **PM/BA:** 機能一覧（`feature-list.md`）を作成  
2. **BA:** 各機能ごとのシナリオ（.md）を作成  
3. **Dev:** MarkdownからPlaywrightコード自動生成  
4. **QA:** テスト実行 → 結果・スクリーンショット取得  
5. **BA/Dev:** 必要に応じて修正依頼・再テスト  
6. **最終成果物:** 結果反映済みのHTMLシナリオ＋証跡  
