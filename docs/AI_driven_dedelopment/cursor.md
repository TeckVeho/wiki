# 🖥 【EN】Cursor Usage Manual (For Company Accounts)

## 📌 Purpose
This document provides the basic usage guidelines for using Cursor with a company account, as well as operational rules to reduce prompt consumption and prevent excessive costs.

---

## 1. Overview of Cursor
- AI coding assistance tool  
- Editor (similar to VS Code) + AI chat functions  
- Can be used for code generation, review, bug fixing, and refactoring  
- **Company accounts are subject to usage restrictions and spending limits**

## 2. Model Selection Guidelines

| Recommended Model | Use Case | Reason |
|------|-----------|------|
| `gpt-4o-mini` / `claude-3.5-sonnet` | Large-scale code generation (new feature scaffolding) | High accuracy, efficient, fast response |
| `gpt-4o-mini` / `claude-3-haiku` | Lightweight tasks (comment generation, minor fixes) | Low token consumption, low cost |
| `claude-3.5-sonnet` | Long-form or complex design discussions | Strong at long text processing and maintaining consistency |
| `o3-mini` (only when needed) | Large-scale cross-file analysis | High cost, so use minimally |

**Notes**  
- `o1` / `o3` models are **very expensive** → Production use requires prior approval  
- Switch models from the **"Model Selection"** menu in the top right of the chat window  
- Do not set `gpt-4o` or `o1` as default unnecessarily

## 3. Tips to Reduce Prompt Consumption

- **Avoid keeping conversation history too long**  
  → Start a new chat for new tasks  
- **Paste only the necessary code or specifications**  
  → Avoid unnecessary logs or entire files  
- **Keep explanations concise**  
  → Long requests increase token usage  
- **Upload images only when truly necessary**  
  → OCR and analysis also consume tokens  
- **If multiple answers are unnecessary, request “only one”**

## 4. Basic Usage Flow

1. **Open the project**  
   - Launch Cursor → Select the target repository with `Open Folder`  
2. **Select the model** (top right)  
   - Choose the recommended model according to your purpose  
3. **Make an AI request**  
   - Example:  
     ```
     Please add validation to this function
     ```
4. **Apply code changes**  
   - Review AI suggestions → Edit as needed  
5. **Git management**  
   - Always include a commit message for changes  
6. **Archive unnecessary chats**  
   - Delete unused histories to save prompt usage

## 5. Prohibited & Cautionary Items

- **Do not use work-related code with personal accounts**  
  → Use only the company account  
- **Do not regularly use high-cost models**  
  → Prior approval required  
- **Be careful when pasting confidential information**  
  → Mask sensitive data  
- **Do not make unnecessarily long requests**  
  → Provide only essential information

## 6. Troubleshooting

- Model unusable/red dot → Check network and login status  
- Sudden increase in prompt usage → Check model usage history for high-cost models  
- For questions or issues, contact the dev channel

## 7. Reference Links

- [Cursor Official Documentation](https://docs.cursor.so/)  
- [Playwright Official](https://playwright.dev/)

---

# 🖥【JP】 Cursor 利用マニュアル（会社アカウント向け）

## 📌 目的
会社アカウントでCursorを利用する際の基本的な使い方と、プロンプト消費・課金を抑えるための運用ルールとなります。
---

## 1. Cursor の概要
- AIコーディング支援ツール
- エディタ（VS Codeに類似）+ AIチャット機能
- プログラムコード生成、レビュー、バグ修正、リファクタリングに活用可能
- **会社アカウントは利用制限と課金上限管理の対象**です

## 2. モデル選択の基本ルール

| 推奨モデル | 用途 | 理由 |
|------|-----------|------|
| `gpt-4o-mini` / `claude-3.5-sonnet` | 大規模コード生成（新規機能の雛形） | 高精度かつ効率的、レスポンス速め |
| `gpt-4o-mini` / `claude-3-haiku` | 軽量タスク（コメント生成・軽微な修正） | 消費トークン少、低コスト |
| `claude-3.5-sonnet` | 長文や複雑な設計議論 | 長文処理・一貫性に強い |
| `o3-mini`（必要時のみ） | 大量ファイル横断解析 | コスト高のため利用は最小限 |

**注意**  
- `o1` / `o3` 系は**非常に高コスト** → 本番利用は承認制
- モデル切替はチャット画面右上の **「モデル選択」** から行う
- 不要に`gpt-4o`や`o1`をデフォルトにしない！

## 3. プロンプト消費を抑えるコツ

- **会話履歴を長く持たせすぎない**  
  → 新しいタスクは新規チャットで開始  
- **必要なコードや仕様だけを貼る**  
  → 不要なログや全ファイル貼付は避ける
- **説明は簡潔に**  
  → 「長文依頼＝消費トークン増加」になりがち
- **画像アップロードは本当に必要なときだけ**  
  → OCRや解析でもトークン消費します
- **複数案不要な場合は「1案だけ」で依頼**

## 4. 基本的な利用フロー

1. **プロジェクトを開く**  
   - Cursor起動 → `Open Folder` で該当リポジトリを選択
2. **モデル選択**（右上）  
   - 目的に応じて上記の推奨モデルを選ぶ
3. **AIに依頼**  
   - 例：  
     ```
     この関数にバリデーション処理を追加してください
     ```
4. **コード適用**  
   - AI提案を確認 → 必要に応じて編集
5. **Git管理**  
   - 変更は必ずコミットメッセージを明記
6. **不要なチャットはアーカイブ**  
   - 無駄な履歴を削除しプロンプト消費を抑える

## 5. 禁止・注意事項

- **個人アカウントでの業務コード利用禁止**  
  → 会社アカウントのみ使用
- **高コストモデルの常用禁止**  
  → 利用は事前承認制
- **機密情報の貼り付け注意**  
  → 機密データはマスキングする
- **無駄な長文依頼禁止**  
  → 必要な情報のみ提供

## 6. トラブル時の対応

- モデルが使えない/赤丸表示 → ネットワーク・ログイン状態を確認
- プロンプト消費が急増 → モデル履歴を確認し、高コストモデル利用の有無をチェック
- 不明点や不具合は、devチャンネルに連絡

## 7. 参考リンク

- [Cursor公式ドキュメント](https://docs.cursor.so/)
- [Playwright公式](https://playwright.dev/)



