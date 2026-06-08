# Dependabot PR の統合作業プレイブック

複数の Dependabot（または Renovate）由来の Pull Request を **1 本のブランチにまとめ、レビュー用の PR を 1 つだけ** 出し、元の PR は **クローズする** までの標準手順です。任意の GitHub リポジトリで再利用できます。

**English (summary):** This playbook describes how to merge multiple open dependency-update PRs into one integration branch, open a single superseding PR, run local verification, and close the original PRs—reusable across repositories.

---

## 依頼時に渡す情報（テンプレ）

依頼側は次を明記すると手戻りが減ります。

- **対象リポジトリ**: `ORG/REPO`
- **ベースブランチ**: 通常は `develop` または `main`（Dependabot PR の **base** と一致させる）
- **対象 PR 番号一覧**: `#42, #43, ...` または「open かつ dependencies ラベルのものすべて」
- **関連 Issue 番号**（あれば）: メタ Issue に `Fixes #xx` で紐付けたい場合
- **ローカル検証コマンド**（リポジトリ標準に合わせて差し替え）:
  - 例: `yarn install --frozen-lockfile` / `yarn typecheck` / `yarn build`
  - 例: `npm ci` / `npm run test` / `npm run build`
- **特記事項**: 「セキュリティ系は個別対応」「major のみ別 PR」など

---

## 前提条件

- **GitHub CLI (`gh`)** が入り、`gh auth login` 済みで対象 org のリポジトリにアクセスできること。
- **Git** で `fetch` / `merge` ができること。
- 各 Dependabot PR が **同じベースブランチ** を向いていること（混在している場合は対象を分ける）。
- 方針: **問題がなければ** 統合する。ローカルまたは CI で失敗した場合は、どの変更が原因か切り分けてから続行する。

---

## 作業手順（チェックリスト）

### 1. 現状確認

```bash
cd /path/to/REPO

# オープンな PR・Issue を把握
gh pr list --repo ORG/REPO --state open
gh issue list --repo ORG/REPO --state open
```

各 PR の **base** と **head** を確認（以降 `BASE` と表記）。

```bash
gh pr view PR_NUMBER --repo ORG/REPO --json baseRefName,headRefName,title,mergeable
```

### 2. 最新化と統合用ブランチの作成

```bash
git checkout BASE
git pull origin BASE

# 統合用。日付やチケット番号を入れると追いやすい
git checkout -b chore/consolidate-deps-YYYY-MM
```

### 3. Dependabot ブランチの取り込み

リモートに head ブランチが既にあるため、`origin/...` を **順に merge** するのが一般的です（`yarn.lock` / `package-lock.json` の変更が重なるため）。沖突が出たら次節へ。

```bash
git fetch origin HEAD_BRANCH_1 HEAD_BRANCH_2 ... BASE

git merge origin/HEAD_BRANCH_1 -m "merge: dependabot change (PR #nn)"
git merge origin/HEAD_BRANCH_2 -m "merge: dependabot change (PR #mm)"
# ... 必要分だけ繰り返す
```

**マージ順の目安**

- ロックファイルの変更量が大きいものを先に入れてから、小さなものを重ねると、コンフリクト解消が楽なことが多い（保証ではない）。
- **同じパッケージ**を複数 PRが触っている場合は、**1 つに絞る**か、マージ後に `install` で整合を取る。

### 4. ロックファイルのコンフリクトが出た場合

- **原則**: 機械的に片方取りではなく、`package.json` の意図したバージョンに合わせて **`yarn install` / `npm install` でロックを再生成**し、動作確認できる状態にする。
- **再生成後**: 差分が意図と違わないか（無関係なバージョンが一斉に動いていないか）を確認する。

### 5. ローカル検証（リポジトリの標準に合わせて実行）

最低限の例:

```bash
# Yarn の例
yarn install --frozen-lockfile
yarn typecheck   # ある場合
yarn build       # または test / lint

# npm の例
npm ci
npm run build
npm test
```

**メジャーバージョンアップ**（例: TypeScript 5 → 6）では、`tsconfig` やビルドツールの非推奨・破壊的変更で追加修正が必要になることがあります。その場合は **同一統合ブランチにコミット**してよい（「統合 PR でまとめて直した」のがレビューしやすい）。

### 6. プッシュと「統合 PR」の作成

```bash
git push -u origin chore/consolidate-deps-YYYY-MM
```

PR 本文には次を含めると運用が楽です。

- **概要**: 何をまとめたか（パッケージ名・新旧バージョンは列挙するとよい）
- **Supersedes**: 置き換える PR 番号一覧 `#42, #43, ...`
- **検証結果**: 実行したコマンドと結果
- **Issue クローズ**: 対応したメタ Issue があれば本文に `Fixes #47` のように記載（マージ時に自動クローズ）

```bash
gh pr create --repo ORG/REPO --base BASE --head chore/consolidate-deps-YYYY-MM \
  --title "chore(deps): consolidate dependency updates" \
  --body "$(cat <<'EOF'
## Summary
- ...

## Supersedes
- #42, #43, ...

## Verification
- ...

Fixes #47
EOF
)"
```

※ **Windows PowerShell** では `$(cat <<'EOF'` が使えないため、ヒア文字列 `$body = @' ... '@` で変数に入れて `--body $body` とするか、`--body-file` を使う。

### 7. 旧 PR のクローズ

統合 PR がレビュー対象になるよう、元 PR に理由を残してクローズする。

```bash
gh pr close 42 --repo ORG/REPO --comment "Superseded by consolidated PR #NEW_NUMBER."
```

### 8. Issue へのコメント（任意だが推奨）

メタ Issue（「オープンな Dependabot PR を処理せよ」など）がある場合、**統合 PR の URL** と **実施した検証** をコメントしておくと、担当交代時に有利です。

---

## `gh` のワンライナー例（調査用）

```bash
gh pr list --repo ORG/REPO --state open --label dependencies
```

ラベル運用が無いリポジトリでは、`dependabot` が author の PR で絞るなど、現場ルールに合わせて検索条件を変える。

---

## やってはいけないこと・注意点

- **検証せずに**大量マージだけして PR を出さない（ロックファイル破損や CI 不全の原因になる）。
- **セキュリティアラート対応の PR** は、既定では別枠で優先度・経路が決まっていることが多い。**チーム方針を確認してから** 本手順に載せる。
- 自動生成された Issue に「一括マージは避ける」等の文言があっても、**チームまたは依頼者が「1 PR に統合してよい」と明示している場合**はその方針を優先し、Issue にその旨をコメントしておくと後から揉めない。
- 統合 PR マージ後、リモートの作業ブランチを削除するかはリポジトリの運用に従う。

---

## 成果物の受け入れ条件（レビュア・依頼者向け）

- [ ] 統合 PR が **正しいベースブランチ** を向けている
- [ ] 本文に **Supersedes / Fixes** が適切に書かれている
- [ ] **CI が緑**（または既知の失敗が説明されている）
- [ ] ローカルで合意した **検証コマンド** が実行済み
- [ ] 旧 Dependabot PR が **クローズ**され、参照先が統合 PR に向いている

---

## 関連ドキュメント（本 Wiki 内）

- [pull-request-rule](/development/pull-request-rule) — PR の書き方・レビュー前提
- [basic-workflow](/development/basic-workflow) — Issue〜マージの基本フロー
