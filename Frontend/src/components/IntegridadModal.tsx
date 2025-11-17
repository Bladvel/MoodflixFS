import { X, AlertTriangle, CheckCircle, RefreshCw } from "lucide-react";
import type { ResultadoIntegridad } from "../lib/types";
import { integridadAPI } from "@/lib/api-endpoints";
import { backupAPI } from "@/lib/api-endpoints";   // 👈 nuevo
import { useState, useRef } from "react";          // 👈 useRef

interface IntegridadModalProps {
  isOpen: boolean;
  onClose: () => void;

  // modo "completo" (IntegridadPage) – si algún día lo usas de nuevo
  resultado?: ResultadoIntegridad | null;

  // modo "simple" (login)
  errores?: string[] | null;
}

export function IntegridadModal({
  isOpen,
  onClose,
  resultado,
  errores,
}: IntegridadModalProps) {
  const [recalculando, setRecalculando] = useState(false);
  const [restaurando, setRestaurando] = useState(false);        // 👈 nuevo
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // 👈 nuevo
  const fileInputRef = useRef<HTMLInputElement | null>(null);          // 👈 nuevo

  if (!isOpen) return null;

  const handleRecalcular = async () => {
    setRecalculando(true);
    setError(null);

    try {
      const response = await integridadAPI.recalcular();
      // response = { message: "Proceso de recálculo..." }

      alert("✓ " + (response.message || "Proceso de recálculo iniciado"));
      // si quieres, puedes cerrar el modal aquí:
      onClose();
    } catch (err: any) {
      const msg = err.message || "Error al recalcular dígitos verificadores";
      setError(msg);
      alert("✗ " + msg);
    } finally {
      setRecalculando(false);
    }
  };

  

 

  // normalizamos: si no hay resultado pero sí errores, creamos uno falso
  const tieneErroresSimples = !!errores && errores.length > 0;
  const effectiveResultado: ResultadoIntegridad | null =
    resultado ??
    (tieneErroresSimples
      ? {
          EsValido: false,
          Errores: errores!,
          FechaVerificacion: new Date().toISOString(),
        }
      : null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {effectiveResultado?.EsValido ? (
              <CheckCircle className="w-8 h-8 text-green-500" />
            ) : (
              <AlertTriangle className="w-8 h-8 text-red-500" />
            )}
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Verificación de Integridad
              </h2>
              <p className="text-sm text-gray-500">
                Dígitos Verificadores (DVH/DVV)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!effectiveResultado ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Verificando integridad...</p>
            </div>
          ) : (
            <>
              {/* Estado General */}
              <div
                className={`p-4 rounded-lg mb-6 ${
                  effectiveResultado.EsValido
                    ? "bg-green-50 border border-green-200"
                    : "bg-red-50 border border-red-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  {effectiveResultado.EsValido ? (
                    <>
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      <div>
                        <h3 className="font-semibold text-green-900">
                          ✓ Integridad Verificada
                        </h3>
                        <p className="text-sm text-green-700">
                          Todos los dígitos verificadores son correctos
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-6 h-6 text-red-600" />
                      <div>
                        <h3 className="font-semibold text-red-900">
                          ⚠ Inconsistencias Detectadas
                        </h3>
                        <p className="text-sm text-red-700">
                          Se encontraron {effectiveResultado.Errores.length} error(es) de
                          integridad
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Lista de Errores */}
              {!effectiveResultado.EsValido &&
                effectiveResultado.Errores.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-orange-500" />
                      Datos Corruptos Detectados
                    </h4>
                    <div className="bg-gray-50 rounded-lg border border-gray-200 max-h-96 overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-100 sticky top-0">
                          <tr>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">
                              #
                            </th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">
                              Tabla
                            </th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">
                              Registro ID / Columna
                            </th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">
                              Tipo de DV
                            </th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">
                              Acción
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {effectiveResultado.Errores.map((error, index) => {
                            const match = error.match(
                              /Error (DVH|DVV) en Tabla: ([^,]+)(?:, (?:Registro ID|Columna): (.+?))?\.(?:\s*\(([^)]+)\))?/
                            );

                            const tipo = match?.[1] || "DVH/DVV";
                            const tabla = match?.[2] || "Desconocida";
                            const detalle = match?.[3] || "N/A";
                            const accion = match?.[4] || "Error";

                            return (
                              <tr
                                key={index}
                                className="hover:bg-gray-50 transition-colors"
                              >
                                <td className="px-4 py-3 text-gray-600">
                                  {index + 1}
                                </td>
                                <td className="px-4 py-3 font-medium text-gray-900">
                                  {tabla}
                                </td>
                                <td className="px-4 py-3 text-gray-700">
                                  {detalle}
                                </td>
                                <td className="px-4 py-3">
                                  <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      tipo === "DVH"
                                        ? "bg-red-100 text-red-800"
                                        : "bg-orange-100 text-orange-800"
                                    }`}
                                  >
                                    {tipo}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-gray-700">
                                  {accion}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {error && (
                      <p className="text-sm text-red-600 mt-2">{error}</p>
                    )}
                  </div>
                )}

              {effectiveResultado.FechaVerificacion && (
                <div className="mt-4 text-sm text-gray-500">
                  Verificado el:{" "}
                  {new Date(effectiveResultado.FechaVerificacion).toLocaleString()}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-3 p-6 border-t border-gray-200 bg-gray-50">
          {/* línea 1: botones de acciones */}
          <div className="flex items-center justify-end gap-3">
            {effectiveResultado && !effectiveResultado.EsValido && (
              <>
                <button
                  onClick={handleRecalcular}
                  disabled={recalculando}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {recalculando ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Recalculando...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-5 h-5" />
                      Recalcular dígitos
                    </>
                  )}
                </button>


              </>
            )}

            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Cerrar
            </button>
          </div>

          {/* línea 2: info del archivo seleccionado y errores */}
          <div className="flex flex-col gap-1">
            {/* input de archivo oculto */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".bak,.sql"
              className="hidden"
            />
            {selectedFile && (
              <p className="text-xs text-gray-600">
                Archivo seleccionado:{" "}
                <span className="font-medium">{selectedFile.name}</span>
              </p>
            )}
            {error && (
              <p className="text-xs text-red-600">
                {error}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

