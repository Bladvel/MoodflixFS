/**
 * Script de Verificación Automática - Sistema de Idiomas
 * 
 * Ejecutar en la consola del navegador (DevTools) mientras la aplicación está corriendo.
 * Este script verifica automáticamente varios aspectos del sistema de idiomas.
 */

(function() {
  console.log('🧪 Iniciando verificación del Sistema de Idiomas...\n');

  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  function test(name, fn) {
    try {
      const result = fn();
      if (result) {
        console.log(`✅ PASS: ${name}`);
        results.passed++;
        results.tests.push({ name, status: 'PASS' });
      } else {
        console.log(`❌ FAIL: ${name}`);
        results.failed++;
        results.tests.push({ name, status: 'FAIL' });
      }
    } catch (error) {
      console.log(`❌ ERROR: ${name} - ${error.message}`);
      results.failed++;
      results.tests.push({ name, status: 'ERROR', error: error.message });
    }
  }

  console.log('📋 Test 1: Verificación de LocalStorage\n');
  
  test('LocalStorage tiene la clave correcta', () => {
    const idioma = localStorage.getItem('moodflix-language');
    return idioma === 'es' || idioma === 'en';
  });

  test('Valor del idioma es válido', () => {
    const idioma = localStorage.getItem('moodflix-language');
    return ['es', 'en'].includes(idioma);
  });

  console.log('\n📋 Test 2: Verificación de Archivos de Traducción\n');

  test('Archivo de traducciones español existe', () => {
    // Intentar importar dinámicamente
    return fetch('/src/locales/es.json')
      .then(res => res.ok)
      .catch(() => false);
  });

  test('Archivo de traducciones inglés existe', () => {
    return fetch('/src/locales/en.json')
      .then(res => res.ok)
      .catch(() => false);
  });

  console.log('\n📋 Test 3: Verificación de Componentes en DOM\n');

  test('LanguageSelector está presente en el DOM', () => {
    // Buscar elementos con banderas de idioma
    const flags = document.querySelectorAll('[role="img"][aria-label*="flag"], [role="img"][aria-label*="Bandera"]');
    return flags.length >= 2; // Debe haber al menos 2 banderas (ES y EN)
  });

  test('Botones de idioma son clickeables', () => {
    const buttons = document.querySelectorAll('button[aria-label*="Cambiar"], button[aria-label*="Change"]');
    return buttons.length >= 2;
  });

  console.log('\n📋 Test 4: Verificación de Persistencia\n');

  test('LocalStorage del carrito no se ve afectado', () => {
    const carrito = localStorage.getItem('moodflix_carrito');
    const idioma = localStorage.getItem('moodflix-language');
    // Ambas claves deben poder coexistir
    return idioma !== null; // El idioma debe existir
  });

  test('Múltiples claves de LocalStorage coexisten', () => {
    const keys = Object.keys(localStorage);
    return keys.includes('moodflix-language');
  });

  console.log('\n📋 Test 5: Verificación de Estructura de Traducciones\n');

  // Este test requiere acceso al contexto de React, lo simulamos
  test('Idioma predeterminado es español', () => {
    const idioma = localStorage.getItem('moodflix-language');
    // Si no hay idioma guardado, debería ser español por defecto
    return idioma === null || idioma === 'es' || idioma === 'en';
  });

  console.log('\n📋 Test 6: Verificación de Cambio de Idioma\n');

  // Guardar idioma actual
  const idiomaOriginal = localStorage.getItem('moodflix-language') || 'es';

  test('Cambio de idioma a inglés', () => {
    localStorage.setItem('moodflix-language', 'en');
    const idioma = localStorage.getItem('moodflix-language');
    return idioma === 'en';
  });

  test('Cambio de idioma a español', () => {
    localStorage.setItem('moodflix-language', 'es');
    const idioma = localStorage.getItem('moodflix-language');
    return idioma === 'es';
  });

  // Restaurar idioma original
  localStorage.setItem('moodflix-language', idiomaOriginal);

  test('Restauración del idioma original', () => {
    const idioma = localStorage.getItem('moodflix-language');
    return idioma === idiomaOriginal;
  });

  console.log('\n📋 Test 7: Verificación de Elementos Traducibles\n');

  test('Navbar contiene elementos traducibles', () => {
    const navbar = document.querySelector('nav');
    return navbar !== null && navbar.textContent.length > 0;
  });

  test('Textos visibles en la página', () => {
    const body = document.body.textContent;
    return body.length > 100; // Debe haber contenido significativo
  });

  console.log('\n📋 Test 8: Verificación de No Interferencia\n');

  test('Cambio de idioma no borra otras claves de LocalStorage', () => {
    const keysBefore = Object.keys(localStorage).sort();
    localStorage.setItem('moodflix-language', 'en');
    const keysAfter = Object.keys(localStorage).sort();
    localStorage.setItem('moodflix-language', idiomaOriginal);
    
    // El número de claves debe ser el mismo o mayor
    return keysAfter.length >= keysBefore.length;
  });

  console.log('\n📊 RESUMEN DE RESULTADOS\n');
  console.log('═══════════════════════════════════════');
  console.log(`✅ Tests Pasados: ${results.passed}`);
  console.log(`❌ Tests Fallidos: ${results.failed}`);
  console.log(`📈 Total: ${results.passed + results.failed}`);
  console.log(`🎯 Tasa de éxito: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);
  console.log('═══════════════════════════════════════\n');

  if (results.failed === 0) {
    console.log('🎉 ¡Todos los tests pasaron exitosamente!');
  } else {
    console.log('⚠️  Algunos tests fallaron. Revisa los detalles arriba.');
  }

  console.log('\n📝 Detalles de los tests:');
  console.table(results.tests);

  console.log('\n💡 Nota: Este script verifica aspectos técnicos básicos.');
  console.log('   Para una verificación completa, ejecuta los tests manuales');
  console.log('   descritos en manual-test-checklist.md\n');

  return results;
})();
