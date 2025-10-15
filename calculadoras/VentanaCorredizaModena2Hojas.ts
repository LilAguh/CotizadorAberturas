import { PERFILES } from '@/data/perfiles';
import { TipoVidrio, CAMARAS } from '@/data/vidrios';
import { ACCESORIOS } from '@/data/accesorios';
import { aplicarPorcentaje, aplicarIVA, getPorcentaje } from '@/data/porcentajes';
import { calcularCostoVidrio, CalculoVidrioResult } from '@/utils/calculosVidrios';
import { ACABADOS } from '@/data/acabados';


export interface ResultadoCalculo {
  pesoTotalAluminio: number;
  detallesAluminio: Array<{
    perfilId: number;
    nombre: string;
    metrosLineales: number;
    peso: number;
    cantidad: number;
    largoPorPieza: number;
  }>;
  vidrios: {
    ancho: number;
    alto: number;
    cantidad: number;
    areaTotal: number;
    areaPaño: number;
    perimetroPaño: number;
    vidrioExterior?: TipoVidrio;
    vidrioInterior?: TipoVidrio;
    precioVidrio?: number;
    esDvh?: boolean;
    espesorCamara?: number;
    detallesDvh?: {
      costoRealVidrioExterior: number;
      costoRealVidrioInterior: number;
      costoRealCamara: number;
    };
  };
  accesorios: {
    lista: Array<{
      id: string;
      nombre: string;
      cantidad: number;
      precioTotal: number;
      unidad: string;
    }>;
    total: number;
  };
  precios: {
    costoAluminio: number;
    costoVidrio: number;
    costoAccesorios: number;
    precioVentaVidrio: number;
    precioVentaAluminio: number;
    precioVentaAccesorios: number;
    precioVentaTotal: number;
    precioVentaConIVA: number;
  };
  acabado: { // Nueva propiedad
    id: string;
    color: string;
    preciokg: number;
  };
}

// Función para calcular accesorios específicos de Modena 2 Hojas
const calcularAccesoriosModena2Hojas = (ancho: number, alto: number) => {
  const perimetro = 2 * (ancho + alto);
  const perimetroM = perimetro / 1000;
  
  // Fórmulas basadas en tus ejemplos
  const calcularMetrajeBurlete = () => (perimetro * 0.8) / 1000;
  const calcularMetrajeFelpa = () => (perimetro * 0.6) / 1000;
  
  const cantidades = [
    { id: 'MH56', cantidad: 2 },
    { id: 'MR39', cantidad: 4 },
    { id: 'MT69', cantidad: 2 },
    { id: 'MT89', cantidad: 4 },
    { id: 'MT90', cantidad: 4 },
    { id: 'MT91', cantidad: 8 },
    { id: 'MT92', cantidad: 4 },
    { id: 'MT93', cantidad: 2 },
    { id: 'MT94', cantidad: 3 },
    { id: 'TORNILLO_PARKER', cantidad: Math.ceil(perimetroM * 8) },
    { id: 'MT88', cantidad: Math.ceil(perimetroM * 4) },
    { id: 'MT95', cantidad: Math.ceil(perimetroM * 4) },
    { id: 'MB31', cantidad: calcularMetrajeBurlete() },
    { id: 'MB69', cantidad: perimetroM },
    { id: 'MC14', cantidad: calcularMetrajeFelpa() }
  ];

  return cantidades.map(item => {
    const accesorio = ACCESORIOS.find(a => a.id === item.id);
    const precioTotal = accesorio ? item.cantidad * accesorio.precioUnitario : 0;
    
    return {
      id: item.id,
      nombre: accesorio?.nombre || item.id,
      cantidad: item.cantidad,
      precioTotal,
      unidad: accesorio?.unidad || 'unidad'
    };
  });
};

export const calcularVentanaCorrediza2Hojas = (
  ancho: number,
  alto: number,
  vidrioExteriorId: number,
  vidrioInteriorId: number,
  esDvh: boolean,
  espesorCamara: number = 6,
  vidriosData: TipoVidrio[],
  acabadoId: string = 'blanco-brillante' // Nuevo parámetro
): ResultadoCalculo => {
  const acabado = ACABADOS.find(a => a.id === acabadoId) || ACABADOS[0];
  const precioAluminioKg = acabado.preciokg;
  const vidrioExterior = vidriosData.find(v => v.id === vidrioExteriorId);
  const vidrioInterior = vidriosData.find(v => v.id === vidrioInteriorId);
  
  if (!vidrioExterior || !vidrioInterior) throw new Error('Tipo de vidrio no válido');

  // Determinar prefijo de IDs según si es DVH o no
  const prefijoId = esDvh ? 3 : 1;
  
  // Obtener perfiles específicos
  const perfiles = {
    marcoDintel: PERFILES.find(p => p.id === 1200)!,
    marcoJamba: PERFILES.find(p => p.id === 1201)!,
    paranteLateral: PERFILES.find(p => p.id === prefijoId * 1000 + 203)!,
    paranteCentral: PERFILES.find(p => p.id === prefijoId * 1000 + 204)!,
    zocalo: PERFILES.find(p => p.id === prefijoId * 1000 + 202)!
  };

  // Cálculos de aluminio
  const calculos = {
    marcoDintel: {
      largoPorPieza: ancho - 42,
      cantidad: 2,
      metrosLineales: (ancho - 42) * 2 / 1000,
      peso: ((ancho - 42) * 2 / 1000) * perfiles.marcoDintel.pesoKgMl
    },
    marcoJamba: {
      largoPorPieza: alto,
      cantidad: 2,
      metrosLineales: alto * 2 / 1000,
      peso: (alto * 2 / 1000) * perfiles.marcoJamba.pesoKgMl
    },
    paranteLateral: {
      largoPorPieza: alto - 79,
      cantidad: 4,
      metrosLineales: (alto - 79) * 4 / 1000,
      peso: ((alto - 79) * 4 / 1000) * perfiles.paranteLateral.pesoKgMl
    },
    paranteCentral: {
      largoPorPieza: alto - 79,
      cantidad: 2,
      metrosLineales: (alto - 79) * 2 / 1000,
      peso: ((alto - 79) * 2 / 1000) * perfiles.paranteCentral.pesoKgMl
    },
    zocalo: {
      largoPorPieza: (ancho - 50) / 2,
      cantidad: 4,
      metrosLineales: ((ancho - 50) / 2) * 4 / 1000,
      peso: (((ancho - 50) / 2) * 4 / 1000) * perfiles.zocalo.pesoKgMl
    }
  };

  const detallesAluminio = [
    { perfilId: perfiles.marcoDintel.id, nombre: perfiles.marcoDintel.nombre, ...calculos.marcoDintel },
    { perfilId: perfiles.marcoJamba.id, nombre: perfiles.marcoJamba.nombre, ...calculos.marcoJamba },
    { perfilId: perfiles.paranteLateral.id, nombre: perfiles.paranteLateral.nombre, ...calculos.paranteLateral },
    { perfilId: perfiles.paranteCentral.id, nombre: perfiles.paranteCentral.nombre, ...calculos.paranteCentral },
    { perfilId: perfiles.zocalo.id, nombre: perfiles.zocalo.nombre, ...calculos.zocalo }
  ];

  const pesoTotalAluminio = detallesAluminio.reduce((total, detalle) => total + detalle.peso, 0);

  // CÁLCULO DE VIDRIOS (CORREGIDO) - 2 UNIDADES DE DVH PARA 2 HOJAS
  const anchoVidrioPaño = ((ancho - 50) / 2) - 52;
  const altoVidrioPaño = (alto - 79) - 90;
  const cantidadUnidadesDVH = 2; // 2 hojas = 2 unidades de DVH

  // Calcular costo de 1 unidad de DVH (2 vidrios + 1 cámara)
  const resultadoVidrioUnidad: CalculoVidrioResult = calcularCostoVidrio(
    anchoVidrioPaño,
    altoVidrioPaño,
    vidrioExterior,
    vidrioInterior,
    esDvh,
    espesorCamara
  );

  // Multiplicar por la cantidad de unidades de DVH
  const areaTotal = resultadoVidrioUnidad.area * 2 * cantidadUnidadesDVH; // 2 vidrios por unidad × 2 unidades
  const costoVidrio = resultadoVidrioUnidad.costoReal * cantidadUnidadesDVH;

  // Cálculo de accesorios
  const accesoriosLista = calcularAccesoriosModena2Hojas(ancho, alto);
  const costoAccesorios = accesoriosLista.reduce((total, item) => total + item.precioTotal, 0);

  // CÁLCULO DE PRECIOS CON GANANCIAS INDIVIDUALES
  const costoAluminio = pesoTotalAluminio * precioAluminioKg;
  
  // Aplicar ganancias individuales
  const gananciaVidrio = getPorcentaje('vidrio'); // 100%
  const gananciaAluminio = getPorcentaje('aluminio'); // 40%
  const gananciaAccesorios = getPorcentaje('accesorios'); // 35%

  const precioVentaVidrio = aplicarPorcentaje(costoVidrio, gananciaVidrio);
  const precioVentaAluminio = aplicarPorcentaje(costoAluminio, gananciaAluminio);
  const precioVentaAccesorios = aplicarPorcentaje(costoAccesorios, gananciaAccesorios);

  const precioVentaTotal = precioVentaVidrio + precioVentaAluminio + precioVentaAccesorios;
  const precioVentaConIVA = aplicarIVA(precioVentaTotal);

  return {
    pesoTotalAluminio,
    detallesAluminio,
    vidrios: {
      ancho: anchoVidrioPaño,
      alto: altoVidrioPaño,
      cantidad: cantidadUnidadesDVH,
      areaTotal,
      areaPaño: resultadoVidrioUnidad.area,
      perimetroPaño: resultadoVidrioUnidad.perimetro,
      vidrioExterior,
      vidrioInterior,
      precioVidrio: costoVidrio,
      esDvh,
      espesorCamara,
      detallesDvh: resultadoVidrioUnidad.detalles
    },
    accesorios: {
      lista: accesoriosLista,
      total: costoAccesorios
    },
    precios: {
      costoAluminio,
      costoVidrio,
      costoAccesorios,
      precioVentaVidrio,
      precioVentaAluminio,
      precioVentaAccesorios,
      precioVentaTotal,
      precioVentaConIVA
    },
    acabado: {
      id: acabado.id,
      color: acabado.color,
      preciokg: acabado.preciokg
    }
  };
};

// Función helper local
const getPrecioCamara = (espesor: number): number => {
  const camara = CAMARAS.find(c => c.espesor === espesor);
  return camara ? camara.precioMl : 7000;
};

export const formatearResultadoModena2Hojas = (resultado: ResultadoCalculo, anchoOriginal: number, altoOriginal: number): string => {
  const esDvh = resultado.vidrios.esDvh || false;
  
  let seccionDvh = '';
  if (esDvh && resultado.vidrios.detallesDvh) {
    const detalles = resultado.vidrios.detallesDvh;
    const costoPorUnidad = detalles.costoRealVidrioExterior + detalles.costoRealVidrioInterior + detalles.costoRealCamara;
    
    seccionDvh = `
CÁLCULO DVH (POR UNIDAD):
- Vidrio exterior (${resultado.vidrios.vidrioExterior?.nombre}): 
  ${resultado.vidrios.areaPaño.toFixed(3)} m² × $${resultado.vidrios.vidrioExterior?.precioM2.toLocaleString()} = $${detalles.costoRealVidrioExterior.toFixed(2)}
- Vidrio interior (${resultado.vidrios.vidrioInterior?.nombre}): 
  ${resultado.vidrios.areaPaño.toFixed(3)} m² × $${resultado.vidrios.vidrioInterior?.precioM2.toLocaleString()} = $${detalles.costoRealVidrioInterior.toFixed(2)}
- Cámara ${resultado.vidrios.espesorCamara}mm: 
  ${resultado.vidrios.perimetroPaño.toFixed(2)} ml × $${getPrecioCamara(resultado.vidrios.espesorCamara || 6).toLocaleString()} = $${detalles.costoRealCamara.toFixed(2)}
- COSTO POR UNIDAD DVH: $${costoPorUnidad.toFixed(2)}
- TOTAL ${resultado.vidrios.cantidad} UNIDADES: $${resultado.precios.costoVidrio.toFixed(2)}
`;
  }

  return `
VENTANA CORREDIZA MODENA 2 HOJAS - ${anchoOriginal}x${altoOriginal} mm
===================================================================

MEDIDAS TOTALES:
- Ancho total: ${anchoOriginal} mm
- Alto total: ${altoOriginal} mm
- Medidas de paño: ${resultado.vidrios.ancho.toFixed(0)}x${resultado.vidrios.alto.toFixed(0)} mm

DETALLES DE ALUMINIO:
${resultado.detallesAluminio.map(d => 
  `- ${d.nombre}: ${d.cantidad} piezas de ${d.largoPorPieza.toFixed(0)}mm (${d.metrosLineales.toFixed(2)} ml) - ${d.peso.toFixed(2)} kg`
).join('\n')}

PESO TOTAL ALUMINIO: ${resultado.pesoTotalAluminio.toFixed(2)} kg

VIDRIOS:
- Tipo: ${esDvh ? 'DVH' : 'Simple'}
- ${esDvh ? `Exterior: ${resultado.vidrios.vidrioExterior?.nombre}` : resultado.vidrios.vidrioExterior?.nombre}
- ${esDvh ? `Interior: ${resultado.vidrios.vidrioInterior?.nombre}` : ''}
- Cantidad: ${resultado.vidrios.cantidad} unidades de DVH
- Área total: ${resultado.vidrios.areaTotal.toFixed(3)} m²
- Área por paño: ${resultado.vidrios.areaPaño.toFixed(3)} m²

${seccionDvh}

ACCESORIOS:
${resultado.accesorios.lista.map(a => 
  `- ${a.nombre}: ${a.cantidad} ${a.unidad} - $${a.precioTotal.toFixed(2)}`
).join('\n')}
Total accesorios: $${resultado.accesorios.total.toFixed(2)}

PRECIOS:
- Costo real aluminio: $${resultado.precios.costoAluminio.toFixed(2)}
- Costo real vidrio: $${resultado.precios.costoVidrio.toFixed(2)}
- Costo real accesorios: $${resultado.precios.costoAccesorios.toFixed(2)}
- SUBTOTAL COSTOS: $${(resultado.precios.costoAluminio + resultado.precios.costoVidrio + resultado.precios.costoAccesorios).toFixed(2)}

PRECIO DE VENTA:
- Vidrio + ganancia (100%): $${resultado.precios.precioVentaVidrio.toFixed(2)}
- Aluminio + ganancia (40%): $${resultado.precios.precioVentaAluminio.toFixed(2)}
- Accesorios + ganancia (35%): $${resultado.precios.precioVentaAccesorios.toFixed(2)}
- TOTAL SIN IVA: $${resultado.precios.precioVentaTotal.toFixed(2)}
- TOTAL CON IVA (21%): $${resultado.precios.precioVentaConIVA.toFixed(2)}

CORTES DE ALUMINIO:
- Marco Dintel/Umbral: ${resultado.detallesAluminio[0].cantidad} piezas de ${resultado.detallesAluminio[0].largoPorPieza.toFixed(0)}mm
- Marco Jamba: ${resultado.detallesAluminio[1].cantidad} piezas de ${resultado.detallesAluminio[1].largoPorPieza.toFixed(0)}mm
- Parante Lateral: ${resultado.detallesAluminio[2].cantidad} piezas de ${resultado.detallesAluminio[2].largoPorPieza.toFixed(0)}mm
- Parante Central: ${resultado.detallesAluminio[3].cantidad} piezas de ${resultado.detallesAluminio[3].largoPorPieza.toFixed(0)}mm
- Zócalo: ${resultado.detallesAluminio[4].cantidad} piezas de ${resultado.detallesAluminio[4].largoPorPieza.toFixed(0)}mm
  `.trim();
};