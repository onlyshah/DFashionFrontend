# JavaScript Modules Reference Guide

Complete documentation for JavaScript utilities and helper files in the admin theme.

## 📚 Table of Contents

1. [Core/Template Files](#core--template-files)
2. [Chart Libraries](#chart-libraries)
3. [Table & Data Management](#table--data-management)
4. [Form Utilities](#form-utilities)
5. [Editors](#editors)
6. [Maps](#maps)
7. [UI Components](#ui-components)
8. [File Management](#file-management)
9. [Other Utilities](#other-utilities)
10. [Loading & Organization](#loading--organization)

---

## 🎯 Core & Template Files

### Essential Files

#### `template.js`
**Purpose:** Main template initialization and core functionality  
**Dependencies:** jQuery, Bootstrap  
**Usage:**
```html
<script src="assets/js/template.js"></script>
```
**What it does:**
- Initializes main template layout
- Sets up sidebar behavior
- Configures navbar interactions
- Handles theme switching
- Manages responsive behavior

#### `demo.js`
**Purpose:** Demo-specific functionality and examples  
**Dependencies:** Various plugins  
**Usage:**
```html
<script src="assets/js/demo.js"></script>
```
**What it does:**
- Provides demo functionality
- Sets up sample data
- Initializes example components
- Note: Remove or disable in production

#### `settings.js`
**Purpose:** User settings and preferences panel  
**Dependencies:** jQuery  
**Usage:**
```html
<script src="assets/js/settings.js"></script>
```
**What it does:**
- Manages settings panel
- Saves user preferences
- Handles theme switching
- Stores local settings

#### `template.js` Initialization Example
```html
<script>
// Template initialized on document ready
$(document).ready(function() {
  // Template features available here
  // Sidebar toggle, navbar menu, etc.
});
</script>
```

---

## 📊 Chart Libraries

### Chart.js - Bar, Line, Pie, Doughnut Charts

**File:** `chart.js`  
**Library:** Chart.js 2.x/3.x  
**Documentation:** https://www.chartjs.org/

**Usage:**
```html
<!-- Include library -->
<script src="assets/vendors/chart.js/chart.min.js"></script>
<!-- Include initialization -->
<script src="assets/js/chart.js"></script>

<!-- HTML -->
<canvas id="myChart"></canvas>

<!-- JavaScript -->
<script>
var ctx = document.getElementById('myChart').getContext('2d');
var myChart = new Chart(ctx, {
  type: 'bar',
  data: {
    labels: ['Jan', 'Feb', 'Mar'],
    datasets: [{
      label: 'Sales',
      data: [12, 19, 3],
      backgroundColor: '#007bff'
    }]
  }
});
</script>
```

### Flot Chart - Interactive Charts

**File:** `flot-chart.js`  
**Library:** Flot Charts  
**Features:** Interactive tooltips, zooming

**Usage:**
```html
<script src="assets/js/flot-chart.js"></script>
```

### Morris.js - SVG Charts

**File:** `morris.js`  
**Library:** Morris.js  
**Features:** Line, bar, area, donut charts

**Usage:**
```html
<script src="assets/js/morris.js"></script>
```

### Google Charts

**File:** `google-charts.js`  
**Library:** Google Charts API  
**Features:** Extensive chart types, animations

**Usage:**
```html
<script src="assets/js/google-charts.js"></script>
```

### Just-Gage - Gauge Charts

**File:** `just-gage.js`  
**Purpose:** Gauge/meter style charts

### Rickshaw - Time Series Charts

**File:** `rickshaw.js`  
**Purpose:** Interactive time series visualization

### Sparkline - Mini Charts

**File:** `sparkline.js`  
**Purpose:** Small inline charts for summaries

### Chartist - Responsive Charts

**File:** `chartist.js`  
**Purpose:** Responsive, animated charts

### Circle Progress - Circular Progress

**File:** `circle-progress.js`  
**Purpose:** Circular progress indicators

---

## 📋 Table & Data Management

### Bootstrap Table - Data Tables

**File:** `bootstrap-table.js`  
**Features:** Sorting, filtering, pagination, export

**Usage:**
```html
<!-- Include Bootstrap Table CSS/JS -->
<script src="assets/vendors/bootstrap-table/bootstrap-table.js"></script>
<script src="assets/js/bootstrap-table.js"></script>

<!-- HTML -->
<table data-toggle="table" data-pagination="true" data-search="true">
  <thead>
    <tr>
      <th data-field="id">ID</th>
      <th data-field="name">Name</th>
    </tr>
  </thead>
</table>
```

### Data Tables - Advanced Tables

**File:** `data-table.js`  
**Features:** Sorting, filtering, pagination, responsive

**Usage:**
```html
<script src="assets/js/data-table.js"></script>

<table id="dataTable" class="table">
  <!-- Table content -->
</table>

<script>
$('#dataTable').DataTable({
  pageLength: 10,
  responsive: true,
  order: [[0, 'asc']]
});
</script>
```

### TableSorter - Table Sorting

**File:** `tablesorter.js`  
**Purpose:** Simple column sorting

### JQ TableSort - Lightweight Sorting

**File:** `jq.tablesort.js`  
**Purpose:** jQuery-based table sorting

### JS-Grid - Interactive Grid

**File:** `js-grid.js`  
**Features:** CRUD operations, sorting, filtering

### Paginate - Pagination

**File:** `paginate.js`  
**Purpose:** Pagination controls and management

### Listify - List View

**File:** `listify.js`  
**Purpose:** Convert tables to list views

---

## 📝 Form Utilities

### Form Validation

**File:** `form-validation.js`  
**Library:** HTML5/jQuery Validation  

**Usage:**
```html
<script src="assets/js/form-validation.js"></script>

<form id="myForm" class="needs-validation">
  <input type="email" required>
</form>

<script>
// Validation runs automatically on form submit
$('#myForm').submit(function() {
  if (!this.checkValidity()) {
    event.preventDefault();
    event.stopPropagation();
  }
});
</script>
```

### Form Repeater - Dynamic Form Fields

**File:** `form-repeater.js`  
**Purpose:** Add/remove form fields dynamically

**Usage:**
```html
<script src="assets/js/form-repeater.js"></script>

<div class="repeater">
  <div class="repeater-item">
    <input type="text" name="item[]">
    <button class="repeater-remove">Remove</button>
  </div>
</div>
<button class="repeater-add">Add Item</button>
```

### Form Add-ons - Input Enhancements

**File:** `form-addons.js`  
**Purpose:** Input groups, prepended/appended content

### Form Pickers - Date/Time Selection

**File:** `formpickers.js`  
**Includes:** Date picker, time picker, color picker

**Usage:**
```html
<script src="assets/js/formpickers.js"></script>

<!-- Date picker -->
<input type="text" class="datepicker">

<!-- Time picker -->
<input type="text" class="timepicker">

<!-- Color picker -->
<input type="text" class="colorpicker">
```

---

## ✏️ Editors

### Code Editor - Syntax Highlighting

**File:** `codeEditor.js`  
**Purpose:** Lightweight code editor

### CodeMirror - Advanced Editor

**File:** `codemirror.js`  
**Library:** CodeMirror  
**Features:** Syntax highlighting, autocompletion, themes

**Usage:**
```html
<script src="assets/vendors/codemirror/codemirror.js"></script>
<script src="assets/js/codemirror.js"></script>

<textarea id="editor"></textarea>

<script>
var editor = CodeMirror.fromTextArea(
  document.getElementById('editor'),
  { mode: 'javascript', theme: 'default' }
);
</script>
```

### Editor Demo

**File:** `editorDemo.js`  
**Purpose:** Editor examples and demonstrations

### Editor Demo Dark

**File:** `editorDemo-dark.js`  
**Purpose:** Dark theme editor examples

---

## 🗺️ Maps

### Google Maps

**File:** `google-maps.js`  
**Purpose:** Embed and initialize Google Maps  

**Usage:**
```html
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY"></script>
<script src="assets/js/google-maps.js"></script>

<div id="map" style="height: 400px;"></div>

<script>
var map = new google.maps.Map(document.getElementById('map'), {
  center: {lat: 40.7128, lng: -74.0060},
  zoom: 8
});
</script>
```

### Maps - Alternative Map Solution

**File:** `maps.js`  
**Purpose:** General map utilities

### Mapael - Interactive Vector Maps

**File:** `mapael.js`  
**Purpose:** Interactive world/country maps

### Mapael Examples

**Files:** `mapael_example_1.js`, `mapael_example_2.js`  
**Purpose:** Mapael implementation examples

---

## 🎨 UI Components

### Alerts - Notifications

**File:** `alerts.js`  
**Purpose:** Alert notifications and messages

**Usage:**
```html
<script src="assets/js/alerts.js"></script>

<script>
// Show alert
alert('This is an alert!');

// Custom alert notification
showAlert('Success!', 'success');
showAlert('Error!', 'danger');
</script>
```

### Modal Demo - Modal Dialogs

**File:** `modal-demo.js`  
**Purpose:** Modal initialization and examples

### Popover - Popover Tooltips

**File:** `popover.js`  
**Purpose:** Popover functionality

**Usage:**
```html
<script src="assets/js/popover.js"></script>

<button class="btn" data-toggle="popover" title="Title" 
        data-content="Content">Popover</button>

<script>
$('[data-toggle="popover"]').popover();
</script>
```

### Tooltips - Tooltip Hints

**File:** `tooltips.js`  
**Purpose:** Tooltip functionality

**Usage:**
```html
<script src="assets/js/tooltips.js"></script>

<button class="btn" data-toggle="tooltip" title="Help text">
  Hover me
</button>

<script>
$('[data-toggle="tooltip"]').tooltip();
</script>
```

### Tabs - Tab Navigation

**File:** `tabs.js`  
**Purpose:** Tab switching functionality

**Usage:**
```html
<ul class="nav nav-tabs">
  <li><a href="#tab1" data-toggle="tab">Tab 1</a></li>
  <li><a href="#tab2" data-toggle="tab">Tab 2</a></li>
</ul>
<div class="tab-content">
  <div id="tab1" class="tab-pane">Content 1</div>
  <div id="tab2" class="tab-pane">Content 2</div>
</div>
```

### Progress Bar - Progress Indicators

**File:** `progress-bar.js`  
**Purpose:** Animated progress bars

### Tooltip Demo - Tooltip Examples

**File:** `toastDemo.js`  
**Purpose:** Toast notification examples

### Light Gallery - Image Gallery

**File:** `light-gallery.js`  
**Library:** Light Gallery  
**Features:** Lightbox, thumbnails, animations

**Usage:**
```html
<script src="assets/js/light-gallery.js"></script>

<div id="lightgallery">
  <a href="image1.jpg">
    <img src="thumb1.jpg">
  </a>
  <a href="image2.jpg">
    <img src="thumb2.jpg">
  </a>
</div>

<script>
$('#lightgallery').lightGallery();
</script>
```

### Owl Carousel - Image Slider

**File:** `owl-carousel.js`  
**Library:** Owl Carousel 2  
**Features:** Responsive carousel, autoplay, navigation

**Usage:**
```html
<script src="assets/js/owl-carousel.js"></script>

<div class="owl-carousel">
  <div class="item"><img src="image1.jpg"></div>
  <div class="item"><img src="image2.jpg"></div>
</div>

<script>
$('.owl-carousel').owlCarousel({
  loop: true,
  margin: 10,
  responsive: {
    0: { items: 1 },
    768: { items: 2 },
    1200: { items: 3 }
  }
});
</script>
```

### Context Menu - Right-Click Menu

**File:** `context-menu.js`  
**Purpose:** Custom context menu on right-click

### Avgrund - Modal Effect

**File:** `avgrund.js`  
**Purpose:** Depth effect for modals

---

## 📁 File Management

### Dropzone - Drag & Drop Upload

**File:** `dropzone.js`  
**Library:** Dropzone.js  
**Features:** Drag/drop file upload, previews

**Usage:**
```html
<script src="assets/js/dropzone.js"></script>

<form action="/upload" class="dropzone">
  <div class="fallback">
    <input type="file" multiple>
  </div>
</form>

<script>
Dropzone.options.dropzone = {
  maxFilesize: 2,
  acceptedFiles: 'image/*'
};
</script>
```

### Dropify - File Input Enhancement

**File:** `dropify.js`  
**Purpose:** Beautiful file input with preview

**Usage:**
```html
<script src="assets/js/dropify.js"></script>

<input type="file" class="dropify">

<script>
$('.dropify').dropify();
</script>
```

### File Upload - File Upload Handler

**File:** `file-upload.js`  
**Purpose:** General file upload functionality

### jQuery File Upload - Advanced Upload

**File:** `jquery-file-upload.js`  
**Library:** jQuery File Upload  
**Features:** Multiple upload, progress, validation

---

## 🔧 Other Utilities

### Select2 - Enhanced Dropdown

**File:** `select2.js`  
**Library:** Select2  
**Features:** Searchable dropdown, tagging, remote data

**Usage:**
```html
<script src="assets/js/select2.js"></script>

<select class="select2">
  <option>Option 1</option>
  <option>Option 2</option>
</select>

<script>
$('.select2').select2();
</script>
```

### Calendar - Date Picker Calendar

**File:** `calendar.js`  
**Purpose:** Calendar date selection

### Off-Canvas - Side Panel

**File:** `off-canvas.js`  
**Purpose:** Off-canvas sidebar menu

**Usage:**
```html
<button class="btn" data-toggle="offcanvas">
  Toggle Menu
</button>

<div class="offcanvas offcanvas-start">
  <!-- Menu content -->
</div>
```

### Hoverable Collapse - Hover Animation

**File:** `hoverable-collapse.js`  
**Purpose:** Collapse animation on hover

### Ion Range Slider - Range Input

**File:** `ion-range-slider.js`  
**Library:** Ion Range Slider  
**Features:** Dual range, labels, styling

### No UI Slider - Range Slider

**File:** `no-ui-slider.js`  
**Library:** noUiSlider  
**Features:** Touch-friendly range slider

### Todo List - Task Management

**File:** `todolist.js`  
**Purpose:** TODO list interface

### Clipboard - Copy to Clipboard

**File:** `clipboard.js`  
**Library:** Clipboard.js  
**Features:** Copy text to clipboard with feedback

**Usage:**
```html
<script src="assets/js/clipboard.js"></script>

<button class="btn" data-clipboard-text="Copy me!">
  Copy
</button>

<script>
new ClipboardJS('.btn');
</script>
```

### Desktop Notification - Browser Notifications

**File:** `desktop-notification.js`  
**Purpose:** Desktop/browser notifications

### Dragula - Drag & Drop

**File:** `dragula.js`  
**Library:** Dragula  
**Features:** Sortable lists, drag between containers

### Typeahead - Autocomplete

**File:** `typeahead.js`  
**Library:** Typeahead.js  
**Features:** Search suggestions, autocomplete

### Wizard - Multi-Step Form

**File:** `wizard.js`  
**Purpose:** Step-by-step form wizard

### Ace.js - ACE Code Editor

**File:** `ace.js`  
**Library:** Ace Editor  
**Features:** Full-featured code editor

### BT MaxLength - Text Limit

**File:** `bt-maxLength.js`  
**Purpose:** Character limit indicator

### Cookie Handling

**File:** `jquery.cookie.js`  
**Purpose:** Read/write browser cookies

**Usage:**
```html
<script src="assets/js/jquery.cookie.js"></script>

<script>
// Set cookie
$.cookie('name', 'value', { expires: 7 });

// Get cookie
var value = $.cookie('name');

// Delete cookie
$.removeCookie('name');
</script>
```

### Database - Mock Database

**File:** `db.js`  
**Purpose:** Sample data and mock database

### Profile Demo - Profile Examples

**File:** `profile-demo.js`  
**Purpose:** User profile page examples

---

## 📋 Loading & Organization

### Load Order (Recommended)

```html
<!-- jQuery (required first) -->
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>

<!-- Bootstrap JS -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/js/bootstrap.bundle.min.js"></script>

<!-- Vendor Libraries (as needed) -->
<script src="assets/vendors/chart.js/chart.min.js"></script>
<script src="assets/vendors/select2/select2.min.js"></script>

<!-- Template Core -->
<script src="assets/js/template.js"></script>

<!-- Component Initializers (as needed) -->
<script src="assets/js/chart.js"></script>
<script src="assets/js/select2.js"></script>
<script src="assets/js/tooltips.js"></script>

<!-- Settings -->
<script src="assets/js/settings.js"></script>

<!-- Demo (remove in production) -->
<!-- <script src="assets/js/demo.js"></script> -->
```

### Which Files to Load

**Always Load:**
- `template.js` - Core functionality
- `settings.js` - User preferences

**Load as Needed:**
- Chart files (chart.js, flot-chart.js, etc.) - Only if using charts
- Form utilities (form-validation.js, form-repeater.js) - If using forms
- Editor files (codemirror.js) - If using code editors
- UI component files (tooltips.js, popover.js) - For those components
- File upload (dropzone.js, dropify.js) - If allowing uploads
- Select2.js - If using enhanced select dropdowns

**Remove for Production:**
- `demo.js` - Demo functionality only

### Lazy Loading Example

```html
<script>
// Load chart library only when chart section is visible
$(document).ready(function() {
  if ($('#chartSection').length) {
    var script = document.createElement('script');
    script.src = 'assets/js/chart.js';
    document.body.appendChild(script);
  }
});
</script>
```

### Conditional Loading

```html
<script>
// Load features based on page requirements
$(document).ready(function() {
  // Check for data tables
  if ($('#dataTable').length) {
    loadScript('assets/js/data-table.js');
  }
  
  // Check for forms
  if ($('form[data-validate]').length) {
    loadScript('assets/js/form-validation.js');
  }
  
  // Check for maps
  if ($('#map').length) {
    loadScript('assets/js/google-maps.js');
  }
});

function loadScript(src) {
  var script = document.createElement('script');
  script.src = src;
  document.body.appendChild(script);
}
</script>
```

---

## 🎯 Common Use Cases

### Dashboard Page
```html
<script src="assets/js/template.js"></script>
<script src="assets/js/chart.js"></script>
<script src="assets/js/settings.js"></script>
<!-- Optional: Google Maps if needed -->
```

### Data Management Page
```html
<script src="assets/js/template.js"></script>
<script src="assets/js/data-table.js"></script>
<script src="assets/js/form-validation.js"></script>
<script src="assets/js/settings.js"></script>
```

### User Profile Page
```html
<script src="assets/js/template.js"></script>
<script src="assets/js/profile-demo.js"></script>
<script src="assets/js/light-gallery.js"></script>
<script src="assets/js/settings.js"></script>
```

### Form Page
```html
<script src="assets/js/template.js"></script>
<script src="assets/js/form-validation.js"></script>
<script src="assets/js/form-repeater.js"></script>
<script src="assets/js/formpickers.js"></script>
<script src="assets/js/select2.js"></script>
<script src="assets/js/settings.js"></script>
```

### Media Gallery Page
```html
<script src="assets/js/template.js"></script>
<script src="assets/js/light-gallery.js"></script>
<script src="assets/js/owl-carousel.js"></script>
<script src="assets/js/settings.js"></script>
```

---

## 📝 Notes

- Always include `template.js` as it provides core functionality
- Check plugin documentation for initialization options
- Test in multiple browsers for compatibility
- Remove `demo.js` before deploying to production
- Consider lazy loading for better performance
- Update vendor libraries regularly for security patches

---

**Last Updated:** January 13, 2026  
**Status:** Complete JavaScript Reference
