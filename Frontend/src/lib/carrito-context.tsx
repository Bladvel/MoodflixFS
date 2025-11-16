import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Producto } from './types';

interface CarritoItem {
  producto: Producto;
  cantidad: number;
}

interface CarritoContextType {
  items: CarritoItem[];
  agregarProducto: (producto: Producto, cantidad?: number) => void;
  eliminarProducto: (productoId: number) => void;
  actualizarCantidad: (productoId: number, cantidad: number) => void;
  vaciarCarrito: () => void;
  totalItems: number;
  totalPrecio: number;
}

const CarritoContext = createContext<CarritoContextType | undefined>(undefined);

export function CarritoProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CarritoItem[]>([]);

  // Cargar carrito desde localStorage al iniciar
  useEffect(() => {
    const carritoGuardado = localStorage.getItem('moodflix_carrito');
    if (carritoGuardado) {
      try {
        setItems(JSON.parse(carritoGuardado));
      } catch (error) {
        console.error('Error al cargar carrito:', error);
      }
    }
  }, []);

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('moodflix_carrito', JSON.stringify(items));
  }, [items]);

  const agregarProducto = (producto: Producto, cantidad: number = 1) => {
    setItems((prevItems) => {
      const itemExistente = prevItems.find((item) => item.producto.Id === producto.Id);
      
      if (itemExistente) {
        // Si ya existe, aumentar cantidad
        return prevItems.map((item) =>
          item.producto.Id === producto.Id
            ? { ...item, cantidad: item.cantidad + cantidad }
            : item
        );
      } else {
        // Si no existe, agregar nuevo
        return [...prevItems, { producto, cantidad }];
      }
    });
  };

  const eliminarProducto = (productoId: number) => {
    setItems((prevItems) => prevItems.filter((item) => item.producto.Id !== productoId));
  };

  const actualizarCantidad = (productoId: number, cantidad: number) => {
    if (cantidad <= 0) {
      eliminarProducto(productoId);
      return;
    }
    
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.producto.Id === productoId ? { ...item, cantidad } : item
      )
    );
  };

  const vaciarCarrito = () => {
    setItems([]);
  };

  const totalItems = items.reduce((total, item) => total + item.cantidad, 0);
  const totalPrecio = items.reduce((total, item) => total + item.producto.Precio * item.cantidad, 0);

  return (
    <CarritoContext.Provider
      value={{
        items,
        agregarProducto,
        eliminarProducto,
        actualizarCantidad,
        vaciarCarrito,
        totalItems,
        totalPrecio,
      }}
    >
      {children}
    </CarritoContext.Provider>
  );
}

export function useCarrito() {
  const context = useContext(CarritoContext);
  if (context === undefined) {
    throw new Error('useCarrito debe ser usado dentro de un CarritoProvider');
  }
  return context;
}
