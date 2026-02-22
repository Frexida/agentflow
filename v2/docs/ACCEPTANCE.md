# AgentFlow — Acceptance Criteria

## How to Use
Test agents read `TEST_SCENARIOS.md` and verify each scenario.
Results are reported as PASS/FAIL with screenshots.

## Pass/Fail Rules

### PASS
- Expected elements are visible on screen
- Expected behavior occurs after interaction
- No console errors (critical)
- Page loads within 5 seconds

### FAIL
- Expected element missing or incorrect
- Interaction produces unexpected result
- Unhandled error or crash
- Blank page or infinite loading

## Severity Levels

- **P0 (Critical):** Page doesn't load, auth broken, data loss
- **P1 (High):** Feature doesn't work (save, export, chat)
- **P2 (Medium):** UI glitch, layout broken on specific viewport
- **P3 (Low):** Cosmetic issues, minor text errors

## Report Format

```
## Test: [Scenario ID] [Name]
**Result:** PASS / FAIL
**Severity:** P0-P3 (if FAIL)
**Screenshot:** [attached]
**Notes:** [details]
```

## Test Coverage Priority

1. Landing → Demo Editor flow (unauthenticated)
2. Login → Dashboard → Editor flow (authenticated)
3. Settings (Gateway, API Keys, Billing)
4. ChatPanel (connected/disconnected states)
5. Edge cases (mobile, offline)
