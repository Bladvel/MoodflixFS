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
    public class UsuarioDAL : Mapper<Usuario>
    {
        private readonly PermisoDAL _permisoDAL = new PermisoDAL();

        protected override Usuario Transform(DataRow row)
        {
            var usuario = new Usuario
            {
                Id = (int)row["Id"],
                NombreUsuario = (string)row["NombreUsuario"],
                Email = (string)row["Email"],
                PasswordHash = (string)row["PasswordHash"],
                IntentosFallidos = (int)row["IntentosFallidos"],
                Bloqueado = (bool)row["Bloqueado"]

            };

            
            usuario.Permisos = _permisoDAL.GetArbolDePermisosDeUsuario(usuario.Id);


            return usuario;
        }

        public override int Create(Usuario entity)
        {
            using (var con = new SqlConnection(_connectionString))
            {
                var cmd = new SqlCommand("sp_CrearUsuario", con);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@NombreUsuario", entity.NombreUsuario);
                cmd.Parameters.AddWithValue("@Email", entity.Email);
                cmd.Parameters.AddWithValue("@PasswordHash", entity.PasswordHash);

                con.Open();
                return Convert.ToInt32(cmd.ExecuteScalar());
            }
        }

        public override void Update(Usuario entity)
        {
            using (var con = new SqlConnection(_connectionString))
            {
                var cmd = new SqlCommand("sp_ActualizarUsuario", con);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@Id", entity.Id);
                cmd.Parameters.AddWithValue("@NombreUsuario", entity.NombreUsuario);
                cmd.Parameters.AddWithValue("@Email", entity.Email);
                cmd.Parameters.AddWithValue("@PasswordHash", entity.PasswordHash);
                cmd.Parameters.AddWithValue("@IntentosFallidos", entity.IntentosFallidos);
                cmd.Parameters.AddWithValue("@Bloqueado", entity.Bloqueado);

                con.Open();
                cmd.ExecuteNonQuery();
            }


            
        }

        public override void Delete(int id)
        {
            using (var con = new SqlConnection(_connectionString))
            {
                var cmd = new SqlCommand("sp_BorrarUsuario", con);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@Id", id);
                con.Open();
                cmd.ExecuteNonQuery();
            }
        }

        public override List<Usuario> GetAll()
        {
            var usuarios = new List<Usuario>();
            using (var con = new SqlConnection(_connectionString))
            {
                var da = new SqlDataAdapter("sp_ListarUsuarios", con);
                da.SelectCommand.CommandType = CommandType.StoredProcedure;
                var dt = new DataTable();
                da.Fill(dt);

                foreach (DataRow row in dt.Rows)
                {
                    usuarios.Add(Transform(row));
                }
            }
            return usuarios;
        }

        public override Usuario GetById(int id)
        {
            using (var con = new SqlConnection(_connectionString))
            {
                var da = new SqlDataAdapter("sp_ObtenerUsuarioPorId", con);
                da.SelectCommand.CommandType = CommandType.StoredProcedure;
                da.SelectCommand.Parameters.AddWithValue("@Id", id);
                var dt = new DataTable();
                da.Fill(dt);

                if (dt.Rows.Count > 0)
                {
                    return Transform(dt.Rows[0]);
                }
            }
            return null;
        }

        public List<Usuario> GetByIds(IEnumerable<int> ids)
        {
            var dtIds = new DataTable();
            dtIds.Columns.Add("Id", typeof(int));
            foreach (var id in ids.Distinct()) 
            {
                dtIds.Rows.Add(id);
            }

            var dtUsuarios = new DataTable();
            using (var con = new SqlConnection(_connectionString))
            {
                var da = new SqlDataAdapter("sp_ListarUsuariosPorIds", con);
                da.SelectCommand.CommandType = CommandType.StoredProcedure;

                var sqlParam = da.SelectCommand.Parameters.AddWithValue("@Ids", dtIds);
                sqlParam.SqlDbType = SqlDbType.Structured;

                da.Fill(dtUsuarios);
            }

            var list = new List<Usuario>();
            foreach (DataRow row in dtUsuarios.Rows)
            {
                list.Add(Transform(row));
            }

            return list;

        }

        public Usuario GetByEmail(string email)
        {
            using (var con = new SqlConnection(_connectionString))
            {
                var da = new SqlDataAdapter("sp_ObtenerUsuarioPorEmail", con);
                da.SelectCommand.CommandType = CommandType.StoredProcedure;
                da.SelectCommand.Parameters.AddWithValue("@Email", email);
                var dt = new DataTable();
                da.Fill(dt);

                if (dt.Rows.Count > 0)
                {
                    return Transform(dt.Rows[0]);
                }
            }
            return null;
        }
    }
}
