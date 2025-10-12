using BE;
using BE.Types;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http.ExceptionHandling;
using System.Web.Http.Results;
using BLL;

namespace Backend.Infrastructure
{
    public class GlobalExceptionHandler: ExceptionHandler
    {
        public override void Handle(ExceptionHandlerContext context)
        {

            System.Diagnostics.Debug.WriteLine($"ERROR: {context.Exception}");

            BitacoraBLL.Instance.Registrar(new Bitacora
            {
                Modulo = TipoModulo.Desconocido,
                Operacion = TipoOperacion.Desconocida,
                Criticidad = 5,
                Mensaje = $"Error no controlado: {context.Exception.Message} | StackTrace: {context.Exception.StackTrace}"
            });

            var response = new
            {
                message = "Ha ocurrido un error inesperado en el servidor. Por favor, intente más tarde."
            };

            context.Result = new ResponseMessageResult(
                context.Request.CreateResponse(HttpStatusCode.InternalServerError, response)
            );
        }

        
        public override bool ShouldHandle(ExceptionHandlerContext context)
        {
            return true;
        }
    }
}