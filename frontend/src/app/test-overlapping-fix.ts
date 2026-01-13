/**
 * Test file to verify overlapping fixes are working
 * This file can be used to manually test the layout service and overlapping prevention
 */

import { LayoutService } from './core/services/layout.service';

export class OverlappingTestHelper {
  
  static testLayoutService(layoutService: LayoutService) {
    console.log('🧪 Testing Layout Service for Overlapping Prevention');
    
    // Test 1: Check if layout service is initialized
    const currentState = layoutService.getCurrentLayoutState();
    console.log('✅ Current Layout State:', currentState);
    
    // Test 2: Check z-index management
    const dashboardZIndex = layoutService.preventOverlapping('dashboard');
    const headerZIndex = layoutService.preventOverlapping('header');
    const contentZIndex = layoutService.preventOverlapping('content');
    
    console.log('✅ Z-Index Management:');
    console.log('  - Dashboard:', dashboardZIndex);
    console.log('  - Header:', headerZIndex);
    console.log('  - Content:', contentZIndex);
    
    // Test 3: Verify z-index hierarchy
    const isHierarchyCorrect = dashboardZIndex > headerZIndex && headerZIndex > contentZIndex;
    console.log('✅ Z-Index Hierarchy Correct:', isHierarchyCorrect);
    
    // Test 4: Test layout type detection
    console.log('✅ Layout Type Detection:');
    console.log('  - Is Dashboard Layout:', layoutService.isDashboardLayout());
    console.log('  - Is Auth Layout:', layoutService.isAuthLayout());
    console.log('  - Should Show Header:', layoutService.shouldShowHeader());
    console.log('  - Should Show Sidebar:', layoutService.shouldShowSidebar());
    
    return {
      layoutServiceWorking: true,
      zIndexHierarchyCorrect: isHierarchyCorrect,
      currentState
    };
  }
  
  static testOverlappingPrevention() {
    console.log('🧪 Testing CSS Overlapping Prevention');
    
    // Check if CSS variables are defined
    const rootStyles = getComputedStyle(document.documentElement);
    const zDashboard = rootStyles.getPropertyValue('--z-dashboard');
    const zHeader = rootStyles.getPropertyValue('--z-header');
    const zContent = rootStyles.getPropertyValue('--z-content');
    
    console.log('✅ CSS Z-Index Variables:');
    console.log('  - Dashboard:', zDashboard);
    console.log('  - Header:', zHeader);
    console.log('  - Content:', zContent);
    
    return {
      cssVariablesLoaded: !!(zDashboard && zHeader && zContent),
      zIndexValues: { zDashboard, zHeader, zContent }
    };
  }
  
  static runAllTests(layoutService?: LayoutService) {
    console.log('🚀 Running All Overlapping Prevention Tests');
    console.log('=' .repeat(50));
    
    const results: any = {
      timestamp: new Date().toISOString(),
      tests: {}
    };
    
    // Test CSS overlapping prevention
    results.tests.cssOverlapping = this.testOverlappingPrevention();
    
    // Test layout service if provided
    if (layoutService) {
      results.tests.layoutService = this.testLayoutService(layoutService);
    }
    
    // Test DOM elements for overlapping
    results.tests.domElements = this.testDOMElements();
    
    console.log('📊 Test Results Summary:');
    console.log(results);
    console.log('=' .repeat(50));
    
    return results;
  }
  
  static testDOMElements() {
    console.log('🧪 Testing DOM Elements for Overlapping');
    
    const elements = {
      header: document.querySelector('app-admin-header'),
      dashboard: document.querySelector('app-dashboard'),
      unifiedDashboard: document.querySelector('.unified-dashboard'),
      mainContent: document.querySelector('.main-content'),
      mobileLayout: document.querySelector('.mobile-layout')
    };
    
    const elementInfo: any = {};
    
    Object.entries(elements).forEach(([name, element]) => {
      if (element) {
        const styles = getComputedStyle(element);
        elementInfo[name] = {
          exists: true,
          zIndex: styles.zIndex,
          position: styles.position,
          display: styles.display
        };
      } else {
        elementInfo[name] = { exists: false };
      }
    });
    
    console.log('✅ DOM Elements Info:', elementInfo);
    
    return elementInfo;
  }
  
  static addDebugOverlay() {
    console.log('🔍 Adding Debug Overlay for Visual Testing');
    
    // Add debug styles to visualize z-index layers
    const debugStyle = document.createElement('style');
    debugStyle.innerHTML = `
      .debug-z-index-overlay {
        position: fixed !important;
        top: 10px !important;
        right: 10px !important;
        background: rgba(0, 0, 0, 0.8) !important;
        color: white !important;
        padding: 10px !important;
        border-radius: 5px !important;
        font-family: monospace !important;
        font-size: 12px !important;
        z-index: 9999 !important;
        max-width: 300px !important;
      }
      
      .debug-highlight {
        border: 2px solid red !important;
        box-shadow: 0 0 10px rgba(255, 0, 0, 0.5) !important;
      }
    `;
    document.head.appendChild(debugStyle);
    
    // Create debug overlay
    const overlay = document.createElement('div');
    overlay.className = 'debug-z-index-overlay';
    overlay.innerHTML = `
      <strong>🔍 Overlapping Debug</strong><br>
      <small>Check console for detailed results</small><br>
      <button onclick="OverlappingTestHelper.runAllTests()">Run Tests</button>
    `;
    document.body.appendChild(overlay);
    
    return overlay;
  }
}

// Make it globally available for testing
(window as any).OverlappingTestHelper = OverlappingTestHelper;

console.log('🧪 Overlapping Test Helper Loaded');
console.log('Use OverlappingTestHelper.runAllTests() to test overlapping prevention');
