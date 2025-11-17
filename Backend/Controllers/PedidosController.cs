using Backend.Infrastructure;
using BE;
using BLL;
using Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Web;
using System.Web.Http;
using System.Web.Routing;

namespace Backend.Controllers
{
    [RoutePrefix("api/pedidos")]
    public class PedidosController : ApiController
    {
        private readonly PedidoBLL _pedidoBLL = new PedidoBLL();

        /// <summary>
        /// GET: api/pedidos
        /// Obtiene los pedidos del usuario autenticado
        /// </summary>
        [HttpGet]
        [Route("")]
        [CustomAuthorize]
        public IHttpActionResult GetMisPedidos()
        {
            try
            {
                var user = TokenService.GetUserData(RequestContext.Principal as ClaimsPrincipal);
                var pedidos = _pedidoBLL.ListarPorUsuario(user.Id);
                return Ok(pedidos);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        /// <summary>
        /// GET: api/pedidos/5
        /// Obtiene un pedido específico por ID
        /// </summary>
        [HttpGet]
        [Route("{id:int}")]
        [CustomAuthorize]
        public IHttpActionResult GetById(int id)
        {
            try
            {
                var pedido = _pedidoBLL.ObtenerPorId(id);

                if (pedido == null)
                    return NotFound();

                var user = TokenService.GetUserData(RequestContext.Principal as ClaimsPrincipal);
                if (pedido.UsuarioId != user.Id)
                    return Unauthorized();

                return Ok(pedido);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        /// <summary>
        /// POST: api/pedidos
        /// Crea un nuevo pedido
        /// </summary>
        [HttpPost]
        [Route("")]
        [CustomAuthorize]
        public IHttpActionResult Create([FromBody] CrearPedidoRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var user = TokenService.GetUserData(RequestContext.Principal as ClaimsPrincipal);
                request.UsuarioId = user.Id;

                var pedido = _pedidoBLL.CrearPedido(request);

                BitacoraBLL.Instance.Registrar(new BE.Bitacora
                {
                    Modulo = BE.Types.TipoModulo.Pedidos,
                    Operacion = BE.Types.TipoOperacion.Alta,
                    Criticidad = 2,
                    Usuario = user,
                    Mensaje = $"Usuario {user.NombreUsuario} creó el pedido Id: {pedido.Id}, Total: ${pedido.Total}",
                });

                return Ok(new { Success = true, Message = "Pedido creado exitosamente", PedidoId = pedido.Id });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        /// <summary>
        /// PUT: api/pedidos/5/estado
        /// Actualiza el estado de un pedido (solo Admin)
        /// </summary>
        [HttpPut]
        [Route("{id:int}/estado")]
        [CustomAuthorize]
        public IHttpActionResult ActualizarEstado(int id, [FromBody] ActualizarEstadoRequest request)
        {
            try
            {
                var user = TokenService.GetUserData(RequestContext.Principal as ClaimsPrincipal);


                _pedidoBLL.ActualizarEstado(id, request.NuevoEstado);

                BitacoraBLL.Instance.Registrar(new BE.Bitacora
                {
                    Modulo = BE.Types.TipoModulo.Pedidos,
                    Operacion = BE.Types.TipoOperacion.Actualizacion,
                    Criticidad = 2,
                    Usuario = user,
                    Mensaje = $"Usuario {user.NombreUsuario} cambió el estado del pedido {id} a {request.NuevoEstado}",
                });

                return Ok(new { Success = true, Message = "Estado actualizado correctamente" });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        /// <summary>
        /// GET: api/pedidos/todos
        /// Obtiene TODOS los pedidos (solo Admin)
        /// </summary>
        [HttpGet]
        [Route("todos")]
        [CustomAuthorize]
        public IHttpActionResult GetTodosPedidos()
        {
            try
            {
                var user = TokenService.GetUserData(RequestContext.Principal as ClaimsPrincipal);

                var pedidos = _pedidoBLL.ListarTodos();
                return Ok(pedidos);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }


    }
}