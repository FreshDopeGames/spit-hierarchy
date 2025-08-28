import { hexToHsl } from '@/lib/utils';

export interface GradientConfig {
  id: string;
  name: string;
  type: 'linear' | 'radial' | 'conic';
  direction: number; // degrees for linear, ignored for radial/conic
  stops: Array<{
    color: string;
    position: number; // 0-100
  }>;
}

export interface BorderConfig {
  width: string;
  style: 'solid' | 'dashed' | 'dotted' | 'double' | 'groove' | 'ridge';
  color: string;
  radius: string;
}

export interface TypographyConfig {
  fontSize: string;
  fontWeight: string;
  lineHeight: string;
  letterSpacing?: string;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
}

export interface ElementConfig {
  background?: string;
  color?: string;
  border?: BorderConfig;
  typography?: TypographyConfig;
  gradient?: string; // gradient ID
  shadow?: string;
  padding?: string;
  margin?: string;
}

export interface EnhancedThemeConfig {
  colors: {
    primary: string;
    primaryLight: string;
    primaryDark: string;
    secondary: string;
    secondaryLight: string;
    secondaryDark: string;
    accent: string;
    accentLight: string;
    accentDark: string;
    background: string;
    backgroundLight: string;
    backgroundDark: string;
    surface: string;
    text: string;
    textLight: string;
    textMuted: string;
    border: string;
    success: string;
    warning: string;
    error: string;
  };
  fonts: {
    heading: string;
    body: string;
    display: string;
    code: string;
  };
  typography: {
    h1: TypographyConfig;
    h2: TypographyConfig;
    h3: TypographyConfig;
    h4: TypographyConfig;
    h5: TypographyConfig;
    h6: TypographyConfig;
    body: TypographyConfig;
    caption: TypographyConfig;
    code: TypographyConfig;
  };
  gradients: GradientConfig[];
  elements: {
    button: {
      default: ElementConfig;
      secondary: ElementConfig;
      accent: ElementConfig;
      outline: ElementConfig;
      gradient: ElementConfig;
    };
    card: ElementConfig;
    input: ElementConfig;
    modal: ElementConfig;
    navigation: ElementConfig;
    footer: ElementConfig;
    global_header: ElementConfig;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

export const defaultEnhancedTheme: EnhancedThemeConfig = {
  colors: {
    primary: '#D4AF37',
    primaryLight: '#E8C547',
    primaryDark: '#B8941F',
    secondary: '#800020',
    secondaryLight: '#A6002A',
    secondaryDark: '#5A0016',
    accent: '#6B8E23',
    accentLight: '#7BA428',
    accentDark: '#5A7A1E',
    background: '#0D0D0D',
    backgroundLight: '#1A1A1A',
    backgroundDark: '#000000',
    surface: '#2B2B2B',
    text: '#E8E6E3',
    textLight: '#FFFFFF',
    textMuted: '#BFBFBF',
    border: '#D4AF37',
    success: '#6B8E23',
    warning: '#FF8C00',
    error: '#DC143C',
  },
  fonts: {
    heading: 'Mogra, cursive',
    body: 'Merienda, serif',
    display: 'Ceviche One, cursive',
    code: 'JetBrains Mono, monospace',
  },
  typography: {
    h1: { fontSize: '3rem', fontWeight: '900', lineHeight: '1.2', textTransform: 'uppercase', letterSpacing: '0.05em' },
    h2: { fontSize: '2.25rem', fontWeight: '800', lineHeight: '1.3', textTransform: 'uppercase' },
    h3: { fontSize: '1.875rem', fontWeight: '700', lineHeight: '1.4' },
    h4: { fontSize: '1.5rem', fontWeight: '600', lineHeight: '1.5' },
    h5: { fontSize: '1.25rem', fontWeight: '500', lineHeight: '1.6' },
    h6: { fontSize: '1.125rem', fontWeight: '500', lineHeight: '1.6' },
    body: { fontSize: '1rem', fontWeight: '400', lineHeight: '1.7' },
    caption: { fontSize: '0.875rem', fontWeight: '400', lineHeight: '1.5' },
    code: { fontSize: '0.875rem', fontWeight: '400', lineHeight: '1.6' },
  },
  gradients: [
    {
      id: 'primary-gradient',
      name: 'Primary Gradient',
      type: 'linear',
      direction: 135,
      stops: [
        { color: '#D4AF37', position: 0 },
        { color: '#E8C547', position: 100 }
      ]
    },
    {
      id: 'secondary-gradient',
      name: 'Secondary Gradient',
      type: 'linear',
      direction: 45,
      stops: [
        { color: '#800020', position: 0 },
        { color: '#A6002A', position: 100 }
      ]
    },
    {
      id: 'accent-gradient',
      name: 'Accent Gradient',
      type: 'radial',
      direction: 0,
      stops: [
        { color: '#6B8E23', position: 0 },
        { color: '#7BA428', position: 100 }
      ]
    }
  ],
  elements: {
    button: {
      default: {
        background: '#D4AF37',
        color: '#0D0D0D',
        border: { width: '1px', style: 'solid', color: '#D4AF37', radius: '8px' },
        typography: { fontSize: '0.875rem', fontWeight: '600', lineHeight: '1.5' },
        padding: '0.5rem 1rem'
      },
      secondary: {
        background: '#800020',
        color: '#E8E6E3',
        border: { width: '1px', style: 'solid', color: '#800020', radius: '8px' },
        typography: { fontSize: '0.875rem', fontWeight: '600', lineHeight: '1.5' },
        padding: '0.5rem 1rem'
      },
      accent: {
        background: '#6B8E23',
        color: '#E8E6E3',
        border: { width: '1px', style: 'solid', color: '#6B8E23', radius: '8px' },
        typography: { fontSize: '0.875rem', fontWeight: '600', lineHeight: '1.5' },
        padding: '0.5rem 1rem'
      },
      outline: {
        background: 'transparent',
        color: '#D4AF37',
        border: { width: '2px', style: 'solid', color: '#D4AF37', radius: '8px' },
        typography: { fontSize: '0.875rem', fontWeight: '600', lineHeight: '1.5' },
        padding: '0.5rem 1rem'
      },
      gradient: {
        gradient: 'primary-gradient',
        color: '#0D0D0D',
        border: { width: '0px', style: 'solid', color: 'transparent', radius: '8px' },
        typography: { fontSize: '0.875rem', fontWeight: '600', lineHeight: '1.5' },
        padding: '0.5rem 1rem'
      }
    },
    card: {
      background: '#2B2B2B',
      color: '#E8E6E3',
      border: { width: '1px', style: 'solid', color: '#D4AF37', radius: '12px' },
      padding: '1.5rem',
      shadow: '0 4px 6px rgba(212, 175, 55, 0.1)'
    },
    input: {
      background: '#2B2B2B',
      color: '#E8E6E3',
      border: { width: '2px', style: 'solid', color: '#D4AF37', radius: '8px' },
      typography: { fontSize: '1rem', fontWeight: '400', lineHeight: '1.5' },
      padding: '0.75rem 1rem'
    },
    modal: {
      background: '#1A1A1A',
      color: '#E8E6E3',
      border: { width: '1px', style: 'solid', color: '#D4AF37', radius: '16px' },
      padding: '2rem',
      shadow: '0 20px 25px rgba(212, 175, 55, 0.3)'
    },
    navigation: {
      background: '#0D0D0D',
      color: '#E8E6E3',
      border: { width: '0px', style: 'solid', color: 'transparent', radius: '0px' },
      padding: '1rem 2rem'
    },
    footer: {
      background: '#0D0D0D',
      color: '#BFBFBF',
      border: { width: '1px', style: 'solid', color: '#D4AF37', radius: '0px' },
      padding: '3rem 2rem'
    },
    global_header: {
      background: '#000000',
      color: '#E8E6E3',
      border: { width: '1px', style: 'solid', color: '#D4AF37', radius: '0px' },
      padding: '0px'
    }
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '2rem',
    xl: '4rem',
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
  },
  shadows: {
    sm: '0 1px 2px rgba(212, 175, 55, 0.1)',
    md: '0 4px 6px rgba(212, 175, 55, 0.1)',
    lg: '0 10px 15px rgba(212, 175, 55, 0.2)',
    xl: '0 20px 25px rgba(212, 175, 55, 0.3)',
  },
};

// Convert gradient to CSS string
export const gradientToCSS = (gradient: GradientConfig): string => {
  const stops = gradient.stops
    .sort((a, b) => a.position - b.position)
    .map(stop => `${stop.color} ${stop.position}%`)
    .join(', ');

  switch (gradient.type) {
    case 'linear':
      return `linear-gradient(${gradient.direction}deg, ${stops})`;
    case 'radial':
      return `radial-gradient(circle, ${stops})`;
    case 'conic':
      return `conic-gradient(from ${gradient.direction}deg, ${stops})`;
    default:
      return `linear-gradient(${gradient.direction}deg, ${stops})`;
  }
};

// Apply enhanced theme to DOM
export const applyEnhancedThemeToDOM = (theme: EnhancedThemeConfig): void => {
  if (typeof document === 'undefined') return;
  
  const root = document.documentElement;
  
  // Apply color variables
  Object.entries(theme.colors).forEach(([key, value]) => {
    const hslValue = value.startsWith('#') ? hexToHsl(value) : value;
    root.style.setProperty(`--theme-${key}`, hslValue);
    
    if (key === 'primary') root.style.setProperty('--primary', hslValue);
    if (key === 'background') root.style.setProperty('--background', hslValue);
    if (key === 'surface') root.style.setProperty('--muted', hslValue);
    if (key === 'text') {
      root.style.setProperty('--foreground', hslValue);
      root.style.setProperty('--muted-foreground', hslValue);
    }
  });
  
  // Apply font variables
  Object.entries(theme.fonts).forEach(([key, value]) => {
    root.style.setProperty(`--theme-font-${key}`, value);
  });
  
  // Apply typography variables
  Object.entries(theme.typography).forEach(([element, config]) => {
    Object.entries(config).forEach(([property, value]) => {
      root.style.setProperty(`--theme-typography-${element}-${property}`, value);
    });
  });
  
  // Apply gradient variables
  theme.gradients.forEach(gradient => {
    root.style.setProperty(`--theme-gradient-${gradient.id}`, gradientToCSS(gradient));
  });
  
  // Apply element variables
  Object.entries(theme.elements).forEach(([elementType, configs]) => {
    if (typeof configs === 'object' && 'default' in configs) {
      // Button-style element with variants
      Object.entries(configs).forEach(([variant, config]) => {
        applyElementConfig(root, `${elementType}-${variant}`, config, theme);
      });
    } else {
      // Single element config
      applyElementConfig(root, elementType, configs as ElementConfig, theme);
    }
  });
  
  // Apply other variables
  Object.entries(theme.spacing).forEach(([key, value]) => {
    root.style.setProperty(`--theme-spacing-${key}`, value);
  });
  
  Object.entries(theme.borderRadius).forEach(([key, value]) => {
    root.style.setProperty(`--theme-radius-${key}`, value);
  });
  
  Object.entries(theme.shadows).forEach(([key, value]) => {
    root.style.setProperty(`--theme-shadow-${key}`, value);
  });
};

const applyElementConfig = (root: HTMLElement, elementName: string, config: ElementConfig, theme: EnhancedThemeConfig) => {
  if (config.background) {
    const bgValue = config.background.startsWith('#') ? hexToHsl(config.background) : config.background;
    root.style.setProperty(`--theme-element-${elementName}-bg`, bgValue);
  }
  
  if (config.color) {
    const colorValue = config.color.startsWith('#') ? hexToHsl(config.color) : config.color;
    root.style.setProperty(`--theme-element-${elementName}-color`, colorValue);
  }
  
  if (config.gradient) {
    const gradient = theme.gradients.find(g => g.id === config.gradient);
    if (gradient) {
      root.style.setProperty(`--theme-element-${elementName}-bg`, gradientToCSS(gradient));
    }
  }
  
  if (config.border) {
    const borderColor = config.border.color.startsWith('#') ? hexToHsl(config.border.color) : config.border.color;
    root.style.setProperty(`--theme-element-${elementName}-border-width`, config.border.width);
    root.style.setProperty(`--theme-element-${elementName}-border-style`, config.border.style);
    root.style.setProperty(`--theme-element-${elementName}-border-color`, borderColor);
    root.style.setProperty(`--theme-element-${elementName}-border-radius`, config.border.radius);
  }
  
  if (config.typography) {
    Object.entries(config.typography).forEach(([property, value]) => {
      root.style.setProperty(`--theme-element-${elementName}-${property}`, value);
    });
  }
  
  if (config.shadow) {
    root.style.setProperty(`--theme-element-${elementName}-shadow`, config.shadow);
  }
  
  if (config.padding) {
    root.style.setProperty(`--theme-element-${elementName}-padding`, config.padding);
  }
  
  if (config.margin) {
    root.style.setProperty(`--theme-element-${elementName}-margin`, config.margin);
  }
};