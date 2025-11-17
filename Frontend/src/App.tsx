import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './lib/auth-context';
import { CarritoProvider } from './lib/carrito-context';
import { LanguageProvider } from './lib/language-context';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import EmocionesPage from './pages/EmocionesPage';
import TipoProductoPage from './pages/TipoProductoPage';
import ProductosPage from './pages/ProductosPage';
import BackupPage from './pages/BackupPage';
import XmlManagementPage from './pages/XmlManagementPage';
import BitacoraPage from './pages/BitacoraPage';
import DashboardPage from './pages/DashboardPage';
import UsuariosPage from './pages/UsuariosPage';
import AdminProductosPage from './pages/AdminProductosPage';
import AdminEmocionesPage from './pages/AdminEmocionesPage';
import LibrosPage from './pages/LibrosPage';
import PeliculasPage from './pages/PeliculasPage';
import CarritoPage from './pages/CarritoPage';
import MisComprasPage from './pages/MisComprasPage';
import IntegridadPage from './pages/IntegridadPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <AuthProvider>
          <CarritoProvider>
            <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Ruta principal: Selección de emociones */}
          <Route
            path="/emociones"
            element={
              <ProtectedRoute>
                <EmocionesPage />
              </ProtectedRoute>
            }
          />
          
          {/* Selección de tipo de producto (Películas, Libros, Ver todo) */}
          <Route
            path="/tipo-producto/:emocionId"
            element={
              <ProtectedRoute>
                <TipoProductoPage />
              </ProtectedRoute>
            }
          />
          
          {/* Productos filtrados por emoción y tipo */}
          <Route
            path="/productos/:emocionId/:tipo"
            element={
              <ProtectedRoute>
                <ProductosPage />
              </ProtectedRoute>
            }
          />
          
          {/* Libros - Ver todos los libros */}
          <Route
            path="/libros"
            element={
              <ProtectedRoute>
                <LibrosPage />
              </ProtectedRoute>
            }
          />
          
          {/* Películas - Ver todas las películas */}
          <Route
            path="/peliculas"
            element={
              <ProtectedRoute>
                <PeliculasPage />
              </ProtectedRoute>
            }
          />
          
          {/* Carrito de compras */}
          <Route
            path="/carrito"
            element={
              <ProtectedRoute>
                <CarritoPage />
              </ProtectedRoute>
            }
          />
          
          {/* Mis Compras */}
          <Route
            path="/mis-compras"
            element={
              <ProtectedRoute>
                <MisComprasPage />
              </ProtectedRoute>
            }
          />
          
          {/* Backup & Restore (solo Webmaster) */}
          <Route
            path="/backup"
            element={
              <ProtectedRoute requiredPermission="GESTIONAR_BACKUP">
                <BackupPage />
              </ProtectedRoute>
            }
          />

          {/* XML Management (solo Webmaster) */}
          <Route
            path="/xml-management"
            element={
              <ProtectedRoute requiredPermission="GESTIONAR_BACKUP">
                <XmlManagementPage />
              </ProtectedRoute>
            }
          />
          
          {/* Bitácora (solo Webmaster) */}
          <Route
            path="/bitacora"
            element={
              <ProtectedRoute requiredPermission="VER_BITACORA">
                <BitacoraPage />
              </ProtectedRoute>
            }
          />

          {/* Integridad DVH/DVV (solo Webmaster) */}
          <Route
            path="/integridad"
            element={
              <ProtectedRoute requiredPermission="GESTIONAR_DV">
                <IntegridadPage />
              </ProtectedRoute>
            }
          />
          
          {/* Gestión de Usuarios (requiere GESTIONAR_USUARIOS o ADMINISTRADOR) */}
          <Route
            path="/usuarios"
            element={
              <ProtectedRoute requiredPermission="GESTIONAR_USUARIOS">
                <UsuariosPage />
              </ProtectedRoute>
            }
          />
          
          {/* Gestión de Productos (requiere CREAR_PRODUCTOS o EDITAR_PRODUCTOS o ADMINISTRADOR) */}
          <Route
            path="/admin/productos"
            element={
              <ProtectedRoute requiredPermission="CREAR_PRODUCTOS">
                <AdminProductosPage />
              </ProtectedRoute>
            }
          />
          
          {/* Gestión de Emociones (requiere GESTIONAR_USUARIOS o ADMINISTRADOR) */}
          <Route
            path="/admin/emociones"
            element={
              <ProtectedRoute requiredPermission="GESTIONAR_USUARIOS">
                <AdminEmocionesPage />
              </ProtectedRoute>
            }
          />
          
          {/* Dashboard alternativo */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          
          <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
          </CarritoProvider>
        </AuthProvider>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
