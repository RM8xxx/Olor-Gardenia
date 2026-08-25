import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Receipt,
  Calendar,
  CreditCard,
  Banknote,
  ArrowLeftRight,
  ShieldCheck,
  FileDown,
  Printer,
  Check,
  Flower2
} from 'lucide-react';
import { InventoryMovement } from '../types';
import { generateSaleTicketPdf, generateSaleExecutivePdf } from '../utils/pdfGenerator';

// Stylized Gardenia floral emblem icon
export const GardeniaIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Center core */}
    <circle cx="12" cy="12" r="2.2" fill="currentColor" fillOpacity="0.8" />
    {/* Delicate gardenia multi-petals */}
    <path d="M12 2.5C9.5 4.8 9.5 7.8 12 10.2C14.5 7.8 14.5 4.8 12 2.5Z" fill="currentColor" fillOpacity="0.25" />
    <path d="M21.5 12C19.2 9.5 16.2 9.5 13.8 12C16.2 14.5 19.2 14.5 21.5 12Z" fill="currentColor" fillOpacity="0.25" />
    <path d="M12 21.5C14.5 19.2 14.5 16.2 12 13.8C9.5 16.2 9.5 19.2 12 21.5Z" fill="currentColor" fillOpacity="0.25" />
    <path d="M2.5 12C4.8 14.5 7.8 14.5 10.2 12C7.8 9.5 4.8 9.5 2.5 12Z" fill="currentColor" fillOpacity="0.25" />
    <path d="M5.3 5.3C7.6 5.8 8.9 7.4 8.7 10C6 9.8 4.4 8.5 5.3 5.3Z" fill="currentColor" fillOpacity="0.35" />
    <path d="M18.7 5.3C18.2 7.6 16.6 8.9 14 8.7C14.2 6 15.5 4.4 18.7 5.3Z" fill="currentColor" fillOpacity="0.35" />
    <path d="M18.7 18.7C16.4 18.2 15.1 16.6 15.3 14C18 14.2 19.6 15.5 18.7 18.7Z" fill="currentColor" fillOpacity="0.35" />
    <path d="M5.3 18.7C5.8 16.4 7.4 15.1 10 15.3C9.8 18 8.5 19.6 5.3 18.7Z" fill="currentColor" fillOpacity="0.35" />
  </svg>
);

const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="0" fill="currentColor" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.888 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

interface SaleReceiptModalProps {
  movement: InventoryMovement | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SaleReceiptModal: React.FC<SaleReceiptModalProps> = ({
  movement,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !movement) return null;

  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState<'pdf' | 'ticket' | null>(null);

  const isSale = movement.type === 'VENTA';

  // Normalize items
  const items = movement.items || [
    {
      productId: movement.perfumeId || 'item-1',
      productName: movement.productName || 'Fragancia Selecta',
      brand: movement.brand || '',
      quantity: Math.abs(movement.quantity),
      unitPrice: movement.unitPrice || 270.0,
      totalPrice: movement.totalPrice,
    },
  ];

  const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + (item.totalPrice || (item.unitPrice || 0) * item.quantity),
    0
  );
  const total = movement.totalPrice;
  const discountAmount = movement.discountAmount || 0;
  const folio = `FOL-${movement.id.slice(-6).toUpperCase()}`;

  // Formatted date string
  const formattedDate = movement.date;
  const formattedTime = movement.time;

  // Generate plain text note for WhatsApp / Sharing
  const generateShareText = () => {
    let text = `🌸 *OLOR GARDENIA*\n`;
    text += `*${isSale ? 'NOTA DE VENTA' : 'COMPROBANTE DE MOVIMIENTO'}*\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `📄 *Folio:* ${folio}\n`;
    text += `📅 *Fecha:* ${formattedDate} • ${formattedTime}\n`;
    if (isSale && movement.paymentMethod) {
      text += `💳 *Método de Pago:* ${movement.paymentMethod}\n`;
    }
    text += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
    text += `🛍️ *PRODUCTOS:*\n`;

    items.forEach((it) => {
      const uPrice = it.unitPrice || 270.0;
      const iTotal = it.totalPrice || uPrice * it.quantity;
      text += `• ${it.quantity}x ${it.productName}`;
      if (it.brand) text += ` _(${it.brand})_`;
      text += `\n   $${uPrice.toFixed(2)} c/u  ➜  *$${iTotal.toFixed(2)}*\n`;
    });

    text += `\n━━━━━━━━━━━━━━━━━━━━━\n`;
    if (discountAmount > 0) {
      text += `🏷️ Subtotal: $${subtotal.toFixed(2)}\n`;
      text += `✨ Descuento (${movement.discountPercent || 10}%): -$${discountAmount.toFixed(2)}\n`;
    }
    text += `💰 *TOTAL: $${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}*\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `✨ _¡Gracias por su preferencia!_`;

    return text;
  };

  const handleShareWhatsApp = () => {
    const text = generateShareText();
    const encoded = encodeURIComponent(text);
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encoded}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleDownloadPdf = async () => {
    try {
      setIsPdfGenerating(true);
      await generateSaleExecutivePdf(movement);
      setPdfSuccess('pdf');
      setTimeout(() => setPdfSuccess(null), 3000);
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setIsPdfGenerating(false);
    }
  };

  const handleDownloadTicket = async () => {
    try {
      setIsPdfGenerating(true);
      await generateSaleTicketPdf(movement);
      setPdfSuccess('ticket');
      setTimeout(() => setPdfSuccess(null), 3000);
    } catch (err) {
      console.error('Error generating Ticket:', err);
    } finally {
      setIsPdfGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-md bg-[#13131b] border border-[#292932] rounded-3xl overflow-hidden shadow-2xl my-auto">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#292932]/70 bg-[#171720]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#f2ca50]/15 flex items-center justify-center text-[#f2ca50]">
              <Receipt className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#e4e1ed]">
              {isSale ? 'Nota de Venta' : 'Comprobante'}
            </span>
          </div>

          <button
            onClick={onClose}
            id="close-receipt-modal-btn"
            title="Cerrar"
            className="p-1.5 rounded-xl text-[#99907c] hover:text-[#e4e1ed] hover:bg-[#23232e] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable & Shareable Receipt Container */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[72vh] overflow-y-auto">
          {/* Paper Ticket Look */}
          <div className="relative p-5 sm:p-6 rounded-2xl bg-[#1b1b24] border border-[#2e2e3a] shadow-inner space-y-4 text-center">
            {/* Top Boutique Branding with Gardenia icon & Olor Gardenia */}
            <div className="space-y-2 pb-3 border-b border-dashed border-[#343442] flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-[#12131a] border-2 border-[#f2ca50] shadow-lg shadow-[#f2ca50]/20 flex items-center justify-center text-[#f2ca50] p-2.5">
                <GardeniaIcon className="w-8 h-8" />
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5 text-[#f2ca50]">
                  <GardeniaIcon className="w-3.5 h-3.5" />
                  <p className="text-[11px] tracking-[0.24em] font-black uppercase text-[#f2ca50]">
                    OLOR GARDENIA
                  </p>
                </div>
                <h3 className="text-base font-bold font-serif-luxury text-[#e4e1ed] mt-0.5">
                  {isSale ? 'Resumen de Venta' : 'Registro de Movimiento'}
                </h3>
                <p className="text-[10px] font-mono text-[#99907c] mt-0.5">
                  {folio} • Atendido por Jess
                </p>
              </div>
            </div>

            {/* Metadata Info Grid */}
            <div className="grid grid-cols-2 gap-2 text-left text-xs bg-[#13131b]/70 p-3 rounded-xl border border-[#24242e]">
              <div>
                <span className="text-[9px] uppercase font-bold text-[#99907c] block">Fecha & Hora</span>
                <p className="font-mono text-[#e4e1ed] text-[11px] flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3 h-3 text-[#f2ca50]" />
                  <span>{formattedDate} {formattedTime}</span>
                </p>
              </div>

              {isSale && (
                <div>
                  <span className="text-[9px] uppercase font-bold text-[#99907c] block">Forma de Pago</span>
                  <p className="font-mono text-[#e4e1ed] text-[11px] flex items-center gap-1 mt-0.5">
                    {movement.paymentMethod === 'Efectivo' ? (
                      <Banknote className="w-3 h-3 text-[#4edea3]" />
                    ) : movement.paymentMethod === 'Tarjeta' ? (
                      <CreditCard className="w-3 h-3 text-[#f2ca50]" />
                    ) : (
                      <ArrowLeftRight className="w-3 h-3 text-[#ffc37b]" />
                    )}
                    <span>{movement.paymentMethod || 'Efectivo'}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Itemized Table */}
            <div className="space-y-2 text-left">
              <div className="flex items-center justify-between text-[10px] uppercase font-bold text-[#99907c] px-1">
                <span>Producto</span>
                <span>Subtotal</span>
              </div>

              <div className="divide-y divide-[#292932]/60">
                {items.map((it, idx) => {
                  const uPrice = it.unitPrice || 270.0;
                  const iTotal = it.totalPrice || uPrice * it.quantity;

                  return (
                    <div key={idx} className="py-2 flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-[#e4e1ed] leading-tight">
                          <span className="text-[#f2ca50] mr-1">{it.quantity}x</span>
                          {it.productName}
                        </p>
                        {it.brand && (
                          <p className="text-[10px] text-[#99907c] truncate mt-0.5">
                            {it.brand}
                          </p>
                        )}
                        <p className="text-[10px] font-mono text-[#99907c] mt-0.5">
                          ${uPrice.toFixed(2)} c/u
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-mono font-bold text-xs text-[#e4e1ed]">
                          ${iTotal.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Subtotal, Discounts and Total */}
            <div className="pt-3 border-t border-dashed border-[#343442] space-y-1.5 text-xs text-left">
              {discountAmount > 0 && (
                <>
                  <div className="flex justify-between text-[#99907c]">
                    <span>Subtotal ({totalItemsCount} unid.):</span>
                    <span className="font-mono">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[#ffb4ab]">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>Descuento Amigo ({movement.discountPercent || 10}%):</span>
                    </span>
                    <span className="font-mono font-bold">-${discountAmount.toFixed(2)}</span>
                  </div>
                </>
              )}

              <div className="flex items-baseline justify-between pt-2 border-t border-[#292932]">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#99907c]">
                    Total a Pagar
                  </span>
                  <p className="text-[10px] text-[#99907c]">
                    {totalItemsCount} {totalItemsCount === 1 ? 'artículo' : 'artículos'}
                  </p>
                </div>
                <span className="text-2xl font-bold font-mono-numbers text-[#f2ca50]">
                  ${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Bottom Footer Note */}
            <div className="pt-2 border-t border-[#292932]/70 text-center">
              <div className="flex items-center justify-center gap-1.5 text-[9px] text-[#99907c]">
                <ShieldCheck className="w-3 h-3 text-[#4edea3]" />
                <span>Transacción verificada • Olor Gardenia</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Icon Buttons: WhatsApp, Ticket (58mm), and PDF */}
        <div className="p-4 border-t border-[#292932] bg-[#171720]">
          <div className="grid grid-cols-3 gap-3">
            {/* 1. WhatsApp Button (Logo WhatsApp) */}
            <button
              type="button"
              onClick={handleShareWhatsApp}
              id="share-whatsapp-btn"
              title="Enviar por WhatsApp"
              className="h-12 rounded-2xl bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/35 text-[#25D366] flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-sm hover:shadow-[#25D366]/10"
            >
              <WhatsAppIcon className="w-5 h-5" />
            </button>

            {/* 2. Ticket Button (58mm Impresora Térmica) */}
            <button
              type="button"
              onClick={handleDownloadTicket}
              id="download-ticket-note-btn"
              disabled={isPdfGenerating}
              title="Descargar Ticket (58mm para impresora térmica)"
              className={`h-12 rounded-2xl border flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-sm ${
                pdfSuccess === 'ticket'
                  ? 'bg-[#4edea3] text-[#0d2a1c] border-[#4edea3]'
                  : 'bg-[#23232e] hover:bg-[#2c2c38] text-[#e4e1ed] border-[#383848] hover:border-[#d4af37]/50'
              }`}
            >
              {pdfSuccess === 'ticket' ? (
                <Check className="w-5 h-5 text-[#0d2a1c]" />
              ) : (
                <Printer className="w-5 h-5 text-[#d4af37]" />
              )}
            </button>

            {/* 3. PDF Button (Nota con Marca de Agua) */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              id="download-pdf-note-btn"
              disabled={isPdfGenerating}
              title="Descargar Nota en PDF (con marca de agua)"
              className={`h-12 rounded-2xl flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-md ${
                pdfSuccess === 'pdf'
                  ? 'bg-[#4edea3] text-[#0d2a1c] shadow-[#4edea3]/20'
                  : 'bg-[#f2ca50] hover:bg-[#ffe088] text-[#13131b] shadow-[#f2ca50]/20'
              }`}
            >
              {pdfSuccess === 'pdf' ? (
                <Check className="w-5 h-5" />
              ) : (
                <FileDown className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
