using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using BE;
using BLL;

namespace Backend.Controllers
{
    /// <summary>
    /// Expone las operaciones CRUD para la entidad Pelicula a través de una API RESTful.
    /// </summary>
    [RoutePrefix("api/peliculas")]
    public class PeliculasController : ApiController
    {
        private readonly ProductoBLL _productoBLL = new ProductoBLL();
        /// <summary>
        /// POST: api/peliculas
        /// Crea un nuevo producto de tipo Pelicula.
        /// </summary>
        [HttpPost]
        [Route("")]
        public IHttpActionResult Create([FromBody] Pelicula pelicula)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                var peliculaCreada = _productoBLL.Create(pelicula);
                return CreatedAtRoute("GetProductoById", new { id = peliculaCreada.Id }, peliculaCreada);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        /// <summary>
        /// PUT: api/peliculas/5
        /// Actualiza un producto de tipo Pelicula.
        /// </summary>
        [HttpPut]
        [Route("{id:int}")]
        public IHttpActionResult Update(int id, [FromBody] Pelicula pelicula)
        {
            if (!ModelState.IsValid || id != pelicula.Id)
            {
                return BadRequest();
            }
            var productoExistente = _productoBLL.GetById(id);
            if (productoExistente == null) return NotFound();
            if (!(productoExistente is Pelicula)) return BadRequest("El producto con este ID no es una película.");
            try
            {
                _productoBLL.Update(pelicula);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
