// hooks/usePresupuesto.ts
import { useState } from "react";
import { generarCodigoDesdeTipo } from "@/utils/codigosVentana";

export interface VentanaPresupuestada {
  id: string;
  tipo: "corrediza2hojas" | "pañoFijo" | "mosquitero" | "manual";
  tipoNombre: string;
  ancho: number;
  alto: number;
  medidas: string;
  descripcion: string;
  precio: number;
  precioConIVA: number;
  cantidad: number;
  detalles: any;
  fecha: Date;
  codigo: string;
  timestamp: number;
  acabado?: {
    id: string;
    color: string;
    preciokg: number;
  };
  incluirMosquitero?: boolean;
}

const IVA = 1.21;

export const usePresupuesto = () => {
  const [ventanas, setVentanas] = useState<VentanaPresupuestada[]>([]);

  const agregarVentana = (
    ventana: Omit<
      VentanaPresupuestada,
      "id" | "fecha" | "codigo" | "timestamp" | "precioConIVA"
    >
  ) => {
    const now = Date.now();
    const codigo = generarCodigoDesdeTipo(ventana.tipo);

    const cantidad = ventana.cantidad ?? 1;

    const precioConIVA = ventana.precio * cantidad * IVA;

    const nuevaVentana: VentanaPresupuestada = {
      ...ventana,
      cantidad,
      precioConIVA,
      id: crypto.randomUUID(), // ✅ evita duplicados
      fecha: new Date(),
      timestamp: now,
      codigo,
    };

    setVentanas((prev) => [...prev, nuevaVentana]);
  };

  const eliminarVentana = (id: string) => {
    setVentanas((prev) => prev.filter((v) => v.id !== id));
  };

  const total = ventanas.reduce(
    (sum, v) => sum + v.precioConIVA,
    0
  );

  const limpiarPresupuesto = () => {
    setVentanas([]);
  };

  return {
    ventanas,
    agregarVentana,
    eliminarVentana,
    total,
    limpiarPresupuesto,
  };
};
