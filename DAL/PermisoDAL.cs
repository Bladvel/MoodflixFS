using BE;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL
{
    public class PermisoDAL
    {
        private readonly string _connectionString = ConfigurationManager.ConnectionStrings["DefaultConnection"].ConnectionString;

        //Con jerarquía de permisos
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

            if (ds.Tables.Count < 2 || ds.Tables[0].Rows.Count == 0)
            {
                return permisos;
            }

            foreach (DataRow row in ds.Tables[0].Rows)
            {
                permisos.Add(Transform(row));
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

            
            return permisos.Where(p => !ds.Tables[1].AsEnumerable().Any(row => (int)row["IdHijo"] == p.Id)).ToList();
        }

        public Permiso GetById(int permisoId)
        {
            List<Permiso> permisos = new List<Permiso>();
            DataSet ds = new DataSet();
            using (var con = new SqlConnection(_connectionString))
            {
                SqlCommand cmd = new SqlCommand("sp_ObtenerPermisoPorId", con);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@Id", permisoId);
                SqlDataAdapter da = new SqlDataAdapter(cmd);
                da.Fill(ds);

                if(ds.Tables.Count <2 || ds.Tables[0].Rows.Count ==0)
                {
                    return null;
                }

                foreach (DataRow row in ds.Tables[0].Rows)
                {
                    permisos.Add(Transform(row));
                }

                foreach (DataRow row in ds.Tables[1].Rows)
                {
                    int idPadre = (int)row["IdPadre"];
                    int idHijo = (int)row["IdHijo"];
                    var padre = permisos.FirstOrDefault(p => p.Id == idPadre) as Familia;
                    var hijo = permisos.FirstOrDefault(p => p.Id == idHijo);
                    if (padre != null && hijo != null)
                    {
                        padre.Hijos.Add(hijo);
                    }
                }
            }


            return permisos.FirstOrDefault(p => p.Id == permisoId);
        }




        [Obsolete]
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
                    permisos.Add(Transform(row));
                }
            }
            return permisos;
        }


        
        public void GuardarPermisosDeUsuario(Usuario usuario)
        {
            using (var con = new SqlConnection(_connectionString))
            {
                var cmd = new SqlCommand("sp_GuardarPermisosDeUsuario", con);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@UsuarioId", usuario.Id);

                var dtPermisos = new DataTable();
                dtPermisos.Columns.Add("Id", typeof(int));
                foreach (var permiso in usuario.Permisos)
                {
                    dtPermisos.Rows.Add(permiso.Id);
                }

                var sqlParam = cmd.Parameters.AddWithValue("@PermisosIdsDataTable", dtPermisos);
                sqlParam.SqlDbType = SqlDbType.Structured;

                con.Open();
                cmd.ExecuteNonQuery();
            }
        }


        public int Create(Permiso permiso)
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

            if(permiso.Id >0 )
            {
                GuardarHijos(permiso);
            }

            return permiso.Id;
        }

        public void Update(Permiso permiso)
        {
            using (var con = new SqlConnection(_connectionString))
            {
                var cmd = new SqlCommand("sp_ActualizarPermiso", con);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@Id", permiso.Id);
                cmd.Parameters.AddWithValue("@Nombre", permiso.Nombre);
                cmd.Parameters.AddWithValue("@EsFamilia", permiso is Familia);


                con.Open();
                cmd.ExecuteNonQuery();
            }

            if(permiso is Familia familia)
            {
                GuardarHijos(familia);
            }
        }

        private void GuardarHijos(Permiso permiso)
        {
            using (var con = new SqlConnection(_connectionString))
            {
                con.Open();
                
                var trx = con.BeginTransaction();
                try
                {
                    
                    var cmdDelete = new SqlCommand("sp_VaciarHijosDeFamilia", con, trx);
                    cmdDelete.CommandType = CommandType.StoredProcedure;
                    cmdDelete.Parameters.AddWithValue("@IdPadre", permiso.Id);
                    cmdDelete.ExecuteNonQuery();

                    if (permiso is Familia familia)
                    {
                        foreach (var hijo in familia.Hijos)
                        {
                            var cmdInsert = new SqlCommand("sp_AgregarHijoAFamilia", con, trx);
                            cmdInsert.CommandType = CommandType.StoredProcedure;
                            cmdInsert.Parameters.AddWithValue("@IdPadre", familia.Id);
                            cmdInsert.Parameters.AddWithValue("@IdHijo", hijo.Id);
                            cmdInsert.ExecuteNonQuery();
                        }
                    }

                    trx.Commit();
                }
                catch
                {
                    trx.Rollback();
                    throw; 
                }
            }
        }

        private Permiso Transform(DataRow row)
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


        public List<Permiso> GetArbolDePermisosDeUsuario(int usuarioId)
        {
            var permisos = new List<Permiso>();
            var ds = new DataSet();

            using (var con = new SqlConnection(_connectionString))
            {
                var cmd = new SqlCommand("sp_ObtenerArbolPermisosDeUsuario", con);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@UsuarioId", usuarioId);
                var da = new SqlDataAdapter(cmd);
                da.Fill(ds);
            }

            if (ds.Tables.Count < 2 || ds.Tables[0].Rows.Count == 0)
            {
                return permisos;
            }

            foreach (DataRow row in ds.Tables[0].Rows)
            {
                permisos.Add(Transform(row));
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

            //Solo permisos raiz
            return permisos.Where(p =>
                !ds.Tables[1].AsEnumerable().Any(row => (int)row["IdHijo"] == p.Id)
            ).ToList();
        }


        public void Delete(int permisoId)
        {
            using (var con = new SqlConnection(_connectionString))
            {
                var cmd = new SqlCommand("sp_BorrarPermiso", con);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@Id", permisoId);
                con.Open();
                cmd.ExecuteNonQuery();
            }
        }

        public bool EsAncestro(int idAncestro, int idDescendiente)
        {
            using (var con = new SqlConnection(_connectionString))
            {
                var cmd = new SqlCommand("Select dbo.fn_EsAncestro(@IdAncestro, @IdDescendiente)", con);
                cmd.CommandType = CommandType.Text;
                cmd.Parameters.AddWithValue("@IdAncestro", idAncestro);
                cmd.Parameters.AddWithValue("@IdDescendiente", idDescendiente);
                con.Open();
                return (bool)cmd.ExecuteScalar();
            }
        }

    }
}
