import { useState } from 'react';

export interface VentanaPresupuestada {
  id: string;
  tipo: string;
  medidas: string;
  descripcion: string;
  precio: number;
  detalles: any;
  fecha: Date;
}

export const usePresupuesto = () => {
  const [ventanas, setVentanas] = useState<VentanaPresupuestada[]>([]);

  const agregarVentana = (ventana: Omit<VentanaPresupuestada, 'id' | 'fecha'>) => {
    const nuevaVentana: VentanaPresupuestada = {
      ...ventana,
      id: Date.now().toString(),
      fecha: new Date()
    };
    
    setVentanas(prev => [...prev, nuevaVentana]);
  };

  const eliminarVentana = (id: string) => {
    setVentanas(prev => prev.filter(v => v.id !== id));
  };

  const total = ventanas.reduce((sum, ventana) => sum + ventana.precio, 0);

  const limpiarPresupuesto = () => {
    setVentanas([]);
  };

  return {
    ventanas,
    agregarVentana,
    eliminarVentana,
    total,
    limpiarPresupuesto
  };
};