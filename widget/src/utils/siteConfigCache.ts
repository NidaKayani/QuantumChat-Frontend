import type { WebsiteBranding, WebsiteSettings } from '@quantum-chat/shared';
import type { ApiClient } from '../api';

const CACHE_TTL_MS = 10 * 60 * 1000;

export interface CachedWebsiteConfig {
  websiteId: string;
  name: string;
  branding: WebsiteBranding;
  settings: WebsiteSettings;
}

export async function getCachedWebsiteConfig(
  api: ApiClient,
  apiKey: string
): Promise<CachedWebsiteConfig> {
  const key = `qc_site_${apiKey}`;
  try {
    const raw = sessionStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw) as { data: CachedWebsiteConfig; ts: number };
      if (Date.now() - parsed.ts < CACHE_TTL_MS) return parsed.data;
    }
  } catch {
    /* ignore corrupt cache */
  }

  const data = await api.getWebsiteConfig();
  sessionStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }));
  return data;
}

export function clearWebsiteConfigCache(apiKey: string): void {
  sessionStorage.removeItem(`qc_site_${apiKey}`);
}
