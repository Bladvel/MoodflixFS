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
    public class EmocionDAL : Mapper<Emocion>
    {

        protected override Emocion Transform(DataRow row)
        {
            return new Emocion
            {
                Id = Convert.ToInt32(row["Id"]),
                Nombre = row["Nombre"].ToString(),
                UrlImagen = row["UrlImagen"].ToString()
            };
        }

        public override List<Emocion> GetAll()
        {
            using (var con = new SqlConnection(_connectionString))
            {
                var da = new SqlDataAdapter("SELECT * FROM Emocion", con);
                da.SelectCommand.CommandType = CommandType.Text;
                DataTable table = new DataTable();
                da.Fill(table);

                List<Emocion> emociones = new List<Emocion>();


                foreach (DataRow row in table.Rows)
                {
                    emociones.Add(Transform(row));
                }
                return emociones;

            }
        }

        public override Emocion GetById(int id)
        {
            Emocion emocion = null;
            using(var con = new SqlConnection(_connectionString))
            {
                var cmd = new SqlCommand("sp_ObtenerEmocionPorId", con);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@Id", id);
                var da = new SqlDataAdapter(cmd);
                DataTable table = new DataTable();
                da.Fill(table);
                if (table.Rows.Count == 1)
                {
                    emocion = Transform(table.Rows[0]);
                }
            }
            return emocion;
        }

        
        public override int Create(Emocion emocion)
        {
            using (var con = new SqlConnection(_connectionString))
            {
                var cmd = new SqlCommand("sp_CrearEmocion", con);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@Nombre", emocion.Nombre);
                cmd.Parameters.AddWithValue("@UrlImagen", emocion.UrlImagen);

                con.Open();
                
                return Convert.ToInt32(cmd.ExecuteScalar());
            }
        }

        
        public override void Update(Emocion emocion)
        {
            using (var con = new SqlConnection(_connectionString))
            {
                var cmd = new SqlCommand("sp_ActualizarEmocion", con);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@Id", emocion.Id);
                cmd.Parameters.AddWithValue("@Nombre", emocion.Nombre);
                cmd.Parameters.AddWithValue("@UrlImagen", emocion.UrlImagen);

                con.Open();
                cmd.ExecuteNonQuery();
            }
        }

        
        public override void Delete(int id)
        {
            using (var con = new SqlConnection(_connectionString))
            {
                var cmd = new SqlCommand("sp_BorrarEmocion", con);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@Id", id);

                con.Open();
                cmd.ExecuteNonQuery();
            }
        }
    }
}
