// components/Cotizador.tsx
"use client";
import React, { useEffect, useState } from "react";
import { VIDRIOS } from "@/data/vidrios";
import { ACABADOS } from "@/data/acabados";
import {
  calcularVentanaCorrediza2Hojas,
  formatearResultadoModena2Hojas,
  formatearResultadoVentanaConMosquitero,
} from "@/calculadoras/VentanaCorredizaModena2Hojas";
import { calcularPañoFijoModena, formatearResultadoPañoFijo } from "@/calculadoras/PañoFijoModena";
import { ListaPresupuesto } from "@/components/ListaPresupuesto";
import PresupuestoPDF from "@/components/PresupuestoPDF";
import { usePresupuesto } from "@/hooks/usePresupuesto";
import { generarNumeroPresupuesto } from "@/utils/numeracionPresupuestos";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type TipoVentana = "corrediza2hojas" | "pañoFijo";

interface Cliente {
  nombre: string;
  localidad?: string;
  domicilio?: string;
  telefono?: string;
  dni?: string;
  cuit?: string;
  iva?: string;
  iibb?: string;
}

const CLIENTE_VACIO: Cliente = {
  nombre: "",
  localidad: "",
  domicilio: "",
  telefono: "",
  dni: "",
  cuit: "",
  iva: "",
  iibb: "",
};

export default function Cotizador() {
  const [tipoVentana, setTipoVentana] = useState<TipoVentana>("corrediza2hojas");
  const [ancho, setAncho] = useState("1000");
  const [alto, setAlto] = useState("1000");
  const [vidrioExteriorId, setVidrioExteriorId] = useState(4);
  const [vidrioInteriorId, setVidrioInteriorId] = useState(4);
  const [esDvh, setEsDvh] = useState(false);
  const [espesorCamara, setEspesorCamara] = useState(6);
  const [acabadoId, setAcabadoId] = useState("blanco-brillante");
  const [incluirMosquitero, setIncluirMosquitero] = useState(false);
  const [resultadoTexto, setResultadoTexto] = useState("");
  const [cliente, setCliente] = useState<Cliente>(CLIENTE_VACIO);
  const [numeroPresupuesto, setNumeroPresupuesto] = useState("");

  const { ventanas, agregarVentana, eliminarVentana, total, limpiarPresupuesto } = usePresupuesto();

  useEffect(() => {
    setNumeroPresupuesto(generarNumeroPresupuesto());
  }, []);

  useEffect(() => {
    calcularCotizacionAutomatica();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ancho, alto, tipoVentana, vidrioExteriorId, vidrioInteriorId, esDvh, espesorCamara, acabadoId, incluirMosquitero]);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    if (type === "success") toast.success(message, { position: "top-right", autoClose: 2200 });
    else if (type === "error") toast.error(message, { position: "top-right", autoClose: 3000 });
    else toast.info(message, { position: "top-right", autoClose: 2200 });
  };

  const handleClienteChange = (key: keyof Cliente, value: string) => {
    setCliente((prev) => ({ ...prev, [key]: value }));
  };

  const calcularCotizacionAutomatica = () => {
    try {
      const anchoNum = parseFloat(ancho);
      const altoNum = parseFloat(alto);
      if (isNaN(anchoNum) || isNaN(altoNum) || anchoNum <= 0 || altoNum <= 0) {
        setResultadoTexto("");
        return;
      }

      if (tipoVentana === "pañoFijo") {
        const r = calcularPañoFijoModena(anchoNum, altoNum, vidrioExteriorId, vidrioInteriorId, esDvh, espesorCamara, VIDRIOS, acabadoId);
        setResultadoTexto(formatearResultadoPañoFijo(r, anchoNum, altoNum));
      } else {
        const r = calcularVentanaCorrediza2Hojas(
          anchoNum,
          altoNum,
          vidrioExteriorId,
          vidrioInteriorId,
          esDvh,
          espesorCamara,
          VIDRIOS,
          acabadoId,
          incluirMosquitero,
          false
        ) as any;

        if (incluirMosquitero && r.ventana) {
          setResultadoTexto(formatearResultadoVentanaConMosquitero(r as any, anchoNum, altoNum));
        } else {
          setResultadoTexto(formatearResultadoModena2Hojas(r as any, anchoNum, altoNum));
        }
      }
    } catch (err) {
      console.error(err);
      showToast("Error al calcular la cotización", "error");
    }
  };

  // Agregar ventana normal o corrediza (si hay mosquitero, viene en detalle)
  const agregarAlPresupuesto = () => {
    try {
      const anchoNum = parseFloat(ancho);
      const altoNum = parseFloat(alto);
      if (isNaN(anchoNum) || isNaN(altoNum) || anchoNum <= 0 || altoNum <= 0) {
        showToast("Ingrese medidas válidas", "error");
        return;
      }

      let detalles: any;
      let precioConIVA = 0;
      let tipoNombre = "";
      const medidasStr = `${anchoNum}x${altoNum} mm`;

      if (tipoVentana === "pañoFijo") {
        detalles = calcularPañoFijoModena(anchoNum, altoNum, vidrioExteriorId, vidrioInteriorId, esDvh, espesorCamara, VIDRIOS, acabadoId);
        precioConIVA = detalles.precios.precioVentaConIVA;
        tipoNombre = "Paño Fijo";

        agregarVentana({
          tipo: "pañoFijo",
          tipoNombre,
          ancho: anchoNum,
          alto: altoNum,
          medidas: medidasStr,
          descripcion: tipoNombre,
          precio: precioConIVA,
          precioConIVA,
          detalles,
          acabado: ACABADOS.find((a) => a.id === acabadoId) || ACABADOS[0],
        } as any);

        showToast("Paño fijo agregado al presupuesto", "success");
        return;
      }

      // corrediza
      const r = calcularVentanaCorrediza2Hojas(
        anchoNum,
        altoNum,
        vidrioExteriorId,
        vidrioInteriorId,
        esDvh,
        espesorCamara,
        VIDRIOS,
        acabadoId,
        incluirMosquitero,
        false
      ) as any;

      if (incluirMosquitero && r.ventana) {
        detalles = r;
        precioConIVA = r.precioTotalConIVA;
        tipoNombre = "Ventana Corrediza 2 Hojas (con Mosquitero)";
      } else {
        detalles = r;
        precioConIVA = r.precios.precioVentaConIVA;
        tipoNombre = "Ventana Corrediza 2 Hojas";
      }

      agregarVentana({
        tipo: "corrediza2hojas",
        tipoNombre,
        ancho: anchoNum,
        alto: altoNum,
        medidas: medidasStr,
        descripcion: tipoNombre,
        precio: precioConIVA,
        precioConIVA,
        detalles,
        acabado: ACABADOS.find((a) => a.id === acabadoId) || ACABADOS[0],
        incluirMosquitero,
      } as any);

      showToast("Ventana agregada al presupuesto", "success");
    } catch (err) {
      console.error(err);
      showToast("No se pudo agregar al presupuesto", "error");
    }
  };

  // --- Agregar SOLO mosquitero (para corredizas) ---
  const agregarSoloMosquitero = () => {
    try {
      if (tipoVentana !== "corrediza2hojas") {
        showToast("Solo disponible para ventanas corredizas", "error");
        return;
      }

      const anchoNum = parseFloat(ancho);
      const altoNum = parseFloat(alto);
      if (isNaN(anchoNum) || isNaN(altoNum) || anchoNum <= 0 || altoNum <= 0) {
        showToast("Ingrese medidas válidas", "error");
        return;
      }

      // Llamo a la calculadora indicando soloMosquitero = true (último parámetro)
      const resultadoMosquitero = calcularVentanaCorrediza2Hojas(
        anchoNum,
        altoNum,
        vidrioExteriorId,
        vidrioInteriorId,
        esDvh,
        espesorCamara,
        VIDRIOS,
        acabadoId,
        false,
        true
      ) as any;

      const precioConIVA = resultadoMosquitero.precios.precioVentaConIVA;

      agregarVentana({
        tipo: "mosquitero",
        tipoNombre: "Mosquitero Modena",
        ancho: anchoNum,
        alto: altoNum,
        medidas: `${anchoNum}x${altoNum} mm`,
        descripcion: "Mosquitero",
        precio: precioConIVA,
        precioConIVA,
        detalles: resultadoMosquitero,
        acabado: ACABADOS.find((a) => a.id === acabadoId) || ACABADOS[0],
        incluirMosquitero: true,
      } as any);

      showToast("Mosquitero agregado al presupuesto", "success");
    } catch (err) {
      console.error(err);
      showToast("Error al agregar mosquitero", "error");
    }
  };

  const nuevoPresupuesto = () => {
    limpiarPresupuesto();
    setCliente(CLIENTE_VACIO);
    setNumeroPresupuesto(generarNumeroPresupuesto());
    showToast("Nuevo presupuesto iniciado", "info");
  };

  // Copiar al portapapeles (async + fallback)
  const handleCopy = async () => {
    try {
      if (!resultadoTexto) {
        showToast("Nada para copiar", "info");
        return;
      }
      if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
        await navigator.clipboard.writeText(resultadoTexto);
        showToast("Copiado al portapapeles", "success");
        return;
      }

      const textarea = document.createElement("textarea");
      textarea.value = resultadoTexto;
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      const successful = document.execCommand("copy");
      document.body.removeChild(textarea);

      if (successful) showToast("Copiado al portapapeles (fallback)", "success");
      else showToast("No se pudo copiar (fallback)", "error");
    } catch (err) {
      console.error("Error al copiar:", err);
      showToast("Error al copiar al portapapeles", "error");
    }
  };

  return (
    <div style={{ padding: 18 }}>
      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr 360px", gap: 18, height: "85vh" }}>
        {/* Izquierda: controles */}
        <div style={{ overflowY: "auto" }} className="card">
          <h2 className="text-xl font-bold mb-3">Controles</h2>

          <label className="block text-sm font-medium">Tipo de Abertura</label>
          <select className="select mb-3" value={tipoVentana} onChange={(e) => setTipoVentana(e.target.value as TipoVentana)}>
            <option value="corrediza2hojas">Ventana Corrediza 2 Hojas</option>
            <option value="pañoFijo">Paño Fijo</option>
          </select>

          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <div style={{ flex: 1 }}>
              <label className="block text-sm font-medium">Ancho (mm)</label>
              <input className="input" type="number" value={ancho} onChange={(e) => setAncho(e.target.value)} min={100} step={10} />
            </div>
            <div style={{ flex: 1 }}>
              <label className="block text-sm font-medium">Alto (mm)</label>
              <input className="input" type="number" value={alto} onChange={(e) => setAlto(e.target.value)} min={100} step={10} />
            </div>
          </div>

          <label className="block text-sm font-medium">Tipo de Vidrio</label>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <input type="radio" checked={!esDvh} onChange={() => setEsDvh(false)} /> Vidrio simple
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <input type="radio" checked={esDvh} onChange={() => setEsDvh(true)} /> DVH
            </label>
          </div>

          <label className="block text-sm font-medium">Vidrio exterior</label>
          <select className="select mb-3" value={vidrioExteriorId} onChange={(e) => setVidrioExteriorId(Number(e.target.value))}>
            {VIDRIOS.map((v) => (
              <option key={v.id} value={v.id}>
                {v.nombre} - ${v.precioM2.toLocaleString()}/m²
              </option>
            ))}
          </select>

          {esDvh && (
            <>
              <label className="block text-sm font-medium">Vidrio interior</label>
              <select className="select mb-3" value={vidrioInteriorId} onChange={(e) => setVidrioInteriorId(Number(e.target.value))}>
                {VIDRIOS.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.nombre} - ${v.precioM2.toLocaleString()}/m²
                  </option>
                ))}
              </select>

              <label className="block text-sm font-medium">Espesor de cámara</label>
              <select className="select mb-3" value={espesorCamara} onChange={(e) => setEspesorCamara(Number(e.target.value))}>
                <option value={6}>6 mm</option>
                <option value={9}>9 mm</option>
                <option value={12}>12 mm</option>
                <option value={15}>15 mm</option>
              </select>
            </>
          )}

          <label className="block text-sm font-medium">Acabado</label>
          <select className="select mb-3" value={acabadoId} onChange={(e) => setAcabadoId(e.target.value)}>
            {ACABADOS.map((a) => (
              <option key={a.id} value={a.id}>
                {a.color} - ${a.preciokg.toLocaleString()}/kg
              </option>
            ))}
          </select>

          {tipoVentana === "corrediza2hojas" && (
            <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <input type="checkbox" checked={incluirMosquitero} onChange={(e) => setIncluirMosquitero(e.target.checked)} /> Incluir mosquitero
            </label>
          )}

          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button onClick={calcularCotizacionAutomatica} className="btn btn-secondary" style={{ flex: 1 }}>
              Calcular
            </button>
            <button onClick={agregarAlPresupuesto} className="btn btn-primary" style={{ flex: 1 }}>
              Agregar
            </button>
          </div>

          {tipoVentana === "corrediza2hojas" && (
            <div style={{ marginTop: 8 }}>
              <button onClick={agregarSoloMosquitero} className="btn btn-ghost w-full">
                Agregar solo mosquitero
              </button>
            </div>
          )}

          <hr style={{ margin: "12px 0" }} />

          <h3 className="text-lg font-bold mb-2">Cliente</h3>
          <input className="input mb-2" placeholder="Nombre" value={cliente.nombre} onChange={(e) => handleClienteChange("nombre", e.target.value)} />
          <input className="input mb-2" placeholder="Domicilio" value={cliente.domicilio} onChange={(e) => handleClienteChange("domicilio", e.target.value)} />
          <input className="input mb-2" placeholder="Teléfono" value={cliente.telefono} onChange={(e) => handleClienteChange("telefono", e.target.value)} />

          <div style={{ height: 12 }} />
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => { setCliente(CLIENTE_VACIO); showToast("Formulario cliente limpiado", "info"); }} className="btn btn-secondary" style={{ flex: 1 }}>
              Limpiar
            </button>
            <button onClick={() => { showToast("Cliente guardado en memoria temporal", "success"); }} className="btn btn-primary" style={{ flex: 1 }}>
              Guardar
            </button>
          </div>
        </div>

        {/* Centro: Resultado */}
        <div style={{ overflowY: "auto" }} className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <h2 className="text-xl font-bold">Resultado</h2>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={handleCopy} className="btn btn-secondary">Copiar</button>
              <button onClick={() => window.print()} className="btn btn-secondary">Imprimir</button>
            </div>
          </div>

          <div style={{ background: "var(--secondary)", padding: 12, borderRadius: 8, minHeight: 200 }}>
            <pre className="whitespace-pre-wrap" style={{ whiteSpace: "pre-wrap", fontSize: 13 }}>{resultadoTexto || "Aquí aparecerá el resultado de la cotización"}</pre>
          </div>

          <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
            {/* estos botones pueden quedarse como accesos rápidos; el PDF real se genera desde la columna derecha */}
            <button onClick={calcularCotizacionAutomatica} className="btn btn-secondary">Actualizar</button>
          </div>
        </div>

        {/* Derecha: Presupuesto */}
        <div style={{ overflowY: "auto" }} className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <h2 className="text-xl font-bold">Presupuesto</h2>
            <div className="text-sm">N° <strong>{numeroPresupuesto}</strong></div>
          </div>

          <ListaPresupuesto ventanas={ventanas} onEliminarVentana={eliminarVentana} total={total} />

          <div style={{ marginTop: 12 }}>
            <PresupuestoPDF ventanas={ventanas as any} cliente={{ nombre: cliente.nombre || "", domicilio: cliente.domicilio || "",localidad: cliente.localidad || "", telefono: cliente.telefono || "", dni: cliente.dni || "", cuit: cliente.cuit || "", iva: cliente.iva || "", iibb: cliente.iibb || "" }} numeroPresupuesto={numeroPresupuesto} />
            <div style={{ height: 8 }} />
            <button onClick={nuevoPresupuesto} className="btn btn-secondary w-full">Nuevo Presupuesto</button>
            <div style={{ height: 8 }} />
            <button onClick={() => { /* si exportaste reiniciarContador lo podés llamar acá */ }} className="btn btn-secondary w-full">Reiniciar Numeración</button>
          </div>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
}
