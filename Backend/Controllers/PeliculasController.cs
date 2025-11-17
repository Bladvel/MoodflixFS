using System;
using System.Security.Claims;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using BE;
using BLL;
using Backend.Infrastructure;
using Services;

namespace Backend.Controllers
{
    /// <summary>
    /// Expone las operaciones CRUD para la entidad Pelicula a través de una API RESTful.
    /// </summary>
    [RoutePrefix("api/peliculas")]
    public class PeliculasController : ApiController
    {
        private readonly ProductoBLL _productoBLL = new ProductoBLL();
        private readonly EmocionBLL _emocionBLL = new EmocionBLL();

        /// <summary>
        /// POST: api/peliculas
        /// Crea un nuevo producto de tipo Pelicula.
        /// </summary>
        [HttpPost]
        [Route("")]
        [CustomAuthorize]
        public IHttpActionResult Create([FromBody] PeliculaCreateDTO peliculaDTO)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {

                var pelicula = new Pelicula
                {
                    Nombre = peliculaDTO.Nombre,
                    Descripcion = peliculaDTO.Descripcion,
                    Precio = peliculaDTO.Precio,
                    Stock = peliculaDTO.Stock,
                    UrlImagen = peliculaDTO.UrlImagen,
                    Director = peliculaDTO.Director,
                    Productora = peliculaDTO.Productora,
                    AnioLanzamiento = peliculaDTO.AnioLanzamiento,
                    Emociones = new List<Emocion>()
                };


                if (peliculaDTO.EmocionesIds != null && peliculaDTO.EmocionesIds.Any())
                {
                    foreach (var emocionId in peliculaDTO.EmocionesIds)
                    {
                        var emocion = _emocionBLL.GetById(emocionId);
                        if (emocion != null)
                        {
                            pelicula.Emociones.Add(emocion);
                        }
                    }
                }

                var peliculaCreada = _productoBLL.Create(pelicula);

                var user = TokenService.GetUserData(RequestContext.Principal as ClaimsPrincipal);


                BitacoraBLL.Instance.Registrar(new BE.Bitacora
                {
                    Modulo = BE.Types.TipoModulo.Productos,
                    Operacion = BE.Types.TipoOperacion.Alta,
                    Criticidad = 2,
                    Usuario = user,
                    Mensaje = $"Usuario {user.NombreUsuario} creó la película: {peliculaCreada.Nombre}, Id: {peliculaCreada.Id}",
                });

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
        [CustomAuthorize]
        public IHttpActionResult Update(int id, [FromBody] PeliculaUpdateDTO peliculaDTO)
        {
            if (!ModelState.IsValid || id != peliculaDTO.Id)
            {
                return BadRequest();
            }
            var productoExistente = _productoBLL.GetById(id);
            if (productoExistente == null) return NotFound();
            if (!(productoExistente is Pelicula)) return BadRequest("El producto con este ID no es una película.");
            try
            {


                var pelicula = new Pelicula
                {
                    Id = peliculaDTO.Id,
                    Nombre = peliculaDTO.Nombre,
                    Descripcion = peliculaDTO.Descripcion,
                    Precio = peliculaDTO.Precio,
                    Stock = peliculaDTO.Stock,
                    UrlImagen = peliculaDTO.UrlImagen,
                    Director = peliculaDTO.Director,
                    Productora = peliculaDTO.Productora,
                    AnioLanzamiento = peliculaDTO.AnioLanzamiento,
                    Emociones = new List<Emocion>()
                };


                if (peliculaDTO.EmocionesIds != null && peliculaDTO.EmocionesIds.Any())
                {
                    foreach (var emocionId in peliculaDTO.EmocionesIds)
                    {
                        var emocion = _emocionBLL.GetById(emocionId);
                        if (emocion != null)
                        {
                            pelicula.Emociones.Add(emocion);
                        }
                    }
                }

                _productoBLL.Update(pelicula);

                var user = TokenService.GetUserData(RequestContext.Principal as ClaimsPrincipal);

                BitacoraBLL.Instance.Registrar(new BE.Bitacora
                {
                    Modulo = BE.Types.TipoModulo.Productos,
                    Operacion = BE.Types.TipoOperacion.Actualizacion,
                    Criticidad = 2,
                    Usuario = user,
                    Mensaje = $"Usuario {user.NombreUsuario} actualizó la película: {pelicula.Nombre}, Id: {pelicula.Id}",
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
