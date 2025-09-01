using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace BE
{
    public abstract class Permiso
    {
        [JsonProperty(Order=1)]
        public int Id { get; set; }

        [Required(ErrorMessage = "El nombre del permiso es requerido")]
        [StringLength(100)]
        [JsonProperty(Order = 2)]
        public string Nombre { get; set; }

        public override bool Equals(object obj)
        {
            if (obj == null || !(obj is Permiso))
            {
                return false;
            }

            if (this.Id == 0)
            {
                return object.ReferenceEquals(this, obj);
            }

            return this.Id == ((Permiso)obj).Id;
        }

        public override int GetHashCode()
        {
            if (this.Id == 0)
            {
                return base.GetHashCode();
            }

            return this.Id.GetHashCode();
        }
    }
}
