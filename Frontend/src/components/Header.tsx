import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LanguageSelector } from './LanguageSelector';
import { useTranslation } from '../lib/language-context';

interface HeaderProps {
  showRegisterButton?: boolean;
}

const Header: React.FC<HeaderProps> = ({ showRegisterButton = true }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <header className="bg-gradient-to-r from-purple-900 to-purple-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="text-3xl">🎬</div>
            <span className="text-white text-2xl font-bold tracking-wide">MOODFLIX</span>
          </div>
          
          <div className="flex items-center gap-4">
            <LanguageSelector variant="header" />
            
            {showRegisterButton && (
              <button
                onClick={() => navigate('/register')}
                className="text-white hover:text-purple-200 transition-colors font-medium"
              >
                {t('header.register')}
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;