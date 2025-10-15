// data/acabados.ts
export type Acabado = {
  id: string;
  color: string;
  descripcion?: string;
  preciokg: number;
  disponible: boolean;
};

export const ACABADOS: Acabado[] = [
  {
    id: 'blanco-brillante',
    color: 'Blanco Brillante',
    descripcion: 'Acabado estándar blanco brillante',
    preciokg: 16000,
    disponible: true
  },
  {
    id: 'negro-mate',
    color: 'Negro Mate',
    descripcion: 'Acabado premium negro mate',
    preciokg: 18000,
    disponible: true
  },
  {
    id: 'madera-chocolate',
    color: 'Madera Chocolate',
    descripcion: 'Acabado madera color chocolate',
    preciokg: 20000,
    disponible: true
  },
  {
    id: 'madera-nogal',
    color: 'Madera Nogal',
    descripcion: 'Acabado madera color nogal',
    preciokg: 20000,
    disponible: true
  },
  {
    id: 'gris-oscuro',
    color: 'Gris Oscuro',
    descripcion: 'Acabado gris oscuro mate',
    preciokg: 17500,
    disponible: true
  }
];

// Helper functions
export const getAcabado = (id: string): Acabado | undefined => {
  return ACABADOS.find(a => a.id === id);
};

export const getAcabadoPorColor = (color: string): Acabado | undefined => {
  return ACABADOS.find(a => a.color.toLowerCase() === color.toLowerCase());
};

export const getPrecioAcabado = (id: string): number => {
  const acabado = getAcabado(id);
  return acabado ? acabado.preciokg : ACABADOS[0].preciokg;
};