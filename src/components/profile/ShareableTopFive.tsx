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

// Match the site's active theme fonts (see src/config/enhancedTheme.ts).
// html2canvas rasterises with whatever font-family the DOM resolves, so we
// reference the same CSS variables the rest of the app uses and fall back to
// the concrete family names so exports stay on-brand even before web fonts
// finish hydrating.
const HEADING_FONT = "var(--theme-font-heading), 'Mogra', cursive";
const BODY_FONT = "var(--theme-font-body), 'Merienda', serif";

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

  const renderMosaicCell = (
    slot: typeof slots[0],
    corners: { tl?: boolean; tr?: boolean; bl?: boolean; br?: boolean } = {}
  ) => {
    const borderRadius = [
      corners.tl ? 8 : 0,
      corners.tr ? 8 : 0,
      corners.br ? 8 : 0,
      corners.bl ? 8 : 0,
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
        {/* Image — use <img crossOrigin> so html2canvas can rasterise it
            without tainting the canvas (background-image ignores crossOrigin). */}
        {slot.rapper?.image_url ? (
          <img
            src={slot.rapper.image_url}
            alt={slot.rapper.name}
            crossOrigin="anonymous"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: isLandscape ? 'center 20%' : 'center center',
              display: 'block',
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
          padding: `${badgeSize * 1.2}px ${badgeSize * 0.5}px ${badgeSize * 0.5}px`,
          background: 'linear-gradient(to top, #000000E6 0%, #00000080 60%, #00000000 100%)',
          display: 'flex',
          alignItems: 'center',
          gap: badgeSize * 0.4,
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
            lineHeight: 1,
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
            lineHeight: 1.1,
            textTransform: 'uppercase' as const,
            letterSpacing: '0.01em',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap' as const,
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
          lineHeight: 1,
        }}>
          {username}'s Top 5
        </h1>
      </div>

      {/* Mosaic Grid */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: isLandscape ? 'row' : 'column',
        gap: cellGap,
        padding: `0 ${cellGap}px`,
        minHeight: 0,
      }}>
        {isLandscape ? (
          <>
            {/* Left: #1 featured, full-height portrait cell */}
            <div style={{ flex: 1.1, display: 'flex', minWidth: 0 }}>
              {slots[0] && renderMosaicCell(slots[0], { tl: true, bl: true })}
            </div>
            {/* Right: #2-5 in a 2x2 grid */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: cellGap, minWidth: 0 }}>
              <div style={{ flex: 1, display: 'flex', gap: cellGap, minHeight: 0 }}>
                {slots[1] && renderMosaicCell(slots[1], { tr: false })}
                {slots[2] && renderMosaicCell(slots[2], { tr: true })}
              </div>
              <div style={{ flex: 1, display: 'flex', gap: cellGap, minHeight: 0 }}>
                {slots[3] && renderMosaicCell(slots[3])}
                {slots[4] && renderMosaicCell(slots[4], { br: true })}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Row 1: #1 featured */}
            <div style={{ flex: 2, display: 'flex', minHeight: 0 }}>
              {slots[0] && renderMosaicCell(slots[0], { tl: true, tr: true })}
            </div>
            {/* Row 2: #2 and #3 */}
            <div style={{ flex: 1.5, display: 'flex', gap: cellGap, minHeight: 0 }}>
              {slots[1] && renderMosaicCell(slots[1])}
              {slots[2] && renderMosaicCell(slots[2])}
            </div>
            {/* Row 3: #4 and #5 */}
            <div style={{ flex: 1.5, display: 'flex', gap: cellGap, minHeight: 0 }}>
              {slots[3] && renderMosaicCell(slots[3], { bl: true })}
              {slots[4] && renderMosaicCell(slots[4], { br: true })}
            </div>
          </>
        )}
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
