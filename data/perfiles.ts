export type Perfil = {
  id: number;
  nombre: string;
  sistema: string[];
  tipo: 'marco' | 'hoja';
  pesoKgMl: number;
};

export const PERFILES: Perfil[] = [
  //corrediza
  {
    id: 1200,
    nombre: 'Dintel y Umbral ventana y puerta corrediza 90',
    sistema: ['corredizo'],
    tipo: 'marco',
    pesoKgMl: 1.145
  },
  {
    id: 1201,
    nombre: 'Jamba Ventana y puerta corrediza 90',
    sistema: ['corredizo'],
    tipo: 'marco',
    pesoKgMl: 0.665
  },
  {
    id: 1203,
    nombre: 'Parante Lateral Hoja Vidrio Simple',
    sistema: ['corredizo'],
    tipo: 'hoja',
    pesoKgMl: 0.700
  },
  {
    id: 3203,
    nombre: 'Parante Lateral Hoja DVH',
    sistema: ['corredizo'],
    tipo: 'hoja',
    pesoKgMl: 0.595
  },
  {
    id: 1204,
    nombre: 'Parante central Hoja Vidrio Simple',
    sistema: ['corredizo'],
    tipo: 'hoja',
    pesoKgMl: 0.600
  },
  {
    id: 3204,
    nombre: 'Parante central Hoja DVH',
    sistema: ['corredizo'],
    tipo: 'hoja',
    pesoKgMl: 0.600
  },
  {
    id: 1202,
    nombre: 'Zocalo Hoja Vidrio Simple',
    sistema: ['corredizo'],
    tipo: 'hoja',
    pesoKgMl: 0.678
  },
  {
    id: 3202,
    nombre: 'Zocalo Hoja DVH',
    sistema: ['corredizo'],
    tipo: 'hoja',
    pesoKgMl: 0.640
  },
]

