# Guía de Pruebas de Persistencia y Experiencia de Usuario

## Objetivo
Verificar que el sistema de idiomas mantiene la persistencia correctamente y no afecta otras funcionalidades de la aplicación.

## Pre-requisitos
- Aplicación corriendo en modo desarrollo (`npm run dev`)
- Navegador con DevTools abierto (para verificar LocalStorage)
- Usuarios de prueba con diferentes roles:
  - Admin
  - Webmaster
  - Cliente

---

## Test 1: Persistencia al Recargar Página

### Pasos:
1. Abrir la aplicación en `/login`
2. Verificar que el idioma por defecto es Español (ES resaltado)
3. Cambiar a Inglés (EN)
4. Verificar que todos los textos cambian a inglés
5. Recargar la página (F5 o Ctrl+R)
6. **Resultado esperado:** El idioma sigue siendo Inglés después de recargar

### Verificación en DevTools:
- Abrir DevTools → Application → Local Storage
- Buscar clave: `moodflix-language`
- Valor debe ser: `en`

**Estado:** ⬜ Pendiente | ✅ Pasó | ❌ Falló

---

## Test 2: Persistencia al Cerrar Sesión y Volver a Iniciar

### Pasos:
1. Iniciar sesión con cualquier usuario
2. Cambiar idioma a Inglés
3. Navegar por varias páginas (verificar que se mantiene)
4. Cerrar sesión (Logout)
5. Verificar que el selector de idioma sigue mostrando Inglés en la página de login
6. Iniciar sesión nuevamente
7. **Resultado esperado:** El idioma sigue siendo Inglés después de iniciar sesión

**Estado:** ⬜ Pendiente | ✅ Pasó | ❌ Falló

---

## Test 3: Cambio de Idioma No Afecta Sesión de Autenticación

### Pasos:
1. Iniciar sesión con un usuario
2. Navegar a una página protegida (ej: `/emociones`)
3. Cambiar idioma de Español a Inglés
4. Cambiar de vuelta a Español
5. Navegar a otra página protegida
6. **Resultado esperado:** 
   - No se cierra la sesión
   - No se redirige a login
   - El usuario sigue autenticado
   - Todas las páginas protegidas siguen accesibles

### Verificación en DevTools:
- Verificar que el token de autenticación sigue en LocalStorage
- Clave: `moodflix-token` debe seguir presente

**Estado:** ⬜ Pendiente | ✅ Pasó | ❌ Falló

---

## Test 4: Cambio de Idioma No Afecta Contenido del Carrito

### Pasos:
1. Iniciar sesión como Cliente
2. Navegar a `/peliculas` o `/libros`
3. Agregar 2-3 productos al carrito
4. Ir a `/carrito` y verificar los productos
5. Cambiar idioma a Inglés
6. **Resultado esperado:**
   - Los productos siguen en el carrito
   - La cantidad se mantiene
   - Los nombres de productos se mantienen (no se traducen, son datos)
   - Solo los textos de UI están en inglés (ej: "Total", "Checkout")

### Verificación en DevTools:
- Verificar que el carrito sigue en LocalStorage
- Clave: `moodflix-carrito` debe tener los mismos productos

**Estado:** ⬜ Pendiente | ✅ Pasó | ❌ Falló

---

## Test 5: Cambio de Idioma Mantiene Navegación en Página Actual

### Pasos:
1. Iniciar sesión
2. Navegar a `/usuarios` (si tienes permisos)
3. Cambiar idioma a Inglés
4. **Resultado esperado:**
   - La URL sigue siendo `/usuarios`
   - No hay redirección
   - La página se actualiza con textos en inglés
   - No se pierde el estado de la página (ej: filtros, búsquedas)

### Repetir en diferentes páginas:
- `/emociones`
- `/peliculas`
- `/carrito`
- `/mis-compras`
- `/backup` (si eres Webmaster)
- `/bitacora` (si eres Webmaster)

**Estado:** ⬜ Pendiente | ✅ Pasó | ❌ Falló

---

## Test 6: Cambio de Idioma en Diferentes Roles

### Test 6.1: Usuario No Autenticado
**Pasos:**
1. Cerrar sesión o abrir en ventana incógnita
2. Ir a `/login`
3. Verificar selector de idioma visible en Header
4. Cambiar a Inglés
5. Verificar textos en inglés: "Email", "Password", "Login", "Register"
6. Ir a `/register`
7. **Resultado esperado:** Idioma se mantiene en inglés

**Estado:** ⬜ Pendiente | ✅ Pasó | ❌ Falló

---

### Test 6.2: Cliente
**Pasos:**
1. Iniciar sesión como Cliente
2. Verificar selector de idioma visible en Navbar
3. Cambiar a Inglés
4. Navegar por páginas de cliente:
   - `/emociones` → Textos en inglés
   - `/peliculas` → Textos en inglés
   - `/carrito` → Textos en inglés
   - `/mis-compras` → Textos en inglés
5. **Resultado esperado:** Todos los textos de UI en inglés

**Estado:** ⬜ Pendiente | ✅ Pasó | ❌ Falló

---

### Test 6.3: Admin
**Pasos:**
1. Iniciar sesión como Admin
2. Cambiar a Inglés
3. Navegar por páginas administrativas:
   - `/usuarios` → Textos en inglés
   - `/admin/productos` → Textos en inglés
   - `/admin/emociones` → Textos en inglés
4. Verificar que el sistema de permisos funciona correctamente
5. **Resultado esperado:** 
   - Todos los textos de UI en inglés
   - Permisos funcionan igual que antes

**Estado:** ⬜ Pendiente | ✅ Pasó | ❌ Falló

---

### Test 6.4: Webmaster
**Pasos:**
1. Iniciar sesión como Webmaster
2. Cambiar a Inglés
3. Navegar por páginas exclusivas de Webmaster:
   - `/backup` → Textos en inglés
   - `/bitacora` → Textos en inglés
4. Probar funcionalidad de backup/restore
5. **Resultado esperado:**
   - Todos los textos de UI en inglés
   - Funcionalidades de backup/bitácora operan normalmente

**Estado:** ⬜ Pendiente | ✅ Pasó | ❌ Falló

---

## Test 7: Cambios Rápidos de Idioma

### Pasos:
1. Iniciar sesión
2. Cambiar idioma rápidamente: ES → EN → ES → EN → ES (5 veces)
3. Navegar entre páginas
4. **Resultado esperado:**
   - No hay errores en consola
   - La aplicación responde correctamente
   - El idioma final se mantiene después de recargar

**Estado:** ⬜ Pendiente | ✅ Pasó | ❌ Falló

---

## Test 8: Verificación de LocalStorage

### Pasos:
1. Abrir DevTools → Application → Local Storage
2. Verificar claves presentes:
   - `moodflix-language`: 'es' o 'en'
   - `moodflix-token`: (token de autenticación)
   - `moodflix-carrito`: (datos del carrito)
3. Cambiar idioma y verificar que solo `moodflix-language` cambia
4. **Resultado esperado:**
   - Solo la clave de idioma se actualiza
   - Otras claves permanecen intactas

**Estado:** ⬜ Pendiente | ✅ Pasó | ❌ Falló

---

## Test 9: Responsive - Selector en Mobile

### Pasos:
1. Abrir DevTools → Toggle device toolbar (Ctrl+Shift+M)
2. Seleccionar dispositivo móvil (ej: iPhone 12)
3. Verificar selector de idioma:
   - En login/register: Solo banderas visibles (🇪🇸 | 🇺🇸)
   - Después de login: Solo banderas en navbar
4. Cambiar idioma en mobile
5. **Resultado esperado:**
   - Selector funciona correctamente
   - Diseño responsive apropiado
   - Textos "ES" y "EN" ocultos en mobile

**Estado:** ⬜ Pendiente | ✅ Pasó | ❌ Falló

---

## Resumen de Resultados

| Test | Descripción | Estado |
|------|-------------|--------|
| 1 | Persistencia al recargar | ⬜ |
| 2 | Persistencia al cerrar sesión | ⬜ |
| 3 | No afecta autenticación | ⬜ |
| 4 | No afecta carrito | ⬜ |
| 5 | Mantiene navegación | ⬜ |
| 6.1 | Usuario no autenticado | ⬜ |
| 6.2 | Cliente | ⬜ |
| 6.3 | Admin | ⬜ |
| 6.4 | Webmaster | ⬜ |
| 7 | Cambios rápidos | ⬜ |
| 8 | LocalStorage | ⬜ |
| 9 | Responsive mobile | ⬜ |

**Total:** 0/12 completados

---

## Notas Adicionales

### Errores Comunes a Buscar:
- ❌ Errores en consola al cambiar idioma
- ❌ Redirecciones inesperadas
- ❌ Pérdida de datos del carrito
- ❌ Cierre de sesión involuntario
- ❌ Traducciones faltantes (mostrar claves en lugar de texto)

### Verificación de Calidad:
- ✅ Cambio de idioma es instantáneo (< 500ms)
- ✅ No hay parpadeo o re-renders innecesarios
- ✅ Selector de idioma siempre visible
- ✅ Idioma activo claramente indicado
- ✅ Hover effects funcionan correctamente
