---
title: Xserver API キー
---

# Xserver API キー

## 1. 用途概要
Xserver API は、Xserver のサーバー設定や各種リソースを外部ツール・AIエディタ・スクリプトから操作するための API です。

主に以下の用途で利用します。
- サーバー情報の取得
- ドメイン / DNS / SSL 設定の確認・更新
- メールアカウント管理
- MySQL 管理
- WordPress 管理
- SSH / FTP / Cron 管理
- アクセスログ / エラーログ取得

手作業で行っている Xserver の設定確認・棚卸し・一部操作を自動化する目的で利用します。

---

## 2. API キーの発行方法

Xserver API を利用するには、Xserver の管理画面から API キーを発行します。

手順：

1. Xserver の管理画面にログインする
2. API キー管理画面を開く
3. 新しい API キーを作成する
4. 利用目的に応じて権限を設定する
5. 発行された API キーをコピーして保存する

API キーは発行後すぐに安全な場所へ保存します。

---

## 3. 使い方

### 3.1 API リファレンス

Xserver API の仕様は以下を参照します。

```txt
https://developer.xserver.ne.jp/api/server/
```

### 3.2 OpenAPI 定義の保存

API 仕様は OpenAPI JSON として取得できます。

```txt
https://developer.xserver.ne.jp/api/server/openapi.json
```

開発時は、この `openapi.json` をプロジェクト内に保存しておくと、Cursor などの AI エディタに API 仕様を理解させやすくなります。

保存例：

```txt
docs/xserver/openapi.json
```

または

```txt
references/xserver/openapi.json
```

### 3.3 API キーの利用

API キーはコードに直接書かず、環境変数から読み込みます。

例：
```txt
XSERVER_API_KEY=xxxxxxxx
```
`.env` を利用する場合は、`.env` を Git 管理対象外にします。

---

## 4. Cursor を利用した実装方法

Cursor で Xserver API を利用する場合は、以下の情報を渡します。

* 保存済みの `openapi.json`
* 利用する API キーの環境変数名
* やりたいこと
* 読み取りだけか、更新操作を含むか

Cursor への指示は、実装方法を細かく指定するよりも、まず目的をそのまま書きます。

### 指示例：サーバー設定の棚卸し

```txt
Xserver API を使って、vw-dev.com の DNS設定状況を csvに書き出してください。

API仕様は docs/xserver/openapi.json を参照してください。
APIキーは環境変数 .env の XSERVER_API_KEY から読み込んでください。

```

---

## 5. 注意事項

* API キーは GitHub にコミットしない
* Slack やドキュメントに API キーを貼らない
* `.env` を使う場合は `.gitignore` に含める
* 本番更新系の操作は、実行前に内容を確認できるようにする
* 不要になった API キーは削除する