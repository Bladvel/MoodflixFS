import { useTranslation } from "../lib/language-context";

interface LanguageSelectorProps {
  variant?: "navbar" | "header";
}

export function LanguageSelector({
  variant = "navbar",
}: LanguageSelectorProps) {
  const { idioma, cambiarIdioma } = useTranslation();

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

  return (
    <div className={`${baseStyles} ${variantStyles[variant]}`}>
      {/* Español */}
      <button
        onClick={() => cambiarIdioma("es")}
        className={`${buttonBaseStyles} ${
          idioma === "es" ? activeStyles : inactiveStyles
        } flex items-center gap-1.5`}
        aria-label="Cambiar a Español"
      >
        {/* Bandera España: Rojo-Amarillo-Rojo */}
        <div className="flex flex-col w-5 h-4 rounded overflow-hidden border border-white/30">
          <div className="h-1/4 bg-red-600"></div>
          <div className="h-2/4 bg-yellow-400"></div>
          <div className="h-1/4 bg-red-600"></div>
        </div>
        <span className="font-semibold">ES</span>
      </button>

      {/* Separador */}
      <span className="text-current opacity-50">|</span>

      {/* English */}
      <button
        onClick={() => cambiarIdioma("en")}
        className={`${buttonBaseStyles} ${
          idioma === "en" ? activeStyles : inactiveStyles
        } flex items-center gap-1.5`}
        aria-label="Change to English"
      >
        {/* Bandera USA: Azul con estrellas simplificado */}
        <div className="flex flex-col w-5 h-4 rounded overflow-hidden border border-white/30">
          <div className="h-1/2 bg-blue-700"></div>
          <div className="h-1/6 bg-red-600"></div>
          <div className="h-1/6 bg-white"></div>
          <div className="h-1/6 bg-red-600"></div>
        </div>
        <span className="font-semibold">EN</span>
      </button>
    </div>
  );
}
