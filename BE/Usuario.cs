using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BE
{
    public class Usuario
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "El nombre de usuario es requerido")]
        [StringLength(100)]
        public string NombreUsuario { get; set; }

        [Required(ErrorMessage = "El correo electrónico es requerido")]
        [EmailAddress(ErrorMessage = "El formato del correo electrónico no es válido")]
        [StringLength(200)]
        public string Email { get; set; }

        [Required(ErrorMessage = "La contraseña es requerida")]
        public string PasswordHash { get; set; }
        public int IntentosFallidos { get; set; }
        public bool Bloqueado { get; set; }
        public string SessionToken { get; set; }


        public ICollection<Direccion> Direcciones { get; set; }
        public ICollection<Pedido> Pedidos { get; set; }
        public ICollection<Permiso> Permisos { get; set; }

        public Usuario()
        {
            Direcciones = new HashSet<Direccion>();
            Pedidos = new HashSet<Pedido>();
            Permisos = new HashSet<Permiso>();

            IntentosFallidos = 0;
            Bloqueado = false;
        }
    }
}
