// Era and genre-aware album placeholder utility for safe copyright compliance
const PLACEHOLDER_BASE_URL = "https://xzcmkssadekswmiqfbff.supabase.co/storage/v1/object/public/rapper-images";

interface AlbumContext {
  releaseYear?: number;
  genre?: string;
  releaseType?: 'album' | 'mixtape' | 'ep' | 'single';
  title?: string;
}

// Era-specific styling themes
export const ERA_STYLES = {
  '90s': {
    bgColor: 'hsl(var(--rap-gold))',
    textColor: 'hsl(var(--rap-carbon))',
    pattern: 'vinyl',
    iconStyle: 'classic'
  },
  '2000s': {
    bgColor: 'hsl(var(--rap-burgundy))',
    textColor: 'hsl(var(--rap-platinum))',
    pattern: 'cd',
    iconStyle: 'modern'
  },
  '2010s': {
    bgColor: 'hsl(var(--primary))',
    textColor: 'hsl(var(--primary-foreground))',
    pattern: 'digital',
    iconStyle: 'digital'
  },
  '2020s': {
    bgColor: 'hsl(var(--accent))',
    textColor: 'hsl(var(--accent-foreground))',
    pattern: 'streaming',
    iconStyle: 'streaming'
  }
};

// Genre-specific color palettes
export const GENRE_COLORS = {
  trap: { primary: 'hsl(var(--rap-burgundy))', secondary: 'hsl(var(--rap-gold))' },
  'boom-bap': { primary: 'hsl(var(--rap-gold))', secondary: 'hsl(var(--rap-carbon))' },
  conscious: { primary: 'hsl(var(--primary))', secondary: 'hsl(var(--muted))' },
  drill: { primary: 'hsl(var(--destructive))', secondary: 'hsl(var(--destructive-foreground))' },
  melodic: { primary: 'hsl(var(--accent))', secondary: 'hsl(var(--accent-foreground))' },
  default: { primary: 'hsl(var(--rap-carbon))', secondary: 'hsl(var(--rap-smoke))' }
};

// Release type specific icons
export const RELEASE_TYPE_ICONS = {
  album: 'disc-3',
  mixtape: 'music',
  ep: 'disc',
  single: 'play-circle'
};

// Smart placeholder generator based on context
export const getSmartAlbumPlaceholder = (context: AlbumContext = {}): {
  style: any;
  icon: string;
  format: string;
  era: string;
} => {
  const { releaseYear, genre, releaseType = 'album' } = context;
  
  // Determine era
  let era = '2020s';
  if (releaseYear) {
    if (releaseYear < 2000) era = '90s';
    else if (releaseYear < 2010) era = '2000s';
    else if (releaseYear < 2020) era = '2010s';
  }
  
  const eraStyle = ERA_STYLES[era as keyof typeof ERA_STYLES];
  const genreColors = GENRE_COLORS[genre as keyof typeof GENRE_COLORS] || GENRE_COLORS.default;
  const icon = RELEASE_TYPE_ICONS[releaseType];
  
  return {
    style: {
      ...eraStyle,
      ...genreColors,
    },
    icon,
    format: eraStyle.pattern,
    era
  };
};

// Generate external links for album/mixtape
export const generateExternalAlbumLinks = (
  albumTitle: string, 
  artistName: string, 
  releaseType: 'album' | 'mixtape' | 'ep' | 'single' = 'album'
): {
  spotify?: string;
  appleMusic?: string;
  musicbrainz?: string;
  genius?: string;
} => {
  const encodedAlbum = encodeURIComponent(albumTitle);
  const encodedArtist = encodeURIComponent(artistName);
  
  // For Apple Music, encode the combined search term as one unit
  const appleSearchTerm = encodeURIComponent(`${artistName} ${albumTitle}`);
  
  const baseLinks = {
    genius: `https://genius.com/search?q=${encodedArtist}%20${encodedAlbum}`,
    musicbrainz: `https://musicbrainz.org/search?query=${encodedArtist}%20${encodedAlbum}&type=release`
  };

  // Only include Spotify/Apple Music for albums (not mixtapes)
  if (releaseType === 'album') {
    return {
      ...baseLinks,
      spotify: `https://open.spotify.com/search/${encodedArtist}%20${encodedAlbum}/albums`,
      appleMusic: `https://music.apple.com/us/search?term=${appleSearchTerm}`,
    };
  }

  return baseLinks;
};

// Extract primary color palette from release info
export const extractAlbumColorPalette = (context: AlbumContext): {
  primary: string;
  secondary: string;
  accent: string;
} => {
  const smartPlaceholder = getSmartAlbumPlaceholder(context);
  
  return {
    primary: smartPlaceholder.style.bgColor,
    secondary: smartPlaceholder.style.textColor,
    accent: smartPlaceholder.style.primary || smartPlaceholder.style.bgColor
  };
};

// Get fallback placeholder image with cache busting
export const getFallbackAlbumImage = (size: 'thumb' | 'medium' | 'large' = 'medium'): string => {
  return `${PLACEHOLDER_BASE_URL}/placeholder-${size}.jpg?v=${Math.floor(Date.now() / (1000 * 60 * 10))}`;
};