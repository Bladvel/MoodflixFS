import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { productosAPI, emocionesAPI } from '../lib/api-endpoints';
import type { Producto, Emocion } from '../lib/types';
import { useCarrito } from '../lib/carrito-context';
import { useAuth } from '../lib/auth-context';
import { useTranslation } from '../lib/language-context';

const ProductosPage: React.FC = () => {
  const { t } = useTranslation();
  const { emocionId, tipo } = useParams<{ emocionId: string; tipo: string }>();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [emocion, setEmocion] = useState<Emocion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { agregarProducto } = useCarrito();
  const { tienePermiso } = useAuth();
  
  // Verificar si el usuario puede comprar (NO es Admin ni Webmaster)
  const esAdmin = tienePermiso('ADMINISTRADOR') || tienePermiso('GESTIONAR_USUARIOS');
  const esWebmaster = tienePermiso('WEBMASTER') || (tienePermiso('VER_BITACORA') && tienePermiso('GESTIONAR_BACKUP'));
  const puedeComprar = !esAdmin && !esWebmaster;

  useEffect(() => {
    if (emocionId) {
      cargarDatos();
    }
  }, [emocionId, tipo]);

  const cargarDatos = async () => {
    try {
      const emocionIdNum = parseInt(emocionId!);
      
      // Cargar emoción seleccionada
      const emocionData = await emocionesAPI.obtenerPorId(emocionIdNum);
      setEmocion(emocionData);

      // Cargar TODOS los productos
      const productosData = await productosAPI.listar();
      
      // Filtrar en el frontend por emoción y tipo
      let productosFiltrados = productosData.filter((producto: any) => {
        // Verificar si el producto tiene la emoción seleccionada
        const tieneEmocion = producto.Emociones && 
          Array.isArray(producto.Emociones) && 
          producto.Emociones.some((e: any) => e.Id === emocionIdNum);
        
        if (!tieneEmocion) return false;
        
        // Filtrar por tipo si no es "Todos"
        if (tipo && tipo !== 'Todos') {
          return producto.Tipo === tipo;
        }
        
        return true;
      });
      
      setProductos(productosFiltrados);
    } catch (err: any) {
      setError(t('common.error'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVolverEmociones = () => {
    navigate('/emociones');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">{t('productsPage.loadingProducts')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <button
            onClick={handleVolverEmociones}
            className="text-purple-600 hover:text-purple-700 flex items-center space-x-2"
          >
            <span>←</span>
            <span>{t('productsPage.backToEmotions')}</span>
          </button>
        </div>

        {/* Título con emoción seleccionada */}
        <div className="mb-8">
          <div className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full mb-4">
            <span className="font-semibold">{t('productsPage.emotion')} {emocion?.Nombre}</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {tipo === 'Pelicula' && t('productsPage.movies')}
            {tipo === 'Libro' && t('productsPage.books')}
            {tipo === 'Todos' && t('productsPage.allProducts')}
          </h1>
          <p className="text-gray-600">
            {productos.length} {productos.length === 1 ? t('productsPage.productFound') : t('productsPage.productsFound')}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-8">
            {error}
          </div>
        )}

        {/* Grid de Productos */}
        {productos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {productos.map((producto) => (
              <div
                key={producto.Id}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden"
              >
                {/* Imagen del producto */}
                <div className="h-64 bg-gray-200 flex items-center justify-center">
                  {producto.UrlImagen ? (
                    <img
                      src={producto.UrlImagen}
                      alt={producto.Titulo}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-6xl">
                      {producto.Tipo === 'Pelicula' ? '🎬' : '📚'}
                    </span>
                  )}
                </div>

                {/* Información del producto */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${
                      producto.Tipo === 'Pelicula' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {producto.Tipo === 'Pelicula' ? t('productsPage.movie') : t('productsPage.book')}
                    </span>
                    <span className="text-lg font-bold text-purple-600">
                      ${producto.Precio.toFixed(2)}
                    </span>
                  </div>

                  <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                    {producto.Titulo}
                  </h3>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {producto.Descripcion}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>{t('productsPage.stock')}: {producto.Stock}</span>
                    <span className={producto.Stock > 0 ? 'text-green-600' : 'text-red-600'}>
                      {producto.Stock > 0 ? `✓ ${t('productsPage.available')}` : `✗ ${t('productsPage.outOfStock')}`}
                    </span>
                  </div>

                  {puedeComprar ? (
                    <button
                      onClick={() => {
                        agregarProducto(producto);
                        alert(t('productsPage.productAdded'));
                      }}
                      disabled={producto.Stock === 0}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                    {t('productsPage.addToCart')}
                  </button>
                  ) : (
                    <div className="w-full bg-gray-300 text-gray-600 font-medium py-2 px-4 rounded-md text-center">
                      {t('productsPage.viewOnly')}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">😔</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {t('productsPage.noProducts')}
            </h3>
            <p className="text-gray-600 mb-6">
              {t('productsPage.noProductsMessage')}
            </p>
            <button
              onClick={handleVolverEmociones}
              className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
            >
              {t('productsPage.chooseAnotherEmotion')}
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProductosPage;
