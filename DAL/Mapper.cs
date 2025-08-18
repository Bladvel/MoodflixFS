using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL
{
    public abstract class Mapper<T>
    {
        protected readonly string _connectionString = ConfigurationManager.ConnectionStrings["DefaultConnection"].ConnectionString;
        protected abstract T Transform(DataRow row);

        public abstract List<T> GetAll();

        public abstract T GetById(int id);
        public abstract int Create(T entity);
        public abstract void Update(T entity);
        public abstract void Delete(int id);
    }
}
