# AI駆動開発フロー（時系列順）

このプロセスは、企画・設計から始まり、開発、テスト、そしてリリースまでを順番に進めていきます。

---

### フェーズ1: 基本設計（PM）

#### 1.要件定義

- **担当:** PM  
- **内容:** `仕様書`を基に、ビジネス要件・機能要件を記載した `要件定義.md` を作成  
- **ツール:** `ChatGPT-o3` / `Gemini` / `Kiro`  
- **インプット:** `要件定義内容をまとめたテキスト資料`  
- **プロンプトテンプレート:** `XXXXXX`  
- **成果物:** `要件定義.md`

#### 2. モックアップ作成

- **担当:** PM  
- **内容:** AIツールを使って `モックアップ` を作成  
- **ツール:** `v0`  
- **インプット:** `要件定義.md`  
- **プロンプトテンプレート:** `XXXXXX`  
- **成果物:** `モックアップコード（Next.js）`

#### 3. 画面機能一覧作成

- **担当:** PM  
- **内容:** モックアップコードから `画面機能一覧.md` を生成  
- **ツール:** `v0`  
- **インプット:** `モックアップコード`  
- **プロンプトテンプレート:** `XXXXXX`  
- **成果物:** `画面機能一覧.md`

---

### フェーズ2: 実装準備（BE / FE）

#### 4. プロジェクト環境構築

- **担当:** BE（TL）  
- **内容:** `Cursor`を用いてディレクトリテンプレートに沿った環境を構築  
- **成果物例:**


/app
/components
/pages
/api
/tests
README.md



#### 5. 詳細設計作成

- **担当:** TL  
- **内容:** モックアップを基に `詳細設計` を生成  
- **ツール:** `Cursor`  
- **インプット:** `要件定義.md` `フロントエンドコード` `画面機能一覧.md`
- **プロンプトテンプレート:** `XXXXXX`  
- **成果物:** `Swagger(API)設計``データベース(スキーマ)設計`'バッチ設計(optional)''詳細ロジックAPI設計(optional)'


#### 6.シナリオ作成

- **担当:** PM
- **内容:** 開発と並行して、テスト用の `シナリオ.md` を作成
- **ツール:** `Cursor`  
- **インプット:** `要件定義.md` 
- **プロンプトテンプレート:** `XXXXXX`  
- **成果物:** `シナリオ.md'


#### 7. 実装タスク一覧作成
- **担当:** TL
- **内容:** これまで作成した成果物からタスク一覧を作成する。
- **ツール:** `Cursor`  
- **参照:** `タスク一覧.md` `Issueテンプレート.md`
- **プロンプトテンプレート:** `XXXXXX`
- **成果物:** `シナリオ.md'

#### 8. Github_Issue作成
- **担当:** TL 
- **内容:** Github MCPを使って、タスク一覧からGithub Issue作成する。
- **ツール:** `Cursor(Github MCP)`  

---

### フェーズ3: 開発・単体テスト（BE & FE）

#### 9. 実装と単体テスト

- **担当:** BE / FE  
- **内容:** Github MCPを使って、担当のIssueを呼び出し、開発・単体テストを実装する。
- **ツール:** `Cursor(Github MCP)`  
- **成果物:** コード、テストコード

#### 10. PR作成

- **担当:** BE / FE  
- **内容:** 実装後に Github MCPを使って`PR（プルリクエスト）` を作成する。
- **ツール:** `Cursor(Github MCP)`  
- **成果物:** PR（プルリクエスト）

---

### フェーズ4: 結合・システムテスト

#### 11. 結合テスト（Integration Test）

- **担当:** BE / FE  
- **内容:** 担当範囲に応じて以下を並行実施：
- **ツール:** `Cursor`

BE: APIテスト（Cursor）
FE: E2Eテスト（Cursor）


#### システムテスト（System Test）

- **担当:** BE / FE  
- **内容:** 全体を通した最終確認  
- **ツール:** `Cursor(MCP playwright)`
- **インプット:** `シナリオ.md'
- **プロンプトテンプレート:** `XXXXXX`  
- **成果物:** `シナリオテストコード'

---

```mermaid
sequenceDiagram
    %% 関係者定義
    participant PM
    participant TL
    participant BE
    participant FE
    participant AI_ツール as AI要件支援ツール
    participant v0
    participant Cursor
    participant GitHub
    participant WES

    %% フェーズ1: 基本設計
    PM->>AI_ツール: 要件定義支援（テキスト資料 + プロンプト）
    AI_ツール-->>PM: 要件定義.md

    PM->>v0: モックアップ作成（要件定義.md）
    v0-->>PM: モックアップコード（Next.js）

    PM->>v0: 画面機能一覧作成（モックアップコード）
    v0-->>PM: 画面機能一覧.md

    %% フェーズ2: 実装準備
    TL->>Cursor: プロジェクト環境構築（テンプレート使用）
    Cursor-->>TL: ディレクトリ構成（/app など）

    TL->>Cursor: 詳細設計作成（要件定義・モック・機能一覧）
    Cursor-->>TL: API設計・DB設計・バッチ設計（任意）・ロジック設計（任意）

    PM->>Cursor: シナリオ作成（要件定義.md + プロンプト）
    Cursor-->>PM: シナリオ.md

    TL->>Cursor: タスク一覧作成（タスク一覧.md）
    Cursor-->>TL: Issueテンプレート・一覧

    TL->>Cursor: GitHub Issue作成（MCP使用）
    Cursor->>GitHub: Issue登録

    %% フェーズ3: 開発・単体テスト
    BE->>Cursor: 実装・単体テスト（Issue呼出）
    FE->>Cursor: 実装・単体テスト（Issue呼出）
    Cursor-->>BE: コード・テストコード
    Cursor-->>FE: コード・テストコード

    BE->>Cursor: PR作成
    FE->>Cursor: PR作成
    Cursor->>GitHub: PR送信

    %% フェーズ4: 結合・システムテスト
    BE->>Cursor: API 結合テスト
    FE->>Cursor: E2E 結合テスト

    BE->>WES: システムテスト（MCP playwright）
    FE->>WES: システムテスト（MCP playwright）
```
