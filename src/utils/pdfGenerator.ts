import { jsPDF } from 'jspdf';
import { InventoryMovement } from '../types';
import { createMariaMariaLogoDataUrl } from './logoData';

// Helper to normalize items
const getNormalizedItems = (movement: InventoryMovement) => {
  if (movement.items && movement.items.length > 0) {
    return movement.items;
  }
  return [
    {
      productId: movement.perfumeId || 'item-1',
      productName: movement.productName || 'Fragancia Selecta',
      brand: movement.brand || '',
      quantity: Math.abs(movement.quantity),
      unitPrice: movement.unitPrice || 270.0,
      totalPrice: movement.totalPrice,
      volume: '60ml',
    },
  ];
};

/**
 * Universal Mobile + Desktop Downloader & Native Share handler
 * Fully compatible with Firefox Mobile, Chrome Android, Safari iOS, and Desktop.
 */
export const downloadOrSharePdf = async (
  doc: jsPDF,
  filename: string,
  title: string = 'Nota de Venta'
): Promise<void> => {
  const userAgent = navigator.userAgent || '';
  const isFirefox = /Firefox/i.test(userAgent);
  const isMobile =
    /Android|iPhone|iPad|iPod|Windows Phone/i.test(userAgent) ||
    (navigator.maxTouchPoints > 0 && window.innerWidth < 900);

  // 1. In standard mobile browsers (Chrome / Safari), try native share with file if available
  if (!isFirefox && isMobile && typeof navigator.canShare === 'function') {
    try {
      const blob = doc.output('blob');
      const file = new File([blob], filename, { type: 'application/pdf' });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: title,
          text: title,
        });
        return;
      }
    } catch (shareErr: any) {
      if (shareErr?.name === 'AbortError') {
        // User dismissed the native share sheet
        return;
      }
      console.warn('Web Share API failed or not allowed, falling back to direct download:', shareErr);
    }
  }

  // 2. Primary Method for Firefox Mobile & General Mobile:
  // Data URI + Octet-Stream/PDF download link.
  // Firefox on Android reliably prompts file download when given a data URI with download attribute.
  try {
    const dataUri = doc.output('datauristring');
    const link = document.createElement('a');
    link.href = dataUri;
    link.download = filename;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
    }, 3000);
    return;
  } catch (dataUriErr) {
    console.warn('Data URI download failed:', dataUriErr);
  }

  // 3. Fallback: Blob URL download
  try {
    const blob = doc.output('blob');
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
      URL.revokeObjectURL(blobUrl);
    }, 15000);
    return;
  } catch (blobErr) {
    console.warn('Blob URL download failed:', blobErr);
  }

  // 4. Fallback: doc.save
  try {
    doc.save(filename);
  } catch (saveErr) {
    console.warn('doc.save failed, attempting direct window.open:', saveErr);
    try {
      const fallbackUri = doc.output('datauristring');
      window.open(fallbackUri, '_blank');
    } catch (finalErr) {
      console.error('All PDF download mechanisms exhausted:', finalErr);
    }
  }
};

/**
 * 1. TICKET FORMAT (58 mm Width - Grayscale for Thermal Printer)
 * Includes small grayscale logo at the top
 */
export const generateSaleTicketPdf = async (movement: InventoryMovement): Promise<void> => {
  const isSale = movement.type === 'VENTA';
  const folio = `FOL-${movement.id.slice(-6).toUpperCase()}`;
  const items = getNormalizedItems(movement);

  const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = movement.subtotal || items.reduce(
    (sum, item) => sum + (item.totalPrice || (item.unitPrice || 270.0) * item.quantity),
    0
  );
  const discountAmount = movement.discountAmount || 0;
  const total = movement.totalPrice;

  // 58 mm width
  const docWidth = 58;
  const leftMargin = 3.5;
  const rightMargin = 54.5;
  const contentWidth = rightMargin - leftMargin;

  // Dynamic height calculation
  let estimatedItemsHeight = 0;
  items.forEach((item) => {
    estimatedItemsHeight += item.productName.length > 20 ? 11.5 : 9;
  });
  const docHeight = Math.max(120, 58 + estimatedItemsHeight + (discountAmount > 0 ? 32 : 26) + 30);

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [docWidth, docHeight],
  });

  const centerX = docWidth / 2;
  let currentY = 5;

  const drawDashedLine = (y: number) => {
    doc.setDrawColor(90, 90, 90);
    doc.setLineWidth(0.2);
    doc.setLineDashPattern([1, 1], 0);
    doc.line(leftMargin, y, rightMargin, y);
    doc.setLineDashPattern([], 0);
  };

  const drawSolidLine = (y: number, weight = 0.25) => {
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(weight);
    doc.setLineDashPattern([], 0);
    doc.line(leftMargin, y, rightMargin, y);
  };

  // --- Small Grayscale Logo at top ---
  try {
    const grayLogoUrl = createMariaMariaLogoDataUrl({ grayscale: true, size: 300 });
    const logoSize = 16; // 16mm diameter
    doc.addImage(grayLogoUrl, 'PNG', centerX - logoSize / 2, currentY, logoSize, logoSize);
    currentY += logoSize + 2.5;
  } catch (e) {
    console.warn('Could not render logo in ticket:', e);
    currentY += 2;
  }

  // --- Brand Text Header ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.text('OLOR GARDENIA', centerX, currentY, { align: 'center' });

  currentY += 2.8;
  drawDashedLine(currentY);

  // --- Document Title & Folio ---
  currentY += 3.5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);
  doc.text(isSale ? 'TICKET DE VENTA' : 'COMPROBANTE MOVIMIENTO', centerX, currentY, { align: 'center' });

  currentY += 3.2;
  doc.setFont('courier', 'bold');
  doc.setFontSize(7.5);
  doc.text(`FOLIO: ${folio}`, centerX, currentY, { align: 'center' });

  currentY += 3;
  drawDashedLine(currentY);

  // --- Meta Info (Date, Time, Payment) ---
  currentY += 3.2;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.2);
  doc.setTextColor(40, 40, 40);

  doc.text(`Fecha: ${movement.date}`, leftMargin, currentY);
  doc.text(`Hora: ${movement.time}`, rightMargin, currentY, { align: 'right' });

  if (isSale) {
    currentY += 2.8;
    doc.text(`Pago: ${movement.paymentMethod || 'Efectivo'}`, leftMargin, currentY);
    doc.setFont('helvetica', 'bold');
    doc.text('PAGADO', rightMargin, currentY, { align: 'right' });
  }

  currentY += 2.5;
  drawSolidLine(currentY, 0.3);

  // --- Table Header ---
  currentY += 3;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.setTextColor(0, 0, 0);
  doc.text('CANT', leftMargin, currentY);
  doc.text('DESCRIPCIÓN', leftMargin + 8, currentY);
  doc.text('TOTAL', rightMargin, currentY, { align: 'right' });

  currentY += 1.8;
  drawDashedLine(currentY);

  // --- Items ---
  currentY += 3;
  items.forEach((it) => {
    const uPrice = it.unitPrice || 270.0;
    const iTotal = it.totalPrice || uPrice * it.quantity;

    doc.setFont('courier', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(0, 0, 0);
    doc.text(`${it.quantity}x`, leftMargin, currentY);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    const splitName = doc.splitTextToSize(it.productName, 30);
    doc.text(splitName, leftMargin + 8, currentY);

    doc.setFont('courier', 'bold');
    doc.setFontSize(7.2);
    doc.text(`$${iTotal.toFixed(2)}`, rightMargin, currentY, { align: 'right' });

    const brandVol = `${it.brand ? it.brand + ' ' : ''}($${uPrice.toFixed(2)} c/u)`;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.5);
    doc.setTextColor(90, 90, 90);
    const subLineY = currentY + (splitName.length * 2.8);
    doc.text(brandVol, leftMargin + 8, subLineY);

    currentY = subLineY + 3.2;
  });

  drawDashedLine(currentY);

  // --- Subtotal & Discounts ---
  currentY += 3;
  if (discountAmount > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.2);
    doc.setTextColor(50, 50, 50);
    doc.text(`Subtotal (${totalItemsCount} pzas):`, leftMargin, currentY);
    doc.setFont('courier', 'normal');
    doc.text(`$${subtotal.toFixed(2)}`, rightMargin, currentY, { align: 'right' });

    currentY += 3;
    doc.setFont('helvetica', 'bold');
    doc.text(`Desc. Amigo (${movement.discountPercent || 10}%):`, leftMargin, currentY);
    doc.setFont('courier', 'bold');
    doc.text(`-$${discountAmount.toFixed(2)}`, rightMargin, currentY, { align: 'right' });

    currentY += 2.2;
    drawDashedLine(currentY);
    currentY += 3;
  }

  // --- TOTAL ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(0, 0, 0);
  doc.text('TOTAL:', leftMargin, currentY + 0.5);

  doc.setFont('courier', 'bold');
  doc.setFontSize(9.5);
  doc.text(`$${total.toFixed(2)}`, rightMargin, currentY + 0.5, { align: 'right' });

  currentY += 3.5;
  drawSolidLine(currentY, 0.4);

  // --- Footer ---
  currentY += 3.5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(0, 0, 0);
  doc.text('¡GRACIAS POR SU COMPRA!', centerX, currentY, { align: 'center' });

  currentY += 2.8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.5);
  doc.setTextColor(70, 70, 70);
  doc.text(`Artículos totales: ${totalItemsCount}`, centerX, currentY, { align: 'center' });

  // --- Disclaimer ---
  currentY += 3.5;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(4.4);
  doc.setTextColor(100, 100, 100);
  const disclaimerText = 'Contratipos en consonancia olfativa. Nombres y marcas son propiedad de sus titulares y usados únicamente con fines ilustrativos y de referencia.';
  const splitDisclaimer = doc.splitTextToSize(disclaimerText, contentWidth);
  doc.text(splitDisclaimer, centerX, currentY, { align: 'center' });

  const filename = `Ticket_${folio}_${movement.date}.pdf`;
  await downloadOrSharePdf(doc, filename, `Ticket ${folio} - María María Fragancias`);
};

/**
 * 2. EXECUTIVE PDF FORMAT (105 mm Width - Luxury Golden Layout with Watermark)
 * Includes centered background logo watermark and top gold branding
 */
export const generateSaleExecutivePdf = async (movement: InventoryMovement): Promise<void> => {
  const isSale = movement.type === 'VENTA';
  const folio = `FOL-${movement.id.slice(-6).toUpperCase()}`;
  const items = getNormalizedItems(movement);

  const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = movement.subtotal || items.reduce(
    (sum, item) => sum + (item.totalPrice || (item.unitPrice || 270.0) * item.quantity),
    0
  );
  const discountAmount = movement.discountAmount || 0;
  const total = movement.totalPrice;

  const docWidth = 105; // 105 mm (Half-A4 width, comfortable high-resolution note)
  const baseHeight = 185;
  const itemHeightEstimate = items.length * 13;
  const docHeight = Math.max(195, baseHeight + itemHeightEstimate);

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [docWidth, docHeight],
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const centerX = pageWidth / 2;

  // --- 1. Background Watermark (Subtle Translucent Logo) ---
  try {
    const watermarkUrl = createMariaMariaLogoDataUrl({ watermark: true, size: 600 });
    const watermarkSize = 75; // 75 mm diameter centered
    const watermarkY = (docHeight - watermarkSize) / 2;
    doc.addImage(watermarkUrl, 'PNG', centerX - watermarkSize / 2, watermarkY, watermarkSize, watermarkSize);
  } catch (e) {
    console.warn('Could not render watermark:', e);
  }

  let currentY = 7;

  // --- Top Gold Header Accent Bar ---
  doc.setFillColor(212, 175, 55); // #d4af37 Gold
  doc.rect(0, 0, pageWidth, 4, 'F');

  // --- Header Logo (Full Color Crisp Emblem) ---
  try {
    const colorLogoUrl = createMariaMariaLogoDataUrl({ grayscale: false, size: 400 });
    const topLogoSize = 22; // 22mm diameter
    doc.addImage(colorLogoUrl, 'PNG', centerX - topLogoSize / 2, currentY, topLogoSize, topLogoSize);
    currentY += topLogoSize + 3;
  } catch (e) {
    currentY += 4;
  }

  // --- Brand Name & Subtitle ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(24, 24, 32);
  doc.text('OLOR GARDENIA', centerX, currentY, { align: 'center' });

  // Divider
  currentY += 4.5;
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.4);
  doc.line(10, currentY, pageWidth - 10, currentY);

  // --- Document Title & Folio ---
  currentY += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(24, 24, 32);
  doc.text(isSale ? 'NOTA DE VENTA' : 'COMPROBANTE DE MOVIMIENTO', centerX, currentY, { align: 'center' });

  currentY += 4.2;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(190, 145, 30);
  doc.text(`Folio: ${folio}`, centerX, currentY, { align: 'center' });

  // --- Meta Info Box ---
  currentY += 4.5;
  const metaBoxY = currentY;
  doc.setFillColor(250, 248, 242);
  doc.roundedRect(10, metaBoxY, pageWidth - 20, 15, 2, 2, 'F');
  doc.setDrawColor(228, 220, 200);
  doc.roundedRect(10, metaBoxY, pageWidth - 20, 15, 2, 2, 'S');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(100, 95, 85);
  doc.text('Fecha:', 14, metaBoxY + 5.5);
  doc.text('Hora:', 14, metaBoxY + 10.5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 30, 40);
  doc.text(`${movement.date}`, 26, metaBoxY + 5.5);
  doc.text(`${movement.time}`, 26, metaBoxY + 10.5);

  if (isSale) {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 95, 85);
    doc.text('Método de pago:', 58, metaBoxY + 5.5);
    doc.text('Estado:', 58, metaBoxY + 10.5);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 40);
    doc.text(`${movement.paymentMethod || 'Efectivo'}`, 80, metaBoxY + 5.5);
    doc.setTextColor(30, 150, 90);
    doc.text('PAGADO', 80, metaBoxY + 10.5);
  }

  currentY = metaBoxY + 19;

  // --- Table Header ---
  doc.setFillColor(242, 236, 220);
  doc.rect(10, currentY, pageWidth - 20, 6, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(60, 55, 45);
  doc.text('CANT.', 13, currentY + 4.2);
  doc.text('FRAGANCIA / DETALLE', 26, currentY + 4.2);
  doc.text('P. UNIT', 74, currentY + 4.2, { align: 'right' });
  doc.text('TOTAL', pageWidth - 13, currentY + 4.2, { align: 'right' });

  currentY += 7.5;

  // --- Table Items ---
  items.forEach((it) => {
    const uPrice = it.unitPrice || 270.0;
    const iTotal = it.totalPrice || uPrice * it.quantity;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(24, 24, 32);
    doc.text(`${it.quantity}x`, 13, currentY + 1);

    // Product Name
    const nameLines = doc.splitTextToSize(it.productName, 46);
    doc.text(nameLines, 26, currentY + 1);

    // Brand and Volume detail
    const brandVol = `${it.brand ? it.brand + ' • ' : ''}${it.volume || '60ml'}`;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.2);
    doc.setTextColor(120, 115, 105);
    const subLineY = currentY + 1 + nameLines.length * 3.2;
    doc.text(brandVol, 26, subLineY);

    // Unit Price & Line Total
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(90, 85, 75);
    doc.text(`$${uPrice.toFixed(2)}`, 74, currentY + 1, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(24, 24, 32);
    doc.text(`$${iTotal.toFixed(2)}`, pageWidth - 13, currentY + 1, { align: 'right' });

    currentY += Math.max(10, nameLines.length * 3.2 + 6.5);

    // Subtle divider
    doc.setDrawColor(240, 236, 226);
    doc.setLineWidth(0.2);
    doc.line(10, currentY - 1.5, pageWidth - 10, currentY - 1.5);
  });

  currentY += 2;

  // --- Subtotal & Discounts Section ---
  if (discountAmount > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(110, 105, 95);
    doc.text(`Subtotal (${totalItemsCount} unidades):`, 46, currentY);
    doc.text(`$${subtotal.toFixed(2)}`, pageWidth - 13, currentY, { align: 'right' });

    currentY += 4.5;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(190, 70, 60);
    doc.text(`Descuento Amigo (${movement.discountPercent || 10}%):`, 46, currentY);
    doc.text(`-$${discountAmount.toFixed(2)}`, pageWidth - 13, currentY, { align: 'right' });

    currentY += 5;
  }

  // --- Grand Total Box ---
  const totalBoxY = currentY;
  doc.setFillColor(24, 24, 32);
  doc.roundedRect(10, totalBoxY, pageWidth - 20, 13, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(212, 175, 55); // Gold
  doc.text('TOTAL A PAGAR', 14, totalBoxY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(190, 185, 175);
  doc.text(`${totalItemsCount} ${totalItemsCount === 1 ? 'pieza' : 'piezas'}`, 14, totalBoxY + 9.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(242, 202, 80);
  doc.text(`$${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN`, pageWidth - 14, totalBoxY + 8.5, { align: 'right' });

  currentY = totalBoxY + 18;

  // --- Footer Messages ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(40, 40, 50);
  doc.text('¡Gracias por tu preferencia!', centerX, currentY, { align: 'center' });

  // --- Legal Disclaimer ---
  currentY += 5;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(5.2);
  doc.setTextColor(130, 125, 115);
  const disclaimerText = 'Los perfumes de Olor Gardenia son contratipos en consonancia olfativa con estos perfumes. Las imágenes de los frascos y los nombres originales son marcas registradas y utilizados únicamente como referencia.';
  const splitDisclaimer = doc.splitTextToSize(disclaimerText, pageWidth - 20);
  doc.text(splitDisclaimer, centerX, currentY, { align: 'center' });

  // --- Bottom Gold Accent Bar ---
  doc.setFillColor(212, 175, 55);
  doc.rect(centerX - 15, docHeight - 3.5, 30, 1, 'F');

  const filename = `Nota_Venta_PDF_${folio}_${movement.date}.pdf`;
  await downloadOrSharePdf(doc, filename, `Nota de Venta ${folio} - Olor Gardenia`);
};

// Default export alias
export const generateSalePdf = generateSaleExecutivePdf;
