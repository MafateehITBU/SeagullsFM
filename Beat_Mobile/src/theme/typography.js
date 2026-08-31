/**
 * Typography – matches website (moodfm-web) scale and weights.
 * Web: h1 4rem/900, h2 3.5rem/600, h3 2.5rem/600, section 53px/700, body 24/18/16/14, etc.
 * Mobile uses same relative scale; sizes slightly reduced for small screens.
 */

// Font sizes (px) – web equivalents in comments
export const fontSizes = {
  // Headings (Fractul)
  heroTitle: 36,      // web: 4rem (64px) hero
  h1: 32,             // web: h1 4rem
  h2: 28,             // web: h2 3.5rem (56px)
  h3: 24,             // web: h3 2.5rem (40px)
  h4: 22,
  sectionTitle: 26,   // web: presenters-title 53px → scaled for mobile
  sectionSubtitle: 20, // web: 24px descriptions
  cardTitle: 20,      // web: 20–24px card titles
  // Body (Gobold / Inter on web)
  bodyLg: 20,        // web: 24px, 20px
  body: 18,           // web: 18px
  bodyMd: 16,         // web: 16px
  bodySm: 14,         // web: 14px
  caption: 12,        // web: 12px
  tiny: 11,           // web: 11px
};

// Font weights – match web (200, 400, 500, 600, 700, 900)
export const fontWeights = {
  light: '200',
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  black: '900',
};

// Line heights (multiplier or px) for consistency
export const lineHeights = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.6,
};
