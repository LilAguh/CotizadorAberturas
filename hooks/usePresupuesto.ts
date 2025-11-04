// hooks/usePresupuesto.ts
import { useState } from 'react';
import { generarCodigoDesdeTipo } from '@/utils/codigosVentana';

export interface VentanaPresupuestada {
  id: string;
  tipo: 'corrediza2hojas' | 'pañoFijo' | 'mosquitero';
  tipoNombre: string;
  ancho: number;
  alto: number;
  medidas: string;
  descripcion: string;
  precio: number;
  precioConIVA: number;
  detalles: any;
  fecha: Date;
  codigo: string;
  timestamp: number; // Agregar timestamp
  acabado: {
    id: string;
    color: string;
    preciokg: number;
  };
  incluirMosquitero?: boolean;
}

export const usePresupuesto = () => {
  const [ventanas, setVentanas] = useState<VentanaPresupuestada[]>([]);

  const agregarVentana = (ventana: Omit<VentanaPresupuestada, 'id' | 'fecha' | 'codigo' | 'timestamp'>) => {
    const codigo = generarCodigoDesdeTipo(ventana.tipo);
    const nuevaVentana: VentanaPresupuestada = {
      ...ventana,
      id: Date.now().toString(),
      fecha: new Date(),
      timestamp: Date.now(), // Agregar timestamp
      codigo
    };
    
    setVentanas(prev => [...prev, nuevaVentana]);
  };

  const eliminarVentana = (id: string) => {
    setVentanas(prev => prev.filter(v => v.id !== id));
  };

  const total = ventanas.reduce((sum, ventana) => sum + ventana.precioConIVA, 0);

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