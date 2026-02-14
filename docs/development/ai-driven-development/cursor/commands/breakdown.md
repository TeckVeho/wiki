# Breakdown Command

Plan情報を元に、Frontend/Backend別の個別issueを作成し、Story Point (SP)を算出してGitHub Projectsに登録します。

## Purpose (Goal)
- Plan.mdを解析してタスクをFE/BE個別issueに分解
- 各issueに対してSP（1 SP = 1時間）を算出
- GitHub issueを作成し、SP値をGitHub Projectsに自動登録
- **Scope**: Implementation and unit tests only

## Parameters
- `issue_number` (optional): 対象のissue番号（省略時は現在のブランチから自動検出）
- `--dry-run` (optional): 実際にissueを作成せず、分解計画のみを表示

## Workflow Position
- `/issue` → `/plan` → **`/breakdown`** → `/dev` → `/test` → `/pr`
- Planが完成した後、実装に入る前に実行

## Critical Rules
**⛔ ABSOLUTE PROHIBITION: DO NOT EXECUTE ANY GIT COMMIT COMMANDS ⛔**
- NEVER run `git commit` in any form
- NEVER run `git add . && git commit`
- NEVER suggest or execute commit operations
- All changes MUST remain uncommitted during breakdown processing

---

## Instructions for AI Agent

### 1. Load Plan Information
- Read `docs/issues/{issue_number}/plan.md`
- Extract tasks with their descriptions, requirements, and dependencies
- Identify task types (Frontend/Backend)

### 2. Analyze and Split Tasks Intelligently
**Task Splitting Strategy:**
- **Frontend tasks**: UI components, state management, API client integration, routing, forms, **frontend unit tests**
- **Backend tasks**: API endpoints, business logic, database operations, authentication, middleware, migrations, **backend unit tests**
- **Mixed FE/BE tasks**: Split into separate FE and BE issues when they can be developed independently and in parallel
- **FE-only tasks**: Create only Frontend issues when no Backend work is required
- **BE-only tasks**: Create only Backend issues when no Frontend work is required
- **Keep together**: Tightly coupled logic that shares significant domain context (rare cases only)

**Optimization Criteria:**
- ✅ Independent deployability - each issue can be merged separately
- ✅ Parallel development - minimize blocking dependencies
- ✅ Clear ownership - single developer can complete the issue
- ✅ Testability - can be tested independently
- ⚠️ Minimize cross-issue dependencies
- ⚠️ Balance workload between FE and BE

**Dependency Analysis:**
- Identify task execution order
- Mark blocking dependencies (must complete before)
- Identify parallel development opportunities
- Group related tasks to reduce coordination overhead

### 3. Create GitHub Issues
For each split task, create a GitHub issue using:
```bash
gh issue create \
  --title "[FE] Feature Name: Task Description" \
  --body "Detailed description with context from plan.md" \
  --label "frontend" \
  --label "enhancement"
```

**Issue Title Format (Bilingual - Japanese/Vietnamese):**
- `[FE] {日本語タイトル} / {Vietnamese Title}` for Frontend
- `[BE] {日本語タイトル} / {Vietnamese Title}` for Backend
- Example: `[FE] 認証: ログインUIコンポーネント / Xác thực: Thành phần giao diện đăng nhập`
- Keep concise but descriptive
- Be mindful of GitHub's 256 character title limit

**Issue Body Template (Bilingual - Japanese/Vietnamese):**
```markdown
## 日本語 / Japanese

### 親Issue
#{parent_issue_number} に関連

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
Liên quan đến #{parent_issue_number}

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
- `frontend` - For FE tasks
- `backend` - For BE tasks
- `enhancement` / `bug` / `refactor` - Based on task type
- Consider adding priority labels if needed

### 3.5. Translate Content to Vietnamese

Before creating GitHub issues, translate all Japanese content to Vietnamese:

**Translation Guidelines:**
- Maintain technical accuracy - preserve technical terms in English when appropriate
- Use professional/formal tone (similar to Japanese business style)
- Keep formatting consistent (bullet points, checkboxes, line breaks)
- Translate code comments if present in descriptions
- Common technical terms to preserve in English:
  - API, endpoint, component, migration, middleware, unit test
  - Framework names: Vue, Nuxt, Laravel, Jest, PHPUnit
  - Git terminology: commit, merge, branch, pull request
  - Database terms: schema, query, transaction, index
  - Architecture patterns: MVC, repository, service layer

**Translation Process:**
1. Create Japanese title and body first based on plan.md
2. Translate the title to Vietnamese
3. Translate each body section to Vietnamese (説明→Mô tả, 要件→Yêu cầu, etc.)
4. Combine into bilingual format: Japanese section first, then Vietnamese section
5. Verify technical terms are consistent across both languages
6. Ensure formatting (checkboxes, lists, line breaks) is preserved

**Quality Checks:**
- Technical terms should be the same in both languages (e.g., "API", "component")
- Code examples should not be translated
- Issue numbers and references should remain unchanged
- Checkbox formatting must be preserved: `- [ ]`

### 4. Calculate Story Points (SP)
**SP Calculation Formula (1 SP = 1 hour):**

Consider the following factors:
- **Code Volume**: Lines of code to write/modify (S/M/L)
- **Complexity**: Algorithm complexity, edge cases (Simple/Medium/Complex)
- **Testing**: Unit tests, integration tests, E2E tests required
- **Architecture Impact**: New patterns, migrations, breaking changes
- **Integration Dependencies**: External APIs, services, database changes
- **Uncertainty**: Unknown technical challenges, research needed

**SP Guidelines:**
- 1-2 SP: Simple component/endpoint, straightforward logic, minimal testing
- 3-5 SP: Standard feature, moderate complexity, typical testing
- 5-8 SP: Complex feature, significant logic, extensive testing
- 8-13 SP: Large feature, high complexity, architecture changes (consider splitting)
- 13+ SP: Too large, MUST split into smaller issues

**Important: SP Value Registration**
- The ranges above are estimation guidelines only
- **MUST assign a single concrete number** (e.g., 3 SP, not 3-5 SP) when registering to GitHub Projects
- Choose the most appropriate value within the range based on the specific task characteristics
- Example: A moderately complex API endpoint should be assigned 4 SP (not "3-5 SP")

### 5. Register SP to GitHub Projects
**Automatic SP Registration:**

Execute the appropriate script based on OS:

**macOS/Linux:**
```bash
bash docs/AI_driven_dedelopment/cursor/script/setsp.ps <issue_url> <sp_value>
```

**Windows:**
```powershell
pwsh docs/AI_driven_dedelopment/cursor/script/setsp.ps1 -IssueUrl <issue_url> -SpValue <sp_value>
```

**Prerequisites:**
- `gh` CLI must be authenticated (`gh auth status`)
- GitHub Projects must have a "Story Points" custom field
- User must have write access to the project

**Error Handling:**
- If script fails, display clear error message with troubleshooting steps
- Verify GitHub Projects field name (may be "SP", "Story Points", "Points")
- Provide manual registration instructions as fallback

---

## Output Files
- GitHub Issues with labels and SP values registered

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

**Auto-detect from Current Branch**
```
/breakdown
```

---

## Integration with Other Commands

- **After `/plan`**: Use `/breakdown` to split plan into actionable issues
- **Before `/dev`**: Developers use `/dev` with specific FE/BE issue numbers
- **Parent-Child Tracking**: All child issues reference the parent issue for traceability
- **SP Updates**: If scope changes, update SP using `/sp` command and re-run setsp script

---

## Best Practices

1. **Review Plan First**: Ensure plan.md is complete and approved before breakdown
2. **Balance Workload**: Try to balance SP between FE and BE teams
3. **Clear Dependencies**: Explicitly mark blocking dependencies
4. **Size Appropriately**: Keep issues between 2-8 SP for optimal sprint planning
5. **Verify SP Registration**: Check GitHub Projects board after registration
6. **Update as Needed**: If breakdown needs adjustment, close/update issues accordingly

---

## Troubleshooting

**Issue Creation Fails:**
- Verify `gh auth status`
- Check repository permissions
- Ensure issue title and body are valid

**SP Registration Fails:**
- Verify GitHub Projects field name
- Check project board permissions
- Try manual registration: `gh project item-edit --field "Story Points" --project-id {project_id} {item_id} --value {sp}`

**Script Not Found:**
- Verify script path: `docs/AI_driven_dedelopment/cursor/script/setsp.ps` (macOS/Linux)
- Verify script path: `docs/AI_driven_dedelopment/cursor/script/setsp.ps1` (Windows)
- Ensure scripts have execute permissions: `chmod +x docs/AI_driven_dedelopment/cursor/script/setsp.ps`

---

## Example Breakdown Scenario

**Input (from plan.md):**
- Task: Implement user authentication with JWT (Backend)
- Task: Create login/logout UI (Frontend)

**Output (breakdown with bilingual titles):**

- **Issue #130**: `[BE] 認証: JWT生成と検証・ユニットテスト / Xác thực: Tạo và xác thực JWT với Unit Tests` **(4 SP)**
  - Japanese body: JWT生成ロジック、トークン検証、ユニットテストの実装を含む
  - Vietnamese body: Bao gồm logic tạo JWT, xác thực token, và triển khai unit tests

- **Issue #131**: `[BE] 認証: ログイン/ログアウトAPIエンドポイント・ユニットテスト / Xác thực: API Endpoints đăng nhập/đăng xuất với Unit Tests` **(3 SP)**
  - Japanese body: ログイン/ログアウトのエンドポイント、リクエスト検証、ユニットテストを含む
  - Vietnamese body: Bao gồm endpoints đăng nhập/đăng xuất, xác thực request, và unit tests

- **Issue #132**: `[FE] 認証: ログイン/ログアウトUIコンポーネント・ユニットテスト / Xác thực: Thành phần giao diện đăng nhập/đăng xuất với Unit Tests` **(3 SP)**
  - Japanese body: ログインフォーム、ログアウトボタン、コンポーネントのユニットテストを含む
  - Vietnamese body: Bao gồm form đăng nhập, nút đăng xuất, và unit tests của components

- **Issue #133**: `[FE] 認証: Vuexでのトークン管理・ユニットテスト / Xác thực: Quản lý Token trong Vuex với Unit Tests` **(2 SP)**
  - Japanese body: 認証状態のVuexストア、アクション/ミューテーション、ユニットテストを含む
  - Vietnamese body: Bao gồm Vuex store cho trạng thái xác thực, actions/mutations, và unit tests

**Total:** 4 issues, 12 SP (~12 hours)
**Dependency:** #130, #131 → #132, #133

**Note:** Each issue contains full bilingual body with all sections (Description, Requirements, Technical Details, Acceptance Criteria, Dependencies) in both Japanese and Vietnamese as per the template.

