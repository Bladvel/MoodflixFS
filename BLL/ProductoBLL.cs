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
    public class ProductoBLL
    {
        private readonly ProductoDAL _productoDAL = new ProductoDAL();

        public List<Producto> GetAll()
        {
            return _productoDAL.GetAll();
        }

        public List<Libro> GetAllLibros()
        {
            return _productoDAL.GetAllLibros();
        }

        public List<Pelicula> GetAllPeliculas()
        {
            return _productoDAL.GetAllPeliculas();
        }


        public Producto GetById(int id)
        {
            if (id <= 0)
                throw new Exception("El ID proporcionado no es válido.");
            return _productoDAL.GetById(id);
        }


        public Producto Create(Producto producto)
        {
            if (producto == null)
                throw new ArgumentNullException(nameof(producto), "El producto no puede ser nulo.");

            int newId = _productoDAL.Create(producto);
            producto.Id = newId;


            return producto;
            

        }

        public void Update(Producto producto)
        {
            if (producto == null)
                throw new ArgumentNullException(nameof(producto), "El producto no puede ser nulo.");
            if (producto.Id <= 0)
                throw new Exception("El ID del producto para actualizar no es válido.");

            _productoDAL.Update(producto);


        }


        public void Delete(int id)
        {
            if (id <= 0)
                throw new Exception("El ID proporcionado para eliminar no es válido.");

            var producto = _productoDAL.GetById(id);
               
            if(producto == null)
                throw new Exception($"No se encontró ningún producto con ID {id}.");

            _productoDAL.Delete(id);

        }

        /// <summary>
        /// Reemplaza todo el catálogo de productos con los productos importados.
        /// ADVERTENCIA: Esta operación elimina todos los productos existentes.
        /// </summary>
        /// <param name="productosNuevos">Lista de productos a importar</param>
        public void ReemplazarCatalogo(List<Producto> productosNuevos)
        {
            try
            {

                var productosExistentes = GetAll();

                foreach (var producto in productosExistentes)
                {
                    Delete(producto.Id);
                }

                foreach (var producto in productosNuevos)
                {
                    producto.Id = 0;

                    Create(producto);
                }
            }
            catch (Exception ex)
            {
                throw new Exception("Error al reemplazar el catálogo de productos.", ex);
            }
        }


    }
}
