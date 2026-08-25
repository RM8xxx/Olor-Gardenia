import React, { useState, useRef, useEffect } from 'react';
import { Search, Plus, Minus, CheckCircle2, Calendar, Clock, ChevronDown, PlusCircle, Trash2, ScanLine } from 'lucide-react';
import { PerfumeProduct } from '../types';
import { TimePickerInput } from './TimePickerInput';
import { GenderIcon } from './GenderBadge';
import { getOptimizedImageUrl } from '../utils/imageUrl';

interface RestockItem {
  product: PerfumeProduct;
  quantityToAdd: number;
}

interface RestockViewProps {
  products: PerfumeProduct[];
  onConfirmRestock: (items: RestockItem[], date: string, time: string) => void;
  onAddNewProduct: () => void;
  onNavigateSale: () => void;
  onOpenOcr?: () => void;
  onBack: () => void;
}

export const RestockView: React.FC<RestockViewProps> = ({
  products,
  onConfirmRestock,
  onAddNewProduct,
  onNavigateSale,
  onOpenOcr,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<'reponer' | 'nuevo'>('reponer');

  const getCurrentDate = () => new Date().toISOString().slice(0, 10);
  const getCurrentTime = () => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  };

  const [entryDate, setEntryDate] = useState<string>(getCurrentDate());
  const [entryTime, setEntryTime] = useState<string>(getCurrentTime());
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Initial restock list starts completely empty as requested
  const [restockList, setRestockList] = useState<RestockItem[]>([]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalUnits = restockList.reduce((acc, item) => acc + item.quantityToAdd, 0);

  const handleUpdateQty = (productId: string, delta: number) => {
    setRestockList((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const next = item.quantityToAdd + delta;
            return next > 0 ? { ...item, quantityToAdd: next } : null;
          }
          return item;
        })
        .filter(Boolean) as RestockItem[]
    );
  };

  const handleAddExistingProduct = (product: PerfumeProduct) => {
    const existing = restockList.find((i) => i.product.id === product.id);
    if (existing) {
      handleUpdateQty(product.id, 1);
    } else {
      setRestockList((prev) => [...prev, { product, quantityToAdd: 1 }]);
    }
    setSearchTerm('');
    setIsDropdownOpen(false);
  };

  const handleClearList = () => {
    setRestockList([]);
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleComplete = () => {
    if (restockList.length === 0) return;
    onConfirmRestock(restockList, entryDate, entryTime);
  };

  return (
    <div className="space-y-4 pb-28 max-w-xl mx-auto">
      {/* Top Header with title and subtle OCR icon next to it */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <h2 className="text-xl sm:text-2xl font-bold font-serif-luxury text-[#e4e1ed]">
            Nuevo Movimiento
          </h2>
          {onOpenOcr && (
            <button
              type="button"
              onClick={onOpenOcr}
              id="restock-subtle-ocr-btn"
              title="Escanear nota o factura de abastecimiento con IA"
              className="p-1.5 rounded-lg bg-[#1b1b23] hover:bg-[#292932] border border-[#292932] hover:border-[#4edea3]/50 text-[#99907c] hover:text-[#4edea3] transition-colors flex items-center gap-1 group"
            >
              <ScanLine className="w-3.5 h-3.5 group-hover:scale-110 transition-transform text-[#99907c] group-hover:text-[#4edea3]" />
              <span className="text-[10px] font-bold text-[#99907c] group-hover:text-[#4edea3] hidden sm:inline">OCR</span>
            </button>
          )}
        </div>
        {restockList.length > 0 ? (
          <button
            type="button"
            onClick={handleClearList}
            id="restock-clear-btn"
            title="Vaciar lista"
            className="p-2 rounded-xl bg-[#ff7b72]/15 hover:bg-[#ff7b72]/25 border border-[#ff7b72]/30 text-[#ff7b72] hover:text-[#ff948c] transition-all flex items-center justify-center active:scale-95 shadow-sm"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        ) : (
          <div className="w-10"></div>
        )}
      </div>

      {/* 2 Movement Buttons: Venta / Abastecimiento (Active) */}
      <div className="bg-[#1b1b23] p-1 rounded-2xl flex items-center border border-[#292932] shadow-sm">
        <button
          onClick={onNavigateSale}
          id="mov-type-venta-btn"
          className="flex-1 py-3 text-center text-xs font-bold uppercase tracking-wider rounded-xl text-[#99907c] hover:text-[#e4e1ed] hover:bg-[#1f1f27] transition-all"
        >
          Venta
        </button>
        <button
          id="mov-type-abastecimiento-btn"
          className="flex-1 py-3 text-center text-xs font-bold uppercase tracking-wider rounded-xl bg-[#292932] text-[#f2ca50] shadow-sm border border-[#f2ca50]/30 transition-all"
        >
          Abastecimiento
        </button>
      </div>

      {/* Page Title & Subtitle */}
      <div className="pt-1">
        <h3 className="text-2xl sm:text-3xl font-bold text-[#e4e1ed]">
          Registrar Abastecimiento
        </h3>
        <p className="text-xs sm:text-sm text-[#99907c] mt-1">
          Añade stock de mercancía a tu inventario
        </p>
      </div>

      {/* Segmented Control (Transaction Type) */}
      <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#1b1b23] border border-[#292932]/70">
        <button
          onClick={() => setActiveTab('reponer')}
          id="restock-tab-reponer"
          className={`py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === 'reponer'
              ? 'bg-[#34343d] text-[#f2ca50] shadow-sm border border-[#4d4635]'
              : 'text-[#99907c] hover:text-[#e4e1ed]'
          }`}
        >
          Reponer Stock
        </button>
        <button
          onClick={() => {
            onAddNewProduct();
          }}
          id="restock-tab-nuevo"
          className="py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-[#99907c] hover:text-[#e4e1ed] hover:bg-[#292932] transition-all"
        >
          + Nuevo Producto
        </button>
      </div>

      {/* Fecha y Hora de Ingreso */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-[#1b1b23] border border-[#292932] space-y-2">
        <label className="text-[11px] font-bold uppercase tracking-wider text-[#99907c] block">
          Fecha y Hora de Ingreso
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <Calendar className="w-4 h-4 text-[#99907c] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="date"
              id="restock-date-input"
              value={entryDate}
              onChange={(e) => setEntryDate(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#13131b] border border-[#292932] text-xs font-mono text-[#e4e1ed] focus:outline-none focus:border-[#f2ca50] transition-colors"
            />
          </div>
          <div>
            <TimePickerInput
              id="restock-time-input"
              value={entryTime}
              onChange={setEntryTime}
            />
          </div>
        </div>
      </div>

      {/* Buscar y Menú Desplegable de Producto Existente */}
      <div className="relative" ref={dropdownRef}>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#99907c]">
            Buscar o Seleccionar Producto
          </label>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="text-[11px] font-bold text-[#f2ca50] hover:underline flex items-center gap-1"
          >
            <span>{isDropdownOpen ? 'Cerrar lista' : 'Ver catálogo desplegable'}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-[#99907c] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            id="restock-search-input"
            value={searchTerm}
            onFocus={() => setIsDropdownOpen(true)}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsDropdownOpen(true);
            }}
            placeholder="Escribe el nombre o abre el menú desplegable..."
            className="w-full pl-10 pr-10 py-3.5 rounded-xl bg-[#13131b] border border-[#292932] text-xs sm:text-sm text-[#e4e1ed] placeholder-[#99907c] focus:outline-none focus:border-[#f2ca50] shadow-inner transition-all"
          />
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#99907c] hover:text-[#f2ca50] transition-colors"
            title="Abrir menú desplegable"
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180 text-[#f2ca50]' : ''}`} />
          </button>
        </div>

        {/* Dropdown Menu (letter search + full dropdown catalog) */}
        {isDropdownOpen && (
          <div className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-[#1b1b23] border border-[#f2ca50]/40 rounded-2xl shadow-2xl p-2 max-h-64 overflow-y-auto space-y-1">
            <div className="px-2 py-1.5 text-[10px] uppercase font-bold tracking-wider text-[#99907c] flex justify-between items-center border-b border-[#292932]">
              <span>{searchTerm ? `Resultados (${filteredProducts.length})` : `Catálogo Completo (${products.length})`}</span>
              <span>Clic para añadir</span>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-xs text-[#99907c]">No se encontró "{searchTerm}"</p>
                <button
                  type="button"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    onAddNewProduct();
                  }}
                  className="mt-2 text-xs font-bold text-[#f2ca50] hover:underline inline-flex items-center gap-1"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Crear como nuevo perfume</span>
                </button>
              </div>
            ) : (
              filteredProducts.map((product) => {
                const isAlreadyInList = restockList.some((item) => item.product.id === product.id);
                return (
                  <div
                    key={product.id}
                    onClick={() => handleAddExistingProduct(product)}
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
                    
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] text-[#99907c] font-mono">
                        Stock: <span className="text-[#e4e1ed] font-bold">{product.stock}</span>
                      </span>
                      <span className={`text-xs font-bold px-2 py-1 rounded-lg transition-colors ${
                        isAlreadyInList 
                          ? 'bg-[#4edea3]/10 text-[#4edea3]' 
                          : 'bg-[#f2ca50]/10 text-[#f2ca50]'
                      }`}>
                        {isAlreadyInList ? '+1 Extra' : '+ Agregar'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}

            {/* Bottom shortcut to create new product */}
            <div className="pt-1 border-t border-[#292932]">
              <button
                type="button"
                onClick={() => {
                  setIsDropdownOpen(false);
                  onAddNewProduct();
                }}
                className="w-full p-2.5 text-center text-xs font-bold text-[#f2ca50] bg-[#16161e] hover:bg-[#292932] rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                <span>¿No está en la lista? Crear nuevo perfume</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Productos a Ingresar List */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between border-b border-[#292932] pb-2">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#e4e1ed]">
            Productos a Ingresar ({restockList.length})
          </h4>
          {restockList.length > 0 && (
            <button
              type="button"
              onClick={handleClearList}
              title="Vaciar lista"
              className="p-1 rounded-lg text-[#ff7b72] hover:bg-[#ff7b72]/15 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {restockList.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-[#1b1b23] border border-dashed border-[#292932]">
            <p className="text-sm text-[#99907c]">No has seleccionado productos para reponer.</p>
            <p className="text-xs text-[#99907c]/70 mt-1">Busca un producto arriba o abre el menú desplegable.</p>
          </div>
        ) : (
          restockList.map((item) => (
            <div
              key={item.product.id}
              id={`restock-item-${item.product.id}`}
              className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-[#1b1b23] border border-[#292932]/70"
            >
              {/* Left: Product info */}
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <img
                  src={getOptimizedImageUrl(item.product.image)}
                  alt={item.product.name}
                  className="w-14 h-14 rounded-xl object-cover border border-[#292932] shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-sm text-[#e4e1ed] truncate">
                      {item.product.name}
                    </h4>
                    <GenderIcon category={item.product.category} sizeClass="w-3.5 h-3.5 shrink-0" />
                  </div>
                  <p className="text-xs text-[#99907c] truncate mt-0.5">
                    {item.product.brand} • {item.product.volume}
                  </p>
                  <p className="text-[11px] text-[#4edea3] mt-1 font-medium">
                    Stock actual: {item.product.stock} u.
                  </p>
                </div>
              </div>

              {/* Right: Vertical +/- stepper */}
              <div className="flex flex-col items-center bg-[#1f1f27] rounded-xl px-2 py-1 border border-[#292932] shrink-0">
                <button
                  onClick={() => handleUpdateQty(item.product.id, 1)}
                  className="p-1 text-[#99907c] hover:text-[#4edea3] transition-colors"
                  title="Aumentar"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                </button>
                <span className="font-mono-numbers text-sm font-bold text-[#e4e1ed] my-0.5">
                  +{item.quantityToAdd}
                </span>
                <button
                  onClick={() => handleUpdateQty(item.product.id, -1)}
                  className="p-1 text-[#99907c] hover:text-[#ffb4ab] transition-colors"
                  title="Disminuir"
                >
                  <Minus className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary Box */}
      <div className="p-5 rounded-2xl bg-[#1f1f27]/80 backdrop-blur-md border border-[#f2ca50]/20 space-y-4 mt-6 shadow-xl">
        <div className="flex items-center justify-between text-sm sm:text-base font-semibold">
          <span className="text-[#99907c]">Total Unidades</span>
          <span className="font-mono-numbers text-lg sm:text-xl font-bold text-[#f2ca50]">
            {totalUnits} unidades
          </span>
        </div>

        <button
          onClick={handleComplete}
          disabled={restockList.length === 0}
          id="restock-confirm-btn"
          className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-[#d4af37] hover:bg-[#f2ca50] disabled:opacity-40 text-[#13131b] font-bold text-sm sm:text-base tracking-wide transition-all shadow-lg active:scale-[0.99]"
        >
          <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
          <span>Registrar Abastecimiento</span>
        </button>
      </div>
    </div>
  );
};
