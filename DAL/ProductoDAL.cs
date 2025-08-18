using BE;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL
{
    public class ProductoDAL : Mapper<Producto>
    {

        protected override Producto Transform(DataRow row)
        {

            if (row["Tipo"] == DBNull.Value)
            {
                throw new Exception("El tipo de producto no puede ser nulo en la base de datos.");
            }

            string tipo = row["Tipo"].ToString();
            Producto producto;

            if (tipo == "Libro")
            {
                producto = new Libro
                {
                    Autor = row["Autor"].ToString(),
                    Editorial = row["Editorial"].ToString(),
                    ISBN = row["ISBN"].ToString()
                };
            }
            else if (tipo == "Pelicula")
            {
                producto = new Pelicula
                {
                    Director = row["Director"].ToString(),
                    Productora = row["Productora"].ToString(),
                    AnioLanzamiento = Convert.ToInt32(row["AnioLanzamiento"])
                };
            }
            else
            {
                throw new Exception($"Tipo de producto desconocido: {tipo}");
            }

            producto.Id = Convert.ToInt32(row["Id"]);
            producto.Nombre = row["Nombre"].ToString();
            producto.Descripcion = row["Descripcion"].ToString();
            producto.Precio = Convert.ToDecimal(row["Precio"]);
            producto.Stock = Convert.ToInt32(row["Stock"]);
            producto.UrlImagen = row["UrlImagen"].ToString();

            return producto;
        }

        public override List<Producto> GetAll()
        {
            var productos = new List<Producto>();
            using (var con = new SqlConnection(_connectionString))
            {
                var da = new SqlDataAdapter("sp_ListarProductos", con);
                da.SelectCommand.CommandType = CommandType.StoredProcedure;
                var dt = new DataTable();
                da.Fill(dt);

                foreach (DataRow row in dt.Rows)
                {
                    productos.Add(Transform(row));
                }
            }
            return productos;
        }

        public override Producto GetById(int id)
        {
            using (var con = new SqlConnection(_connectionString))
            {
                var da = new SqlDataAdapter("sp_ObtenerProductoPorId", con);
                da.SelectCommand.CommandType = CommandType.StoredProcedure;
                da.SelectCommand.Parameters.AddWithValue("@Id", id);
                var dt = new DataTable();
                da.Fill(dt);

                if (dt.Rows.Count == 1)
                {
                    return Transform(dt.Rows[0]);
                }
            }
            return null;
        }

        public override int Create(Producto entity)
        {
            if (entity is Libro libro)
            {
                return CreateLibro(libro);
            }
            if (entity is Pelicula pelicula)
            {
                return CreatePelicula(pelicula);
            }
            throw new ArgumentException("El tipo de producto para crear no es válido.");
        }


        private int CreateLibro(Libro libro)
        {
            using (var con = new SqlConnection(_connectionString))
            {
                var cmd = new SqlCommand("sp_CrearLibro", con);
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@Nombre", libro.Nombre);
                cmd.Parameters.AddWithValue("@Descripcion", libro.Descripcion);
                cmd.Parameters.AddWithValue("@Precio", libro.Precio);
                cmd.Parameters.AddWithValue("@Stock", libro.Stock);
                cmd.Parameters.AddWithValue("@UrlImagen", libro.UrlImagen);

                cmd.Parameters.AddWithValue("@Autor", libro.Autor);
                cmd.Parameters.AddWithValue("@Editorial", libro.Editorial);
                cmd.Parameters.AddWithValue("@ISBN", libro.ISBN);

                con.Open();
                return Convert.ToInt32(cmd.ExecuteScalar());
            }
        }

        private int CreatePelicula(Pelicula pelicula)
        {
            using (var con = new SqlConnection(_connectionString))
            {
                var cmd = new SqlCommand("sp_CrearPelicula", con);
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@Nombre", pelicula.Nombre);
                cmd.Parameters.AddWithValue("@Descripcion", pelicula.Descripcion);
                cmd.Parameters.AddWithValue("@Precio", pelicula.Precio);
                cmd.Parameters.AddWithValue("@Stock", pelicula.Stock);
                cmd.Parameters.AddWithValue("@UrlImagen", pelicula.UrlImagen);

                cmd.Parameters.AddWithValue("@Director", pelicula.Director);
                cmd.Parameters.AddWithValue("@Productora", pelicula.Productora);
                cmd.Parameters.AddWithValue("@AnioLanzamiento", pelicula.AnioLanzamiento);

                con.Open();
                return Convert.ToInt32(cmd.ExecuteScalar());
            }
        }


        public override void Update(Producto entity)
        {
            if (entity is Libro libro)
            {
                UpdateLibro(libro);
            }
            else if (entity is Pelicula pelicula)
            {
                UpdatePelicula(pelicula);
            }
            else
            {
                throw new ArgumentException("El tipo de producto para actualizar no es válido.");
            }
        }

        private void UpdateLibro(Libro libro)
        {
            using (var con = new SqlConnection(_connectionString))
            {
                var cmd = new SqlCommand("sp_ActualizarLibro", con);
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@Id", libro.Id);
                cmd.Parameters.AddWithValue("@Nombre", libro.Nombre);
                cmd.Parameters.AddWithValue("@Descripcion", libro.Descripcion);
                cmd.Parameters.AddWithValue("@Precio", libro.Precio);
                cmd.Parameters.AddWithValue("@Stock", libro.Stock);
                cmd.Parameters.AddWithValue("@UrlImagen", libro.UrlImagen);
                cmd.Parameters.AddWithValue("@Autor", libro.Autor);
                cmd.Parameters.AddWithValue("@Editorial", libro.Editorial);
                cmd.Parameters.AddWithValue("@ISBN", libro.ISBN);

                con.Open();
                cmd.ExecuteNonQuery();
            }
        }

        private void UpdatePelicula(Pelicula pelicula)
        {
            using (var con = new SqlConnection(_connectionString))
            {
                var cmd = new SqlCommand("sp_ActualizarPelicula", con);
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@Id", pelicula.Id);
                cmd.Parameters.AddWithValue("@Nombre", pelicula.Nombre);
                cmd.Parameters.AddWithValue("@Descripcion", pelicula.Descripcion);
                cmd.Parameters.AddWithValue("@Precio", pelicula.Precio);
                cmd.Parameters.AddWithValue("@Stock", pelicula.Stock);
                cmd.Parameters.AddWithValue("@UrlImagen", pelicula.UrlImagen);
                cmd.Parameters.AddWithValue("@Director", pelicula.Director);
                cmd.Parameters.AddWithValue("@Productora", pelicula.Productora);
                cmd.Parameters.AddWithValue("@AnioLanzamiento", pelicula.AnioLanzamiento);

                con.Open();
                cmd.ExecuteNonQuery();
            }
        }

        public override void Delete(int id)
        {
            using (var con = new SqlConnection(_connectionString))
            {
                var cmd = new SqlCommand("sp_BorrarProducto", con);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@Id", id);

                con.Open();
                cmd.ExecuteNonQuery();
            }
        }
    }
}
