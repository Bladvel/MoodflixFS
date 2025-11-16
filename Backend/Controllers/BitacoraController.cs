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
                System.Diagnostics.Debug.WriteLine("=== INICIO Bitacora.Listar ===");
                System.Diagnostics.Debug.WriteLine($"Parámetros: usuarioId={usuarioId}, criticidad={criticidad}");

                var eventos = _bitacoraBLL.Listar(usuarioId, criticidad, fechaDesde, fechaHasta);
                System.Diagnostics.Debug.WriteLine($"Eventos obtenidos: {eventos.Count}");

                // Convertir a DTO de forma más segura
                var eventosDTO = new List<object>();

                foreach (var e in eventos)
                {
                    try
                    {
                        eventosDTO.Add(new
                        {
                            Id = e.Id,
                            Fecha = e.Fecha,
                            Usuario = e.Usuario != null ? new
                            {
                                Id = e.Usuario.Id,
                                NombreUsuario = e.Usuario.NombreUsuario ?? "",
                                Email = e.Usuario.Email ?? ""
                            } : null,
                            Modulo = e.Modulo.ToString(),
                            Operacion = e.Operacion.ToString(),
                            Criticidad = e.Criticidad,
                            Mensaje = e.Mensaje ?? ""
                        });
                    }
                    catch (Exception exEvento)
                    {
                        System.Diagnostics.Debug.WriteLine($"Error procesando evento {e.Id}: {exEvento.Message}");
                        throw;
                    }
                }

                System.Diagnostics.Debug.WriteLine($"DTO creado con {eventosDTO.Count} eventos");
                System.Diagnostics.Debug.WriteLine("=== FIN Bitacora.Listar ===");

                return Ok(eventosDTO);
            }
            catch (Exception ex)
            {
                // Log detallado del error
                System.Diagnostics.Debug.WriteLine("=== ERROR en Bitacora.Listar ===");
                System.Diagnostics.Debug.WriteLine($"Message: {ex.Message}");
                System.Diagnostics.Debug.WriteLine($"StackTrace: {ex.StackTrace}");
                if (ex.InnerException != null)
                {
                    System.Diagnostics.Debug.WriteLine($"InnerException: {ex.InnerException.Message}");
                    System.Diagnostics.Debug.WriteLine($"InnerException StackTrace: {ex.InnerException.StackTrace}");
                }

                // Devolver error con más información
                return Content(HttpStatusCode.InternalServerError, new
                {
                    Message = ex.Message,
                    ExceptionType = ex.GetType().Name,
                    InnerException = ex.InnerException?.Message,
                    StackTrace = ex.StackTrace
                });
            }
        }
    }
}

