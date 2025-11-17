using Backend.Infrastructure;
using BE;
using BE.Types;
using BLL;
using Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Services.Description;

namespace Backend.Controllers
{

    /// <summary>
    /// Expone las operaciones CRUD para la entidad Producto a través de una API RESTful.
    /// </summary>
    [RoutePrefix("api/productos")]
    public class ProductosController : ApiController
    {
        private readonly ProductoBLL _productoBLL = new ProductoBLL();

        /// <summary>
        /// GET: api/productos
        /// Obtiene una lista de todos los productos (libros y películas).
        /// </summary>
        [HttpGet]
        [Route("")]
        public IHttpActionResult GetAll()
        {
            var productos = _productoBLL.GetAll();
            return Ok(productos);
        }

        /// <summary>
        /// GET: api/productos/5
        /// Obtiene un producto específico (libro o película) por su ID.
        /// </summary>
        [HttpGet]
        [Route("{id:int}", Name = "GetProductoById")]
        public IHttpActionResult GetById(int id)
        {
            var producto = _productoBLL.GetById(id);
            if (producto == null)
            {
                return Content(HttpStatusCode.NotFound, new { Message = $"Producto con ID {id} no fue encontrado." });
            }
            return Ok(producto);
        }


        /// <summary>
        /// DELETE: api/productos/5
        /// Elimina un producto (libro o película).
        /// </summary>
        [HttpDelete]
        [Route("{id:int}")]
        [CustomAuthorize]
        public IHttpActionResult Delete(int id)
        {
            var productoExistente = _productoBLL.GetById(id);
            try
            {
                if (productoExistente == null)
                {
                    return Content(HttpStatusCode.NotFound, new { Message = $"Producto con ID {id} no fue encontrado." });
                }
                _productoBLL.Delete(id);

                var user = TokenService.GetUserData(RequestContext.Principal as ClaimsPrincipal);

                Task.Run(() =>
                {
                    try
                    {
                        var dvBLL_background = new DVBLL();
                        var prodBLL_background = new ProductoBLL();

                        if (productoExistente is BE.Libro)
                        {
                            dvBLL_background.BorrarDVH("Libros", id);
                            var todosLosLibros = prodBLL_background.GetAllLibros();
                            dvBLL_background.RecalcularDVV("Libros", todosLosLibros.Cast<object>().ToList());
                        } else if (productoExistente is BE.Pelicula)
                        {

                            dvBLL_background.BorrarDVH("Peliculas", id);

                            var todasLasPeliculas = prodBLL_background.GetAllPeliculas();
                            dvBLL_background.RecalcularDVV("Peliculas", todasLasPeliculas.Cast<object>().ToList());


                        } 
                    }
                    catch (Exception ex)
                    {
                        BitacoraBLL.Instance.Registrar( new Bitacora
                        {
                            Usuario= null,
                            Operacion= TipoOperacion.IntegridadDatos,
                            Modulo= TipoModulo.Productos,
                            Mensaje= $"Fallo DV background (BorrarProducto Id: {id}): {ex.Message}",
                            Criticidad= 2
                        });
                    }
                });


                BitacoraBLL.Instance.Registrar(new BE.Bitacora
                {
                    Modulo = BE.Types.TipoModulo.Productos,
                    Operacion = BE.Types.TipoOperacion.Baja,
                    Criticidad = 3,
                    Usuario = user,
                    Mensaje = $"Usuario {user.NombreUsuario} eliminó el producto: {productoExistente.Nombre}, Id: {productoExistente.Id}",
                });

                return Ok(new { Message = $"Producto con ID {id} ha sido eliminado." });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

    }
}
