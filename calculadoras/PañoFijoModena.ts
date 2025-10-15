// calculadoras/PañoFijoModena.ts
import { PERFILES } from '@/data/perfiles';
import { TipoVidrio, CAMARAS } from '@/data/vidrios';
import { ACCESORIOS } from '@/data/accesorios';
import { aplicarPorcentaje, aplicarIVA, getPorcentaje } from '@/data/porcentajes';
import { calcularCostoVidrio, CalculoVidrioResult } from '@/utils/calculosVidrios';
import { ResultadoCalculo } from './VentanaCorredizaModena2Hojas';
import { ACABADOS } from '@/data/acabados';


// Función para calcular accesorios específicos de Paño Fijo
const calcularAccesoriosPañoFijo = (ancho: number, alto: number) => {
  const perimetro = 2 * (ancho + alto);
  const perimetroM = perimetro / 1000;
  
  const cantidades = [
    { id: 'MT88', cantidad: Math.ceil(perimetroM * 4) }, // Tacos reguladores
    { id: 'TORNILLO_PARKER', cantidad: Math.ceil(perimetroM * 8) }, // Tornillos
    { id: 'MB69', cantidad: perimetroM }, // Burlete marco-premarco
    { id: 'MC14', cantidad: perimetroM }, // Felpa
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

export const calcularPañoFijoModena = (
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
  
  if (!vidrioExterior) throw new Error('Tipo de vidrio no válido');

  // Determinar prefijo de IDs según si es DVH o no
  const prefijoId = esDvh ? 3 : 1;
  
  // Perfiles para paño fijo (simplificado - necesitarás ajustar según tus perfiles reales)
  const perfiles = {
    marcoSuperior: PERFILES.find(p => p.id === 1200)!, // Usando mismo perfil que corrediza por ahora
    marcoInferior: PERFILES.find(p => p.id === 1200)!,
    marcoLateral: PERFILES.find(p => p.id === 1201)!,
  };

  // Cálculos de aluminio para paño fijo
  const calculos = {
    marcoSuperior: {
      largoPorPieza: ancho,
      cantidad: 1,
      metrosLineales: ancho / 1000,
      peso: (ancho / 1000) * perfiles.marcoSuperior.pesoKgMl
    },
    marcoInferior: {
      largoPorPieza: ancho,
      cantidad: 1,
      metrosLineales: ancho / 1000,
      peso: (ancho / 1000) * perfiles.marcoInferior.pesoKgMl
    },
    marcoLateral: {
      largoPorPieza: alto,
      cantidad: 2,
      metrosLineales: (alto * 2) / 1000,
      peso: ((alto * 2) / 1000) * perfiles.marcoLateral.pesoKgMl
    }
  };

  const detallesAluminio = [
    { perfilId: perfiles.marcoSuperior.id, nombre: 'Marco Superior', ...calculos.marcoSuperior },
    { perfilId: perfiles.marcoInferior.id, nombre: 'Marco Inferior', ...calculos.marcoInferior },
    { perfilId: perfiles.marcoLateral.id, nombre: 'Marco Lateral', ...calculos.marcoLateral }
  ];

  const pesoTotalAluminio = detallesAluminio.reduce((total, detalle) => total + detalle.peso, 0);

  // CÁLCULO DE VIDRIOS - 1 UNIDAD (simple o DVH)
  const anchoVidrioPaño = ancho - 40; // Ajustar según sistema Modena
  const altoVidrioPaño = alto - 40;   // Ajustar según sistema Modena

  const resultadoVidrio: CalculoVidrioResult = calcularCostoVidrio(
    anchoVidrioPaño,
    altoVidrioPaño,
    vidrioExterior,
    esDvh ? (vidrioInterior || vidrioExterior) : vidrioExterior,
    esDvh,
    espesorCamara
  );

  // Cálculo de accesorios
  const accesoriosLista = calcularAccesoriosPañoFijo(ancho, alto);
  const costoAccesorios = accesoriosLista.reduce((total, item) => total + item.precioTotal, 0);

  // CÁLCULO DE PRECIOS CON GANANCIAS INDIVIDUALES
  const costoAluminio = pesoTotalAluminio * precioAluminioKg;
  const costoVidrio = resultadoVidrio.costoReal;

  // Aplicar ganancias individuales
  const gananciaVidrio = getPorcentaje('vidrio');
  const gananciaAluminio = getPorcentaje('aluminio');
  const gananciaAccesorios = getPorcentaje('accesorios');

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
      cantidad: 1,
      areaTotal: resultadoVidrio.area,
      areaPaño: resultadoVidrio.area,
      perimetroPaño: resultadoVidrio.perimetro,
      vidrioExterior,
      vidrioInterior: esDvh ? vidrioInterior : undefined,
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

export const formatearResultadoPañoFijo = (resultado: ResultadoCalculo, anchoOriginal: number, altoOriginal: number): string => {
  const esDvh = resultado.vidrios.esDvh || false;
  
  let seccionDvh = '';
  if (esDvh && resultado.vidrios.detallesDvh) {
    const detalles = resultado.vidrios.detallesDvh;
    seccionDvh = `
CÁLCULO DVH:
- Vidrio exterior (${resultado.vidrios.vidrioExterior?.nombre}): 
  ${resultado.vidrios.areaPaño.toFixed(3)} m² × $${resultado.vidrios.vidrioExterior?.precioM2.toLocaleString()} = $${detalles.costoRealVidrioExterior.toFixed(2)}
- Vidrio interior (${resultado.vidrios.vidrioInterior?.nombre}): 
  ${resultado.vidrios.areaPaño.toFixed(3)} m² × $${resultado.vidrios.vidrioInterior?.precioM2.toLocaleString()} = $${detalles.costoRealVidrioInterior.toFixed(2)}
- Cámara ${resultado.vidrios.espesorCamara}mm: 
  ${resultado.vidrios.perimetroPaño.toFixed(2)} ml × $${CAMARAS.find(c => c.espesor === resultado.vidrios.espesorCamara)?.precioMl.toLocaleString() || '7000'} = $${detalles.costoRealCamara.toFixed(2)}
`;
  }

  return `
PAÑO FIJO MODENA - ${anchoOriginal}x${altoOriginal} mm
=============================================

MEDIDAS TOTALES:
- Ancho total: ${anchoOriginal} mm
- Alto total: ${altoOriginal} mm
- Medidas de vidrio: ${resultado.vidrios.ancho.toFixed(0)}x${resultado.vidrios.alto.toFixed(0)} mm

DETALLES DE ALUMINIO:
${resultado.detallesAluminio.map(d => 
  `- ${d.nombre}: ${d.cantidad} piezas de ${d.largoPorPieza.toFixed(0)}mm (${d.metrosLineales.toFixed(2)} ml) - ${d.peso.toFixed(2)} kg`
).join('\n')}

PESO TOTAL ALUMINIO: ${resultado.pesoTotalAluminio.toFixed(2)} kg

VIDRIOS:
- Tipo: ${esDvh ? 'DVH' : 'Simple'}
- ${esDvh ? `Exterior: ${resultado.vidrios.vidrioExterior?.nombre}` : resultado.vidrios.vidrioExterior?.nombre}
- ${esDvh ? `Interior: ${resultado.vidrios.vidrioInterior?.nombre}` : ''}
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