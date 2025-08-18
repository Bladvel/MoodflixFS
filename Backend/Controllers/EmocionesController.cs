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
                return NotFound();
            }

            return Ok(emocion);
        }

        /// <summary>
        /// POST: api/emociones
        /// Crea una nueva emoción.
        /// </summary>
        [HttpPost]
        [Route("")]
        public IHttpActionResult Create([FromBody] Emocion emocion)
        {

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var emocionCreada = _emocionBLL.Create(emocion);

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

                // Devolvemos un 200 OK para indicar que la actualización fue exitosa.
                // También se podría devolver un 204 NoContent.
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
        public IHttpActionResult Delete(int id)
        {
            try
            {
                var emocionExistente = _emocionBLL.GetById(id);
                if (emocionExistente == null)
                {
                    return NotFound();
                }

                _emocionBLL.Delete(id);
                return Ok(); // Devuelve un 200 OK.
            }
            catch (Exception ex)
            {
                // Si la BLL tuviera una regla como "no borrar emociones en uso",
                // la atraparíamos aquí.
                return BadRequest(ex.Message);
            }
        }
    }
}
