import React, { useState } from "react";
import { calcularVentanaCorrediza2Hojas, formatearResultadoModena2Hojas } from "@/calculadoras/VentanaCorredizaModena2Hojas";
import { VIDRIOS, CAMARAS } from "@/data/vidrios";

export default function Cotizador() {
  const [ancho, setAncho] = useState("");
  const [alto, setAlto] = useState("");
  const [vidrioExteriorId, setVidrioExteriorId] = useState(4);
  const [vidrioInteriorId, setVidrioInteriorId] = useState(4);
  const [esDvh, setEsDvh] = useState(false);
  const [espesorCamara, setEspesorCamara] = useState(6);
  const [resultado, setResultado] = useState<string>("");

  const cotizar = () => {
    const anchoNum = Number(ancho);
    const altoNum = Number(alto);
    
    if (!anchoNum || !altoNum) {
      setResultado("Por favor ingrese ancho y alto válidos en mm");
      return;
    }

    try {
      const calculo = calcularVentanaCorrediza2Hojas(
        anchoNum, 
        altoNum, 
        vidrioExteriorId,
        vidrioInteriorId,
        esDvh,
        espesorCamara,
        VIDRIOS
      );
const resultadoFormateado = formatearResultadoModena2Hojas(calculo, anchoNum, altoNum);      setResultado(resultadoFormateado);
    } catch (error) {
      setResultado("Error en el cálculo. Verifique los datos ingresados.");
    }
  };


  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Cotizador - Ventana Corrediza Modena 2 Hojas</h2>
      
      <div className="space-y-3 mb-4">
        <div>
          <label className="block mb-1">Ancho (mm):</label>
          <input
            type="number"
            value={ancho}
            onChange={(e) => setAncho(e.target.value)}
            className="border p-2 w-full rounded"
            placeholder="Ej: 1200"
          />
        </div>
        
        <div>
          <label className="block mb-1">Alto (mm):</label>
          <input
            type="number"
            value={alto}
            onChange={(e) => setAlto(e.target.value)}
            className="border p-2 w-full rounded"
            placeholder="Ej: 1500"
          />
        </div>

        {/* Checkbox para DVH */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="esDvh"
            checked={esDvh}
            onChange={(e) => setEsDvh(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="esDvh">¿Es Doble Vidriado Hermético (DVH)?</label>
        </div>
        
        {/* Selector de tipo de vidrio */}
        <div>
          <label className="block mb-1">Vidrio Exterior:</label>
          <select
            value={vidrioExteriorId}
            onChange={(e) => setVidrioExteriorId(Number(e.target.value))}
            className="border p-2 w-full rounded"
          >
            {VIDRIOS.map(vidrio => (
              <option key={vidrio.id} value={vidrio.id}>
                {vidrio.nombre} - ${vidrio.precioM2.toLocaleString()}/m²
              </option>
            ))}
          </select>
        </div>

        {/* Selector de vidrio interior (solo visible si es DVH) */}
        {esDvh && (
          <div>
            <label className="block mb-1">Vidrio Interior:</label>
            <select
              value={vidrioInteriorId}
              onChange={(e) => setVidrioInteriorId(Number(e.target.value))}
              className="border p-2 w-full rounded"
            >
              {VIDRIOS.map(vidrio => (
                <option key={vidrio.id} value={vidrio.id}>
                  {vidrio.nombre} - ${vidrio.precioM2.toLocaleString()}/m²
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Selector de espesor de cámara (solo visible si es DVH) */}
        {esDvh && (
          <div>
            <label className="block mb-1">Espesor de Cámara:</label>
            <select
              value={espesorCamara}
              onChange={(e) => setEspesorCamara(Number(e.target.value))}
              className="border p-2 w-full rounded"
            >
              {CAMARAS.map(camara => (
                <option key={camara.espesor} value={camara.espesor}>
                  {camara.espesor}mm - ${camara.precioMl.toLocaleString()}/ml
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <button
        onClick={cotizar}
        className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 w-full font-semibold"
      >
        Calcular Cotización
      </button>

      {resultado && (
        <div className="mt-6 p-4 bg-gray-100 rounded border">
          <h3 className="text-lg font-semibold mb-3 text-blue-800">Resultado del Cálculo:</h3>
          <pre className="whitespace-pre-wrap text-sm bg-white p-3 rounded border">
            {resultado}
          </pre>
        </div>
      )}
    </div>
  );
}