using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BE;
using DAL;
using Services;

namespace BLL
{
    public class UsuarioBLL
    {
        private readonly UsuarioDAL _usuarioDAL = new UsuarioDAL();

        public List<Usuario> GetAll()
        {
            return _usuarioDAL.GetAll();
        }

        public Usuario GetUsuarioById(int id)
        {
            if (id <= 0)
                throw new Exception("El ID del usuario no es válido.");
            return _usuarioDAL.GetById(id);
        }

        public Usuario Create(Usuario usuario)
        {
            if(usuario == null)
                throw new ArgumentNullException(nameof(usuario), "El usuario no puede ser nulo.");
            if (string.IsNullOrWhiteSpace(usuario.NombreUsuario) || string.IsNullOrEmpty(usuario.Email))
                throw new ArgumentException("El nombre de usuario y el correo electrónico son obligatorios.");

            if(_usuarioDAL.GetByEmail(usuario.Email) != null)
                throw new Exception($"El email {usuario.Email} ya está en uso.");


            // La contraseña en este punto es la contraseña en texto plano proporcionada por el usuario
            string passwordPlana = usuario.PasswordHash;

            ValidarPassword(passwordPlana);

            usuario.PasswordHash = CryptoManager.HashPassword(passwordPlana);
            usuario.Id = _usuarioDAL.Create(usuario);
            return usuario;
        }

        public void Login(Usuario usuario)
        {
            Usuario usuarioRegistrado = _usuarioDAL.GetByEmail(usuario.Email);
            if (usuarioRegistrado == null)
                throw new Exception("Usuario no encontrado.");

            string passwordPlana = usuario.PasswordHash;

            if (!CryptoManager.VerifyPassword(passwordPlana, usuarioRegistrado.PasswordHash))
                throw new Exception("Contraseña incorrecta.");
        }


        private void ValidarPassword(string password)
        {
            if (string.IsNullOrWhiteSpace(password) || password.Length < 8)
                throw new Exception("La contraseña debe tener al menos 8 caracteres.");
            if (!password.Any(char.IsUpper))
                throw new Exception("La contraseña debe contener al menos una letra mayúscula.");
            if (!password.Any(char.IsLower))
                throw new Exception("La contraseña debe contener al menos una letra minúscula.");
        }
    }
}
