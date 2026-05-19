import type { Platform, PlatformConfig } from './types.js';

export const PLATFORM_CONFIGS: Record<Platform, PlatformConfig> = {
  instagram_feed: {
    platform: 'instagram_feed',
    label: 'Instagram Feed',
    tone: 'engaging, conversational, with strong hook',
    maxLength: 2200,
    description:
      'Engaging caption with a strong hook, readable paragraphs, optional CTA and hashtags.',
  },
  instagram_story: {
    platform: 'instagram_story',
    label: 'Instagram Story',
    tone: 'short, punchy, main point only',
    maxLength: 250,
    description: 'Very short caption, main point only, minimal text.',
  },
  threads: {
    platform: 'threads',
    label: 'Threads',
    tone: 'conversational, easy to scan',
    maxLength: 500,
    description:
      'Split into numbered parts. Conversational and easy to scan. Each part should be a standalone thought.',
  },
  whatsapp_status: {
    platform: 'whatsapp_status',
    label: 'WhatsApp Status',
    tone: 'natural, personal, casual',
    maxLength: 700,
    description: 'Very short, natural and personal tone.',
  },
  linkedin: {
    platform: 'linkedin',
    label: 'LinkedIn',
    tone: 'professional, insight-driven',
    maxLength: 3000,
    description:
      'Professional, insight-driven, paragraph-based. Clear CTA or discussion prompt at the end.',
  },
  website: {
    platform: 'website',
    label: 'Website',
    tone: 'clear, informative, SEO-friendly',
    maxLength: null,
    description:
      'Full text, SEO-friendly. Can act as intro text or long-form rewrite.',
  },
};

export const ALL_PLATFORMS: Platform[] = Object.keys(PLATFORM_CONFIGS) as Platform[];
