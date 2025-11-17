using Backend.Infrastructure;
using BLL;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;

namespace Backend.Controllers
{
    [RoutePrefix("api/idiomas")]
    public class IdiomasController : ApiController
    {
        private readonly IdiomaBLL _idiomaBLL = IdiomaBLL.Instance;

        /// <summary>
        /// Obtener lista de idiomas activos
        /// GET: api/idiomas
        /// </summary>
        [HttpGet]
        [Route("")]
        [AllowAnonymous]
        public IHttpActionResult GetIdiomas()
        {
            try
            {
                var idiomas = _idiomaBLL.ObtenerIdiomasActivos();

                return Ok(new
                {
                    Success = true,
                    Data = idiomas
                });
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }

        /// <summary>
        /// Obtener traducciones por ID de idioma
        /// GET: api/idiomas/traducciones/1
        /// </summary>
        [HttpGet]
        [Route("traducciones/{idiomaId:int}")]
        [AllowAnonymous]
        public IHttpActionResult GetTraduccionesPorId(int idiomaId)
        {
            try
            {
                var traducciones = _idiomaBLL.ObtenerTraduccionesPorIdiomaId(idiomaId);

                if (traducciones == null || traducciones.Traducciones == null)
                {
                    return NotFound();
                }

                return Ok(new
                {
                    Success = true,
                    Data = traducciones
                });
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }

        /// <summary>
        /// Obtener traducciones por código de idioma
        /// GET: api/idiomas/traducciones/codigo/es
        /// </summary>
        [HttpGet]
        [Route("traducciones/codigo/{codigoIdioma}")]
        [AllowAnonymous]
        public IHttpActionResult GetTraduccionesPorCodigo(string codigoIdioma)
        {
            try
            {
                var traducciones = _idiomaBLL.ObtenerTraduccionesPorCodigo(codigoIdioma);

                if (traducciones == null || traducciones.Traducciones == null)
                {
                    return NotFound();
                }

                return Ok(new
                {
                    Success = true,
                    Data = traducciones
                });
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }

        /// <summary>
        /// Limpiar cache de traducciones
        /// POST: api/idiomas/limpiar-cache
        /// </summary>
        [HttpPost]
        [Route("limpiar-cache")]
        [CustomAuthorize(Permissions = "ADMINISTRADOR,WEBMASTER")]
        public IHttpActionResult LimpiarCache()
        {
            try
            {
                _idiomaBLL.LimpiarCache();

                return Ok(new
                {
                    Success = true,
                    Message = "Cache de traducciones limpiado exitosamente"
                });
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }
    }
}