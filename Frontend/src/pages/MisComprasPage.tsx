import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { api } from '../lib/api-endpoints';
import { useAuth } from '../lib/auth-context';
import type { Pedido } from '../lib/types';
import { useTranslation } from '../lib/language-context';

const MisComprasPage: React.FC = () => {
  const navigate = useNavigate();
  const { tienePermiso, permisos } = useAuth();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pedidosExpandidos, setPedidosExpandidos] = useState<Record<number, boolean>>({});
  const { t } = useTranslation();
  
  // Verificar si puede gestionar pedidos (Admin o permiso específico)
  const puedeGestionarPedidos = tienePermiso('ADMINISTRADOR') || tienePermiso('GESTIONAR_PEDIDOS') || tienePermiso('GESTIONAR_USUARIOS');
  const esAdmin = puedeGestionarPedidos;

  const toggleExpandido = (pedidoId: number) => {
    setPedidosExpandidos(prev => ({
      ...prev,
      [pedidoId]: !prev[pedidoId]
    }));
  };

  useEffect(() => {
    cargarPedidos();
  }, []);

  const cargarPedidos = async () => {
    try {
      // Si es admin, cargar TODOS los pedidos, si no, solo los del usuario
      const data = esAdmin 
        ? await api.pedidos.listarTodos() 
        : await api.pedidos.listar();
      
      console.log('Pedidos recibidos:', data);
      console.log('Items del primer pedido:', data[0]?.Items);
      setPedidos(data);
    } catch (err: any) {
      setError('Error al cargar los pedidos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Completado':
        return 'bg-green-100 text-green-800';
      case 'Creado':
      case 'Pagado':
        return 'bg-yellow-100 text-yellow-800';
      case 'EnPreparacion':
      case 'Enviado':
        return 'bg-blue-100 text-blue-800';
      case 'Cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCambiarEstado = async (pedidoId: number, nuevoEstado: string) => {
    try {
      const response = await api.pedidos.actualizarEstado(pedidoId, nuevoEstado);
      if (response.Success) {
        alert(t('orders.statusUpdated'));
        cargarPedidos(); // Recargar la lista
      } else {
        alert(response.Message || t('orders.statusUpdateError'));
      }
    } catch (error: any) {
      console.error('Error al cambiar estado:', error);
      alert(error.Message || t('orders.statusUpdateError'));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">{t('common.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          {esAdmin ? `📋 ${t('orders.orderManagement')}` : `📦 ${t('orders.myOrders')}`}
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-8">
            {error}
          </div>
        )}

        {pedidos.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('orders.noOrders')}</h2>
            <p className="text-gray-600 mb-6">{t('orders.noOrdersMessage')}</p>
            <button
              onClick={() => navigate('/emociones')}
              className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
            >
              {t('products.exploreProducts')}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {pedidos.map((pedido) => (
              <div key={pedido.Id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {t('orders.orderNumber')}{pedido.Id}
                          {esAdmin && pedido.Usuario && (
                            <span className="text-sm font-normal text-gray-600 ml-2">
                              - {t('orders.client')}: {pedido.Usuario.NombreUsuario}
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {new Date(pedido.FechaPedido).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        {esAdmin ? (
                          <select
                            value={pedido.Estado}
                            onChange={(e) => handleCambiarEstado(pedido.Id, e.target.value)}
                            className={`px-3 py-1 rounded-full text-sm font-medium border-2 cursor-pointer ${getEstadoColor(pedido.Estado)}`}
                          >
                            <option value="Creado">{t('orders.states.created')}</option>
                            <option value="Pagado">{t('orders.states.paid')}</option>
                            <option value="EnPreparacion">{t('orders.states.inPreparation')}</option>
                            <option value="Enviado">{t('orders.states.shipped')}</option>
                            <option value="Completado">{t('orders.states.completed')}</option>
                            <option value="Cancelado">{t('orders.states.cancelled')}</option>
                          </select>
                        ) : (
                          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getEstadoColor(pedido.Estado)}`}>
                            {pedido.Estado}
                          </span>
                        )}
                        <p className="text-2xl font-bold text-purple-600 mt-2">
                          ${pedido.Total.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Botón para expandir/colapsar detalles */}
                    <button
                      onClick={() => toggleExpandido(pedido.Id)}
                      className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors flex items-center justify-center gap-2"
                    >
                      {pedidosExpandidos[pedido.Id] ? `▼ ${t('orders.hideDetails')}` : `▶ ${t('orders.showDetails')}`}
                    </button>

                    {/* Detalles del pedido (expandible) */}
                    {pedidosExpandidos[pedido.Id] && (pedido.Items || pedido.Detalles) && (pedido.Items || pedido.Detalles)!.length > 0 && (
                      <div className="border-t mt-4 pt-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">{t('orders.products')}</h4>
                        <div className="space-y-3">
                          {(pedido.Items || pedido.Detalles)!.map((item) => (
                            <div key={item.Id} className="flex gap-4 p-3 bg-gray-50 rounded-lg">
                              <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                                {item.Producto?.UrlImagen ? (
                                  <img 
                                    src={item.Producto.UrlImagen} 
                                    alt={item.Producto.Nombre} 
                                    className="w-full h-full object-cover rounded"
                                  />
                                ) : (
                                  <span className="text-3xl">
                                    {item.Producto?.Tipo === 'Pelicula' ? '🎬' : '📚'}
                                  </span>
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-gray-800">
                                  {item.Producto?.Nombre || t('orders.product')}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {item.Producto?.Descripcion}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                  {t('common.quantity')}: {item.Cantidad} × ${item.PrecioUnitario.toFixed(2)}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-gray-800">
                                  ${((item.Subtotal || (item.Cantidad * item.PrecioUnitario))).toFixed(2)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MisComprasPage;
