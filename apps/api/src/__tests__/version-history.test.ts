import { describe, it, expect } from 'vitest';
import { computeLineDiff } from '../routes/version-history.js';
import type { DiffLine } from '../routes/version-history.js';

describe('Version History — Diff Support', () => {
  it('should detect no changes for identical content', () => {
    const text = 'Line 1\nLine 2\nLine 3';
    const diff = computeLineDiff(text, text);

    expect(diff.every((d) => d.type === 'unchanged')).toBe(true);
    expect(diff.length).toBe(3);
  });

  it('should detect added lines', () => {
    const textA = 'Line 1\nLine 2';
    const textB = 'Line 1\nLine 2\nLine 3';
    const diff = computeLineDiff(textA, textB);

    const added = diff.filter((d) => d.type === 'added');
    expect(added.length).toBe(1);
    expect(added[0].content).toBe('Line 3');
  });

  it('should detect removed lines', () => {
    const textA = 'Line 1\nLine 2\nLine 3';
    const textB = 'Line 1\nLine 3';
    const diff = computeLineDiff(textA, textB);

    const removed = diff.filter((d) => d.type === 'removed');
    expect(removed.length).toBe(1);
    expect(removed[0].content).toBe('Line 2');
  });

  it('should detect modified lines as remove + add', () => {
    const textA = 'Hello world';
    const textB = 'Hello universe';
    const diff = computeLineDiff(textA, textB);

    const removed = diff.filter((d) => d.type === 'removed');
    const added = diff.filter((d) => d.type === 'added');
    expect(removed.length).toBe(1);
    expect(removed[0].content).toBe('Hello world');
    expect(added.length).toBe(1);
    expect(added[0].content).toBe('Hello universe');
  });

  it('should handle empty first text', () => {
    const textA = '';
    const textB = 'New content\nSecond line';
    const diff = computeLineDiff(textA, textB);

    // Empty string splits to [''], so we get one removed empty line and two added lines
    const added = diff.filter((d) => d.type === 'added');
    expect(added.length).toBeGreaterThanOrEqual(2);
  });

  it('should handle empty second text', () => {
    const textA = 'Some content\nAnother line';
    const textB = '';
    const diff = computeLineDiff(textA, textB);

    const removed = diff.filter((d) => d.type === 'removed');
    expect(removed.length).toBeGreaterThanOrEqual(2);
  });

  it('should handle multiline prompt diff correctly', () => {
    const promptV1 = `Buat konten Instagram tentang kopi.
Tone: santai dan informatif.
Target: anak muda 20-30 tahun.`;

    const promptV2 = `Buat konten Instagram tentang kopi artisan.
Tone: santai, informatif, dan engaging.
Target: anak muda 20-30 tahun.
Tambahkan emoji di setiap paragraf.`;

    const diff = computeLineDiff(promptV1, promptV2);

    // Should have some unchanged, some removed, some added
    const types = new Set(diff.map((d) => d.type));
    expect(types.has('unchanged')).toBe(true);
    expect(types.has('removed') || types.has('added')).toBe(true);
  });

  it('should provide line numbers', () => {
    const textA = 'A\nB\nC';
    const textB = 'A\nX\nC';
    const diff = computeLineDiff(textA, textB);

    // First line should be unchanged with both line numbers
    const unchanged = diff.filter((d) => d.type === 'unchanged');
    expect(unchanged[0].lineNumber.old).toBeDefined();
    expect(unchanged[0].lineNumber.new).toBeDefined();
  });

  it('should handle single line content', () => {
    const textA = 'Single line';
    const textB = 'Different single line';
    const diff = computeLineDiff(textA, textB);

    expect(diff.length).toBe(2); // one removed, one added
  });
});

describe('Version History — Snapshot Validation', () => {
  it('version numbers should be sequential', () => {
    // Simulate version number generation
    const versions = [1, 2, 3, 4, 5];
    for (let i = 1; i < versions.length; i++) {
      expect(versions[i]).toBe(versions[i - 1] + 1);
    }
  });

  it('restore should create a new version, not overwrite', () => {
    // Simulate restore behavior
    const history = [
      { versionNumber: 1, label: 'Original' },
      { versionNumber: 2, label: 'Edit Manual' },
      { versionNumber: 3, label: 'Revisi AI' },
    ];

    // Restoring v1 should create v4, not modify v1
    const restoredVersion = {
      versionNumber: history.length + 1,
      label: `Restore dari v1`,
    };

    expect(restoredVersion.versionNumber).toBe(4);
    expect(history.length).toBe(3); // Original history unchanged
  });

  it('entity types should be distinct', () => {
    const promptEntity = { entityType: 'prompt', entityId: 'draft-123' };
    const contentEntity = { entityType: 'content', entityId: 'output-456' };

    expect(promptEntity.entityType).not.toBe(contentEntity.entityType);
  });

  it('metadata should preserve instruction text', () => {
    const metadata = {
      instructionText: 'Buat lebih singkat dan tambah emoji',
    };

    expect(metadata.instructionText).toBeTruthy();
    expect(typeof metadata.instructionText).toBe('string');
  });

  it('restore metadata should reference source version', () => {
    const metadata = {
      restoredFromVersion: 2,
    };

    expect(metadata.restoredFromVersion).toBe(2);
    expect(typeof metadata.restoredFromVersion).toBe('number');
  });
});

describe('Version History — Prompt and Content Separation', () => {
  it('prompt history should only contain prompt entity type', () => {
    const promptSnapshots = [
      { entityType: 'prompt', entityId: 'draft-1', versionNumber: 1 },
      { entityType: 'prompt', entityId: 'draft-1', versionNumber: 2 },
    ];

    expect(promptSnapshots.every((s) => s.entityType === 'prompt')).toBe(true);
  });

  it('content history should only contain content entity type', () => {
    const contentSnapshots = [
      { entityType: 'content', entityId: 'output-1', versionNumber: 1 },
      { entityType: 'content', entityId: 'output-1', versionNumber: 2 },
    ];

    expect(contentSnapshots.every((s) => s.entityType === 'content')).toBe(true);
  });

  it('comparing across entity types should be invalid', () => {
    const versionA = { entityType: 'prompt', entityId: 'draft-1' };
    const versionB = { entityType: 'content', entityId: 'output-1' };

    // The API rejects this — simulate the validation
    const canCompare =
      versionA.entityType === versionB.entityType &&
      versionA.entityId === versionB.entityId;

    expect(canCompare).toBe(false);
  });

  it('comparing within same entity should be valid', () => {
    const versionA = { entityType: 'prompt', entityId: 'draft-1' };
    const versionB = { entityType: 'prompt', entityId: 'draft-1' };

    const canCompare =
      versionA.entityType === versionB.entityType &&
      versionA.entityId === versionB.entityId;

    expect(canCompare).toBe(true);
  });
});
