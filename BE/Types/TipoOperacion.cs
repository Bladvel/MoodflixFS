using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BE.Types
{
    public enum TipoOperacion
    {
        Login,
        Logout,
        Desconocida,
        Alta,
        Actualizacion,
        Baja,
        GeneracionBackup,
        RestauracionBackup,
    }
}
