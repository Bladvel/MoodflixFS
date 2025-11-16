import React, { useState } from 'react';
import Header from '../components/Header';
import { useNavigate } from 'react-router-dom';
import { usuariosAPI } from '../lib/api-endpoints';
import { useTranslation } from '../lib/language-context';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    nombreUsuario: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError(t('auth.passwordMismatch'));
      return;
    }

    if (formData.password.length < 8) {
      setError(t('auth.passwordMinLength'));
      return;
    }

    setLoading(true);

    try {
      await usuariosAPI.registrar({
        NombreUsuario: formData.nombreUsuario,
        Email: formData.email,
        Password: formData.password
      });
      
      alert(t('auth.registerSuccess'));
      navigate('/login');
    } catch (err: any) {
      setError(err.Message || err.message || t('auth.registerError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Fondo animado con gradiente azul/púrpura */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-500">
        {/* Formas flotantes animadas más sutiles */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-4000"></div>
        
        {/* Emojis flotantes optimizados - Solo los más relevantes */}
        <div className="absolute top-[15%] left-[10%] text-7xl opacity-100 animate-float drop-shadow-2xl">😊</div>
        <div className="absolute top-[25%] right-[15%] text-6xl opacity-100 animate-float animation-delay-1000 drop-shadow-2xl">🎬</div>
        <div className="absolute bottom-[30%] left-[20%] text-7xl opacity-100 animate-float animation-delay-2000 drop-shadow-2xl">📚</div>
        <div className="absolute top-[60%] right-[25%] text-6xl opacity-100 animate-float animation-delay-3000 drop-shadow-2xl">❤️</div>
        <div className="absolute bottom-[20%] right-[18%] text-7xl opacity-100 animate-float animation-delay-4000 drop-shadow-2xl">🎭</div>
        <div className="absolute top-[40%] left-[15%] text-6xl opacity-100 animate-float animation-delay-1000 drop-shadow-2xl">😂</div>
        <div className="absolute top-[70%] left-[35%] text-7xl opacity-100 animate-float animation-delay-3000 drop-shadow-2xl">🎪</div>
        <div className="absolute top-[20%] right-[35%] text-6xl opacity-100 animate-float animation-delay-2000 drop-shadow-2xl">🎨</div>
        <div className="absolute bottom-[40%] right-[10%] text-7xl opacity-100 animate-float animation-delay-4000 drop-shadow-2xl">🌟</div>
        <div className="absolute top-[50%] left-[45%] text-6xl opacity-100 animate-float animation-delay-1000 drop-shadow-2xl">🎵</div>
        <div className="absolute bottom-[15%] left-[40%] text-7xl opacity-100 animate-float animation-delay-3000 drop-shadow-2xl">😍</div>
        <div className="absolute top-[35%] right-[40%] text-6xl opacity-100 animate-float animation-delay-2000 drop-shadow-2xl">🎉</div>
        <div className="absolute top-[10%] left-[50%] text-6xl opacity-100 animate-float animation-delay-4000 drop-shadow-2xl">🍿</div>
        <div className="absolute bottom-[50%] left-[5%] text-7xl opacity-100 animate-float animation-delay-2000 drop-shadow-2xl">📖</div>
        <div className="absolute top-[80%] right-[30%] text-6xl opacity-100 animate-float animation-delay-1000 drop-shadow-2xl">🎥</div>
      </div>

      {/* Contenido */}
      <div className="relative z-10">
        <Header showRegisterButton={false} />
        <main className="flex items-center justify-center px-4 py-12 min-h-[calc(100vh-80px)]">
          <div className="w-full max-w-md">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              {t('auth.registerTitle')}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="nombreUsuario" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth.username')}
                </label>
                <input
                  id="nombreUsuario"
                  name="nombreUsuario"
                  type="text"
                  value={formData.nombreUsuario}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth.email')}
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth.password')}
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t('auth.passwordRequirements')}
                </p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth.confirmPassword')}
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? t('auth.registering') : t('auth.register')}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => navigate('/login')}
                className="text-purple-600 hover:text-purple-700 text-sm font-medium"
              >
                {t('auth.alreadyHaveAccount')}
              </button>
            </div>
          </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default RegisterPage;
