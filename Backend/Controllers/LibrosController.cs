using System;
using System.Security.Claims;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using BLL;
using BE;
using Services;
using System.Runtime.InteropServices.WindowsRuntime;
using Backend.Infrastructure;

namespace Backend.Controllers
{
    /// <summary>
    /// Expone las operaciones CRUD para la entidad Libro a través de una API RESTful.
    /// </summary>
    [RoutePrefix("api/libros")]
    public class LibrosController : ApiController
    {
        private readonly ProductoBLL _productoBLL = new ProductoBLL();
        private readonly EmocionBLL _emocionBLL = new EmocionBLL();

        /// <summary>
        /// POST: api/libros
        /// Crea un nuevo producto de tipo Libro.
        /// </summary>
        [HttpPost]
        [Route("")]
        [CustomAuthorize]
        public IHttpActionResult Create([FromBody] LibroCreateDTO libroDTO)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {

                var libro = new Libro
                {
                    Nombre = libroDTO.Nombre,
                    Descripcion = libroDTO.Descripcion,
                    Precio = libroDTO.Precio,
                    Stock = libroDTO.Stock,
                    UrlImagen = libroDTO.UrlImagen,
                    Autor = libroDTO.Autor,
                    Editorial = libroDTO.Editorial,
                    ISBN = libroDTO.ISBN,
                    Emociones = new List<Emocion>()
                };


                if (libroDTO.EmocionesIds != null && libroDTO.EmocionesIds.Any())
                {
                    foreach (var emocionId in libroDTO.EmocionesIds)
                    {
                        var emocion = _emocionBLL.GetById(emocionId);
                        if (emocion != null)
                        {
                            libro.Emociones.Add(emocion);
                        }
                    }
                }
                var libroCreado = _productoBLL.Create(libro);

                var user = TokenService.GetUserData(RequestContext.Principal as ClaimsPrincipal);

                BitacoraBLL.Instance.Registrar(new BE.Bitacora
                {
                    Modulo = BE.Types.TipoModulo.Productos,
                    Operacion = BE.Types.TipoOperacion.Alta,
                    Criticidad = 2,
                    Usuario = user,
                    Mensaje = $"Usuario {user.NombreUsuario} creó el libro: {libroCreado.Nombre}, Id: {libroCreado.Id}",
                });

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
        [CustomAuthorize]
        public IHttpActionResult Update(int id, [FromBody] LibroUpdateDTO libroDTO)
        {
            if (!ModelState.IsValid || id != libroDTO.Id)
            {
                return BadRequest();
            }

            var productoExistente = _productoBLL.GetById(id);
            if (productoExistente == null) return NotFound();
            if (!(productoExistente is Libro)) return BadRequest("El producto con este ID no es un libro.");

            try
            {


                var libro = new Libro
                {
                    Id = libroDTO.Id,
                    Nombre = libroDTO.Nombre,
                    Descripcion = libroDTO.Descripcion,
                    Precio = libroDTO.Precio,
                    Stock = libroDTO.Stock,
                    UrlImagen = libroDTO.UrlImagen,
                    Autor = libroDTO.Autor,
                    Editorial = libroDTO.Editorial,
                    ISBN = libroDTO.ISBN,
                    Emociones = new List<Emocion>()
                };


                if (libroDTO.EmocionesIds != null && libroDTO.EmocionesIds.Any())
                {
                    foreach (var emocionId in libroDTO.EmocionesIds)
                    {
                        var emocion = _emocionBLL.GetById(emocionId);
                        if (emocion != null)
                        {
                            libro.Emociones.Add(emocion);
                        }
                    }
                }

                _productoBLL.Update(libro);

                var user = TokenService.GetUserData(RequestContext.Principal as ClaimsPrincipal);

                BitacoraBLL.Instance.Registrar(new BE.Bitacora
                {
                    Modulo = BE.Types.TipoModulo.Productos,
                    Operacion = BE.Types.TipoOperacion.Actualizacion,
                    Criticidad = 2,
                    Usuario = user,
                    Mensaje = $"Usuario {user.NombreUsuario} actualizó el libro: {libro.Nombre}, Id: {libro.Id}",
                });


                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
