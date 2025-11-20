# Carbon Design System Color & Font Implementation

## Overview
This document describes the color and font scheme implementation based on the Carbon Design System reference images.

## Color Scheme

### Background Colors
- **Main Background**: `#ffffff` (White)
- **Layer 01** (Main content area): `#f4f4f4` (Light gray)
- **Layer 02**: `#ffffff` (White)
- **Layer 03**: `#ffffff` (White)
- **Header Background**: `#161616` (Dark gray/black)

### Text Colors
- **Primary Text**: `#161616` (Dark gray/black)
- **Secondary Text**: `#525252` (Medium gray)
- **Tertiary Text**: `#a8a8a8` (Light gray)
- **Text on Color**: `#ffffff` (White)

### Interactive Colors
- **Primary Link**: `#0f62fe` (IBM Blue 60)
- **Primary Link Hover**: `#0043ce` (IBM Blue 70)
- **Secondary Link**: `#0043ce` (IBM Blue 70)

### Border Colors
- **Subtle Border 01**: `#e0e0e0` (Light gray)
- **Subtle Border 02**: `#e0e0e0` (Light gray)
- **Strong Border 01**: `#8d8d8d` (Medium gray)

### Support Colors
- **Error**: `#da1e28` (Red)
- **Success**: `#24a148` (Green)
- **Warning**: `#f1c21b` (Yellow)
- **Info**: `#0043ce` (Blue)

## Typography

### Font Family
- **Primary**: IBM Plex Sans (included by Carbon Design System)
- **Monospace**: IBM Plex Mono

### Typography Scale

#### Headings
- **Heading 01** (h1): 2.625rem, weight 400, line-height 1.19
- **Heading 02** (h2): 2rem, weight 400, line-height 1.25
- **Heading 03** (h3): 1.75rem, weight 400, line-height 1.29
- **Heading 04** (h4): 1.25rem, weight 400, line-height 1.4, letter-spacing 0.16px
- **Heading 05** (h5): 1rem, weight 600, line-height 1.5, letter-spacing 0.16px
- **Heading 06** (h6): 0.875rem, weight 600, line-height 1.43, letter-spacing 0.16px

#### Body Text
- **Body 01**: 1rem, weight 400, line-height 1.5, letter-spacing 0.16px
- **Body 02**: 0.875rem, weight 400, line-height 1.43, letter-spacing 0.16px

#### Labels
- **Label 01**: 0.875rem, weight 400, line-height 1.29, letter-spacing 0.16px
- **Label 02**: 0.75rem, weight 400, line-height 1.33, letter-spacing 0.32px

#### Code
- **Code 01**: 0.875rem, weight 400, line-height 1.43, letter-spacing 0.32px
- **Code 02**: 0.75rem, weight 400, line-height 1.33, letter-spacing 0.32px

## Implementation Files

### Updated Files
1. **`frontend/app/globals.css`**
   - Added Carbon color tokens matching the reference
   - Added typography scale classes
   - Set IBM Plex Sans as the default font family

2. **`frontend/app/layout.tsx`**
   - Removed Geist font imports
   - Using Carbon's built-in IBM Plex Sans font

3. **`frontend/app/(dashboard)/dashboard-layout.module.scss`**
   - Updated background colors to use Carbon tokens
   - Added padding to main content area

4. **`frontend/components/layout/ContentLayout.tsx`**
   - Updated to use Carbon layer-01 background color

## CSS Variables

All color tokens are available as CSS variables:
- `--cds-background`
- `--cds-layer-01`
- `--cds-text-primary`
- `--cds-text-secondary`
- `--cds-link-primary`
- `--cds-border-subtle-01`
- And more...

## Usage

### In Components
```tsx
// Use Carbon color tokens
<div style={{ backgroundColor: 'var(--cds-layer-01)' }}>
  <p style={{ color: 'var(--cds-text-primary)' }}>Text</p>
</div>

// Use typography classes
<h1 className="heading-01">Main Heading</h1>
<p className="body-01">Body text</p>
```

### In SCSS/CSS
```scss
.my-component {
  background-color: var(--cds-layer-01);
  color: var(--cds-text-primary);
  border: 1px solid var(--cds-border-subtle-01);
}
```

## Visual Reference

The implementation matches the Carbon Design System reference with:
- Dark header (`#161616`) with white text
- White sidebar with dark text
- Light gray main content area (`#f4f4f4`)
- IBM Blue (`#0f62fe`) for active states and links
- IBM Plex Sans font throughout
- Consistent typography scale

## Notes

- IBM Plex Sans is included by Carbon Design System via `@carbon/react/index.scss`
- Color tokens follow Carbon's naming convention
- Typography classes match Carbon's type scale
- All colors are accessible and meet WCAG contrast requirements

