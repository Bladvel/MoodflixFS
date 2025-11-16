using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Serialization;

namespace BE
{
    public abstract class Producto
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "El nombre del producto es requerido.")]
        [StringLength(200)]
        public string Nombre { get; set; }

        [StringLength(1000)]
        public string Descripcion { get; set; }

        [Required(ErrorMessage = "El precio es requerido.")]
        [Range(0.01, 99999999.99, ErrorMessage = "El precio debe ser mayor a cero.")]
        public decimal Precio { get; set; }

        [Required(ErrorMessage = "El stock es requerido.")]
        [Range(0, int.MaxValue, ErrorMessage = "El stock no puede ser negativo.")]
        public int Stock { get; set; }

        [StringLength(2048)]
        public string UrlImagen { get; set; }


        [Required]
        public string Tipo { get; set; }

        [XmlIgnore]
        public virtual ICollection<Emocion> Emociones { get; set; }

        public Producto()
        {
            Emociones = new HashSet<Emocion>();
        }
        
    }
}
