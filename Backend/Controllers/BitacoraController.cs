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
                return Ok(eventos);
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }
    }
}
