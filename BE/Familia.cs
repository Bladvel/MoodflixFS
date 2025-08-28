using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BE
{
    public class Familia : Permiso
    {
        [JsonProperty(Order =3)]
        public virtual ICollection<Permiso> Hijos { get; set; }

        public Familia()
        {
            Hijos = new HashSet<Permiso>();
        }
    }
}
