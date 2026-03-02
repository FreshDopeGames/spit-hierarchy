import React from "react";
import { cn } from "@/lib/utils";
import { getOptimizedPlaceholder } from "@/utils/placeholderImageUtils";

interface ShareableTopFiveProps {
  slots: Array<{
    position: number;
    rapper: {
      id: string;
      name: string;
      image_url?: string;
    } | null;
  }>;
  username: string;
  format?: 'square' | 'landscape' | 'portrait';
}

const ShareableTopFive: React.FC<ShareableTopFiveProps> = ({ 
  slots, 
  username, 
  format = 'square' 
}) => {
  const isPortrait = format === 'portrait';
  const isLandscape = format === 'landscape';
  
  const getDimensions = () => {
    if (isPortrait) return { width: 1080, height: 1920 };
    if (isLandscape) return { width: 1200, height: 630 };
    return { width: 1080, height: 1080 };
  };

  const dims = getDimensions();

  // Scale factors for different formats
  const logoSize = isLandscape ? 40 : isPortrait ? 80 : 60;
  const titleSize = isLandscape ? 28 : isPortrait ? 48 : 40;
  const subtitleSize = isLandscape ? 16 : isPortrait ? 24 : 20;
  const badgeSize = isLandscape ? 32 : isPortrait ? 56 : 44;
  const badgeFont = isLandscape ? 16 : isPortrait ? 24 : 20;
  const nameFont = isLandscape ? 14 : isPortrait ? 22 : 18;
  const featuredImgSize = isLandscape ? 110 : isPortrait ? 220 : 180;
  const gridImgSize = isLandscape ? 80 : isPortrait ? 160 : 130;
  const footerFont = isLandscape ? 14 : isPortrait ? 20 : 16;
  const padding = isLandscape ? 24 : isPortrait ? 48 : 40;
  const gap = isLandscape ? 12 : isPortrait ? 20 : 16;
  const featuredNameFont = isLandscape ? 18 : isPortrait ? 28 : 24;

  const renderRapperCard = (slot: typeof slots[0], isFeatured: boolean) => {
    const imgSize = isFeatured ? featuredImgSize : gridImgSize;
    const fontSize = isFeatured ? featuredNameFont : nameFont;
    const badge = badgeSize;

    return (
      <div
        key={slot.position}
        style={{
          background: 'hsl(0 0% 17%)',
          border: isFeatured ? '3px solid hsl(45 85% 55%)' : '2px solid hsl(45 85% 55% / 0.3)',
          borderRadius: 12,
          padding: isFeatured ? padding * 0.6 : padding * 0.4,
          display: 'flex',
          alignItems: 'center',
          gap: gap,
          boxShadow: isFeatured 
            ? '0 8px 32px hsl(45 85% 55% / 0.15)' 
            : '0 4px 16px hsl(0 0% 0% / 0.3)',
          flex: 1,
          minWidth: 0,
          alignSelf: isPortrait ? 'stretch' : undefined,
        }}
      >
        {/* Position Badge */}
        <div
          style={{
            width: badge,
            height: badge,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, hsl(45 85% 55%), hsl(45 85% 45%))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'hsl(0 0% 0%)',
            fontWeight: 800,
            fontSize: badgeFont,
            flexShrink: 0,
          }}
        >
          {slot.position}
        </div>

        {/* Image */}
        {slot.rapper ? (
          <div style={{ flexShrink: 0 }}>
            <img
              src={slot.rapper.image_url || getOptimizedPlaceholder('medium')}
              alt={slot.rapper.name}
              style={{
                width: imgSize,
                height: imgSize,
                borderRadius: 8,
                objectFit: 'cover',
                border: '2px solid hsl(45 85% 55% / 0.2)',
              }}
              crossOrigin="anonymous"
            />
          </div>
        ) : (
          <div
            style={{
              width: imgSize,
              height: imgSize,
              borderRadius: 8,
              background: 'hsl(0 0% 12%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid hsl(45 85% 55% / 0.1)',
              flexShrink: 0,
            }}
          >
            <span style={{ color: 'hsl(0 0% 50%)', fontSize: fontSize * 0.7 }}>—</span>
          </div>
        )}

        {/* Name */}
        <div style={{ minWidth: 0, flex: 1 }}>
          <p
            style={{
              color: slot.rapper ? 'hsl(30 10% 90%)' : 'hsl(0 0% 50%)',
              fontSize,
              fontWeight: 700,
              margin: 0,
              lineHeight: 1.2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: isFeatured ? 'normal' : 'nowrap',
            }}
          >
            {slot.rapper?.name || 'Empty slot'}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        width: dims.width,
        height: dims.height,
        background: 'linear-gradient(160deg, hsl(0 0% 8%) 0%, hsl(0 0% 3%) 50%, hsl(0 0% 5%) 100%)',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at 50% 30%, hsl(45 85% 55% / 0.06) 0%, transparent 60%)',
          pointerEvents: 'none',
        }}
      />

      {/* Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          padding,
          gap: gap * 0.8,
        }}
      >
        {/* Header with Logo */}
        <div style={{ textAlign: 'center', paddingBottom: isLandscape ? 4 : gap * 0.5 }}>
          <img
            src="/lovable-uploads/logo-header.png"
            alt="Spit Hierarchy"
            style={{ height: logoSize, margin: '0 auto', display: 'block' }}
            crossOrigin="anonymous"
          />
          <h1
            style={{
              color: 'hsl(45 85% 55%)',
              fontSize: titleSize,
              fontWeight: 800,
              margin: `${gap * 0.4}px 0 0`,
              letterSpacing: '-0.02em',
            }}
          >
            {username}'s Top 5
          </h1>
          <p
            style={{
              color: 'hsl(0 0% 70%)',
              fontSize: subtitleSize,
              margin: `${gap * 0.2}px 0 0`,
            }}
          >
            My favorite rappers ranked
          </p>
        </div>

        {/* Rappers Grid: 1 + 2 + 2 */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap, justifyContent: 'center' }}>
          {/* #1 Featured - Centered */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center',
            flex: isPortrait ? 1 : undefined,
          }}>
            <div style={{ width: '80%' }}>
              {slots[0] && renderRapperCard(slots[0], true)}
            </div>
          </div>

          {/* #2 and #3 */}
          <div style={{ display: 'flex', gap, flex: isPortrait ? 1 : undefined, alignItems: 'stretch' }}>
            {slots[1] && renderRapperCard(slots[1], false)}
            {slots[2] && renderRapperCard(slots[2], false)}
          </div>

          {/* #4 and #5 */}
          <div style={{ display: 'flex', gap, flex: isPortrait ? 1 : undefined, alignItems: 'stretch' }}>
            {slots[3] && renderRapperCard(slots[3], false)}
            {slots[4] && renderRapperCard(slots[4], false)}
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', paddingTop: isLandscape ? 2 : gap * 0.3 }}>
          <p
            style={{
              color: 'hsl(45 85% 55% / 0.6)',
              fontSize: footerFont,
              margin: 0,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            spithierarchy.com
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShareableTopFive;
