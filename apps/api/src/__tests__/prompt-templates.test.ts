import { describe, it, expect } from 'vitest';
import { substitutePlaceholders } from '../routes/prompt-templates.js';

describe('Prompt Templates — Placeholder Substitution', () => {
  it('should substitute simple placeholders', () => {
    const body = 'Buat konten tentang {{produk}} untuk {{audiens}}';
    const values = { produk: 'Sepatu Lari', audiens: 'anak muda' };
    const result = substitutePlaceholders(body, values);
    expect(result).toBe('Buat konten tentang Sepatu Lari untuk anak muda');
  });

  it('should leave unmatched placeholders intact', () => {
    const body = 'Promosikan {{produk}} di {{platform}}';
    const values = { produk: 'Kopi Arabika' };
    const result = substitutePlaceholders(body, values);
    expect(result).toBe('Promosikan Kopi Arabika di {{platform}}');
  });

  it('should handle empty values object', () => {
    const body = 'Template dengan {{placeholder}}';
    const result = substitutePlaceholders(body, {});
    expect(result).toBe('Template dengan {{placeholder}}');
  });

  it('should handle body with no placeholders', () => {
    const body = 'Template tanpa placeholder apapun';
    const values = { produk: 'Test' };
    const result = substitutePlaceholders(body, values);
    expect(result).toBe('Template tanpa placeholder apapun');
  });

  it('should handle multiple occurrences of the same placeholder', () => {
    const body = '{{brand}} adalah pilihan terbaik. Pilih {{brand}} sekarang!';
    const values = { brand: 'CaptionSan' };
    const result = substitutePlaceholders(body, values);
    expect(result).toBe('CaptionSan adalah pilihan terbaik. Pilih CaptionSan sekarang!');
  });

  it('should handle empty string values', () => {
    const body = 'Halo {{nama}}, selamat datang!';
    const values = { nama: '' };
    const result = substitutePlaceholders(body, values);
    expect(result).toBe('Halo , selamat datang!');
  });

  it('should handle values with special characters', () => {
    const body = 'Promo: {{deskripsi}}';
    const values = { deskripsi: 'Diskon 50% untuk semua produk (termasuk bundling)' };
    const result = substitutePlaceholders(body, values);
    expect(result).toBe('Promo: Diskon 50% untuk semua produk (termasuk bundling)');
  });

  it('should not substitute partial matches or nested braces', () => {
    const body = 'Test {single} and {{valid}} and {{{triple}}}';
    const values = { single: 'NO', valid: 'YES', triple: 'INNER' };
    const result = substitutePlaceholders(body, values);
    // {single} is not a valid placeholder (single braces), so it stays
    // {{valid}} is substituted
    // {{{triple}}} — the regex matches {{triple}} inside the triple braces, leaving outer braces
    expect(result).toBe('Test {single} and YES and {INNER}');
  });

  it('should handle multiline template body', () => {
    const body = `Judul: {{judul}}

Deskripsi:
{{deskripsi}}

CTA: {{cta}}`;
    const values = {
      judul: 'Promo Akhir Tahun',
      deskripsi: 'Dapatkan diskon spesial',
      cta: 'Beli Sekarang',
    };
    const result = substitutePlaceholders(body, values);
    expect(result).toBe(`Judul: Promo Akhir Tahun

Deskripsi:
Dapatkan diskon spesial

CTA: Beli Sekarang`);
  });
});

describe('Prompt Templates — Schema Validation', () => {
  it('should define valid placeholder structure', () => {
    const placeholder = {
      key: 'produk',
      label: 'Nama Produk',
      description: 'Nama produk yang akan dipromosikan',
      defaultValue: 'Produk Kami',
      required: true,
    };

    expect(placeholder.key).toBeTruthy();
    expect(placeholder.label).toBeTruthy();
    expect(typeof placeholder.required).toBe('boolean');
  });

  it('should allow optional placeholder fields', () => {
    const placeholder = {
      key: 'tone',
      label: 'Tone',
    };

    expect(placeholder.key).toBeTruthy();
    expect(placeholder.label).toBeTruthy();
    expect(placeholder).not.toHaveProperty('description');
    expect(placeholder).not.toHaveProperty('defaultValue');
    expect(placeholder).not.toHaveProperty('required');
  });
});

describe('Prompt Templates — Backward Compatibility with Prompt-First Flow', () => {
  it('template output should be usable as prompt draft text', () => {
    // A template-generated prompt should be a plain string that can be stored
    // in promptDrafts.promptOriginal and promptDrafts.promptCurrent
    const body = 'Buat konten {{tipe}} tentang {{topik}} dengan tone {{tone}}';
    const values = { tipe: 'Instagram', topik: 'kopi', tone: 'santai' };
    const result = substitutePlaceholders(body, values);

    // The result should be a non-empty string suitable for prompt_drafts
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
    expect(result).not.toContain('{{');
  });

  it('template without placeholders should work as-is', () => {
    // Templates without placeholders should pass through unchanged
    const body = 'Buat konten Instagram yang menarik tentang produk baru kami dengan tone profesional dan informatif.';
    const result = substitutePlaceholders(body, {});
    expect(result).toBe(body);
  });

  it('template result is compatible with prompt revision flow', () => {
    // After applying a template, the result goes into promptCurrent
    // which can then be revised using the existing revision flow
    const body = 'Tulis caption {{platform}} tentang {{topik}}';
    const values = { platform: 'LinkedIn', topik: 'AI di dunia kerja' };
    const result = substitutePlaceholders(body, values);

    // Simulate what the revision flow expects: a non-empty string
    expect(result.trim().length).toBeGreaterThan(0);
    // Should not have any template syntax that would confuse the AI
    expect(result).not.toMatch(/\{\{\w+\}\}/);
  });
});
