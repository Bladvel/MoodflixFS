using BE; // Para DVHEntity y DVVEntity
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data; // Para DataTable y DataRow
using System.Data.SqlClient;

namespace DAL
{
    public class DVDAL
    {
        private readonly string _connectionString = ConfigurationManager.ConnectionStrings["DefaultConnection"].ConnectionString;

        private DVHEntity TransformDVH(DataRow row)
        {
            return new DVHEntity
            {
                Id = Convert.ToInt32(row["Id"]),
                Tabla = row["Tabla"].ToString(),
                RegistroId = Convert.ToInt32(row["RegistroId"]),
                DVH = row["DVH"].ToString()
            };
        }


        private DVVEntity TransformDVV(DataRow row)
        {
            return new DVVEntity
            {
                Id = Convert.ToInt32(row["Id"]),
                Tabla = row["Tabla"].ToString(),
                Columna = row["Columna"].ToString(),
                DVV = row["DVV"].ToString()
            };
        }


        public DVHEntity ObtenerDVH(string tabla, int registroId)
        {
            using (var con = new SqlConnection(_connectionString))
            {

                var da = new SqlDataAdapter("SELECT Id, Tabla, RegistroId, DVH FROM DVH WHERE Tabla = @tabla AND RegistroId = @id", con);
                da.SelectCommand.CommandType = CommandType.Text;
                da.SelectCommand.Parameters.AddWithValue("@tabla", tabla);
                da.SelectCommand.Parameters.AddWithValue("@id", registroId);

                var dt = new DataTable();
                da.Fill(dt);

                if (dt.Rows.Count > 0)
                {
                    return TransformDVH(dt.Rows[0]); 
                }
            }
            return null;
        }


        public List<DVHEntity> ObtenerTodosLosDVH(string tabla)
        {
            var lista = new List<DVHEntity>();
            using (var con = new SqlConnection(_connectionString))
            {

                var da = new SqlDataAdapter("SELECT Id, Tabla, RegistroId, DVH FROM DVH WHERE Tabla = @tabla", con);
                da.SelectCommand.CommandType = CommandType.Text;
                da.SelectCommand.Parameters.AddWithValue("@tabla", tabla);

                var dt = new DataTable();
                da.Fill(dt); 


                foreach (DataRow row in dt.Rows)
                {
                    lista.Add(TransformDVH(row));
                }
            }
            return lista;
        }


        public void ActualizarDVH(string tabla, int registroId, string dvh)
        {
            string query = @"
                IF EXISTS (SELECT 1 FROM DVH WHERE Tabla = @tabla AND RegistroId = @id)
                    UPDATE DVH SET DVH = @dvh WHERE Tabla = @tabla AND RegistroId = @id;
                ELSE
                    INSERT INTO DVH (Tabla, RegistroId, DVH) VALUES (@tabla, @id, @dvh);";

            using (var con = new SqlConnection(_connectionString))
            {
                var cmd = new SqlCommand(query, con);
                cmd.CommandType = CommandType.Text;
                cmd.Parameters.AddWithValue("@tabla", tabla);
                cmd.Parameters.AddWithValue("@id", registroId);
                cmd.Parameters.AddWithValue("@dvh", dvh);

                con.Open();
                cmd.ExecuteNonQuery();
            }
        }


        public DVVEntity ObtenerDVV(string tabla, string columna)
        {
            using (var con = new SqlConnection(_connectionString))
            {
                var da = new SqlDataAdapter("SELECT Id, Tabla, Columna, DVV FROM DVV WHERE Tabla = @tabla AND Columna = @columna", con);
                da.SelectCommand.CommandType = CommandType.Text;
                da.SelectCommand.Parameters.AddWithValue("@tabla", tabla);
                da.SelectCommand.Parameters.AddWithValue("@columna", columna);

                var dt = new DataTable();
                da.Fill(dt);

                if (dt.Rows.Count > 0)
                {
                    return TransformDVV(dt.Rows[0]);
                }
            }
            return null;
        }


        public void ActualizarDVV(string tabla, string columna, string dvv)
        {
            string query = @"
                IF EXISTS (SELECT 1 FROM DVV WHERE Tabla = @tabla AND Columna = @columna)
                    UPDATE DVV SET DVV = @dvv WHERE Tabla = @tabla AND Columna = @columna;
                ELSE
                    INSERT INTO DVV (Tabla, Columna, DVV) VALUES (@tabla, @columna, @dvv);";

            using (var con = new SqlConnection(_connectionString))
            {
                var cmd = new SqlCommand(query, con);
                cmd.CommandType = CommandType.Text;
                cmd.Parameters.AddWithValue("@tabla", tabla);
                cmd.Parameters.AddWithValue("@columna", columna);
                cmd.Parameters.AddWithValue("@dvv", dvv);

                con.Open();
                cmd.ExecuteNonQuery();
            }
        }
    }
}