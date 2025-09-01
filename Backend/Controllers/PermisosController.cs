using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Formatting;
using System.Web.Http;
using System.Web.UI.WebControls;
using BE;
using BLL;
using Newtonsoft.Json.Linq;

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
            if (id <= 0)
            { 
                return BadRequest("El ID proporcionado no es válido.");
            }

            var permiso = _permisoBLL.GetPermisoById(id);
            if (permiso == null)
            {
                
                return Content(HttpStatusCode.NotFound, new { Message = $"Permiso con ID {id} no fue encontrado." });
            }
            return Ok(permiso);
        }


        /// <summary>
        /// POST: api/permisos
        /// Crea un nuevo permiso.
        /// </summary>
        [HttpPost]
        [Route("")]
        public IHttpActionResult Create([FromBody] JObject jsonPermiso)
        {
            if (jsonPermiso == null)
            {
                return BadRequest("El cuerpo de la solicitud no puede ser nulo.");
            }

            try
            {
                var createdPermiso = _permisoBLL.Create(DeserializarPermiso(jsonPermiso));
                return CreatedAtRoute("GetPermisoById", new { id = createdPermiso.Id }, createdPermiso);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        /// <summary>
        /// PUT: api/permisos/5
        /// Actualiza un permiso existente.
        /// </summary>
        [HttpPut]
        [Route("{id:int}")]
        public IHttpActionResult Update(int id, [FromBody] JObject jsonPermiso)
        {
            if (jsonPermiso == null)
            {
                return BadRequest("El cuerpo de la solicitud no puede ser nulo.");
            }

            if(id <= 0)
            {
                return BadRequest("El ID proporcionado no es válido.");
            }

            

            try
            {
                Permiso permisoTraido = DeserializarPermiso(jsonPermiso);
                if (id != permisoTraido.Id)
                {
                    return BadRequest("El ID en la URL no coincide con el ID en el cuerpo de la solicitud.");
                }

                var permisoExistente = _permisoBLL.GetPermisoById(id);
                if (permisoExistente == null)
                {
                    return Content(HttpStatusCode.NotFound, new { Message = $"Permiso con ID {id} no fue encontrado." });
                }

                _permisoBLL.Update(permisoTraido);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        /// <summary>
        /// DELETE: api/permisos/5
        /// Elimina un permiso.
        /// </summary>
        [HttpDelete]
        [Route("{id:int}")]
        public IHttpActionResult Delete(int id)
        {
            if (id <= 0)
            {
                return BadRequest("El ID proporcionado no es válido.");
            }

            try
            {
                var permisoExistente = _permisoBLL.GetPermisoById(id);
                if (permisoExistente == null)
                {
                    return Content(HttpStatusCode.NotFound, new { Message = $"Permiso con ID {id} no fue encontrado." });
                }
                _permisoBLL.Delete(id);
                return Ok(new { Message = $"Permiso con ID {id} ha sido eliminado." });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        private Permiso DeserializarPermiso(JObject json)
        {
            if(json["EsFamilia"] == null)
            {
                throw new Exception("El campo 'EsFamilia' es obligatorio para determinar el tipo de permiso.");
            }

            Permiso permiso = null;

            if ((bool)json["EsFamilia"])
            {
                if (json["Hijos"] == null)
                {
                    throw new Exception("El campo 'Hijos' es obligatorio para las familias.");
                }
                var familia = new Familia();
                familia.Id = json["Id"]?.Value<int>() ?? 0;
                familia.Nombre = json["Nombre"]?.Value<string>();

                foreach (var hijoJson in json["Hijos"])
                {
                    familia.Hijos.Add(DeserializarPermiso((JObject)hijoJson));
                }
                return familia;
            }
            permiso = json.ToObject<Patente>();

            return permiso;
        }

    }
}
