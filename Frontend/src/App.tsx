import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/auth-context';
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
import { useState, useEffect } from 'react';

import { IntegridadModal } from './components/IntegridadModal';




function PrivateLayout() {
  const { isAuthenticated, erroresIntegridad } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (
      isAuthenticated &&
      Array.isArray(erroresIntegridad) &&
      erroresIntegridad.length > 0
    ) {
      setIsModalOpen(true);
    } else {
      setIsModalOpen(false);
    }
  }, [isAuthenticated, erroresIntegridad]);

  return (
    <>
      <main className="min-h-screen">
        <Outlet />
      </main>

      <IntegridadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        errores={erroresIntegridad}
      />
    </>
  );
}

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

              {/* Rutas que usan Header + Modal de integridad */}
              <Route element={<PrivateLayout />}>
                <Route
                  path="/emociones"
                  element={
                    <ProtectedRoute>
                      <EmocionesPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/tipo-producto/:emocionId"
                  element={
                    <ProtectedRoute>
                      <TipoProductoPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/productos/:emocionId/:tipo"
                  element={
                    <ProtectedRoute>
                      <ProductosPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/libros"
                  element={
                    <ProtectedRoute>
                      <LibrosPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/peliculas"
                  element={
                    <ProtectedRoute>
                      <PeliculasPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/carrito"
                  element={
                    <ProtectedRoute>
                      <CarritoPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/mis-compras"
                  element={
                    <ProtectedRoute>
                      <MisComprasPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/backup"
                  element={
                    <ProtectedRoute requiredPermission="GESTIONAR_BACKUP">
                      <BackupPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/xml-management"
                  element={
                    <ProtectedRoute requiredPermission="GESTIONAR_BACKUP">
                      <XmlManagementPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/bitacora"
                  element={
                    <ProtectedRoute requiredPermission="VER_BITACORA">
                      <BitacoraPage />
                    </ProtectedRoute>
                  }
                />

                {/* <Route
                  path="/integridad"
                  element={
                    <ProtectedRoute requiredPermission="GESTIONAR_DV">
                      <IntegridadPage />
                    </ProtectedRoute>
                  }
                /> */}

                <Route
                  path="/usuarios"
                  element={
                    <ProtectedRoute requiredPermission="GESTIONAR_USUARIOS">
                      <UsuariosPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin/productos"
                  element={
                    <ProtectedRoute requiredPermission="CREAR_PRODUCTOS">
                      <AdminProductosPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin/emociones"
                  element={
                    <ProtectedRoute requiredPermission="GESTIONAR_USUARIOS">
                      <AdminEmocionesPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
              </Route>

              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </CarritoProvider>
        </AuthProvider>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
