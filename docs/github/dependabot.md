---
title: Dependabot Version Update Settings (dependabot.yml)
---

# Dependabot Version Update Settings (dependabot.yml)

This document explains how to configure GitHub Dependabot to **automatically create pull requests for dependency updates** (version updates / security updates).  
You may generate and adjust the configuration file (`dependabot.yml`) using an LLM such as ChatGPT.

---

## 1. Purpose

By enabling Dependabot, you can continuously achieve the following:

- **Detect vulnerabilities (Dependabot alerts)**
- **Automatically create dependency update PRs** (composer / npm / GitHub Actions, etc.)
- Add labels to update PRs and integrate them into your team workflow (review, CI, release process)

---

## 2. File Location

Dependabot configuration must be placed at:

- `.github/dependabot.yml`

Example structure:

```

repo-root/
.github/
dependabot.yml
backend/
frontend/

````

---

## 3. Full Example (dependabot.yml)

This example checks updates weekly for Laravel (Composer), Frontend (npm), and GitHub Actions.

```yaml
version: 2

updates:
  # =====================================
  # Laravel (Composer)
  # =====================================
  - package-ecosystem: "composer"
    directory: "/backend"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 5
    labels:
      - "dependencies"
      - "php"
      - "laravel"
    ignore:
      # Prevent Laravel major upgrades (e.g. 10 → 11)
      - dependency-name: "laravel/framework"
        update-types: ["version-update:semver-major"]

  # =====================================
  # Frontend (React / Vue - npm)
  # =====================================
  - package-ecosystem: "npm"
    directory: "/frontend"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 5
    labels:
      - "dependencies"
      - "frontend"
    ignore:
      # Optional: block major version upgrades
      - dependency-name: "*"
        update-types: ["version-update:semver-major"]

  # =====================================
  # GitHub Actions
  # =====================================
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
    labels:
      - "dependencies"
      - "ci"
````

---

## 4. Field Definitions

### version

```yaml
version: 2
```

The Dependabot configuration format version. In most cases, this should remain `2`.

---

### updates

```yaml
updates:
  - package-ecosystem: "npm"
    directory: "/frontend"
```

You can define multiple update targets.
Dependabot identifies what to update based on the combination of `package-ecosystem` and `directory`.

---

### package-ecosystem

The dependency manager type that Dependabot should monitor.

* `composer`: Laravel / PHP
* `npm`: Node / React / Vue
* `github-actions`: versions used in `.github/workflows/*.yml`

---

### directory

Specifies the directory where the manifest file is located.

Examples:

* composer → `/backend` (expects `backend/composer.json`)
* npm → `/frontend` (expects `frontend/package.json`)
* actions → `/` (usually `/` because workflows are under `.github/workflows`)

---

### schedule.interval

```yaml
schedule:
  interval: "weekly"
```

How often Dependabot checks for updates.

* `daily`
* `weekly`
* `monthly`

For most teams, starting with `weekly` is a good balance.

---

### open-pull-requests-limit

```yaml
open-pull-requests-limit: 5
```

The maximum number of open Dependabot update PRs allowed at the same time.
This prevents the repository from being flooded with too many update PRs.

---

### labels

```yaml
labels:
  - "dependencies"
  - "frontend"
```

Labels automatically added to Dependabot PRs.
Useful for filtering PRs and applying review/CI rules.

---

### ignore (Block Major Updates)

```yaml
ignore:
  - dependency-name: "*"
    update-types: ["version-update:semver-major"]
```

Allows you to suppress **major version upgrades**, which are more likely to introduce breaking changes.
For npm, this is often recommended at the beginning to keep updates stable.

In the example, Laravel major upgrades are blocked only for `laravel/framework`.

---

## 5. GitHub UI Settings (Enable Dependabot)

In your GitHub repository settings, enable the following options:

Repository Menu **"Settings"** → **Advanced Security** → **Dependabot**

- **Dependabot alerts** (detects vulnerabilities)
- **Dependabot security updates** (automatically creates PRs to fix vulnerable dependencies)

---
## 6. Rules

* Weekly update PRs are created → merge ones that pass CI
* Large upgrades (major updates) should be planned as separate tasks/tickets
* Filter Dependabot PRs using the `dependencies` label
* GitHub Actions updates are usually low-risk, so they can be merged proactively




# Dependabot version check settings (dependabot.yml)

このドキュメントは、GitHub Dependabot を使って **依存パッケージの更新PR（version updates / security updates）を自動作成**するための設定内容を説明します。  
設定ファイル（`dependabot.yml`）自体は ChatGPT などの LLM を使って生成・調整して構いません。

---

## 1. 目的

Dependabot を有効化することで、以下を継続的に行えるようになります。

- **脆弱性（Dependabot alerts）の検知**
- **依存関係の更新PRの自動作成**（composer / npm / GitHub Actions など）
- 更新PRにラベルを付けて、チームの運用ルール（レビュー、CI、リリース）に統合する

---

## 2. 設定ファイルの配置

Dependabot の設定はリポジトリ内の以下に配置します。

- `.github/dependabot.yml`

例:
```

repo-root/
.github/
dependabot.yml
backend/
frontend/

````

---

## 3. dependabot.yml 全体例

以下は、Laravel(Composer) / Frontend(npm) / GitHub Actions の更新を週1でチェックする例です。

```yaml
version: 2

updates:
  # =====================================
  # Laravel (Composer)
  # =====================================
  - package-ecosystem: "composer"
    directory: "/backend"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 5
    labels:
      - "dependencies"
      - "php"
      - "laravel"
    ignore:
      # Laravel メジャーアップデート防止（例: 10 → 11）
      - dependency-name: "laravel/framework"
        update-types: ["version-update:semver-major"]

  # =====================================
  # Frontend (React / Vue - npm)
  # =====================================
  - package-ecosystem: "npm"
    directory: "/frontend"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 5
    labels:
      - "dependencies"
      - "frontend"
    ignore:
      # メジャーアップデートを抑制したい場合（任意）
      - dependency-name: "*"
        update-types: ["version-update:semver-major"]

  # =====================================
  # GitHub Actions
  # =====================================
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
    labels:
      - "dependencies"
      - "ci"
````

---

## 4. フィールドの意味

### version

```yaml
version: 2
```

Dependabot 設定のフォーマットバージョンです。基本は `2` 固定です。

---

### updates

```yaml
updates:
  - package-ecosystem: "npm"
    directory: "/frontend"
```

更新対象を複数定義できます。
`package-ecosystem` と `directory` の組み合わせで「どの依存関係をどこから見るか」を決めます。

---

### package-ecosystem

Dependabot がサポートするパッケージマネージャ種別です。

* `composer` : Laravel / PHP
* `npm` : Node / React / Vue
* `github-actions` : `.github/workflows/*.yml` の Action のバージョン

---

### directory

対象となる `manifest`（依存定義ファイル）が置かれているディレクトリを指定します。

例:

* composer → `/backend`（`backend/composer.json`）
* npm → `/frontend`（`frontend/package.json`）
* actions → `/`（`.github/workflows` を見るので基本 `/`）

---

### schedule.interval

```yaml
schedule:
  interval: "weekly"
```

更新チェック頻度です。

* `daily`
* `weekly`
* `monthly`

運用上、まずは `weekly` が無難です。

---

### open-pull-requests-limit

```yaml
open-pull-requests-limit: 5
```

Dependabot が同時に開いてよい更新PRの上限です。
更新が溜まりすぎてPRだらけになるのを防ぎます。

---

### labels

```yaml
labels:
  - "dependencies"
  - "frontend"
```

Dependabot PR に自動で付与するラベルです。
CIやレビュー担当ルールがある場合に便利です。

---

### ignore（メジャーアップデート抑制）

```yaml
ignore:
  - dependency-name: "*"
    update-types: ["version-update:semver-major"]
```

破壊的変更が入りやすい **メジャーバージョン更新を抑制**できます。
特に npm はメジャー更新で壊れやすいので、最初は無効化しておく運用が安定します。

Laravel は `laravel/framework` のみメジャー更新を抑制する例になっています。

---

## 5. GitHub 側の有効化ポイント（UI）

GitHub のリポジトリ設定で、以下がONにします。

Repository Menu "Setting" -> Advanced Security -> Dependabot

* **Dependabot alerts**（脆弱性検知）
* **Dependabot security updates**（脆弱性がある依存関係を修正するPRを自動作成）

※ バージョン更新（version updates）は `.github/dependabot.yml` により動作します。

---

## 6. 運用ルール

* 週次で更新PRが出る → CIが通るものはまとめてマージ
* 大きめの更新（メジャー）は別チケット化して計画対応
* Dependabot PR は `dependencies` ラベルでフィルタして確認
* “Actions” 更新は壊れにくいので積極的に取り込む
