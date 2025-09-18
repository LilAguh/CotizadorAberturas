export type TipoVidrio = {
  id: number;
  nombre: string;
  espesor: number; // mm
  color?: string;
  precioM2: number;
};

export type TipoCamara = {
  espesor: number; // mm
  precioMl: number;
};

export const CAMARAS: TipoCamara[] = [
  {
    espesor: 6,
    precioMl: 6000
  },
  {
    espesor: 9,
    precioMl: 6000
  },
  {
    espesor: 12,
    precioMl: 8000
  },
  {
    espesor: 15,
    precioMl: 9000
  }
];

export const PRECIO_CAMARA_ML_DEFAULT = 7000; // Precio por defecto

export const VIDRIOS: TipoVidrio[] = [
  // VIDRIOS SIMPLES (para usar individualmente o en DVH)
  {
    id: 3,
    nombre: 'Float Incoloro 03mm',
    espesor: 3,
    color: 'transparente',
    precioM2: 13386.28
  },
  {
    id: 4,
    nombre: 'Float Incoloro 04mm',
    espesor: 4,
    color: 'transparente',
    precioM2: 16505.49
    // precioM2: 15000
  },
  {
    id: 5,
    nombre: 'Float Incoloro 05mm',
    espesor: 5,
    color: 'transparente',
    precioM2: 22867.08
  },
  {
    id: 6,
    nombre: 'Float Incoloro 06mm',
    espesor: 6,
    color: 'transparente',
    precioM2: 28201.08
  },
  {
    id: 7,
    nombre: 'Float Incoloro 08mm',
    espesor: 8,
    color: 'transparente',
    precioM2: 37825.71
  },
  {
    id: 8,
    nombre: 'Float Incoloro 10mm',
    espesor: 10,
    color: 'transparente',
    precioM2: 47913.16
  },
  {
    id: 9,
    nombre: 'Float Incoloro 12mm',
    espesor: 12,
    color: 'transparente',
    precioM2: 79904.03
  },
  {
    id: 10,
    nombre: 'Float Incoloro 15mm',
    espesor: 10,
    color: 'transparente',
    precioM2: 189195.33
  },
  {
    id: 11,
    nombre: 'Laminado 3+3 incoloro',
    espesor: 6,
    color: 'transparente',
    precioM2: 44880.16
  },
  {
    id: 12,
    nombre: 'Laminado 4+4 incoloro',
    espesor: 8,
    color: 'transparente',
    precioM2: 56211.35
  },
  {
    id: 13,
    nombre: 'Laminado 5+5 incoloro',
    espesor: 10,
    color: 'transparente',
    precioM2: 65830.92
  },
  {
    id: 14,
    nombre: 'Laminado 6+6 incoloro',
    espesor: 12,
    color: 'transparente',
    precioM2: 75644.85
  },
  {
    id: 15,
    nombre: 'Templado 5mm incoloro',
    espesor: 5,
    color: 'transparente',
    precioM2: 48165.64
  },
  {
    id: 16,
    nombre: 'Templado 6mm incoloro',
    espesor: 6,
    color: 'transparente',
    precioM2: 50587.49
  },
  {
    id: 17,
    nombre: 'Templado 8mm incoloro',
    espesor: 8,
    color: 'transparente',
    precioM2: 62211.33
  },
  {
    id: 18,
    nombre: 'Templado 10mm incoloro',
    espesor: 10,
    color: 'transparente',
    precioM2: 69046.64
  },
  {
    id: 19,
    nombre: 'Templado 12mm incoloro',
    espesor: 12,
    color: 'transparente',
    precioM2: 167291.59
  },
  {
    id: 20,
    nombre: 'Templado 15mm incoloro',
    espesor: 15,
    color: 'transparente',
    precioM2: 377247.65
  },

];