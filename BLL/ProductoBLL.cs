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
            
            if(_productoDAL.GetById(id) == null)
                throw new Exception($"No se encontró ningún producto con ID {id}.");

            _productoDAL.Delete(id);
        }
    }
}
