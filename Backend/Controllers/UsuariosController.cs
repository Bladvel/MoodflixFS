using Backend.Infrastructure;
using Backend.Models;
using BE;
using BE.Types;
using BLL;
using Newtonsoft.Json.Linq;
using Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Web.Http;

namespace Backend.Controllers
{
    /// <summary>
    /// Controlador para la gestión de usuarios.
    /// </summary>
    [RoutePrefix("api/usuarios")]
    public class UsuariosController : ApiController
    {
        private readonly UsuarioBLL _usuarioBLL = new UsuarioBLL();
        private readonly PermisoBLL _permisoBLL = new PermisoBLL();


        /// <summary>
        /// GET: api/usuarios
        /// Obtiene una lista de todos los usuarios.
        /// </summary>
        [HttpGet]
        [Route("")]
        [CustomAuthorize(Permissions ="GESTIONAR_USUARIOS")]
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
        [AllowAnonymous]
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

                Task.Run(() =>
                {
                    try
                    {
                        var dvBLL_background = new DVBLL();
                        var userBLL_background = new UsuarioBLL();

                        dvBLL_background.ActualizarDVH("Usuario", usuarioCreado.Id, usuarioCreado);


                        var todosLosUsuarios = userBLL_background.GetAll();
                        dvBLL_background.RecalcularDVV("Usuario", todosLosUsuarios.Cast<object>().ToList());
                    }
                    catch (Exception ex)
                    {
                        BitacoraBLL.Instance.Registrar( new Bitacora 
                        { 
                            Operacion = TipoOperacion.IntegridadDatos,
                            Modulo = TipoModulo.Usuarios,
                            Criticidad = 3,
                            Mensaje = $"Fallo DV background (Register Usuario): {ex.Message}"
                        });
                    }
                });


                BitacoraBLL.Instance.Registrar(new BE.Bitacora
                {
                    Modulo = BE.Types.TipoModulo.Usuarios,
                    Operacion = BE.Types.TipoOperacion.Alta,
                    Criticidad = 4,
                    Mensaje = $"Se creó el usuario: {usuarioCreado.NombreUsuario}, Id: {usuarioCreado.Id}",
                });

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
        /// Actualiza los datos básicos de un usuario (no los permisos).
        /// </summary>
        [HttpPut]
        [Route("{id:int}")]
        [CustomAuthorize(Permissions ="GESTIONAR_USUARIOS")]
        public IHttpActionResult Update(int id, [FromBody] Usuario usuario)
        {
            /*if (!ModelState.IsValid || id != usuario.Id)
            {
                //return BadRequest();
                return Content(HttpStatusCode.BadRequest, new { Message = "Datos inválidos o ID no coincide" });
            }*/

            // Validar que el ID coincida
            if (id != usuario.Id)
            {
                return Content(HttpStatusCode.BadRequest, new { Message = "El ID en la URL no coincide con el ID del usuario" });
            }

            try
            {
                // Obtener el usuario existente
                var usuarioExistente = _usuarioBLL.GetUsuarioById(id);
                if (usuarioExistente == null)
                {
                    return NotFound();
                }

                // Actualizar solo los campos permitidos
                usuarioExistente.NombreUsuario = usuario.NombreUsuario;
                usuarioExistente.Email = usuario.Email;
                
                // Si se está desbloqueando, resetear intentos fallidos
                if (usuarioExistente.Bloqueado && !usuario.Bloqueado)
                {
                    usuarioExistente.IntentosFallidos = 0;
                }
                
                usuarioExistente.Bloqueado = usuario.Bloqueado;
                
                // IMPORTANTE: Actualizar con usuarioExistente que tiene la contraseña
                _usuarioBLL.Update(usuarioExistente);

                var user = TokenService.GetUserData(RequestContext.Principal as ClaimsPrincipal);

                Task.Run(() =>
                {
                    try
                    {
                        var dvBLL_background = new DVBLL();
                        var userBLL_background = new UsuarioBLL();

                        dvBLL_background.ActualizarDVH("Usuario", usuarioExistente.Id, usuarioExistente);


                        var todosLosUsuarios = userBLL_background.GetAll();
                        dvBLL_background.RecalcularDVV("Usuario", todosLosUsuarios.Cast<object>().ToList());
                    }
                    catch (Exception ex)
                    {
                        BitacoraBLL.Instance.Registrar(new Bitacora
                        {
                            Usuario = user,
                            Operacion = TipoOperacion.IntegridadDatos,
                            Modulo = TipoModulo.Usuarios,
                            Criticidad = 3,
                            Mensaje = $"Fallo DV background (Actualizar Usuario): {ex.Message}"
                        });
                    }
                });


                BitacoraBLL.Instance.Registrar(new BE.Bitacora
                {
                    Modulo = BE.Types.TipoModulo.Usuarios,
                    Operacion = BE.Types.TipoOperacion.Actualizacion,
                    Criticidad = 4,
                    Usuario = user,
                    Mensaje = $"Usuario {user.NombreUsuario} actualizó el usuario: {usuario.NombreUsuario}, Id: {usuario.Id}",
                });


                return Ok(new { Message = "Usuario actualizado correctamente", Success = true });
            }
            catch (Exception ex)
            {
                return Content(HttpStatusCode.BadRequest, new { Message = ex.Message, Success = false });
            }
        }

        /// <summary>
        /// PUT: api/usuarios/5/permisos
        /// Asigna una lista de permisos a un usuario, reemplazando la anterior.
        /// </summary>
        [HttpPut]
        [Route("{id:int}/permisos")]
        [CustomAuthorize]
        public IHttpActionResult AsignarPermisos(int id, [FromBody] List<JObject> permisos)
        {
            try
            {
                var usuario = _usuarioBLL.GetUsuarioById(id);
                if (usuario == null)
                {
                    return NotFound();
                }

                usuario.Permisos.Clear();
                if (permisos != null)
                {
                    foreach (JObject p in permisos)
                    {
                        usuario.Permisos.Add(PermisoSerializer.Deserializar(p));
                    }
                }

                _permisoBLL.GuardarPermisosDeUsuario(usuario);

                var user = TokenService.GetUserData(RequestContext.Principal as ClaimsPrincipal);

                BitacoraBLL.Instance.Registrar(new BE.Bitacora
                {
                    Modulo = BE.Types.TipoModulo.Usuarios,
                    Operacion = BE.Types.TipoOperacion.Actualizacion,
                    Criticidad = 4,
                    Usuario = user,
                    Mensaje = $"Usuario {user.NombreUsuario} actualizó los permisos del usuario: {usuario.NombreUsuario}, Id: {usuario.Id}",
                });


                return Ok(new { Message = "Permisos actualizados correctamente" });
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
        [CustomAuthorize]
        public IHttpActionResult Delete(int id)
        {
            var usuarioExistente = _usuarioBLL.GetUsuarioById(id);

            if (usuarioExistente == null)
            {
                return Content(HttpStatusCode.NotFound, new { Message = $"Usuario con ID {id} no fue encontrado." });
            }

            try
            {

                _usuarioBLL.Delete(id);

                var user = TokenService.GetUserData(RequestContext.Principal as ClaimsPrincipal);

                Task.Run(() =>
                {
                    try
                    {
                        var dvBLL_background = new DVBLL();
                        var userBLL_background = new UsuarioBLL();

                        dvBLL_background.BorrarDVH("Usuario", id);


                        var todosLosUsuarios = userBLL_background.GetAll();
                        dvBLL_background.RecalcularDVV("Usuario", todosLosUsuarios.Cast<object>().ToList());
                    }
                    catch (Exception ex)
                    {
                        BitacoraBLL.Instance.Registrar(new Bitacora
                        {
                            Usuario = user,
                            Operacion = TipoOperacion.IntegridadDatos,
                            Modulo = TipoModulo.Usuarios,
                            Criticidad = 3,
                            Mensaje = $"Fallo DV background (Eliminar Usuario): {ex.Message}"
                        });
                    }
                });

                BitacoraBLL.Instance.Registrar(new BE.Bitacora
                {
                    Modulo = BE.Types.TipoModulo.Usuarios,
                    Operacion = BE.Types.TipoOperacion.Baja,
                    Criticidad = 4,
                    Usuario = user,
                    Mensaje = $"Usuario {user.NombreUsuario} eliminó el usuario {usuarioExistente.NombreUsuario} Id: {id}",
                });

                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }



        /// <summary>
        /// Endpoint para probar el atributo de permisos
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [Route("prohibido")]
        [CustomAuthorize(Permissions ="AccesoProhibido")]
        public IHttpActionResult GetProhibido()
        {
            return Ok(new { Message = "Acceso Aceptado! Tiene permisos para acceder a este recurso." });
        }


        /// <summary>
        /// GET: api/usuarios/mi-perfil
        /// Obtiene la información del usuario actualmente logueado.
        /// </summary>
        [HttpGet]
        [Route("mi-perfil")]
        [CustomAuthorize]
        public IHttpActionResult GetMiPerfil()
        {

            var principal = RequestContext.Principal as ClaimsPrincipal;

            if (principal == null)
            {
                return Unauthorized();
            }


            var user = TokenService.GetUserData(principal);


            return Ok(user);
        }

    }
}
