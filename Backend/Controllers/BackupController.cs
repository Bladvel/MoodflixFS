using Backend.Infrastructure;
using BLL;
using Services;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Web.Http;

namespace Backend.Controllers
{
    [RoutePrefix("api/backup")]
    [CustomAuthorize(Permissions ="GESTIONAR_BACKUP")]
    public class BackupController : ApiController
    {
        private readonly BackupBLL _backupBLL = new BackupBLL();

        /// <summary>
        /// GET: api/backup/generar
        /// Genera un backup y lo devuelve como descarga.
        /// </summary>
        [HttpGet]
        [Route("generar")]
        public HttpResponseMessage GenerarBackup()
        {

            try
            {
                // Usar la carpeta de backups de SQL Server donde ya tiene permisos
                string backupDirectory = @"C:\Backups";
                string nombreArchivo = $"Moodflix-Backup-{DateTime.Now:yyyy-MM-dd-HHmmss}.bak";
                string rutaCompleta = Path.Combine(backupDirectory, nombreArchivo);

                _backupBLL.GenerarBackup(rutaCompleta);

                var response = new HttpResponseMessage(HttpStatusCode.OK);
                response.Content = new PushStreamContent(async (outputStream, httpContent, transportContext) =>
                {
                    try
                    {
                        using (var fileStream = new FileStream(rutaCompleta, FileMode.Open, FileAccess.Read, FileShare.Read))
                        {
                            await fileStream.CopyToAsync(outputStream);
                        }
                    }
                    finally
                    {
                        outputStream.Close();
                        File.Delete(rutaCompleta);
                    }
                }, "application/octet-stream");

                response.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("attachment")
                {
                    FileName = nombreArchivo
                };

                var user = TokenService.GetUserData(RequestContext.Principal as ClaimsPrincipal);
                BitacoraBLL.Instance.Registrar(new BE.Bitacora
                {
                    Modulo = BE.Types.TipoModulo.Backup,
                    Operacion = BE.Types.TipoOperacion.GeneracionBackup,
                    Criticidad = 4,
                    Usuario = user,
                    Mensaje = $"Usuario {user.NombreUsuario} generó un backup.",
                });


                return response;
            }
            catch (Exception ex)
            {
                return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }


        /// <summary>
        /// POST: api/backup/restaurar
        /// Recibe un archivo .bak y restaura la base de datos.
        /// </summary>
        [HttpPost]
        [Route("restaurar")]
        public async Task<IHttpActionResult> RestaurarBackup()
        {

            if (!Request.Content.IsMimeMultipartContent())
            {
                return BadRequest("Petición inválida. Se espera un archivo (multipart/form-data).");
            }


            string tempPath = Path.GetTempPath();
            var provider = new MultipartFormDataStreamProvider(tempPath);

            try
            {

                await Request.Content.ReadAsMultipartAsync(provider);

                var fileContent = provider.Contents.FirstOrDefault(c => c.Headers.ContentDisposition.FileName != null);

                if (fileContent == null)
                {
                    return BadRequest("No se ha subido ningún archivo de backup.");
                }


                string rutaArchivoSubido = provider.FileData[0].LocalFileName;

                _backupBLL.RestaurarBackup(rutaArchivoSubido);

                var user = TokenService.GetUserData(RequestContext.Principal as ClaimsPrincipal);

                BitacoraBLL.Instance.Registrar(new BE.Bitacora
                {
                    Modulo = BE.Types.TipoModulo.Backup,
                    Operacion = BE.Types.TipoOperacion.RestauracionBackup,
                    Criticidad = 5,
                    Usuario = user,
                    Mensaje = $"Usuario {user.NombreUsuario} restauró un backup.",
                });

                File.Delete(rutaArchivoSubido);

                return Ok(new { Message = "La base de datos ha sido restaurada exitosamente." });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

    }
}
