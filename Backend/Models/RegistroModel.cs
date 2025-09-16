using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace Backend.Models
{
    public class RegistroModel
    {
        [Required(ErrorMessage = "El Nombre de Usuario es requerido.")]
        [StringLength(100)]
        public string NombreUsuario { get; set; }

        [Required(ErrorMessage = "El Email es requerido.")]
        [EmailAddress(ErrorMessage = "El formato del Email no es válido.")]
        public string Email { get; set; }

        [Required(ErrorMessage = "La contraseña es requerida.")]
        public string Password { get; set; }
    }
}