using BE;
using DAL;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL
{
    public class PermisoBLL
    {
        private readonly PermisoDAL _permisoDAL = new PermisoDAL();

        public List<BE.Permiso> GetAll()
        {
            return _permisoDAL.GetAll();
        }

        public Permiso GetPermisoById(int id)
        {
            if (id <= 0)
                throw new Exception("El ID del permiso no es válido.");
            return _permisoDAL.GetById(id);
        }


        //public Permiso Create(Permiso permiso)
        //{
        //    if (permiso == null)
        //        throw new ArgumentNullException(nameof(permiso), "El permiso no puede ser nulo.");
        //    if (string.IsNullOrWhiteSpace(permiso.Nombre))
        //        throw new Exception("El nombre del permiso no puede ser vacío.");

        //    if (permiso is Familia familia)
        //    {
        //        foreach (var hijo in familia.Hijos)
        //        {
        //            if (familia.Id != 0 && hijo.Id != 0 && _permisoDAL.EsAncestro(hijo.Id, familia.Id))
        //            {
        //                throw new Exception($"Referencia circular detectada: La familia '{permiso.Nombre}' ya es parte de la jerarquía de '{hijo.Nombre}'.");
        //            }
        //        }

        //    }

        //    try
        //    {
        //        int newId = _permisoDAL.Create(permiso);
        //        permiso.Id = newId;
        //        return permiso;
        //    }
        //    catch (SqlException ex)
        //    {
        //        //2627 unique key exception
        //        if (ex.Number == 2627)
        //        {
        //            throw new Exception($"El permiso con el nombre '{permiso.Nombre}' ya existe.");
        //        }
        //        throw;
        //    }
        //}

        public Permiso Create(Permiso permiso)
        {
            if (permiso == null)
                throw new ArgumentNullException(nameof(permiso), "El permiso no puede ser nulo.");
            if (string.IsNullOrWhiteSpace(permiso.Nombre))
                throw new Exception("El nombre del permiso no puede ser vacío.");

            
            ValidarJerarquia(permiso, new HashSet<int>());

            try
            {
                int newId = _permisoDAL.Create(permiso);
                permiso.Id = newId;
                return permiso;
            }
            catch (SqlException ex)
            {
                if (ex.Number == 2627)
                {
                    throw new Exception($"El permiso con el nombre '{permiso.Nombre}' ya existe.");
                }
                throw;
            }
        }

        /// <summary>
        /// Método recursivo para validar la integridad de toda la jerarquía de un permiso.
        /// </summary>
        /// <param name="permisoActual">El nodo del árbol que se está validando.</param>
        /// <param name="ancestros">La lista de padres por encima del nodo actual.</param>
        private void ValidarJerarquia(Permiso permisoActual, HashSet<int> rutaActual)
        {
            // Solo nos preocupan los permisos que ya tienen un ID,
            // ya que los nuevos (ID=0) no pueden formar ciclos preexistentes.
            if (permisoActual.Id != 0)
            {
                // VALIDACIÓN 1: Ciclo interno.
                // ¿Ya hemos pasado por este permiso en este mismo camino?
                if (rutaActual.Contains(permisoActual.Id))
                {
                    throw new Exception($"Referencia circular detectada: El permiso '{permisoActual.Nombre}' está anidado dentro de sí mismo.");
                }

                // Dejamos una "miga de pan" para marcar que hemos pasado por aquí.
                rutaActual.Add(permisoActual.Id);
            }

            if (permisoActual is Familia familia)
            {
                foreach (var hijo in familia.Hijos)
                {
                    // VALIDACIÓN 2: Ciclo contra la Base de Datos.
                    // ¿El hijo que queremos agregar ya es un "abuelo" de la familia actual?
                    if (familia.Id != 0 && hijo.Id != 0 && _permisoDAL.EsAncestro(hijo.Id, familia.Id))
                    {
                        throw new Exception($"Referencia circular detectada: La familia '{familia.Nombre}' ya es parte de la jerarquía de '{hijo.Nombre}'.");
                    }

                    // Llamada recursiva: bajamos un nivel para inspeccionar al hijo.
                    // Le pasamos la misma bolsa de migas.
                    ValidarJerarquia(hijo, rutaActual);
                }
            }

            // BACKTRACKING: Ya terminamos de revisar este permiso y todos sus descendientes.
            // Recogemos nuestra "miga de pan" para no confundir la validación de otras ramas del árbol.
            if (permisoActual.Id != 0)
            {
                rutaActual.Remove(permisoActual.Id);
            }
        }



        public void Update(Permiso permiso)
        {
            if (permiso == null)
                throw new ArgumentNullException(nameof(permiso), "El permiso no puede ser nulo.");
            if (permiso.Id <= 0)
                throw new Exception("El ID del permiso para actualizar no es válido.");

            ValidarJerarquia(permiso, new HashSet<int>());
            try
            {
                _permisoDAL.Update(permiso);
            }
            catch (SqlException ex)
            {
                //2627 unique key exception
                if (ex.Number == 2627)
                {
                    throw new Exception($"El permiso con el nombre '{permiso.Nombre}' ya existe.");
                }
                throw;
            }
        }

        public void GuardarPermisosDeUsuario(Usuario usuario)
        {
            if (usuario == null)
                throw new ArgumentNullException(nameof(usuario), "El usuario no puede ser nulo.");
            try
            {
                if (usuario.Id <= 0)
                    throw new Exception("El ID del usuario para asignar permisos no es válido.");

                _permisoDAL.GuardarPermisosDeUsuario(usuario);
            }
            catch (Exception ex)
            {
                throw new Exception("Error al validar el usuario.", ex);
            }
        }

        public void Delete(int id)
        {
            if (id <= 0)
                throw new Exception("El ID del permiso para eliminar no es válido.");

            _permisoDAL.Delete(id);
        }

        [Obsolete]
        private bool TieneReferenciaCircular(Familia familia, HashSet<int> ancestros)
        {
           throw new NotImplementedException();
        }

        
    }
}
