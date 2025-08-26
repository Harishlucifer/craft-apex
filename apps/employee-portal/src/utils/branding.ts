interface BrandingConfig {
  tenantName: string;
  logoUrl?: string;
  primaryColor?: string;
  loginBackgroundUrl?: string;
}

export function applyTenantBranding(config: BrandingConfig) {
  // Update document title
  document.title = `${config.tenantName} - Employee Portal`;
  
  // Update favicon if logo is provided
  if (config.logoUrl) {
    const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    if (favicon) {
      favicon.href = config.logoUrl;
    } else {
      const newFavicon = document.createElement('link');
      newFavicon.rel = 'icon';
      newFavicon.href = config.logoUrl;
      document.head.appendChild(newFavicon);
    }
  }
  
  // Update CSS custom properties for theming
  if (config.primaryColor) {
    document.documentElement.style.setProperty('--primary-color', config.primaryColor);
  }
  
  // Update meta theme color
  const themeColorMeta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement;
  if (themeColorMeta && config.primaryColor) {
    themeColorMeta.content = config.primaryColor;
  } else if (config.primaryColor) {
    const newThemeColorMeta = document.createElement('meta');
    newThemeColorMeta.name = 'theme-color';
    newThemeColorMeta.content = config.primaryColor;
    document.head.appendChild(newThemeColorMeta);
  }
}