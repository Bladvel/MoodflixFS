using BE;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL
{
    public class PermisoDAL
    {
        private readonly string _connectionString = System.Configuration.ConfigurationManager.ConnectionStrings["DefaultConnection"].ConnectionString;

        public List<Permiso> GetAll()
        {
            var permisos = new List<Permiso>();
            var ds = new DataSet();

            using (var con = new SqlConnection(_connectionString))
            {
                var cmd = new SqlCommand("sp_ListarPermisosCompletos", con) { CommandType = CommandType.StoredProcedure };
                var da = new SqlDataAdapter(cmd);
                da.Fill(ds);
            }

            foreach (DataRow row in ds.Tables[0].Rows)
            {
                permisos.Add(TransformarPermiso(row));
            }

            foreach (DataRow row in ds.Tables[1].Rows)
            {
                var idPadre = (int)row["IdPadre"];
                var idHijo = (int)row["IdHijo"];

                var padre = permisos.FirstOrDefault(p => p.Id == idPadre) as Familia;
                var hijo = permisos.FirstOrDefault(p => p.Id == idHijo);

                if (padre != null && hijo != null)
                {
                    padre.Hijos.Add(hijo);
                }
            }

            // Devolvemos solo los permisos raíz (los que no son hijos de nadie)
            return permisos.Where(p => !ds.Tables[1].AsEnumerable().Any(row => (int)row["IdHijo"] == p.Id)).ToList();
        }

        /// <summary>
        /// Obtiene los permisos asignados a un usuario específico.
        /// </summary>
        public List<Permiso> GetPermisosDeUsuario(int usuarioId)
        {
            var permisos = new List<Permiso>();
            using (var con = new SqlConnection(_connectionString))
            {
                var da = new SqlDataAdapter("sp_ListarPermisosDeUsuario", con);
                da.SelectCommand.CommandType = CommandType.StoredProcedure;
                da.SelectCommand.Parameters.AddWithValue("@UsuarioId", usuarioId);
                var dt = new DataTable();
                da.Fill(dt);

                foreach (DataRow row in dt.Rows)
                {
                    permisos.Add(TransformarPermiso(row));
                }
            }
            return permisos;
        }

        /// <summary>
        /// Guarda la configuración completa de permisos para un usuario.
        /// </summary>
        public void GuardarPermisosDeUsuario(Usuario usuario)
        {
            using (var con = new SqlConnection(_connectionString))
            {
                var cmd = new SqlCommand("sp_GuardarPermisosDeUsuario", con);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@UsuarioId", usuario.Id);

                // Creamos un DataTable en memoria para pasar la lista de IDs de permisos.
                var dtPermisos = new DataTable();
                dtPermisos.Columns.Add("Id", typeof(int));
                foreach (var permiso in usuario.Permisos)
                {
                    dtPermisos.Rows.Add(permiso.Id);
                }

                var sqlParam = cmd.Parameters.AddWithValue("@PermisosIdsDataTable", dtPermisos);
                sqlParam.SqlDbType = SqlDbType.Structured; // Indicamos que es un tipo de tabla.

                con.Open();
                cmd.ExecuteNonQuery();
            }
        }

        /// <summary>
        /// Guarda un permiso (Crea o Actualiza) y sus hijos si es una familia.
        /// </summary>
        public void Guardar(Permiso permiso)
        {
            if (permiso.Id > 0)
                Actualizar(permiso);
            else
                Insertar(permiso);

            // Si es una familia, guardamos su jerarquía de hijos.
            if (permiso is Familia familia)
            {
                GuardarHijos(familia);
            }
        }

        private void Insertar(Permiso permiso)
        {
            using (var con = new SqlConnection(_connectionString))
            {
                var cmd = new SqlCommand("sp_CrearPermiso", con);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@Nombre", permiso.Nombre);
                cmd.Parameters.AddWithValue("@EsFamilia", permiso is Familia);

                con.Open();
                permiso.Id = Convert.ToInt32(cmd.ExecuteScalar());
            }
        }

        private void Actualizar(Permiso permiso)
        {
            using (var con = new SqlConnection(_connectionString))
            {
                var cmd = new SqlCommand("sp_ActualizarPermiso", con);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@Id", permiso.Id);
                cmd.Parameters.AddWithValue("@Nombre", permiso.Nombre);

                con.Open();
                cmd.ExecuteNonQuery();
            }
        }

        private void GuardarHijos(Familia familia)
        {
            using (var con = new SqlConnection(_connectionString))
            {
                con.Open();
                // Usamos una transacción para asegurar que toda la operación sea atómica.
                var trx = con.BeginTransaction();
                try
                {
                    // 1. Borramos los hijos actuales.
                    var cmdDelete = new SqlCommand("sp_VaciarHijosDeFamilia", con, trx);
                    cmdDelete.CommandType = CommandType.StoredProcedure;
                    cmdDelete.Parameters.AddWithValue("@IdPadre", familia.Id);
                    cmdDelete.ExecuteNonQuery();

                    // 2. Insertamos los nuevos hijos.
                    foreach (var hijo in familia.Hijos)
                    {
                        var cmdInsert = new SqlCommand("sp_AgregarHijoAFamilia", con, trx);
                        cmdInsert.CommandType = CommandType.StoredProcedure;
                        cmdInsert.Parameters.AddWithValue("@IdPadre", familia.Id);
                        cmdInsert.Parameters.AddWithValue("@IdHijo", hijo.Id);
                        cmdInsert.ExecuteNonQuery();
                    }

                    trx.Commit();
                }
                catch
                {
                    trx.Rollback();
                    throw; // Relanzamos la excepción.
                }
            }
        }

        private Permiso TransformarPermiso(DataRow row)
        {
            var esFamilia = (bool)row["EsFamilia"];
            Permiso permiso;

            if (esFamilia)
            {
                permiso = new Familia();
            }
            else
            {
                permiso = new Patente();
            }

            permiso.Id = (int)row["Id"];
            permiso.Nombre = (string)row["Nombre"];

            return permiso;
        }
    }
}
