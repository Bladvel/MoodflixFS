using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BE
{
    public abstract class Permiso
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "El nombre del permiso es requerido")]
        [StringLength(100)]
        public string Nombre { get; set; }
    }
}
