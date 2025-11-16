import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth-context';
import { useCarrito } from '../lib/carrito-context';
import { LanguageSelector } from './LanguageSelector';
import { useTranslation } from '../lib/language-context';

const Navbar: React.FC = () => {
  const { usuario, permisos, logout, tienePermiso } = useAuth();
  const { totalItems } = useCarrito();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  // Verificar permisos específicos (granular y profesional)
  const puedeGestionarUsuarios = tienePermiso('GESTIONAR_USUARIOS') || tienePermiso('ADMINISTRADOR');
  const puedeGestionarProductos = tienePermiso('CREAR_PRODUCTOS') || tienePermiso('EDITAR_PRODUCTOS') || tienePermiso('ADMINISTRADOR');
  const puedeVerBitacora = tienePermiso('VER_BITACORA') || tienePermiso('ADMINISTRADOR');
  const puedeGestionarBackup = tienePermiso('GESTIONAR_BACKUP') || tienePermiso('ADMINISTRADOR');
  
  // Identificar roles para lógica de UI (Pedidos vs Mis Compras, Carrito)
  // Admin: tiene el permiso familia O tiene permisos de gestión de usuarios
  const esAdmin = tienePermiso('ADMINISTRADOR') || tienePermiso('GESTIONAR_USUARIOS');
  // Webmaster: tiene el permiso familia O tiene ambos permisos técnicos
  const esWebmaster = tienePermiso('WEBMASTER') || (tienePermiso('VER_BITACORA') && tienePermiso('GESTIONAR_BACKUP'));
  const esCliente = tienePermiso('CLIENTE');

  return (
    <nav className="bg-gradient-to-r from-purple-900 to-purple-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo y navegación principal */}
          <div className="flex items-center space-x-8">
            <div 
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => navigate('/emociones')}
            >
              <div className="text-3xl">🎬📚</div>
              <span className="text-white text-xl font-bold tracking-wide">MOODFLIX</span>
            </div>

            {/* Links de navegación */}
            <div className="hidden md:flex space-x-6">
              <button
                onClick={() => navigate('/emociones')}
                className={`text-white hover:text-purple-200 transition-colors ${
                  isActive('/emociones') ? 'font-bold' : ''
                }`}
              >
                {t('navbar.emotions')}
              </button>

              {puedeGestionarUsuarios && (
                <button
                  onClick={() => navigate('/usuarios')}
                  className={`text-white hover:text-purple-200 transition-colors ${
                    isActive('/usuarios') ? 'font-bold' : ''
                  }`}
                >
                  {t('navbar.users')}
                </button>
              )}

              {puedeGestionarProductos && (
                <button
                  onClick={() => navigate('/admin/productos')}
                  className={`text-white hover:text-purple-200 transition-colors ${
                    isActive('/admin/productos') ? 'font-bold' : ''
                  }`}
                >
                  {t('navbar.products')}
                </button>
              )}

              {puedeVerBitacora && (
                <button
                  onClick={() => navigate('/bitacora')}
                  className={`text-white hover:text-purple-200 transition-colors ${
                    isActive('/bitacora') ? 'font-bold' : ''
                  }`}
                >
                  {t('navbar.bitacora')}
                </button>
              )}

              {puedeGestionarBackup && (
                <button
                  onClick={() => navigate('/backup')}
                  className={`text-white hover:text-purple-200 transition-colors ${
                    isActive('/backup') ? 'font-bold' : ''
                  }`}
                >
                  {t('navbar.backup')}
                </button>
              )}

              {esAdmin && (
                <button
                  onClick={() => navigate('/mis-compras')}
                  className={`text-white hover:text-purple-200 transition-colors ${
                    isActive('/mis-compras') ? 'font-bold' : ''
                  }`}
                >
                  {t('navbar.orders')}
                </button>
              )}
            </div>
          </div>

          {/* Acciones del usuario */}
          <div className="flex items-center space-x-4">
            {/* Mis Compras (solo Cliente, no Admin ni Webmaster) */}
            {!esAdmin && !esWebmaster && (
              <button
                onClick={() => navigate('/mis-compras')}
                className="text-white hover:text-purple-200 transition-colors text-sm flex items-center space-x-1"
              >
                <span>{t('navbar.myPurchases')}</span>
              </button>
            )}

            {/* Carrito (solo para clientes, NO para admin ni webmaster) */}
            {!esAdmin && !esWebmaster && (
              <button
                onClick={() => navigate('/carrito')}
                className="text-white hover:text-purple-200 transition-colors relative"
              >
                <span className="text-2xl">🛒</span>
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {totalItems}
                  </span>
                )}
              </button>
            )}

            {/* Selector de Idioma */}
            <LanguageSelector variant="navbar" />

            {/* Usuario y Logout */}
            <div className="flex items-center space-x-2">
              <span className="text-white text-sm hidden md:block">
                {usuario?.NombreUsuario}
              </span>
              <button
                onClick={handleLogout}
                className="text-white hover:text-purple-200 transition-colors text-sm"
              >
                {t('navbar.logout')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
