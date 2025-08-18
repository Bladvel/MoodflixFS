using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BE
{
    public class Emocion
    {
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Nombre { get; set; }

        [Url]
        public string UrlImagen { get; set; } = string.Empty;

        public ICollection<Producto> Productos { get; set; }

        public Emocion()
        {
            Productos = new HashSet<Producto>();
        }


    }
}
