using Backend.Models;
using BE;
using BLL;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Net;
using System.Web.Http;

namespace Backend.Controllers
{
    [RoutePrefix("api/usuarios")]
    public class UsuariosController : ApiController
    {
        private readonly UsuarioBLL _usuarioBLL = new UsuarioBLL();
        private readonly PermisoBLL _permisoBLL = new PermisoBLL();

        /// <summary>
        /// GET: api/usuarios
        /// Obtiene una lista de todos los usuarios.
        /// (Endpoint protegido, solo para administradores).
        /// </summary>
        [HttpGet]
        [Route("")]
        public IHttpActionResult GetAll()
        {
            var usuarios = _usuarioBLL.GetAll();
            usuarios.ForEach(u => u.PasswordHash = null);
            return Ok(usuarios);
        }

        /// <summary>
        /// GET: api/usuarios/5
        /// Obtiene un usuario específico por su ID.
        /// </summary>
        [HttpGet]
        [Route("{id:int}", Name = "GetUsuarioById")]
        public IHttpActionResult GetById(int id)
        {
            var usuario = _usuarioBLL.GetUsuarioById(id);
            if (usuario == null)
            {
                return NotFound();
            }
            usuario.PasswordHash = null;
            return Ok(usuario);
        }

        /// <summary>
        /// POST: api/usuarios
        /// Registra un nuevo usuario en el sistema.
        /// </summary>
        [HttpPost]
        [Route("")]
        //[AllowAnonymous]
        public IHttpActionResult Registrar([FromBody] RegistroModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var nuevoUsuario = new Usuario
                {
                    NombreUsuario = model.NombreUsuario,
                    Email = model.Email
                };

                var usuarioCreado = _usuarioBLL.Create(nuevoUsuario, model.Password);

                usuarioCreado.PasswordHash = null;

                return CreatedAtRoute("GetUsuarioById", new { id = usuarioCreado.Id }, usuarioCreado);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        /// <summary>
        /// PUT: api/usuarios/5
        /// Actualiza los datos básicos de un usuario (no la contraseña ni los permisos).
        /// </summary>
        [HttpPut]
        [Route("{id:int}")]
        public IHttpActionResult Update(int id, [FromBody] Usuario usuario)
        {
            if (!ModelState.IsValid || id != usuario.Id)
            {
                return BadRequest();
            }

            try
            {
                _usuarioBLL.Update(usuario);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        /// <summary>
        /// PUT: api/usuarios/5/permisos
        /// Asigna una lista de permisos a un usuario, reemplazando la anterior.
        /// </summary>
        [HttpPut]
        [Route("{id:int}/permisos")]
        public IHttpActionResult AsignarPermisos(int id, [FromBody] List<Permiso> permisos)
        {
            try
            {
                var usuario = _usuarioBLL.GetUsuarioById(id);
                if (usuario == null)
                {
                    return NotFound();
                }

                usuario.Permisos = permisos;
                _permisoBLL.GuardarPermisosDeUsuario(usuario);

                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        /// <summary>
        /// DELETE: api/usuarios/5
        /// Elimina un usuario del sistema.
        /// </summary>
        [HttpDelete]
        [Route("{id:int}")]
        public IHttpActionResult Delete(int id)
        {
            try
            {
                _usuarioBLL.Delete(id);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
