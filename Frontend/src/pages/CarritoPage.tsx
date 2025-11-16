import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useCarrito } from '../lib/carrito-context';
import { useAuth } from '../lib/auth-context';
import { api } from '../lib/api-endpoints';
import { useTranslation } from '../lib/language-context';

const CarritoPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, eliminarProducto, actualizarCantidad, vaciarCarrito, totalPrecio } = useCarrito();
  const { usuario } = useAuth();
  const [direccionEnvio, setDireccionEnvio] = useState('');
  const [procesando, setProcesando] = useState(false);
  const { t } = useTranslation();

  const handleFinalizarCompra = async () => {
    if (!direccionEnvio.trim()) {
      alert(t('cart.shippingAddressError'));
      return;
    }

    if (items.length === 0) {
      alert(t('cart.emptyCartError'));
      return;
    }

    setProcesando(true);

    try {
      // Crear el pedido
      const pedidoData = {
        DireccionEnvioId: 1, // Por ahora usamos un ID fijo
        Items: items.map(item => ({
          ProductoId: item.producto.Id,
          Cantidad: item.cantidad,
          PrecioUnitario: item.producto.Precio
        }))
      };

      const response = await api.pedidos.crear(pedidoData);
      
      if (response.Success) {
        alert(t('cart.purchaseSuccess'));
        vaciarCarrito();
        navigate('/mis-compras');
      } else {
        alert(response.Message || t('cart.purchaseError'));
      }
    } catch (error: any) {
      console.error('Error al procesar compra:', error);
      alert(error.Message || t('cart.purchaseError'));
    } finally {
      setProcesando(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('cart.empty')}</h2>
            <p className="text-gray-600 mb-6">{t('cart.emptyMessage')}</p>
            <button
              onClick={() => navigate('/emociones')}
              className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
            >
              {t('products.exploreProducts')}
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">🛒 {t('cart.title')}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista de productos */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.producto.Id} className="bg-white rounded-lg shadow-md p-4 flex gap-4">
                <div className="w-24 h-24 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                  {item.producto.UrlImagen ? (
                    <img src={item.producto.UrlImagen} alt={item.producto.Nombre} className="w-full h-full object-cover rounded" />
                  ) : (
                    <span className="text-4xl">{item.producto.Tipo === 'Pelicula' ? '🎬' : '📚'}</span>
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{item.producto.Nombre || item.producto.Titulo}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{item.producto.Descripcion}</p>
                  <p className="text-purple-600 font-bold mt-2">${item.producto.Precio.toFixed(2)}</p>
                </div>

                <div className="flex flex-col items-end justify-between">
                  <button
                    onClick={() => eliminarProducto(item.producto.Id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    🗑️ {t('cart.remove')}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => actualizarCantidad(item.producto.Id, item.cantidad - 1)}
                      className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-semibold">{item.cantidad}</span>
                    <button
                      onClick={() => actualizarCantidad(item.producto.Id, item.cantidad + 1)}
                      disabled={item.cantidad >= item.producto.Stock}
                      className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded flex items-center justify-center disabled:opacity-50"
                    >
                      +
                    </button>
                  </div>

                  <p className="font-bold text-gray-800">
                    ${(item.producto.Precio * item.cantidad).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Resumen de compra */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4">{t('cart.purchaseSummary')}</h2>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>{t('cart.subtotal')}:</span>
                  <span>${totalPrecio.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>{t('cart.shipping')}:</span>
                  <span>{t('common.free')}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold text-lg">
                  <span>{t('cart.total')}:</span>
                  <span className="text-purple-600">${totalPrecio.toFixed(2)}</span>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('cart.shippingAddressRequired')}
                </label>
                <textarea
                  value={direccionEnvio}
                  onChange={(e) => setDireccionEnvio(e.target.value)}
                  placeholder={t('cart.shippingAddressPlaceholder')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <button
                onClick={handleFinalizarCompra}
                disabled={procesando}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                {procesando ? t('common.processing') : t('cart.checkout')}
              </button>

              <button
                onClick={vaciarCarrito}
                className="w-full mt-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                {t('cart.emptyCart')}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CarritoPage;
