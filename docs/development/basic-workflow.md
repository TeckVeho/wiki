# Basic Development Workflow

---

# Tiếng Việt

## Tổng quan

Tài liệu này mô tả quy trình phát triển cơ bản từ tạo Issue đến merge. Áp dụng như quy trình chung, không phụ thuộc vào phát triển dựa trên AI.

## Quy trình tổng thể

```
Tạo Issue → Tạo branch & phát triển → Kiểm thử → Tạo PR → Code review → Merge
```
- **Liên kết Issue và PR**: Nếu tạo branch từ 「Create a branch」trên Issue, khi tạo PR từ branch đó thì **Issue và PR sẽ được tự động liên kết**. Thông thường không cần chỉ định 「Linked issues」riêng.

## 1. Tạo Issue

- Quản lý công việc bằng Issue.
- Tiêu đề ngắn gọn (khuyến nghị tiếng Anh).
- Nội dung theo template (Overview / TaskList / References / Notes).
- Chi tiết: [issue-rule](/development/issue-rule)

## 2. Tạo branch & phát triển

- Tạo branch làm việc từ **「Create a branch」trên menu bên phải Issue** (branch và Issue được tự động liên kết).
- Triển khai sau khi xem tài liệu spec và tài liệu tham khảo.
- Tham khảo cấu trúc thư mục tại [directory-template](/development/directory-template).

## 3. Kiểm thử

- Thêm và chạy unit test, integration test khi cần.
- Nếu cần E2E test, xem [e2etest](/development/e2etest).
- Đảm bảo test pass trước khi merge.

## 4. Tạo Pull Request

- Gửi PR với nội dung thay đổi.
- Tiêu đề PR phản ánh rõ thay đổi.
- **Liên kết Issue và PR**: Nếu đã tạo branch bằng 「Create a branch」thì khi tạo PR từ branch đó, Issue và PR sẽ tự động liên kết. Chỉ cần chỉ định 「Linked issues」khi tạo branch thủ công hoặc khi chưa được liên kết.
- Nội dung PR theo template (Overview / AI Review Log / Screenshots or Execution Results).
- Chi tiết: [pull-request-rule](/development/pull-request-rule)

## 5. Code review

- Gán ít nhất một reviewer.
- Giải quyết tất cả comment trước khi merge.
- Không merge khi automated test fail.

## 6. Merge

- Merge sau khi được approve và xác nhận test pass.
- Xóa branch sau merge khi cần.

## Tài liệu tham khảo

| Nội dung        | Tài liệu                         |
|-----------------|----------------------------------|
| Cách tạo Issue  | [issue-rule](/development/issue-rule) |
| Quy tắc PR      | [pull-request-rule](/development/pull-request-rule) |
| Cấu trúc thư mục | [directory-template](/development/directory-template) |
| E2E test        | [e2etest](/development/e2etest)       |

---

# English

## Overview

This document describes the basic development flow from Issue creation to merge. Use it as a general process, independent of AI-driven development.

## Overall flow

```
Create Issue → Create branch & develop → Test → Create PR → Code review → Merge
```
- **Linking Issue and PR**: If you create the branch from 「Create a branch」on the Issue, **the Issue and PR are linked automatically** when you open a PR from that branch. You usually do not need to set 「Linked issues」separately.

## 1. Create Issue

- Manage work with Issues.
- Keep the title concise (English recommended).
- Follow the body template (Overview / TaskList / References / Notes).
- Details: [issue-rule](/development/issue-rule)

## 2. Create branch & develop

- Create the working branch from **「Create a branch」in the Issue’s right menu** (the branch and Issue are linked automatically).
- Implement after checking spec and reference docs.
- See [directory-template](/development/directory-template) for directory structure.

## 3. Test

- Add and run unit and integration tests as needed.
- For E2E tests, see [e2etest](/development/e2etest).
- Ensure tests pass before merging.

## 4. Create Pull Request

- Open a PR with your changes.
- Use a PR title that clearly describes the changes.
- **Linking Issue and PR**: If you created the branch with 「Create a branch」, the Issue and PR are linked automatically when you open a PR from that branch. Only set 「Linked issues」when the branch was created manually or is not linked.
- Follow the PR body template (Overview / AI Review Log / Screenshots or Execution Results).
- Details: [pull-request-rule](/development/pull-request-rule)

## 5. Code review

- Assign at least one reviewer.
- Address all review comments before merging.
- Do not merge if automated tests fail.

## 6. Merge

- Merge after approval and confirmed passing tests.
- Delete the branch after merge if appropriate.

## Reference documents

| Topic            | Document                         |
|------------------|----------------------------------|
| How to create Issue | [issue-rule](/development/issue-rule) |
| PR rules         | [pull-request-rule](/development/pull-request-rule) |
| Directory structure | [directory-template](/development/directory-template) |
| E2E test         | [e2etest](/development/e2etest)       |

---

# 日本語

## Overview

このドキュメントは、Issue 作成からマージまでの開発の基本的な流れをまとめたものです。AI 駆動開発に依存しない、一般的な開発プロセスとして参照してください。

## 流れの全体像

```
Issue 作成 → ブランチ作成・開発 → テスト → PR 作成 → コードレビュー → マージ
```
- **Issue と PR の紐づけ**: ブランチを Issue の「Create a branch」から作成しておけば、そのブランチから PR を作成した時点で **Issue と PR は自動で紐づく**。改めて「Linked issues」で指定する必要は通常ない。

## 1. Issue 作成

- 作業内容を Issue で管理する。
- タイトルは簡潔に（英語推奨）。
- 本文はテンプレートに沿って記載する（Overview / TaskList / References / Notes）。
- 詳細: [issue-rule](/development/issue-rule)

## 2. ブランチ作成・開発

- 作業ブランチは **Issue の右メニュー「Create a branch」** から作成する（Issue とブランチが自動で紐づく）。
- 仕様・参照ドキュメントを確認しながら実装する。
- ディレクトリ構成は [directory-template](/development/directory-template) を参照する。

## 3. テスト

- 単体テスト・結合テストを必要に応じて追加・実行する。
- E2E テストが必要な場合は [e2etest](/development/e2etest) を参照する。
- マージ前にテストが通ることを確認する。

## 4. Pull Request 作成

- 変更内容を PR で提出する。
- PR タイトルは変更内容が分かるようにする。
- **Issue と PR の紐づけ**: 「Create a branch」でブランチを作成していれば、そのブランチから PR を出した時点で Issue と PR は自動で紐づく。ブランチを手動作成した場合など、紐づいていないときだけ「Linked issues」で Issue を指定する。
- PR 本文はテンプレート（Overview / AI Review Log / Screenshots or Execution Results）に沿って記載する。
- 詳細: [pull-request-rule](/development/pull-request-rule)

## 5. コードレビュー

- レビュアーを最低 1 名アサインする。
- 指摘事項はすべて解消してからマージする。
- 自動テストが失敗している場合はマージしない。

## 6. マージ

- 承認され、テストが通っていることを確認してからマージする。
- マージ後、必要に応じてブランチを削除する。

## 参照ドキュメント

| 内容           | ドキュメント                    |
|----------------|---------------------------------|
| Issue の作り方 | [issue-rule](/development/issue-rule) |
| PR ルール      | [pull-request-rule](/development/pull-request-rule) |
| ディレクトリ構成 | [directory-template](/development/directory-template) |
| E2E テスト     | [e2etest](/development/e2etest)       |
