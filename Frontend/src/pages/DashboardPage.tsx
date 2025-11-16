import React from 'react';
import { useAuth } from '../lib/auth-context';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../lib/language-context';

const DashboardPage: React.FC = () => {
  const { usuario, permisos, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-900 to-purple-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">🎬</div>
              <span className="text-white text-2xl font-bold tracking-wide">MOODFLIX</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-white">
                {t('dashboard.hello')}, {usuario?.NombreUsuario}
              </span>
              <button
                onClick={handleLogout}
                className="bg-purple-800 hover:bg-purple-900 text-white px-4 py-2 rounded-md transition-colors"
              >
                {t('navbar.logout')}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {t('dashboard.welcome')}
          </h1>
          <p className="text-gray-600">
            {t('dashboard.mainPanel')}
          </p>
        </div>

        {/* User Info Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {t('dashboard.userInfo')}
          </h2>
          <div className="space-y-2">
            <p><span className="font-medium">{t('dashboard.name')}:</span> {usuario?.NombreUsuario}</p>
            <p><span className="font-medium">{t('dashboard.email')}:</span> {usuario?.Email}</p>
            <p><span className="font-medium">{t('dashboard.status')}:</span> {usuario?.Activo ? `✅ ${t('dashboard.active')}` : `❌ ${t('dashboard.inactive')}`}</p>
          </div>
        </div>

        {/* Permissions Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {t('dashboard.permissions')} ({permisos.length})
          </h2>
          {permisos.length > 0 ? (
            <div className="space-y-2">
              {permisos.map((permiso) => (
                <div key={permiso.Id} className="flex items-center space-x-2">
                  <span className="text-green-600">✓</span>
                  <span>{permiso.Nombre}</span>
                  {permiso.Descripcion && (
                    <span className="text-sm text-gray-500">- {permiso.Descripcion}</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">{t('dashboard.noPermissions')}</p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="text-4xl mb-3">📚</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{t('dashboard.catalog')}</h3>
            <p className="text-gray-600 text-sm">{t('dashboard.catalogDescription')}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="text-4xl mb-3">😊</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{t('dashboard.emotions')}</h3>
            <p className="text-gray-600 text-sm">{t('dashboard.emotionsDescription')}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="text-4xl mb-3">🛒</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{t('dashboard.myCart')}</h3>
            <p className="text-gray-600 text-sm">{t('dashboard.myCartDescription')}</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
