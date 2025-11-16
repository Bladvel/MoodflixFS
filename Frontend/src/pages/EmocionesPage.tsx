import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { emocionesAPI } from '../lib/api-endpoints';
import type { Emocion } from '../lib/types';
import { useTranslation } from '../lib/language-context';

const EmocionesPage: React.FC = () => {
  const { t } = useTranslation();
  const [emociones, setEmociones] = useState<Emocion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    cargarEmociones();
  }, []);

  const cargarEmociones = async () => {
    try {
      const data = await emocionesAPI.listar();
      setEmociones(data);
    } catch (err: any) {
      setError(t('common.error'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEmocionClick = (emocionId: number) => {
    navigate(`/tipo-producto/${emocionId}`);
  };

  // Colores para las emociones
  const getEmocionColor = (nombre: string) => {
    const colores: Record<string, string> = {
      'Aburrido': 'bg-blue-600',
      'Amoroso': 'bg-yellow-500',
      'Ansiedad': 'bg-yellow-600',
      'Curioso': 'bg-red-600',
      'Relajado': 'bg-blue-500',
      'Enojado': 'bg-yellow-600',
      'Feliz': 'bg-red-500',
      'Triste': 'bg-red-600',
    };
    return colores[nombre] || 'bg-purple-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-500">
          <div className="absolute top-20 left-10 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-4000"></div>
        </div>
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
            <p className="text-white text-lg">{t('emotionsPage.loadingEmotions')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Fondo animado con gradiente azul/púrpura - Sin emojis */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-500">
        {/* Formas flotantes animadas */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-4000"></div>
      </div>

      {/* Contenido */}
      <div className="relative z-10">
        <Navbar />

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-white text-4xl font-bold mb-4">
            {t('emotionsPage.title')}
          </h1>
        </div>

        {error && (
          <div className="bg-red-500 text-white px-6 py-4 rounded-lg mb-8 text-center">
            {error}
          </div>
        )}

        {/* Grid de Emociones */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {emociones.map((emocion) => (
            <button
              key={emocion.Id}
              onClick={() => handleEmocionClick(emocion.Id)}
              className={`${getEmocionColor(emocion.Nombre)} hover:scale-105 transform transition-all duration-200 rounded-2xl p-8 shadow-2xl hover:shadow-3xl`}
            >
              <div className="flex flex-col items-center space-y-4">
                {/* Icono de la emoción */}
                <div className="bg-white rounded-full w-24 h-24 flex items-center justify-center">
                  {emocion.UrlImagen?.startsWith('/') || emocion.UrlImagen?.startsWith('http') ? (
                    <img 
                      src={emocion.UrlImagen} 
                      alt={emocion.Nombre}
                      className="w-16 h-16 object-contain"
                    />
                  ) : (
                    <span className="text-5xl">{emocion.UrlImagen || '😊'}</span>
                  )}
                </div>
                
                {/* Nombre de la emoción */}
                <span className="text-white font-semibold text-lg">
                  {emocion.Nombre}
                </span>
              </div>
            </button>
          ))}
        </div>

        {emociones.length === 0 && !loading && !error && (
          <div className="text-center text-white text-lg">
            {t('emotionsPage.noEmotions')}
          </div>
        )}
        </main>
      </div>
    </div>
  );
};

export default EmocionesPage;
