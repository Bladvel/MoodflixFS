/**
 * Automated Verification Script for i18n System
 * This script performs automated checks on the codebase to verify
 * that the internationalization system is properly implemented
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  checks: [],
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function check(name, condition, details = '') {
  const status = condition ? '✅ PASS' : '❌ FAIL';
  const color = condition ? 'green' : 'red';
  
  results.checks.push({ name, passed: condition, details });
  
  if (condition) {
    results.passed++;
  } else {
    results.failed++;
  }
  
  log(`${status}: ${name}`, color);
  if (details) {
    log(`  ${details}`, 'cyan');
  }
}

function warning(message) {
  results.warnings++;
  log(`⚠️  WARNING: ${message}`, 'yellow');
}

function section(title) {
  log(`\n${'='.repeat(60)}`, 'blue');
  log(title, 'blue');
  log('='.repeat(60), 'blue');
}

// Helper to check if file exists
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

// Helper to read file content
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return null;
  }
}

// Helper to check if file contains text
function fileContains(filePath, searchText) {
  const content = readFile(filePath);
  return content ? content.includes(searchText) : false;
}

// Helper to count occurrences
function countOccurrences(content, pattern) {
  const matches = content.match(pattern);
  return matches ? matches.length : 0;
}

// ============================================================================
// VERIFICATION CHECKS
// ============================================================================

section('1. Core Infrastructure Verification');

// Check translation files exist
check(
  'Spanish translations file exists',
  fileExists('src/locales/es.json'),
  'src/locales/es.json'
);

check(
  'English translations file exists',
  fileExists('src/locales/en.json'),
  'src/locales/en.json'
);

// Check LanguageContext exists
check(
  'LanguageContext implementation exists',
  fileExists('src/lib/language-context.tsx'),
  'src/lib/language-context.tsx'
);

// Check LanguageSelector exists
check(
  'LanguageSelector component exists',
  fileExists('src/components/LanguageSelector.tsx'),
  'src/components/LanguageSelector.tsx'
);

// Verify translation files have same structure
if (fileExists('src/locales/es.json') && fileExists('src/locales/en.json')) {
  const esContent = readFile('src/locales/es.json');
  const enContent = readFile('src/locales/en.json');
  
  if (esContent && enContent) {
    try {
      const esJson = JSON.parse(esContent);
      const enJson = JSON.parse(enContent);
      
      const esSections = Object.keys(esJson);
      const enSections = Object.keys(enJson);
      
      check(
        'Translation files have matching sections',
        JSON.stringify(esSections.sort()) === JSON.stringify(enSections.sort()),
        `ES sections: ${esSections.length}, EN sections: ${enSections.length}`
      );
      
      // Check for common sections
      const expectedSections = ['common', 'navbar', 'auth', 'products', 'cart', 'orders'];
      const hasAllSections = expectedSections.every(section => 
        esSections.includes(section) && enSections.includes(section)
      );
      
      check(
        'Translation files contain expected sections',
        hasAllSections,
        `Expected: ${expectedSections.join(', ')}`
      );
    } catch (e) {
      check('Translation files are valid JSON', false, e.message);
    }
  }
}

section('2. Context Integration Verification');

// Check App.tsx has LanguageProvider
const appContent = readFile('src/App.tsx');
if (appContent) {
  check(
    'App.tsx imports LanguageProvider',
    appContent.includes('import { LanguageProvider }') || appContent.includes('import {LanguageProvider}'),
    'LanguageProvider import found'
  );
  
  check(
    'App.tsx wraps application with LanguageProvider',
    appContent.includes('<LanguageProvider>'),
    'LanguageProvider wrapper found'
  );
  
  check(
    'LanguageProvider wraps BrowserRouter',
    appContent.indexOf('<LanguageProvider>') < appContent.indexOf('<BrowserRouter>'),
    'Correct provider hierarchy'
  );
}

// Check LanguageContext implementation
const contextContent = readFile('src/lib/language-context.tsx');
if (contextContent) {
  check(
    'LanguageContext exports useTranslation hook',
    contextContent.includes('export function useTranslation'),
    'useTranslation hook exported'
  );
  
  check(
    'LanguageContext has cambiarIdioma function',
    contextContent.includes('cambiarIdioma'),
    'Language change function present'
  );
  
  check(
    'LanguageContext has translation function (t)',
    contextContent.includes('const t = ') || contextContent.includes('function t('),
    'Translation function present'
  );
  
  check(
    'LanguageContext uses LocalStorage',
    contextContent.includes('localStorage'),
    'LocalStorage integration found'
  );
  
  check(
    'LanguageContext has correct storage key',
    contextContent.includes('moodflix-language'),
    'Storage key: moodflix-language'
  );
  
  check(
    'LanguageContext sets Spanish as default',
    contextContent.includes("'es'") && contextContent.includes('DEFAULT'),
    'Default language: Spanish'
  );
}

section('3. Component Integration Verification');

// Check Navbar integration
const navbarContent = readFile('src/components/Navbar.tsx');
if (navbarContent) {
  check(
    'Navbar imports LanguageSelector',
    navbarContent.includes('LanguageSelector'),
    'LanguageSelector import found'
  );
  
  check(
    'Navbar imports useTranslation',
    navbarContent.includes('useTranslation'),
    'useTranslation hook imported'
  );
  
  check(
    'Navbar uses translation function',
    navbarContent.includes('{t(') || navbarContent.includes('{ t('),
    'Translation function used'
  );
  
  check(
    'Navbar renders LanguageSelector',
    navbarContent.includes('<LanguageSelector'),
    'LanguageSelector component rendered'
  );
  
  const tUsageCount = countOccurrences(navbarContent, /\{t\(/g);
  check(
    'Navbar has multiple translations',
    tUsageCount >= 5,
    `Found ${tUsageCount} translation calls`
  );
}

// Check Header integration
const headerContent = readFile('src/components/Header.tsx');
if (headerContent) {
  check(
    'Header imports LanguageSelector',
    headerContent.includes('LanguageSelector'),
    'LanguageSelector import found'
  );
  
  check(
    'Header imports useTranslation',
    headerContent.includes('useTranslation'),
    'useTranslation hook imported'
  );
  
  check(
    'Header renders LanguageSelector',
    headerContent.includes('<LanguageSelector'),
    'LanguageSelector component rendered'
  );
}

// Check LanguageSelector implementation
const selectorContent = readFile('src/components/LanguageSelector.tsx');
if (selectorContent) {
  check(
    'LanguageSelector uses useTranslation hook',
    selectorContent.includes('useTranslation'),
    'Hook usage found'
  );
  
  check(
    'LanguageSelector has variant prop',
    selectorContent.includes('variant'),
    'Variant prop for styling'
  );
  
  check(
    'LanguageSelector shows both languages',
    selectorContent.includes('es') && selectorContent.includes('en'),
    'Both language options present'
  );
  
  check(
    'LanguageSelector calls cambiarIdioma',
    selectorContent.includes('cambiarIdioma'),
    'Language change handler present'
  );
}

section('4. Page Translation Verification');

// Check key pages for translation usage
const pagesToCheck = [
  'src/pages/LoginPage.tsx',
  'src/pages/RegisterPage.tsx',
  'src/pages/UsuariosPage.tsx',
  'src/pages/ProductosPage.tsx',
  'src/pages/CarritoPage.tsx',
  'src/pages/MisComprasPage.tsx',
  'src/pages/BitacoraPage.tsx',
  'src/pages/BackupPage.tsx',
];

pagesToCheck.forEach(pagePath => {
  const pageContent = readFile(pagePath);
  const pageName = path.basename(pagePath);
  
  if (pageContent) {
    const hasUseTranslation = pageContent.includes('useTranslation');
    const hasTranslationCalls = pageContent.includes('{t(') || pageContent.includes('{ t(');
    
    check(
      `${pageName} uses translations`,
      hasUseTranslation && hasTranslationCalls,
      hasUseTranslation ? 'useTranslation hook found' : 'No translation usage'
    );
  } else {
    warning(`Could not read ${pageName}`);
  }
});

section('5. Authentication System Verification');

// Check LoginForm
const loginFormContent = readFile('src/components/LoginForm.tsx');
if (loginFormContent) {
  check(
    'LoginForm uses translations',
    loginFormContent.includes('useTranslation') && loginFormContent.includes('{t('),
    'Translation integration verified'
  );
}

// Check auth-context is not modified
const authContextContent = readFile('src/lib/auth-context.tsx');
if (authContextContent) {
  check(
    'auth-context does not import language context',
    !authContextContent.includes('language-context') && !authContextContent.includes('useTranslation'),
    'Auth context remains independent'
  );
}

section('6. Cart System Verification');

// Check carrito-context is not modified
const carritoContextContent = readFile('src/lib/carrito-context.tsx');
if (carritoContextContent) {
  check(
    'carrito-context does not import language context',
    !carritoContextContent.includes('language-context') && !carritoContextContent.includes('useTranslation'),
    'Cart context remains independent'
  );
}

section('7. Protected Routes Verification');

// Check ProtectedRoute component
const protectedRouteContent = readFile('src/components/ProtectedRoute.tsx');
if (protectedRouteContent) {
  check(
    'ProtectedRoute maintains original logic',
    protectedRouteContent.includes('useAuth') && protectedRouteContent.includes('requiredPermission'),
    'Permission system intact'
  );
  
  // Should not have language logic in ProtectedRoute
  check(
    'ProtectedRoute does not mix language logic',
    !protectedRouteContent.includes('useTranslation') || protectedRouteContent.includes('{t('),
    'Separation of concerns maintained'
  );
}

section('8. Build Configuration Verification');

// Check package.json
const packageContent = readFile('package.json');
if (packageContent) {
  try {
    const packageJson = JSON.parse(packageContent);
    
    check(
      'No new dependencies added for i18n',
      !packageJson.dependencies['react-i18next'] && 
      !packageJson.dependencies['i18next'] &&
      !packageJson.dependencies['react-intl'],
      'Using native implementation'
    );
    
    check(
      'React and React Router present',
      packageJson.dependencies['react'] && packageJson.dependencies['react-router-dom'],
      'Core dependencies intact'
    );
  } catch (e) {
    warning('Could not parse package.json');
  }
}

// Check TypeScript config
const tsconfigContent = readFile('tsconfig.json');
if (tsconfigContent) {
  check(
    'TypeScript configuration exists',
    tsconfigContent.includes('compilerOptions'),
    'tsconfig.json is valid'
  );
}

section('9. File Structure Verification');

// Check directory structure
const expectedDirs = [
  'src/locales',
  'src/lib',
  'src/components',
  'src/pages',
];

expectedDirs.forEach(dir => {
  check(
    `Directory exists: ${dir}`,
    fs.existsSync(dir),
    dir
  );
});

section('10. Code Quality Checks');

// Check for hardcoded strings in key components (should be minimal)
const componentsToCheckForHardcoding = [
  'src/components/Navbar.tsx',
  'src/components/Header.tsx',
  'src/pages/LoginPage.tsx',
];

componentsToCheckForHardcoding.forEach(filePath => {
  const content = readFile(filePath);
  const fileName = path.basename(filePath);
  
  if (content) {
    // Look for hardcoded Spanish text (common patterns)
    const spanishPatterns = [
      />[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+\s+[a-záéíóúñ]+</g,  // Spanish text in JSX
      /"[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+\s+[a-záéíóúñ]+"/g,  // Spanish text in strings
    ];
    
    let hardcodedCount = 0;
    spanishPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        hardcodedCount += matches.length;
      }
    });
    
    if (hardcodedCount > 2) {
      warning(`${fileName} may have ${hardcodedCount} hardcoded strings`);
    }
  }
});

// ============================================================================
// RESULTS SUMMARY
// ============================================================================

section('VERIFICATION RESULTS');

log(`\nTotal Checks: ${results.passed + results.failed}`, 'cyan');
log(`✅ Passed: ${results.passed}`, 'green');
log(`❌ Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'green');
log(`⚠️  Warnings: ${results.warnings}`, results.warnings > 0 ? 'yellow' : 'green');

const successRate = ((results.passed / (results.passed + results.failed)) * 100).toFixed(1);
log(`\nSuccess Rate: ${successRate}%`, successRate >= 95 ? 'green' : successRate >= 80 ? 'yellow' : 'red');

if (results.failed === 0) {
  log('\n🎉 ALL CHECKS PASSED! The i18n system is properly implemented.', 'green');
} else {
  log('\n⚠️  Some checks failed. Please review the issues above.', 'yellow');
}

// Export results for potential CI/CD integration
if (process.env.CI) {
  fs.writeFileSync(
    '.kiro/specs/sistema-idiomas/verification-results.json',
    JSON.stringify(results, null, 2)
  );
  log('\nResults exported to verification-results.json', 'cyan');
}

// Exit with appropriate code
process.exit(results.failed > 0 ? 1 : 0);
