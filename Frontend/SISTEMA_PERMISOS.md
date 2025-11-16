# Sistema de Permisos - MOODFLIX

## Resumen del Sistema Actual

### Roles Principales

#### 1. **ADMINISTRADOR**
- **Responsabilidades**: Gestión completa del sistema (usuarios, pedidos, productos, emociones)
- **Permisos necesarios**:
  - `ADMINISTRADOR` (permiso familia)
  - `GESTIONAR_USUARIOS`
  - `GESTIONAR_PEDIDOS`
  - `CREAR_PRODUCTOS`
  - `EDITAR_PRODUCTOS`
  - `VER_PRODUCTOS`
  - `GESTIONAR_EMOCIONES`

#### 2. **WEBMASTER**
- **Responsabilidades**: Mantenimiento técnico del sistema (backup, restore, bitácora)
- **Permisos necesarios**:
  - `WEBMASTER` (permiso familia - RECOMENDADO CREAR)
  - `VER_BITACORA`
  - `GESTIONAR_BACKUP`
  - `VER_PRODUCTOS` (opcional, para navegar)

#### 3. **CLIENTE**
- **Responsabilidades**: Comprar productos
- **Permisos necesarios**:
  - `CLIENTE` (permiso familia)
  - `REALIZAR_COMPRA`
  - `VER_PRODUCTOS`

---

## Análisis del Código Actual

### Navbar.tsx - Lógica de Permisos

```typescript
// Verificación de roles
const esWebmaster = tienePermiso('VER_BITACORA') || tienePermiso('GESTIONAR_BACKUP');
const esAdmin = tienePermiso('ADMINISTRADOR') || 
                tienePermiso('GESTIONAR_PEDIDOS') ||
                tienePermiso('VER_BITACORA') ||
                permisos?.some(p => p.Nombre === 'ADMINISTRADOR');
const esEditor = tienePermiso('EDITOR');
const esCliente = tienePermiso('CLIENTE');

// Permisos específicos
const puedeGestionarUsuarios = tienePermiso('GESTIONAR_USUARIOS') || esAdmin;
const puedeGestionarProductos = tienePermiso('CREAR_PRODUCTOS') || tienePermiso('EDITAR_PRODUCTOS') || esEditor || esAdmin;
const puedeVerBitacora = tienePermiso('VER_BITACORA');
const puedeGestionarBackup = tienePermiso('GESTIONAR_BACKUP');
```

### Problemas Identificados

1. **Lógica redundante**: Se verifica `VER_BITACORA` tanto en `esWebmaster` como en `esAdmin`
2. **Falta de jerarquía clara**: El Admin tiene acceso a todo, pero la lógica está dispersa
3. **Webmaster no tiene permiso familia**: Se identifica por permisos individuales

---

## Recomendaciones de Mejora

### 1. Crear Estructura de Permisos Clara

```
ADMINISTRADOR (Familia)
├── GESTIONAR_USUARIOS (Patente)
├── GESTIONAR_PEDIDOS (Patente)
├── GESTIONAR_PRODUCTOS (Familia)
│   ├── CREAR_PRODUCTOS (Patente)
│   ├── EDITAR_PRODUCTOS (Patente)
│   └── ELIMINAR_PRODUCTOS (Patente)
├── GESTIONAR_EMOCIONES (Patente)
└── VER_PRODUCTOS (Patente)

WEBMASTER (Familia)
├── VER_BITACORA (Patente)
├── GESTIONAR_BACKUP (Patente)
└── VER_PRODUCTOS (Patente) [opcional]

CLIENTE (Familia)
├── REALIZAR_COMPRA (Patente)
└── VER_PRODUCTOS (Patente)
```

### 2. Simplificar Lógica en Navbar

```typescript
// Verificación de roles (simplificada)
const esAdmin = tienePermiso('ADMINISTRADOR');
const esWebmaster = tienePermiso('WEBMASTER');
const esCliente = tienePermiso('CLIENTE');

// Permisos específicos con jerarquía
const puedeGestionarUsuarios = esAdmin;
const puedeGestionarProductos = esAdmin;
const puedeGestionarEmociones = esAdmin;
const puedeVerBitacora = esAdmin || esWebmaster;
const puedeGestionarBackup = esAdmin || esWebmaster;
const puedeVerPedidos = esAdmin;
```

### 3. Actualizar ProtectedRoute en App.tsx

Agregar validación de permisos en las rutas:

```typescript
// Usuarios - Solo Admin
<Route path="/usuarios" element={
  <ProtectedRoute requiredPermission="ADMINISTRADOR">
    <UsuariosPage />
  </ProtectedRoute>
} />

// Productos - Admin o Editor
<Route path="/admin/productos" element={
  <ProtectedRoute requiredPermission="GESTIONAR_PRODUCTOS">
    <AdminProductosPage />
  </ProtectedRoute>
} />

// Bitácora - Admin o Webmaster
<Route path="/bitacora" element={
  <ProtectedRoute requiredPermission="VER_BITACORA">
    <BitacoraPage />
  </ProtectedRoute>
} />

// Backup - Admin o Webmaster
<Route path="/backup" element={
  <ProtectedRoute requiredPermission="GESTIONAR_BACKUP">
    <BackupPage />
  </ProtectedRoute>
} />
```

---

## Matriz de Permisos por Rol

| Funcionalidad | Admin | Webmaster | Cliente |
|--------------|-------|-----------|---------|
| Ver Emociones | ✅ | ✅ | ✅ |
| Ver Productos | ✅ | ✅ | ✅ |
| Gestionar Usuarios | ✅ | ❌ | ❌ |
| Gestionar Productos | ✅ | ❌ | ❌ |
| Gestionar Emociones | ✅ | ❌ | ❌ |
| Ver Pedidos (todos) | ✅ | ❌ | ❌ |
| Ver Mis Compras | ✅ | ✅ | ✅ |
| Realizar Compras | ✅ | ✅ | ✅ |
| Ver Bitácora | ✅ | ✅ | ❌ |
| Gestionar Backup | ✅ | ✅ | ❌ |
| Carrito | ❌* | ✅ | ✅ |

*El Admin ve "Pedidos" en lugar del carrito

---

## Pasos para Implementar

### Paso 1: Crear Permiso WEBMASTER en la Base de Datos (si no existe)
Necesitas crear el permiso familia "WEBMASTER" con sus permisos hijos.

### Paso 2: Asignar Permisos al Usuario Webmaster
Desde la página de Usuarios, asignar al usuario Webmaster:
- VER_BITACORA
- GESTIONAR_BACKUP
- VER_PRODUCTOS (opcional, para navegar por el catálogo)

### Paso 3: Actualizar Navbar.tsx
Simplificar la lógica de permisos con roles claros.

### Paso 4: Actualizar App.tsx
Agregar `requiredPermission` a las rutas protegidas.

### Paso 5: Probar con Diferentes Usuarios
- Login como Admin → Debe ver TODO (Usuarios, Productos, Emociones, Pedidos, Bitácora, Backup)
- Login como Webmaster → Solo Bitácora y Backup (NO Usuarios, NO Productos, NO Emociones, NO Pedidos)
- Login como Cliente → Solo comprar (ver productos y realizar compras)

---

## Notas Importantes

1. **El permiso ADMINISTRADOR debe tener acceso a todo**: Gestión completa del sistema
2. **Webmaster es un rol técnico puro**: Solo backup, restore y bitácora
3. **Separación clara de responsabilidades**:
   - Admin = gestión completa del negocio (usuarios, productos, emociones, pedidos)
   - Webmaster = mantenimiento técnico (backup, bitácora)
   - Cliente = compras
4. **El carrito no debe mostrarse al Admin**: Ya implementado correctamente
5. **Todos pueden comprar**: Pero Admin ve "Pedidos" en lugar de "Mis Compras"
6. **Solo Admin puede gestionar Usuarios, Productos, Emociones y Pedidos**: Webmaster NO debe ver estas secciones
