# Gate System

## 概要

**Gate System** = 品質基準をクリアするまで次フェーズに進めない仕組み。
QAの「NG」判定がPM判断より上位。

## 開発フロー

```mermaid
graph LR
    subgraph Phase1["仕様フェーズ"]
        SPEC[仕様書作成]
        AC[受け入れ基準定義]
    end

    subgraph Phase2["デザインフェーズ"]
        DESIGN[Figma作成]
        REVIEW1[デザインレビュー]
    end

    subgraph Phase3["実装フェーズ"]
        IMPL[コード実装]
        TEST[テスト作成]
    end

    subgraph Phase4["QAゲート"]
        QA[QA検証]
        GATE{受け入れ基準<br/>クリア?}
    end

    subgraph Phase5["リリース"]
        MERGE[main マージ]
        DEPLOY[デプロイ]
    end

    SPEC --> AC
    AC --> DESIGN
    DESIGN --> REVIEW1
    REVIEW1 --> IMPL
    IMPL --> TEST
    TEST --> QA
    QA --> GATE
    GATE -->|Yes| MERGE
    GATE -->|No| IMPL
    MERGE --> DEPLOY
```

## Gate定義

| Gate | 担当 | 基準 | ブロック条件 |
|------|------|------|-------------|
| **仕様承認** | PM(鬼畜) | 要件が明確 | 曖昧な項目がある |
| **デザイン承認** | designer + PM | Figma完成 | UI未定義 |
| **コードレビュー** | nix + PM | 実装完了 | バグ、設計違反 |
| **QA承認** | red | 受け入れ基準全クリア | テスト失敗 |
| **最終承認** | leith18 | 本番ready | 重大issue未解決 |

## QA独立性

```mermaid
graph TD
    PM[鬼畜<br/>PM] -->|日常指示| QA[red<br/>QA]
    QA -->|NG判定| ESC[leith18へ<br/>エスカレーション]
    ESC -->|重大| NATSU[ナツ]

    subgraph 独立権限
        QA -->|管理| TESTS[/tests/]
        QA -->|定義| AC2[受け入れ基準]
        QA -->|ブロック| MERGE2[main マージ]
    end
```

## 受け入れ基準テンプレート

```markdown
## 機能名: [機能名]

### 受け入れ基準

- [ ] 基準1: [具体的な条件]
- [ ] 基準2: [具体的な条件]
- [ ] 基準3: [具体的な条件]

### テストケース

| ID | シナリオ | 期待結果 | 実行結果 |
|----|---------|---------|---------|
| TC-001 | [操作] | [結果] | ⬜ |
| TC-002 | [操作] | [結果] | ⬜ |

### Gate判定

- [ ] 全テストケースPASS
- [ ] パフォーマンス基準クリア
- [ ] セキュリティレビュー完了
- [ ] ドキュメント更新完了

**QA判定**: ⬜ PASS / ⬜ NG
**NG理由**: 
```

## GitHub連携

### Branch Protection

```yaml
main:
  required_reviews: 2
  required_reviewers:
    - @agentflow-pm   # PM承認
    - @agentflow-qa   # QA承認
  require_status_checks:
    - "QA: acceptance-tests"
    - "ci: build"
    - "ci: lint"
  dismiss_stale_reviews: true
```

### CI/CD Gate

```mermaid
graph TD
    PR[PR作成] --> CI[CI実行]
    CI --> BUILD{build<br/>pass?}
    BUILD -->|No| FAIL1[❌ ブロック]
    BUILD -->|Yes| LINT{lint<br/>pass?}
    LINT -->|No| FAIL2[❌ ブロック]
    LINT -->|Yes| TEST{test<br/>pass?}
    TEST -->|No| FAIL3[❌ ブロック]
    TEST -->|Yes| REVIEW[レビュー待ち]
    REVIEW --> QA_REV{QA承認?}
    QA_REV -->|No| FAIL4[❌ ブロック]
    QA_REV -->|Yes| PM_REV{PM承認?}
    PM_REV -->|No| FAIL5[❌ ブロック]
    PM_REV -->|Yes| MERGE[✅ マージ可能]
```
