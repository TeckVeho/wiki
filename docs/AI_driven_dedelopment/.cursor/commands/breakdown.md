# Breakdown Command

親issueを元に、Frontend/Backend別の個別issueを作成し、Story Point (SP)を算出して**親IssueのTasklistに注入（Inject）**します。

## Purpose (Goal)

* Plan.mdを解析してタスクをFE/BE個別issueに分解
* 各issueに対してSP（1 SP = 1時間）を算出
* **親IssueのTasklistに子IssueのリンクとSPを追記** (Project Boardには親のみ表示するため)
* **Scope**: Implementation and unit tests only

## Parameters

* `issue_number` (optional): 対象のissue番号（省略時は現在のブランチから自動検出）
* `--dry-run` (optional): 実際にissueを作成せず、分解計画のみを表示

## Workflow Position

* `/issue` → `/plan` → **`/breakdown`** → `/dev` → `/test` → `/pr`
* Planが完成した後、実装に入る前に実行

## Critical Rules

**⛔ ABSOLUTE PROHIBITION: DO NOT EXECUTE ANY GIT COMMIT COMMANDS ⛔**

* NEVER run `git commit` in any form
* NEVER run `git add . && git commit`
* NEVER suggest or execute commit operations
* All changes MUST remain uncommitted during breakdown processing

---

## Instructions for AI Agent

### 1. Load Plan Information

* Read `docs/issues/{issue_number}/plan.md`
* Extract tasks with their descriptions, requirements, and dependencies
* Identify task types (Frontend/Backend)

### 2. Analyze and Split Tasks Intelligently

**Task Splitting Strategy:**

* **Frontend tasks**: UI components, state management, API client integration, routing, forms, **frontend unit tests**
* **Backend tasks**: API endpoints, business logic, database operations, authentication, middleware, migrations, **backend unit tests**
* **Mixed FE/BE tasks**: Split into separate FE and BE issues when they can be developed independently and in parallel
* **FE-only tasks**: Create only Frontend issues when no Backend work is required
* **BE-only tasks**: Create only Backend issues when no Frontend work is required
* **Keep together**: Tightly coupled logic that shares significant domain context (rare cases only)

**Optimization Criteria:**

* ✅ Independent deployability - each issue can be merged separately
* ✅ Parallel development - minimize blocking dependencies
* ✅ Clear ownership - single developer can complete the issue
* ✅ Testability - can be tested independently
* ⚠️ Minimize cross-issue dependencies
* ⚠️ Balance workload between FE and BE

**Dependency Analysis:**

* Identify task execution order
* Mark blocking dependencies (must complete before)
* Identify parallel development opportunities
* Group related tasks to reduce coordination overhead

### 3. Create GitHub Issues

For each split task, create a GitHub issue using:

```bash
gh issue create \
  --title "[FE] Feature Name: Task Description" \
  --body "Detailed description with context from plan.md" \
  --label "frontend" \
  --label "enhancement" \
  --label "sp:{sp_value}"

```

**⚠️ IMPORTANT: Project Board Rules**

* **DO NOT** add these child issues to the GitHub Project Board (do not use `--project` flag).
* The Project Board must only contain the Parent Issue to maintain cleanliness.

**Issue Title Format (Bilingual - Japanese/Vietnamese):**

* `[FE] {日本語タイトル} / {Vietnamese Title}` for Frontend
* `[BE] {日本語タイトル} / {Vietnamese Title}` for Backend
* Example: `[FE] 認証: ログインUIコンポーネント / Xác thực: Thành phần giao diện đăng nhập`
* Keep concise but descriptive
* Be mindful of GitHub's 256 character title limit

**Issue Body Template (Bilingual - Japanese/Vietnamese):**

```markdown
## 日本語 / Japanese

### 親Issue
Parent: #{parent_issue_number}

### 説明
{日本語での詳細なタスク説明}

### 要件
{日本語での具体的な要件}

### 技術詳細
{日本語での実装ヒント、APIエンドポイント、変更するコンポーネント}

### 受け入れ基準
- [ ] 実装完了
- [ ] ユニットテスト作成・合格
- [ ] プロジェクト規約に準拠
- [ ] 既存機能への破壊的変更なし

### 依存関係
{日本語でのブロッキングissueのリスト（存在する場合）}

---

## Tiếng Việt / Vietnamese

### Issue cha
Parent: #{parent_issue_number}

### Mô tả
{ベトナム語での詳細なタスク説明}

### Yêu cầu
{ベトナム語での具体的な要件}

### Chi tiết kỹ thuật
{ベトナム語での実装ヒント、APIエンドポイント、変更するコンポーネント}

### Tiêu chí chấp nhận
- [ ] Hoàn thành việc triển khai
- [ ] Tạo và vượt qua unit tests
- [ ] Tuân thủ quy ước dự án
- [ ] Không có thay đổi phá vỡ chức năng hiện có

### Phụ thuộc
{ベトナム語でのブロッキングissueのリスト（存在する場合）}

```

**Labels:**

* `frontend` - For FE tasks
* `backend` - For BE tasks
* `enhancement` / `bug` / `refactor` - Based on task type
* **`sp:{value}`** - Assign the calculated SP as a label (e.g., `sp:3`) for automated rollup.

### 3.5. Translate Content to Vietnamese

Before creating GitHub issues, translate all Japanese content to Vietnamese:

**Translation Guidelines:**

* Maintain technical accuracy - preserve technical terms in English when appropriate
* Use professional/formal tone (similar to Japanese business style)
* Keep formatting consistent (bullet points, checkboxes, line breaks)
* Translate code comments if present in descriptions
* Common technical terms to preserve in English:
* API, endpoint, component, migration, middleware, unit test
* Framework names: Vue, Nuxt, Laravel, Jest, PHPUnit
* Git terminology: commit, merge, branch, pull request
* Database terms: schema, query, transaction, index
* Architecture patterns: MVC, repository, service layer



**Translation Process:**

1. Create Japanese title and body first based on plan.md
2. Translate the title to Vietnamese
3. Translate each body section to Vietnamese (説明→Mô tả, 要件→Yêu cầu, etc.)
4. Combine into bilingual format: Japanese section first, then Vietnamese section
5. Verify technical terms are consistent across both languages
6. Ensure formatting (checkboxes, lists, line breaks) is preserved

**Quality Checks:**

* Technical terms should be the same in both languages (e.g., "API", "component")
* Code examples should not be translated
* Issue numbers and references should remain unchanged
* Checkbox formatting must be preserved: `- [ ]`

### 4. Calculate Story Points (SP)

**SP Calculation Formula (1 SP = 1 hour):**

Consider the following factors:

* **Code Volume**: Lines of code to write/modify (S/M/L)
* **Complexity**: Algorithm complexity, edge cases (Simple/Medium/Complex)
* **Testing**: Unit tests, integration tests, E2E tests required
* **Architecture Impact**: New patterns, migrations, breaking changes
* **Integration Dependencies**: External APIs, services, database changes
* **Uncertainty**: Unknown technical challenges, research needed

**SP Guidelines:**

* 1-2 SP: Simple component/endpoint, straightforward logic, minimal testing
* 3-5 SP: Standard feature, moderate complexity, typical testing
* 5-8 SP: Complex feature, significant logic, extensive testing
* 8-13 SP: Large feature, high complexity, architecture changes (consider splitting)
* 13+ SP: Too large, MUST split into smaller issues

**Important: SP Value Determination**

* **MUST assign a single concrete number** (e.g., 3 SP) based on the specific task.

### 5. Inject into Parent Issue Tasklist

**Goal:** Update the Parent Issue to include links to the newly created child issues, enabling centralized tracking.

**Instructions:**

1. **Retrieve Current Body:** Get the existing body of the parent issue.
2. **Format Task List:** Create a markdown list item for each new child issue.
* Format: `- [ ] {child_issue_url} (SP: {sp_value})`


3. **Update Parent:** Append the new list to the Parent Issue body (or specific "Implementation Tasks" section if it exists).

**Command Example:**

```bash
# 1. Create Child Issue & Get URL
CHILD_URL=$(gh issue create --title "..." --label "sp:3" --json url -q .url)

# 2. Update Parent Issue
gh issue edit {parent_issue_number} --body "$(gh issue view {parent_issue_number} --json body -q .body)
- [ ] $CHILD_URL (SP: 3)"

```

---

## Output Files

* GitHub Issues created (but NOT on Project Board)
* Parent Issue updated with Tasklist links

---

## Usage Examples

**Standard Breakdown**

```
/breakdown 129

```

**Dry Run (Preview Only)**

```
/breakdown 129 --dry-run

```

---

## Integration with Other Commands

* **After `/plan**`: Use `/breakdown` to split plan into actionable issues.
* **Tasklist Tracking**: Developers click links in the Parent Issue to access Child Issues.
* **SP Rollup**: The `sp:{value}` label and Parent Tasklist entry allow automated tools to calculate total SP.

---

## Best Practices

1. **Review Plan First**: Ensure plan.md is complete and approved before breakdown
2. **Do Not Clutter Board**: Verify that child issues are NOT appearing on the Project Board.
3. **Check Parent Link**: Verify that the Parent Issue contains the correct links in its Tasklist.
4. **Size Appropriately**: Keep issues between 2-8 SP for optimal sprint planning

---

## Troubleshooting

**Issue Creation Fails:**

* Verify `gh auth status`
* Check repository permissions

**Parent Injection Fails:**

* Ensure you have write permissions to the Parent Issue.
* If automatic update fails, manually edit the Parent Issue to add: `- [ ] {child_url} (SP: {val})`

---

## Example Breakdown Scenario

**Input (from plan.md):**

* Parent Issue: #100
* Task: Implement user authentication with JWT (Backend)
* Task: Create login/logout UI (Frontend)

**Output (Actions performed):**

1. **Created Issue #130** (Backend): `[BE] ...` with Label `sp:4`.
2. **Created Issue #131** (Frontend): `[FE] ...` with Label `sp:3`.
3. **Updated Parent Issue #100**:
```markdown
(Existing content...)

## Implementation Tasks
- [ ] https://github.com/org/repo/issues/130 (SP: 4)
- [ ] https://github.com/org/repo/issues/131 (SP: 3)

```



**Total:** 2 child issues created, Parent #100 updated.
