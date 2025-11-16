using BE;
using BE.Types;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;


namespace DAL
{
    public class BitacoraDAL:Mapper<BE.Bitacora>
    {
        private readonly UsuarioDAL _usuarioDAL = new UsuarioDAL();
        public override int Create(Bitacora evento)
        {
            using (var con = new SqlConnection(_connectionString))
            {
                var cmd = new SqlCommand("sp_InsertarBitacora", con);
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@Fecha", evento.Fecha);
                cmd.Parameters.AddWithValue("@UsuarioId", (object)evento.Usuario?.Id ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@Modulo", evento.Modulo.ToString());
                cmd.Parameters.AddWithValue("@Operacion", evento.Operacion.ToString());
                cmd.Parameters.AddWithValue("@Criticidad", evento.Criticidad);
                cmd.Parameters.AddWithValue("@Mensaje", evento.Mensaje);

                con.Open();
                return Convert.ToInt32(cmd.ExecuteScalar());
            }
        }


        public override List<Bitacora> GetAll()
        {
            return ListarConFiltros();
        }


        public List<Bitacora> ListarConFiltros(int? usuarioId = null, int? criticidad = null, DateTime? fechaDesde = null, DateTime? fechaHasta = null)
        {
            var dt = new DataTable();
            using (var con = new SqlConnection(_connectionString))
            {
                var da = new SqlDataAdapter("sp_ListarBitacora", con);
                da.SelectCommand.CommandType = CommandType.StoredProcedure;
                da.SelectCommand.Parameters.AddWithValue("@UsuarioId", (object)usuarioId ?? DBNull.Value);
                da.SelectCommand.Parameters.AddWithValue("@Criticidad", (object)criticidad ?? DBNull.Value);
                da.SelectCommand.Parameters.AddWithValue("@FechaDesde", (object)fechaDesde ?? DBNull.Value);
                da.SelectCommand.Parameters.AddWithValue("@FechaHasta", (object)fechaHasta ?? DBNull.Value);
                da.Fill(dt);
            }

            // Obtener IDs únicos de usuarios
            var userIds = dt.AsEnumerable()
                .Where(row => row["UsuarioId"] != DBNull.Value)
                .Select(row => Convert.ToInt32(row["UsuarioId"]))
                .Distinct()
                .ToList();

            // Cargar usuarios de forma simple
            var usuarios = new Dictionary<int, Usuario>();
            if (userIds.Count > 0)
            {
                using (var con = new SqlConnection(_connectionString))
                {
                    con.Open();
                    foreach (var id in userIds)
                    {
                        var cmd = new SqlCommand("SELECT Id, NombreUsuario, Email FROM Usuario WHERE Id = @Id", con);
                        cmd.Parameters.AddWithValue("@Id", id);

                        using (var reader = cmd.ExecuteReader())
                        {
                            if (reader.Read())
                            {
                                usuarios[id] = new Usuario
                                {
                                    Id = reader.GetInt32(0),
                                    NombreUsuario = reader.GetString(1),
                                    Email = reader.GetString(2)
                                };
                            }
                        }
                    }
                }
            }

            // Transformar las filas
            var eventos = new List<Bitacora>();
            foreach (DataRow row in dt.Rows)
            {
                try
                {
                    var bitacora = new Bitacora
                    {
                        Id = Convert.ToInt32(row["Id"]),
                        Fecha = Convert.ToDateTime(row["Fecha"]),
                        Criticidad = Convert.ToInt32(row["Criticidad"]),
                        Mensaje = row["Mensaje"].ToString()
                    };

                    // Parsear Modulo con manejo de errores
                    string moduloStr = row["Modulo"].ToString();
                    if (Enum.TryParse<TipoModulo>(moduloStr, true, out TipoModulo modulo))
                    {
                        bitacora.Modulo = modulo;
                    }
                    else
                    {
                        System.Diagnostics.Debug.WriteLine($"Valor de Modulo no reconocido: '{moduloStr}'. Usando 'Desconocido'.");
                        bitacora.Modulo = TipoModulo.Desconocido;
                    }

                    // Parsear Operacion con manejo de errores
                    string operacionStr = row["Operacion"].ToString();
                    if (Enum.TryParse<TipoOperacion>(operacionStr, true, out TipoOperacion operacion))
                    {
                        bitacora.Operacion = operacion;
                    }
                    else
                    {
                        System.Diagnostics.Debug.WriteLine($"Valor de Operacion no reconocido: '{operacionStr}'. Usando 'Desconocida'.");
                        bitacora.Operacion = TipoOperacion.Desconocida;
                    }

                    // Asignar usuario si existe
                    if (row["UsuarioId"] != DBNull.Value)
                    {
                        int userId = Convert.ToInt32(row["UsuarioId"]);
                        if (usuarios.ContainsKey(userId))
                        {
                            bitacora.Usuario = usuarios[userId];
                        }
                    }

                    eventos.Add(bitacora);
                }
                catch (Exception ex)
                {
                    System.Diagnostics.Debug.WriteLine($"Error procesando fila de bitácora ID {row["Id"]}: {ex.Message}");
                    // Continuar con la siguiente fila
                }
            }

            return eventos;
        }




        public override Bitacora GetById(int id)
        {
            using (var con = new SqlConnection(_connectionString))
            {
                var da = new SqlDataAdapter("sp_ObtenerBitacoraPorId", con);
                da.SelectCommand.CommandType = CommandType.StoredProcedure;
                da.SelectCommand.Parameters.AddWithValue("@Id", id);
                var dt = new DataTable();
                da.Fill(dt);

                if (dt.Rows.Count == 1)
                {
                    var userId = dt.Rows[0]["UsuarioId"] as int?;
                    var usuarios = new Dictionary<int, Usuario>();
                    if (userId.HasValue)
                    {
                        var usuario = _usuarioDAL.GetById(userId.Value);
                        if (usuario != null) usuarios.Add(userId.Value, usuario);
                    }
                    return Transform(dt.Rows[0], usuarios);
                }
            }
            return null;

  
        }

        public override void Delete(int id)
        {
            using (var con = new SqlConnection(_connectionString))
            {
                var cmd = new SqlCommand("sp_BorrarBitacora", con);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@Id", id);
                con.Open();
                cmd.ExecuteNonQuery();
            }
        }


        public override void Update(Bitacora entity)
        {
            throw new NotImplementedException("No se permite actualizar los registros de la bitácora.");
        }

        protected override Bitacora Transform(DataRow row)
        {
            var bitacora = new Bitacora
            {
                Id = Convert.ToInt32(row["Id"]),
                Fecha = Convert.ToDateTime(row["Fecha"]),
                Modulo = (TipoModulo)Enum.Parse(typeof(TipoModulo), row["Modulo"].ToString()),
                Operacion = (TipoOperacion)Enum.Parse(typeof(TipoOperacion), row["Operacion"].ToString()),
                Criticidad = Convert.ToInt32(row["Criticidad"]),
                Mensaje = row["Mensaje"].ToString()
            };

            if (row["UsuarioId"] != DBNull.Value)
            {
                bitacora.Usuario = _usuarioDAL.GetById(Convert.ToInt32(row["UsuarioId"]));
            }

            return bitacora;
        }

        protected Bitacora Transform(DataRow row, Dictionary<int, Usuario> usuarios)
        {
            var bitacora = new Bitacora
            {
                Id = Convert.ToInt32(row["Id"]),
                Fecha = Convert.ToDateTime(row["Fecha"]),
                Modulo = (TipoModulo)Enum.Parse(typeof(TipoModulo), row["Modulo"].ToString()),
                Operacion = (TipoOperacion)Enum.Parse(typeof(TipoOperacion), row["Operacion"].ToString()),
                Criticidad = Convert.ToInt32(row["Criticidad"]),
                Mensaje = row["Mensaje"].ToString()
            };

            if (row["UsuarioId"] != DBNull.Value)
            {
                int userId = Convert.ToInt32(row["UsuarioId"]);
                if (usuarios.ContainsKey(userId))
                {
                    // Crear un Usuario simple sin colecciones para evitar referencias circulares
                    bitacora.Usuario = new Usuario
                    {
                        Id = usuarios[userId].Id,
                        NombreUsuario = usuarios[userId].NombreUsuario,
                        Email = usuarios[userId].Email
                        // NO incluir: Permisos, Pedidos, Bitacora, Direcciones, etc
                        //bitacora.Usuario = usuarios[userId];
                    };
                }
            }

            return bitacora;
        }

    }
}
