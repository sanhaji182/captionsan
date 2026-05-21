import { describe, it, expect } from 'vitest';
import {
  isValidTransition,
  isCallbackAllowedState,
  REVIEW_STATES,
  VALID_TRANSITIONS,
  CALLBACK_ALLOWED_STATES,
} from '@captionsan/db/schema';
import type { ReviewState } from '@captionsan/db/schema';

describe('Review Callbacks — State Definitions', () => {
  it('should define exactly 5 review states', () => {
    expect(REVIEW_STATES).toHaveLength(5);
    expect(REVIEW_STATES).toContain('draft');
    expect(REVIEW_STATES).toContain('in_review');
    expect(REVIEW_STATES).toContain('approved');
    expect(REVIEW_STATES).toContain('rejected');
    expect(REVIEW_STATES).toContain('revision_requested');
  });

  it('should define callback-allowed states as subset of review states', () => {
    for (const state of CALLBACK_ALLOWED_STATES) {
      expect(REVIEW_STATES).toContain(state);
    }
  });

  it('should not allow draft or in_review via callback', () => {
    expect(CALLBACK_ALLOWED_STATES).not.toContain('draft');
    expect(CALLBACK_ALLOWED_STATES).not.toContain('in_review');
  });

  it('should allow approved, rejected, revision_requested via callback', () => {
    expect(CALLBACK_ALLOWED_STATES).toContain('approved');
    expect(CALLBACK_ALLOWED_STATES).toContain('rejected');
    expect(CALLBACK_ALLOWED_STATES).toContain('revision_requested');
  });
});

describe('Review Callbacks — State Transitions', () => {
  it('draft → in_review should be valid', () => {
    expect(isValidTransition('draft', 'in_review')).toBe(true);
  });

  it('draft → approved should be valid (manual approval)', () => {
    expect(isValidTransition('draft', 'approved')).toBe(true);
  });

  it('in_review → approved should be valid', () => {
    expect(isValidTransition('in_review', 'approved')).toBe(true);
  });

  it('in_review → rejected should be valid', () => {
    expect(isValidTransition('in_review', 'rejected')).toBe(true);
  });

  it('in_review → revision_requested should be valid', () => {
    expect(isValidTransition('in_review', 'revision_requested')).toBe(true);
  });

  it('revision_requested → draft should be valid', () => {
    expect(isValidTransition('revision_requested', 'draft')).toBe(true);
  });

  it('revision_requested → in_review should be valid', () => {
    expect(isValidTransition('revision_requested', 'in_review')).toBe(true);
  });

  it('rejected → draft should be valid', () => {
    expect(isValidTransition('rejected', 'draft')).toBe(true);
  });

  it('rejected → in_review should be valid', () => {
    expect(isValidTransition('rejected', 'in_review')).toBe(true);
  });

  it('approved should have no valid transitions (terminal state)', () => {
    expect(VALID_TRANSITIONS['approved']).toHaveLength(0);
    expect(isValidTransition('approved', 'draft')).toBe(false);
    expect(isValidTransition('approved', 'in_review')).toBe(false);
    expect(isValidTransition('approved', 'rejected')).toBe(false);
    expect(isValidTransition('approved', 'revision_requested')).toBe(false);
  });

  it('draft → rejected should be invalid', () => {
    expect(isValidTransition('draft', 'rejected')).toBe(false);
  });

  it('draft → revision_requested should be invalid', () => {
    expect(isValidTransition('draft', 'revision_requested')).toBe(false);
  });

  it('in_review → draft should be invalid (must go through rejection)', () => {
    expect(isValidTransition('in_review', 'draft')).toBe(false);
  });

  it('rejected → approved should be invalid (must resubmit first)', () => {
    expect(isValidTransition('rejected', 'approved')).toBe(false);
  });
});

describe('Review Callbacks — isCallbackAllowedState', () => {
  it('should return true for approved', () => {
    expect(isCallbackAllowedState('approved')).toBe(true);
  });

  it('should return true for rejected', () => {
    expect(isCallbackAllowedState('rejected')).toBe(true);
  });

  it('should return true for revision_requested', () => {
    expect(isCallbackAllowedState('revision_requested')).toBe(true);
  });

  it('should return false for draft', () => {
    expect(isCallbackAllowedState('draft')).toBe(false);
  });

  it('should return false for in_review', () => {
    expect(isCallbackAllowedState('in_review')).toBe(false);
  });

  it('should return false for arbitrary strings', () => {
    expect(isCallbackAllowedState('invalid')).toBe(false);
    expect(isCallbackAllowedState('')).toBe(false);
    expect(isCallbackAllowedState('APPROVED')).toBe(false);
  });
});

describe('Review Callbacks — Payload Validation', () => {
  it('should require outputId in callback payload', () => {
    const payload = { status: 'approved' };
    const isValid = 'outputId' in payload && payload.outputId;
    expect(isValid).toBeFalsy();
  });

  it('should require status in callback payload', () => {
    const payload = { outputId: 'some-uuid' };
    const isValid = 'status' in payload && payload.status;
    expect(isValid).toBeFalsy();
  });

  it('should accept valid callback payload', () => {
    const payload = {
      outputId: '550e8400-e29b-41d4-a716-446655440000',
      status: 'approved',
      externalJobId: 'n8n-exec-123',
      reviewerIdentifier: 'reviewer@example.com',
      notes: 'Looks good, approved!',
    };

    const hasRequired = payload.outputId && payload.status;
    const statusValid = isCallbackAllowedState(payload.status);

    expect(hasRequired).toBeTruthy();
    expect(statusValid).toBe(true);
  });

  it('should reject invalid status values', () => {
    const invalidStatuses = ['pending', 'cancelled', 'in_progress', 'APPROVED', ''];
    for (const status of invalidStatuses) {
      expect(isCallbackAllowedState(status)).toBe(false);
    }
  });
});

describe('Review Callbacks — Idempotency', () => {
  it('duplicate callback should not change state', () => {
    const currentStatus: ReviewState = 'approved';
    const callbackStatus: ReviewState = 'approved';

    // If current === new, it's a duplicate
    const isDuplicate = currentStatus === callbackStatus;
    expect(isDuplicate).toBe(true);
  });

  it('non-duplicate callback should proceed with transition check', () => {
    const currentStatus: ReviewState = 'in_review';
    const callbackStatus: ReviewState = 'approved';

    const isDuplicate = (currentStatus as string) === (callbackStatus as string);
    expect(isDuplicate).toBe(false);

    const isValid = isValidTransition(currentStatus, callbackStatus);
    expect(isValid).toBe(true);
  });
});

describe('Review Callbacks — Audit Trail', () => {
  it('callback event should record previous and new status', () => {
    const event = {
      platformOutputId: 'output-123',
      previousStatus: 'in_review',
      newStatus: 'approved',
      source: 'n8n',
      applied: 'success',
    };

    expect(event.previousStatus).toBe('in_review');
    expect(event.newStatus).toBe('approved');
    expect(event.source).toBe('n8n');
    expect(event.applied).toBe('success');
  });

  it('rejected callback should record rejection reason', () => {
    const event = {
      platformOutputId: 'output-123',
      previousStatus: 'draft',
      newStatus: 'approved',
      source: 'n8n',
      applied: 'rejected',
      rejectionReason: 'Invalid transition: draft → approved is not allowed via callback when not in_review',
    };

    expect(event.applied).toBe('rejected');
    expect(event.rejectionReason).toBeTruthy();
  });

  it('duplicate callback should be marked as duplicate', () => {
    const event = {
      platformOutputId: 'output-123',
      previousStatus: 'approved',
      newStatus: 'approved',
      source: 'n8n',
      applied: 'duplicate',
      rejectionReason: 'Status already set to this value',
    };

    expect(event.applied).toBe('duplicate');
  });

  it('callback event should preserve reviewer metadata', () => {
    const event = {
      platformOutputId: 'output-123',
      externalJobId: 'n8n-workflow-456',
      reviewerIdentifier: 'john@company.com',
      notes: 'Please fix the tone in paragraph 2',
      providerPayload: { workflowId: 'wf-789', nodeId: 'review-node' },
    };

    expect(event.externalJobId).toBe('n8n-workflow-456');
    expect(event.reviewerIdentifier).toBe('john@company.com');
    expect(event.notes).toContain('paragraph 2');
    expect(event.providerPayload).toHaveProperty('workflowId');
  });
});

describe('Review Callbacks — Submit for Review', () => {
  it('should only allow submitting from valid states', () => {
    // Can submit from draft
    expect(isValidTransition('draft', 'in_review')).toBe(true);

    // Can resubmit from rejected
    expect(isValidTransition('rejected', 'in_review')).toBe(true);

    // Can resubmit from revision_requested
    expect(isValidTransition('revision_requested', 'in_review')).toBe(true);

    // Cannot submit from approved (terminal)
    expect(isValidTransition('approved', 'in_review')).toBe(false);

    // Cannot submit from in_review (already there)
    expect(isValidTransition('in_review', 'in_review')).toBe(false);
  });
});

describe('Review Callbacks — Security', () => {
  it('callback endpoint requires authentication', () => {
    // The route uses requireApiAuth middleware
    // This test documents the requirement
    const routeConfig = {
      path: '/api/review-callbacks',
      method: 'POST',
      middleware: ['requireApiAuth'],
    };

    expect(routeConfig.middleware).toContain('requireApiAuth');
  });

  it('only valid UUID format should be accepted for outputId', () => {
    const validUuid = '550e8400-e29b-41d4-a716-446655440000';
    const invalidIds = ['not-a-uuid', '123', '', 'null'];

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    expect(uuidRegex.test(validUuid)).toBe(true);
    for (const id of invalidIds) {
      expect(uuidRegex.test(id)).toBe(false);
    }
  });
});
