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

        public Usuario Create(Usuario usuario, string password)
        {
            if(usuario == null)
                throw new ArgumentNullException(nameof(usuario), "El usuario no puede ser nulo.");
            if (string.IsNullOrWhiteSpace(usuario.NombreUsuario) || string.IsNullOrEmpty(usuario.Email))
                throw new ArgumentException("El nombre de usuario y el correo electrónico son obligatorios.");

            if(_usuarioDAL.GetByEmail(usuario.Email) != null)
                throw new Exception($"El email {usuario.Email} ya está en uso.");


            ValidarPassword(password);

            usuario.PasswordHash = CryptoManager.HashPassword(password);
            usuario.Id = _usuarioDAL.Create(usuario);
            return usuario;
        }

        public void Update(Usuario usuario)
        {
            if (usuario == null)
                throw new ArgumentNullException(nameof(usuario), "El usuario no puede ser nulo.");
            if (usuario.Id <= 0)
                throw new Exception("El ID del usuario para actualizar no es válido.");

            _usuarioDAL.Update(usuario);
        }

        public void Delete(int id)
        {
            if (id <= 0)
                throw new Exception("El ID del usuario para eliminar no es válido.");

            if (_usuarioDAL.GetById(id) == null)
                throw new Exception($"El usuario con ID {id} no existe.");

            _usuarioDAL.Delete(id);
        }


        public Usuario Login(Usuario usuario)
        {
            Usuario usuarioRegistrado = _usuarioDAL.GetByEmail(usuario.Email);
            if (usuarioRegistrado == null)
                throw new Exception("Usuario no encontrado.");

            if (usuarioRegistrado.Bloqueado)
                throw new Exception("El usuario está bloqueado.");


            string passwordPlana = usuario.PasswordHash;

            if (!CryptoManager.VerificarPassword(passwordPlana, usuarioRegistrado.PasswordHash))
            {
                usuarioRegistrado.IntentosFallidos++;
                if(usuarioRegistrado.IntentosFallidos >=3)
                    usuarioRegistrado.Bloqueado = true;
                _usuarioDAL.Update(usuarioRegistrado);
                throw new Exception("Email o Contraseña incorrecta.");
            }
            else
            {
                usuarioRegistrado.IntentosFallidos = 0;
                _usuarioDAL.Update(usuarioRegistrado);
                return usuarioRegistrado;

            }
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
