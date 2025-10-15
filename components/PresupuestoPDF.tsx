// components/PresupuestoPDF.tsx
"use client";
import jsPDF from "jspdf";

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

export default function PresupuestoPDF({ ventanas, cliente, numeroPresupuesto }: Props) {
  const generarPDF = async () => {
    if (ventanas.length === 0) {
      alert("No hay ventanas en el presupuesto para generar PDF");
      return;
    }

    const doc = new jsPDF();
    
    // Calcular totales
    const subtotal = ventanas.reduce((sum, ventana) => sum + ventana.detalles.precios.precioVentaTotal, 0);
    const iva = ventanas.reduce((sum, ventana) => sum + (ventana.precioConIVA - ventana.detalles.precios.precioVentaTotal), 0);
    const total = ventanas.reduce((sum, ventana) => sum + ventana.precioConIVA, 0);

    const fecha = new Date();
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const anio = fecha.getFullYear();

    // --- Configuración inicial ---
    doc.setFont("helvetica");
    const lineHeight = 5;
    const rowHeight = 8; // Altura de cada fila de productos

    // --- Cabecera izquierda (Datos del local) - AUMENTADA EN ALTURA ---
    const headerLeftHeight = 50; // Aumentado de 40 a 50
    doc.setLineWidth(0.8);
    doc.roundedRect(15, 15, 90, headerLeftHeight, 3, 3, "S");
    
    try {
      // Intentar cargar el logo
      const logoResponse = await fetch('/logo.png');
      const logoBlob = await logoResponse.blob();
      const logoUrl = URL.createObjectURL(logoBlob);
      
      doc.addImage(logoUrl, 'PNG', 20, 22, 25, 25); // Ajustado posición Y
      doc.setFontSize(12);
      doc.setTextColor(40, 40, 40);
      doc.text("Lilaguh Aberturas", 50, 27); // Ajustado posición Y
      doc.setFontSize(10);
      doc.text("Tel: 351-307-6894", 50, 34); // Ajustado posición Y
      doc.text("Dirección: Calle Falsa 123", 50, 41); // Ajustado posición Y
      doc.text("Ubicación: Córdoba, Argentina", 50, 48); // Ajustado posición Y
      doc.setFont( 'bold');
      doc.text("Responsable Inscripto", 50, 55); // Ajustado posición Y
      
      URL.revokeObjectURL(logoUrl);
    } catch (error) {
      // Sin logo - ajustar posiciones
      doc.setFontSize(12);
      doc.setTextColor(40, 40, 40);
      doc.text("Lilaguh Aberturas", 20, 27);
      doc.setFontSize(10);
      doc.text("Tel: 351-307-6894", 20, 34);
      doc.text("Dirección: Calle Falsa 123", 20, 41);
      doc.text("Ubicación: Córdoba, Argentina", 20, 48);
      doc.setFont( 'bold');
      doc.text("Responsable Inscripto", 20, 55);
    }

    // --- Cabecera derecha (Datos del presupuesto) - AUMENTADA EN ALTURA ---
    doc.roundedRect(110, 15, 85, headerLeftHeight, 3, 3, "S");
    doc.setFont( 'normal');
    doc.setTextColor(60, 60, 60);
    doc.text(`ID Presupuesto: ${numeroPresupuesto}`, 115, 27);
    doc.text(`Fecha: ${dia}/${mes}/${anio}`, 115, 34);
    doc.setFontSize(14);
    doc.setFont( 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text("PRESUPUESTO", 115, 45);
    doc.setFontSize(9);
    doc.setFont( 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text("Documento NO válido como factura", 115, 52);

    // --- Datos del cliente - AUMENTADA EN ALTURA ---
    const clientBoxHeight = 35; // Aumentado de 30 a 35
    const clientBoxY = 15 + headerLeftHeight + 10; // 15 (margen) + 50 (altura cabecera) + 10 (espacio)
    doc.roundedRect(15, clientBoxY, 180, clientBoxHeight, 3, 3, "S");
    doc.setFontSize(11);
    doc.setTextColor(40, 40, 40);
    doc.text(`Apellido y Nombre: ${cliente.nombre || "______________________"}`, 20, clientBoxY + 10);
    doc.text(`Teléfono: ${cliente.telefono || "______________________"}`, 20, clientBoxY + 18);
    doc.text(`Domicilio: ${cliente.domicilio || "______________________"}`, 20, clientBoxY + 26);

    // --- Tabla de items ---
    const startY = clientBoxY + clientBoxHeight + 15; // Posición después del cuadro cliente
    const colX = [15, 40, 120, 160, 195];

    // Calcular altura de tabla dinámicamente basada en número de productos
    const tableHeight = Math.max(60, ventanas.length * rowHeight + 15);

    // Dibujar marco principal de la tabla
    doc.setLineWidth(0.6);
    doc.setDrawColor(100, 100, 100);
    doc.rect(colX[0], startY, colX[4] - colX[0], tableHeight);

    // Línea horizontal del encabezado (PRIMERO dibujar esta línea)
    doc.setLineWidth(0.4);
    doc.line(colX[0], startY + 12, colX[4], startY + 12);

    // Líneas verticales (columnas)
    doc.setLineWidth(0.3);
    for (let i = 1; i < colX.length - 1; i++) {
      doc.line(colX[i], startY, colX[i], startY + tableHeight);
    }

    // Líneas horizontales para cada fila de producto (CALCULAR EXACTAMENTE)
    doc.setLineWidth(0.2);
    for (let i = 0; i <= ventanas.length; i++) {
      const lineY = startY + 12 + (i * rowHeight);
      if (lineY < startY + tableHeight) {
        doc.line(colX[0], lineY, colX[4], lineY);
      }
    }

    // Encabezados de tabla
    doc.setFontSize(11);
    doc.setFont( 'bold');
    doc.setTextColor(255, 255, 255);
    doc.setFillColor(60, 60, 60);
    doc.rect(colX[0], startY, colX[4] - colX[0], 12, 'F'); // Altura fija de 12 para encabezado
    
    doc.text("Cant.", colX[0] + 5, startY + 8);
    doc.text("Descripción", colX[1] + 5, startY + 8);
    doc.text("P. Unit.", colX[2] + 5, startY + 8);
    doc.text("P. Total", colX[3] + 5, startY + 8);

    // --- Items de ventanas - ALINEACIÓN CORRECTA ---
    doc.setFont( 'normal');
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(10);
    
    ventanas.forEach((ventana, index) => {
      const rowY = startY + 12 + (index * rowHeight) + (rowHeight / 2); // Centrar verticalmente en la celda
      
      // Fondo alternado para filas
      if (index % 2 === 0) {
        doc.setFillColor(245, 245, 245);
        doc.rect(colX[0], startY + 12 + (index * rowHeight), colX[4] - colX[0], rowHeight, 'F');
      }

      doc.text("1", colX[0] + 5, rowY);
      
      const descripcion = `${ventana.tipoNombre} ${ventana.medidas}`;
      // Manejar descripción larga
      if (descripcion.length > 35) {
        doc.text(descripcion.substring(0, 35), colX[1] + 5, rowY - 2);
        doc.text(descripcion.substring(35, 70) + (descripcion.length > 70 ? "..." : ""), colX[1] + 5, rowY + 2);
      } else {
        doc.text(descripcion, colX[1] + 5, rowY);
      }
      
      doc.text(`$${ventana.precioConIVA.toFixed(2)}`, colX[2] + 5, rowY);
      doc.text(`$${ventana.precioConIVA.toFixed(2)}`, colX[3] + 5, rowY);
    });

    // --- Recuadro de totales - POSICIÓN DINÁMICA ---
    const totalsY = startY + tableHeight + 15;
    doc.setLineWidth(0.8);
    doc.setDrawColor(80, 80, 80);
    doc.roundedRect(120, totalsY, 75, 40, 3, 3, "S");
    
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(120, totalsY, 75, 40, 3, 3, "F");
    doc.roundedRect(120, totalsY, 75, 40, 3, 3, "S");

    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    
    doc.text("Subtotal:", 125, totalsY + 12);
    doc.text(`$${subtotal.toFixed(2)}`, 165, totalsY + 12);
    
    doc.text("IVA (21%):", 125, totalsY + 20);
    doc.text(`$${iva.toFixed(2)}`, 165, totalsY + 20);
    
    doc.setLineWidth(0.3);
    doc.line(125, totalsY + 24, 185, totalsY + 24);
    
    doc.setFont( 'bold');
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text("TOTAL:", 125, totalsY + 32);
    doc.text(`$${total.toFixed(2)}`, 165, totalsY + 32);

    // --- Observaciones ---
    const observacionesY = totalsY + 50;
    doc.setFontSize(10);
    doc.setFont( 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text("Observaciones:", 15, observacionesY);
    doc.setLineWidth(0.2);
    doc.line(15, observacionesY + 2, 80, observacionesY + 2);
    
    doc.text("________________________________________________________________", 15, observacionesY + 10);
    doc.text("________________________________________________________________", 15, observacionesY + 16);

    // --- Pie de página ---
    const footerY = observacionesY + 25;
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text("Este presupuesto es válido por 15 días a partir de la fecha de emisión.", 15, footerY);
    doc.text("Los precios incluyen IVA. Condiciones de pago a convenir.", 15, footerY + 5);

    doc.save(`presupuesto-${numeroPresupuesto}.pdf`);
  };

  return (
    <button
      onClick={generarPDF}
      className="btn btn-primary w-full"
    >
      🖨️ Imprimir Presupuesto (Diseño Corregido)
    </button>
  );
}