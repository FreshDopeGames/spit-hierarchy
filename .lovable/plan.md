

## Plan: Fix Share Card Output Issues

### Problems from screenshots

1. **Names not rendering**: The name `<p>` tags exist but are likely being clipped or not painted by `html2canvas`. The `textOverflow: 'ellipsis'` + `whiteSpace: 'nowrap'` combined with `overflow: 'hidden'` on a flex child without explicit width causes the text to collapse to zero width.
2. **Header barely visible**: The logo and title are rendering but extremely small relative to the canvas — the `headerH` values (50-100px) are tiny on a 1080-1920px canvas.
3. **Footer invisible**: Same issue — `footerH` of 30-50px is negligible on these canvas sizes.
4. **Landscape too cramped**: The `flex: 2` for row 1 vs `flex: 1.5` for rows 2-3 in only 630px height with a header/footer leaves very little room.

### Changes — `src/components/profile/ShareableTopFive.tsx`

**Fix name rendering:**
- Give the name `<p>` tag `flex: 1` and `minWidth: 0` so it takes remaining space in the flex row without collapsing
- This is a known flexbox text-overflow pattern needed for `html2canvas` compatibility

**Increase header/footer sizes:**
- Portrait: header 140px, footer 70px
- Square: header 100px, footer 50px  
- Landscape: header 60px, footer 35px

**Increase font/logo sizes proportionally:**
- Logo: landscape 36px, portrait 70px, square 55px
- Header font: landscape 26px, portrait 48px, square 36px
- Footer font: landscape 14px, portrait 22px, square 18px

**Landscape row balance:**
- Change row flex weights: row 1 `flex: 1.8`, rows 2-3 `flex: 1.2` — gives more even distribution in the limited height

### No other files changed

