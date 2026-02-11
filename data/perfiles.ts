export type Perfil = {
  id: number;
  nombre: string;
  sistema: string[];
  tipo: 'marco' | 'hoja' | 'mosquitero' | 'contravidrio';
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
  {
    id: 3255,
    nombre: 'Hoja Mosquitero',
    sistema: ['mosquitero'],
    tipo: 'mosquitero',
    pesoKgMl: 0.432
  },
  {
    id: 3256,
    nombre: 'Travesaño mosquitero',
    sistema: ['mosquitero'],
    tipo: 'mosquitero',
    pesoKgMl: 0.535
  },
  {
    id: 3228,
    nombre: 'Tope de mosquitero',
    sistema: ['mosquitero'],
    tipo: 'mosquitero', 
    pesoKgMl: 0.188
  },
  //Pano fijo

  {
    id: 3216,
    nombre: 'Paño fijo / marco de abrir',
    sistema: ['marco'],
    tipo: 'marco', 
    pesoKgMl: 0.691
  },
  
  //contravidro
  {
    id: 3226,
    nombre: 'Contravidrio recto 15mm',
    sistema: ['paño fijo'],
    tipo: 'contravidrio', 
    pesoKgMl: 0.230
  },{
    id: 3225,
    nombre: 'Contravidrio recto 22mm',
    sistema: ['paño fijo'],
    tipo: 'contravidrio', 
    pesoKgMl: 0.255
  },{
    id: 3217,
    nombre: 'Contravidrio recto 29mm',
    sistema: ['paño fijo'],
    tipo: 'contravidrio', 
    pesoKgMl: 0.294
  },{
    id: 3227,
    nombre: 'Contravidrio recto 35mm',
    sistema: ['paño fijo'],
    tipo: 'contravidrio', 
    pesoKgMl: 0.319
  },
]

