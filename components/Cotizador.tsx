// components/Cotizador.tsx
"use client";
import React, { useState } from "react";
import { calcularVentanaCorrediza2Hojas, formatearResultadoModena2Hojas } from "@/calculadoras/VentanaCorredizaModena2Hojas";
import { calcularPañoFijoModena, formatearResultadoPañoFijo } from "@/calculadoras/PañoFijoModena";
import { VIDRIOS, CAMARAS } from "@/data/vidrios";
import { ACABADOS } from "@/data/acabados";
import PresupuestoPDF from "./PresupuestoPDF";
import PresupuestoDetalladoPDF from "./PresupuestoDetalladoPDF";

type TipoVentana = 'corrediza2hojas' | 'pañoFijo';

interface VentanaAcumulada {
  id: string;
  tipo: TipoVentana;
  tipoNombre: string;
  ancho: number;
  alto: number;
  medidas: string;
  precioConIVA: number;
  detalles: any;
  timestamp: number;
  acabado: {
    id: string;
    color: string;
    preciokg: number;
  };
}

// Función para generar número de presupuesto
const generarNumeroPresupuesto = (): string => {
  const fecha = new Date();
  const año = fecha.getFullYear();
  const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
  const dia = fecha.getDate().toString().padStart(2, '0');
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  
  return `P-${año}${mes}${dia}-${random}`;
};

export default function Cotizador() {
  const [tipoVentana, setTipoVentana] = useState<TipoVentana>('corrediza2hojas');
  const [ancho, setAncho] = useState("");
  const [alto, setAlto] = useState("");
  const [vidrioExteriorId, setVidrioExteriorId] = useState(4);
  const [vidrioInteriorId, setVidrioInteriorId] = useState(4);
  const [esDvh, setEsDvh] = useState(false);
  const [espesorCamara, setEspesorCamara] = useState(6);
  const [acabadoId, setAcabadoId] = useState(ACABADOS[0].id);
  const [resultado, setResultado] = useState("");
  const [ventanasAcumuladas, setVentanasAcumuladas] = useState<VentanaAcumulada[]>([]);
  const [mostrarDetallesId, setMostrarDetallesId] = useState<string | null>(null);
  
  // Estados para datos del cliente
  const [cliente, setCliente] = useState({
    nombre: '',
    domicilio: '',
    telefono: ''
  });
  
  const [numeroPresupuesto, setNumeroPresupuesto] = useState(generarNumeroPresupuesto());

  const tiposVentanaNombres = {
    'corrediza2hojas': 'Ventana Corrediza 2 Hojas',
    'pañoFijo': 'Paño Fijo Modena'
  };

  const cotizar = () => {
    const anchoNum = Number(ancho);
    const altoNum = Number(alto);
    
    if (!anchoNum || !altoNum) {
      setResultado("❌ Por favor ingrese ancho y alto válidos en mm");
      return;
    }

    try {
      let calculo;
      let resultadoFormateado;

      switch (tipoVentana) {
        case 'corrediza2hojas':
          calculo = calcularVentanaCorrediza2Hojas(
            anchoNum, altoNum, vidrioExteriorId, vidrioInteriorId,
            esDvh, espesorCamara, VIDRIOS, acabadoId
          );
          resultadoFormateado = formatearResultadoModena2Hojas(calculo, anchoNum, altoNum);
          break;

        case 'pañoFijo':
          calculo = calcularPañoFijoModena(
            anchoNum, altoNum, vidrioExteriorId, vidrioInteriorId,
            esDvh, espesorCamara, VIDRIOS, acabadoId
          );
          resultadoFormateado = formatearResultadoPañoFijo(calculo, anchoNum, altoNum);
          break;

        default:
          throw new Error('Tipo de ventana no válido');
      }

      setResultado(resultadoFormateado);
    } catch (error) {
      setResultado("❌ Error en el cálculo. Verifique los datos ingresados.");
    }
  };

  const agregarAlPresupuesto = () => {
    const anchoNum = Number(ancho);
    const altoNum = Number(alto);
    
    if (!anchoNum || !altoNum) {
      alert("❌ Por favor ingrese ancho y alto válidos antes de agregar al presupuesto");
      return;
    }

    try {
      let calculo;
      const acabadoSeleccionado = ACABADOS.find(a => a.id === acabadoId) || ACABADOS[0];

      switch (tipoVentana) {
        case 'corrediza2hojas':
          calculo = calcularVentanaCorrediza2Hojas(
            anchoNum, altoNum, vidrioExteriorId, vidrioInteriorId,
            esDvh, espesorCamara, VIDRIOS, acabadoId
          );
          break;

        case 'pañoFijo':
          calculo = calcularPañoFijoModena(
            anchoNum, altoNum, vidrioExteriorId, vidrioInteriorId,
            esDvh, espesorCamara, VIDRIOS, acabadoId
          );
          break;

        default:
          throw new Error('Tipo de ventana no válido');
      }

      const nuevaVentana: VentanaAcumulada = {
        id: Date.now().toString(),
        tipo: tipoVentana,
        tipoNombre: tiposVentanaNombres[tipoVentana],
        ancho: anchoNum,
        alto: altoNum,
        medidas: `${anchoNum}x${altoNum} mm`,
        precioConIVA: calculo.precios.precioVentaConIVA,
        detalles: calculo,
        timestamp: Date.now(),
        acabado: {
          id: acabadoSeleccionado.id,
          color: acabadoSeleccionado.color,
          preciokg: acabadoSeleccionado.preciokg
        }
      };

      setVentanasAcumuladas(prev => [...prev, nuevaVentana]);
      setResultado(""); // Limpiar resultado anterior
      
    } catch (error) {
      alert("❌ Error al agregar al presupuesto. Verifique los datos.");
    }
  };

  const eliminarVentana = (id: string) => {
    setVentanasAcumuladas(prev => prev.filter(v => v.id !== id));
  };

  const toggleDetalles = (id: string) => {
    setMostrarDetallesId(mostrarDetallesId === id ? null : id);
  };

  const getTotalPresupuesto = () => {
    return ventanasAcumuladas.reduce((total, ventana) => total + ventana.precioConIVA, 0);
  };

  const formatearDetallesVentana = (ventana: VentanaAcumulada): string => {
    switch (ventana.tipo) {
      case 'corrediza2hojas':
        return formatearResultadoModena2Hojas(ventana.detalles, ventana.ancho, ventana.alto);
      case 'pañoFijo':
        return formatearResultadoPañoFijo(ventana.detalles, ventana.ancho, ventana.alto);
      default:
        return "Tipo de ventana no reconocido";
    }
  };

  const limpiarPresupuesto = () => {
    setVentanasAcumuladas([]);
    setNumeroPresupuesto(generarNumeroPresupuesto());
  };

  const actualizarNumeroPresupuesto = () => {
    setNumeroPresupuesto(generarNumeroPresupuesto());
  };

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Cotizador de Aberturas</h1>
        <p className="text-muted">Sistema profesional de cálculo y presupuesto</p>
      </div>

      <div className="space-y-6">
        {/* Datos del Cliente */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">👤 Datos del Cliente</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Nombre y Apellido</label>
              <input
                type="text"
                value={cliente.nombre}
                onChange={(e) => setCliente({...cliente, nombre: e.target.value})}
                className="input"
                placeholder="Ingrese nombre completo"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Domicilio</label>
              <input
                type="text"
                value={cliente.domicilio}
                onChange={(e) => setCliente({...cliente, domicilio: e.target.value})}
                className="input"
                placeholder="Ingrese domicilio"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Teléfono</label>
              <input
                type="text"
                value={cliente.telefono}
                onChange={(e) => setCliente({...cliente, telefono: e.target.value})}
                className="input"
                placeholder="Ingrese teléfono"
              />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold mb-2">Número de Presupuesto</label>
              <input
                type="text"
                value={numeroPresupuesto}
                onChange={(e) => setNumeroPresupuesto(e.target.value)}
                className="input"
              />
            </div>
            <button 
              onClick={actualizarNumeroPresupuesto}
              className="btn btn-secondary mt-6"
            >
              🔄 Nuevo Número
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Panel de Configuración */}
          <div className="space-y-6">
            <div className="card card-hover">
              <h2 className="text-xl font-semibold mb-4">⚙️ Configurar Abertura</h2>
              
              <div className="space-y-4">
                {/* Tipo de Abertura */}
                <div>
                  <label className="block text-sm font-semibold mb-2">Tipo de Abertura</label>
                  <select
                    value={tipoVentana}
                    onChange={(e) => setTipoVentana(e.target.value as TipoVentana)}
                    className="select"
                  >
                    <option value="corrediza2hojas">Ventana Corrediza Modena 2 Hojas</option>
                    <option value="pañoFijo">Paño Fijo Modena</option>
                  </select>
                </div>

                {/* Medidas */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Ancho (mm)</label>
                    <input
                      type="number"
                      value={ancho}
                      onChange={(e) => setAncho(e.target.value)}
                      className="input"
                      placeholder="1200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Alto (mm)</label>
                    <input
                      type="number"
                      value={alto}
                      onChange={(e) => setAlto(e.target.value)}
                      className="input"
                      placeholder="1500"
                    />
                  </div>
                </div>

                {/* Acabado */}
                <div>
                  <label className="block text-sm font-semibold mb-2">🎨 Acabado del Aluminio</label>
                  <select
                    value={acabadoId}
                    onChange={(e) => setAcabadoId(e.target.value)}
                    className="select"
                  >
                    {ACABADOS.map(acabado => (
                      <option key={acabado.id} value={acabado.id}>
                        {acabado.color} - ${acabado.preciokg.toLocaleString()}/kg
                      </option>
                    ))}
                  </select>
                </div>

                {/* DVH */}
                <div className="flex items-center space-x-2 p-3 bg-secondary rounded">
                  <input
                    type="checkbox"
                    id="esDvh"
                    checked={esDvh}
                    onChange={(e) => setEsDvh(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <label htmlFor="esDvh" className="text-sm font-medium">
                    🔲 ¿Es Doble Vidriado Hermético (DVH)?
                  </label>
                </div>

                {/* Vidrio Exterior */}
                <div>
                  <label className="block text-sm font-semibold mb-2">🔍 Vidrio Exterior</label>
                  <select
                    value={vidrioExteriorId}
                    onChange={(e) => setVidrioExteriorId(Number(e.target.value))}
                    className="select"
                  >
                    {VIDRIOS.map(vidrio => (
                      <option key={vidrio.id} value={vidrio.id}>
                        {vidrio.nombre} - ${vidrio.precioM2.toLocaleString()}/m²
                      </option>
                    ))}
                  </select>
                </div>

                {/* Configuración DVH */}
                {esDvh && (
                  <div className="space-y-4 p-3 bg-secondary rounded">
                    <div>
                      <label className="block text-sm font-semibold mb-2">🔍 Vidrio Interior</label>
                      <select
                        value={vidrioInteriorId}
                        onChange={(e) => setVidrioInteriorId(Number(e.target.value))}
                        className="select"
                      >
                        {VIDRIOS.map(vidrio => (
                          <option key={vidrio.id} value={vidrio.id}>
                            {vidrio.nombre} - ${vidrio.precioM2.toLocaleString()}/m²
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">📏 Espesor de Cámara</label>
                      <select
                        value={espesorCamara}
                        onChange={(e) => setEspesorCamara(Number(e.target.value))}
                        className="select"
                      >
                        {CAMARAS.map(camara => (
                          <option key={camara.espesor} value={camara.espesor}>
                            {camara.espesor}mm - ${camara.precioMl.toLocaleString()}/ml
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Botones de Acción */}
              <div className="flex gap-3 mt-6">
                <button onClick={cotizar} className="btn btn-primary flex-1">
                  🧮 Calcular
                </button>
                <button onClick={agregarAlPresupuesto} className="btn btn-secondary flex-1">
                  ➕ Agregar al Presupuesto
                </button>
              </div>
            </div>

            {/* Resultado del Cálculo */}
            {resultado && (
              <div className="card">
                <h3 className="text-lg font-semibold mb-3">📊 Resultado del Cálculo</h3>
                <pre className="whitespace-pre-wrap text-sm bg-secondary p-3 rounded border max-h-80 overflow-y-auto">
                  {resultado}
                </pre>
              </div>
            )}
          </div>

          {/* Panel del Presupuesto */}
          <div className="space-y-6">
            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">📋 Presupuesto Actual</h2>
                {ventanasAcumuladas.length > 0 && (
                  <button onClick={limpiarPresupuesto} className="btn btn-destructive btn-sm">
                    🗑️ Limpiar
                  </button>
                )}
              </div>
              
              {ventanasAcumuladas.length === 0 ? (
                <div className="text-center py-8 text-muted">
                  <div className="text-4xl mb-2">📝</div>
                  <p>No hay ventanas en el presupuesto</p>
                  <p className="text-sm">Agrega ventanas usando el panel de configuración</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {ventanasAcumuladas.map(ventana => (
                      <div key={ventana.id} className="card card-hover">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold">{ventana.tipoNombre}</span>
                              <span className="badge">{ventana.acabado.color}</span>
                            </div>
                            <div className="text-sm text-muted mb-2">{ventana.medidas}</div>
                            <div className="text-lg font-bold text-green-600">
                              ${ventana.precioConIVA.toFixed(2)}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => toggleDetalles(ventana.id)}
                              className="btn btn-secondary btn-sm"
                            >
                              {mostrarDetallesId === ventana.id ? '👁️ Ocultar' : '👁️ Ver'}
                            </button>
                            <button
                              onClick={() => eliminarVentana(ventana.id)}
                              className="btn btn-destructive btn-sm"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                        
                        {mostrarDetallesId === ventana.id && (
                          <div className="mt-3 p-3 bg-secondary rounded">
                            <pre className="whitespace-pre-wrap text-xs max-h-40 overflow-y-auto">
                              {formatearDetallesVentana(ventana)}
                            </pre>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Resumen y Acciones */}
                  <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between items-center font-bold text-lg mb-4">
                      <span>Total Presupuesto:</span>
                      <span className="text-green-600">${getTotalPresupuesto().toFixed(2)}</span>
                    </div>
                    
                    // En la sección de acciones del presupuesto, reemplazar por:
<div className="space-y-2">
  <PresupuestoPDF 
    ventanas={ventanasAcumuladas} 
    cliente={cliente}
    numeroPresupuesto={numeroPresupuesto}
  />
  <PresupuestoDetalladoPDF 
    ventanas={ventanasAcumuladas} 
    cliente={cliente}
    numeroPresupuesto={numeroPresupuesto}
  />
</div>
                  </div>
                </>
              )}
            </div>

            {/* Estadísticas Rápidas */}
            {ventanasAcumuladas.length > 0 && (
              <div className="card">
                <h3 className="font-semibold mb-3">📈 Resumen</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted">Total Ventanas</div>
                    <div className="font-semibold">{ventanasAcumuladas.length}</div>
                  </div>
                  <div>
                    <div className="text-muted">Peso Total Aluminio</div>
                    <div className="font-semibold">
                      {ventanasAcumuladas.reduce((total, v) => total + v.detalles.pesoTotalAluminio, 0).toFixed(2)} kg
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}