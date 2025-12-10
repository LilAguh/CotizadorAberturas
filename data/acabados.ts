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
    descripcion: 'Acabado Blanco Brillante',
    preciokg: 17379,
    disponible: true
  },
  {
    id: 'negro-mate',
    color: 'Negro Mate',
    descripcion: 'Acabado Bronce',
    preciokg: 18480,
    disponible: true
  },
  {
    id: 'bronce',
    color: 'Bronce',
    descripcion: 'Acabado Bronce',
    preciokg: 18480,
    disponible: true
  },
  {
    id: 'gris-topo',
    color: 'Gris Topo',
    descripcion: 'Acabado Gris Topo',
    preciokg: 18480,
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
