# CSS Components & Classes Reference

Complete guide to available CSS classes and component styling in the admin theme.

## 📚 Table of Contents

1. [Layout Components](#layout-components)
2. [Sidebar Components](#sidebar-components)
3. [Navbar Components](#navbar-components)
4. [Typography Classes](#typography-classes)
5. [Utility Classes](#utility-classes)
6. [Form Components](#form-components)
7. [Button & Badge Components](#button--badge-components)
8. [Card & Container Components](#card--container-components)
9. [Icon Usage](#icon-usage)
10. [Responsive Classes](#responsive-classes)

---

## 🏗️ Layout Components

### Main Layout Structure

```html
<!-- Vertical Wrapper (Main Container) -->
<div class="vertical-wrapper">
  <!-- Sidebar -->
  <div class="sidebar"></div>
  
  <!-- Navbar -->
  <nav class="navbar"></nav>
  
  <!-- Main Content Area -->
  <div class="page-wrapper">
    <div class="page-body-wrapper">
      <!-- Content goes here -->
    </div>
  </div>
</div>
```

### Container Classes

```scss
.vertical-wrapper          // Main vertical layout wrapper
.page-wrapper              // Main page wrapper
.page-body-wrapper         // Page body container
.container-fluid           // Full-width container
.container                 // Fixed-width container
```

### Grid Layout

```html
<!-- Bootstrap Grid System -->
<div class="row">
  <div class="col-12">Full width</div>
  <div class="col-md-6">Half width on medium+ screens</div>
  <div class="col-lg-4">Third width on large+ screens</div>
</div>
```

---

## 📍 Sidebar Components

### Sidebar Container

```html
<aside class="sidebar">
  <!-- Sidebar content -->
</aside>

<!-- Sidebar States -->
<aside class="sidebar sidebar-mini">              <!-- Minimized -->
<aside class="sidebar sidebar-icon-only">         <!-- Icon only -->
<aside class="sidebar sidebar-dark">              <!-- Dark theme -->
```

### Menu Structure

```html
<div class="sidebar-menu">
  <!-- Main Menu Item -->
  <ul class="nav">
    <li class="nav-item">
      <a class="nav-link" href="#menu">
        <i class="menu-icon fa fa-dashboard"></i>
        <span class="menu-title">Dashboard</span>
      </a>
    </li>
    
    <!-- Menu with Submenu -->
    <li class="nav-item">
      <a class="nav-link" data-toggle="collapse" href="#submenu">
        <i class="menu-icon fa fa-layers"></i>
        <span class="menu-title">Components</span>
        <i class="menu-arrow"></i>
      </a>
      <div class="collapse" id="submenu">
        <ul class="nav flex-column sub-menu">
          <li class="nav-item">
            <a class="nav-link" href="#component1">Component 1</a>
          </li>
        </ul>
      </div>
    </li>
  </ul>
</div>
```

### Profile Section

```html
<div class="sidebar-profile">
  <div class="user-profile">
    <div class="display-2">
      <div class="dot-indicator bg-success"></div>
      <img src="profile.jpg" alt="Profile" class="img-sm rounded-circle">
    </div>
    <div class="info-wrapper">
      <p class="user-name">John Doe</p>
      <p class="designation">Admin</p>
    </div>
  </div>
</div>
```

### Sidebar CSS Classes

```scss
.sidebar                     // Main sidebar container
.sidebar.sidebar-mini        // Minimized sidebar state
.sidebar.sidebar-icon-only   // Icon-only mode
.sidebar.sidebar-dark        // Dark theme variant
.sidebar-menu                // Menu wrapper
.nav                         // Menu list
.nav-item                    // Menu item
.nav-link                    // Menu link
.nav-link.active             // Active menu state
.menu-icon                   // Menu item icon
.menu-title                  // Menu item text
.menu-arrow                  // Expand arrow icon
.sub-menu                    // Submenu list
.sidebar-profile             // Profile section
.user-profile                // User info container
.display-2                   // Avatar section
.dot-indicator               // Online status dot
.info-wrapper                // User name/role container
.user-name                   // User name text
.designation                 // User role text
```

---

## 📊 Navbar Components

### Navbar Structure

```html
<nav class="navbar navbar-expand-lg navbar-light">
  <div class="navbar-brand-wrapper">
    <div class="navbar-brand-inner-wrapper">
      <a class="navbar-brand" href="/">
        <img src="logo.svg" alt="Logo" class="brand-logo">
        <img src="logo-mini.svg" alt="Logo" class="brand-logo-mini">
      </a>
      <button class="navbar-toggler" type="button" data-toggle="collapse">
        <span class="navbar-toggler-icon"></span>
      </button>
    </div>
  </div>
  
  <div class="navbar-collapse collapse" id="navbar">
    <!-- Navbar items -->
  </div>
</nav>
```

### Navbar Items

```html
<!-- Right-aligned items -->
<ul class="navbar-nav ml-auto">
  <!-- Search Bar -->
  <li class="nav-item">
    <form class="search-form" role="search">
      <div class="input-group">
        <input type="text" class="form-control" placeholder="Search">
        <div class="input-group-append">
          <span class="input-group-text"><i class="fa fa-search"></i></span>
        </div>
      </div>
    </form>
  </li>
  
  <!-- Notifications -->
  <li class="nav-item dropdown">
    <a class="nav-link dropdown-toggle" href="#" data-toggle="dropdown">
      <i class="fa fa-bell"></i>
      <span class="notification-indicator"></span>
    </a>
    <div class="dropdown-menu dropdown-menu-right">
      <!-- Notification items -->
    </div>
  </li>
  
  <!-- User Menu -->
  <li class="nav-item dropdown">
    <a class="nav-link dropdown-toggle" href="#" data-toggle="dropdown">
      <img src="profile.jpg" class="img-sm rounded-circle" alt="Profile">
      <span class="hidden-sm">John Doe</span>
    </a>
    <div class="dropdown-menu dropdown-menu-right">
      <a class="dropdown-item" href="#profile">Profile</a>
      <a class="dropdown-item" href="#settings">Settings</a>
      <div class="dropdown-divider"></div>
      <a class="dropdown-item" href="#logout">Logout</a>
    </div>
  </li>
</ul>
```

### Navbar CSS Classes

```scss
.navbar                      // Navbar container
.navbar-brand-wrapper        // Brand/logo section
.navbar-brand-inner-wrapper  // Inner wrapper
.navbar-brand                // Logo/brand link
.brand-logo                  // Full logo image
.brand-logo-mini             // Mini logo (mobile)
.navbar-collapse             // Collapsible navbar
.navbar-nav                  // Nav item list
.nav-item                    // Individual nav item
.nav-link                    // Nav link
.dropdown-toggle             // Dropdown trigger
.dropdown-menu               // Dropdown container
.dropdown-menu-right         // Right-aligned dropdown
.dropdown-item               // Dropdown item
.dropdown-divider            // Separator line
.notification-indicator      // Notification badge
.search-form                 // Search bar container
.input-group                 // Form input group
.input-group-append          // Input addon
.input-group-text            // Addon text/icon
.hidden-sm                   // Hide on small screens
```

---

## 🔤 Typography Classes

### Heading Classes

```html
<h1 class="page-title">Page Title</h1>
<h2 class="section-title">Section Title</h2>
<h3 class="sub-title">Subtitle</h3>
<h4 class="card-title">Card Title</h4>
<h5 class="form-label">Form Label</h5>
<h6 class="small-text">Small Text</h6>

<!-- Alternative heading classes -->
<div class="display-4">Display Heading 4</div>
<div class="display-5">Display Heading 5</div>
<div class="display-6">Display Heading 6</div>
```

### Text Styling Classes

```html
<!-- Text transformation -->
<p class="text-uppercase">UPPERCASE TEXT</p>
<p class="text-lowercase">lowercase text</p>
<p class="text-capitalize">Capitalized Text</p>

<!-- Text alignment -->
<p class="text-left">Left aligned</p>
<p class="text-center">Center aligned</p>
<p class="text-right">Right aligned</p>
<p class="text-justify">Justified text</p>

<!-- Font weight -->
<p class="font-weight-light">Light weight (300)</p>
<p class="font-weight-normal">Normal weight (400)</p>
<p class="font-weight-medium">Medium weight (500)</p>
<p class="font-weight-semibold">Semibold weight (600)</p>
<p class="font-weight-bold">Bold weight (700)</p>

<!-- Text color -->
<p class="text-primary">Primary color text</p>
<p class="text-success">Success color text</p>
<p class="text-danger">Danger color text</p>
<p class="text-warning">Warning color text</p>
<p class="text-info">Info color text</p>
<p class="text-muted">Muted gray text</p>

<!-- Line height -->
<p class="line-height-sm">Small line height</p>
<p class="line-height-base">Normal line height</p>
<p class="line-height-lg">Large line height</p>
```

### Typography CSS Classes

```scss
.page-title               // Main page title
.section-title            // Section heading
.sub-title                // Subtitle
.card-title               // Card heading
.form-label               // Form labels
.small-text               // Small text
.text-uppercase           // All caps
.text-lowercase           // All lowercase
.text-capitalize          // Capitalize first letter
.text-left                // Left align
.text-center              // Center align
.text-right               // Right align
.text-justify             // Justify align
.font-weight-light        // Font weight 300
.font-weight-normal       // Font weight 400
.font-weight-medium       // Font weight 500
.font-weight-semibold     // Font weight 600
.font-weight-bold         // Font weight 700
.text-primary             // Primary color
.text-success             // Success color
.text-danger              // Danger color
.text-warning             // Warning color
.text-info                // Info color
.text-muted               // Gray/muted color
.line-height-sm           // Tight line spacing
.line-height-base         // Normal line spacing
.line-height-lg           // Loose line spacing
```

---

## 🎯 Utility Classes

### Display & Visibility

```html
<!-- Display utilities -->
<div class="d-none">Hidden (display: none)</div>
<div class="d-inline">Inline element</div>
<div class="d-inline-block">Inline block</div>
<div class="d-block">Block element</div>
<div class="d-flex">Flex container</div>
<div class="d-grid">Grid container</div>

<!-- Visibility utilities -->
<div class="visible-xs">Visible on extra small</div>
<div class="hidden-xs">Hidden on extra small</div>
<div class="hidden-sm">Hidden on small</div>
<div class="hidden-md">Hidden on medium</div>
<div class="hidden-lg">Hidden on large</div>

<!-- Opacity -->
<div class="opacity-50">50% opacity</div>
<div class="opacity-75">75% opacity</div>
<div class="opacity-100">100% opacity</div>
```

### Spacing Utilities

```html
<!-- Margin -->
<div class="m-0">No margin</div>
<div class="m-1">0.25rem margin</div>
<div class="m-2">0.5rem margin</div>
<div class="m-3">1rem margin</div>

<!-- Padding -->
<div class="p-0">No padding</div>
<div class="p-1">0.25rem padding</div>
<div class="p-2">0.5rem padding</div>
<div class="p-3">1rem padding</div>

<!-- Directional spacing -->
<div class="mt-2">Top margin</div>
<div class="mb-3">Bottom margin</div>
<div class="ml-2">Left margin</div>
<div class="mr-3">Right margin</div>
<div class="mx-2">Left/Right margin</div>
<div class="my-3">Top/Bottom margin</div>

<div class="pt-2">Top padding</div>
<div class="pb-3">Bottom padding</div>
<div class="pl-2">Left padding</div>
<div class="pr-3">Right padding</div>
<div class="px-2">Left/Right padding</div>
<div class="py-3">Top/Bottom padding</div>
```

### Sizing Utilities

```html
<!-- Width -->
<div class="w-25">25% width</div>
<div class="w-50">50% width</div>
<div class="w-75">75% width</div>
<div class="w-100">100% width</div>
<div class="mw-100">Max 100% width</div>

<!-- Height -->
<div class="h-25">25% height</div>
<div class="h-50">50% height</div>
<div class="h-100">100% height</div>
<div class="mh-100">Max 100% height</div>
```

### Flexbox Utilities

```html
<div class="d-flex justify-content-start">Left align</div>
<div class="d-flex justify-content-center">Center align</div>
<div class="d-flex justify-content-end">Right align</div>
<div class="d-flex justify-content-between">Space between</div>
<div class="d-flex justify-content-around">Space around</div>

<div class="d-flex align-items-start">Top align</div>
<div class="d-flex align-items-center">Center vertical</div>
<div class="d-flex align-items-end">Bottom align</div>

<div class="d-flex flex-wrap">Wrap items</div>
<div class="d-flex flex-column">Column layout</div>
<div class="d-flex flex-column-reverse">Reverse column</div>
```

### Utility CSS Classes

```scss
// Display
.d-none, .d-inline, .d-inline-block, .d-block, .d-flex, .d-grid

// Visibility
.visible-xs, .hidden-xs, .hidden-sm, .hidden-md, .hidden-lg

// Spacing (Margin/Padding)
.m-0, .m-1, .m-2, .m-3, .mt-*, .mb-*, .ml-*, .mr-*, .mx-*, .my-*
.p-0, .p-1, .p-2, .p-3, .pt-*, .pb-*, .pl-*, .pr-*, .px-*, .py-*

// Sizing
.w-25, .w-50, .w-75, .w-100, .mw-100
.h-25, .h-50, .h-100, .mh-100

// Flexbox
.d-flex, .flex-wrap, .flex-column, .flex-column-reverse
.justify-content-start, .justify-content-center, .justify-content-end
.justify-content-between, .justify-content-around
.align-items-start, .align-items-center, .align-items-end

// Opacity
.opacity-50, .opacity-75, .opacity-100
```

---

## 📋 Form Components

### Form Structure

```html
<form class="form-horizontal">
  <!-- Form Group -->
  <div class="form-group">
    <label for="input1" class="form-label">Input Label</label>
    <input type="text" class="form-control" id="input1" placeholder="Placeholder">
    <small class="form-text text-muted">Help text</small>
  </div>
  
  <!-- Textarea -->
  <div class="form-group">
    <label for="textarea1" class="form-label">Textarea</label>
    <textarea class="form-control" id="textarea1" rows="4"></textarea>
  </div>
  
  <!-- Select Dropdown -->
  <div class="form-group">
    <label for="select1" class="form-label">Select</label>
    <select class="form-control" id="select1">
      <option>Choose option</option>
      <option>Option 1</option>
      <option>Option 2</option>
    </select>
  </div>
  
  <!-- Checkbox -->
  <div class="form-check">
    <input type="checkbox" class="form-check-input" id="check1">
    <label class="form-check-label" for="check1">
      Checkbox option
    </label>
  </div>
  
  <!-- Radio -->
  <div class="form-check">
    <input type="radio" class="form-check-input" id="radio1" name="radio">
    <label class="form-check-label" for="radio1">
      Radio option
    </label>
  </div>
</form>
```

### Form States

```html
<!-- Valid state -->
<input type="text" class="form-control is-valid">

<!-- Invalid state -->
<input type="text" class="form-control is-invalid">

<!-- Disabled state -->
<input type="text" class="form-control" disabled>

<!-- Readonly state -->
<input type="text" class="form-control" readonly>

<!-- Focus state (automatic on interaction) -->
<input type="text" class="form-control">
```

### Form CSS Classes

```scss
.form-horizontal      // Horizontal form layout
.form-group           // Form field wrapper
.form-label           // Form label
.form-control         // Input field styling
.form-control-lg      // Large input
.form-control-sm      // Small input
.form-text            // Help text
.text-muted           // Muted text color
.form-check           // Checkbox/radio wrapper
.form-check-input     // Checkbox/radio input
.form-check-label     // Checkbox/radio label
.is-valid             // Valid state styling
.is-invalid           // Invalid state styling
.invalid-feedback     // Error message
.was-validated        // Form has been validated
```

---

## 🔘 Button & Badge Components

### Button Types

```html
<!-- Primary Button -->
<button class="btn btn-primary">Primary Button</button>

<!-- Secondary Button -->
<button class="btn btn-secondary">Secondary Button</button>

<!-- Success Button -->
<button class="btn btn-success">Success Button</button>

<!-- Danger Button -->
<button class="btn btn-danger">Danger Button</button>

<!-- Warning Button -->
<button class="btn btn-warning">Warning Button</button>

<!-- Info Button -->
<button class="btn btn-info">Info Button</button>

<!-- Light Button -->
<button class="btn btn-light">Light Button</button>

<!-- Dark Button -->
<button class="btn btn-dark">Dark Button</button>

<!-- Link Button -->
<button class="btn btn-link">Link Button</button>

<!-- Outline Buttons -->
<button class="btn btn-outline-primary">Outline Primary</button>
<button class="btn btn-outline-danger">Outline Danger</button>
```

### Button Sizes

```html
<button class="btn btn-primary btn-lg">Large Button</button>
<button class="btn btn-primary">Normal Button</button>
<button class="btn btn-primary btn-sm">Small Button</button>
<button class="btn btn-primary btn-xs">Extra Small Button</button>
```

### Button States

```html
<!-- Disabled -->
<button class="btn btn-primary" disabled>Disabled Button</button>

<!-- Active/Loading -->
<button class="btn btn-primary active">Active Button</button>

<!-- With icon -->
<button class="btn btn-primary">
  <i class="fa fa-download"></i> Download
</button>

<!-- Icon only -->
<button class="btn btn-primary btn-icon-only">
  <i class="fa fa-edit"></i>
</button>
```

### Badge Components

```html
<!-- Badges -->
<span class="badge badge-primary">Primary</span>
<span class="badge badge-success">Success</span>
<span class="badge badge-danger">Danger</span>
<span class="badge badge-warning">Warning</span>
<span class="badge badge-info">Info</span>

<!-- Pill badges -->
<span class="badge badge-primary badge-pill">Primary</span>

<!-- Large badges -->
<span class="badge badge-primary badge-lg">Large</span>
```

### Button & Badge CSS Classes

```scss
.btn                      // Button base
.btn-primary              // Primary style
.btn-secondary            // Secondary style
.btn-success              // Success style
.btn-danger               // Danger style
.btn-warning              // Warning style
.btn-info                 // Info style
.btn-light                // Light style
.btn-dark                 // Dark style
.btn-link                 // Link style
.btn-outline-*            // Outline variant
.btn-lg, .btn-sm, .btn-xs // Size variants
.btn-block                // Full width
.btn-icon-only            // Icon button
.badge                    // Badge base
.badge-primary            // Primary badge
.badge-pill               // Pill style
.badge-lg                 // Large badge
.active                   // Active state
```

---

## 🎴 Card & Container Components

### Card Structure

```html
<div class="card">
  <div class="card-header">
    <h4 class="card-title">Card Title</h4>
  </div>
  <div class="card-body">
    <!-- Card content goes here -->
    <p>Card content with any HTML</p>
  </div>
  <div class="card-footer">
    <button class="btn btn-primary">Action</button>
  </div>
</div>
```

### Card Variants

```html
<!-- Plain Card -->
<div class="card card-plain">
  <!-- Card content -->
</div>

<!-- Shadow Card -->
<div class="card card-shadow">
  <!-- Card content -->
</div>

<!-- Colored Header -->
<div class="card">
  <div class="card-header bg-primary text-white">
    <h4 class="card-title">Title</h4>
  </div>
  <div class="card-body">
    <!-- Content -->
  </div>
</div>

<!-- Card with Image -->
<div class="card card-img-overlay">
  <img src="image.jpg" class="card-img" alt="Card image">
  <div class="card-body">
    <!-- Content over image -->
  </div>
</div>

<!-- Horizontal Card -->
<div class="card card-horizontal">
  <div class="card-image">
    <img src="image.jpg" alt="Image">
  </div>
  <div class="card-body">
    <!-- Content -->
  </div>
</div>
```

### Container Components

```html
<!-- Alert Box -->
<div class="alert alert-primary" role="alert">
  <i class="fa fa-info-circle"></i> Alert message
</div>

<!-- Well/Panel -->
<div class="well well-light">
  <!-- Content -->
</div>

<!-- Jumbotron -->
<div class="jumbotron jumbotron-fluid">
  <div class="container">
    <h1 class="display-4">Hello, world!</h1>
    <p class="lead">Subtext</p>
  </div>
</div>

<!-- Panel -->
<div class="panel panel-default">
  <div class="panel-heading">
    <h3 class="panel-title">Panel Title</h3>
  </div>
  <div class="panel-body">
    <!-- Content -->
  </div>
</div>
```

### Card & Container CSS Classes

```scss
.card                     // Card container
.card-header              // Card header section
.card-body                // Card body/content
.card-footer              // Card footer section
.card-title               // Card title
.card-plain               // Plain variant
.card-shadow              // Shadow variant
.card-horizontal          // Horizontal layout
.card-img-overlay         // Image overlay
.alert                    // Alert box
.alert-primary            // Alert color variant
.well                     // Well container
.well-light               // Light well
.jumbotron                // Jumbotron section
.panel                    // Panel container
.panel-default            // Default panel
.panel-heading            // Panel header
.panel-body               // Panel content
.panel-footer             // Panel footer
.panel-title              // Panel title
```

---

## 🎯 Icon Usage

### Icon Libraries Available

```html
<!-- Font Awesome -->
<i class="fa fa-home"></i>
<i class="fa fa-user"></i>
<i class="fa fa-cog"></i>
<i class="fa fa-bell"></i>
<i class="fa fa-search"></i>

<!-- Material Design Icons -->
<i class="mdi mdi-home"></i>
<i class="mdi mdi-account"></i>
<i class="mdi mdi-cog"></i>

<!-- Simple Line Icons -->
<i class="icon-home"></i>
<i class="icon-user"></i>
<i class="icon-settings"></i>

<!-- Themify Icons -->
<i class="ti-home"></i>
<i class="ti-user"></i>
<i class="ti-settings"></i>

<!-- Typicons -->
<i class="typcn typcn-home"></i>
<i class="typcn typcn-user"></i>
```

### Icon Usage in Components

```html
<!-- In Buttons -->
<button class="btn btn-primary">
  <i class="fa fa-download"></i> Download
</button>

<!-- In Menu Items -->
<a class="nav-link" href="#">
  <i class="menu-icon fa fa-dashboard"></i>
  <span class="menu-title">Dashboard</span>
</a>

<!-- Icon Only -->
<button class="btn btn-sm btn-icon-only">
  <i class="fa fa-edit"></i>
</button>

<!-- With Size -->
<i class="fa fa-home fa-2x"></i>
<i class="fa fa-home fa-3x"></i>

<!-- Animated -->
<i class="fa fa-spinner fa-spin"></i>
<i class="fa fa-circle-o-notch fa-spin"></i>

<!-- Colors -->
<i class="fa fa-heart text-danger"></i>
<i class="fa fa-star text-warning"></i>
```

---

## 📱 Responsive Classes

### Breakpoints

```scss
xs (Extra Small): < 576px   // Mobile phones
sm (Small):       ≥ 576px   // Tablets
md (Medium):      ≥ 768px   // Small desktops
lg (Large):       ≥ 992px   // Desktops
xl (Extra Large): ≥ 1200px  // Large desktops
```

### Responsive Grid

```html
<div class="row">
  <!-- Full width on mobile, half on tablet, 1/3 on desktop -->
  <div class="col-12 col-sm-6 col-md-4">
    Content
  </div>
</div>
```

### Responsive Display

```html
<!-- Show only on large screens -->
<div class="d-none d-lg-block">Large screen only</div>

<!-- Show only on small screens -->
<div class="d-lg-none">Small screen only</div>

<!-- Hide on medium and down -->
<div class="d-md-none">Hidden on tablet and below</div>
```

### Responsive Padding/Margin

```html
<!-- Mobile: 0.5rem, Desktop: 1rem -->
<div class="p-2 p-md-3">
  Responsive padding
</div>
```

### Responsive Classes Reference

```scss
// Display responsive
.d-{breakpoint}-none
.d-{breakpoint}-inline
.d-{breakpoint}-inline-block
.d-{breakpoint}-block
.d-{breakpoint}-flex

// Sizing responsive
.w-{breakpoint}-100
.h-{breakpoint}-100

// Spacing responsive
.m{side}-{breakpoint}-{size}
.p{side}-{breakpoint}-{size}

// Text responsive
.text-{breakpoint}-left
.text-{breakpoint}-center
.text-{breakpoint}-right
```

---

## 🎨 Color Classes

### Text Colors

```html
<p class="text-primary">Primary text</p>
<p class="text-secondary">Secondary text</p>
<p class="text-success">Success text</p>
<p class="text-danger">Danger text</p>
<p class="text-warning">Warning text</p>
<p class="text-info">Info text</p>
<p class="text-light">Light text</p>
<p class="text-dark">Dark text</p>
<p class="text-muted">Muted text</p>
<p class="text-white">White text</p>
```

### Background Colors

```html
<div class="bg-primary">Primary background</div>
<div class="bg-success">Success background</div>
<div class="bg-danger">Danger background</div>
<div class="bg-warning">Warning background</div>
<div class="bg-info">Info background</div>
<div class="bg-light">Light background</div>
<div class="bg-dark">Dark background</div>
<div class="bg-white">White background</div>
```

---

## 🚀 Quick Reference

### Common Component Patterns

#### Data Table
```html
<table class="table table-striped table-hover">
  <thead class="table-header-bg">
    <tr>
      <th>Column 1</th>
      <th>Column 2</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Data</td>
      <td>Data</td>
    </tr>
  </tbody>
</table>
```

#### List Group
```html
<ul class="list-group">
  <li class="list-group-item">Item 1</li>
  <li class="list-group-item active">Item 2 (Active)</li>
  <li class="list-group-item">Item 3</li>
</ul>
```

#### Breadcrumb
```html
<nav aria-label="breadcrumb">
  <ol class="breadcrumb">
    <li class="breadcrumb-item"><a href="#">Home</a></li>
    <li class="breadcrumb-item active">Current Page</li>
  </ol>
</nav>
```

---

**Last Updated:** January 13, 2026  
**Status:** Complete Components Reference
