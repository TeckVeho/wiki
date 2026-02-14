# AWA_SES_SMTP_Configuration_Manual 
（Amazon SES 送信サーバー設定マニュアル）

## 概要
本手順書は、**送信サーバーを Amazon SES に切り替えるための設定方法**をまとめたものです。  
個人のメールアドレス（Gmail / Outlook）からの送信を、Amazon SES 経由で行います。
- SMTP 認証情報は **AWS 管理者が発行**
- 利用者は **Gmail / Outlook 側の設定のみ実施**

## ①【AWS管理者向け】SES コンソールで SMTP 認証情報を作成する手順

> 対象：AWS 管理者（城戸／名和）  
> 実施タイミング：新規利用者が発生したとき

### 1. AWS マネジメントコンソールにログイン
- リージョンを **Asia Pacific (Tokyo) / ap-northeast-1** に設定

### 2. Amazon SES コンソールを開く
- サービス一覧 → **Amazon SES**

### 3. SMTP settings を開く
- 左メニュー → **SMTP settings**

### 4. 「Create SMTP credentials」をクリック

### 5. SMTP 用 IAM ユーザーを作成
- ユーザー名例
`
ses-smtp-<user-name>
`
- 「Create user」を実行

### 6. SMTP 認証情報を取得
作成完了時に **1回だけ** 以下が表示される：

- **SMTP Username**
- **SMTP Password**
⚠️ この画面は再表示されないので **必ず安全な場所に控える**

### 7. 利用者へ通知
- SMTP Username / Password を **DM 等の安全な手段で個別共有**



## ② 【利用者向け】Gmail での送信サーバー変更手順

### 1. Gmail を開く

### 2. 設定画面を開く
- 右上の **歯車アイコン**
- **「すべての設定を表示」** をクリック

### 3. 「アカウントとインポート」をクリック
<img width="601" height="141" alt="image" src="https://github.com/user-attachments/assets/694828f7-b686-49d9-88f4-3dd30dbafd18" />

### 4. 送信元設定を編集
- **「情報を編集」** または **「他のメールアドレスを追加」** をクリック
<img width="765" height="165" alt="image" src="https://github.com/user-attachments/assets/19618cc9-f395-4fff-962d-b29e01512536" />

### 5. 送信元メールアドレスを追加
<img width="746" height="449" alt="image" src="https://github.com/user-attachments/assets/fd502253-df70-431c-841b-14dc6e3ce854" />

### 6. 送信サーバー（Amazon SES）の情報を入力
<img width="750" height="434" alt="image" src="https://github.com/user-attachments/assets/b680a9a0-c66e-4cb2-8e8f-6b3e98a42a49" />

| 項目 | 設定値 |
|---|---|
| SMTP サーバー | `email-smtp.ap-northeast-1.amazonaws.com` |
| ユーザー名 | AWS管理者より案内された **SMTP Username** |
| パスワード | AWS管理者より案内された **SMTP Password** |
| ポート | 587 |
| 暗号化 | TLS（STARTTLS） |

### 7. 確認メールを受信して認証
- 該当メールアドレスで確認メールを受信
- メール内リンクをクリックして **認証完了**

---

## ③ 【利用者向け】Outlook（new）での送信サーバー設定手順

### 1. Outlook（new）を開く

### 2. アカウント設定を開く
- 設定 → **アカウント**
- 該当メールアドレスを選択
- IMAPのパスワード（自分のメールアドレスのパスワード）を入力
<img width="509" height="417" alt="image" src="https://github.com/user-attachments/assets/d008dece-f21c-4030-a838-f2c826fbbe5a" />
<img width="558" height="648" alt="image" src="https://github.com/user-attachments/assets/ac2493fd-5b6b-437a-b455-bc84444b27ba" />

### 3. 送信サーバー（Amazon SES）を設定
- メールプロバイダー　＞　**POP** を選択 
<img width="521" height="629" alt="image" src="https://github.com/user-attachments/assets/767d42a1-b79b-4547-b533-49223e4c4877" />

- 送信サーバー（Amazon SES）の情報を入力
<img width="544" height="638" alt="image" src="https://github.com/user-attachments/assets/7a720bed-cd9a-4e3d-90b3-75bbac63d083" />
<img width="525" height="371" alt="image" src="https://github.com/user-attachments/assets/650a5c60-24da-46f7-8fb8-3a50f3bd959d" />

| 項目 | 設定値 |
|---|---|
| パスワード | 自分のメールアドレスのパスワード |
| POP受信 サーバー | `sv6148.xserver.jp` |
| ポート | 995 |
| セキュア接続タイプ | SSL/TLS(推奨) |
| SMTP ユーザー名 | AWS管理者より案内された **SMTP Username** |
| SMTP パスワード | AWS管理者より案内された **SMTP Password** |
| SMTP 送信サーバー |  `email-smtp.ap-northeast-1.amazonaws.com` |

### 4. 設定を保存して完了

---

## 注意事項（重要）
- SMTP 認証情報は **個人専用（共有禁止）**
- テスト目的で **ランダムなメールアドレスへ送信しない**
- 不要になった場合は **AWS管理者へ削除依頼**
- SMTP Password は再発行時に **必ず更新が必要**

---

## 問い合わせ先
- AWS 管理者：**城戸 / 名和**

---

---

# 【JP】Amazon SES SMTP Configuration Manual 

## Overview
This document describes how to configure **Amazon SES as the outgoing mail server** for personal email accounts such as Gmail and Outlook.

- SMTP credentials are **issued by AWS administrators**
- End users only need to configure their **email client settings**

---

## ① [For AWS Administrators] Create SMTP Credentials in Amazon SES

> Audience: AWS Administrators  
> When: When a new user requires SES SMTP access

### 1. Log in to AWS Management Console
- Set the region to **Asia Pacific (Tokyo) / ap-northeast-1**

### 2. Open Amazon SES
- Services → **Amazon SES**

### 3. Open SMTP settings
- Left menu → **SMTP settings**

### 4. Click **Create SMTP credentials**

### 5. Create an IAM user for SMTP
- Example username:
`
ses-smtp-<user-name>
`
- Click **Create user**

### 6. Obtain SMTP credentials
The following information will be shown **only once**:

- **SMTP Username**
- **SMTP Password**

⚠️ These credentials cannot be displayed again  
→ Store them securely

### 7. Share credentials with the user
- Share via **secure channels only** (e.g., direct message)
- Do **not** post in chat rooms or wikis

---

## ② Gmail: Configure Outgoing Mail Server (For Users)

### 1. Open Gmail

### 2. Open Settings
- Click the **gear icon**
- Click **See all settings**

### 3. Click **Accounts and Import**

### 4. Edit sending settings
- Click **Edit info** or **Add another email address**

### 5. Add the sender email address

### 6. Enter Amazon SES SMTP settings

| Field | Value |
|---|---|
| SMTP Server | `email-smtp.ap-northeast-1.amazonaws.com` |
| Username | **SMTP Username** provided by AWS admin |
| Password | **SMTP Password** provided by AWS admin |
| Port | 587 |
| Encryption | TLS (STARTTLS) |

### 7. Verify the email address
- Receive the verification email
- Click the link to complete verification

---

## ③ Outlook (new): Configure Outgoing Mail Server (For Users)

### 1. Open Outlook (new)

### 2. Open Account Settings
- Go to **Settings** → **Accounts**
- Select the target email address
- Enter the **IMAP password** (your email account password)


### 3. Configure the Outgoing Server (Amazon SES)
- Select **POP** under **Mail provider**
- Enter the outgoing server (Amazon SES) details

| Item | Value |
|---|---|
| Password | Your email account password |
| POP Incoming Server | `sv6148.xserver.jp` |
| Port | 995 |
| Secure Connection Type | SSL/TLS (Recommended) |
| SMTP Username | **SMTP Username** provided by the AWS administrator |
| SMTP Password | **SMTP Password** provided by the AWS administrator |
| SMTP Outgoing Server | `email-smtp.ap-northeast-1.amazonaws.com` |

### 4. Save the settings to complete


---

## Important Notes
- SMTP credentials are **for individual use only**
- Do not send test emails to random or unverified addresses
- Request deletion from AWS admin when no longer needed
- Regenerate credentials when rotated or reissued

---

## Contact
- AWS Administrators: **Kido / Nawa**

