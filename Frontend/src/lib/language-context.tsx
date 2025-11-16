import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import esTranslations from '../locales/es.json';
import enTranslations from '../locales/en.json';

type Language = 'es' | 'en';

interface TranslationDictionary {
  [key: string]: any;
}

interface LanguageContextType {
  idioma: Language;
  cambiarIdioma: (nuevoIdioma: Language) => void;
  t: (key: string, params?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, TranslationDictionary> = {
  es: esTranslations,
  en: enTranslations,
};

const STORAGE_KEY = 'moodflix-language';
const DEFAULT_LANGUAGE: Language = 'es';

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [idioma, setIdioma] = useState<Language>(() => {
    // Cargar idioma desde LocalStorage al iniciar
    try {
      const savedLanguage = localStorage.getItem(STORAGE_KEY);
      if (savedLanguage === 'es' || savedLanguage === 'en') {
        return savedLanguage;
      }
    } catch (error) {
      console.error('Error loading language from LocalStorage:', error);
    }
    return DEFAULT_LANGUAGE;
  });

  const cambiarIdioma = (nuevoIdioma: Language) => {
    setIdioma(nuevoIdioma);
    // Guardar en LocalStorage
    try {
      localStorage.setItem(STORAGE_KEY, nuevoIdioma);
    } catch (error) {
      console.error('Error saving language to LocalStorage:', error);
    }
  };

  const t = (key: string, params?: Record<string, string>): string => {
    try {
      const keys = key.split('.');
      let value: any = translations[idioma];

      // Navegar por la estructura anidada del diccionario
      for (const k of keys) {
        value = value?.[k];
      }

      // Si no se encuentra la traducción, retornar la clave como fallback
      if (typeof value !== 'string') {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`Translation not found: ${key}`);
        }
        return key;
      }

      // Interpolación de parámetros
      if (params) {
        return Object.entries(params).reduce(
          (str, [param, val]) => str.replace(new RegExp(`{{${param}}}`, 'g'), val),
          value
        );
      }

      return value;
    } catch (error) {
      console.error(`Error translating ${key}:`, error);
      return key;
    }
  };

  const value: LanguageContextType = {
    idioma,
    cambiarIdioma,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}
