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
  hoverBackground?: string;
  hoverColor?: string;
  gradient?: string;
  border?: BorderConfig;
  typography?: TypographyConfig;
  shadow?: string;
  hoverShadow?: string;  // Special property for ranking cards
  overlay?: string;      // Special property for ranking cards  
  hoverOverlay?: string; // Special property for ranking cards
  padding?: string;
  margin?: string;
}

export interface EnhancedThemeConfig {
  colors: {
    // Core theme colors
    primary: string;
    primaryLight: string;
    primaryDark: string;
    secondary: string;
    secondaryLight: string;
    secondaryDark: string;
    accent: string;
    accentLight: string;
    accentDark: string;
    
    // Background colors
    background: string;
    backgroundLight: string;
    backgroundDark: string;
    surface: string;
    
    // Text colors
    text: string;
    textLight: string;
    textMuted: string;
    textInverted: string;
    
    // Border
    border: string;
    
    // Status colors - semantic colors for UI states
    success: string;
    successLight: string;
    successDark: string;
    warning: string;
    warningLight: string;
    warningDark: string;
    error: string;
    errorLight: string;
    errorDark: string;
    info: string;
    infoLight: string;
    infoDark: string;
    
    // Neutral colors
    neutral: string;
    neutralLight: string;
    neutralDark: string;
    
    // Absolute colors
    white: string;
    black: string;
    
    // Gray palette for various UI needs
    gray: string;
    grayLight: string;
    grayMid: string;
    grayDark: string;

    // Achievement rarity colors
    rarityCommon: string;
    rarityUncommon: string;
    rarityRare: string;
    rarityEpic: string;
    rarityLegendary: string;
    rarityMythic: string;

    // Interactive state colors
    hoverBg: string;
    hoverColor: string;
    activeBg: string;
    activeColor: string;
    focusBg: string;
    focusColor: string;
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
    // Button variants
    button: {
      default: ElementConfig;
      secondary: ElementConfig;
      accent: ElementConfig;
      outline: ElementConfig;
      gradient: ElementConfig;
      destructive: ElementConfig;
      ghost: ElementConfig;
    };
    
    // Layout elements
    page_background: ElementConfig;
    container: ElementConfig;
    section: ElementConfig;
    sidebar: ElementConfig;
    breadcrumb: ElementConfig;
    
    // Form elements
    input: ElementConfig;
    textarea: ElementConfig;
    select: ElementConfig;
    checkbox: ElementConfig;
    radio: ElementConfig;
    switch: ElementConfig;
    slider: ElementConfig;
    
    // Content elements
    card: ElementConfig;
    badge: ElementConfig;
    avatar: ElementConfig;
    separator: ElementConfig;
    accordion: ElementConfig;
    tabs: ElementConfig;
    tooltip: ElementConfig;
    
    // Interactive elements
    link: ElementConfig;
    hover_overlay: ElementConfig;
    focus_ring: ElementConfig;
    
    // Navigation elements
    navigation: ElementConfig;
    navbar: ElementConfig;
    footer: ElementConfig;
    global_header: ElementConfig;
    
    // Dropdown elements
    dropdown: ElementConfig;
    dropdown_item: ElementConfig;
    
    // Modal elements
    modal: ElementConfig;
    modal_header: ElementConfig;
    modal_footer: ElementConfig;
    
    // Feedback elements
    alert: ElementConfig;
    notification: ElementConfig;
    loading: ElementConfig;
    skeleton: ElementConfig;
    
    // Ranking card elements
    ranking_card: ElementConfig;
    ranking_card_category_badge: ElementConfig;
    ranking_card_title: ElementConfig;
    ranking_card_description: ElementConfig;
    ranking_card_stats: ElementConfig;
    ranking_card_cta: ElementConfig;
    ranking_card_avatar_border: ElementConfig;
    
    // Table elements
    table: ElementConfig;
    table_header: ElementConfig;
    table_row: ElementConfig;
    table_cell: ElementConfig;
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
    // Core theme colors (HSL format) - Gold/Orange palette
    primary: '37 82% 49%',        // #e59517
    primaryLight: '44 95% 57%',   // #fac42b
    primaryDark: '34 88% 40%',    // #c1740c
    secondary: '345 75% 25%',
    secondaryLight: '345 81% 33%',
    secondaryDark: '345 73% 18%',
    accent: '82 57% 35%',
    accentLight: '82 57% 40%',
    accentDark: '82 50% 30%',
    
    // Background colors
    background: '0 0% 5%',
    backgroundLight: '0 0% 10%',
    backgroundDark: '0 0% 0%',
    surface: '0 0% 17%',
    
    // Text colors
    text: '36 14% 91%',
    textLight: '0 0% 100%',
    textMuted: '0 0% 75%',
    textInverted: '0 0% 5%',
    
    // Border
    border: '37 82% 49%',
    
    // Status colors
    success: '142 71% 45%',
    successLight: '142 69% 58%',
    successDark: '142 76% 36%',
    warning: '38 92% 50%',
    warningLight: '43 96% 56%',
    warningDark: '32 95% 44%',
    error: '0 84% 60%',
    errorLight: '0 77% 70%',
    errorDark: '0 84% 51%',
    info: '221 83% 53%',
    infoLight: '213 93% 68%',
    infoDark: '224 76% 48%',
    
    // Neutral colors
    neutral: '220 14% 46%',
    neutralLight: '220 13% 69%',
    neutralDark: '220 13% 26%',
    
    // Absolute colors
    white: '0 0% 100%',
    black: '0 0% 0%',
    
    // Gray palette
    gray: '220 14% 46%',
    grayLight: '214 32% 91%',
    grayMid: '220 13% 69%',
    grayDark: '220 13% 18%',

    // Achievement rarity colors
    rarityCommon: '220 13% 69%',      // Gray
    rarityUncommon: '142 71% 45%',    // Green
    rarityRare: '221 83% 53%',        // Blue  
    rarityEpic: '262 83% 58%',        // Purple
    rarityLegendary: '38 92% 50%',    // Orange/Gold
    rarityMythic: '0 84% 60%',        // Red

    // Interactive state colors
    hoverBg: '37 82% 49%',
    hoverColor: '0 0% 100%',
    activeBg: '34 88% 40%',
    activeColor: '0 0% 100%',
    focusBg: '44 95% 57%',
    focusColor: '0 0% 0%',
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
    },
    {
      id: 'success-gradient',
      name: 'Success Gradient',
      type: 'linear',
      direction: 135,
      stops: [
        { color: '#22C55E', position: 0 },
        { color: '#16A34A', position: 100 }
      ]
    },
    {
      id: 'warning-gradient',
      name: 'Warning Gradient',
      type: 'linear',
      direction: 135,
      stops: [
        { color: '#F59E0B', position: 0 },
        { color: '#D97706', position: 100 }
      ]
    },
    {
      id: 'error-gradient',
      name: 'Error Gradient',
      type: 'linear',
      direction: 135,
      stops: [
        { color: '#EF4444', position: 0 },
        { color: '#DC2626', position: 100 }
      ]
    },
    {
      id: 'neutral-gradient',
      name: 'Neutral Gradient',
      type: 'linear',
      direction: 135,
      stops: [
        { color: '#6B7280', position: 0 },
        { color: '#4B5563', position: 100 }
      ]
    },
    {
      id: 'dark-gradient',
      name: 'Dark Gradient',
      type: 'linear',
      direction: 135,
      stops: [
        { color: '#0D0D0D', position: 0 },
        { color: '#1A1A1A', position: 100 }
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
      },
      destructive: {
        background: '#DC2626',
        color: '#FFFFFF',
        hoverBackground: '#B91C1C',
        border: { width: '0px', style: 'solid', color: 'transparent', radius: '8px' },
        typography: { fontSize: '0.875rem', fontWeight: '600', lineHeight: '1.5' },
        padding: '0.5rem 1rem'
      },
      ghost: {
        background: 'transparent',
        color: '#E8E6E3',
        hoverBackground: '#2B2B2B',
        border: { width: '0px', style: 'solid', color: 'transparent', radius: '8px' },
        typography: { fontSize: '0.875rem', fontWeight: '500', lineHeight: '1.5' },
        padding: '0.5rem 1rem'
      }
    },
    
    // Layout elements
    page_background: {
      background: 'linear-gradient(135deg, #0D0D0D, #1A1A1A, #0D0D0D)',
      color: '#E8E6E3'
    },
    container: {
      background: 'transparent',
      color: '#E8E6E3',
      padding: '0 1rem'
    },
    section: {
      background: 'transparent',
      color: '#E8E6E3',
      padding: '2rem 0'
    },
    sidebar: {
      background: '#1A1A1A',
      color: '#E8E6E3',
      border: { width: '1px', style: 'solid', color: '#D4AF37', radius: '0px' },
      padding: '1rem'
    },
    breadcrumb: {
      background: 'transparent',
      color: '#BFBFBF',
      typography: { fontSize: '0.875rem', fontWeight: '400', lineHeight: '1.25' },
      padding: '0.5rem 0'
    },
    
    // Form elements
    textarea: {
      background: '#2B2B2B',
      color: '#E8E6E3',
      border: { width: '1px', style: 'solid', color: '#D4AF37', radius: '8px' },
      padding: '0.75rem 1rem'
    },
    checkbox: {
      background: '#2B2B2B',
      color: '#D4AF37',
      border: { width: '2px', style: 'solid', color: '#D4AF37', radius: '4px' }
    },
    radio: {
      background: '#2B2B2B',
      color: '#D4AF37',
      border: { width: '2px', style: 'solid', color: '#D4AF37', radius: '50%' }
    },
    switch: {
      background: '#2B2B2B',
      color: '#D4AF37',
      border: { width: '2px', style: 'solid', color: '#D4AF37', radius: '12px' }
    },
    slider: {
      background: '#2B2B2B',
      color: '#D4AF37',
      border: { width: '0px', style: 'solid', color: 'transparent', radius: '8px' }
    },
    
    // Content elements
    badge: {
      background: '#D4AF37',
      color: '#0D0D0D',
      border: { width: '0px', style: 'solid', color: 'transparent', radius: '999px' },
      typography: { fontSize: '0.75rem', fontWeight: '600', lineHeight: '1' },
      padding: '0.25rem 0.75rem'
    },
    avatar: {
      background: '#2B2B2B',
      color: '#E8E6E3',
      border: { width: '2px', style: 'solid', color: '#D4AF37', radius: '50%' }
    },
    separator: {
      background: '#D4AF37',
      color: 'transparent',
      border: { width: '0px', style: 'solid', color: 'transparent', radius: '0px' }
    },
    accordion: {
      background: '#2B2B2B',
      color: '#E8E6E3',
      border: { width: '1px', style: 'solid', color: '#D4AF37', radius: '8px' },
      padding: '1rem'
    },
    tabs: {
      background: '#1A1A1A',
      color: '#E8E6E3',
      border: { width: '1px', style: 'solid', color: '#D4AF37', radius: '8px' }
    },
    tooltip: {
      background: '#0D0D0D',
      color: '#E8E6E3',
      border: { width: '1px', style: 'solid', color: '#D4AF37', radius: '6px' },
      typography: { fontSize: '0.75rem', fontWeight: '500', lineHeight: '1.25' },
      padding: '0.5rem 0.75rem',
      shadow: '0 4px 6px rgba(212, 175, 55, 0.2)'
    },
    
    // Interactive elements
    link: {
      background: 'transparent',
      color: '#D4AF37',
      hoverColor: '#E8C547',
      typography: { fontSize: '1rem', fontWeight: '500', lineHeight: '1.5' }
    },
    hover_overlay: {
      background: 'rgba(212, 175, 55, 0.1)',
      color: 'transparent'
    },
    focus_ring: {
      background: 'transparent',
      color: '#D4AF37',
      border: { width: '2px', style: 'solid', color: '#D4AF37', radius: '8px' }
    },
    
    // Navigation elements
    navbar: {
      background: '#1A1A1A',
      color: '#E8E6E3',
      border: { width: '1px', style: 'solid', color: '#D4AF37', radius: '0px' },
      padding: '1rem 2rem'
    },
    
    // Modal elements
    modal_header: {
      background: '#1A1A1A',
      color: '#E8E6E3',
      border: { width: '0px', style: 'solid', color: 'transparent', radius: '0px' },
      padding: '1.5rem'
    },
    modal_footer: {
      background: '#1A1A1A',
      color: '#E8E6E3',
      border: { width: '1px', style: 'solid', color: '#D4AF37', radius: '0px' },
      padding: '1rem 1.5rem'
    },
    
    // Feedback elements
    alert: {
      background: '#2B2B2B',
      color: '#E8E6E3',
      border: { width: '1px', style: 'solid', color: '#D4AF37', radius: '8px' },
      padding: '1rem'
    },
    notification: {
      background: '#0D0D0D',
      color: '#E8E6E3',
      border: { width: '1px', style: 'solid', color: '#D4AF37', radius: '8px' },
      padding: '1rem',
      shadow: '0 10px 15px rgba(212, 175, 55, 0.3)'
    },
    loading: {
      background: 'transparent',
      color: '#D4AF37'
    },
    skeleton: {
      background: '#2B2B2B',
      color: 'transparent',
      border: { width: '0px', style: 'solid', color: 'transparent', radius: '4px' }
    },
    
    // Ranking card elements
    ranking_card: {
      background: '#1A1A1A',
      color: '#E8E6E3',
      border: { width: '1px', style: 'solid', color: '#D4AF37', radius: '12px' },
      shadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
      hoverShadow: '0 10px 25px rgba(212, 175, 55, 0.2)',
      padding: '0',
      overlay: 'linear-gradient(to top, rgba(0, 0, 0, 0.95), rgba(0, 0, 0, 0.8), transparent)',
      hoverOverlay: 'rgba(212, 175, 55, 0.05)'
    },
    ranking_card_category_badge: {
      background: 'rgba(212, 175, 55, 0.2)',
      color: '#D4AF37',
      border: { width: '1px', style: 'solid', color: 'rgba(212, 175, 55, 0.3)', radius: '999px' },
      typography: { fontSize: '0.75rem', fontWeight: '600', lineHeight: '1' },
      padding: '0.5rem 0.75rem'
    },
    ranking_card_title: {
      background: 'transparent',
      color: '#FFFFFF',
      hoverColor: '#D4AF37',
      typography: { fontSize: '1.875rem', fontWeight: '700', lineHeight: '1.2' },
      shadow: '2px 2px 8px rgba(0, 0, 0, 0.8)'
    },
    ranking_card_description: {
      background: 'transparent',
      color: '#BFBFBF',
      typography: { fontSize: '0.875rem', fontWeight: '400', lineHeight: '1.5' },
      shadow: '1px 1px 4px rgba(0, 0, 0, 0.8)'
    },
    ranking_card_stats: {
      background: 'transparent',
      color: '#BFBFBF',
      typography: { fontSize: '0.75rem', fontWeight: '400', lineHeight: '1.25' }
    },
    ranking_card_cta: {
      background: 'transparent',
      color: '#D4AF37',
      hoverColor: '#E8C547',
      typography: { fontSize: '0.75rem', fontWeight: '500', lineHeight: '1.25' }
    },
    ranking_card_avatar_border: {
      background: 'transparent',
      color: 'transparent',
      border: { width: '3px', style: 'solid', color: '#000000', radius: '0px' }
    },

    // Table elements
    table: {
      background: '#2B2B2B',
      color: '#E8E6E3',
      border: { width: '1px', style: 'solid', color: '#D4AF37', radius: '8px' }
    },
    table_header: {
      background: '#1A1A1A',
      color: '#D4AF37',
      border: { width: '1px', style: 'solid', color: '#D4AF37', radius: '0px' },
      typography: { fontSize: '0.875rem', fontWeight: '600', lineHeight: '1.25' },
      padding: '0.75rem 1rem'
    },
    table_row: {
      background: 'transparent',
      color: '#E8E6E3',
      hoverBackground: '#333333',
      border: { width: '1px', style: 'solid', color: '#D4AF37', radius: '0px' },
      padding: '0.75rem 1rem'
    },
    table_cell: {
      background: 'transparent',
      color: '#E8E6E3',
      typography: { fontSize: '0.875rem', fontWeight: '400', lineHeight: '1.25' },
      padding: '0.75rem 1rem'
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
    select: {
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
    },
    dropdown: {
      background: '#2B2B2B',
      color: '#E8E6E3',
      border: { width: '1px', style: 'solid', color: '#D4AF37', radius: '8px' },
      padding: '0.5rem 0',
      shadow: '0 10px 15px rgba(212, 175, 55, 0.2)'
    },
    dropdown_item: {
      background: 'transparent',
      color: '#E8E6E3',
      hoverBackground: '#FFFFFF',
      hoverColor: '#0D0D0D',
      typography: { fontSize: '0.875rem', fontWeight: '500', lineHeight: '1.25' },
      padding: '0.625rem 0.75rem'
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

// Storage and initialization
export const ENHANCED_THEME_STORAGE_KEY = 'spit-hierarchy-enhanced-theme';

// Get current enhanced theme from localStorage or default
export const getCurrentEnhancedTheme = (): EnhancedThemeConfig => {
  if (typeof window === 'undefined') return defaultEnhancedTheme;
  
  try {
    const stored = localStorage.getItem(ENHANCED_THEME_STORAGE_KEY);
    if (stored) {
      return { ...defaultEnhancedTheme, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('Error loading enhanced theme from storage:', error);
  }
  
  return defaultEnhancedTheme;
};

// Save enhanced theme to localStorage
export const saveEnhancedTheme = (theme: Partial<EnhancedThemeConfig>): void => {
  try {
    const currentTheme = getCurrentEnhancedTheme();
    const newTheme = { ...currentTheme, ...theme };
    localStorage.setItem(ENHANCED_THEME_STORAGE_KEY, JSON.stringify(newTheme));
  } catch (error) {
    console.error('Error saving enhanced theme to storage:', error);
  }
};

// Apply enhanced theme to DOM (includes ALL basic theme variables)
export const applyEnhancedThemeToDOM = (theme: EnhancedThemeConfig): void => {
  if (typeof document === 'undefined') return;
  
  console.log('Applying enhanced theme to DOM:', theme);
  const root = document.documentElement;
  
  // First, apply all basic theme variables to ensure compatibility
  // This ensures components using --theme-* variables always work
  Object.entries(theme.colors).forEach(([key, value]) => {
    const hslValue = value.startsWith('#') ? hexToHsl(value) : value;
    root.style.setProperty(`--theme-${key}`, hslValue);
    
    // Also set standard shadcn variables to ensure UI components use theme colors
    if (key === 'primary') {
      root.style.setProperty('--primary', hslValue);
    }
    if (key === 'background') {
      root.style.setProperty('--background', hslValue);
    }
    if (key === 'surface') {
      root.style.setProperty('--muted', hslValue);
      // Override popover background with surface color for dropdowns
      root.style.setProperty('--popover', hslValue);
    }
    if (key === 'text') {
      root.style.setProperty('--foreground', hslValue);
      root.style.setProperty('--muted-foreground', hslValue);
      // Override popover foreground with text color for dropdowns
      root.style.setProperty('--popover-foreground', hslValue);
    }
  });
  
  // Apply enhanced theme-specific variables
  // Fonts (basic compatibility)
  Object.entries(theme.fonts).forEach(([key, value]) => {
    root.style.setProperty(`--theme-font-${key}`, value);
    root.style.setProperty(`--enhanced-font-${key}`, value);
  });
  
  // Typography configurations with debugging
  Object.entries(theme.typography).forEach(([key, config]) => {
    Object.entries(config).forEach(([property, value]) => {
      if (value) {
        const cssVar = `--theme-typography-${key}-${property}`;
        root.style.setProperty(cssVar, String(value));
        console.log(`Applied typography: ${cssVar} = ${value}`);
      }
    });
  });
  
  // Gradients
  theme.gradients.forEach(gradient => {
    root.style.setProperty(`--theme-gradient-${gradient.id}`, gradientToCSS(gradient));
  });
  
  // Apply element styles recursively with debugging
  const applyElementStyles = (obj: any, prefix: string) => {
    Object.entries(obj).forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // Recursively handle nested objects
        applyElementStyles(value, `${prefix}-${key}`);
      } else if (value !== null && value !== undefined) {
        const cssVar = `${prefix}-${key}`;
        root.style.setProperty(cssVar, String(value));
        console.log(`Applied element CSS: ${cssVar} = ${value}`);
      }
    });
  };

  // Apply element styles
  Object.entries(theme.elements).forEach(([elementKey, elementConfig]) => {
    if (typeof elementConfig === 'object' && elementConfig !== null) {
      if ('default' in elementConfig) {
        // Button-style element with variants
        Object.entries(elementConfig).forEach(([variant, config]) => {
          if (typeof config === 'object' && config !== null) {
            applyElementStyles(config, `--theme-element-${elementKey}-${variant}`);
          }
        });
      } else {
        // Single element config
        applyElementStyles(elementConfig, `--theme-element-${elementKey}`);
      }
    }
  });
  
  // Spacing (basic compatibility)
  Object.entries(theme.spacing).forEach(([key, value]) => {
    root.style.setProperty(`--theme-spacing-${key}`, value);
    root.style.setProperty(`--enhanced-spacing-${key}`, value);
  });
  
  // Border radius (basic compatibility)
  Object.entries(theme.borderRadius).forEach(([key, value]) => {
    root.style.setProperty(`--theme-radius-${key}`, value);
    root.style.setProperty(`--enhanced-radius-${key}`, value);
  });
  
  // Shadows (basic compatibility)
  Object.entries(theme.shadows).forEach(([key, value]) => {
    root.style.setProperty(`--theme-shadow-${key}`, value);
    root.style.setProperty(`--enhanced-shadow-${key}`, value);
  });
};

// Helper function to resolve theme color references
const resolveThemeColor = (colorValue: string, theme: EnhancedThemeConfig): string => {
  // Check if the color value is a theme color key
  if (theme.colors.hasOwnProperty(colorValue)) {
    return (theme.colors as any)[colorValue];
  }
  // Return the original value if it's not a theme color reference
  return colorValue;
};

// Helper function to apply custom element properties
const applyElementConfig = (root: HTMLElement, elementName: string, config: ElementConfig, theme: EnhancedThemeConfig) => {
  if (config.background) {
    const resolvedColor = resolveThemeColor(config.background, theme);
    const bgValue = resolvedColor.startsWith('#') ? hexToHsl(resolvedColor) : resolvedColor;
    root.style.setProperty(`--theme-element-${elementName}-bg`, bgValue);
  }
  
  if (config.color) {
    const resolvedColor = resolveThemeColor(config.color, theme);
    const colorValue = resolvedColor.startsWith('#') ? hexToHsl(resolvedColor) : resolvedColor;
    root.style.setProperty(`--theme-element-${elementName}-color`, colorValue);
  }
  
  if (config.hoverBackground) {
    const resolvedColor = resolveThemeColor(config.hoverBackground, theme);
    const hoverBgValue = resolvedColor.startsWith('#') ? hexToHsl(resolvedColor) : resolvedColor;
    root.style.setProperty(`--theme-element-${elementName}-hover-bg`, hoverBgValue);
  }
  
  if (config.hoverColor) {
    const resolvedColor = resolveThemeColor(config.hoverColor, theme);
    const hoverColorValue = resolvedColor.startsWith('#') ? hexToHsl(resolvedColor) : resolvedColor;
    root.style.setProperty(`--theme-element-${elementName}-hover-color`, hoverColorValue);
  }
  
  if (config.gradient) {
    const gradient = theme.gradients.find(g => g.id === config.gradient);
    if (gradient) {
      root.style.setProperty(`--theme-element-${elementName}-bg`, gradientToCSS(gradient));
    }
  }
  
  if (config.border) {
    const resolvedColor = resolveThemeColor(config.border.color, theme);
    const borderColor = resolvedColor.startsWith('#') ? hexToHsl(resolvedColor) : resolvedColor;
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
  
  // Handle special ranking card properties
  if (elementName === 'ranking_card') {
    const rankingConfig = config as any;
    if (rankingConfig.hoverShadow) {
      root.style.setProperty(`--theme-element-${elementName}-hover-shadow`, rankingConfig.hoverShadow);
    }
    if (rankingConfig.overlay) {
      root.style.setProperty(`--theme-element-${elementName}-overlay`, rankingConfig.overlay);
    }
    if (rankingConfig.hoverOverlay) {
      root.style.setProperty(`--theme-element-${elementName}-hover-overlay`, rankingConfig.hoverOverlay);
    }
  }
  
  if (config.padding) {
    root.style.setProperty(`--theme-element-${elementName}-padding`, config.padding);
  }
  
  if (config.margin) {
    root.style.setProperty(`--theme-element-${elementName}-margin`, config.margin);
  }
};