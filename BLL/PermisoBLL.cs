using BE;
using BE.Types;
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


        public Permiso Create(Permiso permiso)
        {
            if (permiso == null)
                throw new ArgumentNullException(nameof(permiso), "El permiso no puede ser nulo.");
            if (string.IsNullOrWhiteSpace(permiso.Nombre))
                throw new Exception("El nombre del permiso no puede ser vacío.");

            if(permiso is Familia familia && (familia.Hijos != null && familia.Hijos.Count > 0))
            {
                
                ValidarJerarquia(familia, new HashSet<Permiso>());
            }

            
            int newId = _permisoDAL.Create(permiso);
            permiso.Id = newId;

            return permiso;
       
        }

        
        private void ValidarJerarquia(Permiso permisoActual, HashSet<Permiso> rutaActual)
        {

            if(rutaActual.Contains(permisoActual))
            {
                throw new Exception($"Referencia circular detectada: El permiso Id:'{permisoActual.Id}''{permisoActual.Nombre}' está anidado dentro de sí mismo.");
            }

            rutaActual.Add(permisoActual);


            if (permisoActual is Familia familia)
            {

                foreach (var hijo in familia.Hijos)
                {
                    //Caso base: una familia no puede ser hija de sí misma
                    if (hijo.Id == familia.Id)
                    {
                        throw new Exception($"Referencia circular detectada: La familia '{familia.Nombre}' no puede ser hija de sí misma.");
                    }

                    //Si el hijo es una familia ya guardada, verifico si la familia actual es ancestro de esa familia
                    if (hijo is Familia hijoComoFamilia)
                    {
                        //Si el hijo ya está guardado, verifico la jerarquía
                        if (hijoComoFamilia.Id != 0 && familia.Id != 0 && _permisoDAL.EsAncestro(hijoComoFamilia.Id, familia.Id))
                        {
                            // Si el hijoComoFamilia ya es ancestro de la familia a guardar, hay una referencia circular
                            throw new Exception($"Referencia circular detectada: La familia '{familia.Nombre}' ya es parte de la jerarquía de '{hijo.Nombre}'.");
                            
                        }

                        //Si el hijo no está guardado, hago la validación recursiva
                        
                        ValidarJerarquia(hijoComoFamilia, rutaActual);
                        
                    }

                }

            }

            rutaActual.Remove(permisoActual);
        }



        public void Update(Permiso permiso)
        {
            if (permiso == null)
                throw new ArgumentNullException(nameof(permiso), "El permiso no puede ser nulo.");
            if (permiso.Id <= 0)
                throw new Exception("El ID del permiso para actualizar no es válido.");

            if (permiso is Familia familia && (familia.Hijos != null && familia.Hijos.Count > 0))
            {

                ValidarJerarquia(familia, new HashSet<Permiso>());
            }
            
            _permisoDAL.Update(permiso);
 
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

            var permiso = _permisoDAL.GetById(id);

            if (permiso == null)
                throw new Exception("El permiso que se intenta eliminar no existe.");   

            _permisoDAL.Delete(id);

        }

        public bool TienePermiso(Usuario usuario, string nombrePermiso)
        {
            if (usuario == null)
                throw new ArgumentNullException(nameof(usuario), "El usuario no puede ser nulo.");
            if (string.IsNullOrWhiteSpace(nombrePermiso))
                throw new ArgumentException("El nombre del permiso no puede ser vacío.", nameof(nombrePermiso));

            if (usuario.Permisos == null || usuario.Permisos.Count == 0)
                return false;

            return TienePermisoRecursivo(usuario.Permisos, nombrePermiso);
        }

        private bool TienePermisoRecursivo(ICollection<Permiso> permisos, string nombrePermiso)
        {
            foreach (var permiso in permisos)
            {
                if (permiso.Nombre.Equals(nombrePermiso, StringComparison.OrdinalIgnoreCase))
                    return true;

                if (permiso is Familia familia && familia.Hijos != null && familia.Hijos.Count > 0)
                {
                    if (TienePermisoRecursivo(familia.Hijos, nombrePermiso))
                        return true;
                }
            }

            return false;
        }
    }
}
