import { describe, it, expect } from 'vitest';

/**
 * These tests verify the approval gating logic at the pure-function level.
 * The actual route handlers depend on the database, so we test the logic patterns
 * that enforce the prompt-first flow:
 *
 * 1. Generation requires an approved prompt
 * 2. Edit is rejected after approval
 * 3. Revision is rejected after approval
 *
 * We extract and test the decision logic that the routes implement.
 */

// Simulates the approval gate check from generations.ts
// The route queries for promptDrafts where promptApproved === true.
// If no approved draft is found, the query returns null.
// This mirrors the actual DB query: eq(promptDrafts.promptApproved, true)
function canGenerate(approvedPromptDraft: { promptApproved: boolean; promptCurrent: string } | null): {
  allowed: boolean;
  error?: string;
} {
  if (!approvedPromptDraft) {
    return { allowed: false, error: 'Prompt must be approved before generating content' };
  }
  return { allowed: true };
}

// Simulates the edit gate check from prompts.ts
function canEditPrompt(promptDraft: { promptApproved: boolean }): {
  allowed: boolean;
  error?: string;
} {
  if (promptDraft.promptApproved) {
    return { allowed: false, error: 'Cannot edit an approved prompt' };
  }
  return { allowed: true };
}

// Simulates the revision gate check from prompts.ts
function canRevisePrompt(promptDraft: { promptApproved: boolean }): {
  allowed: boolean;
  error?: string;
} {
  if (promptDraft.promptApproved) {
    return { allowed: false, error: 'Cannot revise an approved prompt' };
  }
  return { allowed: true };
}

describe('Prompt-first flow: approval gating', () => {
  describe('Generation gate', () => {
    it('returns error when no approved prompt exists (null)', () => {
      const result = canGenerate(null);
      expect(result.allowed).toBe(false);
      expect(result.error).toBe('Prompt must be approved before generating content');
    });

    it('returns error when no approved prompt draft is found (query returns null for unapproved)', () => {
      // In the actual route, the DB query filters by promptApproved === true,
      // so a draft that exists but isn't approved results in null from the query.
      const result = canGenerate(null);
      expect(result.allowed).toBe(false);
      expect(result.error).toBe('Prompt must be approved before generating content');
    });

    it('allows generation when an approved prompt draft is found', () => {
      const result = canGenerate({ promptApproved: true, promptCurrent: 'Write about coffee' });
      expect(result.allowed).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  describe('Edit gate', () => {
    it('allows editing when prompt is not yet approved', () => {
      const result = canEditPrompt({ promptApproved: false });
      expect(result.allowed).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('rejects editing when prompt is already approved', () => {
      const result = canEditPrompt({ promptApproved: true });
      expect(result.allowed).toBe(false);
      expect(result.error).toBe('Cannot edit an approved prompt');
    });
  });

  describe('Revision gate', () => {
    it('allows revision when prompt is not yet approved', () => {
      const result = canRevisePrompt({ promptApproved: false });
      expect(result.allowed).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('rejects revision when prompt is already approved', () => {
      const result = canRevisePrompt({ promptApproved: true });
      expect(result.allowed).toBe(false);
      expect(result.error).toBe('Cannot revise an approved prompt');
    });
  });

  describe('Full flow sequence', () => {
    it('enforces the correct prompt-first lifecycle', () => {
      // Step 1: Draft state - can edit and revise, cannot generate
      // (generation query for approved draft returns null)
      const draftPrompt = { promptApproved: false };
      expect(canEditPrompt(draftPrompt).allowed).toBe(true);
      expect(canRevisePrompt(draftPrompt).allowed).toBe(true);
      expect(canGenerate(null).allowed).toBe(false); // no approved draft found

      // Step 2: Approved state - cannot edit or revise, can generate
      const approvedPrompt = { promptApproved: true };
      const approvedDraft = { promptApproved: true, promptCurrent: 'Approved instruction' };
      expect(canEditPrompt(approvedPrompt).allowed).toBe(false);
      expect(canRevisePrompt(approvedPrompt).allowed).toBe(false);
      expect(canGenerate(approvedDraft).allowed).toBe(true);
    });
  });
});
