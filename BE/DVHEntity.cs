using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BE
{
    public class DVHEntity
    {
        public int Id { get; set; }
        public string Tabla { get; set; }
        public int RegistroId { get; set; }
        public string DVH { get; set; }
    }
}
