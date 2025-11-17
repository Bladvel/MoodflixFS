using System;
using System.Collections.Generic;
using System.Reflection;
using System.Text;
using System.Linq;
using DAL;
using BE;
using Services;


namespace BLL
{
    public class DVBLL
    {
        private readonly DVDAL dvDAL = new DVDAL();

        public string CalcularDVH(object entidad)
        {
            if (entidad == null) return "";

            Type tipo = entidad.GetType();
            PropertyInfo[] propiedades = tipo.GetProperties().OrderBy(p => p.Name).ToArray();

            StringBuilder sb = new StringBuilder();

            foreach (PropertyInfo prop in propiedades)
            {
                if (prop.Name.Equals("DVH", StringComparison.OrdinalIgnoreCase))
                    continue;

                if (prop.PropertyType.IsGenericType &&
                    (prop.PropertyType.GetGenericTypeDefinition() == typeof(List<>) ||
                     prop.PropertyType.GetGenericTypeDefinition() == typeof(ICollection<>)))
                    continue;

                object valor = prop.GetValue(entidad);
                sb.Append(valor?.ToString() ?? "");
            }

            return CryptoManager.HashPassword(sb.ToString());
        }

        public void ActualizarDVH(string tabla, int id, object entidad)
        {
            string nuevoDVH = CalcularDVH(entidad);
            dvDAL.ActualizarDVH(tabla, id, nuevoDVH);
        }


        public void RecalcularDVV(string tabla, List<object> entidades)
        {
            if (!entidades.Any()) return;

            Type tipo = entidades.First().GetType();
            PropertyInfo[] propiedades = tipo.GetProperties().OrderBy(p => p.Name).ToArray();

            foreach (PropertyInfo prop in propiedades)
            {
                if (prop.Name.Equals("DVH", StringComparison.OrdinalIgnoreCase))
                    continue;
                if (prop.PropertyType.IsGenericType &&
                    (prop.PropertyType.GetGenericTypeDefinition() == typeof(List<>) ||
                     prop.PropertyType.GetGenericTypeDefinition() == typeof(ICollection<>)))
                    continue;

                StringBuilder sb = new StringBuilder();

                foreach (object entidad in entidades)
                {
                    object valor = prop.GetValue(entidad);
                    sb.Append(valor?.ToString() ?? "");
                }

                string nuevoDVV = CryptoManager.HashPassword(sb.ToString());
                dvDAL.ActualizarDVV(tabla, prop.Name, nuevoDVV);
            }
        }


        public ResultadoIntegridad VerificarIntegridad()
        {
            var resultado = new ResultadoIntegridad();

            try
            {
                VerificarDVH(resultado);
                VerificarDVV(resultado);
            }
            catch (Exception ex)
            {
                resultado.EsValido = false;
                resultado.Errores.Add($"Error crítico durante la verificación: {ex.Message}");
            }

            return resultado;
        }

        ///// <summary>
        ///// Verifica la integridad de todos los DVH (horizontales) en la base de datos.
        ///// </summary>
        //private void VerificarDVH(ResultadoIntegridad resultado)
        //{
        //    // --- 1. Productos (Libros y Peliculas) ---
        //    var productoBLL = new ProductoBLL();

        //    //TODO: Realizar metodo para buscar solo libros
        //    List<Libro> libros = productoBLL.GetAllLibros();
        //    foreach (var libro in libros)
        //    {
        //        string dvhCalculado = CalcularDVH(libro);
        //        DVHEntity dvhGuardado = dvDAL.ObtenerDVH("Libros", libro.Id);
        //        if (dvhGuardado == null || dvhCalculado != dvhGuardado.DVH)
        //        {
        //            resultado.EsValido = false;
        //            resultado.Errores.Add($"Error DVH en Tabla: Libros, Registro ID: {libro.Id}.");
        //        }
        //    }

        //    //TODO: Realizar metodo para buscar solo peliculas
        //    List<Pelicula> peliculas = productoBLL.GetAllPeliculas();
        //    foreach (var pelicula in peliculas)
        //    {
        //        string dvhCalculado = CalcularDVH(pelicula);
        //        DVHEntity dvhGuardado = dvDAL.ObtenerDVH("Peliculas", pelicula.Id);
        //        if (dvhGuardado == null || dvhCalculado != dvhGuardado.DVH)
        //        {
        //            resultado.EsValido = false;
        //            resultado.Errores.Add($"Error DVH en Tabla: Peliculas, Registro ID: {pelicula.Id}.");
        //        }
        //    }

        //    // --- 2. Usuarios ---
        //    var usuarioBLL = new UsuarioBLL();
        //    List<Usuario> usuarios = usuarioBLL.GetAll();
        //    foreach (var usuario in usuarios)
        //    {
        //        string dvhCalculado = CalcularDVH(usuario);
        //        DVHEntity dvhGuardado = dvDAL.ObtenerDVH("Usuario", usuario.Id);
        //        if (dvhGuardado == null || dvhCalculado != dvhGuardado.DVH)
        //        {
        //            resultado.EsValido = false;
        //            resultado.Errores.Add($"Error DVH en Tabla: Usuario, Registro ID: {usuario.Id}.");
        //        }
        //    }

        //    // --- 3. Emociones ---
        //    var emocionBLL = new EmocionBLL();
        //    List<Emocion> emociones = emocionBLL.GetAll();
        //    foreach (var emocion in emociones)
        //    {
        //        string dvhCalculado = CalcularDVH(emocion);
        //        DVHEntity dvhGuardado = dvDAL.ObtenerDVH("Emocion", emocion.Id);
        //        if (dvhGuardado == null || dvhCalculado != dvhGuardado.DVH)
        //        {
        //            resultado.EsValido = false;
        //            resultado.Errores.Add($"Error DVH en Tabla: Emocion, Registro ID: {emocion.Id}.");
        //        }
        //    }

        //    // --- 4. Pedidos ---
        //    var pedidoBLL = new PedidoBLL();
        //    List<Pedido> pedidos = pedidoBLL.ListarTodos();
        //    foreach (var pedido in pedidos)
        //    {
        //        string dvhCalculado = CalcularDVH(pedido);
        //        DVHEntity dvhGuardado = dvDAL.ObtenerDVH("Pedido", pedido.Id);
        //        if (dvhGuardado == null || dvhCalculado != dvhGuardado.DVH)
        //        {
        //            resultado.EsValido = false;
        //            resultado.Errores.Add($"Error DVH en Tabla: Pedido, Registro ID: {pedido.Id}.");
        //        }
        //    }



        //    // --- 6. Permisos ---
        //    var permisoBLL = new PermisoBLL();
        //    List<Permiso> permisos = permisoBLL.GetAll();
        //    foreach (var permiso in permisos)
        //    {
        //        string dvhCalculado = CalcularDVH(permiso);
        //        DVHEntity dvhGuardado = dvDAL.ObtenerDVH("Permiso", permiso.Id);
        //        if (dvhGuardado == null || dvhCalculado != dvhGuardado.DVH)
        //        {
        //            resultado.EsValido = false;
        //            resultado.Errores.Add($"Error DVH en Tabla: Permiso, Registro ID: {permiso.Id}.");
        //        }
        //    }


        //}

        /// <summary>
        /// Método "helper" genérico para verificar el DVH de cualquier tabla.
        /// Comprueba tanto registros modificados como registros eliminados.
        /// </summary>
        private void VerificarDVH_ParaTabla(
            string tabla,
            List<object> entidades,
            List<DVHEntity> dvhsGuardados,
            Func<object, int> getId,
            ResultadoIntegridad resultado)
        {
            var idsEntidadesExistentes = new HashSet<int>(entidades.Select(e => getId(e)));
            var dictDvhsGuardados = dvhsGuardados.ToDictionary(dvh => dvh.RegistroId);

            // --- CHECK 1: Registros editados o corruptos ---
            foreach (var entidad in entidades)
            {
                int id = getId(entidad);
                string dvhCalculado = CalcularDVH(entidad);

                if (!dictDvhsGuardados.TryGetValue(id, out DVHEntity dvhGuardado))
                {
                    resultado.EsValido = false;
                    resultado.Errores.Add($"Error DVH en Tabla: {tabla}, Registro ID: {id}. (Falta DVH)");
                }
                else if (dvhCalculado != dvhGuardado.DVH)
                {
                    resultado.EsValido = false;
                    resultado.Errores.Add($"Error DVH en Tabla: {tabla}, Registro ID: {id}. (Registro modificado)");
                }
            }

            // --- CHECK 2: Registros borrados ---
            foreach (var dvhGuardado in dvhsGuardados)
            {
                if (!idsEntidadesExistentes.Contains(dvhGuardado.RegistroId))
                {
                    resultado.EsValido = false;
                    resultado.Errores.Add($"Error DVH en Tabla: {tabla}, Registro ID: {dvhGuardado.RegistroId}. (Registro eliminado)");
                }
            }
        }


        /// <summary>
        /// Verifica la integridad de todos los DVH (horizontales) en la base de datos.
        /// Esta es la versión corregida que detecta ediciones Y borrados.
        /// </summary>
        private void VerificarDVH(ResultadoIntegridad resultado)
        {
            // --- 1. Productos (Libros y Peliculas) ---
            var productoBLL = new ProductoBLL();

            // Verificamos Libros
            List<Libro> libros = productoBLL.GetAllLibros();
            List<DVHEntity> dvhsLibros = dvDAL.ObtenerTodosLosDVH("Libros");
            VerificarDVH_ParaTabla("Libros", libros.Cast<object>().ToList(), dvhsLibros,
                (e) => ((Libro)e).Id, // Función para obtener el ID
                resultado);

            // Verificamos Peliculas
            List<Pelicula> peliculas = productoBLL.GetAllPeliculas();
            List<DVHEntity> dvhsPeliculas = dvDAL.ObtenerTodosLosDVH("Peliculas");
            VerificarDVH_ParaTabla("Peliculas", peliculas.Cast<object>().ToList(), dvhsPeliculas,
                (e) => ((Pelicula)e).Id,
                resultado);

            // --- 2. Usuarios ---
            var usuarioBLL = new UsuarioBLL();
            List<Usuario> usuarios = usuarioBLL.GetAll();
            List<DVHEntity> dvhsUsuarios = dvDAL.ObtenerTodosLosDVH("Usuario");
            VerificarDVH_ParaTabla("Usuario", usuarios.Cast<object>().ToList(), dvhsUsuarios,
                (e) => ((Usuario)e).Id,
                resultado);

            // --- 3. Emociones ---
            var emocionBLL = new EmocionBLL();
            List<Emocion> emociones = emocionBLL.GetAll();
            List<DVHEntity> dvhsEmociones = dvDAL.ObtenerTodosLosDVH("Emocion");
            VerificarDVH_ParaTabla("Emocion", emociones.Cast<object>().ToList(), dvhsEmociones,
                (e) => ((Emocion)e).Id,
                resultado);

            // --- 4. Pedidos ---
            var pedidoBLL = new PedidoBLL();
            List<Pedido> pedidos = pedidoBLL.ListarTodos();
            List<DVHEntity> dvhsPedidos = dvDAL.ObtenerTodosLosDVH("Pedido");
            VerificarDVH_ParaTabla("Pedido", pedidos.Cast<object>().ToList(), dvhsPedidos,
                (e) => ((Pedido)e).Id,
                resultado);


            // --- 6. Permisos ---
            var permisoBLL = new PermisoBLL();
            List<Permiso> permisos = permisoBLL.GetAll();
            List<DVHEntity> dvhsPermisos = dvDAL.ObtenerTodosLosDVH("Permiso");
            VerificarDVH_ParaTabla("Permiso", permisos.Cast<object>().ToList(), dvhsPermisos,
                (e) => ((Permiso)e).Id,
                resultado);


        }



        /// <summary>
        /// Verifica la integridad de todos los DVV (verticales) en la base de datos.
        /// </summary>
        private void VerificarDVV(ResultadoIntegridad resultado)
        {
            // --- 1. Productos (Libros y Peliculas) ---
            var productoBLL = new ProductoBLL();

            List<Libro> libros = productoBLL.GetAllLibros();
            VerificarColumnasDVV("Libros", libros.Cast<object>().ToList(), resultado);

            List<Pelicula> peliculas = productoBLL.GetAllPeliculas();
            VerificarColumnasDVV("Peliculas", peliculas.Cast<object>().ToList(), resultado);

            // --- 2. Usuarios ---
            var usuarioBLL = new UsuarioBLL();
            List<Usuario> usuarios = usuarioBLL.GetAll();
            VerificarColumnasDVV("Usuario", usuarios.Cast<object>().ToList(), resultado);

            // --- 3. Emociones ---
            var emocionBLL = new EmocionBLL();
            List<Emocion> emociones = emocionBLL.GetAll();
            VerificarColumnasDVV("Emocion", emociones.Cast<object>().ToList(), resultado);

            // --- 4. Pedidos ---
            var pedidoBLL = new PedidoBLL();
            List<Pedido> pedidos = pedidoBLL.ListarTodos();
            VerificarColumnasDVV("Pedido", pedidos.Cast<object>().ToList(), resultado);

            // --- 6. Permisos ---
            var permisoBLL = new PermisoBLL();
            List<Permiso> permisos = permisoBLL.GetAll();
            VerificarColumnasDVV("Permiso", permisos.Cast<object>().ToList(), resultado);


        }

        private void VerificarColumnasDVV(string tabla, List<object> entidades, ResultadoIntegridad resultado)
        {
            if (!entidades.Any()) return;

            Type tipo = entidades.First().GetType();
            PropertyInfo[] propiedades = tipo.GetProperties().OrderBy(p => p.Name).ToArray();

            foreach (PropertyInfo prop in propiedades)
            {
                if (prop.Name.Equals("DVH", StringComparison.OrdinalIgnoreCase)) continue;
                if (prop.PropertyType.IsGenericType &&
                    (prop.PropertyType.GetGenericTypeDefinition() == typeof(List<>) ||
                     prop.PropertyType.GetGenericTypeDefinition() == typeof(ICollection<>))) continue;

                StringBuilder sb = new StringBuilder();
                foreach (var entidad in entidades)
                {
                    object valor = prop.GetValue(entidad);
                    sb.Append(valor?.ToString() ?? "");
                }


                string dvvCalculado = CryptoManager.HashPassword(sb.ToString());

                DVVEntity dvvGuardado = dvDAL.ObtenerDVV(tabla, prop.Name);

                if (dvvGuardado == null || dvvCalculado != dvvGuardado.DVV)
                {
                    resultado.EsValido = false;
                    resultado.Errores.Add($"Error DVV en Tabla: {tabla}, Columna: {prop.Name}.");
                }
            }
        }


        /// <summary>
        /// Recalcula TODOS los DVH y DVV de la base de datos.
        /// </summary>
        public void RecalcularTodaLaBaseDeDatos()
        {
            // --- 1. Productos (Libros y Peliculas) ---
            var productoBLL = new ProductoBLL();

            var libros = productoBLL.GetAllLibros();
            foreach (var libro in libros)
            {
                ActualizarDVH("Libros", libro.Id, libro);
            }
            RecalcularDVV("Libros", libros.Cast<object>().ToList());

            var peliculas = productoBLL.GetAllPeliculas();
            foreach (var pelicula in peliculas)
            {
                ActualizarDVH("Peliculas", pelicula.Id, pelicula);
            }
            RecalcularDVV("Peliculas", peliculas.Cast<object>().ToList());


            // --- 2. Usuarios ---
            var usuarioBLL = new UsuarioBLL();
            var usuarios = usuarioBLL.GetAll();
            foreach (var usuario in usuarios)
            {
                ActualizarDVH("Usuario", usuario.Id, usuario);
            }
            RecalcularDVV("Usuario", usuarios.Cast<object>().ToList());


            // --- 3. Emociones ---
            var emocionBLL = new EmocionBLL();
            var emociones = emocionBLL.GetAll();
            foreach (var emocion in emociones)
            {
                ActualizarDVH("Emocion", emocion.Id, emocion);
            }
            RecalcularDVV("Emocion", emociones.Cast<object>().ToList());


            // --- 4. Pedidos ---
            var pedidoBLL = new PedidoBLL();
            var pedidos = pedidoBLL.ListarTodos();
            foreach (var pedido in pedidos)
            {
                ActualizarDVH("Pedido", pedido.Id, pedido);
            }
            RecalcularDVV("Pedido", pedidos.Cast<object>().ToList());


            // --- 6. Permisos ---
            var permisoBLL = new PermisoBLL();
            var permisos = permisoBLL.GetAll();
            foreach (var permiso in permisos)
            {
                ActualizarDVH("Permiso", permiso.Id, permiso);
            }
            RecalcularDVV("Permiso", permisos.Cast<object>().ToList());


        }

        public void BorrarDVH(string tabla, int id)
        {
            dvDAL.BorrarDVH(tabla, id);
        }
    }
}