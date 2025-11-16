using BE;
using DAL;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL
{
    public class PedidoBLL
    {
        private readonly PedidoDAL _pedidoDAL = new PedidoDAL();

        public List<Pedido> ListarPorUsuario(int usuarioId)
        {
            if (usuarioId <= 0)
                throw new Exception("El ID de usuario no es válido.");

            return _pedidoDAL.ListarPorUsuario(usuarioId);
        }

        public Pedido ObtenerPorId(int id)
        {
            if (id <= 0)
                throw new Exception("El ID del pedido no es válido.");

            return _pedidoDAL.GetById(id);
        }

        public void ActualizarEstado(int pedidoId, string nuevoEstado)
        {
            if (pedidoId <= 0)
                throw new Exception("El ID del pedido no es válido.");

            var estadosPermitidos = new[] { "Creado", "Pagado", "EnPreparacion", "Enviado", "Completado", "Cancelado" };
            if (!estadosPermitidos.Contains(nuevoEstado))
                throw new Exception($"Estado '{nuevoEstado}' no es válido.");

            _pedidoDAL.ActualizarEstado(pedidoId, nuevoEstado);
        }

        public List<Pedido> ListarTodos()
        {
            return _pedidoDAL.ListarTodos();
        }
        public Pedido CrearPedido(CrearPedidoRequest request)
        {
            if (request == null)
                throw new ArgumentNullException(nameof(request));

            if (request.Items == null || !request.Items.Any())
                throw new Exception("El pedido debe tener al menos un producto.");

            // Calcular total
            decimal total = request.Items.Sum(item => item.PrecioUnitario * item.Cantidad);

            var pedido = new Pedido
            {
                UsuarioId = request.UsuarioId,
                DireccionEnvioId = request.DireccionEnvioId,
                Total = total,
                Estado = "Creado",
                Detalles = request.Items.Select(item => new DetallePedido
                {
                    ProductoId = item.ProductoId,
                    Cantidad = item.Cantidad,
                    PrecioUnitario = item.PrecioUnitario
                }).ToList()
            };

            int pedidoId = _pedidoDAL.Create(pedido);
            pedido.Id = pedidoId;

            return pedido;
        }
    }
}
