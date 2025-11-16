import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api-endpoints";
import type { Emocion } from "../lib/types";
import Navbar from "../components/Navbar";
import { useTranslation } from "../lib/language-context";

// Lista de emojis disponibles
const EMOJIS_DISPONIBLES = [
  "😊",
  "😢",
  "😡",
  "😨",
  "😍",
  "🤔",
  "😴",
  "🤗",
  "😎",
  "🥳",
  "😱",
  "🤯",
  "😇",
  "🤩",
  "😌",
  "😏",
  "🙂",
  "😃",
  "😄",
  "😁",
  "😆",
  "😅",
  "🤣",
  "😂",
  "🥰",
  "😘",
  "😗",
  "😙",
  "😚",
  "🤪",
  "😜",
  "😝",
];

// Componente del formulario
interface FormularioEmocionProps {
  modoEdicion: boolean;
  emocionInicial: Emocion | null;
  onClose: () => void;
  onGuardar: () => void;
}

function FormularioEmocion({
  modoEdicion,
  emocionInicial,
  onClose,
  onGuardar,
}: FormularioEmocionProps) {
  const { t } = useTranslation();
  const [nombre, setNombre] = useState(emocionInicial?.Nombre || "");
  const [urlImagen, setUrlImagen] = useState(emocionInicial?.UrlImagen || "😊");
  const [guardando, setGuardando] = useState(false);
  const [mostrarSelectorEmoji, setMostrarSelectorEmoji] = useState(false);

  // Actualizar valores cuando cambia emocionInicial
  useEffect(() => {
    if (emocionInicial) {
      setNombre(emocionInicial.Nombre || "");
      setUrlImagen(emocionInicial.UrlImagen || "😊");
    } else {
      setNombre("");
      setUrlImagen("😊");
    }
  }, [emocionInicial]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);

    try {
      // Solo enviar los campos que existen en la BD: Nombre y UrlImagen
      const emocionData = {
        Nombre: nombre,
        UrlImagen: urlImagen,
      };

      console.log(
        "Guardando emoción:",
        modoEdicion ? "Actualizar" : "Crear",
        emocionData
      );

      if (modoEdicion && emocionInicial) {
        console.log("ID de emoción a actualizar:", emocionInicial.Id);

        // El backend requiere que el Id esté en el body Y coincida con el Id de la URL
        const emocionConId = {
          ...emocionData,
          Id: emocionInicial.Id,
        };

        console.log("Datos a enviar:", JSON.stringify(emocionConId));
        await api.emociones.actualizar(emocionInicial.Id, emocionConId as any);
      } else {
        await api.emociones.crear(emocionData as any);
      }

      alert(modoEdicion ? t('adminEmotions.emotionUpdated') : t('adminEmotions.emotionCreated'));
      onGuardar();
    } catch (err: any) {
      console.error("Error al guardar emoción:", err);
      const errorMsg =
        err.Message || err.message || t('adminEmotions.saveError');
      alert(errorMsg);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-purple-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-purple-900 mb-4">
          {modoEdicion ? t('adminEmotions.editEmotion') : t('adminEmotions.createEmotion').replace('+ ', '')}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('common.name')} *
            </label>
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Felicidad, Tristeza, Enojo"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Imagen/Emoji */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('adminEmotions.imageOrEmoji')} *
            </label>
            <div className="space-y-3">
              {/* Input de texto para URL o emoji */}
              <input
                type="text"
                required
                value={urlImagen}
                onChange={(e) => setUrlImagen(e.target.value)}
                placeholder="/images/emociones/felicidad.png o 😊"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />

              {/* Selector rápido de emojis */}
              <div>
                <button
                  type="button"
                  onClick={() => setMostrarSelectorEmoji(!mostrarSelectorEmoji)}
                  className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm"
                >
                  {mostrarSelectorEmoji
                    ? t('adminEmotions.closeEmojiSelector')
                    : t('adminEmotions.selectEmoji')}
                </button>
              </div>
            </div>

            {/* Selector de emojis */}
            {mostrarSelectorEmoji && (
              <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="grid grid-cols-8 gap-2">
                  {EMOJIS_DISPONIBLES.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => {
                        setUrlImagen(emoji);
                        setMostrarSelectorEmoji(false);
                      }}
                      className={`text-3xl p-2 rounded-lg hover:bg-purple-100 transition-colors ${
                        urlImagen === emoji
                          ? "bg-purple-200 ring-2 ring-purple-500"
                          : "bg-white"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Preview */}
          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {t('adminEmotions.preview')}
            </label>
            <div className="inline-flex flex-col items-center justify-center p-8 rounded-2xl shadow-lg bg-gradient-to-br from-purple-500 to-pink-500">
              <div className="text-7xl mb-3">{urlImagen}</div>
              <div className="text-white font-bold text-xl">
                {nombre || t('adminEmotions.emotionName')}
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={guardando}
              className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50"
            >
              {guardando
                ? t('adminEmotions.creating')
                : modoEdicion
                ? t('adminEmotions.update')
                : t('adminEmotions.create')}
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

export default function AdminEmocionesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [emociones, setEmociones] = useState<Emocion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [emocionEditando, setEmocionEditando] = useState<Emocion | null>(null);

  useEffect(() => {
    cargarEmociones();
  }, []);

  const cargarEmociones = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.emociones.listar();
      setEmociones(data);
    } catch (err: any) {
      console.error("Error cargando emociones:", err);
      setError(err.Message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleCrearEmocion = () => {
    setModoEdicion(false);
    setEmocionEditando(null);
    setShowModal(true);
  };

  const handleEditarEmocion = (emocion: Emocion) => {
    setModoEdicion(true);
    setEmocionEditando(emocion);
    setShowModal(true);
  };

  const handleEliminarEmocion = async (id: number) => {
    if (!confirm(t('adminEmotions.deleteConfirm')))
      return;

    try {
      await api.emociones.eliminar(id);
      await cargarEmociones();
      alert(t('adminEmotions.emotionDeleted'));
    } catch (err: any) {
      alert(err.Message || t('adminEmotions.deleteError'));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">{t('adminEmotions.loadingEmotions')}</div>
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
            😊 {t('adminEmotions.title')}
          </h1>
          <p className="text-gray-600">
            {t('adminEmotions.subtitle')}
          </p>
        </div>

        {/* Navegación de administración */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => navigate("/admin/productos")}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
              >
                📦 {t('navbar.products')}
              </button>
              <button
                onClick={() => navigate("/admin/emociones")}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium"
              >
                😊 {t('navbar.emotions')}
              </button>
            </div>
            <button
              onClick={handleCrearEmocion}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              {t('adminEmotions.createEmotion')}
            </button>
          </div>
        </div>

        {/* Grid de emociones */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {emociones.map((emocion) => (
            <div
              key={emocion.Id}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              {/* Preview de la emoción */}
              <div className="h-40 flex flex-col items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500">
                <div className="text-6xl mb-2">{emocion.UrlImagen || "😊"}</div>
                <div className="text-white font-semibold text-xl">
                  {emocion.Nombre}
                </div>
              </div>

              {/* Información */}
              <div className="p-4">
                <div className="mb-4">
                  <div className="text-sm text-gray-500 mb-1">
                    ID: {emocion.Id}
                  </div>
                  <div className="text-lg font-semibold text-gray-800">
                    {emocion.Nombre}
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditarEmocion(emocion)}
                    className="flex-1 px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                    title={t('common.edit')}
                  >
                    ✏️ {t('common.edit')}
                  </button>
                  <button
                    onClick={() => handleEliminarEmocion(emocion.Id)}
                    className="px-3 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                    title={t('common.delete')}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {emociones.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">😊</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {t('adminEmotions.noEmotions')}
            </h3>
            <p className="text-gray-600 mb-4">
              {t('adminEmotions.noEmotionsMessage')}
            </p>
          </div>
        )}
      </div>

      {/* Modal de Crear/Editar */}
      {showModal && (
        <FormularioEmocion
          modoEdicion={modoEdicion}
          emocionInicial={emocionEditando}
          onClose={() => {
            setShowModal(false);
            setEmocionEditando(null);
          }}
          onGuardar={async () => {
            await cargarEmociones();
            setShowModal(false);
            setEmocionEditando(null);
          }}
        />
      )}
    </div>
  );
}
