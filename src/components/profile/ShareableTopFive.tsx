import React from "react";
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
  const cellGap = 4;
  const headerH = isLandscape ? 60 : isPortrait ? 140 : 100;
  const footerH = isLandscape ? 35 : isPortrait ? 70 : 50;
  const badgeSize = isLandscape ? 28 : isPortrait ? 48 : 38;
  const badgeFont = isLandscape ? 14 : isPortrait ? 22 : 18;
  const nameFont = isLandscape ? 16 : isPortrait ? 28 : 22;
  const logoSize = isLandscape ? 36 : isPortrait ? 70 : 55;
  const headerFont = isLandscape ? 26 : isPortrait ? 48 : 36;
  const footerFont = isLandscape ? 14 : isPortrait ? 22 : 18;

  const renderMosaicCell = (slot: typeof slots[0], isTopLeft = false, isTopRight = false, isBottomLeft = false, isBottomRight = false, isFullWidth = false) => {
    const borderRadius = [
      isTopLeft || (isFullWidth && true) ? 8 : 0,
      isTopRight || (isFullWidth && true) ? 8 : 0,
      isBottomRight ? 8 : 0,
      isBottomLeft ? 8 : 0,
    ].map(r => `${r}px`).join(' ');

    return (
      <div
        key={slot.position}
        style={{
          position: 'relative',
          flex: 1,
          overflow: 'hidden',
          borderRadius,
          background: 'hsl(0 0% 8%)',
        }}
      >
        {/* Image */}
        {slot.rapper?.image_url ? (
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundImage: `url(${slot.rapper.image_url})`,
              backgroundSize: 'cover',
              backgroundPosition: isLandscape ? 'center center' : 'center top',
              backgroundRepeat: 'no-repeat',
            }}
          />
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            background: 'hsl(0 0% 12%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <span style={{ color: 'hsl(0 0% 40%)', fontSize: nameFont * 1.5 }}>—</span>
          </div>
        )}

        {/* Top gradient overlay with name */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          padding: `${badgeSize * 0.6}px ${badgeSize * 0.5}px ${badgeSize * 1.2}px`,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: badgeSize * 0.4,
        }}>
          {/* Position badge */}
          <div style={{
            width: badgeSize,
            height: badgeSize,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, hsl(45 85% 55%), hsl(45 85% 45%))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'hsl(0 0% 0%)',
            fontWeight: 800,
            fontSize: badgeFont,
            flexShrink: 0,
          }}>
            {slot.position}
          </div>

          {/* Name */}
          <p style={{
            color: '#fff',
            fontSize: nameFont,
            fontWeight: 700,
            margin: 0,
            lineHeight: 1.2,
            textTransform: 'uppercase',
            letterSpacing: '0.02em',
            textShadow: '0 2px 8px rgba(0,0,0,0.5)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            paddingTop: (badgeSize - nameFont) / 2,
            flex: 1,
            minWidth: 0,
          }}>
            {slot.rapper?.name || 'Empty'}
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
        background: 'hsl(0 0% 5%)',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div style={{
        height: headerH,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: headerFont * 0.4,
        padding: '0 20px',
        background: 'hsl(0 0% 5%)',
        flexShrink: 0,
      }}>
        <img
          src="/lovable-uploads/logo-header.png"
          alt="Spit Hierarchy"
          style={{ height: logoSize }}
          crossOrigin="anonymous"
        />
        <h1 style={{
          color: 'hsl(45 85% 55%)',
          fontSize: headerFont,
          fontWeight: 800,
          margin: 0,
          letterSpacing: '-0.02em',
        }}>
          {username}'s Top 5
        </h1>
      </div>

      {/* Mosaic Grid */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: cellGap,
        padding: `0 ${cellGap}px`,
        minHeight: 0,
      }}>
        {/* Row 1: #1 featured */}
        <div style={{ flex: isLandscape ? 1.8 : 2, display: 'flex', minHeight: 0 }}>
          {slots[0] && renderMosaicCell(slots[0], true, true, false, false, true)}
        </div>

        {/* Row 2: #2 and #3 */}
        <div style={{ flex: isLandscape ? 1.2 : 1.5, display: 'flex', gap: cellGap, minHeight: 0 }}>
          {slots[1] && renderMosaicCell(slots[1], false, false, false, false)}
          {slots[2] && renderMosaicCell(slots[2], false, false, false, false)}
        </div>

        {/* Row 3: #4 and #5 */}
        <div style={{ flex: isLandscape ? 1.2 : 1.5, display: 'flex', gap: cellGap, minHeight: 0 }}>
          {slots[3] && renderMosaicCell(slots[3], false, false, true, false)}
          {slots[4] && renderMosaicCell(slots[4], false, false, false, true)}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        height: footerH,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'hsl(0 0% 5%)',
        flexShrink: 0,
      }}>
        <p style={{
          color: 'hsl(45 85% 55% / 0.6)',
          fontSize: footerFont,
          margin: 0,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}>
          spithierarchy.com
        </p>
      </div>
    </div>
  );
};

export default ShareableTopFive;
