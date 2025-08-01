## エンティティ一覧
| テーブル | 目的 | 備考 |
|----------|------|------|
| users | アプリ利用者 | PK: id |
| drivers | ドライバー情報 | FK: user_id |
| routes | 配送ルート | FK: driver_id |
| attendances | 勤怠打刻 | FK: driver_id |

## リレーションシップ
```mermaid
erDiagram
  users ||--o{ drivers : owns
  drivers ||--o{ routes : assigned
  drivers ||--o{ attendances : has
```
