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
    public class EmocionBLL
    {
        private readonly EmocionDAL _emocionDAL = new EmocionDAL();


        public List<Emocion> GetAll()
        {
            return _emocionDAL.GetAll();
        }


        public Emocion GetById(int id)
        {
            if (id <= 0)
                throw new Exception("El ID proporcionado no es válido.");
            return _emocionDAL.GetById(id);
        }


        public Emocion Create(Emocion emocion)
        {
            if (emocion == null)
                throw new ArgumentNullException(nameof(emocion), "La emoción no puede ser nula.");
            if (string.IsNullOrWhiteSpace(emocion.Nombre))
                throw new Exception("El nombre de la emoción es un campo requerido.");

            int newId = _emocionDAL.Create(emocion);
            emocion.Id = newId;
            return emocion;

        }

        public void Update(Emocion emocion)
        {
            if (emocion == null)
                throw new ArgumentNullException(nameof(emocion), "La emoción no puede ser nula.");
            if (emocion.Id <= 0)
                throw new Exception("El ID de la emoción para actualizar no es válido.");

            _emocionDAL.Update(emocion);
            

        }


        public void Delete(int id)
        {
            if (id <= 0)
                throw new Exception("El ID proporcionado para eliminar no es válido.");

            if(_emocionDAL.GetById(id) == null)
                throw new Exception($"No se encontró ninguna emoción con ID {id}.");

            _emocionDAL.Delete(id);
        }
    }
}
