import React from "react";

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

const HEADING_FONT = "sans-serif";
const BODY_FONT = "sans-serif";

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
  const nameFont = isLandscape ? 22 : isPortrait ? 36 : 28;
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
          background: '#141414',
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
              backgroundPosition: isLandscape ? 'center 35%' : 'center center',
              backgroundRepeat: 'no-repeat',
            }}
          />
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            background: '#1f1f1f',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <span style={{ color: '#666666', fontSize: nameFont * 1.5 }}>—</span>
          </div>
        )}

        {/* Bottom gradient overlay with name */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: `${badgeSize * 1.2}px ${badgeSize * 0.5}px ${badgeSize * 1.5}px`,
          background: 'linear-gradient(to top, #000000CC 0%, #00000066 60%, #00000000 100%)',
          display: 'flex',
          alignItems: 'flex-end',
          gap: badgeSize * 0.4,
          overflow: 'visible',
        }}>
          {/* Position badge */}
          <div style={{
            width: badgeSize,
            height: badgeSize,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #D4A520, #B8860B)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#000000',
            fontWeight: 'bold',
            fontSize: badgeFont,
            fontFamily: HEADING_FONT,
            flexShrink: 0,
          }}>
            {slot.position}
          </div>

          {/* Name */}
          <p style={{
            color: '#ffffff',
            fontSize: nameFont,
            fontWeight: 'bold',
            fontFamily: HEADING_FONT,
            margin: 0,
            lineHeight: 1.18,
            textTransform: 'uppercase' as const,
            letterSpacing: '0.01em',
            overflow: 'visible',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap' as const,
            display: 'block',
            paddingTop: badgeSize * 0.04,
            paddingBottom: badgeSize * 0.14,
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
        background: '#0d0d0d',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: BODY_FONT,
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
        background: '#0d0d0d',
        flexShrink: 0,
      }}>
        <img
          src="/lovable-uploads/logo-header.png"
          alt="Spit Hierarchy"
          style={{ height: logoSize }}
          crossOrigin="anonymous"
        />
        <h1 style={{
          color: '#D4A520',
          fontSize: headerFont,
          fontWeight: 'bold',
          fontFamily: HEADING_FONT,
          margin: 0,
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
        background: '#0d0d0d',
        flexShrink: 0,
      }}>
        <p style={{
          color: '#D4A52099',
          fontSize: footerFont,
          fontFamily: BODY_FONT,
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
