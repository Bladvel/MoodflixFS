using Backend.Infrastructure;
using BLL;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace Backend.Controllers
{
    [RoutePrefix("api/Bitacora")]
    public class BitacoraController : ApiController
    {
        private readonly BitacoraBLL _bitacoraBLL = BitacoraBLL.Instance;


        /// <summary>
        /// GET: api/bitacora
        /// Obtiene una lista de los eventos de la bitácora, con filtros opcionales.
        /// Ejemplos de uso:
        ///  - /api/bitacora
        ///  - /api/bitacora?criticidad=3
        ///  - /api/bitacora?usuarioId=1&fechaDesde=2024-01-01
        /// </summary>
        [HttpGet]
        [Route("")]
        [CustomAuthorize(Permissions = "VER_BITACORA")]
        public IHttpActionResult Listar(
            [FromUri] int? usuarioId = null,
            [FromUri] int? criticidad = null,
            [FromUri] DateTime? fechaDesde = null,
            [FromUri] DateTime? fechaHasta = null)
        {
            try
            {

                var eventos = _bitacoraBLL.Listar(usuarioId, criticidad, fechaDesde, fechaHasta);

                var eventosDTO = new List<object>();

                foreach (var e in eventos)
                {
                    try
                    {
                        eventosDTO.Add(new
                        {
                            e.Id,
                            e.Fecha,
                            Usuario = e.Usuario != null ? new
                            {
                                e.Usuario.Id,
                                NombreUsuario = e.Usuario.NombreUsuario ?? "",
                                Email = e.Usuario.Email ?? ""
                            } : null,
                            Modulo = e.Modulo.ToString(),
                            Operacion = e.Operacion.ToString(),
                            e.Criticidad,
                            Mensaje = e.Mensaje ?? ""
                        });
                    }
                    catch (Exception exEvento)
                    {
                        System.Diagnostics.Debug.WriteLine($"Error procesando evento {e.Id}: {exEvento.Message}");
                        throw;
                    }
                }


                return Ok(eventosDTO);
            }
            catch (Exception ex)
            {

                System.Diagnostics.Debug.WriteLine("=== ERROR en Bitacora.Listar ===");
                System.Diagnostics.Debug.WriteLine($"Message: {ex.Message}");
                System.Diagnostics.Debug.WriteLine($"StackTrace: {ex.StackTrace}");
                if (ex.InnerException != null)
                {
                    System.Diagnostics.Debug.WriteLine($"InnerException: {ex.InnerException.Message}");
                    System.Diagnostics.Debug.WriteLine($"InnerException StackTrace: {ex.InnerException.StackTrace}");
                }

                return Content(HttpStatusCode.InternalServerError, new
                {
                    ex.Message,
                    ExceptionType = ex.GetType().Name,
                    InnerException = ex.InnerException?.Message,
                    ex.StackTrace
                });
            }
        }
    }
}

