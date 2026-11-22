# Security Specification — STRESS OFF: ¡DESBLOQUEA TU BIENESTAR!

## 1. Data Invariants
1. **Authenticated & Verified Ownership**: Every `game_sessions/{sessionId}` document MUST have `ownerUid == request.auth.uid` and `request.auth.token.email_verified == true`.
2. **Path & ID Integrity**: `sessionId` and `id` MUST match `^[a-zA-Z0-9_\\-]+$`, `id == sessionId`, and length `1..128`.
3. **Strict Key Allowlist**: No undeclared shadow fields are permitted on `create` (`hasAll` + `hasOnly`).
4. **Server Timestamp Enforcement**: `createdAt == request.time` is strictly required on `create`.
5. **Immutability**: Once completed, a `game_sessions` document cannot be modified (`allow update: if false`) so scores and timestamps cannot be altered after the fact.
6. **PII & Cross-User Isolation**: Non-admin players can only `get` or `list` documents where `resource.data.ownerUid == request.auth.uid`. Only verified admins (`haneulnekita@gmail.com` with `email_verified == true` or `/admins/{uid}`) can `get`, `list`, or `delete` across all players for Excel consolidation.
7. **Bounded Arrays & Strings**: Every string has explicit min/max bounds (`bossPowerUp3Plan <= 4000`, `bossBonusReflection <= 4000`, `playerName <= 96`, `playerId <= 64`), and `unlockedSkills` is bounded to `<= 4` items with first-element string validation.
8. **Score & Option Bounds**: `xp` is int `0..4`, `maxXp == 4`, `percentage` is int `0..100`, and `level1Option..level4Option` are restricted to `['A', 'B', 'C', 'D']`.

## 2. The "Dirty Dozen" Attack Payloads (Expected: PERMISSION_DENIED)
1. **Unauthenticated Create**: `request.auth == null` attempting to create `/game_sessions/run_1`.
2. **Unverified Email Spoof**: `request.auth.token.email == 'haneulnekita@gmail.com'` with `email_verified == false` attempting admin `list` or `delete`.
3. **Identity Spoofing**: Authenticated user A (`uid_A`) creating a session with `ownerUid: 'uid_B'`.
4. **Shadow Field Injection**: Creating a valid session with extra ghost field `isAdmin: true` or `verifiedScore: 999`.
5. **Client Timestamp Forgery**: Creating a session with backdated `createdAt` instead of `request.time`.
6. **Path ID Poisoning**: Creating `/game_sessions/bad$id..with..spaces` (fails `isValidId`).
7. **ID Mismatch**: Creating `/game_sessions/run_1` where payload `id: 'run_2'`.
8. **Score Tampering (XP Overflow)**: Creating a session with `xp: 999` or `percentage: 150`.
9. **Resource Exhaustion (1MB String)**: Injecting a 10,000-char string into `bossPowerUp3Plan` or `playerName`.
10. **Array Bomb**: Sending `unlockedSkills` with 50 items or non-string element `[123]`.
11. **Post-Submit Mutation**: Player attempting `update` on an existing `/game_sessions/run_1` to change `xp` from `1` to `4`.
12. **Blanket Cross-Player Scraping**: Student `uid_A` calling `list` on `/game_sessions` without filtering `ownerUid == uid_A` (or trying `get` on `uid_B`'s session).
