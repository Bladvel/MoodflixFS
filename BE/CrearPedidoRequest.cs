using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BE
{
    public class CrearPedidoRequest
    {
        public int UsuarioId { get; set; }
        public int DireccionEnvioId { get; set; }
        public List<DetallePedidoRequest> Items { get; set; }
    }
}
