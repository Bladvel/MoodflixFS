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
        public string Mensaje { get; set; }
        public Bitacora()
        {
            Fecha = DateTime.Now;
        }

        //Nota:
        // Criticidad:
        // 1 - Login
        // 2 - Alta, Actualizacion
        // 3 - Baja
        // 4 - Todo referente a permisos y usuarios, generacion de backup
        // 5 - Error Grave, restauracion de backup

    }
}
