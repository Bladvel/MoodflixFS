# Design Document - Sistema de Internacionalización (i18n)

## Overview

El sistema de internacionalización permitirá a los usuarios de MOODFLIX cambiar el idioma de la interfaz entre español e inglés mediante un selector visual. La implementación se basa en React Context API para gestionar el estado global del idioma, archivos JSON para las traducciones, y LocalStorage para persistencia.

**Principios de diseño:**
- **No invasivo**: Integración sin modificar lógica de negocio existente
- **Centralizado**: Un único punto de gestión de traducciones
- **Performante**: Cambio de idioma instantáneo sin recargas
- **Escalable**: Fácil agregar nuevos idiomas en el futuro
- **Consistente**: Mismo patrón de uso en todos los componentes

## Architecture

### Arquitectura de Capas

```
┌─────────────────────────────────────────┐
│         Componentes UI                   │
│  (Navbar, Header, Pages, Forms)         │
└──────────────┬──────────────────────────┘
               │ useTranslation()
┌──────────────▼──────────────────────────┐
│      LanguageContext (Provider)         │
│  - Estado: idioma actual                │
│  - Funciones: cambiarIdioma()           │
│  - Hook: useTranslation()               │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│     Diccionarios de Traducciones        │
│  - es.json (Español)                    │
│  - en.json (English)                    │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         LocalStorage                     │
│  Key: 'moodflix-language'               │
└─────────────────────────────────────────┘
```

### Flujo de Cambio de Idioma

```
Usuario hace clic en selector
         │
         ▼
cambiarIdioma('en') llamado
         │
         ▼
Actualizar estado en Context
         │
         ▼
Guardar en LocalStorage
         │
         ▼
Re-render automático de componentes
         │
         ▼
Textos actualizados en UI
```

## Components and Interfaces

### 1. LanguageContext

**Ubicación:** `src/lib/language-context.tsx`

**Responsabilidades:**
- Mantener el estado del idioma actual
- Proveer función para cambiar idioma
- Cargar idioma desde LocalStorage al iniciar
- Proveer hook `useTranslation()` para acceder a traducciones

**Interface:**

```typescript
interface LanguageContextType {
  idioma: 'es' | 'en';
  cambiarIdioma: (nuevoIdioma: 'es' | 'en') => void;
  t: (key: string, params?: Record<string, string>) => string;
}
```

**Funciones clave:**

- `cambiarIdioma(nuevoIdioma)`: Actualiza el idioma y persiste en LocalStorage
- `t(key, params?)`: Función de traducción que busca la clave en el diccionario activo
  - Soporta interpolación: `t('welcome', { name: 'Juan' })` → "Bienvenido, Juan"
  - Fallback: Si no encuentra la clave, retorna la clave misma

### 2. LanguageSelector Component

**Ubicación:** `src/components/LanguageSelector.tsx`

**Responsabilidades:**
- Mostrar selector visual de idioma
- Indicar idioma activo
- Ejecutar cambio de idioma al hacer clic

**Props:**

```typescript
interface LanguageSelectorProps {
  variant?: 'navbar' | 'header'; // Para ajustar estilos según ubicación
}
```

**Diseño visual:**
- Botón con banderas: 🇪🇸 ES | 🇺🇸 EN
- Idioma activo resaltado con fondo más claro
- Hover effect en ambas opciones
- Responsive: se adapta a móvil y desktop

### 3. Diccionarios de Traducciones

**Ubicación:** `src/locales/`

**Estructura de archivos:**
```
src/locales/
  ├── es.json
  └── en.json
```

**Organización del diccionario:**

```json
{
  "common": {
    "loading": "Cargando...",
    "error": "Error",
    "success": "Éxito",
    "save": "Guardar",
    "cancel": "Cancelar",
    "delete": "Eliminar",
    "edit": "Editar",
    "search": "Buscar"
  },
  "navbar": {
    "home": "Inicio",
    "products": "Productos",
    "users": "Usuarios",
    "orders": "Pedidos",
    "myPurchases": "Mis Compras",
    "cart": "Carrito",
    "logout": "Cerrar Sesión"
  },
  "auth": {
    "login": "Iniciar Sesión",
    "register": "Registrarse",
    "email": "Correo Electrónico",
    "password": "Contraseña",
    "confirmPassword": "Confirmar Contraseña",
    "forgotPassword": "¿Olvidaste tu contraseña?"
  },
  "products": {
    "title": "Productos",
    "addProduct": "Agregar Producto",
    "editProduct": "Editar Producto",
    "deleteProduct": "Eliminar Producto"
  },
  "emotions": {
    "title": "Emociones",
    "selectEmotion": "Selecciona tu emoción"
  },
  "cart": {
    "title": "Carrito de Compras",
    "empty": "Tu carrito está vacío",
    "total": "Total",
    "checkout": "Finalizar Compra"
  },
  "orders": {
    "title": "Pedidos",
    "myOrders": "Mis Compras",
    "orderNumber": "Pedido #",
    "status": "Estado",
    "date": "Fecha"
  }
}
```

## Data Models

### Language State

```typescript
type Language = 'es' | 'en';

interface LanguageState {
  current: Language;
  translations: Record<string, any>;
}
```

### Translation Dictionary

```typescript
interface TranslationDictionary {
  [section: string]: {
    [key: string]: string | TranslationDictionary;
  };
}
```

## Error Handling

### Estrategias de Manejo de Errores

1. **Traducción no encontrada:**
   - Retornar la clave solicitada como fallback
   - Log en consola (solo en desarrollo) para identificar traducciones faltantes
   - No romper la UI

2. **Error al cargar diccionario:**
   - Usar español como idioma de respaldo
   - Mostrar mensaje en consola
   - Continuar ejecución normal

3. **Error en LocalStorage:**
   - Si no se puede leer: usar español por defecto
   - Si no se puede escribir: continuar sin persistencia
   - No bloquear funcionalidad

### Ejemplo de implementación:

```typescript
const t = (key: string, params?: Record<string, string>): string => {
  try {
    const keys = key.split('.');
    let value: any = translations[idioma];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    if (typeof value !== 'string') {
      console.warn(`Translation not found: ${key}`);
      return key;
    }
    
    // Interpolación de parámetros
    if (params) {
      return Object.entries(params).reduce(
        (str, [param, val]) => str.replace(`{{${param}}}`, val),
        value
      );
    }
    
    return value;
  } catch (error) {
    console.error(`Error translating ${key}:`, error);
    return key;
  }
};
```

## Testing Strategy

### Pruebas Manuales Prioritarias

1. **Cambio de idioma básico:**
   - Verificar que el selector cambia el idioma
   - Confirmar que los textos se actualizan inmediatamente
   - Validar persistencia al recargar página

2. **Integración con funcionalidades existentes:**
   - Cambiar idioma mientras se está autenticado
   - Cambiar idioma con items en el carrito
   - Verificar que permisos siguen funcionando
   - Probar en diferentes roles (Admin, Webmaster, Cliente)

3. **Navegación entre páginas:**
   - Cambiar idioma y navegar entre páginas
   - Verificar consistencia del idioma en todas las páginas
   - Probar en páginas protegidas y públicas

4. **Casos edge:**
   - Cambiar idioma múltiples veces rápidamente
   - Cambiar idioma durante operaciones (agregar al carrito, etc.)
   - Verificar comportamiento sin LocalStorage disponible

### Validación de No Regresión

Después de cada componente traducido, verificar:
- ✅ Autenticación funciona correctamente
- ✅ Sistema de permisos opera sin cambios
- ✅ Carrito mantiene items y funcionalidad
- ✅ Rutas protegidas siguen protegidas
- ✅ Formularios validan correctamente
- ✅ Estilos visuales se mantienen

## Implementation Notes

### Orden de Implementación

**Fase 1: Infraestructura Base**
1. Crear archivos de traducción (es.json, en.json) con secciones comunes
2. Implementar LanguageContext y hook useTranslation
3. Integrar LanguageProvider en App.tsx

**Fase 2: Selector de Idioma**
4. Crear componente LanguageSelector
5. Integrar en Navbar (usuarios autenticados)
6. Integrar en Header (usuarios no autenticados)

**Fase 3: Traducción Incremental de Componentes**
7. Traducir componentes de navegación (Navbar, Header)
8. Traducir páginas de autenticación (Login, Register)
9. Traducir páginas administrativas (Usuarios, Productos, etc.)
10. Traducir páginas de cliente (Películas, Libros, Carrito, etc.)
11. Traducir mensajes de error y validación

### Patrón de Uso en Componentes

**Antes:**
```typescript
<button>Guardar</button>
<h1>Mis Compras</h1>
```

**Después:**
```typescript
const { t } = useTranslation();

<button>{t('common.save')}</button>
<h1>{t('orders.myOrders')}</h1>
```

### Consideraciones de Performance

- Los diccionarios se cargan una sola vez al inicio
- El cambio de idioma solo actualiza el estado, no recarga archivos
- React re-renderiza solo componentes que usan traducciones
- LocalStorage es síncrono y rápido para esta operación

### Compatibilidad

- Compatible con todos los navegadores modernos
- LocalStorage disponible desde IE8+
- No requiere dependencias externas adicionales
- Funciona con el stack actual (React + TypeScript + Vite)

## Visual Design

### Selector de Idioma en Navbar

```
┌─────────────────────────────────────────┐
│  🎬📚 MOODFLIX    [Links...]    🇪🇸 🇺🇸  │
└─────────────────────────────────────────┘
                                    ↑
                            Selector aquí
```

### Selector de Idioma en Header

```
┌─────────────────────────────────────────┐
│  🎬 MOODFLIX              🇪🇸 🇺🇸  [Reg] │
└─────────────────────────────────────────┘
                              ↑
                      Selector aquí
```

### Estados del Selector

**Estado Normal:**
- Ambas banderas visibles
- Idioma activo con fondo semi-transparente blanco
- Idioma inactivo sin fondo

**Estado Hover:**
- Cursor pointer
- Ligero cambio de opacidad en opción hover

**Responsive:**
- Desktop: Banderas con texto (🇪🇸 ES | 🇺🇸 EN)
- Mobile: Solo banderas (🇪🇸 | 🇺🇸)
