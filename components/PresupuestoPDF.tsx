// components/PresupuestoPDF.tsx
"use client";
import jsPDF from "jspdf";
import { ReactNode } from 'react';

interface VentanaAcumulada {
  id: string;
  tipo: 'corrediza2hojas' | 'pañoFijo' | 'mosquitero';
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
  incluirMosquitero?: boolean;
  codigo: string;
}

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

interface Props {
  ventanas: VentanaAcumulada[];
  cliente: Cliente;
  numeroPresupuesto: string;
}

export default function PresupuestoPDF({ ventanas, cliente, numeroPresupuesto }: Props): ReactNode {
  const generarPDF = async () => {
    if (ventanas.length === 0) {
      alert("No hay ventanas en el presupuesto para generar PDF");
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // --- ENCABEZADO SUPERIOR ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6);
    doc.text("Documento No Válido Como Factura", pageWidth / 2, 8, { align: "center" });

    // --- Dimensiones generales ---
    const marginX = 10;
    const yStart = 10;
    const boxHeight = 36;
    const centerBoxWidth = 20;
    const gap = 5;

    const sideBoxWidth = (pageWidth - (marginX * 2) - (gap * 2) - centerBoxWidth) / 2;
    const leftX = marginX;
    const centerX = leftX + sideBoxWidth + gap;
    const rightX = centerX + centerBoxWidth + gap;

    // --- Recuadros principales ---
    const leftTopY = yStart;
    const leftBottomY = yStart + boxHeight;
    doc.line(leftX, leftTopY, leftX + sideBoxWidth, leftTopY);
    doc.line(leftX, leftTopY, leftX, leftBottomY);
    doc.line(leftX, leftBottomY, leftX + sideBoxWidth, leftBottomY);
    doc.line(leftX + sideBoxWidth, leftTopY, leftX + sideBoxWidth, leftTopY + boxHeight - 8);

    doc.rect(centerX, yStart, centerBoxWidth, boxHeight - 12);

    const rightTopY = yStart;
    const rightBottomY = yStart + boxHeight;
    doc.line(rightX, rightTopY, rightX + sideBoxWidth, rightTopY);
    doc.line(rightX, rightTopY, rightX, rightTopY + boxHeight - 8);
    doc.line(rightX + sideBoxWidth, rightTopY, rightX + sideBoxWidth, rightBottomY);
    doc.line(rightX, rightBottomY, rightX + sideBoxWidth, rightBottomY);

    // --- Extensiones inferiores laterales ---
    const extensionWidth = 13;
    const extensionHeight = 8;
    const extensionY = yStart + boxHeight - extensionHeight;

    const leftExtensionX = leftX + sideBoxWidth;
    doc.line(leftExtensionX, extensionY, leftExtensionX + extensionWidth, extensionY);
    doc.line(leftExtensionX + extensionWidth, extensionY, leftExtensionX + extensionWidth, extensionY + extensionHeight);
    doc.line(leftExtensionX, extensionY + extensionHeight, leftExtensionX + extensionWidth, extensionY + extensionHeight);

    const rightExtensionX = rightX - extensionWidth;
    doc.line(rightExtensionX, extensionY, rightExtensionX + extensionWidth, extensionY);
    doc.line(rightExtensionX, extensionY, rightExtensionX, extensionY + extensionHeight);
    doc.line(rightExtensionX, extensionY + extensionHeight, rightExtensionX + extensionWidth, extensionY + extensionHeight);

    // --- Cargar imagen desde public ---
    const img = new Image();
    img.src = "/logo.png";

    img.onload = () => {
      // --- Imagen en el recuadro izquierdo ---
      doc.addImage(img, "PNG", leftX + 1, leftTopY + 1, 32, 32);

      // --- Texto alineado al margen derecho del recuadro ---
      const rightMargin = leftX + sideBoxWidth - 3;
      const startY = yStart + 6;
      const lineHeight = 5;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("Valle Hermoso, Córdoba", rightMargin, startY, { align: "right" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text("Av. San Martin 300", rightMargin, startY + lineHeight, { align: "right" });
      doc.setFontSize(11);
      doc.text("3548 57-0939", rightMargin, startY + lineHeight * 2, { align: "right" });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("IVA Responsable Inscripto", rightMargin, startY + lineHeight * 5, { align: "right"});

      // --- Texto adicional en recuadro derecho ---
      const rightBoxMargin = rightX + 3;
      const rightStartY = yStart + 6;
      const rightLineHeight = 5;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text(`Presupuesto N° ${numeroPresupuesto}`, rightBoxMargin, rightStartY);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text(`CUIT: 20-46379053-2`, rightBoxMargin, rightStartY + rightLineHeight);
      doc.text(`Ing. Brutos: 289023836`, rightBoxMargin, rightStartY + rightLineHeight*2);
      doc.text(`Inicio de Actividades: 01/05/2025`, rightBoxMargin, rightStartY + rightLineHeight * 3);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text(`Fecha: ${new Date().toLocaleDateString('es-AR')}`, rightBoxMargin, rightStartY + rightLineHeight * 5);

      // --- X central ---
      doc.setFont("helvetica", "bold");
      doc.setFontSize(38);
      doc.text("X", centerX + 20 / 2, leftTopY + (boxHeight - 15) / 2 + 6, { align: "center" });

      // --- SECCIÓN CLIENTES ---
      const clientesY = leftTopY + boxHeight + 4;
      const clientesHeight = 8;
      const clientesWidth = pageWidth - marginX * 2;
      const clientesX = marginX;

      doc.rect(clientesX, clientesY, clientesWidth, clientesHeight);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("CLIENTES", clientesX + clientesWidth / 2, clientesY + clientesHeight / 2 + 2, { align: "center" });

      // --- DATOS DEL CLIENTE ---
      const dataStartY = clientesY + clientesHeight + 6;
      const columnWidth = (pageWidth - marginX * 2) / 2;
      const lineSpacing = 6;
      const labelFontSize = 10;
      const valueFontSize = 11;

      doc.setFont("helvetica", "normal");

      // COLUMNA IZQUIERDA
      let currentY = dataStartY;
      doc.setFontSize(labelFontSize);
      doc.text("Razón social:", leftX, currentY);
      doc.setFontSize(valueFontSize);
      doc.text(cliente.nombre || "", leftX + 35, currentY);

      currentY += lineSpacing;
      doc.setFontSize(labelFontSize);
      doc.text("Localidad:", leftX, currentY);
      doc.setFontSize(valueFontSize);
      doc.text(cliente.localidad || "", leftX + 35, currentY);

      currentY += lineSpacing;
      doc.setFontSize(labelFontSize);
      doc.text("Domicilio:", leftX, currentY);
      doc.setFontSize(valueFontSize);
      doc.text(cliente.domicilio || "", leftX + 35, currentY);

      currentY += lineSpacing;
      doc.setFontSize(labelFontSize);
      doc.text("Teléfono:", leftX, currentY);
      doc.setFontSize(valueFontSize);
      doc.text(cliente.telefono || "", leftX + 35, currentY);

      // COLUMNA DERECHA
      currentY = dataStartY;
      doc.setFontSize(labelFontSize);
      doc.text("DNI:", rightX, currentY);
      doc.setFontSize(valueFontSize);
      doc.text(cliente.dni || "", rightX + 25, currentY);

      currentY += lineSpacing;
      doc.setFontSize(labelFontSize);
      doc.text("CUIT/CUIL:", rightX, currentY);
      doc.setFontSize(valueFontSize);
      doc.text(cliente.cuit || "", rightX + 25, currentY);

      currentY += lineSpacing;
      doc.setFontSize(labelFontSize);
      doc.text("IVA:", rightX, currentY);
      doc.setFontSize(valueFontSize);
      doc.text(cliente.iva || "", rightX + 25, currentY);

      currentY += lineSpacing;
      doc.setFontSize(labelFontSize);
      doc.text("Ingresos Brutos:", rightX, currentY);
      doc.setFontSize(valueFontSize);
      doc.text(cliente.iibb || "", rightX + 40, currentY);

      // --- SECCIÓN DETALLE DE ITEMS ---
      const detalleY = clientesY + clientesHeight + 30;
      const detalleHeight = 10;
      const detalleX = 0;
      const detalleWidth = pageWidth;

      doc.rect(detalleX, detalleY, detalleWidth, detalleHeight);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);

      const columns = [
        { title: "Codigo", x: detalleX + 6, align: "left" as const },
        { title: "Cantidad", x: detalleX + 36, align: "center" as const },
        { title: "Descripcion", x: detalleX + 56, align: "left" as const },
        { title: "%IVA", x: detalleX + 150, align: "center" as const },
        { title: "P. Unit.", x: detalleX + 180, align: "right" as const },
        { title: "Total", x: detalleX + 202, align: "right" as const },
      ];

      const headerTextY = detalleY + detalleHeight / 2 + 2;
      columns.forEach(col => {
        doc.text(col.title, col.x, headerTextY, { align: col.align });
      });

      const detalleContenidoY = detalleY + detalleHeight;
      doc.line(detalleX, detalleContenidoY, detalleX + detalleWidth, detalleContenidoY);

      // --- FILAS CON DATOS REALES ---
      let currentYItems = detalleContenidoY + 8;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);

      // Calcular totales
      let subtotal = 0;
      const ivaPorcentaje = 21;

      ventanas.forEach(ventana => {
        const precioUnitario = ventana.detalles.precios.precioVentaTotal;
        const precioConIVA = ventana.precioConIVA;
        subtotal += precioUnitario;

        // Construir descripción - CORREGIDO PARA MOSQUITEROS
        let descripcion = '';
        
        if (ventana.tipo === 'mosquitero') {
          // Para mosquiteros, no mostrar información de vidrio
          descripcion = [
            `${ventana.tipoNombre} ${ventana.medidas}`,
            `Acabado: ${ventana.acabado.color}`
          ].join(' | ');
        } else {
          // Para ventanas, mostrar información de vidrio
          const tipoVidrio = ventana.detalles.vidrios.esDvh 
            ? `DVH (${ventana.detalles.vidrios.vidrioExterior?.nombre} + ${ventana.detalles.vidrios.vidrioInterior?.nombre})`
            : `Simple (${ventana.detalles.vidrios.vidrioExterior?.nombre})`;
          
          descripcion = [
            `${ventana.tipoNombre} ${ventana.medidas}`,
            `Acabado: ${ventana.acabado.color}`,
            `Vidrio: ${tipoVidrio}`
          ].join(' | ');
        }

        // Ajustar descripción si es muy larga
        const maxWidthDescripcion = 80;
        const descripcionLines = doc.splitTextToSize(descripcion, maxWidthDescripcion);

        // Dibujar fila
        const rowHeight = Math.max(10, descripcionLines.length * 5);

        doc.text(ventana.codigo, detalleX + 6, currentYItems, { align: "left" });
        doc.text("1", detalleX + 36, currentYItems, { align: "center" });
        doc.text(descripcionLines, detalleX + 56, currentYItems, { align: "left" });
        doc.text(`${ivaPorcentaje}%`, detalleX + 150, currentYItems, { align: "center" });
        doc.text(`$${precioUnitario.toFixed(2)}`, detalleX + 180, currentYItems, { align: "right" });
        doc.text(`$${precioConIVA.toFixed(2)}`, detalleX + 202, currentYItems, { align: "right" });

        // Línea separadora
        currentYItems += rowHeight + 3;
        doc.line(detalleX, currentYItems - 5, detalleX + detalleWidth, currentYItems - 5);

        // Verificar si necesitamos nueva página
        if (currentYItems > pageHeight - 50) {
          doc.addPage();
          currentYItems = 20;
        }
      });

      // --- CALCULAR TOTALES ---
      const descuento = 0;
      const neto = subtotal - descuento;
      const ivaMonto = neto * (ivaPorcentaje / 100);
      const totalFinal = neto + ivaMonto;

      const format = (num: number) =>
        num.toLocaleString("es-AR", { minimumFractionDigits: 0 });

      // --- SECCIÓN TOTALES ---
      const totalesHeight = 10;
      const totalesY = pageHeight - totalesHeight - 30;
      const totalesWidth = pageWidth - marginX * 2;
      const totalesX = marginX;

      doc.rect(totalesX, totalesY, totalesWidth, totalesHeight);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);

      const labels = ["Sub. s/Dto", "Descuento", "Neto", "IVA", "Total"];
      const values = [
        `$${format(subtotal)}`,
        `$${format(descuento)}`,
        `$${format(neto)}`,
        `${ivaPorcentaje}%`,
        `$${format(totalFinal)}`
      ];

      const colSpacing = totalesWidth / labels.length;
      const baseX = totalesX;
      const labelY = totalesY + totalesHeight / 2 + 3;

      labels.forEach((label, i) => {
        const xCenter = baseX + colSpacing * i + colSpacing / 2;
        doc.text(label, xCenter, labelY, { align: "center" });
      });

      const valueY = totalesY + totalesHeight + 7;
      values.forEach((value, i) => {
        const xCenter = baseX + colSpacing * i + colSpacing / 2;
        if (i === labels.length - 1) {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(12);
        } else {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
        }
        doc.text(value, xCenter, valueY, { align: "center" });
      });

      // Abrir PDF en nueva pestaña
      const pdfBlob = doc.output("bloburl");
      window.open(pdfBlob as any, "_blank");
    };
  };

  return (
    <button
      onClick={generarPDF}
      className="btn btn-primary w-full"
      disabled={ventanas.length === 0}
    >
      📄 Generar Presupuesto Formal
    </button>
  );
}