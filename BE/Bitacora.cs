using BE.Types;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BE
{
    public class Bitacora
    {
        public int Id { get; set; }
        public DateTime Fecha { get; set; }
        public Usuario Usuario { get; set; }
        public TipoModulo Modulo { get; set; }
        public TipoOperacion Operacion { get; set; }
        public int Criticidad { get; set; }
        public Bitacora()
        {
            Fecha = DateTime.Now;
        }
    }
}
