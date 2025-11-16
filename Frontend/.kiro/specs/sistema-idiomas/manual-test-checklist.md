# Manual Test Checklist - Sistema de Idiomas

## Objetivo
Verificar que el sistema de internacionalización funciona correctamente en todos los escenarios de uso, manteniendo la persistencia del idioma y sin afectar otras funcionalidades.

## Pre-requisitos
- Aplicación corriendo en modo desarrollo (`npm run dev`)
- Navegador con DevTools abierto (para verificar LocalStorage)
- Credenciales de prueba para diferentes roles:
  - Admin
  - Webmaster
  - Cliente

---

## Test 1: Persistencia al Recargar Página
**Requirement: 1.3**

### Pasos:
1. Abrir la aplicación en el navegador
2. Verificar que el idioma inicial es español (ES)
3. Cambiar el idioma a inglés (EN) usando el selector
4. Verificar que todos los textos cambian a inglés
5. Recargar la página (F5 o Ctrl+R)
6. Verificar que el idioma sigue siendo inglés después de recargar

### Verificación en DevTools:
```javascript
// Abrir Console y ejecutar:
localStorage.getItem('moodflix-language')
// Debe retornar: "en"
```

### Resultado Esperado:
- ✅ El idioma se mantiene después de recargar
- ✅ LocalStorage contiene el valor correcto
- ✅ La UI muestra el idioma correcto inmediatamente

---

## Test 2: Persistencia al Cerrar Sesión y Volver a Iniciar
**Requirements: 5.1, 5.5**

### Pasos:
1. Iniciar sesión con cualquier usuario
2. Cambiar el idioma a inglés (EN)
3. Verificar que la interfaz está en inglés
4. Cerrar sesión (Logout)
5. Verificar que el selector de idioma en el Header muestra inglés activo
6. Iniciar sesión nuevamente con el mismo usuario
7. Verificar que la interfaz sigue en inglés

### Verificación en DevTools:
```javascript
// Antes de cerrar sesión:
localStorage.getItem('moodflix-language') // "en"

// Después de cerrar sesión:
localStorage.getItem('moodflix-language') // "en" (debe mantenerse)

// Después de iniciar sesión:
localStorage.getItem('moodflix-language') // "en" (debe mantenerse)
```

### Resultado Esperado:
- ✅ El idioma se mantiene al cerrar sesión
- ✅ El idioma se mantiene al volver a iniciar sesión
- ✅ LocalStorage no se borra al cerrar sesión

---

## Test 3: Cambio de Idioma No Afecta Sesión de Autenticación
**Requirement: 5.1**

### Pasos:
1. Iniciar sesión con un usuario (ej: Admin)
2. Navegar a una página protegida (ej: Usuarios)
3. Cambiar el idioma de español a inglés
4. Verificar que sigues autenticado (no te redirige al login)
5. Verificar que puedes acceder a las funcionalidades de la página
6. Cambiar el idioma de inglés a español
7. Verificar que sigues autenticado

### Verificación en DevTools:
```javascript
// Verificar que el contexto de autenticación no se pierde
// (El usuario debe seguir viendo su nombre en el navbar)
```

### Resultado Esperado:
- ✅ La sesión se mantiene activa al cambiar idioma
- ✅ No hay redirección al login
- ✅ Los permisos se mantienen intactos
- ✅ El nombre de usuario sigue visible en el navbar

---

## Test 4: Cambio de Idioma No Afecta Contenido del Carrito
**Requirement: 5.2**

### Pasos:
1. Iniciar sesión como Cliente
2. Navegar a Películas o Libros
3. Agregar 2-3 productos al carrito
4. Verificar que el carrito muestra los productos (icono con número)
5. Cambiar el idioma a inglés
6. Verificar que el número de items en el carrito se mantiene
7. Ir a la página del Carrito
8. Verificar que todos los productos siguen ahí
9. Cambiar el idioma a español
10. Verificar que los productos siguen en el carrito

### Verificación en DevTools:
```javascript
// Verificar LocalStorage del carrito
const carrito = JSON.parse(localStorage.getItem('moodflix_carrito'));
console.log('Items en carrito:', carrito.length);
console.log('Productos:', carrito);
```

### Resultado Esperado:
- ✅ Los productos se mantienen en el carrito
- ✅ Las cantidades no cambian
- ✅ El total se mantiene correcto
- ✅ Solo los textos de la UI cambian (labels, botones)

---

## Test 5: Cambio de Idioma Mantiene Navegación en Página Actual
**Requirement: 5.3**

### Pasos:
1. Navegar a diferentes páginas y cambiar idioma en cada una:
   - Login page → cambiar idioma → verificar que sigues en login
   - Productos page → cambiar idioma → verificar que sigues en productos
   - Carrito page → cambiar idioma → verificar que sigues en carrito
   - Usuarios page → cambiar idioma → verificar que sigues en usuarios
2. Verificar que la URL no cambia
3. Verificar que el contenido de la página se mantiene (ej: lista de productos)

### Resultado Esperado:
- ✅ No hay redirección a otra página
- ✅ La URL se mantiene igual
- ✅ El contenido de la página se mantiene
- ✅ Solo los textos de la UI cambian

---

## Test 6: Cambio de Idioma en Diferentes Roles
**Requirements: 1.1, 1.2, 1.4**

### Test 6.1: Usuario No Autenticado
1. Abrir la aplicación sin iniciar sesión
2. Verificar que el selector está visible en el Header
3. Cambiar idioma a inglés
4. Verificar que Login y Register cambian a inglés
5. Navegar entre Login y Register
6. Verificar que el idioma se mantiene

### Test 6.2: Usuario Cliente
1. Iniciar sesión como Cliente
2. Verificar que el selector está visible en el Navbar
3. Cambiar idioma a inglés
4. Navegar por: Películas, Libros, Carrito, Mis Compras
5. Verificar que todas las páginas están en inglés
6. Verificar que NO puedes acceder a páginas de admin

### Test 6.3: Usuario Admin
1. Iniciar sesión como Admin
2. Cambiar idioma a inglés
3. Navegar por: Usuarios, Productos, Emociones
4. Verificar que todas las páginas administrativas están en inglés
5. Verificar que los permisos funcionan correctamente

### Test 6.4: Usuario Webmaster
1. Iniciar sesión como Webmaster
2. Cambiar idioma a inglés
3. Navegar por: Bitácora, Backup, Productos
4. Verificar que todas las páginas están en inglés
5. Verificar acceso a funcionalidades de webmaster

### Resultado Esperado:
- ✅ El selector funciona en todos los roles
- ✅ Todas las páginas se traducen correctamente
- ✅ Los permisos no se ven afectados
- ✅ Cada rol ve solo las páginas permitidas

---

## Test 7: Actualización Inmediata de Textos
**Requirement: 1.2**

### Pasos:
1. En cualquier página, identificar varios textos visibles
2. Cambiar el idioma
3. Verificar que TODOS los textos cambian inmediatamente (< 500ms)
4. No debe haber parpadeo o recarga de página

### Elementos a verificar:
- Navbar: links de navegación, botón logout
- Header: botones de login/register
- Formularios: labels, placeholders, botones
- Tablas: encabezados, acciones
- Mensajes: errores, confirmaciones
- Botones: guardar, cancelar, eliminar, etc.

### Resultado Esperado:
- ✅ Cambio instantáneo (< 500ms)
- ✅ No hay recarga de página
- ✅ No hay parpadeo
- ✅ Todos los textos cambian simultáneamente

---

## Test 8: Verificación de LocalStorage
**Requirement: 1.3**

### Verificación en DevTools Console:
```javascript
// 1. Verificar clave correcta
localStorage.getItem('moodflix-language')
// Debe retornar: "es" o "en"

// 2. Cambiar idioma manualmente
localStorage.setItem('moodflix-language', 'en')
location.reload()
// La app debe cargar en inglés

// 3. Verificar que no interfiere con otras claves
console.log('Carrito:', localStorage.getItem('moodflix_carrito'))
console.log('Idioma:', localStorage.getItem('moodflix-language'))
// Ambas claves deben coexistir sin problemas

// 4. Simular error de LocalStorage (modo incógnito estricto)
// La app debe funcionar con español por defecto
```

### Resultado Esperado:
- ✅ Clave correcta: 'moodflix-language'
- ✅ Valores válidos: 'es' o 'en'
- ✅ Persiste entre recargas
- ✅ No interfiere con otras claves de LocalStorage

---

## Test 9: Cambios Rápidos de Idioma
**Requirement: 5.4**

### Pasos:
1. Cambiar idioma rápidamente: ES → EN → ES → EN → ES
2. Verificar que no hay errores en la consola
3. Verificar que el idioma final es el correcto
4. Verificar que LocalStorage tiene el valor correcto

### Resultado Esperado:
- ✅ No hay errores en consola
- ✅ La UI responde correctamente
- ✅ El último idioma seleccionado es el que prevalece
- ✅ No hay race conditions

---

## Test 10: Compatibilidad con Funcionalidades Existentes

### Test 10.1: Sistema de Permisos
1. Iniciar sesión como Cliente
2. Cambiar idioma
3. Intentar acceder a /usuarios (debe redirigir)
4. Verificar que el mensaje de error está en el idioma correcto

### Test 10.2: Carrito de Compras
1. Agregar productos al carrito
2. Cambiar idioma
3. Finalizar compra
4. Verificar que el proceso funciona correctamente

### Test 10.3: Formularios
1. Abrir formulario de registro
2. Cambiar idioma
3. Llenar formulario
4. Enviar
5. Verificar que la validación funciona

### Resultado Esperado:
- ✅ Todas las funcionalidades siguen operativas
- ✅ No hay regresiones
- ✅ Los mensajes de error/éxito están traducidos

---

## Resumen de Verificación

### Checklist Final:
- [ ] Test 1: Persistencia al recargar ✓
- [ ] Test 2: Persistencia al cerrar/iniciar sesión ✓
- [ ] Test 3: No afecta autenticación ✓
- [ ] Test 4: No afecta carrito ✓
- [ ] Test 5: Mantiene navegación ✓
- [ ] Test 6: Funciona en todos los roles ✓
- [ ] Test 7: Actualización inmediata ✓
- [ ] Test 8: LocalStorage correcto ✓
- [ ] Test 9: Cambios rápidos ✓
- [ ] Test 10: Compatibilidad con funcionalidades ✓

### Criterios de Aceptación:
- ✅ Todos los tests pasan sin errores
- ✅ No hay regresiones en funcionalidades existentes
- ✅ El idioma persiste correctamente
- ✅ La experiencia de usuario es fluida
- ✅ No hay errores en la consola del navegador

