import React from 'react';
import Header from '../components/Header';
import LoginForm from '../components/LoginForm';

const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Fondo animado con gradiente azul/púrpura */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-500">
        {/* Formas flotantes animadas más sutiles */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-4000"></div>
        
        {/* Emojis flotantes optimizados - Solo los más relevantes */}
        <div className="absolute top-[15%] left-[10%] text-7xl opacity-100 animate-float drop-shadow-2xl">😊</div>
        <div className="absolute top-[25%] right-[15%] text-6xl opacity-100 animate-float animation-delay-1000 drop-shadow-2xl">🎬</div>
        <div className="absolute bottom-[30%] left-[20%] text-7xl opacity-100 animate-float animation-delay-2000 drop-shadow-2xl">📚</div>
        <div className="absolute top-[60%] right-[25%] text-6xl opacity-100 animate-float animation-delay-3000 drop-shadow-2xl">❤️</div>
        <div className="absolute bottom-[20%] right-[18%] text-7xl opacity-100 animate-float animation-delay-4000 drop-shadow-2xl">🎭</div>
        <div className="absolute top-[40%] left-[15%] text-6xl opacity-100 animate-float animation-delay-1000 drop-shadow-2xl">😂</div>
        <div className="absolute top-[70%] left-[35%] text-7xl opacity-100 animate-float animation-delay-3000 drop-shadow-2xl">🎪</div>
        <div className="absolute top-[20%] right-[35%] text-6xl opacity-100 animate-float animation-delay-2000 drop-shadow-2xl">🎨</div>
        <div className="absolute bottom-[40%] right-[10%] text-7xl opacity-100 animate-float animation-delay-4000 drop-shadow-2xl">🌟</div>
        <div className="absolute top-[50%] left-[45%] text-6xl opacity-100 animate-float animation-delay-1000 drop-shadow-2xl">🎵</div>
        <div className="absolute bottom-[15%] left-[40%] text-7xl opacity-100 animate-float animation-delay-3000 drop-shadow-2xl">😍</div>
        <div className="absolute top-[35%] right-[40%] text-6xl opacity-100 animate-float animation-delay-2000 drop-shadow-2xl">🎉</div>
        <div className="absolute top-[10%] left-[50%] text-6xl opacity-100 animate-float animation-delay-4000 drop-shadow-2xl">🍿</div>
        <div className="absolute bottom-[50%] left-[5%] text-7xl opacity-100 animate-float animation-delay-2000 drop-shadow-2xl">📖</div>
        <div className="absolute top-[80%] right-[30%] text-6xl opacity-100 animate-float animation-delay-1000 drop-shadow-2xl">🎥</div>
      </div>

      {/* Contenido */}
      <div className="relative z-10">
        <Header showRegisterButton={true} />
        <main className="flex items-center justify-center px-4 py-12 min-h-[calc(100vh-80px)]">
          <LoginForm />
        </main>
      </div>
    </div>
  );
};

export default LoginPage;