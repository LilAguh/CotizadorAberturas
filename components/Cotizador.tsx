// components/Cotizador.tsx - VERSIÓN FINAL
"use client";
import { useState, useEffect } from 'react';
import { VIDRIOS } from '@/data/vidrios';
import { ACABADOS } from '@/data/acabados';
import { calcularVentanaCorrediza2Hojas, formatearResultadoModena2Hojas, formatearResultadoVentanaConMosquitero, ResultadoCalculo, ResultadoVentanaConMosquitero, formatearResultadoSoloMosquitero } from '@/calculadoras/VentanaCorredizaModena2Hojas';
import { calcularPañoFijoModena, formatearResultadoPañoFijo } from '@/calculadoras/PañoFijoModena';
import { ListaPresupuesto } from './ListaPresupuesto';
import PresupuestoPDF from './PresupuestoPDF';
import PresupuestoDetalladoPDF from './PresupuestoDetalladoPDF';
import { usePresupuesto } from '@/hooks/usePresupuesto';
import { generarNumeroPresupuesto } from '@/utils/numeracionPresupuestos';
import ToastNotification from './ToastNotification';

type TipoVentana = 'corrediza2hojas' | 'pañoFijo';

interface Cliente {
  nombre: string;
  localidad: string;
  domicilio: string;
  telefono: string;
  dni: string;
  cuit: string;
  iva: string;
  iibb: string;
}

const CLIENTE_VACIO: Cliente = {
  nombre: '', localidad: '', domicilio: '', telefono: '',
  dni: '', cuit: '', iva: '', iibb: ''
};

type ClienteKey = keyof Cliente;

// Componentes movidos FUERA del componente principal
const SelectorTipoVentana = ({ tipoVentana, setTipoVentana }: { 
  tipoVentana: TipoVentana; 
  setTipoVentana: (tipo: TipoVentana) => void;
}) => (
  <div className="mb-4">
    <label className="block text-sm font-medium mb-2">Tipo de Abertura</label>
    <select 
      value={tipoVentana} 
      onChange={(e) => setTipoVentana(e.target.value as TipoVentana)}
      className="select"
    >
      <option value="corrediza2hojas">Ventana Corrediza 2 Hojas</option>
      <option value="pañoFijo">Paño Fijo</option>
    </select>
  </div>
);

const InputMedidas = ({ ancho, setAncho, alto, setAlto }: {
  ancho: string;
  setAncho: (value: string) => void;
  alto: string;
  setAlto: (value: string) => void;
}) => (
  <div className="grid grid-cols-2 gap-4 mb-4">
    <div>
      <label className="block text-sm font-medium mb-1">Ancho (mm)</label>
      <input
        type="number"
        value={ancho}
        onChange={(e) => setAncho(e.target.value)}
        className="input"
        min="100"
        step="10"
      />
    </div>
    <div>
      <label className="block text-sm font-medium mb-1">Alto (mm)</label>
      <input
        type="number"
        value={alto}
        onChange={(e) => setAlto(e.target.value)}
        className="input"
        min="100"
        step="10"
      />
    </div>
  </div>
);

const SelectorAcabado = ({ acabadoId, setAcabadoId }: {
  acabadoId: string;
  setAcabadoId: (value: string) => void;
}) => (
  <div className="mb-4">
    <label className="block text-sm font-medium mb-1">Acabado</label>
    <select value={acabadoId} onChange={(e) => setAcabadoId(e.target.value)} className="select">
      {ACABADOS.map(acabado => (
        <option key={acabado.id} value={acabado.id}>
          {acabado.color} - ${acabado.preciokg.toLocaleString()}/kg
        </option>
      ))}
    </select>
  </div>
);

const ConfiguracionVidrio = ({ 
  tipoVentana, esDvh, setEsDvh, vidrioExteriorId, setVidrioExteriorId, 
  vidrioInteriorId, setVidrioInteriorId, espesorCamara, setEspesorCamara 
}: {
  tipoVentana: TipoVentana;
  esDvh: boolean;
  setEsDvh: (value: boolean) => void;
  vidrioExteriorId: number;
  setVidrioExteriorId: (value: number) => void;
  vidrioInteriorId: number;
  setVidrioInteriorId: (value: number) => void;
  espesorCamara: number;
  setEspesorCamara: (value: number) => void;
}) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-2">Tipo de Vidrio</label>
      <div className="flex items-center gap-4 mb-3">
        <label className="flex items-center">
          <input type="radio" checked={!esDvh} onChange={() => setEsDvh(false)} className="mr-2" />
          Vidrio Simple
        </label>
        <label className="flex items-center">
          <input type="radio" checked={esDvh} onChange={() => setEsDvh(true)} className="mr-2" />
          DVH
        </label>
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">
          {esDvh ? 'Vidrio Exterior' : 'Vidrio'}
        </label>
        <select value={vidrioExteriorId} onChange={(e) => setVidrioExteriorId(Number(e.target.value))} className="select">
          {VIDRIOS.map(vidrio => (
            <option key={vidrio.id} value={vidrio.id}>
              {vidrio.nombre} - ${vidrio.precioM2.toLocaleString()}/m²
            </option>
          ))}
        </select>
      </div>

      {esDvh && (
        <>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Vidrio Interior</label>
            <select value={vidrioInteriorId} onChange={(e) => setVidrioInteriorId(Number(e.target.value))} className="select">
              {VIDRIOS.map(vidrio => (
                <option key={vidrio.id} value={vidrio.id}>
                  {vidrio.nombre} - ${vidrio.precioM2.toLocaleString()}/m²
                </option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Espesor de Cámara</label>
            <select value={espesorCamara} onChange={(e) => setEspesorCamara(Number(e.target.value))} className="select">
              <option value={6}>6 mm</option>
              <option value={9}>9 mm</option>
              <option value={12}>12 mm</option>
              <option value={15}>15 mm</option>
            </select>
          </div>
        </>
      )}
    </div>
  );
};

const OpcionesMosquitero = ({ 
  tipoVentana, 
  incluirMosquitero, 
  setIncluirMosquitero,
  onAgregarSoloMosquitero 
}: {
  tipoVentana: TipoVentana;
  incluirMosquitero: boolean;
  setIncluirMosquitero: (value: boolean) => void;
  onAgregarSoloMosquitero: () => void;
}) => {
  // Solo mostrar para ventanas corredizas
  if (tipoVentana !== 'corrediza2hojas') return null;

  return (
    <div className="mb-4 space-y-3">
      <div className="flex items-center gap-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={incluirMosquitero}
            onChange={(e) => setIncluirMosquitero(e.target.checked)}
            className="mr-2"
          />
          Incluir Mosquitero con la ventana
        </label>
      </div>
      
      <div className="border-t pt-3">
        <button 
          type="button"
          onClick={onAgregarSoloMosquitero}
          className="btn btn-secondary btn-sm w-full"
        >
          ➕ Agregar Solo el Mosquitero
        </button>
        <p className="text-xs text-gray-500 mt-1 text-center">
          Solo el mosquitero para esta ventana corrediza
        </p>
      </div>
    </div>
  );
};

const BotonesAccion = ({ 
  resultado, 
  agregarAlPresupuesto,
  tipoVentana 
}: {
  resultado: ResultadoCalculo | ResultadoVentanaConMosquitero | null;
  agregarAlPresupuesto: () => void;
  tipoVentana: TipoVentana;
}) => (
  <div className="grid grid-cols-1 gap-4">
    <button 
      type="button" 
      onClick={agregarAlPresupuesto} 
      disabled={!resultado}
      className="btn btn-primary disabled:opacity-50"
    >
      {tipoVentana === 'corrediza2hojas' ? 'Agregar Ventana al Presupuesto' : 'Agregar Paño Fijo al Presupuesto'}
    </button>
  </div>
);

const FormularioCliente = ({ cliente, handleClienteChange }: {
  cliente: Cliente;
  handleClienteChange: (campo: ClienteKey, valor: string) => void;
}) => {
  const camposCliente: { key: ClienteKey; label: string; placeholder: string; full?: boolean }[] = [
    { key: 'nombre', label: 'Nombre/Razón Social', placeholder: 'Nombre del cliente' },
    { key: 'localidad', label: 'Localidad', placeholder: 'Localidad' },
    { key: 'domicilio', label: 'Domicilio', placeholder: 'Dirección completa', full: true },
    { key: 'telefono', label: 'Teléfono', placeholder: 'Teléfono' },
    { key: 'dni', label: 'DNI', placeholder: 'DNI' },
    { key: 'cuit', label: 'CUIT/CUIL', placeholder: 'CUIT/CUIL' },
    { key: 'iva', label: 'Condición IVA', placeholder: 'Condición IVA' },
    { key: 'iibb', label: 'Ingresos Brutos', placeholder: 'N° IIBB' }
  ];

  return (
    <div className="card">
      <h2 className="text-xl font-bold mb-4">Datos del Cliente</h2>
      <div className="grid grid-cols-2 gap-4">
        {camposCliente.map(({ key, label, placeholder, full }) => (
          <div key={key} className={full ? 'col-span-2' : ''}>
            <label className="block text-sm font-medium mb-1">{label}</label>
            <input
              type="text"
              value={cliente[key]}
              onChange={(e) => handleClienteChange(key, e.target.value)}
              className="input"
              placeholder={placeholder}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

// COMPONENTE PRINCIPAL
export default function Cotizador() {
  // Estados básicos
  const [tipoVentana, setTipoVentana] = useState<TipoVentana>('corrediza2hojas');
  const [ancho, setAncho] = useState('1000');
  const [alto, setAlto] = useState('1000');
  const [vidrioExteriorId, setVidrioExteriorId] = useState(4);
  const [vidrioInteriorId, setVidrioInteriorId] = useState(4);
  const [esDvh, setEsDvh] = useState(false);
  const [espesorCamara, setEspesorCamara] = useState(6);
  const [acabadoId, setAcabadoId] = useState('blanco-brillante');
  const [incluirMosquitero, setIncluirMosquitero] = useState(false);
  const [resultado, setResultado] = useState<ResultadoCalculo | ResultadoVentanaConMosquitero | null>(null);
  const [resultadoTexto, setResultadoTexto] = useState('');
  const [cliente, setCliente] = useState<Cliente>(CLIENTE_VACIO);
  const [numeroPresupuesto, setNumeroPresupuesto] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const { ventanas, agregarVentana, eliminarVentana, total, limpiarPresupuesto } = usePresupuesto();

  // Mostrar toast
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
  };

  // Efectos
  useEffect(() => {
    setNumeroPresupuesto(generarNumeroPresupuesto());
  }, []);

  // Handler para los campos del cliente
  const handleClienteChange = (campo: ClienteKey, valor: string) => {
    setCliente(prev => ({ ...prev, [campo]: valor }));
  };

  // Cálculos automáticos
  useEffect(() => {
    calcularCotizacionAutomatica();
  }, [ancho, alto, tipoVentana, vidrioExteriorId, vidrioInteriorId, esDvh, espesorCamara, acabadoId, incluirMosquitero]);

  const calcularCotizacionAutomatica = () => {
    try {
      const anchoNum = parseFloat(ancho);
      const altoNum = parseFloat(alto);

      if (isNaN(anchoNum) || isNaN(altoNum) || anchoNum <= 0 || altoNum <= 0) {
        return;
      }

      let resultadoCalculo;

      if (tipoVentana === 'pañoFijo') {
        resultadoCalculo = calcularPañoFijoModena(
          anchoNum, altoNum, vidrioExteriorId, vidrioInteriorId,
          esDvh, espesorCamara, VIDRIOS, acabadoId
        );
      } else {
        // Ventana corrediza (con o sin mosquitero)
        resultadoCalculo = calcularVentanaCorrediza2Hojas(
          anchoNum, altoNum, vidrioExteriorId, vidrioInteriorId,
          esDvh, espesorCamara, VIDRIOS, acabadoId, incluirMosquitero, false
        );
      }

      setResultado(resultadoCalculo);
      formatearResultado(resultadoCalculo, anchoNum, altoNum);

    } catch (error) {
      console.error('Error al calcular:', error);
    }
  };

  const formatearResultado = (resultadoCalculo: any, anchoNum: number, altoNum: number) => {
    if (incluirMosquitero && tipoVentana === 'corrediza2hojas') {
      setResultadoTexto(formatearResultadoVentanaConMosquitero(resultadoCalculo, anchoNum, altoNum));
    } else if (tipoVentana === 'corrediza2hojas') {
      setResultadoTexto(formatearResultadoModena2Hojas(resultadoCalculo, anchoNum, altoNum));
    } else if (tipoVentana === 'pañoFijo') {
      setResultadoTexto(formatearResultadoPañoFijo(resultadoCalculo, anchoNum, altoNum));
    }
  };

  // AGREGAR SOLO EL MOSQUITERO
  const agregarSoloMosquitero = () => {
    if (tipoVentana !== 'corrediza2hojas') {
      showToast('Solo disponible para ventanas corredizas', 'error');
      return;
    }

    try {
      const anchoNum = parseFloat(ancho);
      const altoNum = parseFloat(alto);
      const acabado = ACABADOS.find(a => a.id === acabadoId) || ACABADOS[0];

      if (isNaN(anchoNum) || isNaN(altoNum) || anchoNum <= 0 || altoNum <= 0) {
        showToast('Complete las medidas primero', 'error');
        return;
      }

      // Calcular solo el mosquitero para ventana corrediza
      const resultadoMosquitero = calcularVentanaCorrediza2Hojas(
        anchoNum, altoNum, vidrioExteriorId, vidrioInteriorId,
        false, espesorCamara, VIDRIOS, acabadoId, false, true
      ) as ResultadoCalculo;

      const mosquiteroParaPresupuesto = {
        tipo: 'mosquitero' as const,
        tipoNombre: 'Mosquitero para Ventana Corrediza',
        ancho: anchoNum, alto: altoNum,
        medidas: `${anchoNum}x${altoNum} mm`,
        descripcion: `Mosquitero para ventana corrediza ${anchoNum}x${altoNum}mm - ${acabado.color}`,
        precio: resultadoMosquitero.precios.precioVentaTotal,
        precioConIVA: resultadoMosquitero.precios.precioVentaConIVA,
        detalles: resultadoMosquitero, acabado,
        incluirMosquitero: false
      };

      agregarVentana(mosquiteroParaPresupuesto);
      showToast('Mosquitero agregado al presupuesto');

    } catch (error) {
      console.error('Error al agregar mosquitero:', error);
      showToast('Error al agregar mosquitero', 'error');
    }
  };

  // AGREGAR AL PRESUPUESTO
  const agregarAlPresupuesto = () => {
    if (!resultado) {
      showToast('Complete los datos primero', 'error');
      return;
    }

    try {
      const anchoNum = parseFloat(ancho);
      const altoNum = parseFloat(alto);
      const acabado = ACABADOS.find(a => a.id === acabadoId) || ACABADOS[0];

      // SI ES VENTANA CON MOSQUITERO, AGREGAR POR SEPARADO
      if (incluirMosquitero && tipoVentana === 'corrediza2hojas') {
        const resultadoConMosquitero = resultado as ResultadoVentanaConMosquitero;
        
        // Agregar ventana
        const ventanaParaPresupuesto = {
          tipo: tipoVentana,
          tipoNombre: 'Ventana Corrediza 2 Hojas',
          ancho: anchoNum, alto: altoNum,
          medidas: `${anchoNum}x${altoNum} mm`,
          descripcion: `Ventana Corrediza 2 Hojas ${anchoNum}x${altoNum}mm - ${acabado.color}${esDvh ? ' - DVH' : ' - Simple'}`,
          precio: resultadoConMosquitero.ventana.precios.precioVentaTotal,
          precioConIVA: resultadoConMosquitero.ventana.precios.precioVentaConIVA,
          detalles: resultadoConMosquitero.ventana, acabado,
          incluirMosquitero: false
        };
        agregarVentana(ventanaParaPresupuesto);

        // Agregar mosquitero por separado
        const mosquiteroParaPresupuesto = {
          tipo: 'mosquitero' as const,
          tipoNombre: 'Mosquitero para Ventana Corrediza',
          ancho: anchoNum, alto: altoNum,
          medidas: `${anchoNum}x${altoNum} mm`,
          descripcion: `Mosquitero para ventana corrediza ${anchoNum}x${altoNum}mm - ${acabado.color}`,
          precio: resultadoConMosquitero.mosquitero!.precios.precioVentaTotal,
          precioConIVA: resultadoConMosquitero.mosquitero!.precios.precioVentaConIVA,
          detalles: resultadoConMosquitero.mosquitero!, acabado,
          incluirMosquitero: false
        };
        agregarVentana(mosquiteroParaPresupuesto);

        showToast('Ventana y mosquitero agregados al presupuesto');
      } else {
        // CASO NORMAL: solo ventana sin mosquitero
        const ventanaParaPresupuesto = crearVentanaPresupuesto(anchoNum, altoNum, acabado);
        agregarVentana(ventanaParaPresupuesto);
        showToast(tipoVentana === 'corrediza2hojas' ? 'Ventana agregada al presupuesto' : 'Paño fijo agregado al presupuesto');
      }

    } catch (error) {
      console.error('Error al agregar al presupuesto:', error);
      showToast('Error al agregar al presupuesto', 'error');
    }
  };

  const crearVentanaPresupuesto = (anchoNum: number, altoNum: number, acabado: any) => {
    const resultadoSimple = resultado as ResultadoCalculo;
    return {
      tipo: tipoVentana,
      tipoNombre: tipoVentana === 'corrediza2hojas' ? 'Ventana Corrediza 2 Hojas' : 'Paño Fijo',
      ancho: anchoNum, alto: altoNum,
      medidas: `${anchoNum}x${altoNum} mm`,
      descripcion: `${tipoVentana === 'corrediza2hojas' ? 'Ventana Corrediza 2 Hojas' : 'Paño Fijo'} ${anchoNum}x${altoNum}mm - ${acabado.color}${esDvh ? ' - DVH' : ' - Simple'}`,
      precio: resultadoSimple.precios.precioVentaTotal,
      precioConIVA: resultadoSimple.precios.precioVentaConIVA,
      detalles: resultadoSimple, acabado,
      incluirMosquitero: false
    };
  };

  const nuevoPresupuesto = () => {
    limpiarPresupuesto();
    setNumeroPresupuesto(generarNumeroPresupuesto());
    setCliente(CLIENTE_VACIO);
    showToast('Nuevo presupuesto creado');
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Toast Notification */}
      {toast && (
        <ToastNotification
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sección de cotización */}
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-2xl font-bold mb-4">Configurar Abertura</h2>
            <SelectorTipoVentana tipoVentana={tipoVentana} setTipoVentana={setTipoVentana} />
            <InputMedidas ancho={ancho} setAncho={setAncho} alto={alto} setAlto={setAlto} />
            <SelectorAcabado acabadoId={acabadoId} setAcabadoId={setAcabadoId} />
            <ConfiguracionVidrio 
              tipoVentana={tipoVentana}
              esDvh={esDvh}
              setEsDvh={setEsDvh}
              vidrioExteriorId={vidrioExteriorId}
              setVidrioExteriorId={setVidrioExteriorId}
              vidrioInteriorId={vidrioInteriorId}
              setVidrioInteriorId={setVidrioInteriorId}
              espesorCamara={espesorCamara}
              setEspesorCamara={setEspesorCamara}
            />
            <OpcionesMosquitero 
              tipoVentana={tipoVentana}
              incluirMosquitero={incluirMosquitero}
              setIncluirMosquitero={setIncluirMosquitero}
              onAgregarSoloMosquitero={agregarSoloMosquitero}
            />
            <BotonesAccion 
              resultado={resultado}
              agregarAlPresupuesto={agregarAlPresupuesto}
              tipoVentana={tipoVentana}
            />
          </div>

          {resultadoTexto && (
            <div className="card">
              <h3 className="text-xl font-bold mb-3">Resultado de la Cotización</h3>
              <div className="bg-gray-50 p-4 rounded border">
                <pre className="whitespace-pre-wrap text-sm">{resultadoTexto}</pre>
              </div>
            </div>
          )}
        </div>

        {/* Sección de presupuesto */}
        <div className="space-y-6">
          <FormularioCliente cliente={cliente} handleClienteChange={handleClienteChange} />
          <ListaPresupuesto ventanas={ventanas} onEliminarVentana={eliminarVentana} total={total} />
          
          <div className="card">
            <h3 className="text-lg font-bold mb-3">Acciones del Presupuesto</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>N° de Presupuesto:</span>
                <span className="font-bold">{numeroPresupuesto}</span>
              </div>
              <PresupuestoPDF ventanas={ventanas} cliente={cliente} numeroPresupuesto={numeroPresupuesto} />
              <PresupuestoDetalladoPDF ventanas={ventanas} cliente={cliente} numeroPresupuesto={numeroPresupuesto} />
              <button onClick={nuevoPresupuesto} className="btn btn-secondary w-full">
                Nuevo Presupuesto
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}