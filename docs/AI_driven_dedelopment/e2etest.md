# E2Eテスト自動化ガイド（Claude + Playwright MCP）

## 概要
本ドキュメントは、開発したWebシステムのE2Eテストを **Claudeのデスクトップアプリ** と **Playwright MCP（Multi Code Prompt）** を利用して自動化するためのガイドです。

## 🛠 利用ツール
- **Claude Desktop アプリ**（Anthropic社）
- **Playwright MCP**（E2Eテスト用のブラウザ操作ライブラリ）


## ✅ セットアップ手順
### 1. Claudeデスクトップアプリのインストール・ログイン
[Claude公式サイト](https://claude.ai/download)からインストールし、ログインする

### 2. Node.jsをインストール
[公式サイト](https://nodejs.org/en)からインストールする

※ Node.js バージョン確認方法（18.0.0以上が必要）
ターミナルを開いて、次のコマンドを実行する
```
node --version
```

### 3. Playwright MCPサーバーをインストール
ターミナルを開いて、次のコマンドを実行する
```
npm install -g @executeautomation/playwright-mcp-server
```

### 4. Claudeデスクトップクライアントの設定
Claudeのデスクトップアプリのclaude_desktop_config.jsonファイルに以下の設定を追加する
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

### 5. Claudeデスクトップクライアントを起動
設定が完了したら、Claudeを起動してPlaywright MCPサーバーが認識されているか確認する
※Playwright MCPが動いているか確認する方法
```
Claudeのチャットで以下を質問して、実行できるか確認する
https://www.google.com/を開いてスクリーンショットを取って。
```

## 🧩 Claude の使い方（プロンプト指示）
Input
ユーザーマニュアル

プロンプト
以下のMCP構成のテストシナリオに従って、PlaywrightでのE2EテストコードをTypeScriptで生成してください。

[制約条件]
- テストフレームワークはPlaywright公式
- ページURLは `https://example.com/login`
- HTML要素はセレクタとして `#email`, `#password`, `#loginBtn` を使用

[テストシナリオ]
&lt;--- ここに test-scenario.txt の内容をコピペ ---&gt;
</code></pre>
<hr>
<h2>🧪 Claude からの出力結果（例）</h2>
<pre><code class="language-ts">// e2e/tests/login.spec.ts
import { test, expect } from '@playwright/test';

test('ユーザーが正しい情報でログインできる', async ({ page }) =&gt; {
  await page.goto('https://example.com/login');
  await page.fill('#email', 'user@example.com');
  await page.fill('#password', 'securePassword123');
  await page.click('#loginBtn');

  await expect(page).toHaveURL('https://example.com/dashboard');
});
</code></pre>
<hr>




<hr>
<h2>🔁 反復的なテスト修正の流れ（仮）</h2>
<ol>
<li>
<p>テストシナリオの手順を追記・修正</p>
</li>
<li>
<p>Claudeに再投入 → テストコード再生成</p>
</li>
<li>
<p>手元で <code inline="">npx playwright test</code> にて確認</p>
</li>
<li>
<p>OKならPR提出、CIで再テスト確認</p>
</li>
</ol>



</code>
