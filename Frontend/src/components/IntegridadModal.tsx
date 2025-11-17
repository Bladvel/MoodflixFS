import { X, AlertTriangle, CheckCircle, RefreshCw } from "lucide-react";
import type { ResultadoIntegridad } from "../lib/types";

interface IntegridadModalProps {
  isOpen: boolean;
  onClose: () => void;
  resultado: ResultadoIntegridad | null;
  onRecalcular: () => void;
  recalculando: boolean;
}

export function IntegridadModal({
  isOpen,
  onClose,
  resultado,
  onRecalcular,
  recalculando,
}: IntegridadModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {resultado?.EsValido ? (
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
          {!resultado ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Verificando integridad...</p>
            </div>
          ) : (
            <>
              {/* Estado General */}
              <div
                className={`p-4 rounded-lg mb-6 ${
                  resultado.EsValido
                    ? "bg-green-50 border border-green-200"
                    : "bg-red-50 border border-red-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  {resultado.EsValido ? (
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
                          Se encontraron {resultado.Errores.length} error(es) de
                          integridad
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Lista de Errores */}
              {!resultado.EsValido && resultado.Errores.length > 0 && (
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
                            Registro ID
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-700">
                            Tipo de Error
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {resultado.Errores.map((error, index) => {
                          // Parsear el error para extraer información
                          const match = error.match(
                            /Error (DVH|DVV) en Tabla: (\w+)(?:, (?:Registro ID|Columna): (.+?))?[.]/
                          );
                          const tipo = match?.[1] || "DVH";
                          const tabla = match?.[2] || "Desconocida";
                          const detalle = match?.[3] || "N/A";

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
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Explicación */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                    <h5 className="font-semibold text-blue-900 mb-2">
                      ℹ️ ¿Qué significa esto?
                    </h5>
                    <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                      <li>
                        <strong>DVH:</strong> Dígito Verificador Horizontal -
                        Protege la integridad de cada registro
                      </li>
                      <li>
                        <strong>DVV:</strong> Dígito Verificador Vertical -
                        Protege la integridad de cada columna
                      </li>
                      <li>
                        Los errores indican que los datos fueron modificados
                        directamente en la base de datos
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Fecha de Verificación */}
              {resultado.FechaVerificacion && (
                <div className="mt-4 text-sm text-gray-500">
                  Verificado el: {new Date(resultado.FechaVerificacion).toLocaleString()}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          {resultado && !resultado.EsValido && (
            <button
              onClick={onRecalcular}
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
                  Recalcular Dígitos
                </>
              )}
            </button>
          )}
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
