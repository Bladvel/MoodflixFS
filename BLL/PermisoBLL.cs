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


        public Permiso Create(Permiso permiso)
        {
            if (permiso == null)
                throw new ArgumentNullException(nameof(permiso), "El permiso no puede ser nulo.");
            if (string.IsNullOrWhiteSpace(permiso.Nombre))
                throw new Exception("El nombre del permiso no puede ser vacío.");

            if (permiso is Familia familia)
            {
                if (TieneReferenciaCircular(familia, new HashSet<int>()))
                {
                    throw new Exception("La familia no puede contener referencias circulares.");
                }

            }

            try
            {
                int newId = _permisoDAL.Create(permiso);
                permiso.Id = newId;
                return permiso;
            }
            catch (Exception ex)
            {
                //2627 unique key exception
                if (ex is SqlException sqlEx && sqlEx.Number == 2627)
                {
                    throw new Exception($"El permiso con el nombre '{permiso.Nombre}' ya existe.");
                }
                throw;
            }
        }

        public void Update(Permiso permiso)
        {
            if (permiso == null)
                throw new ArgumentNullException(nameof(permiso), "El permiso no puede ser nulo.");
            if (permiso.Id <= 0)
                throw new Exception("El ID del permiso para actualizar no es válido.");
            if (permiso is Familia familia)
            {
                if (TieneReferenciaCircular(familia, new HashSet<int>()))
                {
                    throw new Exception("La familia no puede contener referencias circulares.");
                }
            }
            try
            {
                _permisoDAL.Update(permiso);
            }
            catch (Exception ex)
            {
                //2627 unique key exception
                if (ex is SqlException sqlEx && sqlEx.Number == 2627)
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

        private bool TieneReferenciaCircular(Familia familia, HashSet<int> ancestros)
        {
            if (ancestros.Contains(familia.Id))
            {
                return true;
            }

            if (familia.Hijos == null || familia.Hijos.Count == 0)
            {
                return false;
            }

            if (familia.Id > 0)
            {
                ancestros.Add(familia.Id);
            }


            foreach (var hijo in familia.Hijos)
            {
                if (hijo is Familia hijoFamilia)
                {
                    if (TieneReferenciaCircular(hijoFamilia, new HashSet<int>(ancestros)))
                    {
                        return true;
                    }
                }
            }

            return false;
        }
    }
}
