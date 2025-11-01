// components/PresupuestoDetalladoPDF.tsx
"use client";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface VentanaAcumulada {
  id: string;
  tipo: 'corrediza2hojas' | 'pañoFijo' | 'mosquitero'; // Agregar 'mosquitero'
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
    
    // Tabla de ventanas SIMPLIFICADA
    autoTable(doc, {
      startY: 75,
      head: [['Item', 'Descripción Detallada', 'Precio']],
      body: ventanas.map((v, index) => {
        // Construir descripción completa con toda la información
        const tipoVidrio = v.detalles.vidrios.esDvh 
          ? `DVH (${v.detalles.vidrios.vidrioExterior?.nombre} + ${v.detalles.vidrios.vidrioInterior?.nombre})`
          : `Simple (${v.detalles.vidrios.vidrioExterior?.nombre})`;
        
        const mosquiteroInfo = v.incluirMosquitero ? ' | INCLUYE MOSQUITERO' : '';
        const pesoInfo = ` | Peso aluminio: ${v.detalles.pesoTotalAluminio.toFixed(2)} kg`;
        
        const descripcion = [
          `${v.tipoNombre} - ${v.medidas}`,
          `Acabado: ${v.acabado.color} | Vidrio: ${tipoVidrio}${mosquiteroInfo}${pesoInfo}`
        ].join('\n');

        return [
          (index + 1).toString(),
          descripcion,
          `$${v.precioConIVA.toFixed(2)}`
        ];
      }),
      styles: { 
        fontSize: 8,
        cellPadding: 3,
        lineColor: [0, 0, 0],
        lineWidth: 0.1
      },
      headStyles: { 
        fillColor: [0, 0, 0],
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 15 }, // Item
        1: { cellWidth: 150 }, // Descripción (muy ancha)
        2: { cellWidth: 30 }  // Precio
      },
      didParseCell: function(data) {
        if (data.section === 'body' && data.column.index === 1) {
          data.cell.styles.fontSize = 7;
        }
      }
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
    
    // Resumen de materiales
    const resumenY = finalY + 35;
    doc.setFontSize(10);
    doc.setFont( 'bold');
    doc.text("RESUMEN DEL PROYECTO:", 15, resumenY);
    
    doc.setFont( 'normal');
    doc.setFontSize(9);
    
    let yOffset = resumenY + 8;
    
    // Resumen general
    const ventanasConMosquitero = ventanas.filter(v => v.incluirMosquitero).length;
    const ventanasDVH = ventanas.filter(v => v.detalles.vidrios.esDvh).length;
    const ventanasSimple = ventanas.filter(v => !v.detalles.vidrios.esDvh).length;
    const pesoTotalAluminio = ventanas.reduce((total, v) => total + v.detalles.pesoTotalAluminio, 0);
    
    doc.text(`• Total de ventanas: ${ventanas.length}`, 20, yOffset);
    yOffset += 6;
    
    if (ventanasConMosquitero > 0) {
      doc.text(`• Ventanas con mosquitero: ${ventanasConMosquitero}`, 20, yOffset);
      yOffset += 6;
    }
    
    doc.text(`• Ventanas con DVH: ${ventanasDVH}`, 20, yOffset);
    yOffset += 6;
    doc.text(`• Ventanas con vidrio simple: ${ventanasSimple}`, 20, yOffset);
    yOffset += 6;
    doc.text(`• Peso total de aluminio: ${pesoTotalAluminio.toFixed(2)} kg`, 20, yOffset);
    yOffset += 6;
    
    // Acabados utilizados
    const acabadosUtilizados = [...new Set(ventanas.map(v => v.acabado.color))];
    if (acabadosUtilizados.length > 0) {
      doc.text(`• Acabados: ${acabadosUtilizados.join(', ')}`, 20, yOffset);
    }

    // Observaciones
    const observacionesY = yOffset + 15;
    doc.setFontSize(9);
    doc.setFont( 'normal');
    doc.text("Observaciones:", 15, observacionesY);
    doc.text("_________________________________________________________________________________________", 15, observacionesY + 5);
    doc.text("_________________________________________________________________________________________", 15, observacionesY + 11);
    
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
      📊 Descargar Presupuesto Detallado Simplificado
    </button>
  );
}









// // Logo
// const logoWidth = 30;
// const logoHeight = 30;
// doc.addImage("/logo.png", "PNG", marginLeft, 8, logoWidth, logoHeight);

// // Texto superior centrado
// doc.setFontSize(9);
// doc.setFont("helvetica", "italic");
// doc.setTextColor(90, 90, 90);
// doc.text("DOCUMENTO NO VÁLIDO COMO FACTURA", pageWidth / 2, 10, { align: "center" });

// // Bloques de texto (alineados izquierda, centro y derecha)
// doc.setFont("helvetica", "normal");
// doc.setFontSize(9);
// doc.setTextColor(0, 0, 0);

// // Izquierda
// const leftStartX = marginLeft + logoWidth + 6;
// doc.text("CUIT: 20-46379053-2", leftStartX, 20);
// doc.text("IVA Responsable Inscripto", leftStartX, 25);
// doc.text("Inicio de actividades: 01/01/2021", leftStartX, 30);

// // Centro
// const centerX = pageWidth / 2;
// doc.text("Av. San Martín 300", centerX, 20, { align: "center" });
// doc.text("Valle Hermoso, Córdoba", centerX, 25, { align: "center" });
// doc.text("Tel: 3548 57-0939", centerX, 30, { align: "center" });

// // Derecha
// const fecha = new Date();
// const dia = fecha.getDate().toString().padStart(2, '0');
// const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
// const anio = fecha.getFullYear();

// doc.text(`Fecha: ${dia}/${mes}/${anio}`, pageWidth - marginLeft, 20, { align: "right" });
// doc.setFont("helvetica", "bold");
// doc.text(`Presupuesto Nº ${numeroPresupuesto}`, pageWidth - marginLeft, 26, { align: "right" });
// doc.setFont("helvetica", "normal");
// doc.text("Aberturas Sagitario", pageWidth - marginLeft, 32, { align: "right" });

// // --- X central (marca divisoria) ---
// doc.setFontSize(10);
// doc.setFont("helvetica", "bold");
// doc.setTextColor(0, 0, 0);
// doc.text("X", centerX, 26, { align: "center" });

// // Línea divisoria inferior del encabezado
// doc.setDrawColor(180, 180, 180);
// doc.setLineWidth(0.3);
// doc.line(marginLeft, headerHeight + 5, pageWidth - marginLeft, headerHeight + 5);


// // Mover el cursor Y debajo del encabezado
// currentY = headerHeight + 12;

    // // --- CLIENTE ---
    // doc.setFont("helvetica", "bold");
    // doc.text("CLIENTE", marginLeft, currentY);
    // currentY += 5;

    // // Razón Social
    // doc.setFont("helvetica", "normal");
    // doc.text("Razón Social:", marginLeft, currentY);
    // doc.text(cliente.nombre || "______________________", 50, currentY);
    // currentY += 5;

    // // Tabla de datos del cliente
    // const clienteData = [
    //   [
    //     `Domicilio: ${cliente.domicilio || "______________________"}`,
    //     `Tel: ${cliente.telefono || "______________________"}`,
    //     `IBB: ______________________`
    //   ],
    //   [
    //     `Localidad: ______________________`,
    //     ``,
    //     `CUIT/DNI: ______________________`
    //   ]
    // ];

    // autoTable(doc, {
    //   startY: currentY,
    //   body: clienteData,
    //   styles: { 
    //     fontSize: 9,
    //     cellPadding: 2,
    //     lineColor: [0, 0, 0],
    //     lineWidth: 0.1,
    //     minCellHeight: 8
    //   },
    //   theme: 'grid',
    //   tableWidth: 180,
    //   margin: { left: marginLeft },
    //   columnStyles: {
    //     0: { cellWidth: 80 },
    //     1: { cellWidth: 50 },
    //     2: { cellWidth: 50 }
    //   },
    //   didDrawCell: function(data) {
    //     if (data.section === 'body') {
    //       doc.setFontSize(9);
    //       doc.setFont("helvetica", "normal");
    //     }
    //   }
    // });

    // currentY = (doc as any).lastAutoTable.finalY + 8;

    // // --- Tabla de Items ---
    // const tableHeaders = [['Código', 'Cantidad', 'Descripción', '% Iva', 'P.Unit.', 'Total']];
    
    // const tableBody = ventanas.map((ventana, index) => {
    //   // Construir descripción detallada
    //   const tipoVidrio = ventana.detalles.vidrios.esDvh 
    //     ? `DVH (${ventana.detalles.vidrios.vidrioExterior?.nombre} + ${ventana.detalles.vidrios.vidrioInterior?.nombre})`
    //     : `Simple (${ventana.detalles.vidrios.vidrioExterior?.nombre})`;
      
    //   const mosquiteroInfo = ventana.incluirMosquitero ? ' + Mosquitero' : '';
      
    //   const descripcion = [
    //     `${ventana.tipoNombre} ${ventana.medidas}`,
    //     `Acabado: ${ventana.acabado.color}`,
    //     `Vidrio: ${tipoVidrio}${mosquiteroInfo}`
    //   ].join(' | ');

    //   const precioUnitario = ventana.detalles.precios.precioVentaTotal;
    //   const precioConIVA = ventana.precioConIVA;
    //   const iva = ((precioConIVA - precioUnitario) / precioUnitario * 100).toFixed(0);

    //   return [
    //     (index + 1).toString(), // Código
    //     '1', // Cantidad
    //     descripcion,
    //     `${iva}%`, // % IVA
    //     `$${precioUnitario.toFixed(2)}`, // Precio Unitario sin IVA
    //     `$${precioConIVA.toFixed(2)}` // Total con IVA
    //   ];
    // });

    // autoTable(doc, {
    //   startY: currentY,
    //   head: tableHeaders,
    //   body: tableBody,
    //   styles: { 
    //     fontSize: 8,
    //     cellPadding: 2,
    //     lineColor: [0, 0, 0],
    //     lineWidth: 0.1
    //   },
    //   headStyles: { 
    //     fillColor: [255, 255, 255],
    //     textColor: [0, 0, 0],
    //     fontSize: 8,
    //     fontStyle: 'bold',
    //     lineWidth: 0.1
    //   },
    //   theme: 'grid',
    //   tableWidth: 180,
    //   margin: { left: marginLeft },
    //   columnStyles: {
    //     0: { cellWidth: 20 }, // Código
    //     1: { cellWidth: 20 }, // Cantidad
    //     2: { cellWidth: 70 }, // Descripción
    //     3: { cellWidth: 20 }, // % Iva
    //     4: { cellWidth: 25 }, // P.Unit.
    //     5: { cellWidth: 25 }  // Total
    //   },
    //   didParseCell: function(data) {
    //     if (data.section === 'body') {
    //       data.cell.styles.fontSize = 7;
    //       if (data.column.index === 2) { // Descripción
    //         data.cell.styles.fontSize = 6;
    //       }
    //     }
    //   }
    // });

    // currentY = (doc as any).lastAutoTable.finalY + 5;

    // // --- Totales ---
    // const subtotal = ventanas.reduce((sum, ventana) => sum + ventana.detalles.precios.precioVentaTotal, 0);
    // const ivaMonto = ventanas.reduce((sum, ventana) => sum + (ventana.precioConIVA - ventana.detalles.precios.precioVentaTotal), 0);
    // const total = ventanas.reduce((sum, ventana) => sum + ventana.precioConIVA, 0);

    // // Crear tabla de totales
    // const totalesData = [
    //   [
    //     'SUB.S/DTO',
    //     `$${subtotal.toFixed(2)}`,
    //     'DESCUENTO',
    //     '$0.00',
    //     'NETO',
    //     `$${subtotal.toFixed(2)}`,
    //     'IVA',
    //     `$${ivaMonto.toFixed(2)}`,
    //     'TOTAL',
    //     `$${total.toFixed(2)}`
    //   ]
    // ];

    // autoTable(doc, {
    //   startY: currentY,
    //   body: totalesData,
    //   styles: { 
    //     fontSize: 8,
    //     cellPadding: 2,
    //     lineColor: [0, 0, 0],
    //     lineWidth: 0.1
    //   },
    //   theme: 'grid',
    //   tableWidth: 180,
    //   margin: { left: marginLeft },
    //   columnStyles: {
    //     0: { cellWidth: 25, fontStyle: 'bold' },
    //     1: { cellWidth: 20 },
    //     2: { cellWidth: 25, fontStyle: 'bold' },
    //     3: { cellWidth: 20 },
    //     4: { cellWidth: 15, fontStyle: 'bold' },
    //     5: { cellWidth: 20 },
    //     6: { cellWidth: 15, fontStyle: 'bold' },
    //     7: { cellWidth: 20 },
    //     8: { cellWidth: 15, fontStyle: 'bold' },
    //     9: { cellWidth: 25, fontStyle: 'bold' }
    //   },
    //   didDrawCell: function(data) {
    //     if (data.section === 'body') {
    //       // Hacer que las celdas de etiquetas sean en negrita
    //       if ([0, 2, 4, 6, 8].includes(data.column.index)) {
    //         doc.setFont("helvetica", "bold");
    //       } else {
    //         doc.setFont("helvetica", "normal");
    //       }
    //     }
    //   }
    // });

    // // --- Espacio para observaciones o firmas si es necesario ---
    // currentY = (doc as any).lastAutoTable.finalY + 15;
    // doc.setFontSize(8);
    // doc.setTextColor(100, 100, 100);
    // doc.text("Presupuesto válido por 15 días", marginLeft, currentY);
    // doc.text("Condiciones de pago a convenir", marginLeft, currentY + 4);

//con esto guardas el pdf
// doc.save(`presupuesto-${numeroPresupuesto}.pdf`);

//con esto lo previsualizas