using BE;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static BE.Pedido;

namespace DAL
{
    public class PedidoDAL : Mapper<Pedido>  
    {
        protected override Pedido Transform(DataRow row)
        {
            return new Pedido
            {
                Id = Convert.ToInt32(row["Id"]),
                UsuarioId = Convert.ToInt32(row["UsuarioId"]),
                FechaPedido = Convert.ToDateTime(row["FechaPedido"]),
                Total = Convert.ToDecimal(row["Total"]),
                Estado = row["Estado"].ToString(),
                DireccionEnvioId = Convert.ToInt32(row["DireccionEnvioId"])
            };
        }

        public override List<Pedido> GetAll()
        {
            throw new NotImplementedException("Use ListarPorUsuario instead");
        }

        public List<Pedido> ListarPorUsuario(int usuarioId)
        {
            var pedidos = new List<Pedido>();

            using (var con = new SqlConnection(_connectionString))
            {
                var cmd = new SqlCommand("sp_ListarPedidosPorUsuario", con);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@UsuarioId", usuarioId);

                var da = new SqlDataAdapter(cmd);
                var dt = new DataTable();
                da.Fill(dt);

                foreach (DataRow row in dt.Rows)
                {
                    var pedido = Transform(row);
                    // Cargar detalles del pedido
                    pedido.Detalles = ObtenerDetalles(pedido.Id);
                    pedidos.Add(pedido);
                }
            }

            return pedidos;
        }

        public override Pedido GetById(int id)
        {
            using (var con = new SqlConnection(_connectionString))
            {
                var cmd = new SqlCommand("sp_ObtenerPedidoPorId", con);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@PedidoId", id);

                var da = new SqlDataAdapter(cmd);
                var dt = new DataTable();
                da.Fill(dt);

                if (dt.Rows.Count == 1)
                {
                    var pedido = Transform(dt.Rows[0]);
                    pedido.Detalles = ObtenerDetalles(id);
                    return pedido;
                }
            }

            return null;
        }

        private List<DetallePedido> ObtenerDetalles(int pedidoId)
        {
            var detalles = new List<DetallePedido>();

            using (var con = new SqlConnection(_connectionString))
            {
                var cmd = new SqlCommand("sp_ObtenerDetallePedido", con);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@PedidoId", pedidoId);

                var da = new SqlDataAdapter(cmd);
                var dt = new DataTable();
                da.Fill(dt);

                foreach (DataRow row in dt.Rows)
                {
                    detalles.Add(new DetallePedido
                    {
                        Id = Convert.ToInt32(row["Id"]),
                        PedidoId = Convert.ToInt32(row["PedidoId"]),
                        ProductoId = Convert.ToInt32(row["ProductoId"]),
                        Cantidad = Convert.ToInt32(row["Cantidad"]),
                        PrecioUnitario = Convert.ToDecimal(row["PrecioUnitario"]),
                        Producto = new ProductoDetalle  //USAR ProductoDetalle
                        {
                            Id = Convert.ToInt32(row["ProductoId"]),
                            Nombre = row["Nombre"].ToString(),
                            Descripcion = row["Descripcion"].ToString(),
                            UrlImagen = row["UrlImagen"].ToString(),
                            Tipo = row["Tipo"].ToString()
                        }
                    });
                }
            }

            return detalles;
        }

        public override int Create(Pedido pedido)
        {
            using (var con = new SqlConnection(_connectionString))
            {
                con.Open();
                using (var transaction = con.BeginTransaction())
                {
                    try
                    {
                        // Crear el pedido
                        var cmd = new SqlCommand("sp_CrearPedido", con, transaction);
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.Parameters.AddWithValue("@UsuarioId", pedido.UsuarioId);
                        cmd.Parameters.AddWithValue("@DireccionEnvioId", pedido.DireccionEnvioId);
                        cmd.Parameters.AddWithValue("@Total", pedido.Total);
                        cmd.Parameters.AddWithValue("@Estado", pedido.Estado);

                        int pedidoId = Convert.ToInt32(cmd.ExecuteScalar());

                        // Agregar detalles del pedido
                        foreach (var detalle in pedido.Detalles)
                        {
                            var cmdDetalle = new SqlCommand("sp_AgregarDetallePedido", con, transaction);
                            cmdDetalle.CommandType = CommandType.StoredProcedure;
                            cmdDetalle.Parameters.AddWithValue("@PedidoId", pedidoId);
                            cmdDetalle.Parameters.AddWithValue("@ProductoId", detalle.ProductoId);
                            cmdDetalle.Parameters.AddWithValue("@Cantidad", detalle.Cantidad);
                            cmdDetalle.Parameters.AddWithValue("@PrecioUnitario", detalle.PrecioUnitario);
                            cmdDetalle.ExecuteNonQuery();
                        }

                        transaction.Commit();
                        return pedidoId;
                    }
                    catch
                    {
                        transaction.Rollback();
                        throw;
                    }
                }
            }
        }

        public override void Update(Pedido entity)
        {
            throw new NotImplementedException();
        }

        public void ActualizarEstado(int pedidoId, string nuevoEstado)
        {
            using (var con = new SqlConnection(_connectionString))
            {
                var cmd = new SqlCommand("sp_ActualizarEstadoPedido", con);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@PedidoId", pedidoId);
                cmd.Parameters.AddWithValue("@NuevoEstado", nuevoEstado);

                con.Open();
                cmd.ExecuteNonQuery();
            }
        }

        public List<Pedido> ListarTodos()
        {
            var pedidos = new List<Pedido>();

            using (var con = new SqlConnection(_connectionString))
            {
                var cmd = new SqlCommand("SELECT * FROM Pedido ORDER BY FechaPedido DESC", con);

                var da = new SqlDataAdapter(cmd);
                var dt = new DataTable();
                da.Fill(dt);

                foreach (DataRow row in dt.Rows)
                {
                    var pedido = Transform(row);
                    pedido.Detalles = ObtenerDetalles(pedido.Id);
                    pedidos.Add(pedido);
                }
            }

            return pedidos;
        }
        public override void Delete(int id)
        {
            throw new NotImplementedException();
        }
    }
}
