
# GitHub Issue Creator

## Copy Spread Sheet
Copy the Spread Sheet below
https://docs.google.com/spreadsheets/d/1LXZQjNPYiyFQv-gF3OAJm1sqD_Xdq87fxh3zM77145g/edit#gid=1386106268

Pattern A: Project Google Drive directory
Pattern B: Personal Google Drive (if you want to save the Token described later in Sheet)


## Preparation
Create a token from https://github.com/settings/tokens.
1. Click Generate new token. Select New personal access token (classic)
2. Setting permissions
  - Check all in repo
  - Check all for project
3. Click Generate token
4. Copy the generated Token and save it somewhere

## setting
Enter the Owner and Repository of the settings sheet.

Example: If the target is https://github.com/TeckVeho/360-degree-feedback
Owner : TeckVeho
Repository: 360-degree-feedback

* If you enter the Token you created earlier in AccessToken, you will not have to enter the Token every time you run it in the future.
* In that case, make sure that only you can access SpreadSheet.

## How to use
1. Enter Title ,Body ,Labels ,Milestone( ID ) and Assignees

Enter the Milestone ID.
This is the number at the end of the URL.
- https://github.com/TeckVeho/*/milestone/1 ←


2. Check the check button in the row of the issue you want to create.
3. Click Scripts -> Create Issue in the job menu
*Only for the first time, you will receive a warning saying "This app has not been verified by Google."
*Please click on details to give permission.
4. Enter the AccessToken in the pop-up prompt (skip if saved in the sheet)


# GitHub Issue Creator

## Spread Sheetのコピー
以下のSpread Sheetコピーする
https://docs.google.com/spreadsheets/d/1LXZQjNPYiyFQv-gF3OAJm1sqD_Xdq87fxh3zM77145g/edit#gid=1386106268

パターンA : プロジェクトのGoogle Driveディレクトリ
パターンB : 個人のGoogle Drive ( 後述のTokenをSheetで保存しておきたい場合 )


## 準備
https://github.com/settings/tokens　から　Tokenを作成しておく。
1. Generate new token.をクリック　New personal access token (classic)　を選択
2. 権限の設定
  - repoにすべてチェック
  - projectにすべてチェック
3. Generate tokenをクリック
4. 生成されたTokenをコピーしてどこかに保存しておく

## 設定
settings シートのOwnerとRepositoryを入力する。

例：https://github.com/TeckVeho/360-degree-feedbackが対象の場合
Owner : TeckVeho
Repository : 360-degree-feedback

＊ AccessTokenに先ほど作成したTokenを入力しておくと、今後実行のたびにTokenを入力する手間が省ける
＊ その場合はSpreadSheetを自分だけしかアクセスできないようにしておく

## 使い方
1. Title , Body , Labels ,Milestone( ID ) , Assignees を入力する。
マイルストーンはID を入力します。
URLの末尾にある番号です。
- https://github.com/TeckVeho/*/milestone/1 ←

2. 作成したいissueの行のチェックボタンにチェックを入れる
3. ジョブメニューの Scripts -> Issue作成 をクリックする
＊初回のみ「このアプリはGoogleで確認されていません」の警告がでます。
＊詳細を押して許可をしてください。
4. AccessTokenをポップアッププロンプトに入力する ( シートに保存してある場合は省略 )





