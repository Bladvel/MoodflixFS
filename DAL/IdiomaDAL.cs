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
    public class IdiomaDAL : Mapper<Idioma>
    {
        public override List<Idioma> GetAll()
        {
            var idiomas = new List<Idioma>();

            using (var con = new SqlConnection(_connectionString))
            {
                var cmd = new SqlCommand(@"
                    SELECT * FROM IDIOMA 
                    WHERE ACTIVO = 1 
                    ORDER BY PREESTABLECIDO DESC, IDIOMA", con);
                con.Open();

                using (var reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        idiomas.Add(TransformFromReader(reader));
                    }
                }
            }

            return idiomas;
        }

        public override Idioma GetById(int id)
        {
            using (var con = new SqlConnection(_connectionString))
            {
                var cmd = new SqlCommand("SELECT * FROM IDIOMA WHERE ID = @Id", con);
                cmd.Parameters.AddWithValue("@Id", id);
                con.Open();

                using (var reader = cmd.ExecuteReader())
                {
                    if (reader.Read())
                    {
                        return TransformFromReader(reader);
                    }
                }
            }

            return null;
        }

        public Idioma GetByCodigo(string codigo)
        {
            using (var con = new SqlConnection(_connectionString))
            {
                var cmd = new SqlCommand("SELECT * FROM IDIOMA WHERE CODIGO = @Codigo AND ACTIVO = 1", con);
                cmd.Parameters.AddWithValue("@Codigo", codigo);
                con.Open();

                using (var reader = cmd.ExecuteReader())
                {
                    if (reader.Read())
                    {
                        return TransformFromReader(reader);
                    }
                }
            }

            return null;
        }

        public Idioma GetPreestablecido()
        {
            using (var con = new SqlConnection(_connectionString))
            {
                var cmd = new SqlCommand(@"
                    SELECT TOP 1 * FROM IDIOMA 
                    WHERE PREESTABLECIDO = 1 AND ACTIVO = 1", con);
                con.Open();

                using (var reader = cmd.ExecuteReader())
                {
                    if (reader.Read())
                    {
                        return TransformFromReader(reader);
                    }
                }
            }

            return null;
        }

        private Idioma TransformFromReader(SqlDataReader reader)
        {
            return new Idioma
            {
                Id = reader.GetInt32(reader.GetOrdinal("ID")),
                Codigo = reader.GetString(reader.GetOrdinal("CODIGO")),
                NombreIdioma = reader.GetString(reader.GetOrdinal("IDIOMA")),
                Preestablecido = reader.GetBoolean(reader.GetOrdinal("PREESTABLECIDO")),
                Activo = reader.GetBoolean(reader.GetOrdinal("ACTIVO")),
                Bandera = reader.IsDBNull(reader.GetOrdinal("BANDERA")) ? null : reader.GetString(reader.GetOrdinal("BANDERA")),
                FechaCreacion = reader.GetDateTime(reader.GetOrdinal("FECHA_CREACION"))
            };
        }

        protected override Idioma Transform(DataRow row)
        {
            return new Idioma
            {
                Id = Convert.ToInt32(row["ID"]),
                Codigo = row["CODIGO"].ToString(),
                NombreIdioma = row["IDIOMA"].ToString(),
                Preestablecido = Convert.ToBoolean(row["PREESTABLECIDO"]),
                Activo = Convert.ToBoolean(row["ACTIVO"]),
                Bandera = row["BANDERA"] != DBNull.Value ? row["BANDERA"].ToString() : null,
                FechaCreacion = Convert.ToDateTime(row["FECHA_CREACION"])
            };
        }

        // Métodos abstractos no usados
        public override int Create(Idioma entity) { throw new NotImplementedException(); }
        public override void Update(Idioma entity) { throw new NotImplementedException(); }
        public override void Delete(int id) { throw new NotImplementedException(); }
    }
}
