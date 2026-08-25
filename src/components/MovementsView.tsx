import React, { useState, useMemo } from 'react';
import { 
  DollarSign, 
  PackagePlus, 
  Filter, 
  Sparkles, 
  Banknote, 
  CreditCard, 
  ArrowLeftRight,
  Share2,
  Receipt,
  ChevronRight,
  FileDown,
  Printer
} from 'lucide-react';
import { InventoryMovement, MovementType } from '../types';
import { SaleReceiptModal } from './SaleReceiptModal';
import { generateSaleTicketPdf, generateSaleExecutivePdf } from '../utils/pdfGenerator';

interface MovementsViewProps {
  movements: InventoryMovement[];
  onOpenOcr?: () => void;
}

export const MovementsView: React.FC<MovementsViewProps> = ({
  movements,
}) => {
  const [filterType, setFilterType] = useState<MovementType | 'TODOS'>('TODOS');
  const [filterAiOnly, setFilterAiOnly] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);

  // Selected movement for Sale Receipt Note Modal
  const [selectedReceiptMovement, setSelectedReceiptMovement] = useState<InventoryMovement | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  // Today's total sales calculation
  const today = new Date().toISOString().slice(0, 10);
  const todaySalesMovements = movements.filter(
    (m) => (m.date === today || m.date === '2026-08-19') && m.type === 'VENTA'
  );
  
  const todaySalesTotal = todaySalesMovements.reduce(
    (sum, m) => sum + Math.abs(m.totalPrice),
    0
  );

  const todaySalesUnits = todaySalesMovements.reduce((sum, m) => {
    if (m.items && m.items.length > 0) {
      return sum + m.items.reduce((iSum, i) => iSum + i.quantity, 0);
    }
    return sum + Math.abs(m.quantity);
  }, 0);

  const filteredMovements = useMemo(() => {
    return movements.filter((m) => {
      if (filterType !== 'TODOS' && m.type !== filterType) return false;
      if (filterAiOnly && !m.verifiedByAi) return false;
      return true;
    });
  }, [movements, filterType, filterAiOnly]);

  // Group by date
  const groupedMovements = useMemo(() => {
    const groups: { [dateStr: string]: InventoryMovement[] } = {};
    for (const mov of filteredMovements) {
      const dateKey = mov.date;
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(mov);
    }
    return groups;
  }, [filteredMovements]);

  const formatDateHeader = (dateStr: string) => {
    const todayStr = new Date().toISOString().slice(0, 10);
    if (dateStr === todayStr || dateStr === '2026-08-19') {
      return 'HOY • 19 AGO';
    }
    if (dateStr === '2026-08-18') {
      return 'AYER • 18 AGO';
    }
    return dateStr;
  };

  const getPaymentIcon = (method?: 'Efectivo' | 'Tarjeta' | 'Transferencia') => {
    switch (method) {
      case 'Efectivo':
        return <Banknote className="w-3 h-3" />;
      case 'Tarjeta':
        return <CreditCard className="w-3 h-3" />;
      case 'Transferencia':
        return <ArrowLeftRight className="w-3 h-3" />;
      default:
        return <DollarSign className="w-3 h-3" />;
    }
  };

  const handleOpenReceipt = (mov: InventoryMovement) => {
    setSelectedReceiptMovement(mov);
    setIsReceiptOpen(true);
  };

  return (
    <div className="space-y-3.5 pb-28 max-w-lg mx-auto">
      {/* Header Compact */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif-luxury text-[#e4e1ed]">
            Movimientos
          </h2>
          <p className="text-[11px] text-[#99907c] font-medium">
            Toca cualquier movimiento para ver y compartir nota
          </p>
        </div>

        <button
          onClick={() => setShowFiltersModal(!showFiltersModal)}
          id="movements-filter-btn"
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#1b1b23] border border-[#292932] hover:border-[#f2ca50] text-[11px] font-bold text-[#f2ca50] transition-colors"
        >
          <Filter className="w-3 h-3" />
          <span>Filtrar</span>
        </button>
      </div>

      {/* Resumen Compacto de Venta de Hoy para Móvil */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#1b1b23] via-[#202029] to-[#1b1b23] border border-[#f2ca50]/30 shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3] animate-pulse"></span>
              <p className="text-[10px] font-bold tracking-wider uppercase text-[#99907c]">
                Ventas de Hoy
              </p>
            </div>
            <p className="text-2xl font-bold font-mono-numbers text-[#f2ca50] mt-0.5">
              ${todaySalesTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          <div className="text-right">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#f2ca50]/15 text-[#f2ca50] text-[11px] font-bold">
              <span>{todaySalesMovements.length} trans.</span>
            </span>
            <p className="text-[10px] text-[#99907c] mt-0.5">
              {todaySalesUnits} perfumes
            </p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      {showFiltersModal && (
        <div className="p-3.5 rounded-2xl bg-[#1b1b23] border border-[#292932] space-y-2.5 animate-fadeIn">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-[#99907c]">Filtrar por tipo</span>
            <button
              onClick={() => {
                setFilterType('TODOS');
                setFilterAiOnly(false);
              }}
              className="text-[10px] text-[#f2ca50] hover:underline"
            >
              Restablecer
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(['TODOS', 'VENTA', 'ABASTECER', 'AJUSTE'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  filterType === t
                    ? 'bg-[#f2ca50] text-[#13131b]'
                    : 'bg-[#292932] text-[#99907c] hover:text-[#e4e1ed]'
                }`}
              >
                {t === 'ABASTECER' ? 'ABASTECIMIENTO' : t}
              </button>
            ))}
          </div>

          <div className="pt-1.5 flex items-center justify-between border-t border-[#292932]">
            <span className="text-[11px] text-[#99907c]">Solo escaneos OCR IA</span>
            <button
              onClick={() => setFilterAiOnly(!filterAiOnly)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 ${
                filterAiOnly ? 'bg-[#f2ca50] text-[#13131b]' : 'bg-[#292932] text-[#99907c]'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>{filterAiOnly ? 'Activo' : 'Inactivo'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Grouped Movements */}
      <div className="space-y-4">
        {Object.keys(groupedMovements).length === 0 ? (
          <div className="p-6 text-center rounded-2xl bg-[#1b1b23] border border-[#292932]">
            <p className="text-xs text-[#99907c]">No hay movimientos registrados con los filtros actuales.</p>
          </div>
        ) : (
          Object.entries(groupedMovements).map(([dateKey, items]: [string, InventoryMovement[]]) => (
            <div key={dateKey} className="space-y-2.5">
              {/* Date Header */}
              <div className="flex items-center gap-2 px-1">
                <span className="text-[10px] font-bold tracking-wider uppercase text-[#99907c]">
                  {formatDateHeader(dateKey)}
                </span>
                <div className="h-[1px] flex-1 bg-[#292932]" />
              </div>

              {/* Transaction Cards - Minimalist, Clickable & Shareable */}
              <div className="space-y-2.5">
                {items.map((mov) => {
                  const isSale = mov.type === 'VENTA';
                  const isRestock = mov.type === 'ABASTECER';

                  // Reconstruct items if old structure
                  const rawItems = mov.items || [
                    {
                      productId: mov.perfumeId || 'item-1',
                      productName: mov.productName || 'Fragancia',
                      brand: mov.brand || '',
                      quantity: Math.abs(mov.quantity),
                      unitPrice: mov.unitPrice || 270.00,
                      totalPrice: mov.totalPrice,
                    }
                  ];

                  const totalItemCount = rawItems.reduce((acc, i) => acc + i.quantity, 0);

                  return (
                    <div
                      key={mov.id}
                      id={`movement-card-${mov.id}`}
                      onClick={() => handleOpenReceipt(mov)}
                      className="p-3.5 rounded-2xl bg-[#1b1b23] hover:bg-[#20202a] border border-[#292932] hover:border-[#f2ca50]/60 transition-all space-y-2.5 shadow-sm cursor-pointer group active:scale-[0.99]"
                    >
                      {/* Top Header: Badge, Payment Method, Time & Share Icon */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold tracking-wider uppercase flex items-center gap-1 ${
                              isSale
                                ? 'bg-[#ffb4ab]/15 text-[#ffb4ab]'
                                : isRestock
                                ? 'bg-[#4edea3]/15 text-[#4edea3]'
                                : 'bg-[#ffc37b]/15 text-[#ffc37b]'
                            }`}
                          >
                            {isSale ? (
                              <DollarSign className="w-3 h-3 stroke-[2.5]" />
                            ) : (
                              <PackagePlus className="w-3 h-3 stroke-[2.5]" />
                            )}
                            <span>{isSale ? 'VENTA' : isRestock ? 'SURTIDO' : mov.type}</span>
                          </span>

                          {isSale && mov.paymentMethod && (
                            <span className="px-1.5 py-0.5 rounded-md bg-[#13131b] border border-[#292932] text-[#99907c] text-[10px] font-medium flex items-center gap-1">
                              {getPaymentIcon(mov.paymentMethod)}
                              <span>{mov.paymentMethod}</span>
                            </span>
                          )}

                          {mov.verifiedByAi && (
                            <span className="px-1 py-0.5 rounded bg-[#f2ca50]/15 text-[#f2ca50] text-[9px] font-bold flex items-center gap-0.5" title="OCR IA">
                              <Sparkles className="w-2.5 h-2.5" />
                              <span>IA</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-mono text-[#99907c] mr-1">
                            {mov.time}
                          </span>
                          <button
                            type="button"
                            onClick={async (e) => {
                              e.stopPropagation();
                              await generateSaleTicketPdf(mov);
                            }}
                            title="Descargar Ticket (58mm)"
                            className="p-1 rounded-md bg-[#24242e] hover:bg-[#343442] text-[#99907c] hover:text-[#d4af37] border border-[#2e2e3a] transition-colors"
                          >
                            <Printer className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={async (e) => {
                              e.stopPropagation();
                              await generateSaleExecutivePdf(mov);
                            }}
                            title="Descargar Nota en PDF"
                            className="p-1 rounded-md bg-[#24242e] hover:bg-[#f2ca50] text-[#99907c] hover:text-[#13131b] border border-[#2e2e3a] transition-colors"
                          >
                            <FileDown className="w-3 h-3" />
                          </button>
                          <span className="p-1 rounded-md bg-[#24242e] group-hover:bg-[#2e2e3c] text-[#99907c] group-hover:text-[#e4e1ed] border border-[#2e2e3a] transition-colors" title="Ver detalles y compartir">
                            <Share2 className="w-3 h-3" />
                          </span>
                        </div>
                      </div>

                      {/* Main Row: Total Amount & Units */}
                      <div className="flex items-baseline justify-between pt-0.5">
                        <div className="flex items-baseline gap-2">
                          <p className="text-xl font-bold font-mono-numbers text-[#f2ca50]">
                            ${mov.totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                          <span className="text-[10px] text-[#99907c] uppercase font-bold">
                            Total
                          </span>
                        </div>

                        <span className="text-[11px] font-bold text-[#e4e1ed] px-2 py-0.5 rounded-lg bg-[#24242e] border border-[#2e2e3a] group-hover:border-[#f2ca50]/30 transition-colors">
                          {totalItemCount} {totalItemCount === 1 ? 'unidad' : 'unidades'}
                        </span>
                      </div>

                      {/* Itemized List - Sleek & Compact */}
                      <div className="space-y-1 pt-1 border-t border-[#292932]/60">
                        {rawItems.map((item, idx) => {
                          const unitPrice = item.unitPrice || 270.00;
                          const itemTotal = item.totalPrice || (unitPrice * item.quantity);

                          return (
                            <div
                              key={idx}
                              className="flex items-center justify-between py-1 px-2 rounded-lg bg-[#14141c] text-xs group-hover:bg-[#161622] transition-colors"
                            >
                              <div className="min-w-0 flex-1 pr-2">
                                <p className="font-semibold text-[#e4e1ed] truncate text-[11px] sm:text-xs">
                                  <span className="text-[#f2ca50] font-mono font-bold mr-1">{item.quantity}x</span>
                                  {item.productName}
                                </p>
                                {item.brand && (
                                  <p className="text-[9px] text-[#99907c] truncate">
                                    {item.brand}
                                  </p>
                                )}
                              </div>

                              <div className="text-right shrink-0">
                                <p className="font-bold font-mono text-[#e4e1ed] text-[11px] sm:text-xs">
                                  ${itemTotal.toFixed(2)}
                                </p>
                                <p className="text-[9px] font-mono text-[#99907c]">
                                  ${unitPrice.toFixed(2)} c/u
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Descuento si aplica */}
                      {mov.discountApplied && mov.discountAmount && mov.discountAmount > 0 && (
                        <div className="flex items-center justify-between text-[11px] px-2 py-1 rounded-lg bg-[#ffb4ab]/10 border border-[#ffb4ab]/20 text-[#ffb4ab]">
                          <span className="flex items-center gap-1 font-medium">
                            <Sparkles className="w-3 h-3" />
                            <span>Desc. Amigo ({mov.discountPercent || 10}%)</span>
                          </span>
                          <span className="font-mono font-bold">
                            -${mov.discountAmount.toFixed(2)}
                          </span>
                        </div>
                      )}

                      {/* Tap to view note hint */}
                      <div className="flex items-center justify-between pt-1 text-[10px] text-[#99907c] group-hover:text-[#f2ca50] transition-colors">
                        <span className="flex items-center gap-1">
                          <Receipt className="w-3 h-3" />
                          <span>Ver nota de venta y compartir</span>
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Sale Receipt Note Modal */}
      <SaleReceiptModal
        movement={selectedReceiptMovement}
        isOpen={isReceiptOpen}
        onClose={() => {
          setIsReceiptOpen(false);
          setSelectedReceiptMovement(null);
        }}
      />
    </div>
  );
};
