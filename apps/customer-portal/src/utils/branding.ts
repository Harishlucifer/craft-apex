/**
 * Utility functions for dynamic tenant branding
 */

/**
 * Updates the document title based on tenant branding
 */
export const updateDocumentTitle = (tenantName?: string) => {
  if (tenantName) {
    document.title = `${tenantName} - Customer Portal`;
  } else {
    document.title = 'Customer Portal';
  }
};

/**
 * Updates the favicon based on tenant branding
 */
export const updateFavicon = (logoUrl?: string) => {
  const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
  if (favicon && logoUrl) {
    favicon.href = logoUrl;
  }
};

/**
 * Updates CSS custom properties for tenant branding
 */
export const updateBrandingStyles = (branding?: {
  primaryColor?: string;
  loginBackgroundUrl?: string;
}) => {
  if (!branding) return;

  const root = document.documentElement;
  
  if (branding.primaryColor) {
    root.style.setProperty('--brand-primary-color', branding.primaryColor);
  }
  
  if (branding.loginBackgroundUrl) {
    root.style.setProperty('--brand-background-image', `url(${branding.loginBackgroundUrl})`);
  }
};

/**
 * Applies all tenant branding updates
 */
export const applyTenantBranding = (branding?: {
  tenantName?: string;
  logoUrl?: string;
  primaryColor?: string;
  loginBackgroundUrl?: string;
}) => {
  if (!branding) return;

  updateDocumentTitle(branding.tenantName);
  updateFavicon(branding.logoUrl);
  updateBrandingStyles({
    primaryColor: branding.primaryColor,
    loginBackgroundUrl: branding.loginBackgroundUrl,
  });
};