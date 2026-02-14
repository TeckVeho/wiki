| 画面ID | 画面名 | ルート / URL | 主なコンポーネント | 主な操作 | API 呼び出し |
|--------|--------|--------------|-------------------|----------|--------------|
| SCR-01 | ログイン | /login | `<LoginForm>` | Submit | POST /auth/login |

---
# サンプル

| 画面ID | 画面名 | ルート / URL | 主なコンポーネント | 主な操作 | API 呼び出し |
|--------|--------|--------------|-------------------|----------|--------------|
| SCR-01 | ログイン | /login | `<LoginForm>` | Submit | POST /auth/login |
| SCR-02 | ダッシュボード | /dashboard | `<StatCard>`, `<Map>` | – | GET /stats/today |
| SCR-03 | ドライバー一覧 | /drivers | `<DriverTable>` | 検索／並び替え | GET /drivers |
| SCR-04 | 勤怠レポートDL | /attendance | `<ReportDownload>` | 期間選択 → DL | GET /attendance/report |
