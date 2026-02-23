
## Gateway Token設計改善
- [ ] トークン変数を`OPENCLAW_TOKEN`に統一（`OPENCLAW_GATEWAY_TOKEN`廃止）
- [ ] entrypoint.shで`OPENCLAW_TOKEN`のみ参照
- [ ] `fly secrets`使わない — machine envのみ
- [ ] CreateAPI: 既存マシン全destroyしてから新規作成
- [ ] DB↔Fly.io整合性チェック追加（status sync）
