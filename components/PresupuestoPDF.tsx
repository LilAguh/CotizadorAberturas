// components/PresupuestoPDF.tsx
"use client";
import jsPDF from "jspdf";

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

export default function PresupuestoPDF({ ventanas, cliente, numeroPresupuesto }: Props) {
  const generarPDF = async () => {
    const doc = new jsPDF();
    
    // Configuración inicial
    doc.setFont("helvetica");
    const pageWidth = doc.internal.pageSize.getWidth();

    // --- ENCABEZADO SUPERIOR ---
    // --- Texto superior ---
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
// 🔹 Recuadro izquierdo (sin línea derecha)
const leftTopY = yStart;
const leftBottomY = yStart + boxHeight;
doc.line(leftX, leftTopY, leftX + sideBoxWidth, leftTopY); // superior
doc.line(leftX, leftTopY, leftX, leftBottomY);             // izquierda
doc.line(leftX, leftBottomY, leftX + sideBoxWidth, leftBottomY); // inferior
// ❌ no dibujamos la línea derecha completa
// ✅ agregamos media línea derecha (solo hasta la mitad)
doc.line(leftX + sideBoxWidth, leftTopY, leftX + sideBoxWidth, leftTopY + boxHeight - 8);


// 🔹 Recuadro central (más bajo, sin líneas laterales)
doc.rect(centerX, yStart, centerBoxWidth, boxHeight - 12);


// 🔹 Recuadro derecho (sin línea izquierda)
const rightTopY = yStart;
const rightBottomY = yStart + boxHeight;
doc.line(rightX, rightTopY, rightX + sideBoxWidth, rightTopY); // superior
// ❌ no dibujamos línea izquierda completa
// ✅ agregamos media línea izquierda (solo hasta la mitad)
doc.line(rightX, rightTopY, rightX, rightTopY + boxHeight - 8);

doc.line(rightX + sideBoxWidth, rightTopY, rightX + sideBoxWidth, rightBottomY); // derecha
doc.line(rightX, rightBottomY, rightX + sideBoxWidth, rightBottomY); // inferior

// --- Extensiones inferiores laterales (alineadas con la base de los recuadros grandes) ---
const extensionWidth = 13;
const extensionHeight = 8;
const extensionY = yStart + boxHeight - extensionHeight;

// 🔹 Extensión derecha del recuadro izquierdo (sin línea izquierda)
const leftExtensionX = leftX + sideBoxWidth;
doc.line(leftExtensionX, extensionY, leftExtensionX + extensionWidth, extensionY); // superior
doc.line(leftExtensionX + extensionWidth, extensionY, leftExtensionX + extensionWidth, extensionY + extensionHeight); // derecha
doc.line(leftExtensionX, extensionY + extensionHeight, leftExtensionX + extensionWidth, extensionY + extensionHeight); // inferior

// 🔹 Extensión izquierda del recuadro derecho (sin línea derecha)
const rightExtensionX = rightX - extensionWidth;
doc.line(rightExtensionX, extensionY, rightExtensionX + extensionWidth, extensionY); // superior
doc.line(rightExtensionX, extensionY, rightExtensionX, extensionY + extensionHeight); // izquierda
doc.line(rightExtensionX, extensionY + extensionHeight, rightExtensionX + extensionWidth, extensionY + extensionHeight); // inferior

    // --- Cargar imagen desde public ---
const img = new Image();
img.src = "/logo.png"; // ruta en public

img.onload = () => {
  // --- Imagen en el recuadro izquierdo ---
  doc.addImage(img, "PNG", leftX + 1, leftTopY + 1, 32, 32);

  // --- Texto alineado al margen derecho del recuadro ---
  const rightMargin = leftX + sideBoxWidth - 3; // margen derecho dentro del recuadro
  const startY = yStart + 6; // posición inicial vertical
  const lineHeight = 5;      // separación entre líneas

  // Primera línea en negrita
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Valle Hermoso, Córdoba", rightMargin, startY, { align: "right" });

  // Líneas normales
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text("Av. San Martin 300", rightMargin, startY + lineHeight, { align: "right" });
  doc.setFontSize(11);
  doc.text("3548 57-0939", rightMargin, startY + lineHeight * 2, { align: "right" });

  // Última línea en negrita
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("IVA Responsable Inscripto", rightMargin, startY + lineHeight * 5, { align: "right"});

  // --- Texto adicional en recuadro derecho ---
  const rightBoxMargin = rightX + 3; // margen desde el borde izquierdo del recuadro derecho
const rightStartY = yStart + 6;    // posición inicial vertical
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

  // --- Continúa con resto del PDF ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(38);
  const centerX = leftX + sideBoxWidth + 5; // coincide con tu cálculo de centro
  doc.text("X", centerX + 20 / 2, leftTopY + (boxHeight - 15) / 2 + 6, { align: "center" });






// --- SECCIÓN CLIENTES ---
const clientesY = leftTopY + boxHeight + 4; // separación debajo del encabezado
const clientesHeight = 8; // altura del recuadro
const clientesWidth = pageWidth - marginX * 2; // ancho total igual al superior
const clientesX = marginX;

// Dibuja el recuadro
doc.rect(clientesX, clientesY, clientesWidth, clientesHeight);

// Texto centrado exactamente en el medio
doc.setFont("helvetica", "bold");
doc.setFontSize(16);

// Calculamos la posición Y centrada (ajuste fino según tamaño de fuente)
const textY = clientesY + clientesHeight / 2 + 2; // el "+16/3.5" centra visualmente el texto

doc.text("CLIENTES", clientesX + clientesWidth / 2, textY, { align: "center" });


// --- DATOS DEL CLIENTE ---
const dataStartY = clientesY + clientesHeight + 6; // separación debajo del título CLIENTES
const columnWidth = (pageWidth - marginX * 2) / 2; // mitad de ancho total
const lineSpacing = 6; // separación vertical entre líneas
const labelFontSize = 10;
const valueFontSize = 11;

// Fuente
doc.setFont("helvetica", "normal");

// --- COLUMNA IZQUIERDA ---
const leftColumnX = marginX;
let currentY = dataStartY;

doc.setFontSize(labelFontSize);
doc.text("Razón social:", leftColumnX, currentY);
doc.setFontSize(valueFontSize);
doc.text(cliente.nombre || "", leftColumnX + 35, currentY);

currentY += lineSpacing;
doc.setFontSize(labelFontSize);
doc.text("Localidad:", leftColumnX, currentY);
doc.setFontSize(valueFontSize);
doc.text(cliente.localidad || "", leftColumnX + 35, currentY);

currentY += lineSpacing;
doc.setFontSize(labelFontSize);
doc.text("Domicilio:", leftColumnX, currentY);
doc.setFontSize(valueFontSize);
doc.text(cliente.domicilio || "", leftColumnX + 35, currentY);

currentY += lineSpacing;
doc.setFontSize(labelFontSize);
doc.text("Teléfono:", leftColumnX, currentY);
doc.setFontSize(valueFontSize);
doc.text(cliente.telefono || "", leftColumnX + 35, currentY);

// --- COLUMNA DERECHA ---
const rightColumnX = marginX + columnWidth;
currentY = dataStartY;

doc.setFontSize(labelFontSize);
doc.text("DNI:", rightColumnX, currentY);
doc.setFontSize(valueFontSize);
doc.text(cliente.dni || "", rightColumnX + 25, currentY);

currentY += lineSpacing;
doc.setFontSize(labelFontSize);
doc.text("CUIT/CUIL:", rightColumnX, currentY);
doc.setFontSize(valueFontSize);
doc.text(cliente.cuit || "", rightColumnX + 25, currentY);

currentY += lineSpacing;
doc.setFontSize(labelFontSize);
doc.text("IVA:", rightColumnX, currentY);
doc.setFontSize(valueFontSize);
doc.text(cliente.iva || "", rightColumnX + 25, currentY);

currentY += lineSpacing;
doc.setFontSize(labelFontSize);
doc.text("Ingresos Brutos:", rightColumnX, currentY);
doc.setFontSize(valueFontSize);
doc.text(cliente.iibb || "", rightColumnX + 40, currentY);







// --- SECCIÓN DETALLE DE ITEMS ---
const detalleY = clientesY + clientesHeight + 30; // separación debajo de la sección CLIENTES
const detalleHeight = 10; // altura del encabezado
const detalleX = 0; // arranca desde el borde
const detalleWidth = pageWidth; // ocupa todo el ancho

// Dibuja el recuadro principal del encabezado
doc.rect(detalleX, detalleY, detalleWidth, detalleHeight);

// Configura fuente
doc.setFont("helvetica", "bold");
doc.setFontSize(10);

// Definición flexible de columnas
const columns = [
  { title: "Codigo", x: detalleX + 6, align: "left" as const },
  { title: "Cantidad", x: detalleX + 36, align: "center" as const },
  { title: "Descripcion", x: detalleX + 56, align: "left" as const },
  { title: "%IVA", x: detalleX + 150, align: "center" as const },
  { title: "P. Unit.", x: detalleX + 180, align: "right" as const },
  { title: "Total", x: detalleX + 202, align: "right" as const },
];

// Posición vertical centrada del texto
const headerTextY = detalleY + detalleHeight / 2 + 2;

// Escribe los títulos
columns.forEach(col => {
  doc.text(col.title, col.x, headerTextY, { align: col.align });
});

// Línea inferior del encabezado
const detalleContenidoY = detalleY + detalleHeight;
doc.line(detalleX, detalleContenidoY, detalleX + detalleWidth, detalleContenidoY);


// --- EJEMPLO DE 10 FILAS DE DETALLE ---
const rows = [
  {
    codigo: "VTA-001",
    cantidad: 2,
    descripcion: "Ventana corrediza aluminio blanco 1.20 x 1.00 con vidrio simple 4mm",
    iva: "21%",
    pUnit: "85.000",
    total: "170.000",
  },
  {
    codigo: "VTA-002",
    cantidad: 1,
    descripcion: "Ventana de abrir aluminio negro 1.00 x 1.00 con mosquitero",
    iva: "21%",
    pUnit: "92.000",
    total: "92.000",
  },
  {
    codigo: "VTA-003",
    cantidad: 3,
    descripcion: "Paño fijo aluminio gris 0.80 x 1.00 con vidrio templado",
    iva: "21%",
    pUnit: "65.000",
    total: "195.000",
  },
  {
    codigo: "VTA-004",
    cantidad: 1,
    descripcion: "Ventana corrediza doble hoja aluminio blanco 1.50 x 1.20",
    iva: "21%",
    pUnit: "110.000",
    total: "110.000",
  },
  {
    codigo: "VTA-005",
    cantidad: 2,
    descripcion: "Ventana de abrir aluminio negro 1.20 x 1.00 con persiana",
    iva: "21%",
    pUnit: "98.000",
    total: "196.000",
  },
  {
    codigo: "VTA-006",
    cantidad: 1,
    descripcion: "Paño fijo aluminio natural 0.90 x 1.20 con vidrio simple",
    iva: "21%",
    pUnit: "70.000",
    total: "70.000",
  },
  {
    codigo: "VTA-007",
    cantidad: 4,
    descripcion: "Ventana corrediza aluminio gris 1.00 x 1.00 con mosquitero",
    iva: "21%",
    pUnit: "80.000",
    total: "320.000",
  },
  {
    codigo: "VTA-008",
    cantidad: 2,
    descripcion: "Ventana de abrir aluminio blanco 0.80 x 1.20 con vidrio doble",
    iva: "21%",
    pUnit: "95.000",
    total: "190.000",
  },
  {
    codigo: "VTA-009",
    cantidad: 1,
    descripcion: "Paño fijo aluminio negro 1.50 x 0.90 con vidrio templado",
    iva: "21%",
    pUnit: "88.000",
    total: "88.000",
  },
  {
    codigo: "VTA-010",
    cantidad: 3,
    descripcion: "Ventana corrediza aluminio blanco 1.00 x 1.00 con persiana y mosquitero",
    iva: "21%",
    pUnit: "105.000",
    total: "315.000",
  },
];

 currentY = detalleContenidoY + 8; // primera línea de datos
doc.setFont("helvetica", "normal");
doc.setFontSize(9);

rows.forEach(row => {
  // --- Ajustamos la descripción ---
  const maxWidthDescripcion = 80; // colapsa antes (antes era 90)
  const descripcionLines = doc.splitTextToSize(row.descripcion, maxWidthDescripcion);

  // --- Fijamos un alto uniforme para todas las filas ---
  const rowHeight = 10; // altura fija más grande (antes 7 o dinámico)

  // --- Dibujamos los textos ---
  const textY = currentY; // posición base del texto

  doc.text(row.codigo, detalleX + 6, textY, { align: "left" });
  doc.text(String(row.cantidad), detalleX + 36, textY, { align: "center" });
  doc.text(descripcionLines, detalleX + 56, textY, { align: "left" });
  doc.text(row.iva, detalleX + 150, textY, { align: "center" });
  doc.text(row.pUnit, detalleX + 180, textY, { align: "right" });
  doc.text(row.total, detalleX + 202, textY, { align: "right" });

  // --- Línea inferior entre filas ---
  currentY += rowHeight + 3; // +3 para una separación visual más agradable
  doc.line(detalleX, currentY - 5, detalleX + detalleWidth, currentY - 5);
});





// --- CALCULAR TOTALES DINÁMICOS ---
let subtotal = 0;
let ivaPorcentaje = 21; // podés hacerlo dinámico si cambia por ítem

rows.forEach(row => {
  // eliminamos puntos y convertimos a número
  const totalNum = Number(row.total.replace(/\./g, ""));
  subtotal += totalNum;
});

const descuento = 0; // podrías hacerlo dinámico más adelante
const neto = subtotal - descuento;
const ivaMonto = neto * (ivaPorcentaje / 100);
const totalFinal = neto + ivaMonto;

// --- FORMATO DE MONEDA ---
const format = (num: number) =>
  num.toLocaleString("es-AR", { minimumFractionDigits: 0 });

// --- SECCIÓN TOTALES ---
const pageHeight = doc.internal.pageSize.height;
const totalesHeight = 10;
const totalesY = pageHeight - totalesHeight - 30;
const totalesWidth = pageWidth - marginX * 2;
const totalesX = marginX;

// Dibuja el recuadro
doc.rect(totalesX, totalesY, totalesWidth, totalesHeight);

// Configura fuente
doc.setFont("helvetica", "bold");
doc.setFontSize(10);

// Etiquetas
const labels = ["Sub. s/Dto", "Descuento", "Neto", "IVA", "Total"];
const values = [
  `$${format(subtotal)}`,
  `$${format(descuento)}`,
  `$${format(neto)}`,
  `${ivaPorcentaje}%`,
  `$${format(totalFinal)}`
];

// Distribución horizontal
const colSpacing = totalesWidth / labels.length;
const baseX = totalesX;

// Posición vertical de las etiquetas dentro del recuadro
const labelY = totalesY + totalesHeight / 2 + 3;

// Dibuja las etiquetas
labels.forEach((label, i) => {
  const xCenter = baseX + colSpacing * i + colSpacing / 2;
  doc.text(label, xCenter, labelY, { align: "center" });
});

// --- VALORES DEBAJO DEL RECUADRO ---
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







  // Abrir PDF
  const pdfBlob = doc.output("bloburl");
  window.open(pdfBlob, "_blank");
};

    // doc.setFontSize(10);
    // doc.text("Fecha:", extensionX
  };

  return (
    <button
      onClick={generarPDF}
      className="btn btn-primary w-full"
    >
      Generar Presupuesto
    </button>
  );
}