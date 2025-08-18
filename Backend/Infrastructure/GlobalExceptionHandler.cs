using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http.ExceptionHandling;
using System.Web.Http.Results;

namespace Backend.Infrastructure
{
    public class GlobalExceptionHandler: ExceptionHandler
    {
        public override void Handle(ExceptionHandlerContext context)
        {

            System.Diagnostics.Debug.WriteLine($"ERROR: {context.Exception}");
          
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