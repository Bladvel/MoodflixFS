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
            return _emocionDAL.GetById(id);
        }


        public Emocion Create(Emocion emocion)
        {
            if (emocion == null)
                throw new ArgumentNullException(nameof(emocion), "La emoción no puede ser nula.");
            if (string.IsNullOrWhiteSpace(emocion.Nombre))
                throw new Exception("El nombre de la emoción es un campo requerido.");


            try
            {
                int newId = _emocionDAL.Create(emocion);
                emocion.Id = newId;
                return emocion;
            }
            catch (SqlException ex)
            {
                //2627 unique key exception
                if (ex.Number == 2627)
                {
                    throw new Exception($"La emoción con el nombre '{emocion.Nombre}' ya existe.");
                }

                throw;
            }
        }

        public void Update(Emocion emocion)
        {
            if (emocion == null)
                throw new ArgumentNullException(nameof(emocion), "La emoción no puede ser nula.");
            if (emocion.Id <= 0)
                throw new Exception("El ID de la emoción para actualizar no es válido.");
            if (string.IsNullOrWhiteSpace(emocion.Nombre))
                throw new Exception("El nombre de la emoción es un campo requerido.");
            if (emocion.Nombre.Length > 100)
                throw new Exception("El nombre de la emoción no puede superar los 100 caracteres.");

            try
            {
                _emocionDAL.Update(emocion);
            }
            catch (SqlException ex)
            {
                if (ex.Number == 2627)
                {
                    throw new Exception($"Ya existe otra emoción con el nombre '{emocion.Nombre}'.");
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

            _emocionDAL.Delete(id);
        }
    }
}
