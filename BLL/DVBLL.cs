//using System;
//using System.Collections.Generic;
//using System.Reflection;
//using System.Text;
//using System.Linq;
//using DAL;
//using BE;
//using Services;


//namespace BLL
//{
//    public class DVBLL
//    {
//        private readonly DVDAL dvDAL = new DVDAL();

//        public string CalcularDVH(object entidad)
//        {
//            if (entidad == null) return "";

//            Type tipo = entidad.GetType();
//            PropertyInfo[] propiedades = tipo.GetProperties().OrderBy(p => p.Name).ToArray();

//            StringBuilder sb = new StringBuilder();

//            foreach (PropertyInfo prop in propiedades)
//            {
//                if (prop.Name.Equals("DVH", StringComparison.OrdinalIgnoreCase))
//                    continue;

//                if (prop.PropertyType.IsGenericType &&
//                    (prop.PropertyType.GetGenericTypeDefinition() == typeof(List<>) ||
//                     prop.PropertyType.GetGenericTypeDefinition() == typeof(ICollection<>)))
//                    continue;

//                object valor = prop.GetValue(entidad);
//                sb.Append(valor?.ToString() ?? "");
//            }

//            return CryptoManager.HashPassword(sb.ToString());
//        }

//        public void ActualizarDVH(string tabla, int id, object entidad)
//        {
//            string nuevoDVH = CalcularDVH(entidad);
//            dvDAL.ActualizarDVH(tabla, id, nuevoDVH);
//        }


//        public void RecalcularDVV(string tabla, List<object> entidades)
//        {
//            if (!entidades.Any()) return;

//            Type tipo = entidades.First().GetType();
//            PropertyInfo[] propiedades = tipo.GetProperties().OrderBy(p => p.Name).ToArray();

//            foreach (PropertyInfo prop in propiedades)
//            {
//                if (prop.Name.Equals("DVH", StringComparison.OrdinalIgnoreCase))
//                    continue;
//                if (prop.PropertyType.IsGenericType &&
//                    (prop.PropertyType.GetGenericTypeDefinition() == typeof(List<>) ||
//                     prop.PropertyType.GetGenericTypeDefinition() == typeof(ICollection<>)))
//                    continue;

//                StringBuilder sb = new StringBuilder();

//                foreach (object entidad in entidades)
//                {
//                    object valor = prop.GetValue(entidad);
//                    sb.Append(valor?.ToString() ?? "");
//                }

//                string nuevoDVV = CryptoManager.HashPassword(sb.ToString());
//                dvDAL.ActualizarDVV(tabla, prop.Name, nuevoDVV);
//            }
//        }



//        public ResultadoIntegridad VerificarIntegridad()
//        {
//            var resultado = new ResultadoIntegridad();

//            try
//            {
//                VerificarDVH(resultado);
//                VerificarDVV(resultado);
//            }
//            catch (Exception ex)
//            {
//                resultado.EsValido = false;
//                resultado.Errores.Add($"Error crítico durante la verificación: {ex.Message}");
//            }

//            return resultado;
//        }

//        /// <summary>
//        /// Verifica la integridad de todos los DVH (horizontales) en la base de datos.
//        /// </summary>
//        private void VerificarDVH(ResultadoIntegridad resultado)
//        {
//            // --- 1. Productos (Libros y Peliculas) ---
//            var productoBLL = new ProductoBLL();

//            // Verificamos Libros
//            List<Libro> libros = productoBLL.ListarLibros();
//            foreach (var libro in libros)
//            {
//                string dvhCalculado = CalcularDVH(libro);
//                DVHEntity dvhGuardado = dvDAL.ObtenerDVH("Libros", libro.Id);
//                if (dvhGuardado == null || dvhCalculado != dvhGuardado.DVH)
//                {
//                    resultado.EsValido = false;
//                    resultado.Errores.Add($"Error DVH en Tabla: Libros, Registro ID: {libro.Id}.");
//                }
//            }

//            // Verificamos Peliculas
//            List<Pelicula> peliculas = productoBLL.ListarPeliculas();
//            foreach (var pelicula in peliculas)
//            {
//                string dvhCalculado = CalcularDVH(pelicula);
//                DVHEntity dvhGuardado = dvDAL.ObtenerDVH("Peliculas", pelicula.Id);
//                if (dvhGuardado == null || dvhCalculado != dvhGuardado.DVH)
//                {
//                    resultado.EsValido = false;
//                    resultado.Errores.Add($"Error DVH en Tabla: Peliculas, Registro ID: {pelicula.Id}.");
//                }
//            }

//            // --- 2. Usuarios ---
//            var usuarioBLL = new UsuarioBLL();
//            List<Usuario> usuarios = usuarioBLL.Listar();
//            foreach (var usuario in usuarios)
//            {
//                string dvhCalculado = CalcularDVH(usuario);
//                DVHEntity dvhGuardado = dvDAL.ObtenerDVH("Usuario", usuario.Id);
//                if (dvhGuardado == null || dvhCalculado != dvhGuardado.DVH)
//                {
//                    resultado.EsValido = false;
//                    resultado.Errores.Add($"Error DVH en Tabla: Usuario, Registro ID: {usuario.Id}.");
//                }
//            }

//            // --- 3. Emociones ---
//            var emocionBLL = new EmocionBLL();
//            List<Emocion> emociones = emocionBLL.Listar(); // Asumo que Listar() llama a EmocionDAL.GetAll()
//            foreach (var emocion in emociones)
//            {
//                string dvhCalculado = CalcularDVH(emocion);
//                DVHEntity dvhGuardado = dvDAL.ObtenerDVH("Emocion", emocion.Id);
//                if (dvhGuardado == null || dvhCalculado != dvhGuardado.DVH)
//                {
//                    resultado.EsValido = false;
//                    resultado.Errores.Add($"Error DVH en Tabla: Emocion, Registro ID: {emocion.Id}.");
//                }
//            }

//            // --- 4. Pedidos ---
//            var pedidoBLL = new PedidoBLL();
//            List<Pedido> pedidos = pedidoBLL.Listar(); // Asumo que Listar() llama a PedidoDAL.GetAll()
//            foreach (var pedido in pedidos)
//            {
//                string dvhCalculado = CalcularDVH(pedido);
//                DVHEntity dvhGuardado = dvDAL.ObtenerDVH("Pedido", pedido.Id);
//                if (dvhGuardado == null || dvhCalculado != dvhGuardado.DVH)
//                {
//                    resultado.EsValido = false;
//                    resultado.Errores.Add($"Error DVH en Tabla: Pedido, Registro ID: {pedido.Id}.");
//                }
//            }

//            // --- 5. DetallePedido ---
//            // Asumo que PedidoBLL tiene un método que llama a PedidoDAL.GetAllDetalles()
//            List<DetallePedido> detalles = pedidoBLL.ListarTodosDetalles();
//            foreach (var detalle in detalles)
//            {
//                string dvhCalculado = CalcularDVH(detalle);
//                DVHEntity dvhGuardado = dvDAL.ObtenerDVH("DetallePedido", detalle.Id);
//                if (dvhGuardado == null || dvhCalculado != dvhGuardado.DVH)
//                {
//                    resultado.EsValido = false;
//                    resultado.Errores.Add($"Error DVH en Tabla: DetallePedido, Registro ID: {detalle.Id}.");
//                }
//            }

//            // --- 6. Permisos ---
//            var permisoBLL = new PermisoBLL();
//            List<Permiso> permisos = permisoBLL.GetAll(); // Tu PermisoBLL tiene un método GetAll()
//            foreach (var permiso in permisos)
//            {
//                string dvhCalculado = CalcularDVH(permiso);
//                DVHEntity dvhGuardado = dvDAL.ObtenerDVH("Permiso", permiso.Id);
//                if (dvhGuardado == null || dvhCalculado != dvhGuardado.DVH)
//                {
//                    resultado.EsValido = false;
//                    resultado.Errores.Add($"Error DVH en Tabla: Permiso, Registro ID: {permiso.Id}.");
//                }
//            }

//            // --- 7. Bitacora ---
//            var bitacoraBLL = new BitacoraBLL();
//            List<Bitacora> bitacoras = bitacoraBLL.Listar(); // Asumo que Listar() llama a BitacoraDAL.GetAll()
//            foreach (var bita in bitacoras)
//            {
//                string dvhCalculado = CalcularDVH(bita);
//                DVHEntity dvhGuardado = dvDAL.ObtenerDVH("Bitacora", bita.Id);
//                if (dvhGuardado == null || dvhCalculado != dvhGuardado.DVH)
//                {
//                    resultado.EsValido = false;
//                    resultado.Errores.Add($"Error DVH en Tabla: Bitacora, Registro ID: {bita.Id}.");
//                }
//            }

//            // NOTA: Omití 'Direccion' y las tablas de relación (Usuario_Permiso, etc.)
//            // porque no parecen tener BLLs dedicadas con un método `Listar()` 
//            // en los archivos del proyecto.
//        }

//        private void VerificarDVV(ResultadoIntegridad resultado)
//        {
//            var productoBLL = new ProductoBLL();
//            List<Libro> libros = productoBLL.ListarLibros();
//            VerificarColumnasDVV("Libros", libros.Cast<object>().ToList(), resultado);

//            List<Pelicula> peliculas = productoBLL.ListarPeliculas();
//            VerificarColumnasDVV("Peliculas", peliculas.Cast<object>().ToList(), resultado);

//            var usuarioBLL = new UsuarioBLL();
//            List<Usuario> usuarios = usuarioBLL.Listar();
//            VerificarColumnasDVV("Usuario", usuarios.Cast<object>().ToList(), resultado);

//            // ... Aquí deberías añadir la verificación para las otras tablas (Pedidos, Emocion, etc.) ...
//        }

//        private void VerificarColumnasDVV(string tabla, List<object> entidades, ResultadoIntegridad resultado)
//        {
//            if (!entidades.Any()) return;

//            Type tipo = entidades.First().GetType();
//            PropertyInfo[] propiedades = tipo.GetProperties().OrderBy(p => p.Name).ToArray();

//            foreach (PropertyInfo prop in propiedades)
//            {
//                if (prop.Name.Equals("DVH", StringComparison.OrdinalIgnoreCase)) continue;
//                if (prop.PropertyType.IsGenericType &&
//                    (prop.PropertyType.GetGenericTypeDefinition() == typeof(List<>) ||
//                     prop.PropertyType.GetGenericTypeDefinition() == typeof(ICollection<>))) continue;

//                StringBuilder sb = new StringBuilder();
//                foreach (var entidad in entidades)
//                {
//                    object valor = prop.GetValue(entidad);
//                    sb.Append(valor?.ToString() ?? "");
//                }


//                string dvvCalculado = CryptoManager.HashPassword(sb.ToString());

//                DVVEntity dvvGuardado = dvDAL.ObtenerDVV(tabla, prop.Name);

//                if (dvvGuardado == null || dvvCalculado != dvvGuardado.DVV)
//                {
//                    resultado.EsValido = false;
//                    resultado.Errores.Add($"Error DVV en Tabla: {tabla}, Columna: {prop.Name}.");
//                }
//            }
//        }
//    }
//}