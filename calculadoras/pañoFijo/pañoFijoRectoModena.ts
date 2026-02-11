import { PERFILES } from "@/data/perfiles";
import { TipoVidrio, CAMARAS } from "@/data/vidrios";
import { ACCESORIOS } from "@/data/accesorios";
import {
  aplicarPorcentaje,
  aplicarIVA,
  getPorcentaje,
} from "@/data/porcentajes";
import {
  calcularCostoVidrio,
  CalculoVidrioResult,
} from "@/utils/calculosVidrios";
import { ACABADOS } from "@/data/acabados";

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
}

const calcularAccesoriosPanoFijoRecto = (ancho: number, alto: number) => {
  const calcularMetrajeBurlete = () =>
    (2 * (alto - 26) + 2 * (ancho - 26)) / 1000;

  const cantidades = [
    { id: "ME69", cantidad: 4 },
    { id: "MB31", cantidad: calcularMetrajeBurlete() },
    { id: "MB68", cantidad: calcularMetrajeBurlete() },
  ];

  return cantidades.map((item) => {
    const accesorio = ACCESORIOS.find((a) => a.id === item.id);
    const precioTotal = accesorio
      ? item.cantidad * accesorio.precioUnitario
      : 0;

    return {
      id: item.id,
      nombre: accesorio?.nombre || item.id,
      cantidad: item.cantidad,
      precioTotal,
      unidad: accesorio?.unidad || "unidad",
    };
  });
};

const calcularEspesorTotalVidrio = (
  vidrioExterior: TipoVidrio,
  vidrioInterior: TipoVidrio,
  esDvh: boolean,
  espesorCamara: number
): number => {
  if (!esDvh) {
    return vidrioExterior.espesor;
  }

  return (
    vidrioExterior.espesor +
    vidrioInterior.espesor +
    espesorCamara
  );
};

const getPrecioCamara = (espesor: number): number => {
  const camara = CAMARAS.find((c) => c.espesor === espesor);
  return camara ? camara.precioMl : 7000;
};

const calcularContravidrioRecto = (
  espesorTotalVidrio: number,
  anchoVidrio: number,
  altoVidrio: number
) => {

  let perfilId: number;

  if (espesorTotalVidrio <= 4) {
    perfilId = 3227; // 35mm
  } else if (espesorTotalVidrio <= 6) {
    perfilId = 3217; // 29mm
  } else if (espesorTotalVidrio <= 18) {
    perfilId = 3225; // 22mm
  } else {
    perfilId = 3226; // 15mm
  }

  const perfil = PERFILES.find(p => p.id === perfilId);
  if (!perfil) {
    throw new Error('Contravidrio no encontrado');
  }

  // Medidas reales
  const largoHorizontal = anchoVidrio;
  const largoVertical = altoVidrio - 34; // 2 contravidrios horizontales

  const piezas = [
    {
      perfilId: perfil.id,
      nombre: perfil.nombre,
      largoPorPieza: largoHorizontal,
      cantidad: 2,
      metrosLineales: (largoHorizontal * 2) / 1000,
      peso: ((largoHorizontal * 2) / 1000) * perfil.pesoKgMl
    },
    {
      perfilId: perfil.id,
      nombre: perfil.nombre,
      largoPorPieza: largoVertical,
      cantidad: 2,
      metrosLineales: (largoVertical * 2) / 1000,
      peso: ((largoVertical * 2) / 1000) * perfil.pesoKgMl
    }
  ];

  const pesoTotal = piezas.reduce(
    (total, p) => total + p.peso,
    0
  );

  return {
    perfil,
    piezas,
    pesoTotal
  };
};


export const calcularPanoFijoRecto = (
  ancho: number,
  alto: number,
  vidrioExteriorId: number,
  vidrioInteriorId: number,
  esDvh: boolean,
  espesorCamara: number = 6,
  vidriosData: TipoVidrio[],
  acabadoId: string = 'blanco-brillante'
): ResultadoCalculo => {

  const acabado = ACABADOS.find(a => a.id === acabadoId) || ACABADOS[0];
  const precioAluminioKg = acabado.preciokg;

  const vidrioExterior = vidriosData.find(v => v.id === vidrioExteriorId);
  const vidrioInterior = vidriosData.find(v => v.id === vidrioInteriorId);
  if (!vidrioExterior || !vidrioInterior) {
    throw new Error('Vidrio no válido');
  }

  // ======================================================
  // MARCO PAÑO FIJO – PERFIL 3216
  // ======================================================
  const marco = PERFILES.find(p => p.id === 3216);
  if (!marco) throw new Error('Perfil 3216 no encontrado');

  const marcoAlto = {
    perfilId: marco.id,
    nombre: marco.nombre,
    largoPorPieza: alto,
    cantidad: 2,
    metrosLineales: (alto * 2) / 1000,
    peso: ((alto * 2) / 1000) * marco.pesoKgMl
  };

  const marcoAncho = {
    perfilId: marco.id,
    nombre: marco.nombre,
    largoPorPieza: ancho,
    cantidad: 2,
    metrosLineales: (ancho * 2) / 1000,
    peso: ((ancho * 2) / 1000) * marco.pesoKgMl
  };

  let detallesAluminio = [marcoAlto, marcoAncho];

  // ======================================================
  // VIDRIO
  // ======================================================
  const DESCUENTO_VIDRIO = 65;

  const anchoVidrio = ancho - DESCUENTO_VIDRIO;
  const altoVidrio = alto - DESCUENTO_VIDRIO;

  const resultadoVidrio = calcularCostoVidrio(
    anchoVidrio,
    altoVidrio,
    vidrioExterior,
    vidrioInterior,
    esDvh,
    espesorCamara
  );

  const cantidadVidrios = esDvh ? 1 : 1;

  const espesorTotalVidrio = esDvh
    ? vidrioExterior.espesor + vidrioInterior.espesor + espesorCamara
    : vidrioExterior.espesor;

  // ======================================================
  // CONTRAVIDRIO RECTO (automático)
  // ======================================================
  const contravidrio = calcularContravidrioRecto(
    espesorTotalVidrio,
    anchoVidrio,
    altoVidrio
  );

  detallesAluminio = [
    ...detallesAluminio,
    ...contravidrio.piezas
  ];

  const pesoTotalAluminio = detallesAluminio.reduce(
    (total, d) => total + d.peso,
    0
  );

  // ======================================================
  // ACCESORIOS
  // ======================================================
  const accesoriosLista = calcularAccesoriosPanoFijoRecto(ancho, alto);
  const costoAccesorios = accesoriosLista.reduce(
    (t, a) => t + a.precioTotal,
    0
  );

  // ======================================================
  // COSTOS Y PRECIOS
  // ======================================================
  const costoAluminio = pesoTotalAluminio * precioAluminioKg;
  const costoVidrio = resultadoVidrio.costoReal * cantidadVidrios;

  const precioVentaVidrio = aplicarPorcentaje(costoVidrio, getPorcentaje('vidrio'));
  const precioVentaAluminio = aplicarPorcentaje(costoAluminio, getPorcentaje('aluminio'));
  const precioVentaAccesorios = aplicarPorcentaje(costoAccesorios, getPorcentaje('accesorios'));

  const precioVentaTotal =
    precioVentaVidrio +
    precioVentaAluminio +
    precioVentaAccesorios;

  const precioVentaConIVA = aplicarIVA(precioVentaTotal);

  // ======================================================
  // RESULTADO FINAL
  // ======================================================
  return {
    pesoTotalAluminio,
    detallesAluminio,
    vidrios: {
      ancho: anchoVidrio,
      alto: altoVidrio,
      cantidad: cantidadVidrios,
      areaTotal: resultadoVidrio.area * cantidadVidrios,
      areaPaño: resultadoVidrio.area,
      perimetroPaño: resultadoVidrio.perimetro,
      vidrioExterior,
      vidrioInterior,
      precioVidrio: costoVidrio,
      esDvh,
      espesorCamara,
      detallesDvh: resultadoVidrio.detalles
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

export const formatearResultadoPanoFijoRecto = (
  resultado: ResultadoCalculo,
  anchoOriginal: number,
  altoOriginal: number
): string => {
  const esDvh = resultado.vidrios.esDvh || false;

  let seccionDvh = '';
  if (esDvh && resultado.vidrios.detallesDvh) {
    const detalles = resultado.vidrios.detallesDvh;
    const costoPorUnidad =
      detalles.costoRealVidrioExterior +
      detalles.costoRealVidrioInterior +
      detalles.costoRealCamara;

    seccionDvh = `
CÁLCULO DVH:
- Vidrio exterior (${resultado.vidrios.vidrioExterior?.nombre}):
  ${resultado.vidrios.areaPaño.toFixed(3)} m² × $${resultado.vidrios.vidrioExterior?.precioM2.toLocaleString()}
  = $${detalles.costoRealVidrioExterior.toFixed(2)}

- Vidrio interior (${resultado.vidrios.vidrioInterior?.nombre}):
  ${resultado.vidrios.areaPaño.toFixed(3)} m² × $${resultado.vidrios.vidrioInterior?.precioM2.toLocaleString()}
  = $${detalles.costoRealVidrioInterior.toFixed(2)}

- Cámara ${resultado.vidrios.espesorCamara}mm:
  ${resultado.vidrios.perimetroPaño.toFixed(2)} ml × $${getPrecioCamara(resultado.vidrios.espesorCamara || 6).toLocaleString()}
  = $${detalles.costoRealCamara.toFixed(2)}

- COSTO DVH TOTAL: $${costoPorUnidad.toFixed(2)}
`;
  }

  return `
PAÑO FIJO RECTO MODENA CONTRAVIDRIOS RECTOS - ${anchoOriginal}x${altoOriginal} mm
===============================================

MEDIDAS:
- Ancho total: ${anchoOriginal} mm
- Alto total: ${altoOriginal} mm
- Medida de vidrio: ${resultado.vidrios.ancho.toFixed(0)}x${resultado.vidrios.alto.toFixed(0)} mm

DETALLES DE ALUMINIO:
${resultado.detallesAluminio.map(d =>
  `- ${d.nombre}: ${d.cantidad} piezas de ${d.largoPorPieza.toFixed(0)}mm (${d.metrosLineales.toFixed(2)} ml) - ${d.peso.toFixed(2)} kg`
).join('\n')}

PESO TOTAL ALUMINIO: ${resultado.pesoTotalAluminio.toFixed(2)} kg

VIDRIO:
- Tipo: ${esDvh ? 'DVH' : 'Simple'}
- ${resultado.vidrios.vidrioExterior?.nombre}
${esDvh ? `- Interior: ${resultado.vidrios.vidrioInterior?.nombre}` : ''}
- Cantidad: ${resultado.vidrios.cantidad} unidad
- Área total: ${resultado.vidrios.areaTotal.toFixed(3)} m²

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
- SUBTOTAL COSTOS: $${(
    resultado.precios.costoAluminio +
    resultado.precios.costoVidrio +
    resultado.precios.costoAccesorios
  ).toFixed(2)}

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
