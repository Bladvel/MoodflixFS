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

            BitacoraBLL.Instance.Registrar(new Bitacora
            {
                Modulo = TipoModulo.Productos,
                Operacion = TipoOperacion.Alta,
                Criticidad = 2,
                Mensaje = $"Se creo un Producto nuevo: {producto.Nombre}, {producto.Id}"

            });

            return producto;
            

        }

        public void Update(Producto producto)
        {
            if (producto == null)
                throw new ArgumentNullException(nameof(producto), "El producto no puede ser nulo.");
            if (producto.Id <= 0)
                throw new Exception("El ID del producto para actualizar no es válido.");

            _productoDAL.Update(producto);

            BitacoraBLL.Instance.Registrar(new Bitacora
            {
                Modulo = TipoModulo.Productos,
                Operacion = TipoOperacion.Actualizacion,
                Criticidad = 3,
                Mensaje = $"Se creo un Producto nuevo: {producto.Nombre}, {producto.Id}"

            });

        }


        public void Delete(int id)
        {
            if (id <= 0)
                throw new Exception("El ID proporcionado para eliminar no es válido.");

            var producto = _productoDAL.GetById(id);
               
            if(producto == null)
                throw new Exception($"No se encontró ningún producto con ID {id}.");

            _productoDAL.Delete(id);

            BitacoraBLL.Instance.Registrar(new Bitacora
            {
                Modulo = TipoModulo.Productos,
                Operacion = TipoOperacion.Baja,
                Criticidad = 4,
                Mensaje = $"Se elimino el Producto nuevo: {producto.Nombre}, {producto.Id}"

            });
        }
    }
}
