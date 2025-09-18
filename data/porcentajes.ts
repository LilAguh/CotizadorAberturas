export type PorcentajeGanancia = {
  id: number;
  nombre: string;
  porcentaje: number;
  descripcion: string;
  categoria: 'aluminio' | 'vidrio' | 'accesorios' | 'general';
  activo: boolean;
};

export const PORCENTAJES_GANANCIA: PorcentajeGanancia[] = [
  {
    id: 10010,
    nombre: 'Ganancia Vidrio',
    porcentaje: 100,
    descripcion: 'Margen sobre vidrios',
    categoria: 'vidrio',
    activo: true
  },
  {
    id: 10020,
    nombre: 'Ganancia Aluminio',
    porcentaje: 40,
    descripcion: 'Margen sobre aluminio',
    categoria: 'aluminio',
    activo: true
  },
  {
    id: 10030,
    nombre: 'Ganancia Accesorios',
    porcentaje: 35,
    descripcion: 'Margen sobre accesorios',
    categoria: 'accesorios',
    activo: true
  },
  {
    id: 10040,
    nombre: 'IVA',
    porcentaje: 21,
    descripcion: 'Impuesto al Valor Agregado',
    categoria: 'general',
    activo: true
  }
];

// Cambiar la función getPorcentaje para que acepte la categoría correcta
export const getPorcentaje = (categoria: 'aluminio' | 'vidrio' | 'accesorios'): number => {
  const porcentaje = PORCENTAJES_GANANCIA.find(p => p.categoria === categoria && p.activo);
  return porcentaje ? porcentaje.porcentaje : 0;
};

export const aplicarPorcentaje = (monto: number, porcentaje: number): number => {
  return monto * (1 + porcentaje / 100);
};

export const aplicarIVA = (precio: number): number => {
  const iva = PORCENTAJES_GANANCIA.find(p => p.id === 10040)?.porcentaje || 21;
  return aplicarPorcentaje(precio, iva);
};