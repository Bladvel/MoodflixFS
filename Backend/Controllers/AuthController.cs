using Backend.Models;
using BE;
using BLL;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace Backend.Controllers
{
    [RoutePrefix("api/auth")]
    public class AuthController : ApiController
    {
        private readonly UsuarioBLL _usuarioBLL = new UsuarioBLL();

        /// <summary>
        /// POST: api/auth/login
        /// Autentica a un usuario y, si es exitoso, devuelve su información y permisos.
        /// </summary>
        [HttpPost]
        [Route("login")]
        //[AllowAnonymous]
        public IHttpActionResult Login([FromBody] LoginModel model)
        {

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var usuarioIngresante = new Usuario
                {
                    Email = model.Email,
                    PasswordHash = model.Password
                };
                var usuarioRegistrado = _usuarioBLL.Login(usuarioIngresante);

                usuarioRegistrado.PasswordHash = null;

                return Ok(usuarioRegistrado);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
