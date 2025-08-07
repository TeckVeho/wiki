# E2Eテスト自動化ガイド（Claude + Playwright MCP）

## 概要
本ドキュメントは、開発したWebシステムのE2Eテストを **Claudeのデスクトップアプリ** と **Playwright MCP（Multi Code Prompt）** を利用して自動化するためのガイドです。

## 🛠 利用ツール
- **Claude Desktop アプリ**（Anthropic社）
- **Playwright MCP**（E2Eテスト用のブラウザ操作ライブラリ）


## ✅ セットアップ手順
### 1. Claudeデスクトップアプリのインストール・ログイン
- [Claude公式サイト](https://claude.ai/download)からインストールし、ログインする 
- ログインアカウントはPMに確認する

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
<img width="1422" height="925" alt="image" src="https://github.com/user-attachments/assets/44cc330d-4186-4391-b409-82d2c49958c9" />

### 5. Claudeデスクトップアプリを起動する
- 設定が完了したらClaudeを起動する（ファイル＞終了　でアプリを閉じ、再度アプリを開く）
- Playwright MCPサーバーが認識されているか確認する
<img width="1431" height="928" alt="image" src="https://github.com/user-attachments/assets/a9f6de07-ae42-40d5-a9bf-00232da07c78" />

- Playwright MCPが動いているか確認する方法
Claudeのチャットで以下を質問して、実行できるか確認する
```
https://www.google.com/を開いてスクリーンショットを取って。
```

## 🧩 Claude の使い方（プロンプト指示）
### 1. テストシナリオの作成
- **担当:** BA  
- **内容:** 全体を通した最終確認のためのシナリオ作成  
- **インプット:** ユーザーマニュアル
- **プロンプトテンプレート:** 
```md
# ROLE
あなたはE2Eテスト自動化エンジニアです。

# GOAL
添付のユーザーマニュアルと対象システムをもとに、E2Eテストのテストシナリオを作成してください。

# INPUT
- ユーザーマニュアル
- 対象システム
  - システム名：{`システム名を入力`}
  - システムURL：{`StgなどのシステムURLを入力`}
  - ログイン情報
    - ID：{`入力`}
    - PW：{`入力`}

# OUTPUT REQUIREMENTS
- 出力形式：htmlで、エクセル・CSVを出力可能とする
- 列：シナリオID、シナリオ名、前提条件、テスト手順、期待結果、優先度、テストデータ、実行結果（テスト前なので値なし）、実行備考・実測データ（テスト前なので値なし）
- 1ファイルにつき 1 シナリオ
- ファイル名: `scn-システム名.html`
```
- **成果物:** `テストシナリオ'
- 適宜修正依頼、手修正を加える

### 2. テストの実行
- **担当:** BA  
- **内容:** 全体を通した最終確認  
- **インプット:** テストシナリオ、サンプルデータ（テストでインポートが必要な場合）
- **プロンプトテンプレート:** 
```md
# GOAL
- 添付のシナリオテストをもとに、各シナリオIDに対応する Playwright テストコードを生成してください。
- Playwriteでテストを実行し、「実行結果」「実行備考・実測データ」を更新してください。
- 各シナリオID毎にスクリーンショットを保存してください。
- `インポートは添付のサンプルデータを使用してください。（必要な場合）`

# INPUT
- テストシナリオ
- `サンプルデータ（必要な場合）`

# OUTPUT REQUIREMENTS
- テストコード
  - 言語: JavaScript
  - ファイル名: `scn-システム名.test.js`
  - シナリオIDとテスト箇所がわかるように明記
- テスト結果
  - テストシナリオの結果を更新
    - 「実行結果」：PASS/FAIL/SKIP/BLOCK
    - 「実行備考・実測データ」：実行結果の内容・理由
- テスト証票（スクリーンショット）
  - 各シナリオID毎に
  - ファイル名: `シナリオID-シナリオ名.png`

# STYLE
可読性重視。冗長なコメントは不要。日本語コメント。
```
- **成果物:** ：シナリオテストコード、テスト結果、証票（スクリーンショット）

※うまくいかないテストがあり、修正指示を行う場合
```md
シナリオID`XXX`について以下を修正し、再度テストを行ってください。テストコード・テスト結果も更新し、再度スクリーンショットを取ってください。
`例：●●ではなく××というボタンを押してください`
```

