using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BE
{
    public class Traduccion
    {
        public int IdIdioma { get; set; }
        public int IdEtiqueta { get; set; }
        public string TextoTraduccion { get; set; }
        public DateTime? FechaModificacion { get; set; }

        public Idioma Idioma { get; set; }
        public Etiqueta Etiqueta { get; set; }
    }
}
