using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BE
{
    public class Pelicula : Producto
    {
        [Required(ErrorMessage = "El director de la película es requerido.")]
        [StringLength(200)]
        public string Director { get; set; }

        [Required(ErrorMessage = "La productora de la película es requerida.")]
        [StringLength(200)]
        public string Productora { get; set; }

        [Required(ErrorMessage = "El año de lanzamiento es requerido.")]
        [Range(1888, 2100, ErrorMessage = "El año de lanzamiento no es válido.")]
        public int AnioLanzamiento { get; set; }

        public Pelicula()
        {
            base.Tipo = "Pelicula";
        }
    }
}
