// components/PresupuestoDetalladoPDF.tsx
"use client";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface VentanaAcumulada {
  id: string;
  tipo: string;
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

interface Cliente {
  nombre: string;
  domicilio: string;
  telefono: string;
}

interface Props {
  ventanas: VentanaAcumulada[];
  cliente: Cliente;
  numeroPresupuesto: string;
}

export default function PresupuestoDetalladoPDF({ ventanas, cliente, numeroPresupuesto }: Props) {
  const generarPDF = () => {
    if (ventanas.length === 0) {
      alert("No hay ventanas en el presupuesto para generar PDF");
      return;
    }

    const doc = new jsPDF();
    
    // Calcular totales
    const totalSinIVA = ventanas.reduce((sum, ventana) => sum + ventana.detalles.precios.precioVentaTotal, 0);
    const totalIVA = ventanas.reduce((sum, ventana) => sum + (ventana.precioConIVA - ventana.detalles.precios.precioVentaTotal), 0);
    const totalConIVA = ventanas.reduce((sum, ventana) => sum + ventana.precioConIVA, 0);
    
    // Encabezado
    doc.setFontSize(16);
    doc.setFont( 'bold');
    doc.text("PRESUPUESTO DETALLADO", 105, 15, { align: 'center' } as any);
    
    doc.setFontSize(10);
    doc.setFont( 'normal');
    doc.text(`Número: ${numeroPresupuesto}`, 15, 25);
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-AR')}`, 15, 30);
    
    // Datos de la empresa
    doc.text("Carlos Daniel Ochoa - Valle Hermoso - AV. San Martín 300", 15, 37);
    doc.setFont( 'bold');
    doc.text("R E S P O N S A B L E   I N S C R I P T O", 15, 42);
    
    // Datos del cliente
    doc.setFont( 'bold');
    doc.text("CLIENTE:", 15, 50);
    doc.setFont( 'normal');
    doc.text(`Nombre: ${cliente.nombre || "______________________"}`, 15, 55);
    doc.text(`Domicilio: ${cliente.domicilio || "______________________"}`, 15, 60);
    doc.text(`Teléfono: ${cliente.telefono || "______________________"}`, 15, 65);
    
    // Tabla de ventanas con autoTable
    autoTable(doc, {
      startY: 75,
      head: [['Item', 'Descripción', 'Medidas', 'Acabado', 'Vidrio', 'Precio']],
      body: ventanas.map((v, index) => [
        (index + 1).toString(),
        v.tipoNombre,
        v.medidas,
        v.acabado.color,
        v.detalles.vidrios.esDvh ? 'DVH' : 'Simple',
        `$${v.precioConIVA.toFixed(2)}`
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [0, 0, 0] }
    });
    
    // Totales
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    
    doc.setFontSize(10);
    doc.setFont( 'bold');
    
    // Subtotal
    doc.text("SUBTOTAL (sin IVA):", 120, finalY);
    doc.text(`$${totalSinIVA.toFixed(2)}`, 180, finalY);
    
    // IVA
    doc.text("IVA (21%):", 120, finalY + 7);
    doc.text(`$${totalIVA.toFixed(2)}`, 180, finalY + 7);
    
    // Línea separadora
    doc.line(120, finalY + 12, 195, finalY + 12);
    
    // TOTAL
    doc.setFontSize(12);
    doc.text("TOTAL (con IVA):", 120, finalY + 20);
    doc.text(`$${totalConIVA.toFixed(2)}`, 180, finalY + 20);
    
    // Observaciones
    doc.setFontSize(9);
    doc.setFont( 'normal');
    doc.text("Observaciones:", 15, finalY + 35);
    doc.text("_________________________________________________________________________________________", 15, finalY + 40);
    doc.text("_________________________________________________________________________________________", 15, finalY + 45);
    
    // Pie de página
    doc.setFontSize(8);
    doc.text("Presupuesto válido por 15 días - Precios incluyen IVA", 15, 280);
    
    doc.save(`presupuesto-detallado-${numeroPresupuesto}.pdf`);
  };

  return (
    <button
      onClick={generarPDF}
      className="btn btn-secondary w-full"
    >
      📊 Descargar Presupuesto Detallado
    </button>
  );
}