import { TipoVidrio, TipoCamara, CAMARAS, PRECIO_CAMARA_ML_DEFAULT } from '@/data/vidrios';

export interface CalculoVidrioResult {
  costoReal: number;       // Solo costo REAL sin ganancia
  area: number;
  perimetro: number;
  detalles?: {
    costoRealVidrioExterior: number;
    costoRealVidrioInterior: number;
    costoRealCamara: number;
  };
}


export const calcularCostoVidrio = (
  ancho: number, // mm - medidas de UN paño
  alto: number,  // mm - medidas de UN paño
  vidrioExterior: TipoVidrio,
  vidrioInterior: TipoVidrio,
  esDvh: boolean = false,
  espesorCamara: number = 6
): CalculoVidrioResult => {
  const areaPaño = (ancho * alto) / 1000000; // m² de UN paño
  const perimetroPaño = (2 * (ancho + alto)) / 1000; // ml de UN paño

  if (esDvh) {
    const camara = CAMARAS.find(c => c.espesor === espesorCamara) || CAMARAS[0];
    
    // Costos para UN paño de DVH
    const costoRealVidrioExterior = areaPaño * vidrioExterior.precioM2;
    const costoRealVidrioInterior = areaPaño * vidrioInterior.precioM2;
    const costoRealCamara = perimetroPaño * camara.precioMl;
    
    const costoRealTotalPaño = costoRealVidrioExterior + costoRealVidrioInterior + costoRealCamara;

    return {
      costoReal: costoRealTotalPaño, // Costo de UN paño
      area: areaPaño, // Área de UN paño
      perimetro: perimetroPaño, // Perímetro de UN paño
      detalles: {
        costoRealVidrioExterior,
        costoRealVidrioInterior,
        costoRealCamara
      }
    };
  } else {
    // Para vidrio simple
    const costoReal = areaPaño * vidrioExterior.precioM2;
    
    return {
      costoReal, // Costo de UN paño
      area: areaPaño,
      perimetro: perimetroPaño
    };
  }
};

// Función helper para obtener opciones de cámara
export const getOpcionesCamara = (): TipoCamara[] => {
  return CAMARAS;
};

// Función para obtener precio de cámara por espesor
export const getPrecioCamara = (espesor: number): number => {
  const camara = CAMARAS.find(c => c.espesor === espesor);
  return camara ? camara.precioMl : PRECIO_CAMARA_ML_DEFAULT;
};