using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BE
{
    public class Pedido
    {
        public int Id { get; set; }
        public int UsuarioId { get; set; }
        public DateTime FechaPedido { get; set; }
        public decimal Total { get; set; }
        public string Estado { get; set; } // Pendiente, Enviado, Completado, Cancelado
        public int DireccionEnvioId { get; set; }

        public virtual Usuario Usuario { get; set; }
        public virtual List<DetallePedido> Detalles { get; set; }

        public Pedido()
        {
            Detalles = new List<DetallePedido>();
            FechaPedido = DateTime.Now;
            Estado = "Creado";
        }


        public class ProductoDetalle
        {
            public int Id { get; set; }
            public string Nombre { get; set; }
            public string Descripcion { get; set; }
            public string UrlImagen { get; set; }
            public string Tipo { get; set; }
        }

    }
}
