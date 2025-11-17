using Backend.Infrastructure;
using BE;
using BE.Types;
using BLL;
using System;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Http;

namespace Backend.Controllers
{
    /// <summary>
    /// Endpoints para la gestión de la integridad de la base de datos (DV).
    /// Solo accesible por Webmasters.
    /// </summary>
    [RoutePrefix("api/integridad")]
    [CustomAuthorize(Roles = "GESTIONAR_DV")] 
    public class IntegridadController : ApiController
    {
        /// <summary>
        /// Inicia un proceso en segundo plano para recalcular TODOS los DVH y DVV.
        /// La API responde de inmediato.
        /// </summary>
        [HttpPost]
        [Route("recalcular")]
        public IHttpActionResult RecalcularTodaLaBase()
        {
            Task.Run(() =>
            {
                try
                {

                    BitacoraBLL.Instance.Registrar(new Bitacora
                    {
                        Fecha = DateTime.Now,
                        Operacion = TipoOperacion.IntegridadDatos,
                        Modulo = TipoModulo.Sistema,
                        Criticidad = 5,
                        Mensaje = "Inicio de recálculo total de DVs."
                    });

                    var dvBLL_background = new DVBLL();
                    dvBLL_background.RecalcularTodaLaBaseDeDatos();


                    BitacoraBLL.Instance.Registrar(new Bitacora
                    {
                        Fecha = DateTime.Now,
                        Operacion = TipoOperacion.IntegridadDatos,
                        Modulo = TipoModulo.Sistema,
                        Criticidad = 5,
                        Mensaje = "Recálculo total de DVs completado exitosamente."
                    });
                }
                catch (Exception ex)
                {
                    BitacoraBLL.Instance.Registrar(new Bitacora
                    {
                        Fecha = DateTime.Now,
                        Operacion = TipoOperacion.IntegridadDatos,
                        Modulo = TipoModulo.Sistema,
                        Criticidad = 5,
                        Mensaje = $"FALLA CRÍTICA en recálculo total de DVs: {ex.Message}"
                    });
                }
            });

            return Ok(new { message = "Proceso de recálculo de DVs iniciado en segundo plano. Revise la bitácora para ver el estado." });
        }

    }
}