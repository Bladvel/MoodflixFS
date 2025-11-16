import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useTranslation } from '../lib/language-context';

const TipoProductoPage: React.FC = () => {
  const { t } = useTranslation();
  const { emocionId } = useParams<{ emocionId: string }>();
  const navigate = useNavigate();

  const handleTipoClick = (tipo: 'Pelicula' | 'Libro' | 'Todos') => {
    navigate(`/productos/${emocionId}/${tipo}`);
  };

  const handleVolverEmociones = () => {
    navigate('/emociones');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-700">
      <Navbar />

      {/* Main Content */}
      <main className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
        <div className="text-center max-w-4xl w-full">
          {/* Logo */}
          <div className="mb-12 flex justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🎭📚</div>
              <h1 className="text-white text-5xl font-bold tracking-wide">MOODFLIX</h1>
            </div>
          </div>

          {/* Opciones de tipo de producto */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {/* Películas */}
            <button
              onClick={() => handleTipoClick('Pelicula')}
              className="bg-yellow-500 hover:bg-yellow-600 transform hover:scale-105 transition-all duration-200 rounded-full p-12 shadow-2xl"
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="bg-white rounded-full w-32 h-32 flex items-center justify-center">
                  <span className="text-6xl">🎬</span>
                </div>
                <span className="text-white font-bold text-2xl">{t('tipoProducto.movies')}</span>
              </div>
            </button>

            {/* Libros */}
            <button
              onClick={() => handleTipoClick('Libro')}
              className="bg-red-600 hover:bg-red-700 transform hover:scale-105 transition-all duration-200 rounded-full p-12 shadow-2xl"
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="bg-white rounded-full w-32 h-32 flex items-center justify-center">
                  <span className="text-6xl">📚</span>
                </div>
                <span className="text-white font-bold text-2xl">{t('tipoProducto.books')}</span>
              </div>
            </button>

            {/* Ver todo */}
            <button
              onClick={() => handleTipoClick('Todos')}
              className="bg-blue-600 hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 rounded-full p-12 shadow-2xl"
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="bg-white rounded-full w-32 h-32 flex items-center justify-center">
                  <span className="text-6xl">❓</span>
                </div>
                <span className="text-white font-bold text-2xl">{t('tipoProducto.viewAll')}</span>
              </div>
            </button>
          </div>

          {/* Botón volver */}
          <div className="mt-12">
            <button
              onClick={handleVolverEmociones}
              className="text-white hover:text-purple-200 transition-colors flex items-center space-x-2 mx-auto"
            >
              <span>←</span>
              <span>{t('tipoProducto.backToEmotions')}</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TipoProductoPage;
