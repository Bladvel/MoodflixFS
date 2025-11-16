/**
 * Quick Console Test for Language Persistence
 * 
 * Run this in browser console for immediate verification
 * 
 * Usage:
 * 1. Open DevTools Console (F12)
 * 2. Paste this code
 * 3. Press Enter
 */

console.clear();
console.log('%c🧪 Quick Language Persistence Test', 'font-size: 20px; font-weight: bold; color: #4CAF50');
console.log('='.repeat(60));

// Test 1: Check LocalStorage
console.log('\n%c📦 Test 1: LocalStorage', 'font-weight: bold; color: #2196F3');
const lang = localStorage.getItem('moodflix-language');
const token = localStorage.getItem('moodflix-token');
const carrito = localStorage.getItem('moodflix-carrito');

console.log('✓ Language:', lang || '❌ NOT SET');
console.log('✓ Auth Token:', token ? '✅ Present' : '⚠️  Not logged in');
console.log('✓ Carrito:', carrito ? `✅ Present (${JSON.parse(carrito).length} items)` : '⚠️  Empty');

// Test 2: Check UI Elements
console.log('\n%c👁️  Test 2: UI Elements', 'font-weight: bold; color: #2196F3');
const esBtn = document.querySelector('[aria-label*="Español"]');
const enBtn = document.querySelector('[aria-label*="English"]');

console.log('✓ Spanish Button:', esBtn ? '✅ Found' : '❌ Missing');
console.log('✓ English Button:', enBtn ? '✅ Found' : '❌ Missing');

if (esBtn && enBtn) {
  const esActive = esBtn.className.includes('bg-white');
  const enActive = enBtn.className.includes('bg-white');
  console.log('✓ Active Language:', esActive ? '🇪🇸 Spanish' : enActive ? '🇺🇸 English' : '❌ None');
}

// Test 3: Quick Functionality Test
console.log('\n%c🔄 Test 3: Functionality', 'font-weight: bold; color: #2196F3');
console.log('Run this command to test language switching:');
console.log('%ctestSwitch()', 'background: #f0f0f0; padding: 5px; border-radius: 3px; font-family: monospace');

window.testSwitch = function() {
  const before = {
    lang: localStorage.getItem('moodflix-language'),
    path: window.location.pathname,
    token: localStorage.getItem('moodflix-token'),
    carrito: localStorage.getItem('moodflix-carrito')
  };
  
  console.log('\n%c⏳ Switching language...', 'color: #FF9800');
  
  const targetBtn = before.lang === 'es' ? enBtn : esBtn;
  if (targetBtn) {
    targetBtn.click();
    
    setTimeout(() => {
      const after = {
        lang: localStorage.getItem('moodflix-language'),
        path: window.location.pathname,
        token: localStorage.getItem('moodflix-token'),
        carrito: localStorage.getItem('moodflix-carrito')
      };
      
      console.log('\n%c📊 Results:', 'font-weight: bold; color: #4CAF50');
      console.log('Language:', before.lang, '→', after.lang, after.lang !== before.lang ? '✅' : '❌');
      console.log('Path:', before.path === after.path ? '✅ Preserved' : '❌ Changed');
      console.log('Token:', before.token === after.token ? '✅ Preserved' : '❌ Changed');
      console.log('Carrito:', before.carrito === after.carrito ? '✅ Preserved' : '❌ Changed');
      
      if (after.lang !== before.lang && before.path === after.path && before.token === after.token) {
        console.log('\n%c✅ All checks passed!', 'font-size: 16px; color: #4CAF50; font-weight: bold');
      } else {
        console.log('\n%c⚠️  Some checks failed', 'font-size: 16px; color: #FF5722; font-weight: bold');
      }
    }, 300);
  } else {
    console.log('%c❌ Could not find language button', 'color: #FF5722');
  }
};

// Summary
console.log('\n' + '='.repeat(60));
console.log('%c📋 Quick Summary', 'font-weight: bold; color: #9C27B0');
console.log('Current Language:', lang || 'Not set');
console.log('Current Page:', window.location.pathname);
console.log('Logged In:', token ? 'Yes' : 'No');
console.log('\n💡 Run testSwitch() to test language switching');
console.log('='.repeat(60));
