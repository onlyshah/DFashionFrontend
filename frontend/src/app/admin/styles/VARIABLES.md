# SCSS Variables Reference

Complete documentation of all SCSS variables used throughout the admin theme.

## 📋 Table of Contents

1. [Sidebar Variables](#sidebar-variables)
2. [Navbar Variables](#navbar-variables)
3. [Layout Variables](#layout-variables)
4. [Color Variables](#color-variables)
5. [Typography Variables](#typography-variables)
6. [Spacing & Sizing](#spacing--sizing)
7. [Transitions & Animations](#transitions--animations)
8. [Usage Examples](#usage-examples)

---

## 🎨 Sidebar Variables

### Dimensions

```scss
$sidebar-width-lg: 236px;              // Full sidebar width (expanded)
$sidebar-width-mini: 185px;            // Collapsed/minimized sidebar
$sidebar-width-icon: 70px;             // Icon-only sidebar width
$sidebar-margin-left: 0.5rem;          // Left margin spacing
$sidebar-margin-bottom: 2.062rem;      // Bottom margin spacing
```

### Light Theme Colors

```scss
$sidebar-light-bg: #ffffff;                    // Background
$sidebar-light-menu-color: #001737;            // Menu text color
$sidebar-light-submenu-color: #001737;         // Submenu text color
$sidebar-light-menu-active-bg: #f7f8fc;        // Active menu background
$sidebar-light-menu-active-color: #12253f;     // Active menu text
$sidebar-light-menu-hover-bg: #f7f8fc;         // Hover background
$sidebar-light-menu-hover-color: #56595a;      // Hover text color
$sidebar-light-submenu-hover-color: $primary;  // Submenu hover color
$sidebar-light-submenu-active-color: $primary; // Submenu active color
$sidebar-light-menu-icon-color: #6c7293;       // Menu icon color
$sidebar-light-menu-arrow-color: #686868;      // Expand/collapse arrow
$sidebar-light-profile-name-color: #404852;    // User name text
$sidebar-light-profile-title-color: #8d9498;   // User title/role text
```

### Dark Theme Colors

```scss
$sidebar-dark-bg: #282f3a;                          // Background
$sidebar-dark-menu-color: #d0cfcf;                  // Menu text
$sidebar-dark-menu-active-bg: initial;              // Active background
$sidebar-dark-menu-active-color: #c0bbbb;           // Active text
$sidebar-dark-menu-hover-bg: #3b424c;               // Hover background
$sidebar-dark-menu-hover-color: #d0cfcf;            // Hover text
$sidebar-dark-submenu-color: $sidebar-dark-menu-color;
$sidebar-dark-submenu-hover-bg: initial;
$sidebar-dark-submenu-hover-color: #9a94a7;         // Submenu hover
$sidebar-dark-menu-icon-color: $sidebar-dark-menu-color;
$sidebar-dark-profile-name-color: #ffffff;          // User name
$sidebar-dark-profile-title-color: #8d9498;         // User title
```

### Typography

```scss
$sidebar-menu-font-size: .875rem;          // Menu item font size (14px)
$sidebar-menu-padding: 0.87rem .875rem 0.87rem .6rem;

$sidebar-submenu-font-size: .875rem;       // Submenu font size (14px)
$sidebar-submenu-padding: .25rem 0 0 1.1rem;
$sidebar-submenu-item-padding: .7rem 1rem;

$sidebar-icon-font-size: 1.215rem;         // Menu icon size
$sidebar-arrow-font-size: .625rem;         // Collapse arrow size
```

### Spacing & Layout

```scss
$sidebar-profile-bg: transparent;                  // Profile section bg
$sidebar-profile-padding: 0 1.625rem 2.25rem 1.188rem;

$sidebar-mini-menu-padding: .8125rem 1rem .8125rem 1rem;
$sidebar-icon-only-menu-padding: .5rem 1.625rem .5rem 1.188rem;
$sidebar-icon-only-submenu-padding: 0 0 0 1.5rem;

$sidebar-box-shadow: 0 5px 10px 0 rgba(230, 230, 243, 0.88);

$icon-only-collapse-width: 190px;
$icon-only-menu-bg-light: $sidebar-light-bg;
$icon-only-menu-bg-dark: $sidebar-dark-bg;

$rtl-sidebar-submenu-padding: 0 4.5rem 0 0;  // Right-to-left support
```

---

## 📊 Navbar Variables

### Dimensions & Layout

```scss
$navbar-height: 4.625rem;                  // Navbar height (74px)
$navbar-breadcrumb-height: 4.062rem;       // Breadcrumb area height (65px)
```

### Styling

```scss
$navbar-default-bg: #fff;                  // Background color
$navbar-menu-color: #001737;               // Menu/text color
$navbar-font-size: 1rem;                   // Font size
$navbar-icon-font-size: .9375rem;          // Icon size (15px)
```

### Related Variables

Check `_navbar.scss` for additional variables:
- Brand wrapper styling
- Transition effects
- Responsive breakpoints
- Border styling

---

## 🏗️ Layout Variables

### Boxed Layout

```scss
$boxed-container-width: 1200px;             // Container max-width
$boxed-layout-bg: #c6c8ca;                  // Background color
```

### Settings Panel

```scss
$settings-panel-width: 300px;               // Settings sidebar width
```

---

## 🎯 Color Variables

### Primary Color

```scss
$primary: [Value from common/light/_variables.scss]
```

**Usage:**
```scss
.button-primary {
  background-color: $primary;
}

.link {
  color: $primary;
  
  &:hover {
    color: lighten($primary, 10%);
  }
}
```

### Gray Palette

Usually defined in `common/light/_variables.scss`:
```scss
$gray-dark: #333;
$gray: #666;
$gray-light: #ccc;
$gray-lighter: #f5f5f5;
```

### State Colors

Check `common/light/_variables.scss` for:
```scss
$success: #28a745;
$danger: #dc3545;
$warning: #ffc107;
$info: #17a2b8;
```

---

## 🔤 Typography Variables

Located in `common/light/_typography.scss`:

### Font Family

```scss
$font-family-base: 'Poppins', sans-serif;
$font-family-sans-serif: 'Poppins', sans-serif;
$font-family-monospace: monospace;
```

### Font Sizes

```scss
// Check _typography.scss for:
// - $font-size-base
// - $font-size-large
// - $font-size-small
// - $font-size-h1, h2, h3, h4, h5, h6
```

### Line Heights

```scss
// Check _typography.scss for:
// - $line-height-base
// - $line-height-loose
// - $line-height-tight
```

### Font Weights

```scss
// Usually: 300, 400, 500, 600, 700
// Check Poppins font files for available weights
```

---

## 📏 Spacing & Sizing

### Common Spacing Units

```scss
// Typically:
// Smallest:  0.25rem (4px)
// Small:     0.5rem  (8px)
// Medium:    1rem    (16px)
// Large:     1.5rem  (24px)
// XL:        2rem    (32px)
```

### Padding Variables

Used throughout components:
```scss
$sidebar-menu-padding: 0.87rem .875rem 0.87rem .6rem;
$sidebar-submenu-item-padding: .7rem 1rem;
$sidebar-profile-padding: 0 1.625rem 2.25rem 1.188rem;
```

### Border Radius

Check `common/light/_variables.scss` for:
```scss
$border-radius-base: 4px;
$border-radius-large: 6px;
$border-radius-small: 2px;
```

---

## ⚡ Transitions & Animations

### Timing Variables

Defined in `_navbar.scss` and other component files:

```scss
$action-transition-duration: [value in ms]
$action-transition-timing-function: ease;  // or other easing functions
```

### Usage

```scss
.navbar {
  transition: background $action-transition-duration $action-transition-timing-function;
  -webkit-transition: background $action-transition-duration $action-transition-timing-function;
  -moz-transition: background $action-transition-duration $action-transition-timing-function;
  -ms-transition: background $action-transition-duration $action-transition-timing-function;
}
```

---

## 💡 Usage Examples

### Example 1: Custom Sidebar Menu Item

```scss
.sidebar-menu-item {
  color: $sidebar-light-menu-color;
  font-size: $sidebar-menu-font-size;
  padding: $sidebar-menu-padding;
  
  &:hover {
    background-color: $sidebar-light-menu-hover-bg;
    color: $sidebar-light-menu-hover-color;
  }
  
  &.active {
    background-color: $sidebar-light-menu-active-bg;
    color: $sidebar-light-menu-active-color;
  }
}
```

### Example 2: Responsive Sidebar

```scss
.sidebar {
  width: $sidebar-width-lg;
  background-color: $sidebar-light-bg;
  margin-left: $sidebar-margin-left;
  
  // Collapsed state
  &.sidebar-mini {
    width: $sidebar-width-mini;
  }
  
  // Icon-only state
  &.sidebar-icon-only {
    width: $sidebar-width-icon;
  }
}
```

### Example 3: Dark Theme Toggle

```scss
// Light theme
.sidebar {
  background-color: $sidebar-light-bg;
  color: $sidebar-light-menu-color;
}

// Dark theme
body.dark-theme .sidebar {
  background-color: $sidebar-dark-bg;
  color: $sidebar-dark-menu-color;
}
```

### Example 4: Navbar Styling

```scss
.navbar {
  height: $navbar-height;
  background-color: $navbar-default-bg;
  color: $navbar-menu-color;
  font-size: $navbar-font-size;
}

.navbar-icon {
  font-size: $navbar-icon-font-size;
}
```

---

## 🔍 Finding Variable Values

### Step 1: Check Main Variables File
```
assets/scss/_variables.scss
```

### Step 2: Check Light Theme Variables
```
assets/scss/common/light/_variables.scss
```

### Step 3: Check Component Files
For component-specific variables, check:
- `_navbar.scss`
- `_sidebar.scss`
- `_layouts.scss`
- `common/light/components/*.scss`

### Step 4: Search in SCSS Files
Use grep or search in your editor:
```bash
grep -r "$variable-name" assets/scss/
```

---

## 📝 Best Practices

### 1. Always Use Variables for Colors

❌ **Don't:**
```scss
.sidebar {
  background-color: #ffffff;
}
```

✅ **Do:**
```scss
.sidebar {
  background-color: $sidebar-light-bg;
}
```

### 2. Create New Variables for Repetitive Values

❌ **Don't:**
```scss
.menu { padding: 0.87rem .875rem 0.87rem .6rem; }
.submenu { padding: 0.87rem .875rem 0.87rem .6rem; }
```

✅ **Do:**
```scss
.menu { padding: $menu-padding; }
.submenu { padding: $menu-padding; }
```

### 3. Group Related Variables

```scss
// ✅ Good organization
// Sidebar dimensions
$sidebar-width-lg: 236px;
$sidebar-width-mini: 185px;

// Sidebar colors - light
$sidebar-light-bg: #ffffff;
$sidebar-light-menu-color: #001737;
```

### 4. Document Custom Variables

```scss
// User profile section background (transparent to show parent bg)
$sidebar-profile-bg: transparent;

// Profile section padding (top right bottom left)
$sidebar-profile-padding: 0 1.625rem 2.25rem 1.188rem;
```

---

## 🔄 Modifying Variables

### Safe Variable Changes

These can be safely changed without breaking layout:
- Color values
- Font sizes (slightly)
- Padding/margin values

### Breaking Changes Risk

Be careful when changing:
- Width values (can affect layouts)
- Height values (can cause overflow)
- Critical padding (can misalign elements)

### Testing After Changes

```scss
// Always test:
1. Sidebar in all states (lg, mini, icon-only)
2. Navbar responsiveness
3. Menu items alignment
4. Profile section layout
5. Overflow issues
6. Mobile/tablet views
```

---

## 🚀 Advanced Usage

### Using Lighten/Darken Functions

```scss
.menu-item {
  color: $sidebar-light-menu-color;
  
  &:hover {
    color: lighten($sidebar-light-menu-color, 10%);
  }
  
  &:active {
    color: darken($sidebar-light-menu-color, 10%);
  }
}
```

### Creating Color Variations

```scss
// Create a lighter variant
$primary-light: lighten($primary, 20%);
$primary-dark: darken($primary, 20%);

.button-primary-light { background-color: $primary-light; }
.button-primary-dark { background-color: $primary-dark; }
```

### Responsive Variables

```scss
// Define breakpoint variables
$breakpoint-sm: 576px;
$breakpoint-md: 768px;
$breakpoint-lg: 992px;
$breakpoint-xl: 1200px;

// Use in media queries
@media (max-width: $breakpoint-lg) {
  .sidebar {
    width: $sidebar-width-mini;
  }
}
```

---

**Last Updated:** January 13, 2026  
**Status:** Complete Reference Document
