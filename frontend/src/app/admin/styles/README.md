# Admin Styles & Assets Guide

Complete documentation for the admin theme styling system.

## 📚 Quick Links

- [Folder Structure](#folder-structure)
- [SCSS System](#scss-system)
- [Colors & Themes](#colors--themes)
- [Icons & Fonts](#icons--fonts)
- [JavaScript Utilities](#javascript-utilities)
- [Adding New Styles](#adding-new-styles)
- [Browser Support](#browser-support)
- [Performance Tips](#performance-tips)

---

## 📁 Folder Structure

### `/scss` - SCSS Source Files

**Main Entry Point:** `style.scss`
- Compiles to `../css/style.css`

**Structure:**
```
scss/
├── style.scss                    # Main import file (imports all below)
├── _variables.scss               # Color, sizing, spacing variables
├── _navbar.scss                  # Navigation bar styling (503 lines)
├── _sidebar.scss                 # Sidebar panel styling
├── _layouts.scss                 # Layout grid & containers
├── _settings-panel.scss          # Settings/configuration panel
├── _vertical-wrapper.scss        # Vertical layout wrapper
└── common/light/                 # Light theme core styles
    ├── common.scss               # Theme entry point
    ├── _variables.scss           # Light theme variables
    ├── _reset.scss               # CSS reset/normalize
    ├── _fonts.scss               # Typography & fonts
    ├── _background.scss          # Background utilities
    ├── _typography.scss          # Text styles
    ├── _utilities.scss           # Utility classes
    ├── _footer.scss              # Footer styles
    ├── _demo.scss                # Demo component styles
    ├── _functions.scss           # SCSS functions
    ├── _misc.scss                # Miscellaneous styles
    ├── mixins/                   # SCSS mixins for reusable patterns
    ├── components/               # Component-specific styles
    └── landing-screens/          # Landing page styles
```

### `/css` - Compiled CSS

- **style.css** - Production CSS (compiled from SCSS)
- **maps/** - Source maps for browser debugging

### `/fonts`

- **Poppins/** - Primary font family (multiple weights)

### `/images`

Organized by category:
- **auth/** - Authentication page assets
- **carousel/** - Carousel/slider images
- **demo/** - Demo screenshots
- **faces/** - User avatar images
- **file-icons/** - Document type icons
- **lightbox/** - Image gallery assets
- **samples/** - Sample/placeholder images
- **logo.svg, logo-dark.svg, logo-mini.svg** - Brand assets
- **favicon.ico, favicon.png** - Browser favicon

### `/js` - JavaScript Utilities (58 files)

#### Plugin & Feature Files:
- **Chart Libraries:** `chart.js`, `flot-chart.js`, `morris.js`, `google-charts.js`
- **Tables:** `bootstrap-table.js`, `data-table.js`, `tablesorter.js`, `jq.tablesort.js`
- **Forms:** `form-validation.js`, `form-repeater.js`, `form-addons.js`, `formpickers.js`
- **Maps:** `google-maps.js`, `maps.js`, `mapael.js`, `mapael_example_*.js`
- **UI Components:** `modal-demo.js`, `popover.js`, `tooltips.js`, `tabs.js`, `alerts.js`
- **Editors:** `codeEditor.js`, `codemirror.js`, `editorDemo.js`, `editorDemo-dark.js`
- **File Management:** `dropzone.js`, `dropify.js`, `file-upload.js`, `jquery-file-upload.js`
- **Data Display:** `js-grid.js`, `paginate.js`, `listify.js`, `light-gallery.js`
- **Other Tools:** `calendar.js`, `context-menu.js`, `wizard.js`, `todolist.js`, `select2.js`

### `/vendors` - Third-Party Libraries

```
vendors/
├── chart.js/              # Chart.js library
├── codemirror/            # Code editor
├── css/                   # Additional vendor CSS
├── flag-icon-css/         # Country flag icons
├── font-awesome/          # Font Awesome icons
├── jquery-file-upload/    # jQuery file upload
├── js/                    # Vendor JavaScript libraries
├── mdi/                   # Material Design Icons
├── owl-carousel-2/        # Image carousel
├── pwstabs/               # Tab component
├── select2/               # Select dropdown
├── select2-bootstrap-theme/
├── simple-line-icons/     # Simple line icon set
├── ti-icons/              # Themify icons
├── typeahead.js/          # Autocomplete library
└── typicons/              # Typicons icon set
```

---

## 🎨 SCSS System

### Global Variables (`_variables.scss`)

#### Sidebar Variables
```scss
$sidebar-width-lg: 236px;           // Full sidebar width
$sidebar-width-mini: 185px;         // Collapsed sidebar
$sidebar-width-icon: 70px;          // Icon-only mode

// Light Theme
$sidebar-light-bg: #ffffff;
$sidebar-light-menu-color: #001737;
$sidebar-light-menu-active-bg: #f7f8fc;

// Dark Theme
$sidebar-dark-bg: #282f3a;
$sidebar-dark-menu-color: #d0cfcf;
```

#### Navbar Variables
```scss
$navbar-height: [check _navbar.scss for exact value]
$primary: [primary color - check common/light/_variables.scss]
```

#### Transition Variables
```scss
$action-transition-duration: [duration in ms]
$action-transition-timing-function: [easing function]
```

### How to Customize

#### 1. **Change Primary Color**
Edit `scss/common/light/_variables.scss`:
```scss
$primary: #your-color;
```

#### 2. **Update Sidebar Width**
Edit `scss/_variables.scss`:
```scss
$sidebar-width-lg: 250px;  // Change from 236px
```

#### 3. **Modify Typography**
Edit `scss/common/light/_typography.scss`:
```scss
// Change font sizes, weights, line heights
```

#### 4. **Add New Color Theme**
1. Create `scss/common/dark/` directory
2. Copy files from `scss/common/light/`
3. Modify color variables
4. Import in main `style.scss`

---

## 🎨 Colors & Themes

### Available Themes
- **Light Theme** (Default) - `scss/common/light/`
- **Dark Theme** - Can be created by duplicating light theme

### Color Hierarchy

**Light Theme Variables:**
```
Primary Color       → $primary (check common/light/_variables.scss)
Gray Scale          → $gray-dark, $gray, $gray-light
Success/Warning     → $success, $warning, $danger, $info
```

**Sidebar Colors (Light):**
- Background: `#ffffff`
- Text: `#001737`
- Active: `#f7f8fc`
- Hover: `#f7f8fc`

**Sidebar Colors (Dark):**
- Background: `#282f3a`
- Text: `#d0cfcf`
- Menu Hover: `#3b424c`

---

## 🔤 Icons & Fonts

### Icon Sets Included

| Icon Set | Usage | Location |
|----------|-------|----------|
| Font Awesome | UI & social icons | `vendors/font-awesome/` |
| Material Design Icons (MDI) | Modern icons | `vendors/mdi/` |
| Simple Line Icons | Minimal icons | `vendors/simple-line-icons/` |
| Themify Icons | General icons | `vendors/ti-icons/` |
| Typicons | Small icons | `vendors/typicons/` |
| Flag Icon CSS | Country flags | `vendors/flag-icon-css/` |

### Fonts

**Poppins Font** (Primary)
- Location: `fonts/Poppins/`
- Weights: Multiple (check files)
- Usage: Main typography

**Usage in HTML:**
```html
<!-- Font Awesome -->
<i class="fa fa-icon-name"></i>

<!-- Material Design Icons -->
<i class="mdi mdi-icon-name"></i>

<!-- Simple Line Icons -->
<i class="icon-icon-name"></i>

<!-- Themify Icons -->
<i class="ti-icon-name"></i>
```

---

## 🔧 JavaScript Utilities

### Loading JS Files

All JS files are located in `assets/js/`. Load in your HTML:

```html
<!-- Dashboard -->
<script src="assets/js/dashboard.js"></script>

<!-- Data Tables -->
<script src="assets/js/data-table.js"></script>

<!-- Forms -->
<script src="assets/js/form-validation.js"></script>

<!-- Charts -->
<script src="assets/js/chart.js"></script>
```

### Common Utilities

| File | Purpose |
|------|---------|
| `template.js` | Main template initialization |
| `demo.js` | Demo functionality |
| `settings.js` | User settings panel |
| `alerts.js` | Alert notifications |
| `tooltips.js` | Tooltip functionality |
| `popover.js` | Popover functionality |

### Plugin-Specific JS

- **Table Sorting:** `tablesorter.js`, `jq.tablesort.js`
- **Form Validation:** `form-validation.js`
- **Date Picking:** `formpickers.js`
- **Select Dropdowns:** `select2.js`
- **File Upload:** `file-upload.js`, `dropzone.js`

---

## ✏️ Adding New Styles

### Method 1: Extend Existing SCSS Files

Edit relevant SCSS file:
```scss
// scss/_navbar.scss (for navbar changes)
.navbar-custom {
  background-color: $primary;
  padding: 1rem;
}
```

### Method 2: Create Component File

1. Create `scss/common/light/components/_my-component.scss`
2. Add styles:
```scss
.my-component {
  // Component styles
}
```
3. Import in `scss/common/light/common.scss`:
```scss
@import "components/my-component";
```

### Method 3: Use SCSS Mixins

Available in `scss/common/light/mixins/`:
```scss
.element {
  @include transition(all 0.3s ease);
  @include box-shadow(0 2px 4px rgba(0,0,0,0.1));
}
```

### Naming Conventions

- **Components:** `.component-name`
- **Modifiers:** `.component-name--modifier` (BEM)
- **States:** `.is-active`, `.is-disabled`
- **Utilities:** `.u-hidden`, `.u-text-center`

---

## 🌐 Browser Support

### Vendor Prefixes

Current setup includes prefixes for:
- `-webkit-` (Chrome, Safari)
- `-moz-` (Firefox)
- `-ms-` (Internet Explorer, Edge)

**Current Minimum:** IE 11 compatible

### Recommended Update

For modern browsers (Chrome 90+, Firefox 88+, Safari 14+):
- Remove `-ms-` prefixes
- Consider removing `-webkit-` for newer properties
- Focus on standard CSS properties

---

## 🚀 Performance Tips

### 1. **CSS Optimization**
- Only import needed vendor libraries
- Use CSS purging tools (PurgeCSS)
- Minify CSS for production

### 2. **Image Optimization**
- Use SVG for logos and icons
- Compress PNG/JPG images
- Use WebP format where supported
- Implement lazy loading

### 3. **Font Loading**
- Use system fonts fallback
- Implement font-display: swap
- Limit font weights loaded

### 4. **JavaScript Loading**
- Load JS files asynchronously where possible
- Defer non-critical plugins
- Bundle and minify in production

### Example Performance Setup:
```html
<!-- Critical CSS inline -->
<style>/* Critical styles */</style>

<!-- Defer non-critical CSS -->
<link rel="stylesheet" href="styles-deferred.css" media="print" onload="this.media='all'">

<!-- Async JS for plugins -->
<script src="plugin.js" async></script>

<!-- Defer non-critical JS -->
<script src="utility.js" defer></script>
```

---

## 🔗 Related Files

- **Compiled CSS:** `assets/css/style.css`
- **SCSS Entry:** `assets/scss/style.scss`
- **Variables Guide:** See `VARIABLES.md`
- **Components List:** See `COMPONENTS.md`
- **Analysis Report:** See `ANALYSIS.md`

---

## 📝 Notes

- Always edit SCSS files, never edit compiled CSS
- After editing SCSS, recompile to CSS
- Test changes in multiple browsers
- Document new utilities and components
- Keep vendor libraries up-to-date

---

**Last Updated:** January 13, 2026  
**Maintainer:** Admin Styles Team
