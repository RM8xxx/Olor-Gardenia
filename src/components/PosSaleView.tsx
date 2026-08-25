import React, { useState, useRef, useEffect } from 'react';
import { 
  Trash2, 
  Plus, 
  Minus, 
  CheckCircle2, 
  CreditCard, 
  Banknote,
  ArrowLeftRight,
  ScanLine,
  Search,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  Calendar,
  Clock,
  AlertTriangle,
  PackageX,
  X
} from 'lucide-react';
import { CartItem, PerfumeProduct } from '../types';
import { TimePickerInput } from './TimePickerInput';
import { GenderIcon } from './GenderBadge';
import { getOptimizedImageUrl } from '../utils/imageUrl';

interface PosSaleViewProps {
  cart: CartItem[];
  products: PerfumeProduct[];
  onAddToCart: (product: PerfumeProduct, quantity?: number) => void;
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onOpenOcr: () => void;
  onNavigateRestock: () => void;
  onCompleteSale: (details: {
    cart: CartItem[];
    subtotal: number;
    discountPercent: number;
    discountAmount: number;
    total: number;
    paymentMethod: 'Efectivo' | 'Tarjeta' | 'Transferencia';
    date: string;
    time: string;
  }) => void;
}

export const PosSaleView: React.FC<PosSaleViewProps> = ({
  cart,
  products,
  onAddToCart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOpenOcr,
  onNavigateRestock,
  onCompleteSale,
}) => {
  const [discountInput, setDiscountInput] = useState<string>('');
  const [zeroStockWarningProduct, setZeroStockWarningProduct] = useState<PerfumeProduct | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'Efectivo' | 'Tarjeta' | 'Transferencia'>('Efectivo');
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Date and Time with current values as default
  const getCurrentDate = () => new Date().toISOString().slice(0, 10);
  const getCurrentTime = () => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  };

  const [saleDate, setSaleDate] = useState<string>(getCurrentDate());
  const [saleTime, setSaleTime] = useState<string>(getCurrentTime());

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered products for search & dropdown
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Math calculations
  const subtotal = cart.reduce((sum, item) => {
    const unitPrice = item.customUnitPrice ?? item.product.price;
    return sum + unitPrice * item.quantity;
  }, 0);

  const parsedDiscount = Math.max(0, parseFloat(discountInput) || 0);
  const discountAmount = Math.min(subtotal, parsedDiscount);
  const discountPercent = subtotal > 0 ? (discountAmount / subtotal) * 100 : 0;
  const totalEstimated = Math.max(0, subtotal - discountAmount);
  const totalCartUnits = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleSelectProduct = (product: PerfumeProduct) => {
    onAddToCart(product, 1);
    setSearchTerm('');
    setIsDropdownOpen(false);

    // If stock is 0 or less, alert the user with popup to review stock
    if (product.stock <= 0) {
      setZeroStockWarningProduct(product);
    }
  };

  const handleFinish = () => {
    if (cart.length === 0) return;
    setIsProcessing(true);
    setTimeout(() => {
      onCompleteSale({
        cart,
        subtotal,
        discountPercent: discountPercent * 100,
        discountAmount,
        total: totalEstimated,
        paymentMethod,
        date: saleDate,
        time: saleTime,
      });
      setIsProcessing(false);
    }, 350);
  };

  return (
    <div className="space-y-4 pb-28 max-w-xl mx-auto">
      {/* Top Header with title and subtle OCR icon next to it */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <h2 className="text-xl sm:text-2xl font-bold font-serif-luxury text-[#e4e1ed]">
            Nueva Venta
          </h2>
          {/* Discreet OCR button next to title */}
          <button
            type="button"
            onClick={onOpenOcr}
            id="pos-subtle-ocr-btn"
            title="Escanear libreta o nota manuscrita con IA"
            className="p-1.5 rounded-lg bg-[#1b1b23] hover:bg-[#292932] border border-[#292932] hover:border-[#f2ca50]/50 text-[#99907c] hover:text-[#f2ca50] transition-colors flex items-center gap-1 group"
          >
            <ScanLine className="w-3.5 h-3.5 group-hover:scale-110 transition-transform text-[#99907c] group-hover:text-[#f2ca50]" />
            <span className="text-[10px] font-bold text-[#99907c] group-hover:text-[#f2ca50] hidden sm:inline">OCR</span>
          </button>
        </div>

        {cart.length > 0 && (
          <button
            type="button"
            onClick={onClearCart}
            id="pos-clear-cart-btn"
            title="Vaciar cesta"
            className="p-2 rounded-xl bg-[#ff7b72]/15 hover:bg-[#ff7b72]/25 border border-[#ff7b72]/30 text-[#ff7b72] hover:text-[#ff948c] transition-all flex items-center justify-center active:scale-95 shadow-sm"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Movement Switcher: Venta (Active) / Abastecimiento */}
      <div className="bg-[#1b1b23] p-1 rounded-2xl flex items-center border border-[#292932] shadow-sm">
        <button
          id="mov-type-venta-btn"
          className="flex-1 py-3 text-center text-xs font-bold uppercase tracking-wider rounded-xl bg-[#292932] text-[#f2ca50] shadow-sm border border-[#f2ca50]/30 transition-all"
        >
          Venta
        </button>
        <button
          onClick={onNavigateRestock}
          id="mov-type-abastecimiento-btn"
          className="flex-1 py-3 text-center text-xs font-bold uppercase tracking-wider rounded-xl text-[#99907c] hover:text-[#e4e1ed] hover:bg-[#1f1f27] transition-all"
        >
          Abastecimiento
        </button>
      </div>

      {/* Fecha y Hora de la Venta */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-[#1b1b23] border border-[#292932] space-y-2">
        <label className="text-[10px] font-bold uppercase tracking-wider text-[#99907c] block">
          Fecha y Hora de la Venta
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <Calendar className="w-4 h-4 text-[#99907c] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="date"
              id="pos-sale-date"
              value={saleDate}
              onChange={(e) => setSaleDate(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#13131b] border border-[#292932] text-xs font-mono text-[#e4e1ed] focus:outline-none focus:border-[#f2ca50]"
            />
          </div>
          <div>
            <TimePickerInput
              id="pos-sale-time"
              value={saleTime}
              onChange={setSaleTime}
            />
          </div>
        </div>
      </div>

      {/* Full-width Search Bar + Dropdown Menu */}
      <div className="relative" ref={dropdownRef}>
        <label className="text-[11px] font-bold uppercase tracking-wider text-[#99907c] block mb-1.5">
          Buscar Perfume
        </label>

        {/* Full width input */}
        <div className="relative w-full">
          <Search className="w-4 h-4 text-[#99907c] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="pos-search-input"
            value={searchTerm}
            onFocus={() => setIsDropdownOpen(true)}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsDropdownOpen(true);
            }}
            placeholder="Escribe el nombre o marca del perfume..."
            className="w-full pl-10 pr-10 py-3.5 rounded-xl bg-[#13131b] border border-[#292932] text-xs sm:text-sm text-[#e4e1ed] placeholder-[#99907c] focus:outline-none focus:border-[#f2ca50] shadow-inner transition-all"
          />
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#99907c] hover:text-[#f2ca50] transition-colors"
            title="Desplegar catálogo"
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180 text-[#f2ca50]' : ''}`} />
          </button>
        </div>

        {/* Dropdown Catalog Results */}
        {isDropdownOpen && (
          <div className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-[#1b1b23] border border-[#f2ca50]/40 rounded-2xl shadow-2xl p-2 max-h-64 overflow-y-auto space-y-1">
            <div className="px-2 py-1.5 text-[10px] uppercase font-bold tracking-wider text-[#99907c] flex justify-between items-center border-b border-[#292932]">
              <span>{searchTerm ? `Resultados (${filteredProducts.length})` : `Catálogo Disponible (${products.length})`}</span>
              <span>Clic para agregar a la venta</span>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-xs text-[#99907c]">No se encontró ninguna fragancia para "{searchTerm}"</p>
              </div>
            ) : (
              filteredProducts.map((product) => {
                const inCartItem = cart.find((item) => item.product.id === product.id);

                return (
                  <div
                    key={product.id}
                    onClick={() => handleSelectProduct(product)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#292932] cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <img
                        src={getOptimizedImageUrl(product.image)}
                        alt={product.name}
                        className="w-10 h-10 rounded-lg object-cover border border-[#292932] shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-[#e4e1ed] truncate group-hover:text-[#f2ca50] transition-colors">
                            {product.name}
                          </p>
                          <GenderIcon category={product.category} sizeClass="w-3 h-3 shrink-0" />
                        </div>
                        <p className="text-[10px] text-[#99907c] truncate mt-0.5">
                          {product.brand} • {product.volume}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2.5 shrink-0">
                      <div className="text-right">
                        <p className="text-xs font-bold font-mono-numbers text-[#f2ca50]">
                          ${product.price.toFixed(2)}
                        </p>
                        <p className="text-[9px] text-[#99907c]">
                          Stock: <span className={product.stock <= 2 ? 'text-[#ffb4ab] font-bold' : 'text-[#e4e1ed]'}>{product.stock}</span>
                        </p>
                      </div>
                      
                      <span className={`text-xs font-bold px-2.5 py-1.5 rounded-lg transition-colors ${
                        inCartItem 
                          ? 'bg-[#4edea3]/15 text-[#4edea3] border border-[#4edea3]/30' 
                          : 'bg-[#f2ca50]/15 text-[#f2ca50] border border-[#f2ca50]/30 group-hover:bg-[#f2ca50] group-hover:text-[#13131b]'
                      }`}>
                        {inCartItem ? `(${inCartItem.quantity}) +1` : '+ Agregar'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Resumen de los Productos Seleccionados (Directly above the Subtotal box) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between pt-1">
          <p className="text-[11px] font-bold tracking-wider uppercase text-[#99907c]">
            Resumen de Productos Seleccionados ({cart.length} {cart.length === 1 ? 'ítem' : 'ítems'} • {totalCartUnits} {totalCartUnits === 1 ? 'unidad' : 'unidades'})
          </p>
        </div>

        {cart.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-[#1b1b23] border border-dashed border-[#292932]">
            <p className="text-sm text-[#99907c]">No has seleccionado productos para la venta.</p>
            <p className="text-xs text-[#99907c]/70 mt-1">
              Usa el buscador arriba para agregar fragancias.
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-0.5">
            {cart.map((item) => {
              const unitPrice = item.customUnitPrice ?? item.product.price;
              const itemTotal = unitPrice * item.quantity;
              return (
                <div
                  key={item.product.id}
                  id={`cart-item-${item.product.id}`}
                  className="flex items-center justify-between p-3 sm:p-3.5 rounded-2xl bg-[#1b1b23] border border-[#292932] hover:border-[#383844] transition-colors"
                >
                  {/* Bottle Photo & Info */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <img
                      src={getOptimizedImageUrl(item.product.image)}
                      alt={item.product.name}
                      className="w-11 h-11 rounded-xl object-cover border border-[#292932] shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-xs sm:text-sm text-[#e4e1ed] truncate">
                          {item.product.name}
                        </h4>
                        <GenderIcon category={item.product.category} sizeClass="w-3.5 h-3.5 shrink-0" />
                      </div>
                      <p className="text-[11px] text-[#99907c] font-mono-numbers mt-0.5">
                        {item.quantity} x ${unitPrice.toFixed(2)} = <span className="font-bold text-[#e4e1ed]">${itemTotal.toFixed(2)}</span>
                      </p>
                    </div>
                  </div>

                  {/* Quantity Stepper & Remove Action */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center bg-[#292932] rounded-xl px-1.5 py-1">
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.product.id, -1)}
                        id={`cart-minus-${item.product.id}`}
                        className="p-1 text-[#99907c] hover:text-[#e4e1ed] transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center font-mono-numbers text-xs font-bold text-[#e4e1ed]">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.product.id, 1)}
                        id={`cart-plus-${item.product.id}`}
                        className="p-1 text-[#99907c] hover:text-[#e4e1ed] transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.product.id)}
                      id={`cart-remove-${item.product.id}`}
                      className="p-2 text-[#99907c] hover:text-[#ffb4ab] transition-colors"
                      title="Eliminar de la venta"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Financial Details, Payment Methods with Icons, and Descuento Amigo */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#1b1b23] border border-[#292932] space-y-4 pt-4 shadow-xl">
        {/* Subtotal Header */}
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="uppercase text-[#99907c] tracking-wider">SUBTOTAL</span>
          <span className="font-mono-numbers text-base font-bold text-[#e4e1ed]">
            ${subtotal.toFixed(2)}
          </span>
        </div>

        {/* Métodos de Pago con Iconos Representativos */}
        <div className="space-y-2 pt-1 border-t border-[#292932]/70">
          <label className="text-[10px] font-bold uppercase tracking-wider text-[#99907c] block">
            MÉTODO DE PAGO
          </label>
          
          <div className="grid grid-cols-3 gap-2">
            {/* Efectivo */}
            <button
              type="button"
              onClick={() => setPaymentMethod('Efectivo')}
              id="payment-method-efectivo"
              className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all border ${
                paymentMethod === 'Efectivo'
                  ? 'bg-[#f2ca50]/15 border-[#f2ca50] text-[#f2ca50] shadow-sm'
                  : 'bg-[#13131b] border-[#292932] text-[#99907c] hover:text-[#e4e1ed] hover:border-[#383844]'
              }`}
            >
              <Banknote className={`w-4 h-4 shrink-0 ${paymentMethod === 'Efectivo' ? 'text-[#f2ca50]' : 'text-[#99907c]'}`} />
              <span className="truncate">Efectivo</span>
            </button>

            {/* Tarjeta */}
            <button
              type="button"
              onClick={() => setPaymentMethod('Tarjeta')}
              id="payment-method-tarjeta"
              className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all border ${
                paymentMethod === 'Tarjeta'
                  ? 'bg-[#f2ca50]/15 border-[#f2ca50] text-[#f2ca50] shadow-sm'
                  : 'bg-[#13131b] border-[#292932] text-[#99907c] hover:text-[#e4e1ed] hover:border-[#383844]'
              }`}
            >
              <CreditCard className={`w-4 h-4 shrink-0 ${paymentMethod === 'Tarjeta' ? 'text-[#f2ca50]' : 'text-[#99907c]'}`} />
              <span className="truncate">Tarjeta</span>
            </button>

            {/* Transferencia */}
            <button
              type="button"
              onClick={() => setPaymentMethod('Transferencia')}
              id="payment-method-transferencia"
              className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all border ${
                paymentMethod === 'Transferencia'
                  ? 'bg-[#f2ca50]/15 border-[#f2ca50] text-[#f2ca50] shadow-sm'
                  : 'bg-[#13131b] border-[#292932] text-[#99907c] hover:text-[#e4e1ed] hover:border-[#383844]'
              }`}
            >
              <ArrowLeftRight className={`w-4 h-4 shrink-0 ${paymentMethod === 'Transferencia' ? 'text-[#f2ca50]' : 'text-[#99907c]'}`} />
              <span className="truncate">Transfer</span>
            </button>
          </div>
        </div>

        {/* Descuento por Monto (en Pesos) */}
        <div className="pt-2 border-t border-[#292932]/70 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#99907c]">
              ¿Cuánto le vas a restar? (en pesos)
            </label>
            {discountAmount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#f2ca50]/15 text-[#f2ca50] border border-[#f2ca50]/30">
                {discountPercent.toFixed(1)}% desc.
              </span>
            )}
          </div>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#99907c]">$</span>
            <input
              type="number"
              min="0"
              step="0.5"
              value={discountInput}
              onChange={(e) => setDiscountInput(e.target.value)}
              placeholder="0.00 (Sin descuento)"
              className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-[#13131b] border border-[#292932] text-xs font-bold text-[#e4e1ed] focus:outline-none focus:border-[#f2ca50]"
            />
          </div>
        </div>

        {/* Desglose de Descuento si está activo */}
        {discountAmount > 0 && (
          <div className="flex items-center justify-between text-xs font-semibold text-[#f2ca50] bg-[#f2ca50]/10 p-2.5 rounded-xl border border-[#f2ca50]/20">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Descuento aplicado ({discountPercent.toFixed(1)}%)</span>
            </span>
            <span className="font-mono-numbers font-bold">
              -${discountAmount.toFixed(2)}
            </span>
          </div>
        )}

        {/* Total Estimado */}
        <div className="pt-2 border-t border-[#292932]">
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#99907c]">
              TOTAL ESTIMADO
            </span>
            <span className="text-3xl font-bold font-mono-numbers text-[#f2ca50]">
              ${totalEstimated.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Botón de Completar Venta */}
        <button
          onClick={handleFinish}
          disabled={cart.length === 0 || isProcessing}
          id="pos-complete-movement-btn"
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-[#f2ca50] hover:bg-[#ffe088] disabled:opacity-40 disabled:cursor-not-allowed text-[#13131b] font-extrabold text-sm sm:text-base tracking-wide uppercase transition-all shadow-xl shadow-[#f2ca50]/20"
        >
          <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
          <span>{isProcessing ? 'Procesando...' : 'COMPLETAR VENTA'}</span>
        </button>
      </div>

      {/* Pop-up de Advertencia: Stock en 0 piezas */}
      {zeroStockWarningProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-[#1b1b23] border border-[#ffb4ab]/40 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 text-left">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-2 border-b border-[#292932]">
              <div className="flex items-center gap-2.5 text-[#ffb4ab]">
                <div className="w-8 h-8 rounded-xl bg-[#ffb4ab]/15 flex items-center justify-center text-[#ffb4ab] shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-[#e4e1ed] leading-tight">
                    Revisa el Stock
                  </h3>
                  <p className="text-[10px] text-[#ffb4ab] font-bold">
                    Hay 0 piezas en el sistema
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setZeroStockWarningProduct(null)}
                className="p-1.5 text-[#99907c] hover:text-[#e4e1ed] rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Product Card Inside Modal */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#13131b] border border-[#2e2e3a]">
              <img
                src={getOptimizedImageUrl(zeroStockWarningProduct.image)}
                alt={zeroStockWarningProduct.name}
                className="w-12 h-12 rounded-xl object-cover border border-[#292932] shrink-0"
                referrerPolicy="no-referrer"
              />
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-xs sm:text-sm text-[#e4e1ed] truncate">
                  {zeroStockWarningProduct.name}
                </h4>
                <p className="text-[10px] text-[#99907c] truncate">
                  {zeroStockWarningProduct.brand} • {zeroStockWarningProduct.volume}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#ffb4ab]/15 text-[#ffb4ab] border border-[#ffb4ab]/30">
                    Stock en sistema: 0 u.
                  </span>
                </div>
              </div>
            </div>

            {/* Message Explanation */}
            <p className="text-xs text-[#99907c] leading-relaxed">
              El producto se ha agregado a la venta correctamente. Sin embargo, por favor revisa el stock físico ya que <span className="text-[#ffb4ab] font-bold">en el sistema registra 0 piezas disponibles</span>.
            </p>

            {/* Actions */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setZeroStockWarningProduct(null)}
                id="zero-stock-dismiss-btn"
                className="w-full py-3 px-4 rounded-xl bg-[#f2ca50] hover:bg-[#ffe088] text-[#13131b] text-xs font-bold transition-all shadow-md shadow-[#f2ca50]/20 flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <span>Entendido, continuar con la venta</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
