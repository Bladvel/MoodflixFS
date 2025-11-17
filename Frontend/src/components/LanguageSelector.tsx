import React from "react";
import { useTranslation } from "../lib/language-context";

interface LanguageSelectorProps {
  variant?: "navbar" | "header";
}

export function LanguageSelector({
  variant = "navbar",
}: LanguageSelectorProps) {
  const { idioma, idiomas, cambiarIdioma, cargando } = useTranslation();

  // No mostrar nada mientras carga
  if (cargando || idiomas.length === 0) {
    return null;
  }

  const baseStyles = "flex items-center gap-2 text-sm font-medium";

  const variantStyles = {
    navbar: "text-white",
    header: "text-white",
  };

  const buttonBaseStyles =
    "px-3 py-1.5 rounded-md transition-all duration-200 cursor-pointer";

  const activeStyles =
    variant === "navbar"
      ? "bg-white/20 hover:bg-white/30"
      : "bg-white/80 hover:bg-white";

  const inactiveStyles =
    variant === "navbar" ? "hover:bg-white/10" : "hover:bg-gray-100";

  // Mapeo de códigos de idioma a banderas (fallback si la BD no tiene banderas)
  const getBandera = (codigo: string, banderaBD: string | undefined) => {
    // Si la bandera de la BD es válida (no es ???? ni está vacía), usarla
    if (banderaBD && banderaBD !== '????' && banderaBD.trim() !== '') {
      return banderaBD;
    }
    
    // Fallback: mapeo manual de banderas
    const banderas: Record<string, string> = {
      'es': '🇪🇸',
      'en': '🇬🇧',
      'fr': '🇫🇷',
      'de': '🇩🇪',
      'it': '🇮🇹',
      'pt': '🇵🇹',
    };
    
    return banderas[codigo.toLowerCase()] || '🌐';
  };

  return (
    <div className={`${baseStyles} ${variantStyles[variant]}`}>
      {idiomas.map((idiomaItem, index) => (
        <React.Fragment key={idiomaItem.Codigo}>
          <button
            onClick={() => cambiarIdioma(idiomaItem.Codigo)}
            className={`${buttonBaseStyles} ${
              idioma === idiomaItem.Codigo ? activeStyles : inactiveStyles
            } flex items-center gap-1.5`}
            aria-label={`Cambiar a ${idiomaItem.Nombre}`}
            title={idiomaItem.Nombre}
          >
            {/* Mostrar bandera (emoji) con fallback */}
            <span className="text-lg">
              {getBandera(idiomaItem.Codigo, idiomaItem.Bandera)}
            </span>
            {/* Mostrar código del idioma */}
            <span className="font-semibold">
              {idiomaItem.Codigo.toUpperCase()}
            </span>
          </button>

          {/* Separador entre idiomas */}
          {index < idiomas.length - 1 && (
            <span className="text-current opacity-50">|</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
