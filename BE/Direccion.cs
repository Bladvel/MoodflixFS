using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BE
{
    public class Direccion
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "El ID de usuario es requerido.")]
        public int UsuarioId { get; set; } // La clave foránea (Foreign Key)

        [Required(ErrorMessage = "La calle es requerida.")]
        [StringLength(200)]
        public string Calle { get; set; }

        [Required(ErrorMessage = "La ciudad es requerida.")]
        [StringLength(100)]
        public string Ciudad { get; set; }

        [Required(ErrorMessage = "El código postal es requerido.")]
        [StringLength(20)]
        public string CodigoPostal { get; set; }

        // La propiedad de navegación, que llenaremos explícitamente cuando sea necesario.
        public Usuario Usuario { get; set; }
    }
}
