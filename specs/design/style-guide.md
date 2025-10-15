# Style Guide

Design system tokens and visual language for the NFL Pick 'Em Challenge.

## 🎨 Color Palette

### Brand Colors

```css
/* Primary - NFL Blue */
--color-primary-900: #001a33;
--color-primary-800: #002d5a;
--color-primary-700: #003d7a;
--color-primary-600: #004d99;
--color-primary-500: #0066cc;  /* Primary brand color */
--color-primary-400: #3385d6;
--color-primary-300: #66a3e0;
--color-primary-200: #99c2eb;
--color-primary-100: #cce0f5;
--color-primary-50: #e6f0fa;

/* Secondary - Victory Green */
--color-secondary-900: #0d3320;
--color-secondary-800: #165433;
--color-secondary-700: #1f7547;
--color-secondary-600: #28965a;
--color-secondary-500: #32b76d;  /* Success/Win color */
--color-secondary-400: #5bc58a;
--color-secondary-300: #84d4a7;
--color-secondary-200: #ade2c4;
--color-secondary-100: #d6f1e1;
--color-secondary-50: #ebf8f0;

/* Tertiary - Touchdown Red */
--color-tertiary-900: #4d0000;
--color-tertiary-800: #7a0000;
--color-tertiary-700: #a60000;
--color-tertiary-600: #d30000;
--color-tertiary-500: #ff0000;  /* Error/Loss color */
--color-tertiary-400: #ff3333;
--color-tertiary-300: #ff6666;
--color-tertiary-200: #ff9999;
--color-tertiary-100: #ffcccc;
--color-tertiary-50: #ffe6e6;
```

### Neutral Colors

```css
/* Grays */
--color-neutral-900: #1a1a1a;
--color-neutral-800: #333333;
--color-neutral-700: #4d4d4d;
--color-neutral-600: #666666;
--color-neutral-500: #808080;
--color-neutral-400: #999999;
--color-neutral-300: #b3b3b3;
--color-neutral-200: #cccccc;
--color-neutral-100: #e6e6e6;
--color-neutral-50: #f5f5f5;
--color-white: #ffffff;
--color-black: #000000;
```

### Semantic Colors

```css
/* Status Colors */
--color-success: var(--color-secondary-500);
--color-warning: #f59e0b;
--color-error: var(--color-tertiary-500);
--color-info: var(--color-primary-500);

/* UI States */
--color-disabled: var(--color-neutral-300);
--color-hover: var(--color-primary-600);
--color-active: var(--color-primary-700);
--color-focus: var(--color-primary-400);
```

## 📝 Typography

### Font Families

```css
/* Primary Font - System UI */
--font-family-primary: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;

/* Monospace Font - Code/Numbers */
--font-family-mono: "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, monospace;

/* Display Font - Headers */
--font-family-display: "Inter", var(--font-family-primary);
```

### Font Sizes

```css
/* Type Scale */
--font-size-xs: 0.75rem;    /* 12px */
--font-size-sm: 0.875rem;   /* 14px */
--font-size-base: 1rem;     /* 16px */
--font-size-lg: 1.125rem;   /* 18px */
--font-size-xl: 1.25rem;    /* 20px */
--font-size-2xl: 1.5rem;    /* 24px */
--font-size-3xl: 1.875rem;  /* 30px */
--font-size-4xl: 2.25rem;   /* 36px */
--font-size-5xl: 3rem;      /* 48px */
```

### Font Weights

```css
--font-weight-light: 300;
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
--font-weight-extrabold: 800;
```

### Line Heights

```css
--line-height-tight: 1.25;
--line-height-normal: 1.5;
--line-height-relaxed: 1.75;
--line-height-loose: 2;
```

## 📏 Spacing

### Spacing Scale

```css
--spacing-0: 0;
--spacing-1: 0.25rem;   /* 4px */
--spacing-2: 0.5rem;    /* 8px */
--spacing-3: 0.75rem;   /* 12px */
--spacing-4: 1rem;      /* 16px */
--spacing-5: 1.25rem;   /* 20px */
--spacing-6: 1.5rem;    /* 24px */
--spacing-8: 2rem;      /* 32px */
--spacing-10: 2.5rem;   /* 40px */
--spacing-12: 3rem;     /* 48px */
--spacing-16: 4rem;     /* 64px */
--spacing-20: 5rem;     /* 80px */
--spacing-24: 6rem;     /* 96px */
```

## 🔲 Layout

### Breakpoints

```css
--breakpoint-sm: 640px;   /* Small devices */
--breakpoint-md: 768px;   /* Medium devices */
--breakpoint-lg: 1024px;  /* Large devices */
--breakpoint-xl: 1280px;  /* Extra large devices */
--breakpoint-2xl: 1536px; /* 2X large devices */
```

### Container Widths

```css
--container-sm: 640px;
--container-md: 768px;
--container-lg: 1024px;
--container-xl: 1280px;
--container-full: 100%;
```

### Z-Index Scale

```css
--z-index-base: 0;
--z-index-dropdown: 1000;
--z-index-sticky: 1020;
--z-index-fixed: 1030;
--z-index-modal-backdrop: 1040;
--z-index-modal: 1050;
--z-index-popover: 1060;
--z-index-tooltip: 1070;
```

## 🎭 Effects

### Shadows

```css
/* Elevation */
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-base: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
--shadow-inner: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
```

### Border Radius

```css
--radius-sm: 0.125rem;  /* 2px */
--radius-base: 0.25rem; /* 4px */
--radius-md: 0.375rem;  /* 6px */
--radius-lg: 0.5rem;    /* 8px */
--radius-xl: 0.75rem;   /* 12px */
--radius-2xl: 1rem;     /* 16px */
--radius-full: 9999px;  /* Pill shape */
```

### Transitions

```css
--transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-slow: 300ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-slower: 500ms cubic-bezier(0.4, 0, 0.2, 1);
```

## 🎯 Usage Guidelines

### Color Usage

- **Primary**: Main brand actions (buttons, links, navigation)
- **Secondary**: Success states, confirmations, positive feedback
- **Tertiary**: Errors, warnings, destructive actions
- **Neutral**: Text, backgrounds, borders

### Typography Hierarchy

```
H1: font-size-4xl, font-weight-bold, line-height-tight
H2: font-size-3xl, font-weight-semibold, line-height-tight
H3: font-size-2xl, font-weight-semibold, line-height-normal
H4: font-size-xl, font-weight-medium, line-height-normal
Body: font-size-base, font-weight-normal, line-height-normal
Small: font-size-sm, font-weight-normal, line-height-relaxed
```

### Spacing Patterns

- **Component padding**: spacing-4 (1rem)
- **Section margins**: spacing-8 to spacing-16
- **Card padding**: spacing-6
- **Button padding**: spacing-3 (vertical) × spacing-6 (horizontal)
- **Input padding**: spacing-2 (vertical) × spacing-3 (horizontal)

## 📱 Responsive Design

### Mobile First Approach

Start with mobile styles and enhance for larger screens:

```css
/* Mobile styles (base) */
.component { padding: var(--spacing-4); }

/* Tablet and up */
@media (min-width: 768px) {
  .component { padding: var(--spacing-6); }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .component { padding: var(--spacing-8); }
}
```

## ♿ Accessibility

### Contrast Ratios

- **Normal text**: Minimum 4.5:1 ratio
- **Large text**: Minimum 3:1 ratio
- **UI components**: Minimum 3:1 ratio

### Focus States

All interactive elements must have visible focus indicators:

```css
--focus-ring: 0 0 0 3px var(--color-focus);
--focus-ring-offset: 0 0 0 2px var(--color-white);
```

## 🔄 Updates & Versioning

This style guide is a living document. Updates should:
1. Be versioned with the main codebase
2. Include migration notes for breaking changes
3. Be validated against existing components
4. Include visual regression tests

**Last Updated**: 2025-10-15  
**Version**: 3.1.0
