using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Formatting;
using System.Web.Http;
using BE;
using BLL;

namespace Backend.Controllers
{

    /// <summary>
    /// Expone las operaciones CRUD para la entidad Permiso a través de una API RESTful.
    /// </summary>
    [RoutePrefix("api/permisos")]
    public class PermisosController : ApiController
    {
        private readonly PermisoBLL _permisoBLL = new PermisoBLL();

        /// <summary>
        /// GET: api/permisos
        /// Obtiene una lista de todos los permisos.
        /// </summary>
        [HttpGet]
        [Route("")]
        public IHttpActionResult GetAll()
        {
            return Ok(_permisoBLL.GetAll());
        }

        /// <summary>
        /// GET: api/permisos/5
        /// Obtiene un permiso por su ID.
        /// </summary>
        /// <param name="id"></param>
        [HttpGet]
        [Route("{id:int}", Name = "GetPermisoById")]
        public IHttpActionResult GetById(int id)
        {
            if(id <= 0)
            {
                return Content(HttpStatusCode.BadRequest, new { Message = "El ID proporcionado no es válido." });
            }

            var permiso = _permisoBLL.GetPermisoById(id);
            if (permiso == null)
            {
                return Content(HttpStatusCode.NotFound, new { Message = $"Permiso con ID {id} no fue encontrado." });
            }
            return Ok(permiso);
        }



        // POST: api/Permisos
        public void Post([FromBody]string value)
        {
        }

        // PUT: api/Permisos/5
        public void Put(int id, [FromBody]string value)
        {
        }

        // DELETE: api/Permisos/5
        public void Delete(int id)
        {
        }
    }
}
