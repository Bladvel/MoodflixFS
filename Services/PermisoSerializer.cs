using System;
using BE;
using Newtonsoft.Json.Linq;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services
{
    public class PermisoSerializer
    {
        public static Permiso Deserializar(JObject json)
        {
            if (json["EsFamilia"] == null)
            {
                throw new Exception("El campo 'EsFamilia' es obligatorio para determinar el tipo de permiso.");
            }

            if ((bool)json["EsFamilia"])
            {
                var familia = new Familia
                {
                    Id = json["Id"]?.Value<int>() ?? 0,
                    Nombre = json["Nombre"]?.Value<string>()
                };

                if (json["Hijos"] == null || json["Hijos"].Type != JTokenType.Array)
                {
                    throw new Exception("El campo 'Hijos' (incluso si está vacío) es obligatorio para las familias.");
                }

                foreach (var hijoJson in json["Hijos"])
                {
                    familia.Hijos.Add(Deserializar((JObject)hijoJson));
                }
                return familia;
            }
            else
            {
                return new Patente
                {
                    Id = json["Id"]?.Value<int>() ?? 0,
                    Nombre = json["Nombre"]?.Value<string>()
                };
            }
        }
    }
}
