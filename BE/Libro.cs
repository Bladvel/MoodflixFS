using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BE
{
    public class Libro : Producto
    {
        [Required(ErrorMessage = "El autor del libro es requerido.")]
        [StringLength(200)]
        public string Autor { get; set; }

        [Required(ErrorMessage = "La editorial del libro es requerida.")]
        [StringLength(200)]
        public string Editorial { get; set; }

        [Required(ErrorMessage = "El ISBN del libro es requerido.")]
        [StringLength(20)]
        public string ISBN { get; set; }

        public Libro()
        {
            base.Tipo = "Libro";
        }
    }
}
