import type { BadgeTone } from '@/components/ui/badge';

/**
 * Centralized status label and tone mapping. Keeps every page using the
 * same Indonesian labels and badge color logic so the UI feels cohesive.
 */

export const PROJECT_STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  prompt_review: 'Review Prompt',
  prompt_approved: 'Prompt Disetujui',
  generating: 'Sedang Generate',
  content_generating: 'Sedang Generate',
  content_review: 'Review Konten',
  review: 'Review',
  approved: 'Disetujui',
  completed: 'Selesai',
};

export const GENERATION_STATUS_LABELS: Record<string, string> = {
  ...PROJECT_STATUS_LABELS,
  processing: 'Memproses',
  partial: 'Sebagian',
  failed: 'Gagal',
  queued: 'Antrian',
};

export const APPROVAL_STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  in_review: 'Dalam Review',
  approved: 'Disetujui',
  rejected: 'Ditolak',
  revision_requested: 'Revisi Diminta',
};

export const PLATFORM_LABELS: Record<string, string> = {
  instagram_feed: 'Instagram Feed',
  instagram_story: 'Instagram Story',
  threads: 'Threads',
  whatsapp_status: 'WhatsApp Status',
  linkedin: 'LinkedIn',
  website: 'Website',
};

export const PLATFORM_LABELS_SHORT: Record<string, string> = {
  instagram_feed: 'IG Feed',
  instagram_story: 'IG Story',
  threads: 'Threads',
  whatsapp_status: 'WA Status',
  linkedin: 'LinkedIn',
  website: 'Website',
};

const STATUS_TONES: Record<string, BadgeTone> = {
  draft: 'neutral',
  prompt_review: 'info',
  prompt_approved: 'success',
  generating: 'info',
  content_generating: 'info',
  processing: 'info',
  queued: 'warning',
  content_review: 'info',
  review: 'info',
  in_review: 'info',
  approved: 'success',
  completed: 'success',
  partial: 'warning',
  failed: 'danger',
  rejected: 'danger',
  revision_requested: 'warning',
};

export function statusTone(status: string): BadgeTone {
  return STATUS_TONES[status] ?? 'neutral';
}

export function projectStatusLabel(status: string): string {
  return PROJECT_STATUS_LABELS[status] ?? status;
}

export function generationStatusLabel(status: string): string {
  return GENERATION_STATUS_LABELS[status] ?? status;
}

export function approvalStatusLabel(status: string): string {
  return APPROVAL_STATUS_LABELS[status] ?? status;
}

export function platformLabel(platform: string, short = false): string {
  const dict = short ? PLATFORM_LABELS_SHORT : PLATFORM_LABELS;
  return dict[platform] ?? platform;
}
