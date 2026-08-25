import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Sparkles, 
  Droplets, 
  X, 
  RotateCcw,
  Smartphone,
  Flame,
  HelpCircle,
  Compass,
  Check,
  Instagram,
  Heart,
  RefreshCcw,
  ArrowLeftRight,
  Pencil,
  BarChart3,
  Layers,
  ImageIcon,
  ExternalLink,
  Camera,
  Store
} from 'lucide-react';
import { PerfumeProduct, ProductCategory } from '../types';
import { GenderIcon } from './GenderBadge';
import { OlfactoryFamily, OLFACTORY_FAMILIES, OccasionFilter, OCCASION_FILTERS } from './InventoryView';
import { LotusIcon } from './LotusIcon';
import { PhotoAuditGridModal } from './PhotoAuditGridModal';
import { BusinessMovementsView } from './BusinessMovementsView';
import { getOptimizedImageUrl } from '../utils/imageUrl';
import { triggerAdminAccessHaptic, triggerAdminActionHaptic } from '../utils/haptics';
import { matchesStockAndSearch, parseStockQuery } from '../utils/stockFilter';

interface DesktopShowroomViewProps {
  products: PerfumeProduct[];
  onSelectProduct: (product: PerfumeProduct, currentFilteredList?: PerfumeProduct[]) => void;
  onExitPcMode: () => void;
  onOpenDeliveryPoints?: () => void;
  onOpenFaq?: () => void;
  onOpenPhotoSync?: () => void;
  onOpenComparison?: () => void;
  onOpenQuiz?: () => void;
  onUpdateProduct?: (product: PerfumeProduct) => void;
  onUpdateProductStock?: (productId: string, newStock: number, status?: string) => void;
  inquiryIds?: string[];
  onToggleInquiryProduct?: (productId: string) => void;
  syncFeedback?: string | null;
  onOpenBusinessMode?: () => void;
}

const INSTAGRAM_URL = 'https://www.instagram.com/olorgardenia';

const POPULAR_BRANDS = [
  'Tom Ford',
  'Dior',
  'Chanel',
  'Creed',
  'Carolina Herrera',
  'Yves Saint Laurent',
  'Jean Paul Gaultier',
  'Paco Rabanne',
  'Versace',
  'Maison Francis Kurkdjian',
  'Valentino',
  'Armani',
  'Prada',
  'Givenchy',
  'Kilian',
  'Lattafa',
  'Louis Vuitton',
  'Parfums de Marly',
  'Xerjoff',
  'Montale',
  'Mancera'
];

export const DesktopShowroomView: React.FC<DesktopShowroomViewProps> = ({
  products,
  onSelectProduct,
  onExitPcMode,
  onOpenFaq,
  onOpenComparison,
  onUpdateProduct,
  onUpdateProductStock,
  inquiryIds = [],
  onToggleInquiryProduct,
  syncFeedback,
  onOpenBusinessMode,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('Todos');
  const [selectedOccasionId, setSelectedOccasionId] = useState<string>('todas');
  const [selectedBrand, setSelectedBrand] = useState<string>('todas');
  const [selectedFamilyId, setSelectedFamilyId] = useState<string>('todos');
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [noteSearchQuery, setNoteSearchQuery] = useState<string>('');
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [editingProduct, setEditingProduct] = useState<PerfumeProduct | null>(null);
  const [adminFilter, setAdminFilter] = useState<'all' | 'popular' | 'wishlist' | 'brands' | null>(null);
  const [isPhotoAuditOpen, setIsPhotoAuditOpen] = useState<boolean>(false);
  const [isBusinessModeOpen, setIsBusinessModeOpen] = useState<boolean>(false);

  // Discreet Visitor Tracking State (PC Mode Header) - Auto-refreshing count
  const [visitorStats, setVisitorStats] = useState<{ uniqueCount: number; totalVisits: number } | null>(null);

  const fetchVisitorStats = async () => {
    try {
      const res = await fetch('/api/visitors/stats');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setVisitorStats(data);
        }
      }
    } catch (e) {
      // Silent error handling for background count
    }
  };

  useEffect(() => {
    fetchVisitorStats();
    // Auto-update counter every 30 seconds
    const interval = setInterval(fetchVisitorStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const categories: ProductCategory[] = ['Todos', 'Mujer', 'Hombre', 'Unisex'];

  // Brand statistics
  const brandStats = useMemo(() => {
    const map = new Map<string, number>();
    products.forEach((p) => {
      const b = p.brand?.trim();
      if (b) {
        map.set(b, (map.get(b) || 0) + 1);
      }
    });
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([brand, count]) => ({
        brand,
        count,
        isPopular: POPULAR_BRANDS.some((pb) => pb.toLowerCase() === brand.toLowerCase()),
      }));
  }, [products]);

  // Extract all individual notes across catalog
  const allOlfactoryNotes = useMemo(() => {
    const map = new Map<string, number>();
    products.forEach((p) => {
      if (!p.notes) return;
      // Clean and split by commas, slashes, bullets, semicolons, and " y " / " e " conjunctions
      const rawTokens = p.notes
        .split(/[,;/•\n]|\s+[ye]\s+/i)
        .map((t) => t.trim())
        .filter((t) => t.length >= 2);

      const uniquePerProduct = new Set<string>();
      rawTokens.forEach((tok) => {
        const cleaned = tok
          .replace(/^[-•*y]\s*/i, '')
          .replace(/\.$/, '')
          .trim();
        // Skip common sentence particles or empty tokens
        if (cleaned.length >= 3 && !/^(el|la|los|las|un|una|con|para|mas|muy)\b/i.test(cleaned)) {
          const formatted = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
          uniquePerProduct.add(formatted);
        }
      });

      uniquePerProduct.forEach((n) => {
        map.set(n, (map.get(n) || 0) + 1);
      });
    });

    return Array.from(map.entries())
      .map(([note, count]) => ({ note, count }))
      .sort((a, b) => b.count - a.count || a.note.localeCompare(b.note));
  }, [products]);

  const normalize = (str: string) =>
    (str || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

  const filteredNotesList = useMemo(() => {
    const q = normalize(noteSearchQuery.trim());
    if (!q) {
      return allOlfactoryNotes.slice(0, 20);
    }
    return allOlfactoryNotes.filter((item) => normalize(item.note).includes(q));
  }, [allOlfactoryNotes, noteSearchQuery]);

  const productMatchesFamily = (p: PerfumeProduct, family: OlfactoryFamily): boolean => {
    const text = normalize(`${p.notes} ${p.description} ${p.name}`);
    return family.keywords.some((kw) => text.includes(kw));
  };

  const productMatchesOccasion = (p: PerfumeProduct, occasion: OccasionFilter): boolean => {
    if (occasion.id === 'todas') return true;
    const text = normalize(`${p.notes} ${p.description} ${p.name} ${p.brand}`);
    return occasion.keywords.some((kw) => text.includes(kw));
  };

  // Filtered list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Admin quick filter from stats cards
      if (adminFilter === 'popular') {
        const isPop = POPULAR_BRANDS.some(
          (pb) => pb.toLowerCase() === p.brand.trim().toLowerCase()
        ) || (p.topSalesRank !== undefined && p.topSalesRank <= 10);
        if (!isPop) return false;
      } else if (adminFilter === 'wishlist') {
        if (!inquiryIds.includes(p.id)) return false;
      } else if (adminFilter === 'brands') {
        if (!p.brand || !p.brand.trim()) return false;
      }

      // Category filter
      if (selectedCategory !== 'Todos' && p.category !== selectedCategory) {
        return false;
      }

      // Occasion filter
      if (selectedOccasionId !== 'todas') {
        const targetOccasion = OCCASION_FILTERS.find((o) => o.id === selectedOccasionId);
        if (targetOccasion && !productMatchesOccasion(p, targetOccasion)) {
          return false;
        }
      }

      // Brand filter
      if (selectedBrand === 'populares') {
        const isPop = POPULAR_BRANDS.some(
          (pb) => pb.toLowerCase() === p.brand.trim().toLowerCase()
        ) || (p.topSalesRank !== undefined && p.topSalesRank <= 10);
        if (!isPop) return false;
      } else if (selectedBrand !== 'todas') {
        if (p.brand.trim().toLowerCase() !== selectedBrand.toLowerCase()) {
          return false;
        }
      }

      // Note filter (Multiple notes - matches any selected note)
      if (selectedNotes.length > 0) {
        const prodNotes = normalize(`${p.notes} ${p.description}`);
        const matchesAny = selectedNotes.some((note) => prodNotes.includes(normalize(note)));
        if (!matchesAny) {
          return false;
        }
      }

      // Family filter
      if (selectedFamilyId !== 'todos') {
        const targetFamily = OLFACTORY_FAMILIES.find((f) => f.id === selectedFamilyId);
        if (targetFamily && !productMatchesFamily(p, targetFamily)) {
          return false;
        }
      }

      // Search term (supports secret stock filter e.g. "stock 0", "stock 2", "stock > 1")
      const raw = searchTerm.trim();
      if (!raw) return true;

      return matchesStockAndSearch(p, raw, normalize);
    }).sort((a, b) => {
      const rankA = a.topSalesRank ?? 99;
      const rankB = b.topSalesRank ?? 99;
      if (rankA !== rankB) return rankA - rankB;
      return (a.name || '').localeCompare(b.name || '');
    });
  }, [products, selectedCategory, selectedOccasionId, selectedBrand, selectedNotes, selectedFamilyId, searchTerm, inquiryIds, adminFilter]);

  const handleImageError = (productId: string) => {
    setImageErrors((prev) => ({ ...prev, [productId]: true }));
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('Todos');
    setSelectedOccasionId('todas');
    setSelectedBrand('todas');
    setSelectedFamilyId('todos');
    setSelectedNotes([]);
    setNoteSearchQuery('');
    setAdminFilter(null);
  };

  const hasFilters =
    searchTerm !== '' ||
    selectedCategory !== 'Todos' ||
    selectedOccasionId !== 'todas' ||
    selectedBrand !== 'todas' ||
    selectedFamilyId !== 'todos' ||
    selectedNotes.length > 0;

  if (isBusinessModeOpen) {
    return (
      <BusinessMovementsView
        products={products}
        onExitBusinessMode={() => setIsBusinessModeOpen(false)}
        onSelectProductDetail={onSelectProduct}
      />
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#0f0f15] text-[#e4e1ed] flex flex-col selection:bg-[#f2ca50] selection:text-[#13131b]">
      {/* PC Ultra-Wide Top Navigation Header */}
      <header className="sticky top-0 z-40 w-full bg-[#13131b]/95 backdrop-blur-xl border-b border-[#292932] px-6 py-3 shrink-0">
        <div className="w-full flex items-center justify-between gap-4">
          {/* Brand and PC Mode Badge + Quick Exit Button for Mobile */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#f2ca50] via-[#e5b93b] to-[#a37c15] p-0.5 shadow-lg shadow-[#f2ca50]/20 flex items-center justify-center shrink-0">
                <div className="w-full h-full bg-[#13131b] rounded-[14px] flex items-center justify-center p-1">
                  <LotusIcon className="w-full h-full text-[#f2ca50]" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-extrabold font-display-friendly text-white tracking-tight drop-shadow-[0_0_8px_rgba(242,202,80,0.7)]">
                    Olor Gardenia
                  </h1>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <button
                    onClick={onExitPcMode}
                    id="exit-pc-mode-btn"
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-[#f2ca50] border border-amber-500/40 text-[11px] font-extrabold transition-all shadow-md active:scale-95 shrink-0"
                    title="Volver a la vista normal (Modo Celular)"
                  >
                    <Smartphone className="w-3.5 h-3.5 text-[#f2ca50]" />
                    <span>Modo Celular</span>
                  </button>
                  <span className="text-[11px] text-[#99907c] font-medium hidden sm:inline">
                    • Muestrario • Vista PC
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Controls: Modo Negocio + FAQs + Comparison + Exit Button + Subtle Visitor Counter Number */}
          <div className="flex items-center gap-2">
            {/* Subtle / Almost Imperceptible Visitor Counter (Only in PC Mode, Non-clickable plain number) */}
            {visitorStats?.uniqueCount !== undefined && (
              <div
                id="pc-header-visitor-count"
                className="px-1.5 py-1 text-[11px] font-mono text-[#5b5668] select-none opacity-40 hover:opacity-80 transition-opacity cursor-default tracking-tight"
                title={`IPs registradas: ${visitorStats.uniqueCount} (${visitorStats.totalVisits || 0} visitas)`}
              >
                {visitorStats.uniqueCount}
              </div>
            )}

            {/* Modo Negocio Button */}
            <button
              type="button"
              onClick={() => {
                triggerAdminAccessHaptic();
                if (onOpenBusinessMode) {
                  onOpenBusinessMode();
                } else {
                  setIsBusinessModeOpen(true);
                }
              }}
              id="pc-header-business-mode-btn"
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#EAB308] via-[#FACC15] to-[#CA8A04] hover:from-[#FACC15] hover:to-[#EAB308] text-[#12131A] text-xs font-black transition-all shadow-md shadow-[#EAB308]/25 active:scale-95 cursor-pointer"
              title="Gestión de Movimientos: Ventas y Abastecimiento en tiempo real"
            >
              <Store className="w-4 h-4 text-[#12131A]" />
              <span>Modo Negocio</span>
            </button>

            {/* Auditar Fotos Button in Header */}
            <button
              type="button"
              onClick={() => setIsPhotoAuditOpen(true)}
              id="pc-header-photo-audit-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1b1b23] hover:bg-[#282834] border border-[#f2ca50]/40 text-[#f2ca50] hover:text-white text-xs font-bold transition-all shadow-sm active:scale-95"
              title="Auditar fotos y copiar IDs de fragancias (initialProducts.ts)"
            >
              <Camera className="w-3.5 h-3.5 text-[#f2ca50]" />
              <span>Auditar Fotos</span>
            </button>

            {/* FAQs Button */}
            {onOpenFaq && (
              <button
                type="button"
                onClick={onOpenFaq}
                id="pc-header-faq-btn"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#1b1b23] hover:bg-[#282834] border border-[#292932] hover:border-[#f2ca50]/40 text-[#e4e1ed] hover:text-[#f2ca50] text-xs font-bold transition-all shadow-sm active:scale-95"
                title="Preguntas frecuentes sobre perfumes, duración y pagos"
              >
                <HelpCircle className="w-3.5 h-3.5 text-[#f2ca50]" />
                <span>FAQs</span>
              </button>
            )}

            {/* Comparison Vs Button */}
            {onOpenComparison && (
              <button
                type="button"
                onClick={onOpenComparison}
                id="pc-header-comparison-btn"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#1b1b23] hover:bg-[#282834] border border-[#f2ca50]/40 text-[#f2ca50] hover:text-white text-xs font-bold transition-all shadow-sm active:scale-95"
                title="Comparar dos perfumes lado a lado (Vs.)"
              >
                <ArrowLeftRight className="w-3.5 h-3.5 text-[#f2ca50]" />
                <span>Vs.</span>
              </button>
            )}


          </div>
        </div>
      </header>

      {/* Main Full-Width Studio Layout */}
      <div className="w-full flex-1 flex overflow-hidden">
        {/* Left Sticky Sidebar (Filters & Quick Navigation) */}
        <aside className="w-64 xl:w-72 shrink-0 bg-[#13131b] border-r border-[#292932] p-2.5 flex flex-col gap-2 overflow-y-auto max-h-[calc(100vh-65px)] custom-scrollbar">
          {/* Sync Feedback Toast Notification */}
          {syncFeedback && (
            <div className="px-3 py-2 rounded-lg bg-[#22c55e]/15 border border-[#22c55e]/40 text-[#4ade80] text-[11px] font-semibold flex items-center gap-2 animate-fadeIn">
              <Check className="w-3.5 h-3.5 shrink-0 text-[#4ade80]" />
              <span className="leading-tight">{syncFeedback}</span>
            </div>
          )}

          {/* Quick Search */}
          <div>
            <label className="block text-[10px] font-bold text-[#99907c] uppercase tracking-wider mb-1">
              Búsqueda Rápida
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#99907c] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Perfume, diseñador o notas..."
                className="w-full pl-8 pr-7 py-1.5 rounded-lg bg-[#1b1b23] border border-[#292932] text-xs text-[#e4e1ed] placeholder-[#99907c] focus:outline-none focus:border-[#f2ca50] transition-colors"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#99907c] hover:text-[#e4e1ed]"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            {parseStockQuery(searchTerm).hasStockFilter && (
              <div className="mt-1.5 px-2 py-1 rounded-md bg-[#f2ca50]/15 border border-[#f2ca50]/30 text-[10px] font-bold text-[#f2ca50] flex items-center justify-between animate-fade-in">
                <span>📦 {parseStockQuery(searchTerm).matchedStockLabel}</span>
                <span className="bg-[#13131b] px-1.5 py-0.2 rounded text-[9px]">{filteredProducts.length} pzs</span>
              </div>
            )}
          </div>

          {/* Gender / Category */}
          <div>
            <label className="block text-[10px] font-bold text-[#99907c] uppercase tracking-wider mb-1">
              Categoría
            </label>
            <div className="grid grid-cols-2 gap-1">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all text-left flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#f2ca50] text-[#13131b] shadow-sm'
                        : 'bg-[#1b1b23] text-[#99907c] hover:text-[#e4e1ed] border border-[#292932]'
                    }`}
                  >
                    <span>{cat}</span>
                    <GenderIcon category={cat} sizeClass="w-3 h-3" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ocasión / Momento de uso */}
          <div>
            <label className="block text-[10px] font-bold text-[#99907c] uppercase tracking-wider mb-1 flex items-center gap-1">
              <Compass className="w-3 h-3 text-[#f2ca50]" />
              <span>Ocasión & Clima</span>
            </label>
            <div className="grid grid-cols-2 gap-1">
              {OCCASION_FILTERS.map((occ) => {
                const isSelected = selectedOccasionId === occ.id;
                return (
                  <button
                    key={occ.id}
                    onClick={() => setSelectedOccasionId(occ.id)}
                    className={`py-1 px-2 rounded-md text-[11px] font-semibold text-left transition-all truncate flex items-center gap-1 ${
                      isSelected
                        ? 'bg-[#f2ca50]/20 text-[#f2ca50] border border-[#f2ca50]/40'
                        : 'text-[#99907c] hover:text-[#e4e1ed] hover:bg-[#1b1b23] bg-[#1b1b23]/50'
                    }`}
                  >
                    <span>{occ.emoji}</span>
                    <span className="truncate">{occ.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Olfactory Families */}
          <div>
            <label className="block text-[10px] font-bold text-[#99907c] uppercase tracking-wider mb-1">
              Familia Olfativa
            </label>
            <div className="space-y-0.5 max-h-28 overflow-y-auto pr-1 custom-scrollbar">
              <button
                onClick={() => setSelectedFamilyId('todos')}
                className={`w-full py-1 px-2 rounded-lg text-xs font-semibold text-left transition-all flex items-center justify-between ${
                  selectedFamilyId === 'todos'
                    ? 'bg-[#f2ca50]/20 text-[#f2ca50] border border-[#f2ca50]/40'
                    : 'text-[#99907c] hover:text-[#e4e1ed] hover:bg-[#1b1b23]'
                }`}
              >
                <span>🌟 Todas las notas</span>
                <span className="text-[10px] font-mono-numbers">{products.length}</span>
              </button>

              {OLFACTORY_FAMILIES.map((family) => {
                const count = products.filter((p) => productMatchesFamily(p, family)).length;
                const isSelected = selectedFamilyId === family.id;
                return (
                  <button
                    key={family.id}
                    onClick={() => setSelectedFamilyId(family.id)}
                    className={`w-full py-1 px-2 rounded-lg text-xs font-semibold text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#f2ca50]/20 text-[#f2ca50] border border-[#f2ca50]/40'
                        : 'text-[#99907c] hover:text-[#e4e1ed] hover:bg-[#1b1b23]'
                    }`}
                  >
                    <span className="truncate">{family.emoji} {family.name}</span>
                    <span className="text-[10px] font-mono-numbers text-[#99907c] ml-1">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Olfactory Specific Notes Multi-Select Filter */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[10px] font-bold text-[#99907c] uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#f2ca50]" />
                <span>Notas Específicas</span>
              </label>
              {selectedNotes.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedNotes([])}
                  className="text-[10px] text-[#f2ca50] hover:underline"
                >
                  Limpiar ({selectedNotes.length})
                </button>
              )}
            </div>

            {/* Note search input */}
            <div className="relative mb-1.5">
              <Search className="w-3 h-3 text-[#99907c] absolute left-2 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={noteSearchQuery}
                onChange={(e) => setNoteSearchQuery(e.target.value)}
                placeholder="Buscar nota..."
                className="w-full pl-7 pr-6 py-1 rounded-lg bg-[#1b1b23] border border-[#292932] text-[11px] text-[#e4e1ed] placeholder-[#99907c] focus:outline-none focus:border-[#f2ca50] transition-colors"
              />
              {noteSearchQuery && (
                <button
                  type="button"
                  onClick={() => setNoteSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#99907c] hover:text-[#e4e1ed]"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              )}
            </div>

            {/* Active notes pills */}
            {selectedNotes.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-1.5 p-1 rounded-lg bg-[#1b1b23] border border-[#f2ca50]/30">
                {selectedNotes.map((note) => (
                  <span
                    key={note}
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[#f2ca50]/20 border border-[#f2ca50]/50 text-[10px] font-semibold text-[#f2ca50]"
                  >
                    <span>{note}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedNotes(prev => prev.filter(n => n !== note))}
                      className="text-[#f2ca50] hover:text-white"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Notes List with Multi-Select toggles */}
            <div className="space-y-0.5 max-h-28 overflow-y-auto pr-1 custom-scrollbar">
              {filteredNotesList.map(({ note, count }) => {
                const isSelected = selectedNotes.some((n) => n.toLowerCase() === note.toLowerCase());
                return (
                  <button
                    key={note}
                    type="button"
                    onClick={() => {
                      setSelectedNotes((prev) =>
                        prev.some((n) => n.toLowerCase() === note.toLowerCase())
                          ? prev.filter((n) => n.toLowerCase() !== note.toLowerCase())
                          : [...prev, note]
                      );
                    }}
                    className={`w-full py-0.5 px-2 rounded-md text-[11px] font-semibold text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#f2ca50] text-[#13131b] font-bold shadow-sm'
                        : 'text-[#99907c] hover:text-[#e4e1ed] hover:bg-[#1b1b23]'
                    }`}
                  >
                    <span className="truncate flex items-center gap-1.5">
                      <span className={`w-2.5 h-2.5 rounded border flex items-center justify-center shrink-0 ${isSelected ? 'bg-[#13131b] border-[#13131b] text-[#f2ca50]' : 'border-[#34343d]'}`}>
                        {isSelected && <Check className="w-2 h-2 stroke-[3]" />}
                      </span>
                      <span>{note}</span>
                    </span>
                    <span
                      className={`text-[9px] font-mono-numbers px-1 rounded ${
                        isSelected ? 'bg-[#13131b]/20 text-[#13131b]' : 'text-[#99907c]'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Brands Fast Filter */}
          <div className="flex-1 min-h-[110px] flex flex-col">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[10px] font-bold text-[#99907c] uppercase tracking-wider">
                Marcas / Diseñadores
              </label>
              {selectedBrand !== 'todas' && (
                <button
                  onClick={() => setSelectedBrand('todas')}
                  className="text-[10px] text-[#f2ca50] hover:underline"
                >
                  Todas
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto space-y-0.5 pr-1 max-h-36 custom-scrollbar">
              <button
                onClick={() => setSelectedBrand('todas')}
                className={`w-full py-1 px-2 rounded-lg text-xs font-semibold text-left transition-all flex items-center justify-between ${
                  selectedBrand === 'todas'
                    ? 'bg-[#f2ca50]/20 text-[#f2ca50] border border-[#f2ca50]/40'
                    : 'text-[#99907c] hover:text-[#e4e1ed] hover:bg-[#1b1b23]'
                }`}
              >
                <span>Todas las marcas</span>
                <span className="text-[10px] font-mono-numbers">{products.length}</span>
              </button>

              <button
                onClick={() => setSelectedBrand('populares')}
                className={`w-full py-1 px-2 rounded-lg text-xs font-bold text-left transition-all flex items-center justify-between ${
                  selectedBrand === 'populares'
                    ? 'bg-[#f2ca50] text-[#13131b]'
                    : 'text-[#f2ca50] hover:bg-[#1b1b23]'
                }`}
              >
                <span>🔥 Populares / Top Ventas</span>
              </button>

              {brandStats.map(({ brand, count, isPopular }) => {
                const isSelected = selectedBrand.toLowerCase() === brand.toLowerCase();
                return (
                  <button
                    key={brand}
                    onClick={() => setSelectedBrand(brand)}
                    className={`w-full py-1 px-2 rounded-lg text-xs font-semibold text-left transition-all flex items-center justify-between truncate ${
                      isSelected
                        ? 'bg-[#f2ca50]/20 text-[#f2ca50] border border-[#f2ca50]/40'
                        : 'text-[#99907c] hover:text-[#e4e1ed] hover:bg-[#1b1b23]'
                    }`}
                  >
                    <span className="truncate">
                      {isPopular ? '⭐ ' : ''}{brand}
                    </span>
                    <span className="text-[10px] font-mono-numbers text-[#99907c] ml-1 shrink-0">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reset All */}
          {hasFilters && (
            <button
              onClick={handleResetFilters}
              className="w-full py-1.5 px-3 rounded-lg bg-[#1b1b23] hover:bg-[#292932] text-[#f2ca50] text-xs font-bold transition-colors flex items-center justify-center gap-1.5 border border-[#292932]"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Restablecer Filtros</span>
            </button>
          )}
        </aside>

        {/* Right Ultra-Wide Full Screen Grid */}
        <main className="flex-1 p-5 overflow-hidden flex flex-col max-h-[calc(100vh-65px)]">
          {/* Header Bar within Showroom */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-2 border-b border-[#292932]/70">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold font-serif-luxury text-[#e4e1ed]">
                  Panel de Administración & Colección
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-[#1b1b23] border border-[#292932] text-[11px] font-bold text-[#f2ca50]">
                  {filteredProducts.length} resultados
                </span>
              </div>
              <p className="text-[11px] text-[#99907c] mt-0.5">
                Modo Administrador PC: Edición en tiempo real sincronizada automáticamente con la nube.
              </p>
            </div>
          </div>

          {/* Admin Stats Dashboard (Slim & Compact for 15.6") */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
            <div 
              onClick={handleResetFilters}
              className={`p-2.5 rounded-xl bg-[#161622] border transition-all cursor-pointer flex items-center gap-2.5 ${adminFilter === null && selectedBrand === 'todas' ? 'border-[#f2ca50] bg-[#f2ca50]/15 shadow-sm' : 'border-[#292932] hover:border-[#f2ca50]/50'}`}
              title="Clic para ver todo el catálogo"
            >
              <div className="w-8 h-8 rounded-lg bg-[#f2ca50]/15 text-[#f2ca50] flex items-center justify-center font-bold shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] text-[#99907c] uppercase font-semibold truncate">Total Catálogo</p>
                <p className="text-xs sm:text-sm font-bold text-white font-mono-numbers">{products.length} fragancias</p>
              </div>
            </div>

            <div 
              onClick={() => { setAdminFilter(adminFilter === 'brands' ? null : 'brands'); }}
              className={`p-2.5 rounded-xl bg-[#161622] border transition-all cursor-pointer flex items-center gap-2.5 ${adminFilter === 'brands' ? 'border-purple-500 bg-purple-500/20 shadow-sm' : 'border-[#292932] hover:border-purple-500/50'}`}
              title="Clic para filtrar catálogo activo"
            >
              <div className="w-8 h-8 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center font-bold shrink-0">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] text-[#99907c] uppercase font-semibold truncate">Marcas Activas</p>
                <p className="text-xs sm:text-sm font-bold text-white font-mono-numbers">{brandStats.length} marcas</p>
              </div>
            </div>

            <div 
              onClick={() => { setAdminFilter(adminFilter === 'popular' ? null : 'popular'); }}
              className={`p-2.5 rounded-xl bg-[#161622] border transition-all cursor-pointer flex items-center gap-2.5 ${adminFilter === 'popular' ? 'border-amber-500 bg-amber-500/20 shadow-sm' : 'border-[#292932] hover:border-amber-500/50'}`}
              title="Clic para filtrar solo Top Ventas / Populares"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center font-bold shrink-0">
                <Flame className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] text-[#99907c] uppercase font-semibold truncate">Top Ventas / Populares</p>
                <p className="text-xs sm:text-sm font-bold text-white font-mono-numbers">
                  {products.filter(p => POPULAR_BRANDS.some(pb => pb.toLowerCase() === p.brand.trim().toLowerCase())).length}
                </p>
              </div>
            </div>

            <div 
              onClick={() => { setAdminFilter(adminFilter === 'wishlist' ? null : 'wishlist'); }}
              className={`p-2.5 rounded-xl bg-[#161622] border transition-all cursor-pointer flex items-center gap-2.5 ${adminFilter === 'wishlist' ? 'border-pink-500 bg-pink-500/20 shadow-sm' : 'border-[#292932] hover:border-pink-500/50'}`}
              title="Clic para filtrar por favoritos de clientes (Wishlist)"
            >
              <div className="w-8 h-8 rounded-lg bg-pink-500/15 text-pink-400 flex items-center justify-center font-bold shrink-0">
                <Heart className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] text-[#99907c] uppercase font-semibold truncate">En Wishlist (Clientes)</p>
                <p className="text-xs sm:text-sm font-bold text-white font-mono-numbers">{inquiryIds.length} favoritos</p>
              </div>
            </div>
          </div>

          {/* Products Gallery Container with Internal Scroll */}
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
            {filteredProducts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center rounded-2xl bg-[#13131b] border border-[#292932]">
                <div className="w-12 h-12 rounded-xl bg-[#1b1b23] text-[#f2ca50] flex items-center justify-center mb-2">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-[#e4e1ed]">No se encontraron perfumes</h3>
                <p className="text-xs text-[#99907c] max-w-sm mt-1 mb-3">
                  No hay fragancias que coincidan con los criterios seleccionados.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 rounded-xl bg-[#f2ca50] text-[#13131b] text-xs font-bold hover:bg-[#ffe088] transition-all shadow-md"
                >
                  Ver todo el catálogo
                </button>
              </div>
            ) : (
              <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 pb-6">
              {filteredProducts.map((product) => {
                const hasImageError = imageErrors[product.id] || !product.image;
                const isPopular = POPULAR_BRANDS.some((pb) => pb.toLowerCase() === product.brand.trim().toLowerCase());

                return (
                  <div
                    key={product.id}
                    onClick={() => onSelectProduct(product, filteredProducts)}
                    id={`pc-product-card-${product.id}`}
                    className="group relative flex flex-col justify-between p-3 rounded-2xl bg-[#13131b] hover:bg-[#1b1b23] border border-[#292932] hover:border-[#f2ca50] transition-all duration-200 cursor-pointer shadow-md hover:shadow-2xl hover:shadow-black/70 hover:-translate-y-1"
                  >
                    {/* Versus / Wishlist Heart Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleInquiryProduct?.(product.id);
                      }}
                      className={`absolute top-2 right-2 z-20 p-1.5 rounded-lg backdrop-blur-md transition-all shadow-md ${
                        inquiryIds.includes(product.id)
                          ? 'bg-pink-500/20 text-pink-400 border border-pink-500/40 opacity-100'
                          : 'bg-[#161622]/95 text-[#99907c] hover:text-pink-400 border border-[#292932] opacity-0 group-hover:opacity-100'
                      }`}
                      title={inquiryIds.includes(product.id) ? 'Quitar del modo versus' : 'Añadir al modo versus (wishlist)'}
                    >
                      <Heart className={`w-3.5 h-3.5 ${inquiryIds.includes(product.id) ? 'fill-pink-400 text-pink-400' : ''}`} />
                    </button>

                    {/* Quick Admin Edit Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingProduct(product);
                      }}
                      className="absolute top-2 left-2 z-20 p-1.5 rounded-lg bg-[#161622]/95 hover:bg-[#f2ca50] text-[#99907c] hover:text-[#13131b] border border-[#292932] hover:border-[#f2ca50] backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all shadow-md"
                      title="Editar producto y stock (Modo Admin)"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>

                    {product.topSalesRank !== undefined && product.topSalesRank <= 3 && !inquiryIds.includes(product.id) && (
                      <div className="absolute top-2 left-9 z-10">
                        <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-[#13131b]/95 backdrop-blur-sm border border-[#f2ca50]/50 text-[9px] font-extrabold text-[#f2ca50] shadow-md">
                          <span>{product.topSalesRank === 1 ? '🔥 #1 Más Vendido' : product.topSalesRank === 2 ? '⭐ Top 2' : '⭐ Top 3'}</span>
                        </span>
                      </div>
                    )}

                    {/* Bottle Image Container */}
                    <div className="relative w-full aspect-square rounded-xl bg-[#0c0c12] overflow-hidden flex items-center justify-center p-2.5 border border-[#292932]/50 group-hover:border-[#f2ca50]/30 transition-colors mt-4">
                      {/* Stock Badge on Bottom-Right of Photo */}
                      <div className="absolute bottom-1.5 right-1.5 z-10 pointer-events-none">
                        <span
                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold backdrop-blur-md shadow-sm font-mono-numbers border ${
                            (product.stock ?? 0) > 2
                              ? 'bg-[#122416]/90 border-[#22c55e]/50 text-[#4ade80]'
                              : (product.stock ?? 0) > 0
                              ? 'bg-[#291e10]/90 border-[#eab308]/50 text-[#facc15]'
                              : 'bg-[#291417]/90 border-[#ef4444]/50 text-[#f87171]'
                          }`}
                          title={`Stock: ${product.stock ?? 0} unidades`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            (product.stock ?? 0) > 2
                              ? 'bg-[#4ade80]'
                              : (product.stock ?? 0) > 0
                              ? 'bg-[#facc15]'
                              : 'bg-[#f87171]'
                          }`} />
                          <span>Stock: {product.stock ?? 0}</span>
                        </span>
                      </div>

                      {!hasImageError ? (
                        <img
                          src={getOptimizedImageUrl(product.image)}
                          alt={product.name}
                          referrerPolicy="no-referrer"
                          onError={() => handleImageError(product.id)}
                          className="w-full h-full object-contain group-hover:scale-108 transition-transform duration-300 filter drop-shadow-md"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-center p-1 text-[#99907c]">
                          <Droplets className="w-8 h-8 text-[#f2ca50]/40 mb-1" />
                          <span className="text-[10px] font-medium line-clamp-1">{product.brand}</span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="mt-2.5 flex flex-col justify-between flex-grow text-center">
                      <p className="text-[10px] font-bold text-[#f2ca50] truncate tracking-wider uppercase">
                        {product.brand}
                      </p>

                      <div className="flex items-center justify-center gap-1 mt-0.5 min-h-[2.4em]">
                        <h4 className="text-xs font-bold text-[#e4e1ed] group-hover:text-white transition-colors line-clamp-2 leading-tight">
                          {product.name}
                        </h4>
                        <GenderIcon category={product.category} sizeClass="w-3 h-3 shrink-0" />
                      </div>

                      {/* Presentation Volume & Category */}
                      <div className="mt-1.5 flex items-center justify-center gap-1.5">
                        <span className="text-[9px] text-[#99907c] bg-[#1b1b23] px-2 py-0.5 rounded border border-[#292932] font-mono-numbers">
                          {product.volume || '60ml'}
                        </span>
                        <span className="text-[9px] text-[#f2ca50] font-semibold">
                          {product.category}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          </div>
        </main>
      </div>

      {/* Quick Edit Modal (Suggestions 1 & 4) */}
      {editingProduct && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
          onClick={(e) => { if (e.target === e.currentTarget) setEditingProduct(null); }}
        >
          <div className="w-full max-w-lg bg-[#161622] border border-[#292932] rounded-3xl p-6 shadow-2xl text-[#e4e1ed] space-y-4">
            <div className="flex items-center justify-between border-b border-[#292932] pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Pencil className="w-4 h-4 text-[#f2ca50]" />
                Edición Rápida de Inventario (Modo Admin)
              </h3>
              <button 
                onClick={() => setEditingProduct(null)}
                className="p-2 rounded-xl bg-[#1b1b23] hover:bg-[#292932] text-[#99907c] hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-[#99907c] uppercase mb-1">Nombre del Perfume</label>
                <input 
                  type="text"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#13131b] border border-[#292932] text-xs text-white focus:outline-none focus:border-[#f2ca50]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#99907c] uppercase mb-1">Marca / Diseñador</label>
                  <input 
                    type="text"
                    value={editingProduct.brand}
                    onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#13131b] border border-[#292932] text-xs text-white focus:outline-none focus:border-[#f2ca50]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#99907c] uppercase mb-1">Categoría</label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value as ProductCategory })}
                    className="w-full px-3 py-2 rounded-xl bg-[#13131b] border border-[#292932] text-xs text-white focus:outline-none focus:border-[#f2ca50]"
                  >
                    <option value="Mujer">Mujer</option>
                    <option value="Hombre">Hombre</option>
                    <option value="Unisex">Unisex</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#99907c] uppercase mb-1">Stock (Unidades)</label>
                  <input 
                    type="number"
                    min={0}
                    value={editingProduct.stock ?? 0}
                    onChange={(e) => {
                      const val = Math.max(0, parseInt(e.target.value, 10) || 0);
                      setEditingProduct({ 
                        ...editingProduct, 
                        stock: val,
                        status: val > 0 ? 'Disponible' : 'Agotado',
                        estado: val > 0 ? 'Disponible' : 'Agotado'
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-[#13131b] border border-[#292932] text-xs text-white font-mono focus:outline-none focus:border-[#f2ca50]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#99907c] uppercase mb-1">Estado</label>
                  <select
                    value={editingProduct.status || (editingProduct.stock > 0 ? 'Disponible' : 'Agotado')}
                    onChange={(e) => setEditingProduct({ ...editingProduct, status: e.target.value, estado: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#13131b] border border-[#292932] text-xs text-white focus:outline-none focus:border-[#f2ca50]"
                  >
                    <option value="Disponible">Disponible</option>
                    <option value="Agotado">Agotado</option>
                    <option value="Bajo Pedido">Bajo Pedido</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#99907c] uppercase mb-1">Presentación / Volumen</label>
                  <input 
                    type="text"
                    value={editingProduct.volume || '60ml'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, volume: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#13131b] border border-[#292932] text-xs text-white focus:outline-none focus:border-[#f2ca50]"
                  />
                </div>

              <div className="space-y-2 p-3 rounded-2xl bg-[#13131b] border border-[#292932]">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-[#f2ca50] flex items-center gap-1.5 uppercase">
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Editor de Imagen (Inventario)</span>
                  </label>
                  <a
                    href={`https://www.google.com/search?q=${encodeURIComponent(`${editingProduct.brand} ${editingProduct.name} ${editingProduct.category} perfume`)}&tbm=isch`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-[#252530] hover:bg-[#f2ca50] text-[#d0c5af] hover:text-[#13131b] text-[11px] font-bold flex items-center gap-1 transition-all border border-[#34343d]"
                    title="Buscar en Google Imágenes"
                  >
                    <Search className="w-3 h-3" />
                    <span>Google Imágenes</span>
                    <ExternalLink className="w-2.5 h-2.5 ml-0.5 opacity-70" />
                  </a>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl bg-[#1b1b23] border border-[#292932] overflow-hidden flex items-center justify-center shrink-0 p-1">
                    {editingProduct.image ? (
                      <img 
                        src={editingProduct.image} 
                        alt="Preview" 
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&auto=format&fit=crop&q=80'; }}
                      />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-[#99907c]" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <label className="text-[10px] uppercase font-bold text-[#99907c] block">
                      URL de la foto
                    </label>
                    <input 
                      type="url"
                      value={editingProduct.image || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                      placeholder="https://... o link de imagen"
                      className="w-full px-3 py-1.5 rounded-xl bg-[#1b1b23] border border-[#292932] text-xs text-white focus:outline-none focus:border-[#f2ca50] font-mono"
                    />
                  </div>
                </div>
              </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#99907c] uppercase mb-1">Notas Olfativas</label>
                <textarea 
                  rows={2}
                  value={editingProduct.notes || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#13131b] border border-[#292932] text-xs text-white focus:outline-none focus:border-[#f2ca50] resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#292932]">
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="px-4 py-2 rounded-xl bg-[#1b1b23] hover:bg-[#292932] text-xs font-semibold text-[#99907c] transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (editingProduct) {
                    if (onUpdateProduct) {
                      onUpdateProduct(editingProduct);
                    }
                    if (onUpdateProductStock) {
                      onUpdateProductStock(
                        editingProduct.id, 
                        editingProduct.stock ?? 0, 
                        editingProduct.status || (editingProduct.stock > 0 ? 'Disponible' : 'Agotado')
                      );
                    }
                  }
                  setEditingProduct(null);
                }}
                className="px-5 py-2 rounded-xl bg-[#f2ca50] hover:bg-[#ffe088] text-[#13131b] text-xs font-bold shadow-md shadow-[#f2ca50]/20 transition-all"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating "Auditar Fotos" Button (Exclusively in PC Mode) */}
      <button
        type="button"
        onClick={() => setIsPhotoAuditOpen(true)}
        id="pc-floating-photo-audit-btn"
        className="fixed bottom-6 right-6 z-40 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#1c1b26] to-[#252536] hover:from-[#252536] hover:to-[#323248] text-[#f2ca50] hover:text-white border border-[#f2ca50]/50 hover:border-[#f2ca50] shadow-2xl shadow-black/80 flex items-center gap-2.5 text-xs font-bold transition-all active:scale-95 group cursor-pointer"
        title="Auditar fotos de todos los productos en cuadrícula compacta"
      >
        <div className="w-6 h-6 rounded-lg bg-[#f2ca50]/15 flex items-center justify-center group-hover:scale-110 transition-transform">
          <Camera className="w-3.5 h-3.5 text-[#f2ca50]" />
        </div>
        <span>Auditar Fotos</span>
      </button>

      {/* Compact Photo Audit Grid Modal */}
      <PhotoAuditGridModal
        isOpen={isPhotoAuditOpen}
        onClose={() => setIsPhotoAuditOpen(false)}
      />

      {/* Business Movements View (Ventas & Stock) inside Desktop Showroom */}
      {isBusinessModeOpen && (
        <div className="fixed inset-0 z-50 bg-[#12131A] overflow-y-auto">
          <BusinessMovementsView
            products={products}
            onExitBusinessMode={() => setIsBusinessModeOpen(false)}
            onUpdateProducts={(updated) => {
              updated.forEach(p => onUpdateProduct?.(p));
            }}
          />
        </div>
      )}
    </div>
  );
};
