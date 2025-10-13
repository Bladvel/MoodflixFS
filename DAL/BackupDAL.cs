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
    public class BackupDAL
    {
        private readonly string _connectionString =  ConfigurationManager.ConnectionStrings["DefaultConnection"].ConnectionString;

        private readonly string _masterConnectionString;

        public BackupDAL()
        {
            var builder = new SqlConnectionStringBuilder(_connectionString)
            {
                InitialCatalog = "master"
            };
            _masterConnectionString = builder.ConnectionString;
        }

        public void GenerarBackup(string rutaArchivo)
        {
            using (var con = new SqlConnection(_connectionString))
            {
                var cmd = new SqlCommand("sp_GenerarBackup", con);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@ruta", rutaArchivo);

                con.Open();
                cmd.ExecuteNonQuery();
            }
        }

        public void RestaurarBackup(string rutaArchivo)
        {

            using (var con = new SqlConnection(_masterConnectionString))
            {
                con.Open();


                string sqlSingleUser = "ALTER DATABASE [Moodflix] SET SINGLE_USER WITH ROLLBACK IMMEDIATE";
                using (var cmd = new SqlCommand(sqlSingleUser, con))
                {
                    cmd.ExecuteNonQuery();
                }

                string sqlRestore = $"USE MASTER RESTORE DATABASE [Moodflix] FROM DISK = N'{rutaArchivo}' WITH FILE = 1, NOUNLOAD, REPLACE, STATS = 10";
                using (var cmd = new SqlCommand(sqlRestore, con))
                {
                    cmd.ExecuteNonQuery();
                }

                string sqlMultiUser = "ALTER DATABASE [Moodflix] SET MULTI_USER";
                using (var cmd = new SqlCommand(sqlMultiUser, con))
                {
                    cmd.ExecuteNonQuery();
                }
            }
        }

    }
}
