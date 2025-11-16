import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { productosAPI } from '../lib/api-endpoints';
import type { Libro } from '../lib/types';
import { useAuth } from '../lib/auth-context';
import { useCarrito } from '../lib/carrito-context';
import { useTranslation } from '../lib/language-context';

const LibrosPage: React.FC = () => {
  const [libros, setLibros] = useState<Libro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { agregarProducto } = useCarrito();
  const { tienePermiso } = useAuth();
  const { t } = useTranslation();
  
  // Verificar si el usuario puede comprar (NO es Admin ni Webmaster)
  const esAdmin = tienePermiso('ADMINISTRADOR') || tienePermiso('GESTIONAR_USUARIOS');
  const esWebmaster = tienePermiso('WEBMASTER') || (tienePermiso('VER_BITACORA') && tienePermiso('GESTIONAR_BACKUP'));
  const puedeComprar = !esAdmin && !esWebmaster;

  useEffect(() => {
    cargarLibros();
  }, []);

  const cargarLibros = async () => {
    try {
      // Usar el endpoint de productos con filtro de tipo
      const data = await productosAPI.listar({ tipo: 'Libro' });
      setLibros(data as Libro[]);
    } catch (err: any) {
      setError(t('booksPage.loadError'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">{t('booksPage.loadingBooks')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            📚 {t('booksPage.title')}
          </h1>
          <p className="text-gray-600">
            {libros.length} {libros.length === 1 ? t('booksPage.bookAvailable') : t('booksPage.booksAvailable')}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-8">
            {error}
          </div>
        )}

        {libros.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {libros.map((libro) => (
              <div
                key={libro.Id}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden"
              >
                <div className="h-64 bg-gray-200 flex items-center justify-center">
                  {libro.UrlImagen ? (
                    <img
                      src={libro.UrlImagen}
                      alt={libro.Titulo}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-6xl">📚</span>
                  )}
                </div>

                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold px-2 py-1 rounded bg-blue-100 text-blue-800">
                      {t('booksPage.book')}
                    </span>
                    <span className="text-lg font-bold text-purple-600">
                      ${libro.Precio.toFixed(2)}
                    </span>
                  </div>

                  <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2">
                    {libro.Titulo}
                  </h3>

                  <p className="text-sm text-gray-600 mb-2">
                    {libro.Autor}
                  </p>

                  <p className="text-xs text-gray-500 mb-3">
                    {libro.Editorial} • {libro.AnioPublicacion}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>{t('booksPage.stock')}: {libro.Stock}</span>
                    <span className={libro.Activo ? 'text-green-600' : 'text-red-600'}>
                      {libro.Activo ? `✓ ${t('booksPage.available')}` : `✗ ${t('booksPage.notAvailable')}`}
                    </span>
                  </div>

                  <button
                    disabled={!libro.Activo || libro.Stock === 0}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t('booksPage.addToCart')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {t('booksPage.noBooks')}
            </h3>
          </div>
        )}
      </main>
    </div>
  );
};

export default LibrosPage;
