using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BE
{
    public class Idioma
    {
        public int Id { get; set; }
        public string Codigo { get; set; }
        public string NombreIdioma { get; set; }
        public bool Preestablecido { get; set; }
        public bool Activo { get; set; }
        public string Bandera { get; set; }
        public DateTime FechaCreacion { get; set; }
    }
}
