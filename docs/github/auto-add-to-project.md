---
title: Auto-add Issues to a GitHub Project
---

> **Ngôn ngữ / Language / 言語**: [🇻🇳 Tiếng Việt](#vietnamese) | [🇬🇧 English](#english) | [🇯🇵 日本語](#japanese)

Tài liệu được sắp xếp theo thứ tự **Tiếng Việt → English → 日本語**.  
This document is organized as **Vietnamese → English → Japanese**.  
このドキュメントは **ベトナム語 → 英語 → 日本語** の順で構成しています。

---

## Vietnamese

*Tiếng Việt*

### Tự động thêm Issue vào GitHub Project

#### Tổng quan

Tính năng chuẩn **Auto-add to project** của GitHub Projects tự động thêm Issue tạo trong Repository vào Project đã chỉ định.

Không cần GitHub Actions hay script bổ sung.

#### Các bước thiết lập

##### 1. Mở Project đích

Trên GitHub, mở Project mà bạn muốn tự động thêm Issue.

URL của Project (organization) có dạng:

`https://github.com/orgs/{organization}/projects/{project_number}`

##### 2. Mở Workflows

1. Nhấp menu `…` ở góc trên bên phải màn hình Project
2. Chọn `Workflows`
3. Trong `Default workflows` bên trái, chọn `Auto-add to project`

##### 3. Thiết lập quy tắc tự động thêm

1. Nhấp `Edit` ở góc trên bên phải
2. Trong `Filters`, chọn Repository đích ở ô chọn Repository
3. Nhập vào ô bộ lọc bên cạnh:

```text
is:issue
```

Với thiết lập này, mọi Issue của Repository đích đều nằm trong phạm vi tự động thêm.

##### 4. Bật Workflow

1. Nhấp `Save and turn on workflow`
2. Xác nhận trạng thái Workflow là `On`

Thiết lập hoàn tất.

#### Ví dụ bộ lọc

| Bộ lọc | Hành vi |
| --- | --- |
| `is:issue` | Mọi Issue |
| `is:issue is:open` | Chỉ Issue đang Open |
| `is:issue label:bug` | Chỉ Issue có nhãn `bug` |
| `is:issue,pr` | Cả Issue và Pull Request |
| `is:pr` | Chỉ Pull Request |

Nên dùng `is:issue` để thêm mọi Issue.

#### Khi áp dụng cho nhiều Repository

1. Mở `Workflows` → `Auto-add to project`
2. Từ menu `…` của Workflow, chọn `Duplicate workflow`
3. Ở Workflow đã nhân bản, chọn Repository khác
4. Thiết lập bộ lọc rồi bật Workflow

Mỗi Repository một Workflow để gom Issue của nhiều Repository vào một Project.

Số Workflow Auto-add có thể tạo phụ thuộc vào gói GitHub.

#### Kiểm tra hoạt động

1. Tạo Issue mới trong Repository đích
2. Mở Project đích
3. Xác nhận Issue vừa tạo đã được thêm vào Project

#### Lưu ý

- Issue tạo trước khi bật thiết lập không được thêm hàng loạt chỉ bằng việc bật Workflow.
- Issue cũ vẫn có thể được thêm sau đó, nếu một lần cập nhật khiến Issue khớp bộ lọc.
- Auto-add chỉ thêm Issue vào Project. Các trường như Status do Workflow khác quản lý.
- Nếu không được thêm, hãy kiểm tra Workflow đang `On`, đúng Repository và đúng bộ lọc.

#### Tài liệu tham khảo

GitHub Docs chưa có bản tiếng Việt. Bản tiếng Anh:

[Adding items automatically](https://docs.github.com/en/issues/planning-and-tracking-with-projects/automating-your-project/adding-items-automatically)

---

## English

*English*

### Auto-add Issues to a GitHub Project

#### Overview

GitHub Projects includes a built-in workflow, **Auto-add to project**, that adds Issues created in a repository to a chosen Project.

GitHub Actions and extra scripts are not required.

#### Setup

##### 1. Open the target Project

In GitHub, open the Project that should receive Issues automatically.

An organization Project URL has this form:

`https://github.com/orgs/{organization}/projects/{project_number}`

##### 2. Open Workflows

1. Click the `…` menu at the top right of the Project
2. Select `Workflows`
3. Under `Default workflows` on the left, select `Auto-add to project`

##### 3. Configure the auto-add rule

1. Click `Edit` at the top right
2. In `Filters`, choose the target repository
3. In the filter field next to it, enter:

```text
is:issue
```

This includes every Issue in that repository.

##### 4. Turn the workflow on

1. Click `Save and turn on workflow`
2. Confirm the workflow status is `On`

Setup is complete.

#### Filter examples

| Filter | Behavior |
| --- | --- |
| `is:issue` | All Issues |
| `is:issue is:open` | Open Issues only |
| `is:issue label:bug` | Issues labeled `bug` only |
| `is:issue,pr` | Both Issues and pull requests |
| `is:pr` | Pull requests only |

Use `is:issue` when every Issue should be added.

#### Multiple repositories

1. Open `Workflows` → `Auto-add to project`
2. From the workflow `…` menu, select `Duplicate workflow`
3. On the copy, select the other repository
4. Set the filter and turn the workflow on

One workflow per repository collects Issues from several repositories into a single Project.

The number of auto-add workflows you can create depends on the GitHub plan.

#### Verify

1. Create a new Issue in the target repository
2. Open the target Project
3. Confirm the new Issue was added to the Project

#### Notes

- Issues that already existed before the workflow was turned on are not bulk-added by enabling it.
- An existing Issue can still be added later if an update makes it match the filter.
- Auto-add only adds the Issue to the Project. Fields such as Status are managed by other workflows.
- If an Issue is not added, confirm the workflow is `On` and that the repository and filter are correct.

#### Reference

[GitHub Docs: Adding items automatically](https://docs.github.com/en/issues/planning-and-tracking-with-projects/automating-your-project/adding-items-automatically)

---

## Japanese

*日本語*

### GitHub IssueをProjectへ自動追加する

#### 概要

GitHub Projects の標準機能 **Auto-add to project** を使うと、Repository で作成された Issue を指定した Project へ自動的に追加できます。

GitHub Actions や追加のスクリプトは不要です。

#### 設定手順

##### 1. 対象 Project を開く

GitHub で、Issue を自動追加したい Project を開きます。

Organization の Project URL は次の形式です。

`https://github.com/orgs/{organization}/projects/{project_number}`

##### 2. Workflows を開く

1. Project 画面右上の `…` メニューをクリック
2. `Workflows` を選択
3. 左側の `Default workflows` から `Auto-add to project` を選択

##### 3. 自動追加ルールを設定する

1. 右上の `Edit` をクリック
2. `Filters` の Repository 選択欄から、対象 Repository を選択
3. 隣のフィルター入力欄に次を入力

```text
is:issue
```

この設定では、対象 Repository の Issue がすべて自動追加の対象になります。

##### 4. Workflow を有効化する

1. `Save and turn on workflow` をクリック
2. Workflow の状態が `On` になっていることを確認

これで設定完了です。

#### フィルター設定例

| フィルター | 動作 |
| --- | --- |
| `is:issue` | すべての Issue を対象 |
| `is:issue is:open` | Open の Issue のみ対象 |
| `is:issue label:bug` | `bug` ラベルの Issue のみ対象 |
| `is:issue,pr` | Issue と Pull Request の両方を対象 |
| `is:pr` | Pull Request のみ対象 |

すべての Issue を追加する `is:issue` を基本とします。

#### 複数 Repository を対象にする場合

1. `Workflows` → `Auto-add to project` を開く
2. Workflow の `…` メニューから `Duplicate workflow` を選択
3. 複製された Workflow で別の Repository を選択
4. フィルターを設定して有効化

Repository ごとに Workflow を設定すると、複数 Repository の Issue を 1 つの Project に集約できます。

Auto-add Workflow の作成可能数は GitHub のプランによって異なります。

#### 動作確認

1. 対象 Repository で新しい Issue を作成する
2. 対象 Project を開く
3. 作成した Issue が Project に自動追加されていることを確認する

#### 注意事項

- 設定を有効化する前に作成された既存 Issue は、有効化しただけでは一括追加されません。
- 既存 Issue でも、その後の更新でフィルター条件に一致すると自動追加される場合があります。
- Auto-add は Project に Issue を追加する機能です。Status などのフィールド設定は別の Workflow で管理します。
- 自動追加されない場合は、Workflow が `On` か、対象 Repository とフィルターが正しいかを確認してください。

#### 参考資料

[GitHub 公式ドキュメント：アイテムを自動的に追加する](https://docs.github.com/ja/issues/planning-and-tracking-with-projects/automating-your-project/adding-items-automatically)
