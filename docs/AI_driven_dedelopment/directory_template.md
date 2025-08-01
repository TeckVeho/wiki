#### ディレクトリ構成テンプレート
```md
.
├── .editorconfig
├── .env.example                # ← 環境変数テンプレート
├── .eslintignore
├── .eslintrc.cjs               # ← Airbnb + Tailwind + Prettier
├── .gitignore
├── .prettierignore
├── .prettierrc.cjs
├── .commitlintrc.cjs           # ← Conventional Commits
├── next.config.mjs
├── package.json
├── pnpm-lock.yaml
├── README.md                   # ← プロジェクト概要テンプレート
├── tsconfig.json
│
├── app/                        # ── Front end (App Router)
│   ├── layout.tsx
│   ├── page.tsx
│   └── (auth)/page.tsx         # ← 例）/auth ルート
│
├── components/
│   ├── ui/                     # ← shadcn/ui で生成した汎用 UI
│   │   └── button.tsx
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── index.ts                # ← barrel export
│
├── lib/                        # ── フロント共通ロジック
│   ├── api.ts                  # ← fetch ラッパ
│   ├── auth.ts                 # ← NextAuth Helpers
│   └── validators.ts
│
├── prisma/                     # ── DB スキーマ & Seed
│   ├── schema.prisma
│   └── seed.ts
│
├── scripts/                    # ── 補助スクリプト
│   └── generate-openapi.ts
│
├── public/                     # ── 静的アセット
│   └── favicon.ico
│
├── styles/
│   ├── globals.css
│   └── tailwind.css
│
├── tests/
│   ├── unit/                   # ← vitest or jest
│   ├── integration/
│   └── e2e/                    # ← Playwright
│       └── example.spec.ts
│
├── docs/                       # ── ドキュメント & プロンプト
│   ├── requirements/要件定義.md
│   └── architecture.mmd        # ← Mermaid ER/Sequence
│
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── workflows/
│       ├── ci.yml              # ← Lint/Test/Build
│       └── release.yml         # ← タグで Cloud Run デプロイ

```

