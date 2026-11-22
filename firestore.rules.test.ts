/**
 * Security Rules Specification Verification Matrix (Dirty Dozen)
 * Documents and verifies payload boundaries against firebase-blueprint.json constraints.
 */

export interface SecurityTestCase {
  name: string;
  payload: Record<string, unknown>;
  expectedResult: 'PERMISSION_DENIED';
  violatedPillar: string;
}

export const DIRTY_DOZEN_CASES: SecurityTestCase[] = [
  {
    name: '1. Unauthenticated create',
    payload: { auth: null, sessionId: 'run_1' },
    expectedResult: 'PERMISSION_DENIED',
    violatedPillar: 'Master Auth Gate',
  },
  {
    name: '2. Unverified admin email spoof',
    payload: { email: 'haneulnekita@gmail.com', email_verified: false },
    expectedResult: 'PERMISSION_DENIED',
    violatedPillar: 'Verified Email Gate',
  },
  {
    name: '3. Identity spoofing ownerUid',
    payload: { authUid: 'user_A', ownerUid: 'user_B' },
    expectedResult: 'PERMISSION_DENIED',
    violatedPillar: 'Validation Blueprint Identity Integrity',
  },
  {
    name: '4. Shadow field injection',
    payload: { id: 'run_1', isAdmin: true },
    expectedResult: 'PERMISSION_DENIED',
    violatedPillar: 'Strict hasOnly Key Allowlist',
  },
  {
    name: '5. Forged createdAt timestamp',
    payload: { createdAt: '2020-01-01T00:00:00Z' },
    expectedResult: 'PERMISSION_DENIED',
    violatedPillar: 'Temporal Integrity (request.time)',
  },
  {
    name: '6. Path ID poisoning',
    payload: { sessionId: 'bad$id with spaces!' },
    expectedResult: 'PERMISSION_DENIED',
    violatedPillar: 'Path Variable Hardening',
  },
  {
    name: '7. Document ID mismatch',
    payload: { sessionId: 'run_1', id: 'run_2' },
    expectedResult: 'PERMISSION_DENIED',
    violatedPillar: 'Path-Payload Consistency',
  },
  {
    name: '8. Score tampering (xp > 4)',
    payload: { xp: 99, maxXp: 4, percentage: 100 },
    expectedResult: 'PERMISSION_DENIED',
    violatedPillar: 'Boundary Limits',
  },
  {
    name: '9. Oversized reflection string (> 4000 chars)',
    payload: { bossPowerUp3Plan: 'x'.repeat(4500) },
    expectedResult: 'PERMISSION_DENIED',
    violatedPillar: 'Denial of Wallet Size Guard',
  },
  {
    name: '10. Unbounded or invalid unlockedSkills array',
    payload: { unlockedSkills: [123, 456, 789, 101, 112] },
    expectedResult: 'PERMISSION_DENIED',
    violatedPillar: 'Total Array Guarding',
  },
  {
    name: '11. Post-completion score update attempt',
    payload: { operation: 'update', xp: 4 },
    expectedResult: 'PERMISSION_DENIED',
    violatedPillar: 'Terminal State Immutability',
  },
  {
    name: '12. Cross-player list/get scraping by non-admin',
    payload: { operation: 'list', authUid: 'student_A', targetOwnerUid: 'student_B' },
    expectedResult: 'PERMISSION_DENIED',
    violatedPillar: 'Secure List Queries & PII Isolation',
  },
];
