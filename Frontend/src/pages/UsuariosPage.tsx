import { useState, useEffect } from "react";
import { api } from "../lib/api-endpoints";
import type { Usuario, Permiso } from "../lib/types";
import Navbar from "../components/Navbar";
import { useTranslation } from "../lib/language-context";

export default function UsuariosPage() {
  const { t } = useTranslation();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [permisos, setPermisos] = useState<Permiso[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [showPermisosModal, setShowPermisosModal] = useState(false);
  const [selectedUserPermisos, setSelectedUserPermisos] = useState<number[]>(
    []
  );

  useEffect(() => {
    cargarDatos();
  }, []);

  // Función para aplanar la estructura jerárquica de permisos (sin duplicados)
  const aplanarPermisos = (permisos: Permiso[]): Permiso[] => {
    const permisosMap = new Map<number, Permiso>();

    const procesar = (permiso: Permiso) => {
      // Solo agregar si no existe (evita duplicados)
      if (!permisosMap.has(permiso.Id)) {
        permisosMap.set(permiso.Id, permiso);
      }
      if (permiso.Hijos && permiso.Hijos.length > 0) {
        permiso.Hijos.forEach((hijo) => procesar(hijo));
      }
    };

    permisos.forEach((p) => procesar(p));
    return Array.from(permisosMap.values());
  };

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);
      const [usuariosData, permisosData] = await Promise.all([
        api.usuarios.listar(),
        api.permisos.listar(),
      ]);
      console.log("Usuarios cargados:", usuariosData);
      console.log("Permisos cargados (jerárquicos):", permisosData);
      const permisosAplanados = aplanarPermisos(permisosData);
      console.log("Permisos aplanados:", permisosAplanados);
      setUsuarios(usuariosData);
      setPermisos(permisosAplanados);
    } catch (err: any) {
      console.error("Error cargando datos:", err);
      if (err.StatusCode === 401) {
        setError(t('users.unauthorizedError'));
      } else {
        setError(err.Message || t('common.error'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (usuario: Usuario) => {
    setEditingUser({ ...usuario });
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;

    try {
      console.log("Actualizando usuario:", {
        Id: editingUser.Id,
        NombreUsuario: editingUser.NombreUsuario,
        Email: editingUser.Email,
        Bloqueado: editingUser.Bloqueado,
      });

      // Crear un objeto limpio solo con los campos necesarios
      // Incluimos PasswordHash aunque no lo editemos, para que el SP no falle
      const usuarioActualizado = {
        Id: editingUser.Id,
        NombreUsuario: editingUser.NombreUsuario,
        Email: editingUser.Email,
        Bloqueado: editingUser.Bloqueado,
        IntentosFallidos: editingUser.IntentosFallidos || 0,
        PasswordHash: editingUser.PasswordHash || "", // Enviar el hash actual o string vacío
      };

      console.log("Enviando al backend:", usuarioActualizado);

      await api.usuarios.actualizar(editingUser.Id, usuarioActualizado);

      await cargarDatos();
      setEditingUser(null);
      alert(t('users.userUpdated'));
    } catch (err: any) {
      console.error("Error completo:", err);
      const errorMsg = err.Message || err.message || JSON.stringify(err);
      alert(`${t('users.updateError')}: ${errorMsg}`);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm(t('users.deleteConfirm'))) return;

    try {
      await api.usuarios.eliminar(id);
      await cargarDatos();
      alert(t('users.userDeleted'));
    } catch (err: any) {
      alert(err.Message || t('users.deleteError'));
    }
  };

  const handleOpenPermisosModal = (usuario: Usuario) => {
    setEditingUser(usuario);
    setSelectedUserPermisos(usuario.Permisos?.map((p) => p.Id) || []);
    setShowPermisosModal(true);
  };

  const handleSavePermisos = async () => {
    if (!editingUser) return;

    try {
      // Convertir los IDs seleccionados a objetos de permisos con el formato que espera el backend
      const permisosSeleccionados = permisos
        .filter((p) => selectedUserPermisos.includes(p.Id))
        .map((p) => ({
          Id: p.Id,
          Nombre: p.Nombre,
          EsFamilia: p.Tipo === "Familia",
          Descripcion: p.Descripcion || "",
          Hijos: p.Hijos || [],
        }));

      await api.usuarios.asignarPermisos(
        editingUser.Id,
        permisosSeleccionados as any
      );

      await cargarDatos();
      setShowPermisosModal(false);
      setEditingUser(null);
      alert(t('users.permissionsUpdated'));
    } catch (err: any) {
      console.error("Error al actualizar permisos:", err);
      alert(err.Message || t('users.permissionsError'));
    }
  };

  const togglePermiso = (permisoId: number) => {
    setSelectedUserPermisos((prev) =>
      prev.includes(permisoId)
        ? prev.filter((id) => id !== permisoId)
        : [...prev, permisoId]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">{t('users.loadingUsers')}</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-purple-900 mb-2">
            👥 {t('users.title')}
          </h1>
          <p className="text-gray-600">
            {t('users.subtitle')}
          </p>
        </div>

        {/* Tabla de usuarios */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-purple-600 text-white">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    {t('common.id')}
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    {t('users.username')}
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    {t('common.email')}
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    {t('common.status')}
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    {t('common.permissions')}
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold">
                    {t('common.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {usuarios.map((usuario) => (
                  <tr
                    key={usuario.Id}
                    className="hover:bg-purple-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {usuario.Id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {usuario.NombreUsuario}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {usuario.Email}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {usuario.Bloqueado ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            🔒 {t('common.blocked')}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ✓ {t('common.active')}
                          </span>
                        )}
                        {usuario.IntentosFallidos > 0 && (
                          <span className="text-xs text-gray-500">
                            {usuario.IntentosFallidos} {t('users.failedAttempts')}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-gray-600">
                        {usuario.Permisos && usuario.Permisos.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {usuario.Permisos.slice(0, 2).map((p) => (
                              <span
                                key={p.Id}
                                className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded"
                              >
                                {p.Nombre}
                              </span>
                            ))}
                            {usuario.Permisos.length > 2 && (
                              <span className="text-gray-500">
                                +{usuario.Permisos.length - 2}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">{t('users.noPermissions')}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEditUser(usuario)}
                          className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                          title={t('users.editUser')}
                        >
                          ✏️ {t('common.edit')}
                        </button>
                        <button
                          onClick={() => handleOpenPermisosModal(usuario)}
                          className="px-3 py-1 bg-purple-500 text-white text-sm rounded hover:bg-purple-600 transition-colors"
                          title={t('users.managePermissions')}
                        >
                          🔑 {t('common.permissions')}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(usuario.Id)}
                          className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                          title="Eliminar usuario"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal de Edición */}
        {editingUser && !showPermisosModal && (
          <div className="fixed inset-0 bg-purple-900 bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-purple-100 via-pink-100 to-purple-100 rounded-lg shadow-xl max-w-md w-full p-6 border-2 border-purple-400">
              <h2 className="text-2xl font-bold text-purple-900 mb-4">
                {t('users.editUser')}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('users.username')}
                  </label>
                  <input
                    type="text"
                    value={editingUser.NombreUsuario}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        NombreUsuario: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('common.email')}
                  </label>
                  <input
                    type="email"
                    value={editingUser.Email}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, Email: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editingUser.Bloqueado}
                      onChange={(e) =>
                        setEditingUser({
                          ...editingUser,
                          Bloqueado: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {t('users.blockUser')}
                    </span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    {t('users.blockUserHelp')}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSaveUser}
                  className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  {t('users.saveChanges')}
                </button>
                <button
                  onClick={() => setEditingUser(null)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Permisos */}
        {showPermisosModal && editingUser && (
          <div className="fixed inset-0 bg-purple-900 bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-purple-100 via-pink-100 to-purple-100 rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto border-2 border-purple-400">
              <h2 className="text-2xl font-bold text-purple-900 mb-4">
                {t('users.permissionsFor')} {editingUser.NombreUsuario}
              </h2>

              <div className="space-y-2 mb-6">
                {permisos.map((permiso) => (
                  <label
                    key={permiso.Id}
                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-purple-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedUserPermisos.includes(permiso.Id)}
                      onChange={() => togglePermiso(permiso.Id)}
                      className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {permiso.Nombre}
                      </div>
                      {permiso.Descripcion && (
                        <div className="text-sm text-gray-600">
                          {permiso.Descripcion}
                        </div>
                      )}
                      <div className="text-xs text-gray-500 mt-1">
                        {t('common.type')}: {permiso.Tipo}
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSavePermisos}
                  className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  {t('users.savePermissions')}
                </button>
                <button
                  onClick={() => {
                    setShowPermisosModal(false);
                    setEditingUser(null);
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
