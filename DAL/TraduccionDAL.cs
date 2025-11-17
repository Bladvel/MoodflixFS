using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL
{
    public class TraduccionDAL
    {
        private readonly string _connectionString = System.Configuration.ConfigurationManager.ConnectionStrings["DefaultConnection"].ConnectionString;

        public Dictionary<string, string> GetTraduccionesPorIdiomaId(int idiomaId)
        {
            var traducciones = new Dictionary<string, string>();

            using (var con = new SqlConnection(_connectionString))
            {
                var cmd = new SqlCommand(@"
                    SELECT e.NOMBRE, t.TRADUCCION
                    FROM TRADUCCION t
                    INNER JOIN ETIQUETA e ON t.ID_ETIQUETA = e.ID
                    WHERE t.ID_IDIOMA = @IdiomaId
                    ORDER BY e.NOMBRE", con);

                cmd.Parameters.AddWithValue("@IdiomaId", idiomaId);
                con.Open();

                using (var reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        string nombre = reader.GetString(reader.GetOrdinal("NOMBRE"));
                        string traduccion = reader.GetString(reader.GetOrdinal("TRADUCCION"));
                        traducciones[nombre] = traduccion;
                    }
                }
            }

            return traducciones;
        }

        public Dictionary<string, string> GetTraduccionesPorCodigoIdioma(string codigoIdioma)
        {
            var traducciones = new Dictionary<string, string>();

            using (var con = new SqlConnection(_connectionString))
            {
                var cmd = new SqlCommand(@"
                    SELECT e.NOMBRE, t.TRADUCCION
                    FROM TRADUCCION t
                    INNER JOIN ETIQUETA e ON t.ID_ETIQUETA = e.ID
                    INNER JOIN IDIOMA i ON t.ID_IDIOMA = i.ID
                    WHERE i.CODIGO = @Codigo AND i.ACTIVO = 1
                    ORDER BY e.NOMBRE", con);

                cmd.Parameters.AddWithValue("@Codigo", codigoIdioma);
                con.Open();

                using (var reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        string nombre = reader.GetString(reader.GetOrdinal("NOMBRE"));
                        string traduccion = reader.GetString(reader.GetOrdinal("TRADUCCION"));
                        traducciones[nombre] = traduccion;
                    }
                }
            }

            return traducciones;
        }

        public string GetTraduccion(int idiomaId, string nombreEtiqueta)
        {
            using (var con = new SqlConnection(_connectionString))
            {
                var cmd = new SqlCommand(@"
                    SELECT t.TRADUCCION
                    FROM TRADUCCION t
                    INNER JOIN ETIQUETA e ON t.ID_ETIQUETA = e.ID
                    WHERE t.ID_IDIOMA = @IdiomaId AND e.NOMBRE = @Nombre", con);

                cmd.Parameters.AddWithValue("@IdiomaId", idiomaId);
                cmd.Parameters.AddWithValue("@Nombre", nombreEtiqueta);
                con.Open();

                var result = cmd.ExecuteScalar();
                return result != null ? result.ToString() : null;
            }
        }
    }
}
