using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BE.DTOs
{
    public class TraduccionesDTO
    {
        public int IdiomaId { get; set; }
        public string CodigoIdioma { get; set; }
        public Dictionary<string, object> Traducciones { get; set; }
    }
}
