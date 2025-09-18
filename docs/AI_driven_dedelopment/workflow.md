# 開発フローの全体像 (最終版)

このフローは、**クライアント**の要望記録から始まる一連の開発プロセス（Phase1〜3）と、その成果を次の開発の糧とするための自動ドキュメント更新プロセス（Phase4）から構成される、**自己進化する循環型（ループ）モデル**です。

---

### Phase0：リバースエンジニアリングとドキュメント生成 (初期準備)

- **プロジェクトの解析**: 最初に、既存プロジェクトのソースコードや動作をリバースエンジニアリングします。
- **ドキュメントの生成**: 解析結果を基に、プロジェクト全体の仕様を**`Markdown（.md）`形式**でドキュメント化します。これが開発の初期ベースラインとなります。

---

### Phase1：課題整理と具体化

1.  **課題の発生**: **クライアント**が開発要望を直接**`Issuebot`**に記録します。
2.  **Issueの自動生成**: **`Issuebot`**は、最新の`.md`ドキュメントを参照し、クライアントの要望を基に詳細な**GitHub Issue**を自動で生成します。

---

### Phase2：開発準備と実装（コマンド実行による進行）

**エンジニア**は`Cursor`上で定義済みの**`Cursorコマンド`**を段階的に実行し、`spec.md`（仕様書）、`plan.md`（実装計画書）を作成した上で、実装（コーディング）に進みます。

---

### Phase3：テストとリリース

1.  **Dev環境デプロイ → エンジニアによるテスト**: 実装完了後、Dev環境でエンジニアが動作確認を行います。
2.  **Stg環境デプロイ → PM/BAによるテスト**: Dev環境でのテスト完了後、Stg環境でPM/BAが要求仕様との最終確認を行います。
3.  **本番リリース**: 全てのテストをクリアした後、本番環境へ反映し、リリースを完了します。

---

### Phase4：リバース実行によるドキュメントの最新化

1.  **定期的な自動実行**: 本番リリース後、または定期的なスケジュール（例: 夜間バッチ）で、現在の最新コードベースに対する**リバースエンジニアリングが自動で実行**されます。
2.  **ドキュメントの更新**: 実行結果を基に、**Phase0で作成された`.md`ドキュメント群が自動で最新の状態に更新**されます。これにより、ドキュメントが陳腐化することなく、常に「正」であり続けます。

---

#### このフローのポイント

- **クライアント起点**: クライアントが直接`Issuebot`に要望を記録することで、伝言ゲームによる認識のズレをなくします。
- **コマンド駆動**: `spec`作成から実装まで、開発の主要工程が`Cursor`コマンドによって標準化・効率化されています。
- **多段階のテストプロセス**: 「エンジニア(Dev)」と「PM/BA(Stg)」による二段階のテストで、リリースの品質を確実なものにします。
- **ドキュメントの自動最新化 (自己進化するプロセス)**: Phase4のループにより、ドキュメントが常に最新の状態に保たれ、次の開発サイクル（Phase1）の精度を向上させます。これにより、技術的負債の一部である「ドキュメントの陳腐化」を未然に防ぎます。

```mermaid
sequenceDiagram
    participant Client
    participant Issuebot
    participant Github
    participant Engineer
    participant PM/BA
    participant DevEnv
    participant StgEnv
    participant Production
    participant AutoProcess

    %% Phase 0: 初期準備
    Note over Production, Github: 事前にリバースエンジニアリングを実行し<br/>ドキュメント(.md)を生成済

    %% Phase 1: 課題整理と具体化
    box Phase 1: 課題整理と具体化
        Client->>Issuebot: 開発要望を記録
        activate Issuebot
        Issuebot->>Github: 既存ドキュメントを読み込み
        Issuebot->>Github: 詳細なIssueを生成
        deactivate Issuebot
    end

    %% Phase 2: 開発準備と実装
    box Phase 2: 開発準備と実装
        Engineer->>Github: Issueを確認
        activate Engineer
        Note over Engineer: 以下、Cursorコマンドで実行
        Engineer->>Engineer: `cursor spec create`
        Engineer->>Github: spec.md を生成
        Engineer->>Engineer: `cursor plan create`
        Engineer->>Github: plan.md を生成
        Engineer->>Engineer: `cursor implement`
        Engineer->>Github: 実装コードをプッシュ
        deactivate Engineer
    end

    %% Phase 3: テストとリリース
    box Phase 3: テストとリリース
        Engineer->>DevEnv: Dev環境へデプロイ
        activate DevEnv
        Engineer->>DevEnv: マニュアルテスト実施
        deactivate DevEnv

        Engineer->>StgEnv: Stg環境へデプロイ
        activate StgEnv
        PM/BA->>StgEnv: マニュアルテスト実施
        deactivate StgEnv

        Engineer->>Production: 本番環境へリリース
    end

    %% Phase 4: ドキュメントの最新化 (ループ)
    box Phase 4: ドキュメントの最新化 (ループ)
        loop 定期的な自動実行
            AutoProcess->>Production: 最新コードベースを解析
            AutoProcess->>Github: ドキュメント(.md)を最新化
        end
    end
