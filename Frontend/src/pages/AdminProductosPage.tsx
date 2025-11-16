import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api-endpoints';
import type { Producto, Emocion } from '../lib/types';
import Navbar from '../components/Navbar';
import { useTranslation } from '../lib/language-context';

// Componente del formulario
interface FormularioProductoProps {
  modoEdicion: boolean;
  productoInicial: Producto | null;
  emociones: Emocion[];
  onClose: () => void;
  onGuardar: () => void;
}

function FormularioProducto({ modoEdicion, productoInicial, emociones, onClose, onGuardar }: FormularioProductoProps) {
  const { t } = useTranslation();
  const [tipo, setTipo] = useState<'Pelicula' | 'Libro'>(productoInicial?.Tipo || 'Pelicula');
  const [nombre, setNombre] = useState(productoInicial?.Nombre || productoInicial?.Titulo || '');
  const [descripcion, setDescripcion] = useState(productoInicial?.Descripcion || '');
  const [precio, setPrecio] = useState(productoInicial?.Precio || 0);
  const [stock, setStock] = useState(productoInicial?.Stock || 0);
  const [urlImagen, setUrlImagen] = useState(productoInicial?.UrlImagen || '');
  
  // Campos específicos de Película
  const [director, setDirector] = useState((productoInicial as any)?.Director || '');
  const [productora, setProductora] = useState((productoInicial as any)?.Productora || '');
  const [anioLanzamiento, setAnioLanzamiento] = useState((productoInicial as any)?.AnioLanzamiento || 2024);
  
  // Campos específicos de Libro
  const [autor, setAutor] = useState((productoInicial as any)?.Autor || '');
  const [editorial, setEditorial] = useState('');
  const [isbn, setIsbn] = useState('');
  
  const [emocionesSeleccionadas, setEmocionesSeleccionadas] = useState<number[]>([]);
  const [guardando, setGuardando] = useState(false);

  // Cargar datos cuando se edita un producto
  useEffect(() => {
    if (modoEdicion && productoInicial) {
      setNombre(productoInicial.Nombre || productoInicial.Titulo || '');
      setDescripcion(productoInicial.Descripcion || '');
      setPrecio(productoInicial.Precio || 0);
      setStock(productoInicial.Stock || 0);
      setUrlImagen(productoInicial.UrlImagen || '');
      setTipo(productoInicial.Tipo);
      
      // Cargar emociones asociadas al producto
      if ((productoInicial as any).Emociones && Array.isArray((productoInicial as any).Emociones)) {
        const emocionIds = (productoInicial as any).Emociones.map((e: any) => e.Id);
        setEmocionesSeleccionadas(emocionIds);
      } else {
        setEmocionesSeleccionadas([]);
      }
      
      if (productoInicial.Tipo === 'Pelicula') {
        const pelicula = productoInicial as any;
        setDirector(pelicula.Director || '');
        setProductora(pelicula.Productora || '');
        setAnioLanzamiento(pelicula.AnioLanzamiento || 2024);
      } else {
        const libro = productoInicial as any;
        setAutor(libro.Autor || '');
        setEditorial(libro.Editorial || '');
        setIsbn(libro.ISBN || '');
      }
    }
  }, [modoEdicion, productoInicial]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (emocionesSeleccionadas.length === 0) {
      alert(t('adminProducts.selectAtLeastOneEmotion'));
      return;
    }
    
    setGuardando(true);

    try {
      if (tipo === 'Pelicula') {
        const peliculaData = {
          Nombre: nombre,
          Descripcion: descripcion,
          Precio: precio,
          Stock: stock,
          UrlImagen: urlImagen,
          Director: director,
          Productora: productora,
          AnioLanzamiento: anioLanzamiento,
          EmocionesIds: emocionesSeleccionadas
        };

        if (modoEdicion && productoInicial) {
          await api.peliculas.actualizar(productoInicial.Id, { ...peliculaData, Id: productoInicial.Id } as any);
        } else {
          await api.peliculas.crear(peliculaData as any);
        }
      } else {
        const libroData = {
          Nombre: nombre,
          Descripcion: descripcion,
          Precio: precio,
          Stock: stock,
          UrlImagen: urlImagen,
          Autor: autor,
          Editorial: editorial,
          ISBN: isbn,
          EmocionesIds: emocionesSeleccionadas
        };

        if (modoEdicion && productoInicial) {
          await api.libros.actualizar(productoInicial.Id, { ...libroData, Id: productoInicial.Id } as any);
        } else {
          await api.libros.crear(libroData as any);
        }
      }

      alert(modoEdicion ? t('adminProducts.productUpdated') : t('adminProducts.productCreated'));
      onGuardar();
    } catch (err: any) {
      console.error('Error al guardar producto:', err);
      alert(err.Message || err.message || t('adminProducts.saveError'));
    } finally {
      setGuardando(false);
    }
  };

  const toggleEmocion = (emocionId: number) => {
    setEmocionesSeleccionadas(prev =>
      prev.includes(emocionId)
        ? prev.filter(id => id !== emocionId)
        : [...prev, emocionId]
    );
  };

  return (
    <div className="fixed inset-0 bg-purple-900 bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-purple-900 mb-4">
          {modoEdicion ? t('adminProducts.editProduct') : t('adminProducts.createProduct').replace('+ ', '')}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Selector de Tipo */}
          {!modoEdicion && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('adminProducts.productType')}
              </label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setTipo('Pelicula')}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                    tipo === 'Pelicula'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  🎬 {t('adminProducts.movie')}
                </button>
                <button
                  type="button"
                  onClick={() => setTipo('Libro')}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                    tipo === 'Libro'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  📚 {t('adminProducts.book')}
                </button>
              </div>
            </div>
          )}

          {/* Campos comunes */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('common.name')} {t('adminProducts.required')}
              </label>
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('common.description')} {t('adminProducts.required')}
              </label>
              <textarea
                required
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('common.price')} {t('adminProducts.required')}
              </label>
              <input
                type="number"
                required
                step="0.01"
                min="0"
                value={precio}
                onChange={(e) => setPrecio(parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('products.stock')} {t('adminProducts.required')}
              </label>
              <input
                type="number"
                required
                min="0"
                value={stock}
                onChange={(e) => setStock(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('adminProducts.urlImage')}
              </label>
              <input
                type="text"
                value={urlImagen}
                onChange={(e) => setUrlImagen(e.target.value)}
                placeholder="/images/productos/ejemplo.jpg"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Campos específicos según tipo */}
          {tipo === 'Pelicula' ? (
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('adminProducts.movieData')}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('adminProducts.director')} {t('adminProducts.required')}
                  </label>
                  <input
                    type="text"
                    required
                    value={director}
                    onChange={(e) => setDirector(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('adminProducts.productora')} {t('adminProducts.required')}
                  </label>
                  <input
                    type="text"
                    required
                    value={productora}
                    onChange={(e) => setProductora(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('adminProducts.releaseYear')} {t('adminProducts.required')}
                  </label>
                  <input
                    type="number"
                    required
                    min="1900"
                    max="2100"
                    value={anioLanzamiento}
                    onChange={(e) => setAnioLanzamiento(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('adminProducts.bookData')}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('adminProducts.author')} {t('adminProducts.required')}
                  </label>
                  <input
                    type="text"
                    required
                    value={autor}
                    onChange={(e) => setAutor(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('adminProducts.editorial')} {t('adminProducts.required')}
                  </label>
                  <input
                    type="text"
                    required
                    value={editorial}
                    onChange={(e) => setEditorial(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('adminProducts.isbn')} {t('adminProducts.required')}
                  </label>
                  <input
                    type="text"
                    required
                    value={isbn}
                    onChange={(e) => setIsbn(e.target.value)}
                    placeholder="978-0307474728"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Selección de Emociones */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">{t('adminProducts.associatedEmotions')}</h3>
            <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto p-2 bg-gray-50 rounded-lg">
              {emociones.map((emocion) => (
                <label
                  key={emocion.Id}
                  className="flex items-center gap-2 p-1.5 border border-gray-200 rounded hover:bg-purple-50 cursor-pointer bg-white"
                >
                  <input
                    type="checkbox"
                    checked={emocionesSeleccionadas.includes(emocion.Id)}
                    onChange={() => toggleEmocion(emocion.Id)}
                    className="w-3 h-3 text-purple-600 rounded"
                  />
                  <span className="text-xs">{emocion.Nombre}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-2 sticky bottom-0 bg-white">
            <button
              type="submit"
              disabled={guardando}
              className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50"
            >
              {guardando ? t('common.saving') : (modoEdicion ? t('adminProducts.update') : t('adminProducts.create'))}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={guardando}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors font-medium disabled:opacity-50"
            >
              {t('common.cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminProductosPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [emociones, setEmociones] = useState<Emocion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroTipo, setFiltroTipo] = useState<'Todos' | 'Pelicula' | 'Libro'>('Todos');
  const [showModal, setShowModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [productoEditando, setProductoEditando] = useState<Producto | null>(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Cargando todos los productos...');
      const [productosData, emocionesData] = await Promise.all([
        api.productos.listar(), // Siempre cargar todos los productos sin filtros
        api.emociones.listar()
      ]);
      console.log('Productos recibidos:', productosData);
      console.log('Tipos de productos:', productosData.map(p => ({ id: p.Id, tipo: p.Tipo, nombre: p.Nombre || p.Titulo })));
      
      setProductos(productosData);
      setEmociones(emocionesData);
    } catch (err: any) {
      console.error('Error cargando datos:', err);
      setError(err.Message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleCrearProducto = () => {
    setModoEdicion(false);
    setProductoEditando(null);
    setShowModal(true);
  };

  const handleEditarProducto = (producto: Producto) => {
    setModoEdicion(true);
    setProductoEditando(producto);
    setShowModal(true);
  };

  const handleEliminarProducto = async (id: number) => {
    if (!confirm(t('adminProducts.deleteConfirm'))) return;

    try {
      await api.productos.eliminar(id);
      await cargarDatos();
      alert(t('adminProducts.productDeleted'));
    } catch (err: any) {
      alert(err.Message || t('adminProducts.deleteError'));
    }
  };

  // Filtrar productos en el frontend
  const productosFiltrados = filtroTipo === 'Todos' 
    ? productos 
    : productos.filter(p => p.Tipo === filtroTipo);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">{t('adminProducts.loadingProducts')}</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-purple-900 mb-2">
            🎬📚 {t('adminProducts.title')}
          </h1>
          <p className="text-gray-600">
            {t('adminProducts.subtitle')}
          </p>
        </div>

        {/* Navegación de administración */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => navigate('/admin/productos')}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium"
              >
                📦 {t('navbar.products')}
              </button>
              <button
                onClick={() => navigate('/admin/emociones')}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
              >
                😊 {t('navbar.emotions')}
              </button>
            </div>
          </div>
        </div>

        {/* Filtros y acciones */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setFiltroTipo('Todos')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filtroTipo === 'Todos'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {t('adminProducts.all')}
            </button>
            <button
              onClick={() => setFiltroTipo('Pelicula')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filtroTipo === 'Pelicula'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              🎬 {t('productsPage.movies')}
            </button>
            <button
              onClick={() => setFiltroTipo('Libro')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filtroTipo === 'Libro'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              📚 {t('productsPage.books')}
            </button>
          </div>
          <div className="text-sm text-gray-600">
            {t('adminProducts.showing')} {productosFiltrados.length} {filtroTipo === 'Todos' ? t('products.title').toLowerCase() : filtroTipo === 'Pelicula' ? t('adminProducts.movies') : t('adminProducts.books')}
          </div>

          <button
            onClick={handleCrearProducto}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            {t('adminProducts.createProduct')}
          </button>
        </div>

        {/* Tabla de productos */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-purple-600 text-white">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">{t('common.id')}</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">{t('common.type')}</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">{t('common.name')}</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">{t('common.price')}</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">{t('products.stock')}</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {productosFiltrados.map((producto) => (
                  <tr key={producto.Id} className="hover:bg-purple-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900">{producto.Id}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        producto.Tipo === 'Pelicula'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {producto.Tipo === 'Pelicula' ? `🎬 ${t('adminProducts.movie')}` : `📚 ${t('adminProducts.book')}`}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {producto.Nombre || producto.Titulo}
                      </div>
                      <div className="text-xs text-gray-500 line-clamp-1">
                        {producto.Descripcion}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-purple-600">
                      ${producto.Precio.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {producto.Stock}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEditarProducto(producto)}
                          className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                          title={t('common.edit')}
                        >
                          ✏️ {t('common.edit')}
                        </button>
                        <button
                          onClick={() => handleEliminarProducto(producto.Id)}
                          className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                          title={t('common.delete')}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {productosFiltrados.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            {t('adminProducts.noProducts')}
          </div>
        )}
      </div>

      {/* Modal de Crear/Editar */}
      {showModal && (
        <FormularioProducto
          modoEdicion={modoEdicion}
          productoInicial={productoEditando}
          emociones={emociones}
          onClose={() => {
            setShowModal(false);
            setProductoEditando(null);
          }}
          onGuardar={async () => {
            await cargarDatos();
            setShowModal(false);
            setProductoEditando(null);
          }}
        />
      )}
    </div>
  );
}
