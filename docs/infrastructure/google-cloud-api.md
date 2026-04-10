---
title: Google Maps API and GCP IAM
---

# Google Maps API management
# IAMと管理（グループ・ユーザー管理）
メニュー「IAMと管理」から、組織とユーザーの設定・管理を行うことができる

組織構成：組織（会社）の下にプロジェクトがある
| 1階層               | 2階層               | 管理者                     |
|---------------------|---------------------|----------------------------|
| veho-works.com      |      | 名和・城戸・茂木・Trang     |
|       | ATMTC for Arata     | 上階層を引き継ぐ    |
|       | ATMTC for Centlex     | 上階層を引き継ぐ    |
|       | ATMTC for XXXX     | 上階層を引き継ぐ    |

## グループ
メニュー「IAMと管理」＞「グループ」から、グループの追加・削除やグループへのユーザー追加・削除を行う<br />
※2024/10時点のグループ
| グループ名      　  | グループのメール           　  　  | 目的　　　　　　　　　　　　　　|メンバー            |
|------------------|---------------------------------|----------------------------|----------|
| gcp-admins    　 |  gcp-admins@veho-works.com 　　  | 組織に属する全てのリソース管理  |　名和・城戸・茂木・Trang　|
| gcp-billing   　  | gcp-billing@veho-works.com  　　  | 請求先作成・管理の権限    |　名和・彦田　　|
| gcp-project-admin| gcp-project-admin@veho-works.com  | プロジェクト作成・管理    |　名和・城戸・Trang　　　|


※ユーザー自体の登録管理は、Daisei VEHO worksのWorkspaceの管理コンソールで設定する。<br />
（「@veho-works.com」ドメインのユーザーのみ追加ができるように制限しているため）<br />
https://admin.google.com/u/2/ac/users?hl=ja<br />
（管理者：城戸・茂木・名和、ユーザー管理者：Trang）　

## IAM
メニュー「IAMと管理」＞「IAM」から、グループ（または特定ユーザー）に、ロールの割り当て・管理を行う


# 新規プロジェクトの作成
## 1.新規プロジェクト作成
新規プロジェクトを作成する<br />
1. メニュー「APIとサービス」を選択後、「プロジェクトを作成」選択し、「新しいプロジェクト」作成画面に遷移<br />
   ※組織ではなくプロジェクトにいる場合は、上部表示のプロジェクト名を選択し、「新しいプロジェクト」を選択
1. プロジェクト名「ATMTC for (会社名)」、請求先アカウント「（紐づけたい既存の請求先）」を入力し、「作成」を選択<br />
※組織・場所が「veho-works.com」になっているか確認する<br />

1. 新規プロジェクトが作成される

## 2.API keyの生成・設定
1. メニュー「APIとサービス」＞「有効なAPIとサービス」を選択し、有効にしたいAPIを「ENABLE」にする
1. メニュー「APIとサービス」＞「OAuth同意画面」を選択し、以下設定をする<br />
- User Type：外部
- アプリ名：「（任意のアプリ名を設定）」
- ユーザーサポートメール：「gcp-admins@veho-works.com」
- デベロッパーの連絡先情報：「gcp-admins@veho-works.com」
- ※他は任意項目なので入力不要

2. メニュー「APIとサービス」＞「認証情報」を選択し、「認証情報を作成」からAPIキーを作成した後、以下を設定する
- 名前：「Web/IP/iOS/Andoroid」などを入力する
- キーの制限：アプリケーションの制限を設定する
- APIの制限：制限するAPIを選択する

3. 上記内容と生成されたAPI KeyをGoogleスプレッドシート「Google Could Platform_ATMTC」に記載し、エンジニアに共有する<br />
https://docs.google.com/spreadsheets/d/1_ftIHqeWNDfgM28HtyPhG0sk7OoJJF8qsafT80tDOmk/edit?gid=0#gid=0

# [English] Google Maps API Management

## IAM and Administration (Group and User Management)
From the "IAM & Admin" menu, you can configure and manage organizations and users.

**Organization Structure:** Projects are under organizations (companies)

| Level 1               | Level 2               | Administrator                     |
|-----------------------|-----------------------|-----------------------------------|
| veho-works.com        |                       | Nawa, Kido, Mogi, Trang           |
|                       | ATMTC for Arata      | Inherits from upper level         |
|                       | ATMTC for Centlex     | Inherits from upper level         |
|                       | ATMTC for XXXX       | Inherits from upper level         |

## Groups
From the "IAM & Admin" menu > "Groups," you can add or remove groups and add or remove users from groups.  
*As of October 2024, the following groups exist:*

| Group Name             | Group Email                  | Purpose                               | Members                  |
|-----------------------|------------------------------|---------------------------------------|--------------------------|
| gcp-admins            | gcp-admins@veho-works.com    | Management of all resources in the organization | Nawa, Kido, Mogi, Trang  |
| gcp-billing           | gcp-billing@veho-works.com    | Authority to create and manage billing accounts | Nawa, Hikota            |
| gcp-project-admin     | gcp-project-admin@veho-works.com | Project creation and management          | Nawa, Kido, Trang       |



*User registration management itself is set in the Daisei VEHO works Workspace management console. (Registration is limited to users with the "@veho-works.com" domain.)*  
[https://admin.google.com/u/2/ac/users?hl=ja](https://admin.google.com/u/2/ac/users?hl=ja)  
(Administrators: Kido, Mogi, Nawa; User Manager: Trang)  

## IAM
From the "IAM & Admin" menu > "IAM," you can assign and manage roles for groups (or specific users).  


# Creating a New Project

## 1. Creating a New Project
Create a new project.
1. Select the "APIs & Services" menu and then select "Create Project," navigating to the "Create New Project" screen. *If you are in a project rather than an organization, select the project name displayed at the top and select "New Project."*
2. Enter the project name "ATMTC for (Company Name)" and the billing account "(an existing one you want to link)" and select "Create."  
   *Ensure the organization/location is "veho-works.com."*  
3. A new project will be created.

## 2. Generating and Setting the API Key
1. Select the "APIs & Services" menu > "Enabled APIs and Services" and enable the APIs you want.
2. Select the "APIs & Services" menu > "OAuth Consent Screen," and configure the following settings:
   - User Type: External
   - App Name: "(Set any app name)"
   - User Support Email: "gcp-admins@veho-works.com"
   - Developer Contact Information: "gcp-admins@veho-works.com"
   *Other fields are optional and do not need to be filled in.*  

3. Select the "APIs & Services" menu > "Credentials," and from "Create Credentials," create an API key, then configure the following:
   - Name: Enter "Web/IP/iOS/Android," etc.
   - Key Restrictions: Set application restrictions.
   - API Restrictions: Select the APIs to restrict.  
4. Document the above information and the generated API Key in the Google Spreadsheet "Google Cloud Platform_ATMTC" and share it with the engineers.  
   [https://docs.google.com/spreadsheets/d/1_ftIHqeWNDfgM28HtyPhG0sk7OoJJF8qsafT80tDOmk/edit?gid=0#gid=0]
