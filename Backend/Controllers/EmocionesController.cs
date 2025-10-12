using BE;
using BLL;
using System;
using System.Security.Claims;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.UI.WebControls;
using Backend.Infrastructure;
using Services;

namespace Backend.Controllers
{
    /// <summary>
    /// Expone las operaciones CRUD para la entidad Emocion a través de una API RESTful.
    /// </summary>
    [RoutePrefix("api/emociones")]
    public class EmocionesController : ApiController
    {
        private readonly EmocionBLL _emocionBLL = new EmocionBLL();

        /// <summary>
        /// GET: api/emociones
        /// Obtiene una lista de todas las emociones.
        /// </summary>
        [HttpGet]
        [Route("")]
        public IHttpActionResult GetAll()
        {
            var emociones = _emocionBLL.GetAll();
            return Ok(emociones);
        }

        /// <summary>
        /// GET: api/emociones/5
        /// Obtiene una emoción específica por su ID.
        /// </summary>
        [HttpGet]
        [Route("{id:int}", Name = "GetEmocionById")]
        public IHttpActionResult GetById(int id)
        {
            var emocion = _emocionBLL.GetById(id);

            if (emocion == null)
            {
                return Content(HttpStatusCode.NotFound, new { Message = $"Emocion con ID {id} no fue encontrada." });
            }

            return Ok(emocion);
        }

        /// <summary>
        /// POST: api/emociones
        /// Crea una nueva emoción.
        /// </summary>
        [HttpPost]
        [Route("")]
        [CustomAuthorize]
        public IHttpActionResult Create([FromBody] Emocion emocion)
        {

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var emocionCreada = _emocionBLL.Create(emocion);

                var user = TokenService.GetUserData(RequestContext.Principal as ClaimsPrincipal);

                BitacoraBLL.Instance.Registrar(new BE.Bitacora
                {
                    Modulo = BE.Types.TipoModulo.Emociones,
                    Operacion = BE.Types.TipoOperacion.Alta,
                    Criticidad = 2,
                    Usuario = user,
                    Mensaje = $"Usuario {user.NombreUsuario} creó la emoción: {emocionCreada.Nombre}, Id: {emocionCreada.Id}",
                });


                return CreatedAtRoute("GetEmocionById", new { id = emocionCreada.Id }, emocionCreada);



            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);

            }
        }

        /// <summary>
        /// PUT: api/emociones/5
        /// Actualiza una emoción existente.
        /// </summary>
        [HttpPut]
        [Route("{id:int}")]
        [CustomAuthorize]
        public IHttpActionResult Update(int id, [FromBody] Emocion emocion)
        {
            if (!ModelState.IsValid || id != emocion.Id)
            {
                return BadRequest();
            }

            try
            {
                var emocionExistente = _emocionBLL.GetById(id);
                if (emocionExistente == null)
                {
                    return NotFound();
                }

                _emocionBLL.Update(emocion);

                var user = TokenService.GetUserData(RequestContext.Principal as ClaimsPrincipal);


                BitacoraBLL.Instance.Registrar(new BE.Bitacora
                {
                    Modulo = BE.Types.TipoModulo.Emociones,
                    Operacion = BE.Types.TipoOperacion.Actualizacion,
                    Criticidad = 2,
                    Usuario = user,
                    Mensaje = $"Usuario {user.NombreUsuario} actualizó la emoción: {emocion.Nombre}, Id: {emocion.Id}",
                });



                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        /// <summary>
        /// DELETE: api/emociones/5
        /// Elimina una emoción.
        /// </summary>
        [HttpDelete]
        [Route("{id:int}")]
        [CustomAuthorize]
        public IHttpActionResult Delete(int id)
        {
            try
            {
                var emocionExistente = _emocionBLL.GetById(id);
                if (emocionExistente == null)
                {
                    return Content(HttpStatusCode.NotFound, new { Message = $"Emocion con ID {id} no fue encontrada." });
                }

                _emocionBLL.Delete(id);

                var user = TokenService.GetUserData(RequestContext.Principal as ClaimsPrincipal);
                BitacoraBLL.Instance.Registrar(new BE.Bitacora
                {
                    Modulo = BE.Types.TipoModulo.Emociones,
                    Operacion = BE.Types.TipoOperacion.Baja,
                    Criticidad = 3,
                    Usuario = user,
                    Mensaje = $"Usuario {user.NombreUsuario} eliminó la emoción: {emocionExistente.Nombre}, Id: {emocionExistente.Id}",
                });


                return Ok(new { Message = $"Emocion con ID {id} ha sido eliminado." });
            }
            catch (Exception ex)
            {

                return BadRequest(ex.Message);
            }
        }
    }
}
