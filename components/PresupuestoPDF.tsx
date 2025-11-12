// components/PresupuestoPDF.tsx
"use client";

import jsPDF from "jspdf";
import React, { JSX } from "react";

interface VentanaAcumulada {
  id: string;
  tipo: "corrediza2hojas" | "pañoFijo" | "mosquitero";
  tipoNombre: string;
  ancho: number;
  alto: number;
  medidas: string;
  precio?: number;
  precioConIVA?: number;
  detalles: any;
  timestamp?: number;
  acabado?: {
    id?: string;
    color?: string;
    preciokg?: number;
  };
  incluirMosquitero?: boolean;
  codigo?: string;
  descripcion?: string;
}

interface Cliente {
  nombre?: string;
  localidad?: string;
  domicilio?: string;
  telefono?: string;
  dni?: string;
  cuit?: string;
  iva?: string;
  iibb?: string;
}

interface Props {
  ventanas: VentanaAcumulada[];
  cliente: Cliente;
  numeroPresupuesto: string;
}

export default function PresupuestoPDF({
  ventanas,
  cliente,
  numeroPresupuesto,
}: Props): JSX.Element {
  const generarPDF = async () => {
    if (!ventanas || ventanas.length === 0) {
      alert("No hay ventanas en el presupuesto para generar PDF");
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // --- ENCABEZADO SUPERIOR ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6);
    doc.text("Documento No Válido Como Factura", pageWidth / 2, 8, {
      align: "center",
    });

    // --- Dimensiones generales ---
    const marginX = 10;
    const yStart = 10;
    const boxHeight = 36;
    const centerBoxWidth = 20;
    const gap = 5;

    const sideBoxWidth =
      (pageWidth - marginX * 2 - gap * 2 - centerBoxWidth) / 2;
    const leftX = marginX;
    const centerX = leftX + sideBoxWidth + gap;
    const rightX = centerX + centerBoxWidth + gap;

    // --- Recuadros principales ---
    const leftTopY = yStart;
    const leftBottomY = yStart + boxHeight;
    doc.line(leftX, leftTopY, leftX + sideBoxWidth, leftTopY);
    doc.line(leftX, leftTopY, leftX, leftBottomY);
    doc.line(leftX, leftBottomY, leftX + sideBoxWidth, leftBottomY);
    doc.line(
      leftX + sideBoxWidth,
      leftTopY,
      leftX + sideBoxWidth,
      leftTopY + boxHeight - 8
    );

    doc.rect(centerX, yStart, centerBoxWidth, boxHeight - 12);

    const rightTopY = yStart;
    const rightBottomY = yStart + boxHeight;
    doc.line(rightX, rightTopY, rightX + sideBoxWidth, rightTopY);
    doc.line(rightX, rightTopY, rightX, rightTopY + boxHeight - 8);
    doc.line(
      rightX + sideBoxWidth,
      rightTopY,
      rightX + sideBoxWidth,
      rightBottomY
    );
    doc.line(rightX, rightBottomY, rightX + sideBoxWidth, rightBottomY);

    // --- Extensiones inferiores laterales ---
    const extensionWidth = 13;
    const extensionHeight = 8;
    const extensionY = yStart + boxHeight - extensionHeight;

    const leftExtensionX = leftX + sideBoxWidth;
    doc.line(
      leftExtensionX,
      extensionY,
      leftExtensionX + extensionWidth,
      extensionY
    );
    doc.line(
      leftExtensionX + extensionWidth,
      extensionY,
      leftExtensionX + extensionWidth,
      extensionY + extensionHeight
    );
    doc.line(
      leftExtensionX,
      extensionY + extensionHeight,
      leftExtensionX + extensionWidth,
      extensionY + extensionHeight
    );

    const rightExtensionX = rightX - extensionWidth;
    doc.line(
      rightExtensionX,
      extensionY,
      rightExtensionX + extensionWidth,
      extensionY
    );
    doc.line(
      rightExtensionX,
      extensionY,
      rightExtensionX,
      extensionY + extensionHeight
    );
    doc.line(
      rightExtensionX,
      extensionY + extensionHeight,
      rightExtensionX + extensionWidth,
      extensionY + extensionHeight
    );

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
      doc.text("Valle Hermoso, Córdoba", rightMargin, startY, {
        align: "right",
      });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text("Av. San Martin 300", rightMargin, startY + lineHeight, {
        align: "right",
      });
      doc.setFontSize(11);
      doc.text("3548 57-0939", rightMargin, startY + lineHeight * 2, {
        align: "right",
      });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text(
        "IVA Responsable Inscripto",
        rightMargin,
        startY + lineHeight * 5,
        { align: "right" }
      );

      // --- Texto adicional en recuadro derecho ---
      const rightBoxMargin = rightX + 3;
      const rightStartY = yStart + 6;
      const rightLineHeight = 5;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text(
        `Presupuesto N° ${numeroPresupuesto}`,
        rightBoxMargin,
        rightStartY
      );
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text(
        `CUIT: 20-46379053-2`,
        rightBoxMargin,
        rightStartY + rightLineHeight
      );
      doc.text(
        `Ing. Brutos: 289023836`,
        rightBoxMargin,
        rightStartY + rightLineHeight * 2
      );
      doc.text(
        `Inicio de Actividades: 01/05/2025`,
        rightBoxMargin,
        rightStartY + rightLineHeight * 3
      );
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text(
        `Fecha: ${new Date().toLocaleDateString("es-AR")}`,
        rightBoxMargin,
        rightStartY + rightLineHeight * 5
      );

      // --- X central ---
      doc.setFont("helvetica", "bold");
      doc.setFontSize(38);
      doc.text("X", centerX + 20 / 2, leftTopY + (boxHeight - 15) / 2 + 6, {
        align: "center",
      });

      // --- SECCIÓN CLIENTES ---
      const clientesY = leftTopY + boxHeight + 4;
      const clientesHeight = 8;
      const clientesWidth = pageWidth - marginX * 2;
      const clientesX = marginX;

      doc.rect(clientesX, clientesY, clientesWidth, clientesHeight);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text(
        "CLIENTES",
        clientesX + clientesWidth / 2,
        clientesY + clientesHeight / 2 + 2,
        { align: "center" }
      );

      // --- DATOS DEL CLIENTE ---
      const dataStartY = clientesY + clientesHeight + 6;
      const lineSpacing = 6;
      const labelFontSize = 10;
      const valueFontSize = 11;

      doc.setFont("helvetica", "normal");

      // COLUMNA IZQUIERDA
      let currentYLeft = dataStartY;
      doc.setFontSize(labelFontSize);
      doc.text("Razón social:", leftX, currentYLeft);
      doc.setFontSize(valueFontSize);
      doc.text(cliente.nombre || "", leftX + 35, currentYLeft);

      currentYLeft += lineSpacing;
      doc.setFontSize(labelFontSize);
      doc.text("Localidad:", leftX, currentYLeft);
      doc.setFontSize(valueFontSize);
      doc.text(cliente.localidad || "", leftX + 35, currentYLeft);

      currentYLeft += lineSpacing;
      doc.setFontSize(labelFontSize);
      doc.text("Domicilio:", leftX, currentYLeft);
      doc.setFontSize(valueFontSize);
      doc.text(cliente.domicilio || "", leftX + 35, currentYLeft);

      currentYLeft += lineSpacing;
      doc.setFontSize(labelFontSize);
      doc.text("Teléfono:", leftX, currentYLeft);
      doc.setFontSize(valueFontSize);
      doc.text(cliente.telefono || "", leftX + 35, currentYLeft);

      // COLUMNA DERECHA
      let currentYRight = dataStartY;
      doc.setFontSize(labelFontSize);
      doc.text("DNI:", rightX, currentYRight);
      doc.setFontSize(valueFontSize);
      doc.text(cliente.dni || "", rightX + 25, currentYRight);

      currentYRight += lineSpacing;
      doc.setFontSize(labelFontSize);
      doc.text("CUIT/CUIL:", rightX, currentYRight);
      doc.setFontSize(valueFontSize);
      doc.text(cliente.cuit || "", rightX + 25, currentYRight);

      currentYRight += lineSpacing;
      doc.setFontSize(labelFontSize);
      doc.text("IVA:", rightX, currentYRight);
      doc.setFontSize(valueFontSize);
      doc.text(cliente.iva || "", rightX + 25, currentYRight);

      currentYRight += lineSpacing;
      doc.setFontSize(labelFontSize);
      doc.text("Ingresos Brutos:", rightX, currentYRight);
      doc.setFontSize(valueFontSize);
      doc.text(cliente.iibb || "", rightX + 40, currentYRight);

      // --- SECCIÓN DETALLE DE ITEMS ---
      const detalleY = clientesY + clientesHeight + 30;
      const detalleHeight = 10;
      const detalleX = 0;
      const detalleWidth = pageWidth;

      doc.rect(detalleX, detalleY, detalleWidth, detalleHeight);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);

      // Columnas: quito la columna de "Código" según pedido
      const columns = [
        { title: "Cantidad", x: detalleX + 6, align: "left" as const },
        { title: "Descripcion", x: detalleX + 36, align: "center" as const },
        { title: "%IVA", x: detalleX + 120, align: "center" as const },
        { title: "P. Unit.", x: detalleX + 150, align: "right" as const },
        { title: "Total s/imp", x: detalleX + 180, align: "right" as const },
        { title: "Total", x: detalleX + 202, align: "right" as const },

      ];

      const headerTextY = detalleY + detalleHeight / 2 + 2;
      columns.forEach((col) => {
        doc.text(col.title, col.x, headerTextY, { align: col.align });
      });

      const detalleContenidoY = detalleY + detalleHeight;
      doc.line(
        detalleX,
        detalleContenidoY,
        detalleX + detalleWidth,
        detalleContenidoY
      );

      // ---------- Helpers para extraer precios ----------
      const ivaPorcentaje = 21;

      const getPrecioUnitario = (v: any): number => {
        const candidato =
          v.detalles?.precios?.precioVentaTotal ??
          v.detalles?.precioVentaTotal ??
          v.detalles?.ventana?.precios?.precioVentaTotal ??
          v.detalles?.mosquitero?.precios?.precioVentaTotal ??
          v.precio;

        if (typeof candidato === "number" && !isNaN(candidato))
          return candidato;

        const pc =
          v.precioConIVA ??
          v.detalles?.precios?.precioVentaConIVA ??
          v.detalles?.precioVentaConIVA;

        if (typeof pc === "number" && !isNaN(pc)) {
          return pc / (1 + ivaPorcentaje / 100);
        }

        return 0;
      };

      const getPrecioConIVA = (v: any, precioUnitario: number): number => {
        const candidato =
          v.precioConIVA ??
          v.detalles?.precios?.precioVentaConIVA ??
          v.detalles?.precioVentaConIVA;

        if (typeof candidato === "number" && !isNaN(candidato))
          return candidato;

        return precioUnitario * (1 + ivaPorcentaje / 100);
      };

      // ---------- AGRUPAR VENTANAS IGUALES ----------
      const gruposMap = new Map<
        string,
        {
          ids: string[];
          tipo: string;
          tipoNombre: string;
          medidas: string;
          descripcion: string;
          acabadoColor?: string;
          precioUnitario: number;
          precioConIVA: number;
          cantidad: number;
          ejemploDetalle?: any;
        }
      >();

      ventanas.forEach((v) => {
        const vidrioExteriorId =
          v.detalles?.vidrios?.vidrioExterior?.id ?? "ne";
        const vidrioInteriorId =
          v.detalles?.vidrios?.vidrioInterior?.id ?? "ni";
        const esDvhKey = v.detalles?.vidrios?.esDvh ? "dvh" : "s";
        const key = `${v.tipo}|${v.medidas}|${
          v.acabado?.color ?? ""
        }|${vidrioExteriorId}|${vidrioInteriorId}|${esDvhKey}|${
          v.incluirMosquitero ? "m" : "n"
        }`;

        const precioUnit = getPrecioUnitario(v);
        const precioIVA = getPrecioConIVA(v, precioUnit);

        if (!gruposMap.has(key)) {
          gruposMap.set(key, {
            ids: [v.codigo ?? v.id],
            tipo: v.tipo,
            tipoNombre: v.tipoNombre,
            medidas: v.medidas,
            descripcion: v.descripcion ?? "",
            acabadoColor: v.acabado?.color,
            precioUnitario: precioUnit,
            precioConIVA: precioIVA,
            cantidad: 1,
            ejemploDetalle: v.detalles,
          });
        } else {
          const g = gruposMap.get(key)!;
          g.ids.push(v.codigo ?? v.id);
          g.cantidad += 1;
        }
      });

      const grupos = Array.from(gruposMap.values());

      // ---------- Imprimir filas (una por grupo) ----------
      let currentY = detalleContenidoY + 8;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);

      let subtotal = 0;

      grupos.forEach((g) => {
  const precioUnitario = Number(g.precioUnitario || 0);
  const precioConIVAUnit = Number(
    g.precioConIVA || precioUnitario * (1 + ivaPorcentaje / 100)
  );
  const cantidad = g.cantidad || 1;

  // total sin impuestos (por grupo) y total con impuestos (por grupo)
  const totalSinImpuestos = precioUnitario * cantidad;
  const totalConImpuestos = precioConIVAUnit * cantidad;

  // acumular subtotal (sin impuestos) y unidades
  subtotal += totalSinImpuestos;

  // construir descripción breve
  const tipoVidrio = g.ejemploDetalle?.vidrios?.esDvh
    ? `DVH (${g.ejemploDetalle?.vidrios?.vidrioExterior?.nombre ?? "N/A"} + ${g.ejemploDetalle?.vidrios?.vidrioInterior?.nombre ?? "N/A"})`
    : `Simple (${g.ejemploDetalle?.vidrios?.vidrioExterior?.nombre ?? "N/A"})`;

  const descripcion = `${g.tipoNombre} ${g.medidas} | Acabado: ${g.acabadoColor ?? "N/A"} | Vidrio: ${tipoVidrio}`;

  const descripcionLines = doc.splitTextToSize(descripcion, 80);
  const rowHeight = Math.max(8, descripcionLines.length * 5);

  // Imprimo cantidad, descripción, iva, unitario, total sin impuestos y total con impuestos
  doc.text(String(cantidad), detalleX + 16, currentY, { align: "center" });
  doc.text(descripcionLines, detalleX + 26, currentY, { align: "left" });
  doc.text(`${ivaPorcentaje}%`, detalleX + 120, currentY, { align: "center" });
  doc.text(`$${precioUnitario.toFixed(2)}`, detalleX + 150, currentY, { align: "right" });

  // Total sin impuestos (columna que pediste)
  doc.text(`$${totalSinImpuestos.toFixed(2)}`, detalleX + 180, currentY, { align: "right" });

  // Total con impuestos (columna final)
  doc.text(`$${totalConImpuestos.toFixed(2)}`, detalleX + 202, currentY, { align: "right" });

  currentY += rowHeight + 4;

  doc.line(detalleX, currentY - 3, detalleX + detalleWidth, currentY - 3);

  if (currentY > pageHeight - 70) {
    doc.addPage();
    currentY = 20;
  }
});


      // ---------- VALOR TOTAL (sin impuestos / con impuestos) ----------
      const descuento = 0;
      const neto = subtotal - descuento;
      const ivaMonto = neto * (ivaPorcentaje / 100);
      const totalFinal = neto + ivaMonto;
      // total de unidades en el presupuesto (sumando las cantidades de cada grupo)
const totalUnidades = grupos.reduce((s, g) => s + (g.cantidad || 0), 0);


      // Caja con los dos valores solicitados
      const boxW = 140;
      const boxH = 18;
      const boxX = pageWidth - marginX - boxW;
      const boxY = pageHeight - boxH - 42; // ligeramente encima del área de totales

      doc.rect(boxX, boxY, boxW, boxH);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("Valor total sin impuestos:", boxX + 6, boxY + 6, {
        align: "left",
      });
      doc.setFont("helvetica", "normal");
      doc.text(
        `$ ${neto.toLocaleString("es-AR", { minimumFractionDigits: 2 })}`,
        boxX + boxW - 8,
        boxY + 6,
        { align: "right" }
      );

      doc.setFont("helvetica", "bold");
      doc.text("Valor total con impuestos:", boxX + 6, boxY + 14, {
        align: "left",
      });
      doc.setFont("helvetica", "normal");
      doc.text(
        `$ ${totalFinal.toLocaleString("es-AR", { minimumFractionDigits: 2 })}`,
        boxX + boxW - 8,
        boxY + 14,
        { align: "right" }
      );

      // ---------- Totales (bloque tradicional) ----------
      const format = (num: number) =>
        num.toLocaleString("es-AR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });

      const totalesHeight = 18;
      const totalesY = pageHeight - totalesHeight - 12;
      const totalesWidth = pageWidth - marginX * 2;
      const totalesX = marginX;

      doc.rect(totalesX, totalesY, totalesWidth, totalesHeight);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);

      const labels = ["Sub. s/Dto", "Descuento", "Neto", "IVA ($)", "Total"];
      const values = [
        `$${format(subtotal)}`,
        `$${format(descuento)}`,
        `$${format(neto)}`,
        `$${format(ivaMonto)}`,
        `$${format(totalFinal)}`,
      ];

      const colSpacing = totalesWidth / labels.length;
      const baseX = totalesX;
      const labelY = totalesY + 7;

      labels.forEach((label, i) => {
        const xCenter = baseX + colSpacing * i + colSpacing / 2;
        doc.text(label, xCenter, labelY, { align: "center" });
      });

      const valueY = totalesY + totalesHeight - 4;
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

      // Pie de página
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text(
        "Presupuesto válido por 15 días - Precios incluyen IVA",
        marginX,
        pageHeight - 8
      );

      // Abrir PDF
      const pdfBlob = doc.output("bloburl");
      window.open(pdfBlob as any, "_blank");
    };
  };

  return (
    <button
      onClick={generarPDF}
      className="btn btn-primary w-full"
      disabled={!ventanas || ventanas.length === 0}
    >
      Generar Presupuesto
    </button>
  );
}
