using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BE
{
    public class PeliculaCreateDTO
    {
        public string Nombre { get; set; }
        public string Descripcion { get; set; }
        public decimal Precio { get; set; }
        public int Stock { get; set; }
        public string UrlImagen { get; set; }
        public string Director { get; set; }
        public string Productora { get; set; }
        public int AnioLanzamiento { get; set; }
        public List<int> EmocionesIds { get; set; }
    }
}
