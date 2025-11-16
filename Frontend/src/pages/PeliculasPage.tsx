import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { productosAPI } from '../lib/api-endpoints';
import type { Pelicula } from '../lib/types';
import { useAuth } from '../lib/auth-context';
import { useCarrito } from '../lib/carrito-context';
import { useTranslation } from '../lib/language-context';

const PeliculasPage: React.FC = () => {
  const [peliculas, setPeliculas] = useState<Pelicula[]>([]);
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
    cargarPeliculas();
  }, []);

  const cargarPeliculas = async () => {
    try {
      // Usar el endpoint de productos con filtro de tipo
      const data = await productosAPI.listar({ tipo: 'Pelicula' });
      setPeliculas(data as Pelicula[]);
    } catch (err: any) {
      setError(t('moviesPage.loadError'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">{t('moviesPage.loadingMovies')}</p>
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
            🎬 {t('moviesPage.title')}
          </h1>
          <p className="text-gray-600">
            {peliculas.length} {peliculas.length === 1 ? t('moviesPage.movieFound') : t('moviesPage.moviesFound')}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-8">
            {error}
          </div>
        )}

        {peliculas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {peliculas.map((pelicula) => (
              <div
                key={pelicula.Id}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden"
              >
                <div className="h-64 bg-gray-200 flex items-center justify-center">
                  {pelicula.UrlImagen ? (
                    <img
                      src={pelicula.UrlImagen}
                      alt={pelicula.Nombre}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-6xl">🎬</span>
                  )}
                </div>

                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold px-2 py-1 rounded bg-purple-100 text-purple-800">
                      {t('moviesPage.movie')}
                    </span>
                    <span className="text-lg font-bold text-purple-600">
                      ${pelicula.Precio.toFixed(2)}
                    </span>
                  </div>

                  <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                    {pelicula.Nombre}
                  </h3>

                  <p className="text-sm text-gray-600 mb-2 line-clamp-3">
                    {pelicula.Descripcion}
                  </p>

                  <div className="text-xs text-gray-500 mb-4">
                    <p>{t('moviesPage.director')}: {pelicula.Director}</p>
                    <p>{t('moviesPage.productora')}: {pelicula.Productora}</p>
                    <p>{t('moviesPage.year')}: {pelicula.AnioLanzamiento}</p>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>{t('moviesPage.stock')}: {pelicula.Stock}</span>
                    <span className={pelicula.Activo ? 'text-green-600' : 'text-red-600'}>
                      {pelicula.Activo ? `✓ ${t('moviesPage.available')}` : `✗ ${t('moviesPage.notAvailable')}`}
                    </span>
                  </div>

                  <button
                    disabled={!pelicula.Activo || pelicula.Stock === 0}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t('moviesPage.addToCart')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎬</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {t('moviesPage.noMovies')}
            </h3>
            <p className="text-gray-600">
              {t('moviesPage.noMoviesMessage')}
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default PeliculasPage;
