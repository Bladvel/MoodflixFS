using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using BLL;
using BE;
using System.Runtime.InteropServices.WindowsRuntime;

namespace Backend.Controllers
{
    /// <summary>
    /// Expone las operaciones CRUD para la entidad Libro a través de una API RESTful.
    /// </summary>
    [RoutePrefix("api/libros")]
    public class LibrosController : ApiController
    {
        private readonly ProductoBLL _productoBLL = new ProductoBLL();

        /// <summary>
        /// POST: api/libros
        /// Crea un nuevo producto de tipo Libro.
        /// </summary>
        [HttpPost]
        [Route("")]
        public IHttpActionResult Create([FromBody] Libro libro)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var libroCreado = _productoBLL.Create(libro);

                return CreatedAtRoute("GetProductoById", new { id = libroCreado.Id }, libroCreado);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        /// <summary>
        /// PUT: api/libros/5
        /// Actualiza un producto de tipo Libro.
        /// </summary>
        [HttpPut]
        [Route("{id:int}")]
        public IHttpActionResult Update(int id, [FromBody] Libro libro)
        {
            if (!ModelState.IsValid || id != libro.Id)
            {
                return BadRequest();
            }

            var productoExistente = _productoBLL.GetById(id);
            if (productoExistente == null) return NotFound();
            if (!(productoExistente is Libro)) return BadRequest("El producto con este ID no es un libro.");

            try
            {
                _productoBLL.Update(libro);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
