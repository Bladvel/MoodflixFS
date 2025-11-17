import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { idiomasAPI } from "./api-endpoints";
import type { Idioma } from "./types";
import esTranslations from "../locales/es.json";
import enTranslations from "../locales/en.json";

type Language = string;

interface TranslationDictionary {
  [key: string]: any;
}

interface LanguageContextType {
  idioma: Language;
  idiomas: Idioma[];
  cambiarIdioma: (nuevoIdioma: Language) => Promise<void>;
  t: (key: string, params?: Record<string, string>) => string;
  cargando: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

const STORAGE_KEY = "moodflix-language";
const DEFAULT_LANGUAGE = "es";

// Traducciones locales como fallback
const localTranslations: Record<string, TranslationDictionary> = {
  es: esTranslations,
  en: enTranslations,
};

// Cache de traducciones en memoria del cliente
const translationsCache: Record<string, TranslationDictionary> = {};

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [idioma, setIdioma] = useState<Language>(DEFAULT_LANGUAGE);
  const [idiomas, setIdiomas] = useState<Idioma[]>([]);
  const [translations, setTranslations] = useState<TranslationDictionary>({});
  const [cargando, setCargando] = useState(true);

  // Cargar idiomas disponibles al iniciar
  useEffect(() => {
    cargarIdiomas();
  }, []);

  // Cargar traducciones cuando cambia el idioma
  useEffect(() => {
    if (idioma) {
      cargarTraducciones(idioma);
    }
  }, [idioma]);

  const cargarIdiomas = async () => {
    try {
      const response = await idiomasAPI.obtenerIdiomas();
      if (response.Success && response.Data) {
        setIdiomas(response.Data);

        // Cargar idioma guardado o predeterminado
        const savedLanguage = localStorage.getItem(STORAGE_KEY);
        if (savedLanguage) {
          setIdioma(savedLanguage);
        } else {
          const idiomaPredeterminado = response.Data.find(
            (i) => i.Preestablecido
          );
          setIdioma(idiomaPredeterminado?.Codigo || DEFAULT_LANGUAGE);
        }
      }
    } catch (error) {
      console.error("Error loading languages:", error);
      // Fallback a idiomas locales
      setIdiomas([
        {
          Id: 1,
          Codigo: "es",
          Nombre: "Español",
          Bandera: "🇪🇸",
          Preestablecido: true,
        },
        {
          Id: 2,
          Codigo: "en",
          Nombre: "English",
          Bandera: "🇺🇸",
          Preestablecido: false,
        },
      ]);
      setIdioma(DEFAULT_LANGUAGE);
      setCargando(false);
    }
  };

  const cargarTraducciones = async (codigoIdioma: string) => {
    setCargando(true);
    try {
      // Verificar cache primero
      if (translationsCache[codigoIdioma]) {
        console.log(`✓ Traducciones cargadas desde cache para: ${codigoIdioma}`);
        setTranslations(translationsCache[codigoIdioma]);
        setCargando(false);
        return;
      }

      // Intentar cargar desde API (BASE DE DATOS)
      console.log(`📡 Cargando traducciones desde API/BD para: ${codigoIdioma}`);
      
      const response = await idiomasAPI.obtenerTraduccionesPorCodigo(
        codigoIdioma
      );
      
      if (response.Success && response.Data && response.Data.Traducciones) {
        const traducciones = response.Data.Traducciones;
        console.log(`✓ Traducciones cargadas desde BD:`, Object.keys(traducciones).length, 'secciones');
        console.log('Secciones disponibles:', Object.keys(traducciones));
        
        // Guardar en cache
        translationsCache[codigoIdioma] = traducciones;
        setTranslations(traducciones);
        setCargando(false);
        return;
      } else {
        throw new Error('API no retornó traducciones válidas');
      }
    } catch (error) {
      console.error(`✗ Error loading translations from API for ${codigoIdioma}:`, error);
      
      // FALLBACK: Usar traducciones locales solo si la API falla
      if (localTranslations[codigoIdioma]) {
        console.warn(`⚠️ Usando traducciones locales como fallback para: ${codigoIdioma}`);
        setTranslations(localTranslations[codigoIdioma]);
        translationsCache[codigoIdioma] = localTranslations[codigoIdioma];
      } else {
        console.error(`✗ No hay traducciones disponibles para: ${codigoIdioma}`);
      }
    } finally {
      setCargando(false);
    }
  };

  const cambiarIdioma = async (nuevoIdioma: Language) => {
    setIdioma(nuevoIdioma);
    try {
      localStorage.setItem(STORAGE_KEY, nuevoIdioma);
    } catch (error) {
      console.error("Error saving language to LocalStorage:", error);
    }
  };

  const t = (key: string, params?: Record<string, string>): string => {
    try {
      const keys = key.split(".");
      let value: any = translations;

      // Navegar por la estructura anidada del diccionario
      for (const k of keys) {
        value = value?.[k];
      }

      // Si no se encuentra la traducción, retornar la clave como fallback
      if (typeof value !== "string") {
        if (process.env.NODE_ENV === "development") {
          console.warn(`Translation not found: ${key}`);
        }
        return key;
      }

      // Interpolación de parámetros
      if (params) {
        return Object.entries(params).reduce(
          (str, [param, val]) =>
            str.replace(new RegExp(`{{${param}}}`, "g"), val),
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
    idiomas,
    cambiarIdioma,
    t,
    cargando,
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
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return context;
}
