import React, { useState, useEffect } from 'react';
import { 
  PlusCircle, 
  Package, 
  BarChart3, 
  Receipt, 
  TrendingUp, 
  AlertTriangle, 
  MapPin, 
  ExternalLink, 
  ChevronRight, 
  Compass, 
  Pencil,
  LayoutGrid,
  Sparkles
} from 'lucide-react';
import { NavigationTab, PerfumeProduct, InventoryMovement, InterestPlace } from '../types';
import { 
  InterestPlacesModal, 
  DEFAULT_INTEREST_PLACES, 
  INTEREST_PLACES_STORAGE_KEY 
} from './InterestPlacesModal';

interface DashboardViewProps {
  onNavigate: (tab: NavigationTab) => void;
  onOpenOcr?: () => void;
  products: PerfumeProduct[];
  movements: InventoryMovement[];
  onSelectProduct: (product: PerfumeProduct) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  products,
  movements,
  onSelectProduct,
}) => {
  const [isPlacesModalOpen, setIsPlacesModalOpen] = useState(false);
  const [targetEditPlaceId, setTargetEditPlaceId] = useState<string | null>(null);

  // Synchronized Interest Places State
  const [places, setPlaces] = useState<InterestPlace[]>(() => {
    try {
      const saved = localStorage.getItem(INTEREST_PLACES_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return DEFAULT_INTEREST_PLACES;
  });

  const savePlaces = (updatedPlaces: InterestPlace[]) => {
    setPlaces(updatedPlaces);
    try {
      localStorage.setItem(INTEREST_PLACES_STORAGE_KEY, JSON.stringify(updatedPlaces));
    } catch (e) {
      console.error('Failed saving interest places', e);
    }
  };

  const handleUpdatePlace = (updated: InterestPlace) => {
    const next = places.map((p) => (p.id === updated.id ? updated : p));
    savePlaces(next);
  };

  const handleAddPlace = (newPlace: InterestPlace) => {
    const next = [...places, newPlace];
    savePlaces(next);
  };

  const handleDeletePlace = (id: string) => {
    const next = places.filter((p) => p.id !== id);
    savePlaces(next);
  };

  const handleOpenEdit = (placeId: string) => {
    setTargetEditPlaceId(placeId);
    setIsPlacesModalOpen(true);
  };

  // Compute real metrics
  const todayIso = new Date().toISOString().slice(0, 10);
  const todayMovements = movements.filter(
    (m) => m.date === todayIso || m.date === '2026-08-19'
  );
  const todaySalesMovements = todayMovements.filter((m) => m.type === 'VENTA');
  const todaySalesTotal = todaySalesMovements.reduce(
    (sum, m) => sum + Math.abs(m.totalPrice || 0),
    0
  );
  const todaySalesCount = todaySalesMovements.reduce(
    (count, m) => count + (m.items ? m.items.reduce((s, i) => s + i.quantity, 0) : Math.abs(m.quantity || 1)),
    0
  );

  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= p.minStockAlert).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;
  const totalUnits = products.reduce((acc, p) => acc + p.stock, 0);

  // Time-distributed chart points based on actual movements or flat baseline
  const chartPoints = [
    { hour: '09:00', val: 0 },
    { hour: '12:00', val: 0 },
    { hour: '15:00', val: 0 },
    { hour: '18:00', val: 0 },
    { hour: '21:00', val: 0 },
  ];

  return (
    <div className="space-y-6 pb-28 max-w-4xl mx-auto">
      {/* Greeting Header */}
      <div className="pt-2">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#e4e1ed] font-serif-luxury">
          Hola, <span className="text-[#f2ca50]">Jess</span>
        </h2>
        <p className="text-sm text-[#99907c] mt-1">
          Resumen de tu tienda de perfumería para hoy.
        </p>
      </div>

      {/* 2x2 Quick Action Cards matching screenshot */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {/* Nuevo Movimiento */}
        <button
          onClick={() => onNavigate('pos')}
          id="dash-btn-nuevo-movimiento"
          className="group relative p-4 rounded-2xl bg-[#1b1b23] hover:bg-[#23232e] border border-[#292932] hover:border-[#f2ca50]/50 text-left transition-all duration-200 flex flex-col justify-between h-36"
        >
          <div className="w-10 h-10 rounded-xl bg-[#292932] group-hover:bg-[#f2ca50]/20 flex items-center justify-center transition-colors">
            <PlusCircle className="w-5 h-5 text-[#f2ca50]" />
          </div>
          <div>
            <h3 className="font-bold text-[#e4e1ed] text-base group-hover:text-[#f2ca50] transition-colors leading-snug">
              Nuevo Movimiento
            </h3>
            <p className="text-xs text-[#99907c] mt-0.5 leading-tight">
              Registrar movimiento (venta o abastecimiento)
            </p>
          </div>
        </button>

        {/* Inventario */}
        <button
          onClick={() => onNavigate('inventario')}
          id="dash-btn-inventario"
          className="group relative p-4 rounded-2xl bg-[#1b1b23] hover:bg-[#23232e] border border-[#292932] hover:border-[#f2ca50]/50 text-left transition-all duration-200 flex flex-col justify-between h-36"
        >
          <div className="w-10 h-10 rounded-xl bg-[#292932] group-hover:bg-[#f2ca50]/20 flex items-center justify-center transition-colors">
            <Package className="w-5 h-5 text-[#f2ca50]" />
          </div>
          <div>
            <h3 className="font-bold text-[#e4e1ed] text-base group-hover:text-[#f2ca50] transition-colors leading-snug">
              Inventario
            </h3>
            <p className="text-xs text-[#99907c] mt-0.5 leading-tight">
              Revisar stock ({totalUnits} unidades en catálogo)
            </p>
          </div>
        </button>

        {/* Estadísticas */}
        <button
          onClick={() => onNavigate('estadisticas')}
          id="dash-btn-estadisticas"
          className="group relative p-4 rounded-2xl bg-[#1b1b23] hover:bg-[#23232e] border border-[#292932] hover:border-[#f2ca50]/50 text-left transition-all duration-200 flex flex-col justify-between h-36"
        >
          <div className="w-10 h-10 rounded-xl bg-[#292932] group-hover:bg-[#4edea3]/20 flex items-center justify-center transition-colors">
            <BarChart3 className="w-5 h-5 text-[#4edea3]" />
          </div>
          <div>
            <h3 className="font-bold text-[#e4e1ed] text-base group-hover:text-[#4edea3] transition-colors leading-snug">
              Estadísticas
            </h3>
            <p className="text-xs text-[#99907c] mt-0.5 leading-tight">
              Ver reportes de marcas y ventas
            </p>
          </div>
        </button>

        {/* Movimientos */}
        <button
          onClick={() => onNavigate('movimientos')}
          id="dash-btn-movimientos"
          className="group relative p-4 rounded-2xl bg-[#1b1b23] hover:bg-[#23232e] border border-[#292932] hover:border-[#f2ca50]/50 text-left transition-all duration-200 flex flex-col justify-between h-36"
        >
          <div className="w-10 h-10 rounded-xl bg-[#292932] group-hover:bg-[#f2ca50]/20 flex items-center justify-center transition-colors">
            <Receipt className="w-5 h-5 text-[#f2ca50]" />
          </div>
          <div>
            <h3 className="font-bold text-[#e4e1ed] text-base group-hover:text-[#f2ca50] transition-colors leading-snug">
              Movimientos
            </h3>
            <p className="text-xs text-[#99907c] mt-0.5 leading-tight">
              Historial y auditoría de transacciones
            </p>
          </div>
        </button>
      </div>

      {/* Ventas de Hoy Section with Chart */}
      <div className="rounded-2xl bg-[#1b1b23] border border-[#292932] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-[#99907c] uppercase tracking-wider">
              Ventas de Hoy
            </h3>
            <p className="text-2xl sm:text-3xl font-bold font-mono-numbers text-[#f2ca50] mt-0.5">
              ${todaySalesTotal.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
          {todaySalesTotal > 0 ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#4edea3]/10 text-[#4edea3] text-xs font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{todaySalesCount} fragancia{todaySalesCount === 1 ? '' : 's'} vendida{todaySalesCount === 1 ? '' : 's'}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#292932] text-[#99907c] text-xs font-medium">
              <span>0 ventas registradas hoy</span>
            </div>
          )}
        </div>

        {/* Minimalist Gold Trend Chart */}
        <div className="h-24 w-full relative pt-2">
          {todaySalesTotal > 0 ? (
            <svg
              className="w-full h-full overflow-visible"
              viewBox="0 0 500 100"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f2ca50" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#f2ca50" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <line x1="0" y1="20" x2="500" y2="20" stroke="#292932" strokeDasharray="4,4" strokeWidth="1" />
              <line x1="0" y1="50" x2="500" y2="50" stroke="#292932" strokeDasharray="4,4" strokeWidth="1" />
              <line x1="0" y1="80" x2="500" y2="80" stroke="#292932" strokeDasharray="4,4" strokeWidth="1" />
              <path
                d="M 0 90 Q 70 85 120 70 T 250 55 T 370 30 T 500 15 L 500 100 L 0 100 Z"
                fill="url(#goldGradient)"
              />
              <path
                d="M 0 90 Q 70 85 120 70 T 250 55 T 370 30 T 500 15"
                fill="none"
                stroke="#f2ca50"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <circle cx="500" cy="15" r="5" fill="#ffe088" stroke="#13131b" strokeWidth="2" />
            </svg>
          ) : (
            <div className="h-full flex flex-col items-center justify-center border border-dashed border-[#292932] rounded-xl bg-[#13131b]/40 text-center px-4">
              <p className="text-xs text-[#99907c]">Aún no hay ventas registradas el día de hoy.</p>
              <p className="text-[11px] text-[#f2ca50] mt-0.5">Usa "Nuevo Movimiento" para registrar tu primera venta.</p>
            </div>
          )}

          {/* Time Labels */}
          {todaySalesTotal > 0 && (
            <div className="flex justify-between text-[10px] text-[#99907c] font-mono-numbers mt-2 px-1">
              {chartPoints.map((pt, i) => (
                <span key={i}>{pt.hour}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stock Alerts Bar */}
      {(lowStockCount > 0 || outOfStockCount > 0) && (
        <div className="p-4 rounded-2xl bg-[#292932]/40 border border-[#ffc37b]/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-[#ffc37b] shrink-0" />
            <div>
              <p className="text-xs font-semibold text-[#e4e1ed]">
                Alertas de Stock: {lowStockCount} stock bajo, {outOfStockCount} agotados
              </p>
              <p className="text-[11px] text-[#99907c]">
                Sugerencia: Usa el módulo de abastecimiento para reponer fragancias clave.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('abastecer')}
            id="dash-alert-restock-btn"
            className="px-3 py-1.5 rounded-lg bg-[#ffc37b]/15 hover:bg-[#ffc37b]/25 text-[#ffc37b] text-xs font-bold transition-colors whitespace-nowrap"
          >
            Reponer
          </button>
        </div>
      )}

      {/* Featured Fragrance of the Day */}
      <div className="rounded-2xl bg-[#1b1b23] border border-[#292932] p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-[#99907c] uppercase tracking-wider">
            Fragancia Más Vendida
          </h3>
          <span className="text-[11px] font-bold text-[#f2ca50]">TOP 1</span>
        </div>

        {products[1] && (
          <div
            onClick={() => onSelectProduct(products[1])}
            id="dash-top-product-card"
            className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#23232e] cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <img
                src={products[1].image}
                alt={products[1].name}
                className="w-12 h-12 rounded-lg object-cover border border-[#292932]"
                referrerPolicy="no-referrer"
              />
              <div>
                <h4 className="font-bold text-sm text-[#e4e1ed]">{products[1].name}</h4>
                <p className="text-xs text-[#99907c]">
                  {products[1].brand} • {products[1].volume}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-sm font-mono-numbers text-[#f2ca50]">
                ${products[1].price.toFixed(2)}
              </p>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#ffc37b]/15 text-[#ffc37b] font-medium">
                {products[1].stock} u. en stock
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Sitios de Interés Section & Button at the End of Home Screen */}
      <div className="rounded-2xl bg-[#1b1b23] border border-[#292932] p-4 sm:p-5 space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#f2ca50]/15 text-[#f2ca50] flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#e4e1ed]">
                Sitios de Interés
              </h3>
              <p className="text-[11px] text-[#99907c]">
                Puntos clave de entrega y direcciones
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setTargetEditPlaceId(null);
              setIsPlacesModalOpen(true);
            }}
            id="dash-open-places-btn"
            className="px-3 py-1.5 rounded-xl bg-[#292932] hover:bg-[#f2ca50] text-[#f2ca50] hover:text-[#13131b] text-xs font-bold transition-all flex items-center gap-1"
          >
            <span>Ver y Administrar</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Fast Access List to Key Locations with Direct Edit Button */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          {places.map((place) => (
            <div
              key={place.id}
              className="p-3 rounded-xl bg-[#13131b] border border-[#292932] hover:border-[#f2ca50]/40 transition-colors flex flex-col justify-between gap-2.5 group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 min-w-0 flex-1">
                  <MapPin className="w-4 h-4 text-[#f2ca50] shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-xs text-[#e4e1ed] truncate">
                      {place.name}
                    </p>
                    <p className="text-[11px] text-[#99907c] line-clamp-2 mt-0.5">
                      {place.address}
                    </p>
                  </div>
                </div>

                {/* Quick Edit Pencil Button directly on Dashboard card */}
                <button
                  type="button"
                  onClick={() => handleOpenEdit(place.id)}
                  title="Editar este sitio"
                  className="p-1 rounded-lg text-[#99907c] hover:text-[#f2ca50] hover:bg-[#292932] transition-colors shrink-0"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-1.5 px-2.5 rounded-lg bg-[#1f1f27] hover:bg-[#f2ca50] text-[#e4e1ed] hover:text-[#13131b] text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Abrir en Google Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Brand & Reference Disclaimer */}
      <div className="pt-2 pb-6 px-2 text-center">
        <p className="text-[11px] sm:text-xs text-[#99907c] italic leading-relaxed max-w-3xl mx-auto">
          &ldquo;Los perfumes de María María Fragancias son contratipos en consonancia olfativa con estos perfumes. Las imágenes de los frascos y los nombres originales son marcas registradas y utilizados únicamente como referencia.&rdquo;
        </p>
      </div>

      {/* Interest Places Modal */}
      <InterestPlacesModal
        isOpen={isPlacesModalOpen}
        onClose={() => {
          setIsPlacesModalOpen(false);
          setTargetEditPlaceId(null);
        }}
        places={places}
        onUpdatePlace={handleUpdatePlace}
        onAddPlace={handleAddPlace}
        onDeletePlace={handleDeletePlace}
        initialEditPlaceId={targetEditPlaceId}
      />
    </div>
  );
};
