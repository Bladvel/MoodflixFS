# Guía de Permisos - Frontend MOODFLIX

## Sistema de Permisos Profesional

El sistema ahora valida permisos de forma **granular** en lugar de roles fijos. Esto significa que puedes asignar permisos específicos a usuarios y el frontend se ajustará automáticamente.

---

## Cómo Funciona

### 1. **Navbar Dinámico**

El Navbar muestra u oculta opciones basándose en permisos específicos:

```typescript
// Permisos granulares
const puedeGestionarUsuarios = tienePermiso('GESTIONAR_USUARIOS') || tienePermiso('ADMINISTRADOR');
const puedeGestionarProductos = tienePermiso('CREAR_PRODUCTOS') || tienePermiso('EDITAR_PRODUCTOS') || tienePermiso('ADMINISTRADOR');
const puedeVerBitacora = tienePermiso('VER_BITACORA') || tienePermiso('ADMINISTRADOR');
const puedeGestionarBackup = tienePermiso('GESTIONAR_BACKUP') || tienePermiso('ADMINISTRADOR');
```

**Ejemplo:**
- Si un usuario tiene `VER_BITACORA`, verá el botón "Bitácora" en el Navbar
- Si le quitas ese permiso, el botón desaparecerá automáticamente

### 2. **Rutas Protegidas**

Cada ruta valida permisos específicos:

```typescript
<Route path="/usuarios" element={
  <ProtectedRoute requiredPermission="GESTIONAR_USUARIOS">
    <UsuariosPage />
  </ProtectedRoute>
} />
```

**Ejemplo:**
- Si un usuario intenta acceder a `/usuarios` sin el permiso `GESTIONAR_USUARIOS`, verá una página 403

### 3. **Validación Recursiva**

El backend devuelve TODOS los permisos del usuario (incluyendo hijos), por lo que:

- Si un usuario tiene `ADMINISTRADOR` (familia), automáticamente tiene todos sus permisos hijos
- Si un usuario tiene `WEBMASTER` (familia), tiene `VER_BITACORA` y `GESTIONAR_BACKUP`

---

## Matriz de Permisos por Funcionalidad

| Funcionalidad | Permiso Requerido | Alternativa |
|--------------|-------------------|-------------|
| Ver Usuarios | `GESTIONAR_USUARIOS` | `ADMINISTRADOR` |
| Ver Productos (Admin) | `CREAR_PRODUCTOS` o `EDITAR_PRODUCTOS` | `ADMINISTRADOR` |
| Ver Emociones (Admin) | `GESTIONAR_EMOCIONES` | `ADMINISTRADOR` |
| Ver Bitácora | `VER_BITACORA` | `ADMINISTRADOR` |
| Ver Backup | `GESTIONAR_BACKUP` | `ADMINISTRADOR` |
| Ver Pedidos | `GESTIONAR_PEDIDOS` | `ADMINISTRADOR` |

---

## Ejemplos de Uso

### Ejemplo 1: Usuario con permisos específicos

**Usuario:** Juan
**Permisos asignados:**
- `VER_BITACORA`
- `GESTIONAR_BACKUP`

**Resultado:**
- ✅ Ve "Bitácora" en el Navbar
- ✅ Ve "Backup" en el Navbar
- ✅ Puede acceder a `/bitacora`
- ✅ Puede acceder a `/backup`
- ❌ NO ve "Usuarios"
- ❌ NO ve "Productos"
- ❌ NO puede acceder a `/usuarios` (403)

### Ejemplo 2: Usuario con familia ADMINISTRADOR

**Usuario:** admin
**Permisos asignados:**
- `ADMINISTRADOR` (familia)

**Resultado:**
- ✅ Ve TODO en el Navbar (Usuarios, Productos, Bitácora, Backup)
- ✅ Puede acceder a TODAS las rutas
- ✅ Ve "Pedidos" en lugar de "Mis Compras"
- ❌ NO ve el carrito (es admin)

### Ejemplo 3: Usuario con familia WEBMASTER

**Usuario:** webmaster
**Permisos asignados:**
- `WEBMASTER` (familia)

**Resultado:**
- ✅ Ve "Bitácora" en el Navbar
- ✅ Ve "Backup" en el Navbar
- ❌ NO ve "Usuarios"
- ❌ NO ve "Productos"
- ❌ NO ve "Mis Compras"
- ❌ NO ve el carrito

---

## Cómo Asignar Permisos

### Desde la Página de Usuarios (UI)

1. Inicia sesión como Admin
2. Ve a "Usuarios" en el Navbar
3. Haz clic en "🔑 Permisos" del usuario que quieres modificar
4. Marca/desmarca los permisos que quieras asignar
5. Haz clic en "Guardar Permisos"
6. El usuario debe cerrar sesión y volver a iniciar para ver los cambios

### Desde la Base de Datos (SQL)

```sql
-- Asignar permiso WEBMASTER al usuario con Id 2
INSERT INTO Usuario_Permiso (UsuarioId, PermisoId) 
VALUES (2, 11); -- 11 es el Id del permiso WEBMASTER

-- Quitar un permiso
DELETE FROM Usuario_Permiso 
WHERE UsuarioId = 2 AND PermisoId = 11;
```

---

## Ventajas del Sistema

1. **Granularidad**: Puedes asignar permisos específicos sin necesidad de roles fijos
2. **Flexibilidad**: Puedes crear nuevos permisos y el frontend se ajustará automáticamente
3. **Seguridad**: Doble validación (Navbar + Rutas protegidas)
4. **Profesional**: El usuario solo ve lo que puede hacer
5. **Escalable**: Fácil agregar nuevas funcionalidades con permisos

---

## Troubleshooting

### Problema: El usuario no ve una opción en el Navbar

**Solución:**
1. Verifica que el usuario tenga el permiso asignado en la BD
2. Verifica que el permiso esté correctamente configurado (Familia con hijos)
3. Pide al usuario que cierre sesión y vuelva a iniciar

### Problema: El usuario ve la opción pero recibe 403

**Solución:**
1. Verifica que la ruta en `App.tsx` tenga el `requiredPermission` correcto
2. Verifica que el permiso coincida con el que tiene el usuario

### Problema: El ADMINISTRADOR no ve todo

**Solución:**
1. Verifica que el permiso `ADMINISTRADOR` tenga todos los permisos como hijos en la tabla `Permiso_Permiso`
2. Ejecuta: `SELECT * FROM Permiso_Permiso WHERE IdPadre = 12` (12 es ADMINISTRADOR)

---

## Próximos Pasos

Si quieres agregar una nueva funcionalidad:

1. Crea el permiso en la BD (Patente o Familia)
2. Asígnalo a los usuarios correspondientes
3. Agrega la validación en el Navbar:
   ```typescript
   const puedeVerNuevaFuncionalidad = tienePermiso('NUEVA_FUNCIONALIDAD') || tienePermiso('ADMINISTRADOR');
   ```
4. Agrega la ruta protegida en `App.tsx`:
   ```typescript
   <Route path="/nueva-funcionalidad" element={
     <ProtectedRoute requiredPermission="NUEVA_FUNCIONALIDAD">
       <NuevaFuncionalidadPage />
     </ProtectedRoute>
   } />
   ```
5. Agrega el botón en el Navbar:
   ```typescript
   {puedeVerNuevaFuncionalidad && (
     <button onClick={() => navigate('/nueva-funcionalidad')}>
       Nueva Funcionalidad
     </button>
   )}
   ```

¡Listo! El sistema se ajustará automáticamente.
