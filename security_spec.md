# Security Specification — STRESS OFF: ¡DESBLOQUEA TU BIENESTAR!

## 1. Data Invariants (Google-Forms Drop-Box Model)
1. **Multi-Device Direct Submission (`create`)**: Any participant on any device can submit a new `game_sessions/{sessionId}` document without requiring login, provided `ownerUid == 'public_player'` (when unauthenticated) OR `ownerUid == request.auth.uid` (when authenticated and verified).
2. **Strict Admin-Only Read/Export (`get`, `list`, `delete`)**: Public submissions (`ownerUid == 'public_player'`) CANNOT be read, listed, updated, or deleted by any unauthenticated user or regular student. ONLY the verified administrator (`haneulnekita@gmail.com` with `email_verified == true`, or `/admins/{uid}`) can `get`, `list`, or `delete` across all devices and dates.
3. **Path & ID Integrity**: `sessionId` and `id` MUST match `^[a-zA-Z0-9_\\-]+$`, `id == sessionId`, and length `1..128`.
4. **Strict Key Allowlist**: No undeclared shadow fields are permitted on `create` (`hasAll` + `hasOnly`).
5. **Server Timestamp Enforcement**: `createdAt == request.time` is strictly required on `create`.
6. **Immutability**: Once submitted, a `game_sessions` document cannot be modified (`allow update: if false`).
7. **Bounded Arrays & Strings**: Every string has explicit min/max bounds (`bossPowerUp3Plan <= 4000`, `bossBonusReflection <= 4000`, `playerName <= 96`, `playerId <= 64`), and `unlockedSkills` is bounded to `<= 4` items with first-element string validation.
8. **Score & Option Bounds**: `xp` is int `0..4`, `maxXp == 4`, `percentage` is int `0..100`, and `level1Option..level4Option` are restricted to `['A', 'B', 'C', 'D']`.

## 2. The "Dirty Dozen" Attack Payloads (Expected: PERMISSION_DENIED)
1. **Unauthenticated Read/List Scraping**: Unauthenticated user or student attempting `get` or `list` on `/game_sessions` to read other players' names or reflections.
2. **Unverified Admin Email Spoof**: `request.auth.token.email == 'haneulnekita@gmail.com'` with `email_verified == false` attempting admin `list` or `delete`.
3. **Identity Spoofing**: Authenticated user A (`uid_A`) creating a session with `ownerUid: 'uid_B'` or unauthenticated user setting `ownerUid: 'uid_B'`.
4. **Shadow Field Injection**: Creating a valid session with extra ghost field `isAdmin: true` or `verifiedScore: 999`.
5. **Client Timestamp Forgery**: Creating a session with backdated `createdAt` instead of `request.time`.
6. **Path ID Poisoning**: Creating `/game_sessions/bad$id..with..spaces` (fails `isValidId`).
7. **ID Mismatch**: Creating `/game_sessions/run_1` where payload `id: 'run_2'`.
8. **Score Tampering (XP Overflow)**: Creating a session with `xp: 999` or `percentage: 150`.
9. **Resource Exhaustion (1MB String)**: Injecting a 10,000-char string into `bossPowerUp3Plan` or `playerName`.
10. **Array Bomb**: Sending `unlockedSkills` with 50 items or non-string element `[123]`.
11. **Post-Submit Mutation**: Any user attempting `update` on an existing `/game_sessions/run_1`.
12. **Cross-Player Scraping by Verified Student**: Student `uid_A` calling `list` on `/game_sessions` without filtering `ownerUid == uid_A` (cannot access `'public_player'` or `uid_B` docs).
