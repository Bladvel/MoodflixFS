using BE;
using BLL;
using System;
using System.Net;
using System.Web.Http;

namespace Backend.Controllers
{
    [RoutePrefix("api/usuarios")]
    public class UsuariosController : ApiController
    {
        private readonly UsuarioBLL _usuarioBLL = new UsuarioBLL();

        /// <summary>
        /// GET: api/usuarios
        /// Obtiene todos los usuarios.
        /// </summary>
        [HttpGet]
        [Route("")]
        public IHttpActionResult GetAll()
        {
            return Ok(_usuarioBLL.GetAll());
        }

        /// <summary>
        /// GET: api/usuarios/{id}
        /// Obtiene un usuario por su ID.
        /// </summary>
        [HttpGet]
        [Route("{id:int}", Name = "GetUsuarioById")]
        public IHttpActionResult GetById(int id)
        {
            if (id <= 0)
            {
                return BadRequest("El ID proporcionado no es válido.");
            }
            var usuario = _usuarioBLL.GetUsuarioById(id);
            if (usuario == null)
            {
                return Content(HttpStatusCode.NotFound, new { Message = $"Usuario con ID {id} no fue encontrado." });
            }
            return Ok(usuario);
        }

        /// <summary>
        /// POST: api/usuarios
        /// Crea un nuevo usuario.
        /// </summary>
        [HttpPost]
        [Route("")]
        public IHttpActionResult Create(Usuario usuario)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var usuarioCreado = _usuarioBLL.Create(usuario);
                usuarioCreado.Password = null;
                return CreatedAtRoute("GetUsuarioById", new { id = usuarioCreado.Id }, usuarioCreado);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

    }
}
