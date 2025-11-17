using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BE
{
    public class ResultadoIntegridad
    {
        public bool EsValido { get; set; }
        public List<string> Errores { get; set; }

        public ResultadoIntegridad()
        {
            Errores = new List<string>();
            EsValido = true;
        }
    }
}
