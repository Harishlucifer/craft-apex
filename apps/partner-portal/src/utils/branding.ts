import { SetupData } from '@repo/types/setup';

export interface TenantBranding {
  tenantName?: string;
  logoUrl?: string;
  iconUrl?: string;
  faviconUrl?: string;
  primaryColor?: string;
  loginBackgroundUrl?: string;
}

// Convert hex color to HSL format for CSS custom properties
function hexToHsl(hex: string): string {
  // Remove the hash if present
  hex = hex.replace('#', '');
  
  // Parse the hex values
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  
  // Convert to degrees and percentages
  const hDeg = Math.round(h * 360);
  const sPercent = Math.round(s * 100);
  const lPercent = Math.round(l * 100);
  
  return `${hDeg} ${sPercent}% ${lPercent}%`;
}

export function applyTenantBranding(branding: TenantBranding) {
  // Apply favicon
  const faviconUrl = branding.faviconUrl || branding.iconUrl || branding.logoUrl;
  if (faviconUrl) {
    let favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    if (!favicon) {
      favicon = document.createElement('link');
      favicon.rel = 'icon';
      document.head.appendChild(favicon);
    }
    favicon.href = faviconUrl;
  }

  // Apply title
  if (branding.tenantName) {
    document.title = `${branding.tenantName} - Partner Portal`;
  }

  // Apply primary color as CSS custom property in HSL format
  if (branding.primaryColor && typeof branding.primaryColor === 'string' && branding.primaryColor.trim() !== '') {
    try {
      const hslColor = hexToHsl(branding.primaryColor);
      document.documentElement.style.setProperty('--primary', hslColor);
      document.documentElement.style.setProperty('--primary-color', branding.primaryColor);
      
      // Also set a contrasting foreground color
      // For now, use white text for dark colors and dark text for light colors
      const lightness = parseInt(hslColor.split(' ')[2] || '0');
      const foregroundColor = lightness > 50 ? '0 0% 9%' : '0 0% 98%';
      document.documentElement.style.setProperty('--primary-foreground', foregroundColor);
    } catch (error) {
      console.warn('Failed to apply primary color:', error);
    }
  }

  // Apply login background
  if (branding.loginBackgroundUrl) {
    document.documentElement.style.setProperty('--login-background', `url(${branding.loginBackgroundUrl})`);
  }
}

export function extractBrandingFromSetup(setupData: SetupData | null): TenantBranding {
  if (!setupData) return {};
  
  return {
    tenantName: setupData.tenant?.TENANT_NAME,
    logoUrl: setupData.system?.logo_url || setupData.tenant?.TENANT_LOGO,
    iconUrl: setupData.system?.icon_url || setupData.tenant?.TENANT_ICON,
    faviconUrl: setupData.system?.favicon_url || setupData.tenant?.TENANT_FAVICON,
    primaryColor: setupData.tenant?.PRIMARY_COLOR,
    loginBackgroundUrl: setupData.system?.login_background_url
  };
}