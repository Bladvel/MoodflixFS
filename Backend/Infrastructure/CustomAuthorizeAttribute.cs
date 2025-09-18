using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Security.Claims;
using System.Web;
using System.Web.Http;
using System.Web.Http.Controllers;

namespace Backend.Infrastructure
{
    public class CustomAuthorizeAttribute: AuthorizeAttribute
    {
        public string Permissions { get; set; }

        protected override bool IsAuthorized(HttpActionContext actionContext)
        {
            if(!base.IsAuthorized(actionContext))
            {
                return false;
            }

            if(!string.IsNullOrEmpty(Permissions))
            {
                var principal = actionContext.RequestContext.Principal as ClaimsPrincipal;

                var requiredPermissions = Permissions.Split(',').Select(p => p.Trim()).ToList();

                bool hasPermission = requiredPermissions
                    .Any(p => principal != null && principal.HasClaim(ClaimTypes.Role, p));

                if (!hasPermission)
                {
                    actionContext.Response = actionContext.Request.CreateResponse(HttpStatusCode.Forbidden,
                        new { Message = $"Acceso denegado. Se requiere al menos uno de los siguientes permisos: {Permissions}" });
                    return false;
                }
            }

            return true;
        }
    }
}