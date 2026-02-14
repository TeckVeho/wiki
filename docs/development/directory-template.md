#### ディレクトリ構成テンプレート
```md
.
├── .editorconfig
├── .gitignore
├── .prettierrc.cjs
├── .eslintignore
├── .eslintrc.cjs               # ルート共通 ESLint ルール
├── .commitlintrc.cjs
├── .env.example                # 共通のみ記載
├── package.json                # pnpm workspace ルート
├── pnpm-lock.yaml
├── pnpm-workspace.yaml         # apps/* を workspace として宣言
├── README.md                   # プロジェクト概要
├── apps
│   ├── frontend                # ── Next.js (App Router)
│   │   ├── package.json
│   │   ├── next.config.mjs
│   │   ├── tsconfig.json
│   │   ├── app
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   └── (auth)
│   │   │       └── page.tsx
│   │   ├── components
│   │   │   ├── ui              # shadcn/ui
│   │   │   │   └── button.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── index.ts
│   │   ├── lib
│   │   │   ├── api.ts
│   │   │   ├── auth.ts
│   │   │   └── validators.ts
│   │   ├── public
│   │   │   └── favicon.ico
│   │   ├── styles
│   │   │   ├── globals.css
│   │   │   └── tailwind.css
│   │   ├── tests
│   │   │   ├── unit
│   │   │   ├── integration
│   │   │   └── e2e
│   │   │       └── example.spec.ts
│   │   └── __mockup            # ← 生成したモックアップコード一式（任意。直接置換する場合は省略可）
│   └── backend                 # ── API & DB レイヤ
│       ├── package.json
│       ├── tsconfig.json
│       ├── src
│       │   ├── index.ts
│       │   ├── routes
│       │   ├── controllers
│       │   └── services
│       ├── lib
│       ├── prisma
│       │   ├── schema.prisma
│       │   └── seed.ts
│       ├── scripts
│       │   └── generate-openapi.ts   # OpenAPI 生成スクリプト
│       └── tests
│           ├── unit
│           └── integration
├── docs                         # ── ドキュメント & プロンプト
│   ├── requirements             # 要件・機能
│   │   ├── requirements_definition.md   # 要件定義
│   │   └── screen_feature_map.md        # 画面機能一覧
│   ├── design                   # アーキテクチャ／詳細設計
│   │   ├── api
│   │   │   └── openapi.yaml
│   │   ├── db
│   │   │   ├── er_tables.md
│   │   │   └── schema.sql
│   │   ├── batch
│   │   │   └── batch_design.md     # （バッチがある場合）
│   │   ├── detail_logic.mmd        # Mermaid 図（任意）
│   │   └── architecture.mmd        # 既存: システム全体アーキ図
│   ├── test
│   │   └── test_scenarios.md            # シナリオ
│   └── planning
│       ├── task_breakdown.md            #  タスク一覧
│       └── ISSUE_TEMPLATE.md       # GitHub 反映前の元ファイル
├── .github
│   ├── ISSUE_TEMPLATE
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── workflows
│       ├── ci.yml
│       └── release.yml
└── 
```
