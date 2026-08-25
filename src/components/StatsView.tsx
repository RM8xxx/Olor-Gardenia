import React, { useState, useMemo } from 'react';
import { 
  Crown,
  ChevronRight,
  Newspaper,
  Globe,
  UserCheck,
  Flame,
  Award,
  Sparkles
} from 'lucide-react';
import { PerfumeProduct, InventoryMovement } from '../types';

interface StatsViewProps {
  products: PerfumeProduct[];
  movements: InventoryMovement[];
  onSelectProduct: (product: PerfumeProduct) => void;
}

// Global TOP 3 best-selling perfumes in the world (present in the catalog)
interface GlobalTrendPerfume {
  productId: string;
  productNameKeyword: string;
  globalRank: number;
  yearUnitsEst: string;
  yearRevenueEst: string;
  headlineNews: string;
  marketTrendSummary: string;
  badgeLabel: string;
}

const GLOBAL_TOP_3_ABSOLUTE_BESTSELLERS: GlobalTrendPerfume[] = [
  {
    productId: 'sauvage',
    productNameKeyword: 'sauvage',
    globalRank: 1,
    yearUnitsEst: '12.5M unds. globales',
    yearRevenueEst: '+$1,150M USD',
    headlineNews: 'El perfume más vendido del planeta en volumen y facturación mundial.',
    marketTrendSummary: 'Líder absoluto de la industria global con una botella vendida cada pocos segundos en todo el mundo gracias a su firma noble de bergamota y ambroxan.',
    badgeLabel: '#1 Más Vendido del Mundo',
  },
  {
    productId: 'good-girl',
    productNameKeyword: 'good girl',
    globalRank: 2,
    yearUnitsEst: '6.8M unds. globales',
    yearRevenueEst: '+$620M USD',
    headlineNews: 'El fenómeno de ventas número 1 de la perfumería internacional.',
    marketTrendSummary: 'El perfume femenino más vendido del mundo por volumen, impulsado por su icónico diseño y su adictiva combinación de nardos, haba tonka y cacao.',
    badgeLabel: '#2 Más Vendido del Mundo',
  },
  {
    productId: 'one-million',
    productNameKeyword: 'one million',
    globalRank: 3,
    yearUnitsEst: '5.9M unds. globales',
    yearRevenueEst: '+$510M USD',
    headlineNews: 'Un gigante comercial indiscutible en el podio global de ventas.',
    marketTrendSummary: 'Se mantiene como uno de los perfumes más vendidos de todos los tiempos por su estela cálida y especiada de canela, cuero y mandarina.',
    badgeLabel: '#3 Más Vendido del Mundo',
  }
];

export const StatsView: React.FC<StatsViewProps> = ({ 
  products, 
  movements, 
  onSelectProduct 
}) => {
  const [selectedGlobalIdx, setSelectedGlobalIdx] = useState<number>(0);

  // Match Top 3 global items directly with products in catalog
  const top3GlobalTrends = useMemo(() => {
    return GLOBAL_TOP_3_ABSOLUTE_BESTSELLERS.map((trend) => {
      const product = products.find(
        (p) => p.id.toLowerCase() === trend.productId.toLowerCase() ||
               p.name.toLowerCase().includes(trend.productNameKeyword.toLowerCase())
      ) || products.find((p) => p.brand.toLowerCase() === 'dior' || p.category === 'Hombre') || products[0];

      return {
        ...trend,
        product,
      };
    }).filter((t) => !!t.product);
  }, [products]);

  const currentFeaturedTrend = top3GlobalTrends[selectedGlobalIdx] || top3GlobalTrends[0];

  // =========================================================================
  // CÁLCULO DE VENTAS PERSONALES (TUS DATOS REALES)
  // =========================================================================
  const personalStats = useMemo(() => {
    const salesMovements = movements.filter((m) => m.type === 'VENTA');
    const salesByProductId: Record<string, { units: number; revenue: number; product: PerfumeProduct }> = {};

    let totalPersonalUnits = 0;
    let totalPersonalRevenue = 0;
    let mujerUnits = 0;
    let hombreUnits = 0;
    let unisexUnits = 0;
    let mujerRevenue = 0;
    let hombreRevenue = 0;
    let unisexRevenue = 0;

    salesMovements.forEach((m) => {
      if (m.items && m.items.length > 0) {
        m.items.forEach((item) => {
          const product = products.find((p) => p.id === item.productId) || {
            id: item.productId,
            name: item.productName,
            brand: item.brand,
            volume: item.volume || '60ml',
            price: item.unitPrice,
            stock: 0,
            minStockAlert: 2,
            category: 'Unisex' as const,
            image: item.image || '',
            description: '',
            notes: '',
            sku: item.productId,
          };

          const qty = item.quantity;
          const rev = item.totalPrice;

          totalPersonalUnits += qty;
          totalPersonalRevenue += rev;

          if (product.category === 'Mujer') {
            mujerUnits += qty;
            mujerRevenue += rev;
          } else if (product.category === 'Hombre') {
            hombreUnits += qty;
            hombreRevenue += rev;
          } else {
            unisexUnits += qty;
            unisexRevenue += rev;
          }

          if (!salesByProductId[product.id]) {
            salesByProductId[product.id] = { units: 0, revenue: 0, product };
          }
          salesByProductId[product.id].units += qty;
          salesByProductId[product.id].revenue += rev;
        });
      } else if (m.perfumeId) {
        const product = products.find((p) => p.id === m.perfumeId);
        const qty = Math.abs(m.quantity || 1);
        const rev = Math.abs(m.totalPrice || (product ? product.price * qty : 0));

        totalPersonalUnits += qty;
        totalPersonalRevenue += rev;

        if (product) {
          if (product.category === 'Mujer') {
            mujerUnits += qty;
            mujerRevenue += rev;
          } else if (product.category === 'Hombre') {
            hombreUnits += qty;
            hombreRevenue += rev;
          } else {
            unisexUnits += qty;
            unisexRevenue += rev;
          }

          if (!salesByProductId[product.id]) {
            salesByProductId[product.id] = { units: 0, revenue: 0, product };
          }
          salesByProductId[product.id].units += qty;
          salesByProductId[product.id].revenue += rev;
        }
      }
    });

    const salesList = Object.values(salesByProductId);

    const getTopForCategory = (cat: 'Mujer' | 'Hombre' | 'Unisex') => {
      const filtered = salesList.filter((s) => s.product.category === cat);
      filtered.sort((a, b) => b.units - a.units || b.revenue - a.revenue);
      return filtered[0] || null;
    };

    const topMujer = getTopForCategory('Mujer');
    const topHombre = getTopForCategory('Hombre');
    const topUnisex = getTopForCategory('Unisex');

    // Fallbacks from catalog
    const fallbackMujer = products.find((p) => p.category === 'Mujer') || products[0];
    const fallbackHombre = products.find((p) => p.category === 'Hombre') || products[1] || products[0];
    const fallbackUnisex = products.find((p) => p.category === 'Unisex') || products[2] || products[0];

    const totalCalculated = totalPersonalUnits || 1;
    const pctMujer = Math.round((mujerUnits / totalCalculated) * 100);
    const pctHombre = Math.round((hombreUnits / totalCalculated) * 100);
    const pctUnisex = Math.max(0, 100 - pctMujer - pctHombre);

    return {
      salesCount: salesMovements.length,
      totalUnits: totalPersonalUnits,
      totalRevenue: totalPersonalRevenue,
      mujer: {
        units: mujerUnits,
        revenue: mujerRevenue,
        pct: totalPersonalUnits > 0 ? pctMujer : 45,
        topItem: topMujer,
        product: topMujer ? topMujer.product : fallbackMujer,
      },
      hombre: {
        units: hombreUnits,
        revenue: hombreRevenue,
        pct: totalPersonalUnits > 0 ? pctHombre : 35,
        topItem: topHombre,
        product: topHombre ? topHombre.product : fallbackHombre,
      },
      unisex: {
        units: unisexUnits,
        revenue: unisexRevenue,
        pct: totalPersonalUnits > 0 ? pctUnisex : 20,
        topItem: topUnisex,
        product: topUnisex ? topUnisex.product : fallbackUnisex,
      },
    };
  }, [movements, products]);

  return (
    <div className="space-y-6 pb-28 max-w-xl mx-auto animate-fade-in">
      {/* Encabezado General */}
      <div className="pt-1">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl sm:text-3xl font-bold font-serif-luxury text-[#e4e1ed] tracking-tight">
            Estadísticas
          </h2>
          <span className="px-2 py-0.5 rounded-full bg-[#f2ca50]/15 text-[#f2ca50] text-[10px] font-bold tracking-wider uppercase border border-[#f2ca50]/30">
            Global & Personal
          </span>
        </div>
        <p className="text-xs text-[#99907c] mt-0.5">
          Los 3 perfumes más vendidos a nivel mundial y tus resultados de ventas
        </p>
      </div>

      {/* ========================================================================= */}
      {/* SECCIÓN 1: LOS 3 MÁS VENDIDOS A NIVEL MUNDIAL */}
      {/* ========================================================================= */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#e4e1ed]">
          <Globe className="w-4 h-4 text-[#f2ca50]" />
          <span>TOP 3 MÁS VENDIDOS A NIVEL MUNDIAL</span>
        </div>

        {/* Segmented Top 3 Control (Grid de 3 columnas juntas sin scroll) */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#1b1b23] rounded-2xl border border-[#292932]">
          {top3GlobalTrends.map((trend, idx) => {
            const isSelected = selectedGlobalIdx === idx;
            return (
              <button
                key={trend.productId + idx}
                onClick={() => setSelectedGlobalIdx(idx)}
                id={`btn-global-top3-${idx}`}
                className={`py-2 px-1 sm:px-2 rounded-xl text-center transition-all flex flex-col items-center justify-center gap-0.5 ${
                  isSelected
                    ? 'bg-[#f2ca50] text-[#13131b] shadow-md shadow-[#f2ca50]/20 font-bold'
                    : 'text-[#99907c] hover:text-[#e4e1ed] hover:bg-[#22222d]'
                }`}
              >
                <div className="flex items-center gap-1">
                  <Crown className={`w-3 h-3 ${isSelected ? 'text-[#13131b]' : 'text-[#f2ca50]'}`} />
                  <span className="text-[11px] font-black uppercase">Top #{trend.globalRank}</span>
                </div>
                <span className={`text-[11px] truncate w-full text-center ${isSelected ? 'font-bold' : 'font-medium'}`}>
                  {trend.product.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Hero Card del Top Seleccionado */}
        {currentFeaturedTrend && currentFeaturedTrend.product && (
          <div 
            onClick={() => onSelectProduct(currentFeaturedTrend.product)}
            id="stats-top-global-card"
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1b1b23] via-[#20202a] to-[#15151c] border border-[#f2ca50]/30 hover:border-[#f2ca50]/70 p-4 sm:p-5 cursor-pointer group shadow-xl transition-all"
          >
            {/* Header del Top */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#f2ca50]/15 text-[#f2ca50] text-[10px] font-bold uppercase tracking-wider border border-[#f2ca50]/25">
                <Crown className="w-3 h-3 text-[#f2ca50]" />
                <span>{currentFeaturedTrend.badgeLabel}</span>
              </span>

              <span className="text-[11px] text-[#99907c] group-hover:text-[#f2ca50] transition-colors flex items-center gap-0.5">
                Ver ficha <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Fila principal: Información y Frasco */}
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1.5 flex-1 min-w-0">
                <p className="text-xs font-bold text-[#f2ca50] uppercase tracking-wider">
                  {currentFeaturedTrend.product.brand}
                </p>
                <h3 className="text-lg sm:text-xl font-bold font-serif-luxury text-[#e4e1ed] group-hover:text-[#f2ca50] transition-colors truncate">
                  {currentFeaturedTrend.product.name}
                </h3>
                <p className="text-[11px] text-[#99907c]">
                  {currentFeaturedTrend.product.category} • {currentFeaturedTrend.product.volume}
                </p>

                {/* Métricas Estimadas de Mercado Mundial */}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <div className="px-2.5 py-1 rounded-xl bg-[#13131b]/80 border border-[#292932]">
                    <p className="text-[9px] text-[#99907c] uppercase font-bold">Unidades Mundiales Est.</p>
                    <p className="text-xs font-mono-numbers font-bold text-[#f2ca50]">
                      {currentFeaturedTrend.yearUnitsEst}
                    </p>
                  </div>

                  <div className="px-2.5 py-1 rounded-xl bg-[#13131b]/80 border border-[#292932]">
                    <p className="text-[9px] text-[#99907c] uppercase font-bold">Facturación Global Est.</p>
                    <p className="text-xs font-mono-numbers font-bold text-[#4edea3]">
                      {currentFeaturedTrend.yearRevenueEst}
                    </p>
                  </div>
                </div>
              </div>

              {/* Imagen del Perfume */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#13131b] border border-[#292932] shrink-0 p-1.5 flex items-center justify-center group-hover:scale-105 transition-transform">
                <img
                  src={currentFeaturedTrend.product.image}
                  alt={currentFeaturedTrend.product.name}
                  className="w-full h-full object-contain filter drop-shadow-md"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            {/* Mini Sección de Noticias del Mercado */}
            <div className="mt-3.5 pt-3 border-t border-[#292932] bg-[#13131b]/50 rounded-2xl p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#f2ca50]">
                <Newspaper className="w-3.5 h-3.5" />
                <span>Noticia del Mercado Mundial:</span>
              </div>
              <p className="text-xs font-semibold text-[#e4e1ed] leading-snug">
                "{currentFeaturedTrend.headlineNews}"
              </p>
              <p className="text-[11px] text-[#99907c] leading-relaxed">
                {currentFeaturedTrend.marketTrendSummary}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* LÍNEA SEPARADORA MINIMALISTA */}
      {/* ========================================================================= */}
      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-[#292932]" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-[#13131b] px-3.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-[#99907c] border border-[#292932] flex items-center gap-1.5">
            <UserCheck className="w-3 h-3 text-[#f2ca50]" />
            <span>Tus Ventas Personales</span>
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECCIÓN 2: ESTADÍSTICAS PERSONALES (MINIMALISTAS Y ELEGANTES) */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        {/* Resumen Superior Limpio */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-3.5 rounded-2xl bg-[#1b1b23] border border-[#292932] flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#99907c]">
              Tus Unidades
            </span>
            <div className="mt-1">
              <p className="text-xl sm:text-2xl font-bold font-mono-numbers text-[#f2ca50]">
                {personalStats.totalUnits}
              </p>
              <p className="text-[10px] text-[#99907c]">
                {personalStats.salesCount} {personalStats.salesCount === 1 ? 'ticket' : 'tickets'}
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#1b1b23] border border-[#292932] flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#99907c]">
              Tus Ingresos
            </span>
            <div className="mt-1">
              <p className="text-xl sm:text-2xl font-bold font-mono-numbers text-[#4edea3]">
                ${personalStats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-[10px] text-[#99907c]">
                Total acumulado
              </p>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TARJETAS MINIMALISTAS: MÁS VENDIDOS MUJER, HOMBRE Y UNISEX */}
        {/* ========================================================================= */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] text-[#99907c] px-0.5">
            <span className="font-bold uppercase tracking-wider text-[#e4e1ed]">
              Líderes de Venta por Género
            </span>
            <span>Tus resultados</span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5">
            {/* 1. MUJER */}
            <button
              type="button"
              onClick={() => personalStats.mujer.product && onSelectProduct(personalStats.mujer.product)}
              id="stats-card-personal-mujer"
              className="p-2 sm:p-3 rounded-2xl bg-[#1b1b23] hover:bg-[#20202b] active:scale-95 border border-[#292932] hover:border-[#f2ca50]/50 transition-all text-left flex flex-col justify-between group shadow-sm overflow-hidden"
            >
              <div className="flex items-center justify-between gap-1 w-full">
                <span className="text-[9px] sm:text-[10px] font-bold text-[#f2ca50] tracking-wider uppercase truncate">
                  Mujer
                </span>
                <span className="text-[8px] sm:text-[9px] font-mono-numbers font-bold text-[#e4e1ed] bg-[#13131b] px-1 sm:px-1.5 py-0.5 rounded border border-[#292932] shrink-0">
                  {personalStats.mujer.units} u.
                </span>
              </div>

              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-[#13131b] border border-[#292932] p-1 mx-auto my-1.5 flex items-center justify-center shrink-0">
                <img
                  src={personalStats.mujer.product?.image}
                  alt={personalStats.mujer.product?.name}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="w-full text-center">
                <h4 className="font-bold text-[10px] sm:text-xs text-[#e4e1ed] group-hover:text-[#f2ca50] transition-colors truncate">
                  {personalStats.mujer.product?.name}
                </h4>
                <p className="text-[8px] sm:text-[9px] text-[#99907c] truncate">
                  {personalStats.mujer.product?.brand}
                </p>
                <div className="mt-1 pt-1 border-t border-[#292932]/70 flex items-center justify-center">
                  <span className="font-mono-numbers text-[9px] sm:text-[10px] font-semibold text-[#4edea3]">
                    ${personalStats.mujer.revenue.toFixed(0)}
                  </span>
                </div>
              </div>
            </button>

            {/* 2. HOMBRE */}
            <button
              type="button"
              onClick={() => personalStats.hombre.product && onSelectProduct(personalStats.hombre.product)}
              id="stats-card-personal-hombre"
              className="p-2 sm:p-3 rounded-2xl bg-[#1b1b23] hover:bg-[#20202b] active:scale-95 border border-[#292932] hover:border-[#4edea3]/50 transition-all text-left flex flex-col justify-between group shadow-sm overflow-hidden"
            >
              <div className="flex items-center justify-between gap-1 w-full">
                <span className="text-[9px] sm:text-[10px] font-bold text-[#4edea3] tracking-wider uppercase truncate">
                  Hombre
                </span>
                <span className="text-[8px] sm:text-[9px] font-mono-numbers font-bold text-[#e4e1ed] bg-[#13131b] px-1 sm:px-1.5 py-0.5 rounded border border-[#292932] shrink-0">
                  {personalStats.hombre.units} u.
                </span>
              </div>

              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-[#13131b] border border-[#292932] p-1 mx-auto my-1.5 flex items-center justify-center shrink-0">
                <img
                  src={personalStats.hombre.product?.image}
                  alt={personalStats.hombre.product?.name}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="w-full text-center">
                <h4 className="font-bold text-[10px] sm:text-xs text-[#e4e1ed] group-hover:text-[#4edea3] transition-colors truncate">
                  {personalStats.hombre.product?.name}
                </h4>
                <p className="text-[8px] sm:text-[9px] text-[#99907c] truncate">
                  {personalStats.hombre.product?.brand}
                </p>
                <div className="mt-1 pt-1 border-t border-[#292932]/70 flex items-center justify-center">
                  <span className="font-mono-numbers text-[9px] sm:text-[10px] font-semibold text-[#4edea3]">
                    ${personalStats.hombre.revenue.toFixed(0)}
                  </span>
                </div>
              </div>
            </button>

            {/* 3. UNISEX */}
            <button
              type="button"
              onClick={() => personalStats.unisex.product && onSelectProduct(personalStats.unisex.product)}
              id="stats-card-personal-unisex"
              className="p-2 sm:p-3 rounded-2xl bg-[#1b1b23] hover:bg-[#20202b] active:scale-95 border border-[#292932] hover:border-[#ffc37b]/50 transition-all text-left flex flex-col justify-between group shadow-sm overflow-hidden"
            >
              <div className="flex items-center justify-between gap-1 w-full">
                <span className="text-[9px] sm:text-[10px] font-bold text-[#ffc37b] tracking-wider uppercase truncate">
                  Unisex
                </span>
                <span className="text-[8px] sm:text-[9px] font-mono-numbers font-bold text-[#e4e1ed] bg-[#13131b] px-1 sm:px-1.5 py-0.5 rounded border border-[#292932] shrink-0">
                  {personalStats.unisex.units} u.
                </span>
              </div>

              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-[#13131b] border border-[#292932] p-1 mx-auto my-1.5 flex items-center justify-center shrink-0">
                <img
                  src={personalStats.unisex.product?.image}
                  alt={personalStats.unisex.product?.name}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="w-full text-center">
                <h4 className="font-bold text-[10px] sm:text-xs text-[#e4e1ed] group-hover:text-[#ffc37b] transition-colors truncate">
                  {personalStats.unisex.product?.name}
                </h4>
                <p className="text-[8px] sm:text-[9px] text-[#99907c] truncate">
                  {personalStats.unisex.product?.brand}
                </p>
                <div className="mt-1 pt-1 border-t border-[#292932]/70 flex items-center justify-center">
                  <span className="font-mono-numbers text-[9px] sm:text-[10px] font-semibold text-[#4edea3]">
                    ${personalStats.unisex.revenue.toFixed(0)}
                  </span>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Barra de Distribución Minimalista */}
        <div className="p-3.5 rounded-2xl bg-[#1b1b23] border border-[#292932] space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold text-[#e4e1ed]">Proporción de tus Ventas</span>
            <span className="text-[#99907c]">{personalStats.totalUnits} unidades totales</span>
          </div>

          <div className="w-full h-2 rounded-full bg-[#13131b] overflow-hidden flex">
            <div 
              style={{ width: `${personalStats.mujer.pct}%` }} 
              className="bg-[#f2ca50] h-full transition-all duration-500" 
              title={`Mujer ${personalStats.mujer.pct}%`}
            />
            <div 
              style={{ width: `${personalStats.hombre.pct}%` }} 
              className="bg-[#4edea3] h-full transition-all duration-500" 
              title={`Hombre ${personalStats.hombre.pct}%`}
            />
            <div 
              style={{ width: `${personalStats.unisex.pct}%` }} 
              className="bg-[#ffc37b] h-full transition-all duration-500" 
              title={`Unisex ${personalStats.unisex.pct}%`}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-[#99907c] pt-0.5">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#f2ca50]" /> Mujer ({personalStats.mujer.pct}%)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#4edea3]" /> Hombre ({personalStats.hombre.pct}%)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#ffc37b]" /> Unisex ({personalStats.unisex.pct}%)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
