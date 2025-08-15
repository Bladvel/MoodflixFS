using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BE
{
    public class Emocion
    {
        public int Id { get; private set; }
        public string Imagen { get; set; }
        public TipoEmocion Tipo { get; set; }
        public string Nombre => Tipo.ToString();
        override public string ToString()
        {
            return Nombre;
        }
        public Emocion(TipoEmocion tipo, string imagen)
        {
            Imagen = imagen;
            Tipo = tipo;
        }


    }
}
