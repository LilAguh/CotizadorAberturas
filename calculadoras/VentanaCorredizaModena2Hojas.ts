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
  acabado: {
    id: string;
    color: string;
    preciokg: number;
  };
  incluirMosquitero?: boolean;
}

export interface ResultadoVentanaConMosquitero {
  ventana: ResultadoCalculo;
  mosquitero?: ResultadoCalculo;
  precioTotalConIVA: number;
}

const calcularMosquiteroModena2Hojas = (ancho: number, alto: number, acabadoId: string = 'blanco-brillante'): ResultadoCalculo => {
  const acabado = ACABADOS.find(a => a.id === acabadoId) || ACABADOS[0];
  const precioAluminioKg = acabado.preciokg;

  const perfiles = {
    perimetral: PERFILES.find(p => p.id === 3255)!,
    central: PERFILES.find(p => p.id === 3256)!,
    tope: PERFILES.find(p => p.id === 3228)!,
  };

  // Perfil perimetral: tamaño del parante central - 9cm (2 iguales)
  const jambaMosquitero = alto - 88;
  const cantidadJambas = 2;
  
  // Superior e inferior: zocalo y cabezal + 18mm
  const zocaloYCabezalMosquitero = (ancho / 2) + 2;
  const cantidadZocaloYCabezalMosquitero = 2;
  
  // Perfil central (solo si altura > 1800mm)
  const tieneTravesano = alto > 1800;
  const TravesanoMosquitero = tieneTravesano ? (alto / 2) - 64 : 0;
  
  // Tope de mosquitero
  const topeMosquitero = alto - 100;
  const cantidadTopesMosquitero = 2;

  const perfilesMosquitero = [
    { 
      perfilId: perfiles.perimetral.id, 
      nombre: 'Perfil Jambas de mosquitero', 
      largoPorPieza: jambaMosquitero,
      cantidad: cantidadJambas,
      metrosLineales: (jambaMosquitero * cantidadJambas) / 1000,
      peso: ((jambaMosquitero * cantidadJambas) / 1000) * perfiles.perimetral.pesoKgMl
    },
    { 
      perfilId: perfiles.perimetral.id, 
      nombre: 'Perfil Zócalo y cabezal de mosquitero', 
      largoPorPieza: zocaloYCabezalMosquitero,
      cantidad: cantidadZocaloYCabezalMosquitero,
      metrosLineales: (zocaloYCabezalMosquitero * cantidadZocaloYCabezalMosquitero) / 1000,
      peso: ((zocaloYCabezalMosquitero * cantidadZocaloYCabezalMosquitero) / 1000) * perfiles.perimetral.pesoKgMl
    }
  ];

  if (tieneTravesano) {
    perfilesMosquitero.push({
      perfilId: perfiles.central.id,
      nombre: 'Perfil Travesaño de mosquitero',
      largoPorPieza: TravesanoMosquitero,
      cantidad: 1,
      metrosLineales: TravesanoMosquitero / 1000,
      peso: (TravesanoMosquitero / 1000) * perfiles.central.pesoKgMl
    });
  }

  perfilesMosquitero.push({
    perfilId: perfiles.tope.id,
    nombre: 'Tope de mosquitero',
    largoPorPieza: topeMosquitero,
    cantidad: cantidadTopesMosquitero,
    metrosLineales: (topeMosquitero * cantidadTopesMosquitero) / 1000,
    peso: ((topeMosquitero * cantidadTopesMosquitero) / 1000) * perfiles.tope.pesoKgMl
  });

  const pesoTotalAluminio = perfilesMosquitero.reduce((total, detalle) => total + detalle.peso, 0);

  // Cálculo de accesorios del mosquitero
  const anchoMosquitero = (ancho / 2) + 2;
  const altoMosquitero = alto - 88;
  const perimetro = 2 * (anchoMosquitero + altoMosquitero);
  const perimetroM = perimetro / 1000;
  const areaM2 = (anchoMosquitero * altoMosquitero) / 1000000;

  const accesoriosMosquitero = [
    { id: 'TORNILLO2', cantidad: 16 },
    { id: 'TORNILLO3', cantidad: 6 },
    { id: 'ME73', cantidad: 4 },
    { id: 'MR39', cantidad: 2 },
    { id: 'MPR43', cantidad: 2 },
    { id: 'MB70', cantidad: perimetroM },
    { id: 'MB9', cantidad: (altoMosquitero * 2) / 1000 },
    { id: 'TELA1', cantidad: areaM2 }
  ].map(item => {
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

  const costoAccesorios = accesoriosMosquitero.reduce((total, item) => total + item.precioTotal, 0);

  // CÁLCULO DE PRECIOS DEL MOSQUITERO
  const costoAluminio = pesoTotalAluminio * precioAluminioKg;
  const costoVidrio = 0; // El mosquitero no tiene vidrio

  // Aplicar ganancias
  const gananciaAluminio = getPorcentaje('aluminio');
  const gananciaAccesorios = getPorcentaje('accesorios');

  const precioVentaAluminio = aplicarPorcentaje(costoAluminio, gananciaAluminio);
  const precioVentaAccesorios = aplicarPorcentaje(costoAccesorios, gananciaAccesorios);

  const precioVentaTotal = precioVentaAluminio + precioVentaAccesorios;
  const precioVentaConIVA = aplicarIVA(precioVentaTotal);

  return {
    pesoTotalAluminio,
    detallesAluminio: perfilesMosquitero,
    vidrios: {
      ancho: 0,
      alto: 0,
      cantidad: 0,
      areaTotal: 0,
      areaPaño: 0,
      perimetroPaño: 0,
      precioVidrio: 0,
      esDvh: false
    },
    accesorios: {
      lista: accesoriosMosquitero,
      total: costoAccesorios
    },
    precios: {
      costoAluminio,
      costoVidrio,
      costoAccesorios,
      precioVentaVidrio: 0,
      precioVentaAluminio,
      precioVentaAccesorios,
      precioVentaTotal,
      precioVentaConIVA
    },
    acabado: {
      id: acabado.id,
      color: acabado.color,
      preciokg: acabado.preciokg
    },
    incluirMosquitero: true
  };
};

// Función para calcular accesorios específicos de Modena 2 Hojas (solo ventana, sin mosquitero)
const calcularAccesoriosModena2Hojas = (ancho: number, alto: number) => {
  const perimetro = 2 * (ancho + alto);
  const perimetroM = perimetro / 1000;
  
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

// Función helper local
const getPrecioCamara = (espesor: number): number => {
  const camara = CAMARAS.find(c => c.espesor === espesor);
  return camara ? camara.precioMl : 7000;
};

// Función principal modificada para manejar ambos casos
export const calcularVentanaCorrediza2Hojas = (
  ancho: number,
  alto: number,
  vidrioExteriorId: number,
  vidrioInteriorId: number,
  esDvh: boolean,
  espesorCamara: number = 6,
  vidriosData: TipoVidrio[],
  acabadoId: string = 'blanco-brillante',
  incluirMosquitero: boolean = false,
  soloMosquitero: boolean = false
): ResultadoCalculo | ResultadoVentanaConMosquitero => {
  
  // Si es solo mosquitero, retornamos solo el cálculo del mosquitero
  if (soloMosquitero) {
    return calcularMosquiteroModena2Hojas(ancho, alto, acabadoId);
  }

  const acabado = ACABADOS.find(a => a.id === acabadoId) || ACABADOS[0];
  const precioAluminioKg = acabado.preciokg;
  const vidrioExterior = vidriosData.find(v => v.id === vidrioExteriorId);
  const vidrioInterior = vidriosData.find(v => v.id === vidrioInteriorId);
  
  if (!vidrioExterior || !vidrioInterior) throw new Error('Tipo de vidrio no válido');

  const prefijoId = esDvh ? 3 : 1;
  
  const perfiles = {
    marcoDintel: PERFILES.find(p => p.id === 1200)!,
    marcoJamba: PERFILES.find(p => p.id === 1201)!,
    paranteLateral: PERFILES.find(p => p.id === prefijoId * 1000 + 203)!,
    paranteCentral: PERFILES.find(p => p.id === prefijoId * 1000 + 204)!,
    zocalo: PERFILES.find(p => p.id === prefijoId * 1000 + 202)!
  };

  // Cálculos de aluminio para ventana (SIN mosquitero)
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

  // Cálculo de vidrios
  const anchoVidrioPaño = ((ancho - 50) / 2) - 52;
  const altoVidrioPaño = (alto - 79) - 90;
  const cantidadUnidadesDVH = 2;

  const resultadoVidrioUnidad: CalculoVidrioResult = calcularCostoVidrio(
    anchoVidrioPaño,
    altoVidrioPaño,
    vidrioExterior,
    vidrioInterior,
    esDvh,
    espesorCamara
  );

  const areaTotal = resultadoVidrioUnidad.area * 2 * cantidadUnidadesDVH;
  const costoVidrio = resultadoVidrioUnidad.costoReal * cantidadUnidadesDVH;

  // Cálculo de accesorios de la ventana (SIN mosquitero)
  const accesoriosLista = calcularAccesoriosModena2Hojas(ancho, alto);
  const costoAccesorios = accesoriosLista.reduce((total, item) => total + item.precioTotal, 0);

  // Cálculo de precios de la ventana
  const costoAluminio = pesoTotalAluminio * precioAluminioKg;
  
  const gananciaVidrio = getPorcentaje('vidrio');
  const gananciaAluminio = getPorcentaje('aluminio');
  const gananciaAccesorios = getPorcentaje('accesorios');

  const precioVentaVidrio = aplicarPorcentaje(costoVidrio, gananciaVidrio);
  const precioVentaAluminio = aplicarPorcentaje(costoAluminio, gananciaAluminio);
  const precioVentaAccesorios = aplicarPorcentaje(costoAccesorios, gananciaAccesorios);

  const precioVentaTotal = precioVentaVidrio + precioVentaAluminio + precioVentaAccesorios;
  const precioVentaConIVA = aplicarIVA(precioVentaTotal);

  const resultadoVentana: ResultadoCalculo = {
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
    },
    incluirMosquitero: false
  };

  // Si incluye mosquitero, retornamos ambos cálculos separados
  if (incluirMosquitero) {
    const resultadoMosquitero = calcularMosquiteroModena2Hojas(ancho, alto, acabadoId);
    const precioTotalConIVA = resultadoVentana.precios.precioVentaConIVA + resultadoMosquitero.precios.precioVentaConIVA;
    
    return {
      ventana: resultadoVentana,
      mosquitero: resultadoMosquitero,
      precioTotalConIVA
    };
  }

  // Si no incluye mosquitero, retornamos solo la ventana
  return resultadoVentana;
};

// Función para formatear resultado cuando es solo mosquitero
export const formatearResultadoSoloMosquitero = (resultado: ResultadoCalculo, anchoOriginal: number, altoOriginal: number): string => {
  return `
MOSQUITERO MODENA - ${anchoOriginal}x${altoOriginal} mm
=============================================

DETALLES DE ALUMINIO:
${resultado.detallesAluminio.map(d => 
  `- ${d.nombre}: ${d.cantidad} piezas de ${d.largoPorPieza.toFixed(0)}mm (${d.metrosLineales.toFixed(2)} ml) - ${d.peso.toFixed(2)} kg`
).join('\n')}

PESO TOTAL ALUMINIO: ${resultado.pesoTotalAluminio.toFixed(2)} kg

ACCESORIOS:
${resultado.accesorios.lista.map(a => 
  `- ${a.nombre}: ${a.cantidad} ${a.unidad} - $${a.precioTotal.toFixed(2)}`
).join('\n')}
Total accesorios: $${resultado.accesorios.total.toFixed(2)}

PRECIOS:
- Costo real aluminio: $${resultado.precios.costoAluminio.toFixed(2)}
- Costo real accesorios: $${resultado.precios.costoAccesorios.toFixed(2)}
- SUBTOTAL COSTOS: $${(resultado.precios.costoAluminio + resultado.precios.costoAccesorios).toFixed(2)}

PRECIO DE VENTA:
- Aluminio + ganancia (40%): $${resultado.precios.precioVentaAluminio.toFixed(2)}
- Accesorios + ganancia (35%): $${resultado.precios.precioVentaAccesorios.toFixed(2)}
- TOTAL SIN IVA: $${resultado.precios.precioVentaTotal.toFixed(2)}
- TOTAL CON IVA (21%): $${resultado.precios.precioVentaConIVA.toFixed(2)}

CORTES DE ALUMINIO:
${resultado.detallesAluminio.map(d => 
  `- ${d.nombre}: ${d.cantidad} piezas de ${d.largoPorPieza.toFixed(0)}mm`
).join('\n')}
  `.trim();
};

export const formatearResultadoModena2Hojas = (resultado: ResultadoCalculo, anchoOriginal: number, altoOriginal: number): string => {
  const esDvh = resultado.vidrios.esDvh || false;
  const incluyeMosquitero = resultado.incluirMosquitero || false;
  
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
${incluyeMosquitero ? 'INCLUYE MOSQUITERO' : ''}
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
${resultado.detallesAluminio.map(d => 
  `- ${d.nombre}: ${d.cantidad} piezas de ${d.largoPorPieza.toFixed(0)}mm`
).join('\n')}
  `.trim();
};

// Función para formatear cuando hay ventana + mosquitero
export const formatearResultadoVentanaConMosquitero = (resultado: ResultadoVentanaConMosquitero, anchoOriginal: number, altoOriginal: number): string => {
  const ventanaFormateada = formatearResultadoModena2Hojas(resultado.ventana, anchoOriginal, altoOriginal);
  const mosquiteroFormateado = formatearResultadoSoloMosquitero(resultado.mosquitero!, anchoOriginal, altoOriginal);
  
  return `
${ventanaFormateada}

=============================================
         MOSQUITERO INCLUIDO
=============================================

${mosquiteroFormateado}

=============================================
           PRECIO COMBINADO
=============================================
- Ventana: $${resultado.ventana.precios.precioVentaConIVA.toFixed(2)}
- Mosquitero: $${resultado.mosquitero!.precios.precioVentaConIVA.toFixed(2)}
- TOTAL: $${resultado.precioTotalConIVA.toFixed(2)}
  `.trim();
};