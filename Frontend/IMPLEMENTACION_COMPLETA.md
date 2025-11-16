# 🎬 MOODFLIX - Documentación Completa del Sistema

## 📋 Resumen Ejecutivo

MOODFLIX es una plataforma e-commerce de películas y libros que recomienda productos basándose en el estado emocional del usuario. El sistema está construido con React + TypeScript en el frontend y ASP.NET Web API 2 en el backend.

---

## ✅ FUNCIONALIDADES IMPLEMENTADAS

### 1. 🔐 Sistema de Autenticación y Autorización

#### Autenticación
- ✅ Login con email y contraseña
- ✅ Registro de nuevos usuarios
- ✅ Tokens JWT para autenticación
- ✅ Logout funcional
- ✅ Persistencia de sesión con localStorage
- ✅ Validación de contraseñas (mínimo 8 caracteres, mayúscula, minúscula)
- ✅ Manejo robusto de errores de autenticación

#### Sistema de Permisos
- ✅ Permisos jerárquicos (Familia y Patente)
- ✅ Protección de rutas por permisos
- ✅ Verificación de permisos en componentes
- ✅ Tres roles principales:
  - **ADMINISTRADOR**: Gestión completa del sistema
  - **WEBMASTER**: Mantenimiento técnico (backup, bitácora)
  - **CLIENTE**: Compras y visualización de productos

#### Permisos Disponibles
```
- ADMINISTRADOR (Familia)
- WEBMASTER (Familia)
- CLIENTE (Familia)
- GESTIONAR_USUARIOS
- GESTIONAR_PEDIDOS
- CREAR_PRODUCTOS
- EDITAR_PRODUCTOS
- ELIMINAR_PRODUCTOS
- VER_PRODUCTOS
- REALIZAR_COMPRA
- VER_BITACORA
- GESTIONAR_BACKUP
- GESTIONAR_EMOCIONES
```

---

### 2. 🌍 Sistema Multiidioma (i18n)

#### Características
- ✅ Soporte para Español e Inglés
- ✅ Selector de idioma con banderas visuales (CSS)
- ✅ Persistencia de preferencia de idioma
- ✅ Traducciones completas en todas las páginas
- ✅ Context API para gestión global del idioma

#### Archivos de Traducción
- `src/locales/es.json` - Español
- `src/locales/en.json` - Inglés

#### Componentes Traducidos
- ✅ Navbar
- ✅ Login/Registro
- ✅ Páginas de productos
- ✅ Carrito de compras
- ✅ Mis compras/Pedidos
- ✅ Gestión de productos (Admin)
- ✅ Gestión de emociones (Admin)
- ✅ Bitácora
- ✅ Backup/Restore
- ✅ XML Management

---

### 3. 🛒 Sistema de Carrito de Compras

#### Funcionalidades
- ✅ Agregar productos al carrito
- ✅ Ver carrito con productos seleccionados
- ✅ Modificar cantidades (+ / -)
- ✅ Eliminar productos del carrito
- ✅ Calcular subtotal y total
- ✅ Persistencia en localStorage
- ✅ Contador de items en navbar
- ✅ Validación de stock disponible
- ✅ Carrito vacío con mensaje informativo

#### Proceso de Compra
- ✅ Formulario de dirección de envío
- ✅ Resumen de compra con totales
- ✅ Validación antes de finalizar compra
- ✅ Creación de pedido en backend
- ✅ Vaciado automático del carrito después de comprar
- ✅ Redirección a "Mis Compras" después de comprar
- ✅ Manejo de errores en el proceso de compra

#### Context API
- `src/lib/carrito-context.tsx`
- Métodos: `agregarProducto`, `eliminarProducto`, `actualizarCantidad`, `vaciarCarrito`
- Estados: `items`, `totalItems`, `totalPrecio`

---

### 4. 📦 Gestión de Pedidos

#### Para Clientes (Mis Compras)
- ✅ Historial de pedidos del usuario
- ✅ Detalle de cada pedido (productos, cantidades, precios)
- ✅ Estado del pedido (Creado, Pagado, EnPreparación, Enviado, Completado, Cancelado)
- ✅ Fecha y hora del pedido
- ✅ Total del pedido
- ✅ Detalles expandibles/colapsables
- ✅ Imágenes de productos en el detalle

#### Para Administradores (Gestión de Pedidos)
- ✅ Ver TODOS los pedidos del sistema
- ✅ Información del cliente en cada pedido
- ✅ Cambiar estado de pedidos (dropdown)
- ✅ Actualización en tiempo real del estado
- ✅ Filtrado y búsqueda de pedidos
- ✅ Vista completa de items de cada pedido

#### Estados de Pedido
```
- Creado: Pedido recién creado
- Pagado: Pago confirmado
- EnPreparación: Preparando el envío
- Enviado: En camino al cliente
- Completado: Entregado exitosamente
- Cancelado: Pedido cancelado
```

---

### 5. 🎬📚 Gestión de Productos (Admin)

#### Funcionalidades Generales
- ✅ Listar todos los productos (películas y libros)
- ✅ Filtrar por tipo (Todos, Películas, Libros)
- ✅ Crear nuevos productos
- ✅ Editar productos existentes
- ✅ Eliminar productos
- ✅ Asociar emociones a productos
- ✅ Gestión de stock y precios
- ✅ Subida de imágenes (URL)

#### Películas
**Campos:**
- Nombre
- Descripción
- Precio
- Stock
- URL de Imagen
- Director
- Productora
- Año de Lanzamiento
- Emociones asociadas

**Endpoints:**
- `GET /api/peliculas`
- `GET /api/peliculas/{id}`
- `POST /api/peliculas`
- `PUT /api/peliculas/{id}`
- `DELETE /api/peliculas/{id}`

#### Libros
**Campos:**
- Título
- Descripción
- Precio
- Stock
- URL de Imagen
- Autor
- Editorial
- ISBN
- Año de Publicación
- Emociones asociadas

**Endpoints:**
- `GET /api/libros`
- `GET /api/libros/{id}`
- `POST /api/libros`
- `PUT /api/libros/{id}`
- `DELETE /api/libros/{id}`

#### Modal de Creación/Edición
- ✅ Formulario completo con validaciones
- ✅ Selector de tipo (Película/Libro)
- ✅ Campos dinámicos según el tipo
- ✅ Selección múltiple de emociones
- ✅ Vista previa de datos
- ✅ Manejo de errores

---

### 6. 😊 Gestión de Emociones (Admin)

#### Funcionalidades
- ✅ Listar todas las emociones
- ✅ Crear nuevas emociones
- ✅ Editar emociones existentes
- ✅ Eliminar emociones
- ✅ Asociar emoji/icono a cada emoción
- ✅ Activar/desactivar emociones

#### Campos de Emoción
- Nombre
- Descripción
- Emoji/Icono
- Activo (boolean)

---

### 7. 🎯 Flujo de Compra del Cliente

#### Paso 1: Selección de Emoción
- ✅ Página con grid de emociones disponibles
- ✅ Cards visuales con emoji y nombre
- ✅ Hover effects
- ✅ Navegación a tipo de producto

#### Paso 2: Selección de Tipo de Producto
- ✅ Opciones: Películas, Libros, Ver Todo
- ✅ Cards grandes con iconos
- ✅ Filtrado por emoción seleccionada

#### Paso 3: Catálogo de Productos
- ✅ Grid de productos filtrados
- ✅ Cards con imagen, nombre, precio, descripción
- ✅ Información específica (director/autor)
- ✅ Indicador de stock
- ✅ Botón "Agregar al Carrito"
- ✅ Validación de stock disponible

#### Páginas Directas
- ✅ `/peliculas` - Todas las películas sin filtro
- ✅ `/libros` - Todos los libros sin filtro

---

### 8. 👥 Gestión de Usuarios (Admin)

#### Funcionalidades
- ✅ Listar todos los usuarios
- ✅ Ver detalles de usuario
- ✅ Editar información de usuario
- ✅ Asignar/modificar permisos
- ✅ Bloquear/desbloquear usuarios
- ✅ Eliminar usuarios
- ✅ Búsqueda y filtrado

#### Información de Usuario
- Nombre de usuario
- Email
- Estado (Activo/Bloqueado)
- Permisos asignados
- Fecha de registro

---

### 9. 🔧 Herramientas de Webmaster

#### Bitácora de Eventos
- ✅ Registro de todas las acciones del sistema
- ✅ Filtros por:
  - Usuario
  - Criticidad (Info, Warning, Error, Critical)
  - Rango de fechas
- ✅ Información detallada de cada evento
- ✅ Paginación
- ✅ Exportación de logs

**Campos de Evento:**
- Fecha y hora
- Usuario
- Acción realizada
- Criticidad
- Detalles adicionales

#### Backup y Restore
- ✅ Generación de backups de base de datos
- ✅ Descarga automática de archivo .bak
- ✅ Restauración desde archivo
- ✅ Validación de archivos
- ✅ Confirmación antes de restaurar
- ✅ Advertencias de seguridad

**Endpoints:**
- `GET /api/Backup/generar`
- `POST /api/Backup/restaurar`

#### Gestión XML
- ✅ Exportación del catálogo completo a XML
- ✅ Importación de catálogo desde XML
- ✅ Vista previa del XML
- ✅ Validación de formato
- ✅ Reemplazo completo del catálogo
- ✅ Confirmación antes de importar

**Webservice ASMX:**
- `POST /XmlService.asmx/ExportarProductosComoXml`
- `POST /XmlService.asmx/ImportarProductosDesdeXml`
- `POST /XmlService.asmx/Ping`

---

### 10. 🎨 Diseño y UX

#### Características Visuales
- ✅ Diseño responsive (móvil, tablet, desktop)
- ✅ Tema morado/púrpura corporativo
- ✅ Gradientes animados en páginas de autenticación
- ✅ Emojis flotantes en fondos (15 elementos optimizados)
- ✅ Animaciones suaves de transición
- ✅ Loading states con spinners
- ✅ Hover effects en cards y botones
- ✅ Sombras y elevaciones (shadow-md, shadow-lg)

#### Componentes UI
- ✅ Navbar dinámico según permisos
- ✅ Cards de productos con imágenes
- ✅ Modales para formularios
- ✅ Toasts/Alertas para notificaciones
- ✅ Badges de estado
- ✅ Botones con estados (disabled, loading)
- ✅ Formularios con validación visual

#### Paleta de Colores
```css
- Primario: Purple-600 (#9333EA)
- Secundario: Pink-500
- Éxito: Green-600
- Error: Red-600
- Advertencia: Yellow-500
- Info: Blue-600
- Fondo: Gray-50
- Texto: Gray-800
```

---

## 🗂️ Estructura del Proyecto

### Frontend (React + TypeScript)

```
src/
├── components/
│   ├── ErrorBoundary.tsx
│   ├── Header.tsx
│   ├── LanguageSelector.tsx
│   ├── LoginForm.tsx
│   ├── Navbar.tsx
│   └── ProtectedRoute.tsx
│
├── lib/
│   ├── api-endpoints.ts       # Todos los endpoints del backend
│   ├── api.ts                 # Cliente HTTP base
│   ├── auth-context.tsx       # Context de autenticación
│   ├── carrito-context.tsx    # Context del carrito
│   ├── language-context.tsx   # Context de idiomas
│   └── types.ts               # Tipos TypeScript
│
├── locales/
│   ├── es.json                # Traducciones español
│   └── en.json                # Traducciones inglés
│
├── pages/
│   ├── AdminEmocionesPage.tsx
│   ├── AdminProductosPage.tsx
│   ├── BackupPage.tsx
│   ├── BitacoraPage.tsx
│   ├── CarritoPage.tsx
│   ├── DashboardPage.tsx
│   ├── EmocionesPage.tsx
│   ├── LibrosPage.tsx
│   ├── LoginPage.tsx
│   ├── MisComprasPage.tsx
│   ├── PeliculasPage.tsx
│   ├── ProductosPage.tsx
│   ├── RegisterPage.tsx
│   ├── TipoProductoPage.tsx
│   ├── UsuariosPage.tsx
│   └── XmlManagementPage.tsx
│
├── App.tsx                    # Rutas principales
├── main.tsx                   # Entry point
└── index.css                  # Estilos globales
```

### Rutas de la Aplicación

```typescript
// Públicas
/login                         # Inicio de sesión
/register                      # Registro de usuarios

// Protegidas (requieren autenticación)
/emociones                     # Selección de emoción
/tipo-producto/:emocionId      # Selección de tipo
/productos/:emocionId/:tipo    # Catálogo filtrado
/libros                        # Todos los libros
/peliculas                     # Todas las películas
/carrito                       # Carrito de compras
/mis-compras                   # Historial de pedidos

// Admin (requiere ADMINISTRADOR o permisos específicos)
/usuarios                      # Gestión de usuarios
/admin/productos               # Gestión de productos
/admin/emociones               # Gestión de emociones

// Webmaster (requiere WEBMASTER o permisos específicos)
/bitacora                      # Bitácora de eventos
/backup                        # Backup y restore
/xml-management                # Gestión XML
```

---

## 🔌 API Endpoints

### Autenticación
```
POST   /api/auth/login         # Iniciar sesión
POST   /api/auth/logout        # Cerrar sesión
GET    /api/auth/current       # Usuario actual
```

### Usuarios
```
POST   /api/usuarios           # Registrar usuario
GET    /api/usuarios           # Listar usuarios
GET    /api/usuarios/{id}      # Obtener usuario
GET    /api/usuarios/mi-perfil # Mi perfil
PUT    /api/usuarios/{id}      # Actualizar usuario
PUT    /api/usuarios/{id}/permisos  # Asignar permisos
DELETE /api/usuarios/{id}      # Eliminar usuario
```

### Productos
```
GET    /api/productos          # Listar productos
GET    /api/productos/{id}     # Obtener producto
DELETE /api/productos/{id}     # Eliminar producto
```

### Películas
```
GET    /api/peliculas          # Listar películas
GET    /api/peliculas/{id}     # Obtener película
POST   /api/peliculas          # Crear película
PUT    /api/peliculas/{id}     # Actualizar película
DELETE /api/peliculas/{id}     # Eliminar película
```

### Libros
```
GET    /api/libros             # Listar libros
GET    /api/libros/{id}        # Obtener libro
POST   /api/libros             # Crear libro
PUT    /api/libros/{id}        # Actualizar libro
DELETE /api/libros/{id}        # Eliminar libro
```

### Emociones
```
GET    /api/emociones          # Listar emociones
GET    /api/emociones/{id}     # Obtener emoción
POST   /api/emociones          # Crear emoción
PUT    /api/emociones/{id}     # Actualizar emoción
DELETE /api/emociones/{id}     # Eliminar emoción
```

### Pedidos
```
POST   /api/pedidos            # Crear pedido
GET    /api/pedidos            # Mis pedidos
GET    /api/pedidos/todos      # Todos los pedidos (Admin)
GET    /api/pedidos/{id}       # Obtener pedido
PUT    /api/pedidos/{id}/estado # Actualizar estado
```

### Permisos
```
GET    /api/permisos           # Listar permisos
GET    /api/permisos/{id}      # Obtener permiso
POST   /api/permisos           # Crear permiso
PUT    /api/permisos/{id}      # Actualizar permiso
DELETE /api/permisos/{id}      # Eliminar permiso
```

### Bitácora
```
GET    /api/Bitacora           # Listar eventos
```

### Backup
```
GET    /api/Backup/generar     # Generar backup
POST   /api/Backup/restaurar   # Restaurar backup
GET    /api/Backup             # Listar backups
```

### XML (Webservice ASMX)
```
POST   /XmlService.asmx/ExportarProductosComoXml
POST   /XmlService.asmx/ImportarProductosDesdeXml
POST   /XmlService.asmx/Ping
```

---

## 🔒 Matriz de Permisos

| Funcionalidad | Admin | Webmaster | Cliente |
|--------------|-------|-----------|---------|
| Ver Emociones | ✅ | ✅ | ✅ |
| Ver Productos | ✅ | ✅ | ✅ |
| Agregar al Carrito | ❌ | ❌ | ✅ |
| Ver Carrito | ❌ | ❌ | ✅ |
| Realizar Compras | ❌ | ❌ | ✅ |
| Ver Mis Compras | ✅ | ✅ | ✅ |
| Gestionar Usuarios | ✅ | ❌ | ❌ |
| Gestionar Productos | ✅ | ❌ | ❌ |
| Gestionar Emociones | ✅ | ❌ | ❌ |
| Ver Todos los Pedidos | ✅ | ❌ | ❌ |
| Cambiar Estado Pedidos | ✅ | ❌ | ❌ |
| Ver Bitácora | ✅ | ✅ | ❌ |
| Gestionar Backup | ✅ | ✅ | ❌ |
| Gestión XML | ✅ | ✅ | ❌ |

---

## 🚀 Configuración y Despliegue

### Variables de Entorno

```env
# .env
VITE_API_URL=https://localhost:44307
```

### Proxy de Vite (vite.config.ts)

```typescript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'https://localhost:44307',
        changeOrigin: true,
        secure: false,
      },
      '/XmlService.asmx': {
        target: 'https://localhost:44307',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
```

### Instalación

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview de producción
npm run preview
```

### Dependencias Principales

```json
{
  "react": "^18.x",
  "react-dom": "^18.x",
  "react-router-dom": "^6.x",
  "typescript": "^5.x",
  "tailwindcss": "^3.x",
  "vite": "^5.x"
}
```

---

## 👥 Usuarios de Prueba

### Administrador
```
Email: admin@moodflix.com
Permisos: ADMINISTRADOR (acceso completo)
```

### Webmaster
```
Email: webmaster@moodflix.com
Permisos: VER_BITACORA, GESTIONAR_BACKUP
```

### Cliente
```
Email: cliente@moodflix.com
Permisos: CLIENTE, REALIZAR_COMPRA
```

---

## 📝 Notas Técnicas

### Context API
El sistema usa tres contexts principales:
1. **AuthContext**: Maneja autenticación, usuario actual y permisos
2. **CarritoContext**: Maneja el carrito de compras
3. **LanguageContext**: Maneja el idioma de la aplicación

### LocalStorage
Se usa localStorage para:
- Token JWT (`authToken`)
- Carrito de compras (`moodflix_carrito`)
- Preferencia de idioma (`moodflix_language`)

### Manejo de Errores
- Try-catch en todas las llamadas API
- Mensajes de error traducidos
- Feedback visual con alerts y toasts
- Logging en consola para debugging

### Validaciones
- Validación de formularios en frontend
- Validación de stock antes de agregar al carrito
- Validación de permisos en rutas y componentes
- Validación de archivos en upload (XML, backups)

---

## 🎯 Mejoras Futuras Sugeridas

### Alta Prioridad
- [ ] Búsqueda global de productos
- [ ] Filtros avanzados (precio, año, etc.)
- [ ] Paginación en listados grandes
- [ ] Wishlist / Lista de deseos
- [ ] Calificaciones y reseñas de productos

### Media Prioridad
- [ ] Dashboard con estadísticas para Admin
- [ ] Reportes de ventas
- [ ] Notificaciones en tiempo real
- [ ] Chat de soporte
- [ ] Recuperación de contraseña

### Baja Prioridad
- [ ] Modo oscuro
- [ ] Más idiomas (francés, alemán, etc.)
- [ ] Integración con pasarelas de pago reales
- [ ] Sistema de cupones/descuentos
- [ ] Recomendaciones personalizadas con IA

---

## 🐛 Problemas Conocidos y Soluciones

### 1. Emojis de Banderas no se Ven
**Problema**: Los emojis Unicode de banderas no se renderizan en algunos navegadores de Windows.

**Solución**: Se implementaron banderas con CSS usando divs con colores.

### 2. CORS en Desarrollo
**Problema**: El backend requiere configuración CORS específica.

**Solución**: Se usa proxy de Vite para desarrollo.

### 3. Validación de Contraseñas
**Problema**: El backend requiere contraseñas complejas.

**Solución**: Se agregó validación en frontend y mensajes claros.

---

## 📞 Soporte y Contacto

Para preguntas o problemas:
1. Revisar esta documentación
2. Consultar los archivos de implementación específicos:
   - `IMPLEMENTACION.md`
   - `IMPLEMENTACION_XML.md`
   - `SISTEMA_PERMISOS.md`
   - `GUIA_PERMISOS_FRONTEND.md`

---

## 📄 Licencia

Este proyecto es parte de un sistema académico/empresarial privado.

---

**Última actualización**: Noviembre 2024
**Versión**: 1.0.0
**Estado**: ✅ Producción
