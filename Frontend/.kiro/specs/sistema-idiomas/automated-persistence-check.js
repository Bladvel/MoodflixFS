/**
 * Automated Persistence and UX Verification Script
 * 
 * This script can be run in the browser console to verify:
 * - LocalStorage persistence
 * - Language context functionality
 * - No interference with other systems
 * 
 * Usage:
 * 1. Open browser DevTools (F12)
 * 2. Copy and paste this entire script into the Console
 * 3. Press Enter to run
 * 4. Review the results
 */

(function() {
  console.log('🔍 Starting Automated Persistence & UX Verification...\n');
  
  const results = {
    passed: 0,
    failed: 0,
    warnings: 0,
    tests: []
  };

  function logTest(name, passed, message) {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status}: ${name}`);
    if (message) console.log(`   ${message}`);
    
    results.tests.push({ name, passed, message });
    if (passed) results.passed++;
    else results.failed++;
  }

  function logWarning(name, message) {
    console.log(`⚠️  WARNING: ${name}`);
    if (message) console.log(`   ${message}`);
    results.warnings++;
  }

  // ============================================
  // Test 1: LocalStorage Key Exists
  // ============================================
  console.log('\n📦 Test 1: LocalStorage Persistence');
  const languageKey = localStorage.getItem('moodflix-language');
  logTest(
    'Language key exists in LocalStorage',
    languageKey !== null,
    languageKey ? `Current value: ${languageKey}` : 'Key not found'
  );

  logTest(
    'Language value is valid',
    languageKey === 'es' || languageKey === 'en',
    `Value: ${languageKey}`
  );

  // ============================================
  // Test 2: Other LocalStorage Keys Intact
  // ============================================
  console.log('\n🔐 Test 2: Other Systems Not Affected');
  
  const authToken = localStorage.getItem('moodflix-token');
  const carrito = localStorage.getItem('moodflix-carrito');
  
  logTest(
    'Auth token key exists (if logged in)',
    authToken !== null || window.location.pathname === '/login' || window.location.pathname === '/register',
    authToken ? 'Token present' : 'Not logged in or token missing'
  );

  if (carrito) {
    try {
      const carritoData = JSON.parse(carrito);
      logTest(
        'Carrito data is valid JSON',
        Array.isArray(carritoData),
        `Items in cart: ${carritoData.length}`
      );
    } catch (e) {
      logTest('Carrito data is valid JSON', false, 'Invalid JSON in carrito');
    }
  } else {
    logWarning('Carrito empty', 'Add items to cart to test persistence');
  }

  // ============================================
  // Test 3: Language Selector Visible
  // ============================================
  console.log('\n👁️  Test 3: UI Components Present');
  
  const languageSelectors = document.querySelectorAll('[aria-label*="Cambiar"], [aria-label*="Change"]');
  logTest(
    'Language selector buttons found',
    languageSelectors.length >= 2,
    `Found ${languageSelectors.length} language buttons`
  );

  // Check for Spanish button
  const esButton = Array.from(languageSelectors).find(btn => 
    btn.getAttribute('aria-label')?.includes('Español') || 
    btn.textContent?.includes('🇪🇸')
  );
  logTest(
    'Spanish language button exists',
    !!esButton,
    esButton ? 'ES button found' : 'ES button not found'
  );

  // Check for English button
  const enButton = Array.from(languageSelectors).find(btn => 
    btn.getAttribute('aria-label')?.includes('English') || 
    btn.textContent?.includes('🇺🇸')
  );
  logTest(
    'English language button exists',
    !!enButton,
    enButton ? 'EN button found' : 'EN button not found'
  );

  // ============================================
  // Test 4: Active Language Indication
  // ============================================
  console.log('\n🎨 Test 4: Visual Feedback');
  
  if (esButton && enButton) {
    const esClasses = esButton.className;
    const enClasses = enButton.className;
    
    const esActive = esClasses.includes('bg-white');
    const enActive = enClasses.includes('bg-white');
    
    logTest(
      'One language button is visually active',
      (esActive && !enActive) || (!esActive && enActive),
      `ES active: ${esActive}, EN active: ${enActive}`
    );

    const activeMatchesStorage = 
      (languageKey === 'es' && esActive) || 
      (languageKey === 'en' && enActive);
    
    logTest(
      'Active button matches LocalStorage',
      activeMatchesStorage,
      `Storage: ${languageKey}, Visual: ${esActive ? 'es' : 'en'}`
    );
  }

  // ============================================
  // Test 5: Translation Files Loaded
  // ============================================
  console.log('\n📚 Test 5: Translation System');
  
  // Check if translation files are accessible
  fetch('/src/locales/es.json')
    .then(res => res.ok)
    .then(ok => {
      logTest('Spanish translations file accessible', ok, 'es.json found');
    })
    .catch(() => {
      logTest('Spanish translations file accessible', false, 'es.json not found');
    });

  fetch('/src/locales/en.json')
    .then(res => res.ok)
    .then(ok => {
      logTest('English translations file accessible', ok, 'en.json found');
    })
    .catch(() => {
      logTest('English translations file accessible', false, 'en.json not found');
    });

  // ============================================
  // Test 6: No Console Errors
  // ============================================
  console.log('\n🐛 Test 6: Error Detection');
  
  // This is a manual check - user should verify no errors in console
  logWarning(
    'Manual check required',
    'Verify no errors in console when changing language'
  );

  // ============================================
  // Test 7: Responsive Design
  // ============================================
  console.log('\n📱 Test 7: Responsive Behavior');
  
  const isMobile = window.innerWidth < 640; // sm breakpoint
  const textElements = document.querySelectorAll('.hidden.sm\\:inline');
  
  logTest(
    'Responsive classes applied',
    textElements.length >= 2,
    `Found ${textElements.length} responsive text elements`
  );

  if (isMobile) {
    logWarning(
      'Mobile view detected',
      'Language text (ES/EN) should be hidden, only flags visible'
    );
  } else {
    logWarning(
      'Desktop view detected',
      'Language text (ES/EN) should be visible with flags'
    );
  }

  // ============================================
  // Test 8: Current Route Preserved
  // ============================================
  console.log('\n🧭 Test 8: Navigation Stability');
  
  const currentPath = window.location.pathname;
  logTest(
    'Current route is valid',
    currentPath.length > 0,
    `Current path: ${currentPath}`
  );

  logWarning(
    'Manual check required',
    'Change language and verify URL stays the same'
  );

  // ============================================
  // Interactive Test Function
  // ============================================
  console.log('\n🧪 Interactive Test Available');
  console.log('Run: testLanguageChange() to test language switching');
  
  window.testLanguageChange = function() {
    console.log('\n🔄 Testing Language Change...');
    
    const beforeLang = localStorage.getItem('moodflix-language');
    const beforePath = window.location.pathname;
    const beforeToken = localStorage.getItem('moodflix-token');
    const beforeCarrito = localStorage.getItem('moodflix-carrito');
    
    console.log('Before:', { beforeLang, beforePath, hasToken: !!beforeToken, hasCarrito: !!beforeCarrito });
    
    // Simulate language change
    const targetLang = beforeLang === 'es' ? 'en' : 'es';
    const targetButton = targetLang === 'es' ? esButton : enButton;
    
    if (targetButton) {
      targetButton.click();
      
      setTimeout(() => {
        const afterLang = localStorage.getItem('moodflix-language');
        const afterPath = window.location.pathname;
        const afterToken = localStorage.getItem('moodflix-token');
        const afterCarrito = localStorage.getItem('moodflix-carrito');
        
        console.log('After:', { afterLang, afterPath, hasToken: !!afterToken, hasCarrito: !!afterCarrito });
        
        console.log('\n📊 Change Results:');
        logTest('Language changed', afterLang === targetLang, `${beforeLang} → ${afterLang}`);
        logTest('Path preserved', beforePath === afterPath, `Path: ${afterPath}`);
        logTest('Auth token preserved', beforeToken === afterToken, 'Token unchanged');
        logTest('Carrito preserved', beforeCarrito === afterCarrito, 'Cart unchanged');
        
        console.log('\n✅ Interactive test complete!');
      }, 500);
    } else {
      console.log('❌ Could not find language button to click');
    }
  };

  // ============================================
  // Summary
  // ============================================
  setTimeout(() => {
    console.log('\n' + '='.repeat(50));
    console.log('📊 VERIFICATION SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`⚠️  Warnings: ${results.warnings}`);
    console.log(`📝 Total Tests: ${results.tests.length}`);
    
    const passRate = ((results.passed / results.tests.length) * 100).toFixed(1);
    console.log(`\n📈 Pass Rate: ${passRate}%`);
    
    if (results.failed === 0) {
      console.log('\n🎉 All automated tests passed!');
      console.log('💡 Run testLanguageChange() for interactive verification');
    } else {
      console.log('\n⚠️  Some tests failed. Review the results above.');
    }
    
    console.log('\n📋 Manual Tests Still Required:');
    console.log('   1. Change language and reload page');
    console.log('   2. Logout and login with different language');
    console.log('   3. Add items to cart, change language, verify cart intact');
    console.log('   4. Test with different user roles (Admin, Webmaster, Cliente)');
    console.log('   5. Test rapid language switching');
    
    console.log('\n' + '='.repeat(50));
  }, 1000);

})();
