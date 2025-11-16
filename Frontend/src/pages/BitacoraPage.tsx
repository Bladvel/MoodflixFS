import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { bitacoraAPI, usuariosAPI } from '../lib/api-endpoints';
import type { BitacoraEvento, Usuario } from '../lib/types';
import { useTranslation } from '../lib/language-context';

const BitacoraPage: React.FC = () => {
  const { t } = useTranslation();
  const [eventos, setEventos] = useState<BitacoraEvento[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [criticidadFiltro, setCriticidadFiltro] = useState<number | ''>('');
  const [usuarioIdFiltro, setUsuarioIdFiltro] = useState<number | ''>('');
  
  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina, setItemsPorPagina] = useState(10);

  useEffect(() => {
    cargarEventos();
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      console.log('Cargando lista de usuarios...');
      const data = await usuariosAPI.listar();
      console.log('Usuarios cargados:', data);
      console.log('Total de usuarios:', data.length);
      
      if (data && Array.isArray(data) && data.length > 0) {
        setUsuarios(data);
        console.log('✅ Usuarios cargados correctamente');
      } else {
        console.warn('⚠️ La respuesta no contiene usuarios');
        setUsuarios([]);
      }
    } catch (err: any) {
      console.error('❌ Error al cargar usuarios:', err);
      console.error('Error Message:', err.Message);
      console.error('Error StatusCode:', err.StatusCode);
      
      // Si es error 403 (Forbidden), el usuario no tiene permisos
      if (err.StatusCode === 403 || err.StatusCode === 401) {
        console.warn('⚠️ El usuario no tiene permisos para ver la lista de usuarios');
      }
      
      // No mostramos error al usuario, solo dejamos el dropdown vacío
      // El filtro seguirá funcionando con los otros campos
      setUsuarios([]);
    }
  };

  const cargarEventos = async (filtros?: { fechaDesde?: string; fechaHasta?: string }) => {
    setLoading(true);
    setError('');

    try {
      console.log('Cargando bitácora con filtros:', filtros);
      const data = await bitacoraAPI.listar(filtros);
      console.log('Bitácora cargada:', data);
      setEventos(data);
      setError(''); // Limpiar error si fue exitoso
    } catch (err: any) {
      console.error('Error completo al cargar bitácora:', err);
      console.error('Error Message:', err.Message);
      console.error('Error ExceptionMessage:', err.ExceptionMessage);
      
      let errorMsg = 'Error al cargar la bitácora';
      
      if (err.StatusCode === 500) {
        errorMsg = '⚠️ Error interno del servidor (500). El backend tiene un problema al procesar la bitácora. Posibles causas: referencia circular en la serialización JSON, problema con enums, o error en la base de datos.';
      } else if (err.ExceptionMessage) {
        errorMsg = `Error: ${err.ExceptionMessage}`;
      } else if (err.Message) {
        errorMsg = `Error: ${err.Message}`;
      } else if (err.message) {
        errorMsg = `Error: ${err.message}`;
      }
      
      setError(errorMsg);
      setEventos([]); // Limpiar eventos en caso de error
    } finally {
      setLoading(false);
    }
  };

  const handleFiltrar = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convertir fechas al formato que espera el backend
    const filtros: any = {};
    
    if (fechaDesde) {
      // Formato: "2025-10-01T04:37:00.000Z" o "2025-10-01 04:37:00"
      const fecha = new Date(fechaDesde);
      // Usar formato ISO sin milisegundos
      filtros.fechaDesde = fecha.toISOString().split('.')[0] + 'Z';
    }
    
    if (fechaHasta) {
      const fecha = new Date(fechaHasta);
      filtros.fechaHasta = fecha.toISOString().split('.')[0] + 'Z';
    }

    if (criticidadFiltro !== '') {
      filtros.criticidad = criticidadFiltro;
    }

    if (usuarioIdFiltro !== '') {
      filtros.usuarioId = usuarioIdFiltro;
    }
    
    console.log('Filtrando con:', filtros);
    setPaginaActual(1); // Resetear a la primera página al filtrar
    cargarEventos(filtros);
  };

  const handleLimpiarFiltros = () => {
    setFechaDesde('');
    setFechaHasta('');
    setCriticidadFiltro('');
    setUsuarioIdFiltro('');
    setPaginaActual(1);
    cargarEventos();
  };

  // Calcular paginación
  const indexUltimoItem = paginaActual * itemsPorPagina;
  const indexPrimerItem = indexUltimoItem - itemsPorPagina;
  const eventosPaginados = eventos.slice(indexPrimerItem, indexUltimoItem);
  const totalPaginas = Math.ceil(eventos.length / itemsPorPagina);

  const cambiarPagina = (numeroPagina: number) => {
    setPaginaActual(numeroPagina);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const generarNumerosPagina = () => {
    const numeros: (number | string)[] = [];
    const maxBotones = 7;

    if (totalPaginas <= maxBotones) {
      for (let i = 1; i <= totalPaginas; i++) {
        numeros.push(i);
      }
    } else {
      if (paginaActual <= 3) {
        for (let i = 1; i <= 4; i++) numeros.push(i);
        numeros.push('...');
        numeros.push(totalPaginas);
      } else if (paginaActual >= totalPaginas - 2) {
        numeros.push(1);
        numeros.push('...');
        for (let i = totalPaginas - 3; i <= totalPaginas; i++) numeros.push(i);
      } else {
        numeros.push(1);
        numeros.push('...');
        for (let i = paginaActual - 1; i <= paginaActual + 1; i++) numeros.push(i);
        numeros.push('...');
        numeros.push(totalPaginas);
      }
    }

    return numeros;
  };

  const formatearFecha = (fecha: string) => {
    try {
      return new Date(fecha).toLocaleString('es-AR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return fecha;
    }
  };

  const getCriticidadColor = (criticidad: number) => {
    if (criticidad >= 3) return 'bg-red-100 text-red-800';
    if (criticidad === 2) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getCriticidadNombre = (criticidad: number) => {
    if (criticidad >= 4) return t('bitacora.critical');
    if (criticidad === 3) return t('bitacora.error');
    if (criticidad === 2) return t('bitacora.warning');
    if (criticidad === 1) return t('bitacora.info');
    return t('bitacora.low');
  };

  const getModuloNombre = (modulo: string | number): string => {
    // Si ya es string, devolverlo
    if (typeof modulo === 'string') return modulo;
    
    // Mapeo exacto del enum TipoModulo del backend
    const modulosMap: Record<number, string> = {
      0: 'InicioSesion',
      1: 'Emociones',
      2: 'Productos',
      3: 'Bitacora',
      4: 'LibroOPelicula',
      5: 'Backup',
      6: 'Carrito',
      7: 'ABM',
      8: 'Desconocido',
      9: 'Permisos',
      10: 'Usuarios',
      11: 'Pedidos'
    };
    
    return modulosMap[modulo] || `Módulo ${modulo}`;
  };

  const getOperacionNombre = (operacion: string | number): string => {
    // Si ya es string, devolverlo
    if (typeof operacion === 'string') return operacion;
    
    // Mapeo exacto del enum TipoOperacion del backend
    const operacionesMap: Record<number, string> = {
      0: 'Login',
      1: 'Logout',
      2: 'Desconocida',
      3: 'Alta',
      4: 'Actualizacion',
      5: 'Baja',
      6: 'GeneracionBackup',
      7: 'RestauracionBackup'
    };
    
    return operacionesMap[operacion] || `Operación ${operacion}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">{t('bitacora.title')}</h1>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            🔍 {t('bitacora.searchFilters')}
          </h2>
          <form onSubmit={handleFiltrar} className="space-y-4">
            {/* Fila 1: Fechas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📅 {t('bitacora.dateFrom')}
                </label>
                <input
                  type="datetime-local"
                  value={fechaDesde}
                  onChange={(e) => setFechaDesde(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📅 {t('bitacora.dateTo')}
                </label>
                <input
                  type="datetime-local"
                  value={fechaHasta}
                  onChange={(e) => setFechaHasta(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                />
              </div>
            </div>

            {/* Fila 2: Usuario y Criticidad */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  👤 {t('bitacora.userFilter')} {usuarios.length > 0 && <span className="text-xs text-gray-500">({usuarios.length} {t('bitacora.allUsers').toLowerCase()})</span>}
                </label>
                <select
                  value={usuarioIdFiltro}
                  onChange={(e) => setUsuarioIdFiltro(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                  disabled={usuarios.length === 0}
                >
                  <option value="">
                    {usuarios.length === 0 ? t('bitacora.loadingUsers') : t('bitacora.allUsers')}
                  </option>
                  {usuarios.map((usuario) => (
                    <option key={usuario.Id} value={usuario.Id}>
                      {usuario.NombreUsuario} ({usuario.Email})
                    </option>
                  ))}
                </select>
                {usuarios.length === 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    ℹ️ {t('bitacora.usersNotAvailable')}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ⚠️ {t('bitacora.criticalityFilter')}
                </label>
                <select
                  value={criticidadFiltro}
                  onChange={(e) => setCriticidadFiltro(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                >
                  <option value="">{t('bitacora.allCriticalities')}</option>
                  <option value="0">{t('bitacora.low')} (0)</option>
                  <option value="1">{t('bitacora.info')} (1)</option>
                  <option value="2">{t('bitacora.warning')} (2)</option>
                  <option value="3">{t('bitacora.error')} (3)</option>
                  <option value="4">{t('bitacora.critical')} (4+)</option>
                </select>
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? `⏳ ${t('bitacora.filtering')}` : `🔍 ${t('bitacora.applyFilters')}`}
              </button>
              <button
                type="button"
                onClick={handleLimpiarFiltros}
                disabled={loading}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-6 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                🗑️ {t('bitacora.clearFilters')}
              </button>
            </div>
          </form>
        </div>

        {/* Mensajes */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {/* Tabla de eventos */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('bitacora.id')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('bitacora.date')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('bitacora.user')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('bitacora.module')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('bitacora.operation')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('bitacora.criticality')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('bitacora.message')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      {t('common.loading')}
                    </td>
                  </tr>
                ) : eventos.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      {t('bitacora.noEvents')}
                    </td>
                  </tr>
                ) : (
                  eventosPaginados.map((evento) => (
                    <tr key={evento.Id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {evento.Id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatearFecha(evento.Fecha)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {evento.Usuario?.Email || evento.Usuario?.NombreUsuario || t('bitacora.system')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {getModuloNombre(evento.Modulo)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {getOperacionNombre(evento.Operacion)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getCriticidadColor(
                            evento.Criticidad
                          )}`}
                        >
                          {getCriticidadNombre(evento.Criticidad)} ({evento.Criticidad})
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-md truncate" title={evento.Mensaje}>
                        {evento.Mensaje}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Paginación */}
        {eventos.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-md p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Selector de items por página */}
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Mostrar:</label>
                <select
                  value={itemsPorPagina}
                  onChange={(e) => {
                    setItemsPorPagina(Number(e.target.value));
                    setPaginaActual(1);
                  }}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="text-sm text-gray-600">{t('bitacora.perPage')}</span>
              </div>

              {/* Información de paginación */}
              <div className="text-sm text-gray-600">
                {t('bitacora.showing')} <span className="font-semibold">{indexPrimerItem + 1}</span> {t('bitacora.to')}{' '}
                <span className="font-semibold">{Math.min(indexUltimoItem, eventos.length)}</span> {t('bitacora.of')}{' '}
                <span className="font-semibold">{eventos.length}</span> {t('bitacora.events')}
              </div>

              {/* Botones de paginación */}
              <div className="flex items-center gap-1">
                {/* Botón Primera Página */}
                <button
                  onClick={() => cambiarPagina(1)}
                  disabled={paginaActual === 1}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Primera página"
                >
                  ««
                </button>

                {/* Botón Anterior */}
                <button
                  onClick={() => cambiarPagina(paginaActual - 1)}
                  disabled={paginaActual === 1}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Página anterior"
                >
                  «
                </button>

                {/* Números de página */}
                {generarNumerosPagina().map((numero, index) => (
                  <React.Fragment key={index}>
                    {numero === '...' ? (
                      <span className="px-3 py-1 text-gray-500">...</span>
                    ) : (
                      <button
                        onClick={() => cambiarPagina(numero as number)}
                        className={`px-3 py-1 border rounded-md text-sm font-medium transition-colors ${
                          paginaActual === numero
                            ? 'bg-purple-600 text-white border-purple-600 hover:bg-purple-700'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {numero}
                      </button>
                    )}
                  </React.Fragment>
                ))}

                {/* Botón Siguiente */}
                <button
                  onClick={() => cambiarPagina(paginaActual + 1)}
                  disabled={paginaActual === totalPaginas}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Página siguiente"
                >
                  »
                </button>

                {/* Botón Última Página */}
                <button
                  onClick={() => cambiarPagina(totalPaginas)}
                  disabled={paginaActual === totalPaginas}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Última página"
                >
                  »»
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Información adicional */}
        <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <p className="font-semibold">📊 {t('bitacora.totalEvents')} <span className="text-purple-600">{eventos.length}</span></p>
            </div>
            {(fechaDesde || fechaHasta || criticidadFiltro !== '' || usuarioIdFiltro !== '') && (
              <div className="text-xs text-gray-500">
                <p className="font-medium">{t('bitacora.activeFilters')}</p>
                <div className="flex gap-2 mt-1 flex-wrap">
                  {fechaDesde && (
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {t('bitacora.from')}: {new Date(fechaDesde).toLocaleDateString()}
                    </span>
                  )}
                  {fechaHasta && (
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {t('bitacora.to')}: {new Date(fechaHasta).toLocaleDateString()}
                    </span>
                  )}
                  {criticidadFiltro !== '' && (
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      {t('bitacora.criticalityFilter')}: {getCriticidadNombre(Number(criticidadFiltro))}
                    </span>
                  )}
                  {usuarioIdFiltro !== '' && (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                      {t('bitacora.userFilter')}: {usuarios.find(u => u.Id === usuarioIdFiltro)?.NombreUsuario}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default BitacoraPage;
