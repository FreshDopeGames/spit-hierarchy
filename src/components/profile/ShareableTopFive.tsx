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

const fitName = (name: string, max: number) =>
  name.length > max ? `${name.slice(0, max - 1).trimEnd()}…` : name;

// html2canvas ignores object-fit and stretches <img> to its box, so we emulate
// "cover" by measuring the cell + image and sizing/positioning the img manually.
const CoverImage: React.FC<{ src: string; alt: string; focusY: number }> = ({ src, alt, focusY }) => {
  const boxRef = React.useRef<HTMLDivElement>(null);
  const [nat, setNat] = React.useState<{ w: number; h: number } | null>(null);
  const [box, setBox] = React.useState<{ w: number; h: number } | null>(null);

  React.useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const measure = () => setBox({ w: el.offsetWidth, h: el.offsetHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  let imgStyle: React.CSSProperties = { position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', opacity: 0 };
  if (nat && box && box.w && box.h) {
    const s = Math.max(box.w / nat.w, box.h / nat.h) * 1.01;
    const w = nat.w * s;
    const h = nat.h * s;
    imgStyle = {
      position: 'absolute',
      width: w,
      height: h,
      maxWidth: 'none',
      left: (box.w - w) / 2,
      top: (box.h - h) * focusY,
      display: 'block',
    };
  }

  return (
    <div ref={boxRef} style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <img
        src={src}
        alt={alt}
        crossOrigin="anonymous"
        onLoad={(e) => setNat({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
        style={imgStyle}
      />
    </div>
  );
};

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
  const badgeSize = isLandscape ? 34 : isPortrait ? 56 : 44;
  const badgeFont = isLandscape ? 20 : isPortrait ? 32 : 26;
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
          background: '#000000',
        }}
      >
        {slot.rapper?.image_url ? (
          <CoverImage
            src={slot.rapper.image_url}
            alt={slot.rapper.name}
            focusY={isLandscape ? 0.2 : 0.3}
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

        {/* Bottom gradient overlay — extends past the cell edge so no sliver shows */}
        <div style={{
          position: 'absolute',
          bottom: -2,
          left: -2,
          right: -2,
          height: badgeSize * 3.2,
          background: 'linear-gradient(to top, #000000F2 0%, #000000B3 35%, #00000000 100%)',
        }} />

        {/* Badge + name row */}
        <div style={{
          position: 'absolute',
          bottom: badgeSize * 0.45,
          left: badgeSize * 0.5,
          right: badgeSize * 0.5,
          display: 'flex',
          alignItems: 'center',
          gap: badgeSize * 0.4,
        }}>
          <div style={{
            width: badgeSize,
            height: badgeSize,
            borderRadius: '50%',
            background: '#D4A520',
            color: '#000000',
            fontWeight: 'bold',
            fontSize: badgeFont,
            fontFamily: HEADING_FONT,
            lineHeight: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            {slot.position}
          </div>

          <div style={{
            color: '#ffffff',
            fontSize: nameFont,
            fontWeight: 'bold',
            fontFamily: HEADING_FONT,
            lineHeight: 1.4,
            paddingBottom: Math.round(nameFont * 0.12),
            textTransform: 'uppercase' as const,
            letterSpacing: '0.01em',
            whiteSpace: 'nowrap' as const,
            flex: 1,
            minWidth: 0,
            textShadow: '0 2px 6px #000000',
          }}>
            {fitName(slot.rapper?.name || 'Empty', isLandscape ? 16 : 20)}
          </div>
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
          lineHeight: 1.35,
          paddingBottom: 4,
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
