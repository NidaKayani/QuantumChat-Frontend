import type { WebsiteBranding, WebsiteSettings } from '@quantum-chat/shared';

export function mergeBranding(
  ...sources: Array<Partial<WebsiteBranding> | undefined>
): Partial<WebsiteBranding> {
  return Object.assign({}, ...sources.filter(Boolean));
}

export function applyBrandingStyles(
  root: HTMLElement,
  branding: Partial<WebsiteBranding>
): void {
  if (branding.primaryColor) root.style.setProperty('--qc-primary', branding.primaryColor);
  if (branding.secondaryColor) root.style.setProperty('--qc-secondary', branding.secondaryColor);
  if (branding.accentColor) {
    root.style.setProperty('--qc-accent', branding.accentColor);
    root.style.setProperty('--qc-accent-glow', `${branding.accentColor}59`);
  }
  if (branding.fontFamily) root.style.fontFamily = branding.fontFamily;
}

export const defaultSettings: WebsiteSettings = {
  allowFileUploads: true,
  allowReactions: true,
  allowEditing: true,
  maxFileSizeMb: 25,
  notificationSound: true,
};

export function mergeSettings(
  ...sources: Array<Partial<WebsiteSettings> | undefined>
): WebsiteSettings {
  return { ...defaultSettings, ...Object.assign({}, ...sources.filter(Boolean)) };
}
