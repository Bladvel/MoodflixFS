import { useState } from "react";
import { Shield, AlertTriangle, CheckCircle, RefreshCw, Info } from "lucide-react";
import { IntegridadModal } from "../components/IntegridadModal";
import { integridadAPI } from "../lib/api-endpoints";
import type { ResultadoIntegridad } from "../lib/types";

export default function IntegridadPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [resultado, setResultado] = useState<ResultadoIntegridad | null>(null);
  const [recalculando, setRecalculando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerificar = async () => {
    setModalOpen(true);
    setResultado(null);
    setError(null);

    try {
      const ejemploResultado: ResultadoIntegridad = {
        EsValido: false,
        Errores: [
          "Error DVH en Tabla: Libros, Registro ID: 5.",
          "Error DVH en Tabla: Usuario, Registro ID: 12.",
          "Error DVV en Tabla: Peliculas, Columna: Precio.",
        ],
        FechaVerificacion: new Date().toISOString(),
      };

      await new Promise((resolve) => setTimeout(resolve, 1500));
      setResultado(ejemploResultado);
    } catch (err: any) {
      setError(err.message || "Error al verificar integridad");
      setModalOpen(false);
    }
  };

  const handleRecalcular = async () => {
    setRecalculando(true);
    setError(null);

    try {
      const response = await integridadAPI.recalcular();
      
      if (response.Success) {
        setModalOpen(false);
        alert("✓ Dígitos verificadores recalculados exitosamente");
      } else {
        throw new Error(response.Message || "Error al recalcular");
      }
    } catch (err: any) {
      setError(err.message || "Error al recalcular dígitos verificadores");
      alert("✗ " + (err.message || "Error al recalcular"));
    } finally {
      setRecalculando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Gestión de Integridad
              </h1>
              <p className="text-gray-600">
                Sistema de Dígitos Verificadores (DVH/DVV)
              </p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-2">
                  ¿Qué son los Dígitos Verificadores?
                </p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>
                    <strong>DVH (Horizontal):</strong> Protege cada registro individual
                  </li>
                  <li>
                    <strong>DVV (Vertical):</strong> Protege cada columna
                  </li>
                  <li>
                    Detecta cambios directos en la base de datos
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Verificar Integridad
              </h2>
            </div>
            <p className="text-gray-600 mb-6">
              Verifica que todos los dígitos verificadores sean correctos.
            </p>
            <button
              onClick={handleVerificar}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              <CheckCircle className="w-5 h-5" />
              Verificar Ahora
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <RefreshCw className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Recalcular Dígitos
              </h2>
            </div>
            <p className="text-gray-600 mb-6">
              Recalcula todos los dígitos verificadores de la base de datos.
            </p>
            <button
              onClick={handleRecalcular}
              disabled={recalculando}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium"
            >
              {recalculando ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Recalculando...
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" />
                  Recalcular Todo
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* <IntegridadModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        resultado={resultado}
        onRecalcular={handleRecalcular}
        recalculando={recalculando}
      /> */}
    </div>
  );
}
