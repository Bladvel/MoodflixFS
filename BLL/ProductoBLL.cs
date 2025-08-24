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
    public class ProductoBLL
    {
        private readonly ProductoDAL _productoDAL = new ProductoDAL();

        public List<Producto> GetAll()
        {
            return _productoDAL.GetAll();
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

            try
            {
                int newId = _productoDAL.Create(producto);
                producto.Id = newId;
                return producto;
            }
            catch (SqlException ex)
            {
                //2627 unique key exception
                if (ex.Number == 2627 && producto is Libro libro)
                {
                    throw new Exception($"El libro con el ISBN '{libro.ISBN}' ya existe.");
                }

                throw;
            }
        }

        public void Update(Producto producto)
        {
            if (producto == null)
                throw new ArgumentNullException(nameof(producto), "El producto no puede ser nulo.");
            if (producto.Id <= 0)
                throw new Exception("El ID del producto para actualizar no es válido.");

            try
            {
                _productoDAL.Update(producto);
            }
            catch (SqlException ex)
            {
                if (ex.Number == 2627 && producto is Libro libro)
                {
                    throw new Exception($"Ya existe otro libro con el ISBN '{libro.ISBN}'.");
                }
                throw;
            }
        }


        public void Delete(int id)
        {
            if (id <= 0)
            {
                throw new Exception("El ID proporcionado para eliminar no es válido.");
            }

            _productoDAL.Delete(id);
        }
    }
}
