import React, { useState, useMemo } from 'react';
import { 
  Boxes, 
  Package, 
  PackageCheck, 
  PackagePlus, 
  Search, 
  SlidersHorizontal, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  X, 
  Tag, 
  Eye, 
  Layers,
  Flame,
  Filter,
  RefreshCw,
  Plus,
  Minus,
  ChevronDown
} from 'lucide-react';
import { PerfumeProduct, ProductCategory } from '../types';
import { GenderIcon } from './GenderBadge';
import { getOptimizedImageUrl } from '../utils/imageUrl';
import { matchesStockAndSearch, parseStockQuery } from '../utils/stockFilter';
import { triggerAdminActionHaptic } from '../utils/haptics';

interface BusinessStockViewProps {
  products: PerfumeProduct[];
  onQuickSale: (product: PerfumeProduct) => void;
  onQuickRestock: (product: PerfumeProduct) => void;
  onSelectProductDetail?: (product: PerfumeProduct) => void;
}

export type PieceFilterType = 'all' | '0' | '1' | '2' | 'low' | 'mid' | 'high' | 'available' | 'custom';

export const BusinessStockView: React.FC<BusinessStockViewProps> = ({
  products,
  onQuickSale,
  onQuickRestock,
  onSelectProductDetail,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('Todos');
  const [pieceFilter, setPieceFilter] = useState<PieceFilterType>('all');
  const [customPieceCount, setCustomPieceCount] = useState<number>(0);

  // General Inventory Metrics
  const metrics = useMemo(() => {
    const totalFragrances = products.length;
    let totalPieces = 0;
    let zeroStock = 0;
    let singlePiece = 0;
    let twoPieces = 0;
    let lowStock = 0; // 1-2
    let midStock = 0; // 3-5
    let highStock = 0; // 6+
    let totalRetailValue = 0;

    products.forEach((p) => {
      const stock = Number.isFinite(p.stock) ? p.stock : 0;
      const price = Number.isFinite(p.price) ? p.price : 0;

      totalPieces += stock;
      totalRetailValue += stock * price;

      if (stock === 0) zeroStock++;
      else if (stock === 1) {
        singlePiece++;
        lowStock++;
      } else if (stock === 2) {
        twoPieces++;
        lowStock++;
      } else if (stock >= 3 && stock <= 5) {
        midStock++;
      } else if (stock >= 6) {
        highStock++;
      }
    });

    return {
      totalFragrances,
      totalPieces,
      zeroStock,
      singlePiece,
      twoPieces,
      lowStock,
      midStock,
      highStock,
      totalRetailValue,
    };
  }, [products]);

  // Normalize string helper
  const normalize = (s: string) => 
    s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

  // Filtered Products
  const filteredProducts = useMemo(() => {
    const list = products.filter((p) => {
      const stock = Number.isFinite(p.stock) ? p.stock : 0;

      // Category filter
      if (selectedCategory !== 'Todos' && p.category !== selectedCategory) {
        return false;
      }

      // Piece filter
      if (pieceFilter === '0' && stock !== 0) return false;
      if (pieceFilter === '1' && stock !== 1) return false;
      if (pieceFilter === '2' && stock !== 2) return false;
      if (pieceFilter === 'low' && (stock < 1 || stock > 2)) return false;
      if (pieceFilter === 'mid' && (stock < 3 || stock > 5)) return false;
      if (pieceFilter === 'high' && stock < 6) return false;
      if (pieceFilter === 'available' && stock <= 0) return false;
      if (pieceFilter === 'custom' && stock !== customPieceCount) return false;

      // Search term (supports text search and secret stock filters e.g. "stock 0", "stock 2")
      if (searchTerm.trim()) {
        if (!matchesStockAndSearch(p, searchTerm, normalize)) {
          return false;
        }
      }

      return true;
    });

    // Default sorting (by name or stock)
    return list.sort((a, b) => {
      const stockA = Number.isFinite(a.stock) ? a.stock : 0;
      const stockB = Number.isFinite(b.stock) ? b.stock : 0;
      if (stockA !== stockB) return stockA - stockB;
      return (a.name || '').localeCompare(b.name || '');
    });
  }, [products, selectedCategory, pieceFilter, customPieceCount, searchTerm]);

  const handleResetFilters = () => {
    triggerAdminActionHaptic();
    setSearchTerm('');
    setSelectedCategory('Todos');
    setPieceFilter('all');
    setCustomPieceCount(0);
  };

  const hasActiveFilters = 
    searchTerm !== '' || 
    selectedCategory !== 'Todos' || 
    pieceFilter !== 'all';

  return (
    <div className="w-full flex flex-col gap-5 sm:gap-6 animate-fade-in">
      {/* ==================================================================== */}
      {/* 1. RESUMEN DE STOCK EN EXISTENCIA (KPI METRICS CARDS) */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {/* Total Piezas */}
        <div 
          onClick={() => {
            triggerAdminActionHaptic();
            setPieceFilter('all');
          }}
          className={`p-2.5 sm:p-3 rounded-2xl bg-[#1A1C24] border transition-all cursor-pointer flex flex-col justify-between ${
            pieceFilter === 'all' 
              ? 'border-[#EAB308] bg-[#EAB308]/5 shadow-md shadow-[#EAB308]/10 ring-1 ring-[#EAB308]' 
              : 'border-[#2A2C38] hover:border-[#EAB308]/40'
          }`}
        >
          <div className="flex items-center justify-between text-[#9093A3]">
            <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider truncate">Total</span>
            <Boxes className="w-3.5 h-3.5 text-[#EAB308] shrink-0" />
          </div>
          <div className="mt-1.5">
            <p className="text-base sm:text-2xl font-black text-white font-mono-numbers">
              {metrics.totalPieces}
            </p>
            <p className="text-[8px] sm:text-[10px] text-[#9093A3] font-medium truncate">
              {metrics.totalFragrances} frag.
            </p>
          </div>
        </div>

        {/* Agotados (0 Piezas) */}
        <div 
          onClick={() => {
            triggerAdminActionHaptic();
            setPieceFilter(pieceFilter === '0' ? 'all' : '0');
          }}
          className={`p-2.5 sm:p-3 rounded-2xl bg-[#1A1C24] border transition-all cursor-pointer flex flex-col justify-between ${
            pieceFilter === '0' 
              ? 'border-[#ef4444] bg-red-950/20 shadow-md shadow-red-500/10 ring-1 ring-[#ef4444]' 
              : 'border-[#2A2C38] hover:border-red-500/40'
          }`}
        >
          <div className="flex items-center justify-between text-red-400">
            <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider truncate">Agotados</span>
            <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
          </div>
          <div className="mt-1.5">
            <p className="text-base sm:text-2xl font-black text-red-400 font-mono-numbers">
              {metrics.zeroStock}
            </p>
            <p className="text-[8px] sm:text-[10px] text-red-300/70 font-medium truncate">
              0 pzs (surtir)
            </p>
          </div>
        </div>

        {/* 1 Pieza (Urgente Surtir 1-2) */}
        <div 
          onClick={() => {
            triggerAdminActionHaptic();
            setPieceFilter(pieceFilter === '1' ? 'all' : '1');
          }}
          className={`p-2.5 sm:p-3 rounded-2xl bg-[#1A1C24] border transition-all cursor-pointer flex flex-col justify-between ${
            pieceFilter === '1' 
              ? 'border-[#f97316] bg-orange-950/20 shadow-md shadow-orange-500/10 ring-1 ring-[#f97316]' 
              : 'border-[#2A2C38] hover:border-orange-500/40'
          }`}
        >
          <div className="flex items-center justify-between text-orange-400">
            <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider truncate">1 Pieza</span>
            <Flame className="w-3.5 h-3.5 text-orange-400 shrink-0" />
          </div>
          <div className="mt-1.5">
            <p className="text-base sm:text-2xl font-black text-orange-400 font-mono-numbers">
              {metrics.singlePiece}
            </p>
            <p className="text-[8px] sm:text-[10px] text-orange-300/70 font-medium truncate">
              surtir +2 pzs
            </p>
          </div>
        </div>

        {/* 2 Piezas (Atención Surtir 1) */}
        <div 
          onClick={() => {
            triggerAdminActionHaptic();
            setPieceFilter(pieceFilter === '2' ? 'all' : '2');
          }}
          className={`p-2.5 sm:p-3 rounded-2xl bg-[#1A1C24] border transition-all cursor-pointer flex flex-col justify-between ${
            pieceFilter === '2' 
              ? 'border-[#eab308] bg-yellow-950/20 shadow-md shadow-yellow-500/10 ring-1 ring-[#eab308]' 
              : 'border-[#2A2C38] hover:border-yellow-500/40'
          }`}
        >
          <div className="flex items-center justify-between text-yellow-400">
            <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider truncate">2 Piezas</span>
            <Package className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
          </div>
          <div className="mt-1.5">
            <p className="text-base sm:text-2xl font-black text-yellow-400 font-mono-numbers">
              {metrics.twoPieces}
            </p>
            <p className="text-[8px] sm:text-[10px] text-yellow-300/70 font-medium truncate">
              surtir +1 pz
            </p>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 2. BARRA DE FILTROS INTERACTIVOS Y BÚSQUEDA DE STOCK */}
      {/* ==================================================================== */}
      <div className="p-3.5 sm:p-5 rounded-3xl bg-[#1A1C24] border border-[#2A2C38] flex flex-col gap-3.5 shadow-xl">
        {/* Row 1: Search & Sorting */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-[#9093A3] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="biz-stock-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar perfume, diseñador o 'stock 0'..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-[#12131A] border border-[#2A2C38] text-sm text-white placeholder-[#9093A3] focus:outline-none focus:border-[#EAB308] transition-colors"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9093A3] hover:text-white"
                title="Limpiar búsqueda"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>



          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              id="biz-stock-reset-btn"
              className="w-full sm:w-auto px-3 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 shrink-0"
              title="Restablecer todos los filtros"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Limpiar</span>
            </button>
          )}
        </div>

        {/* Row 2: Dropdowns for Category (Género) and Piezas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          {/* Género Filter Dropdown */}
          <div className="relative w-full">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-[#9093A3] uppercase tracking-wider">
                Género
              </span>
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => {
                triggerAdminActionHaptic();
                setSelectedCategory(e.target.value as ProductCategory);
              }}
              className="w-full appearance-none bg-[#12131A] border border-[#2A2C38] text-white text-xs font-bold rounded-xl pl-3.5 pr-8 py-2.5 focus:outline-none focus:border-[#EAB308] cursor-pointer truncate"
            >
              {(['Todos', 'Mujer', 'Hombre', 'Unisex'] as ProductCategory[]).map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'Todos' ? '👥 Todos los Géneros' : cat === 'Mujer' ? '🌸 Mujer' : cat === 'Hombre' ? '👔 Hombre' : '✨ Unisex'}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#9093A3] absolute right-3 bottom-3 pointer-events-none" />
          </div>

          {/* Piezas Filter Dropdown */}
          <div className="relative w-full">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-[#9093A3] uppercase tracking-wider">
                Filtrar por Piezas
              </span>
            </div>
            <select
              value={pieceFilter}
              onChange={(e) => {
                triggerAdminActionHaptic();
                setPieceFilter(e.target.value);
              }}
              className="w-full appearance-none bg-[#12131A] border border-[#2A2C38] text-white text-xs font-bold rounded-xl pl-3.5 pr-8 py-2.5 focus:outline-none focus:border-[#EAB308] cursor-pointer truncate"
            >
              <option value="all">📦 Todas las existencias ({products.length})</option>
              <option value="0">🚨 Agotados (0 pzs - {metrics.zeroStock})</option>
              <option value="1">🔥 1 Pieza ({metrics.singlePiece})</option>
              <option value="2">⚡ 2 Piezas ({metrics.twoPieces})</option>
              <option value="low">⚠️ Stock Bajo (1-2 pzs - {metrics.lowStock})</option>
              <option value="mid">🌿 Suficientes / Medios (3-5 pzs - {metrics.midStock})</option>
              <option value="high">💎 Alto Stock (6+ pzs - {metrics.highStock})</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#9093A3] absolute right-3 bottom-3 pointer-events-none" />
          </div>
        </div>

        {/* Search / Filter Result Counter & Active Query Pill */}
        <div className="flex items-center justify-between text-xs text-[#9093A3] pt-1 border-t border-[#2A2C38]">
          <div className="flex items-center gap-2">
            <span>Mostrando: <strong className="text-white">{filteredProducts.length}</strong></span>
            {parseStockQuery(searchTerm).hasStockFilter && (
              <span className="px-2 py-0.5 rounded-md bg-[#EAB308]/15 border border-[#EAB308]/30 text-[10px] font-bold text-[#EAB308]">
                {parseStockQuery(searchTerm).matchedStockLabel}
              </span>
            )}
          </div>
          <span>
            Total: <strong className="text-[#EAB308]">
              {filteredProducts.reduce((sum, p) => sum + (p.stock ?? 0), 0)} pzs
            </strong>
          </span>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 3. LISTA Y TARJETAS DE PRODUCTOS POR STOCK */}
      {/* ==================================================================== */}
      {filteredProducts.length === 0 ? (
        <div className="p-10 rounded-3xl bg-[#1A1C24] border border-[#2A2C38] text-center flex flex-col items-center justify-center gap-3">
          <Boxes className="w-10 h-10 text-[#9093A3] opacity-30" />
          <h3 className="text-sm font-bold text-white">No se encontraron fragancias</h3>
          <p className="text-xs text-[#9093A3] max-w-sm">
            No hay productos que coincidan con los filtros de piezas o búsqueda seleccionados.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="mt-1 px-3.5 py-1.5 rounded-xl bg-[#EAB308] text-[#12131A] text-xs font-bold hover:bg-[#CA8A04] transition-all shadow-md"
          >
            Ver Todas
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filteredProducts.map((product) => {
            const stock = Number.isFinite(product.stock) ? product.stock : 0;
            const price = Number.isFinite(product.price) ? product.price : 0;
            const productInventoryValue = stock * price;

            return (
              <div
                key={product.id}
                className="p-3.5 rounded-2xl bg-[#1A1C24] border border-[#2A2C38] hover:border-[#EAB308]/50 hover:bg-[#1E202B] transition-all flex flex-col justify-between gap-3 group shadow-md"
              >
                {/* Top Section: Photo, Info, and Stock Badge */}
                <div className="flex items-start gap-3">
                  {/* Photo with status indicator */}
                  <div className="w-15 h-15 sm:w-16 sm:h-16 rounded-xl bg-[#12131A] border border-[#2A2C38] overflow-hidden shrink-0 flex items-center justify-center p-1 relative">
                    <img
                      src={getOptimizedImageUrl(product.image)}
                      alt={product.name}
                      className="w-full h-full object-contain filter drop-shadow-md group-hover:scale-105 transition-transform"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                    {stock === 0 && (
                      <div className="absolute inset-0 bg-red-950/65 backdrop-blur-[1px] flex items-center justify-center">
                        <span className="text-[9px] font-black text-red-200 uppercase tracking-tighter bg-red-600 px-1 py-0.2 rounded">
                          0 Pzs
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-extrabold text-[#EAB308] uppercase tracking-wider truncate">
                        {product.brand}
                      </span>
                      <span className="text-[#9093A3]">•</span>
                      <span className="text-[10px] text-[#9093A3]">{product.category}</span>
                      {product.volume && (
                        <span className="text-[10px] text-[#9093A3]">({product.volume})</span>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-white tracking-tight truncate mt-0.5" title={product.name}>
                      {product.name}
                    </h4>

                    {/* Stock Status Badge */}
                    <div className="mt-2 flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-black font-mono-numbers border shadow-sm ${
                          stock === 0
                            ? 'bg-red-950/80 border-red-500/60 text-red-400 animate-pulse'
                            : stock === 1
                            ? 'bg-orange-950/80 border-orange-500/60 text-orange-400'
                            : stock === 2
                            ? 'bg-yellow-950/80 border-yellow-500/60 text-yellow-400'
                            : 'bg-emerald-950/80 border-emerald-500/60 text-emerald-400'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            stock === 0
                              ? 'bg-red-400'
                              : stock === 1
                              ? 'bg-orange-400'
                              : stock === 2
                              ? 'bg-yellow-400'
                              : 'bg-emerald-400'
                          }`}
                        />
                        <span>
                          {stock === 0
                            ? '0 Piezas (Agotado)'
                            : stock === 1
                            ? '1 Pieza (Última)'
                            : `${stock} Piezas Disponibles`}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Section: Pricing & Quick Actions */}
                <div className="pt-2.5 border-t border-[#2A2C38] flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-black text-[#EAB308]">
                      ${price.toFixed(2)} <span className="text-[10px] text-[#9093A3] font-normal">MXN c/u</span>
                    </p>
                    <p className="text-[10px] text-[#9093A3]">
                      Valor: ${productInventoryValue.toFixed(2)}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* View Details */}
                    {onSelectProductDetail && (
                      <button
                        type="button"
                        onClick={() => onSelectProductDetail(product)}
                        className="p-2 rounded-xl bg-[#12131A] hover:bg-[#252834] text-[#9093A3] hover:text-white border border-[#2A2C38] transition-all"
                        title="Ver ficha completa"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Quick Restock (+ Abastecer) */}
                    <button
                      type="button"
                      onClick={() => onQuickRestock(product)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#3b82f6]/15 hover:bg-[#3b82f6] text-[#60a5fa] hover:text-white border border-[#3b82f6]/30 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-sm"
                      title="Agregar 1 unidad a Abastecimiento"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Surtir</span>
                    </button>

                    {/* Quick Sale (- Vender) */}
                    <button
                      type="button"
                      onClick={() => onQuickSale(product)}
                      disabled={stock === 0}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-sm ${
                        stock === 0
                          ? 'bg-[#12131A] text-[#9093A3]/40 border border-[#2A2C38] cursor-not-allowed opacity-50'
                          : 'bg-[#EAB308]/15 hover:bg-[#EAB308] text-[#EAB308] hover:text-[#12131A] border border-[#EAB308]/30'
                      }`}
                      title={stock === 0 ? 'Sin existencias para vender' : 'Agregar 1 unidad al carrito de venta'}
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>Vender</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
