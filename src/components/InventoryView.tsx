import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Sparkles, 
  Droplets, 
  ChevronDown,
  RotateCcw,
  Tag,
  X,
  ArrowUp,
  SlidersHorizontal,
  Compass,
  Flame,
  Moon,
  Briefcase,
  Sun,
  Snowflake,
  PartyPopper,
  Check,
  MessageCircle,
  ArrowUpDown,
  ChevronRight,
  Heart,
  LayoutGrid,
  List
} from 'lucide-react';
import { PerfumeProduct, ProductCategory } from '../types';
import { GenderIcon } from './GenderBadge';
import { getOptimizedImageUrl } from '../utils/imageUrl';
import { matchesStockAndSearch, parseStockQuery } from '../utils/stockFilter';

interface InventoryViewProps {
  products: PerfumeProduct[];
  onSelectProduct: (product: PerfumeProduct) => void;
  inquiryCount?: number;
  onOpenInquiry?: () => void;
  onOpenFaq?: () => void;
  onOpenQuiz?: () => void;
  inquiryIds?: string[];
  onToggleInquiryProduct?: (productId: string) => void;
}

// Top prestige / best-selling brands
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

// Ocasión / Clima / Momento de uso Filters
export interface OccasionFilter {
  id: string;
  name: string;
  shortName: string;
  emoji: string;
  description: string;
  icon: React.ReactNode;
  keywords: string[];
}

export const OCCASION_FILTERS: OccasionFilter[] = [
  {
    id: 'todas',
    name: 'Todas las ocasiones',
    shortName: 'Todas',
    emoji: '✨',
    description: 'Ver todo el catálogo',
    icon: <Sparkles className="w-3.5 h-3.5" />,
    keywords: [],
  },
  {
    id: 'citas-noche',
    name: 'Citas & Noche',
    shortName: 'Citas / Noche',
    emoji: '🌙',
    description: 'Seductoras, sensuales y misteriosas',
    icon: <Moon className="w-3.5 h-3.5 text-[#d8b4fe]" />,
    keywords: ['vainilla', 'ambar', 'cuero', 'tabaco', 'azafran', 'canela', 'haba tonka', 'cereza', 'cardamomo', 'sensual', 'nocturno', 'seductor', 'dulce', 'oscuro', 'oud', 'miel', 'praline', 'licor', 'ron', 'gourmand'],
  },
  {
    id: 'oficina-diario',
    name: 'Oficina & Diario',
    shortName: 'Oficina / Diario',
    emoji: '💼',
    description: 'Limpias, versátiles y elegantes',
    icon: <Briefcase className="w-3.5 h-3.5 text-[#93c5fd]" />,
    keywords: ['vetiver', 'lavanda', 'limpio', 'cedro', 'bergamota', 'salvia', 'almizcle', 'elegante', 'pulcro', 'fresco', 'jabonoso', 'suave', 'iris', 'aldehidos', 'romero', 'neroli', 'te', 'sandalo'],
  },
  {
    id: 'calor-verano',
    name: 'Calor & Verano',
    shortName: 'Calor / Verano',
    emoji: '☀️',
    description: 'Frescas, cítricas y acuáticas',
    icon: <Sun className="w-3.5 h-3.5 text-[#facc15]" />,
    keywords: ['marino', 'acuatico', 'limon', 'mandarina', 'toronja', 'pomelo', 'menta', 'sal marina', 'fresco', 'citrico', 'brisa', 'yuzu', 'calone', 'calor', 'verano', 'lima', 'naranja', 'aqua', 'ocean'],
  },
  {
    id: 'invierno-frio',
    name: 'Invierno & Frío',
    shortName: 'Invierno / Frío',
    emoji: '❄️',
    description: 'Cálidas, especiadas y envolventes',
    icon: <Snowflake className="w-3.5 h-3.5 text-[#67e8f9]" />,
    keywords: ['canela', 'miel', 'chocolate', 'cacao', 'praline', 'especias', 'cafe', 'guayaco', 'ambar', 'vainilla', 'calido', 'intenso', 'invierno', 'frio', 'clavo', 'pimienta', 'incienso', 'resina'],
  },
  {
    id: 'fiesta-cumplidos',
    name: 'Fiesta & Cumplidos',
    shortName: 'Fiesta / Impacto',
    emoji: '🔥',
    description: 'Alta proyección, magnetismo y halagos',
    icon: <PartyPopper className="w-3.5 h-3.5 text-[#f87171]" />,
    keywords: ['manzana', 'frambuesa', 'haba tonka', 'vainilla', 'cuero', 'oud', 'pimienta', 'proyeccion', 'fuerte', 'cumplidos', 'fiesta', 'joven', 'vibrante', 'duradero', 'intenso', 'clubbing', 'dulce', 'baccarat', 'erba', 'aventus', 'sauvage', 'ultramale', 'eros'],
  },
];

// Rich Olfactory Families categorized into Macro Groups
export interface OlfactoryFamily {
  id: string;
  name: string;
  emoji: string;
  tag: string;
  group: 'Frescura' | 'Dulzura' | 'Maderas' | 'Seducción' | 'Intensidad';
  keywords: string[];
}

export const OLFACTORY_FAMILIES: OlfactoryFamily[] = [
  // Frescura & Vitalidad
  {
    id: 'citricos',
    name: 'Cítricos & Chispeantes',
    emoji: '🍋',
    tag: 'Fresco',
    group: 'Frescura',
    keywords: ['bergamota', 'limon', 'mandarina', 'pomelo', 'naranja', 'lima', 'citrico', 'toronja', 'yuzu'],
  },
  {
    id: 'acuaticos',
    name: 'Acuáticos & Marinos',
    emoji: '🌊',
    tag: 'Marino',
    group: 'Frescura',
    keywords: ['marino', 'acuatico', 'sal marina', 'brisa', 'ozono', 'calone', 'mar', 'agua'],
  },
  {
    id: 'aromaticos',
    name: 'Aromáticos & Herbales',
    emoji: '🌿',
    tag: 'Herbal',
    group: 'Frescura',
    keywords: ['lavanda', 'menta', 'albahaca', 'romero', 'salvia', 'hierba', 'eucalipto', 'tomillo'],
  },

  // Dulzura & Gourmand
  {
    id: 'vainilla',
    name: 'Vainilla & Gourmand',
    emoji: '✨',
    tag: 'Dulce',
    group: 'Dulzura',
    keywords: ['vainilla', 'haba tonka', 'caramelo', 'cacao', 'cafe', 'miel', 'praline', 'chocolate', 'dulce', 'azucar'],
  },
  {
    id: 'frutales',
    name: 'Frutales & Jugosos',
    emoji: '🍓',
    tag: 'Frutal',
    group: 'Dulzura',
    keywords: ['manzana', 'frambuesa', 'grosella', 'durazno', 'cereza', 'ciruela', 'pera', 'pina', 'maracuya', 'frutos rojos', 'coco'],
  },

  // Maderas & Elegancia
  {
    id: 'amaderados',
    name: 'Amaderados & Cedro',
    emoji: '🌲',
    tag: 'Madera',
    group: 'Maderas',
    keywords: ['cedro', 'sandalo', 'vetiver', 'cipres', 'madera', 'pachuli', 'patchouli', 'guayaco', 'abeto'],
  },
  {
    id: 'oud',
    name: 'Oud & Maderas Nobles',
    emoji: '👑',
    tag: 'Oud',
    group: 'Maderas',
    keywords: ['oud', 'agarwood', 'madera de agar', 'resina', 'mirra', 'incienso'],
  },

  // Seducción & Flores
  {
    id: 'florales',
    name: 'Florales & Rosas',
    emoji: '🌸',
    tag: 'Floral',
    group: 'Seducción',
    keywords: ['rosa', 'jazmin', 'flor de azahar', 'tuberosa', 'neroli', 'gardenia', 'iris', 'violeta', 'orquidea', 'magnolia'],
  },
  {
    id: 'orientales',
    name: 'Ámbar & Especias Cálidas',
    emoji: '🔥',
    tag: 'Ámbar',
    group: 'Seducción',
    keywords: ['ambar', 'canela', 'cardamomo', 'pimienta', 'clavo', 'azafran', 'nuez moscada', 'especias', 'calido'],
  },

  // Intensidad & Carácter
  {
    id: 'cuero',
    name: 'Cuero & Tabaco',
    emoji: '🖤',
    tag: 'Cuero',
    group: 'Intensidad',
    keywords: ['cuero', 'tabaco', 'humo', 'ahumado', 'gamuza', 'abedul', 'cuero negro'],
  },
  {
    id: 'almizcle',
    name: 'Almizcle & Limpio',
    emoji: '☁️',
    tag: 'Limpio',
    group: 'Intensidad',
    keywords: ['almizcle', 'musk', 'aldehidos', 'algodon', 'talco', 'jabonoso', 'limpio', 'polvo'],
  },
];

const MACRO_GROUPS = [
  { id: 'todos', name: 'Todas las Familias', emoji: '🌟' },
  { id: 'Frescura', name: 'Frescos & Cítricos', emoji: '🍋' },
  { id: 'Dulzura', name: 'Gourmand & Frutales', emoji: '✨' },
  { id: 'Maderas', name: 'Maderas & Oud', emoji: '🌲' },
  { id: 'Seducción', name: 'Florales & Especias', emoji: '🌸' },
  { id: 'Intensidad', name: 'Cuero & Almizcle', emoji: '🖤' },
];

export const InventoryView: React.FC<InventoryViewProps> = ({
  products,
  onSelectProduct,
  inquiryCount,
  onOpenInquiry,
  onOpenQuiz,
  inquiryIds = [],
  onToggleInquiryProduct,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('Todos');
  const [selectedOccasionId, setSelectedOccasionId] = useState<string>('todas');
  const [brandFilterMode, setBrandFilterMode] = useState<'todas' | 'populares' | string>('todas');
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [sortBy, setSortBy] = useState<'default' | 'top_sales' | 'brand_asc' | 'brand_desc' | 'name_asc' | 'name_desc'>('top_sales');
  
  // Layout state
  const [layoutMode, setLayoutMode] = useState<'grid-2' | 'list'>('grid-2');
  
  // Olfactory Filter States
  const [selectedMacroGroup, setSelectedMacroGroup] = useState<string>('todos');
  const [selectedFamilyId, setSelectedFamilyId] = useState<string>('todos');
  const [selectedNote, setSelectedNote] = useState<string>('');
  const [noteSearchQuery, setNoteSearchQuery] = useState<string>('');
  const [showAllNotes, setShowAllNotes] = useState<boolean>(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [showBackToTop, setShowBackToTop] = useState(false);

  const categories: { id: ProductCategory; label: string }[] = [
    { id: 'Todos', label: 'Todos' },
    { id: 'Hombre', label: 'Hombre' },
    { id: 'Mujer', label: 'Mujer' },
    { id: 'Unisex', label: 'Unisex' },
  ];

  // Track scroll for back to top button on mobile
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  // Helper normalize string
  const normalize = (str: string) =>
    (str || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

  // Calculate all unique brands from catalog
  const allAvailableBrands = useMemo(() => {
    const brandMap = new Map<string, number>();
    products.forEach((p) => {
      const b = p.brand?.trim();
      if (b) {
        brandMap.set(b, (brandMap.get(b) || 0) + 1);
      }
    });
    return Array.from(brandMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([brand, count]) => ({ brand, count }));
  }, [products]);

  // Extract all individual olfactory notes across the entire catalog
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

  // Dynamically filtered list of notes based on what the user types in the note search box
  const filteredNotesList = useMemo(() => {
    const q = normalize(noteSearchQuery.trim());
    if (!q) {
      return showAllNotes ? allOlfactoryNotes : allOlfactoryNotes.slice(0, 24);
    }
    return allOlfactoryNotes.filter((item) => normalize(item.note).includes(q));
  }, [allOlfactoryNotes, noteSearchQuery, showAllNotes]);

  const hasActiveAdvancedFilters =
    brandFilterMode !== 'todas' ||
    selectedMacroGroup !== 'todos' ||
    selectedFamilyId !== 'todos' ||
    selectedOccasionId !== 'todas' ||
    selectedNote !== '';

  const hasAnyActiveFilters =
    searchTerm !== '' ||
    selectedCategory !== 'Todos' ||
    brandFilterMode !== 'todas' ||
    selectedMacroGroup !== 'todos' ||
    selectedFamilyId !== 'todos' ||
    selectedOccasionId !== 'todas' ||
    selectedNote !== '';

  const handleResetFilters = () => {
    setBrandFilterMode('todas');
    setSelectedMacroGroup('todos');
    setSelectedFamilyId('todos');
    setSelectedOccasionId('todas');
    setSelectedNote('');
    setNoteSearchQuery('');
    setSearchTerm('');
    setSelectedCategory('Todos');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isPopularBrand = (brandName: string) => {
    return POPULAR_BRANDS.some((pb) => pb.toLowerCase() === brandName.trim().toLowerCase());
  };

  // Test if a product matches a given family
  const productMatchesFamily = (p: PerfumeProduct, family: OlfactoryFamily): boolean => {
    const text = normalize(`${p.notes} ${p.description} ${p.name}`);
    return family.keywords.some((kw) => text.includes(kw));
  };

  // Test if a product matches an occasion
  const productMatchesOccasion = (p: PerfumeProduct, occasion: OccasionFilter): boolean => {
    if (occasion.id === 'todas') return true;
    const text = normalize(`${p.notes} ${p.description} ${p.name} ${p.brand}`);
    return occasion.keywords.some((kw) => text.includes(kw));
  };

  // Filtered families list based on active Macro Group
  const activeFamilies = useMemo(() => {
    if (selectedMacroGroup === 'todos') return OLFACTORY_FAMILIES;
    return OLFACTORY_FAMILIES.filter((f) => f.group === selectedMacroGroup);
  }, [selectedMacroGroup]);

  // Main filtered products list
  const filteredProducts = useMemo(() => {
    const list = products.filter((p) => {
      // Category filter
      const matchesCategory =
        selectedCategory === 'Todos' || p.category === selectedCategory;
      if (!matchesCategory) return false;

      // Occasion / Clima filter (Inside advanced filters)
      if (selectedOccasionId !== 'todas') {
        const targetOccasion = OCCASION_FILTERS.find((o) => o.id === selectedOccasionId);
        if (targetOccasion && !productMatchesOccasion(p, targetOccasion)) {
          return false;
        }
      }

      // Brand filter
      if (brandFilterMode !== 'todas') {
        if (p.brand.trim().toLowerCase() !== brandFilterMode.toLowerCase()) {
          return false;
        }
      }

      // Specific Olfactory Note filter
      if (selectedNote) {
        const noteNorm = normalize(selectedNote);
        const prodNotes = normalize(`${p.notes} ${p.description}`);
        if (!prodNotes.includes(noteNorm)) {
          return false;
        }
      }

      // Olfactory Family Filter
      if (selectedFamilyId !== 'todos') {
        const targetFamily = OLFACTORY_FAMILIES.find((f) => f.id === selectedFamilyId);
        if (targetFamily && !productMatchesFamily(p, targetFamily)) {
          return false;
        }
      } else if (selectedMacroGroup !== 'todos' && selectedFamilyId === 'todos') {
        const groupFamilies = OLFACTORY_FAMILIES.filter((f) => f.group === selectedMacroGroup);
        const matchesGroup = groupFamilies.some((f) => productMatchesFamily(p, f));
        if (!matchesGroup) return false;
      }

      // Search query filter (supports secret stock filter e.g. "stock 0", "stock 2", "stock > 1")
      const rawTerm = searchTerm.trim();
      if (!rawTerm) return true;

      return matchesStockAndSearch(p, rawTerm, normalize);
    });

    // Apply sorting
    return list.sort((a, b) => {
      if (sortBy === 'default' || sortBy === 'top_sales') {
        const rankA = a.topSalesRank ?? (isPopularBrand(a.brand) ? 50 : 999);
        const rankB = b.topSalesRank ?? (isPopularBrand(b.brand) ? 50 : 999);
        if (rankA !== rankB) return rankA - rankB;
        return (a.name || '').localeCompare(b.name || '');
      }
      if (sortBy === 'brand_asc') {
        return (a.brand || '').localeCompare(b.brand || '');
      }
      if (sortBy === 'brand_desc') {
        return (b.brand || '').localeCompare(a.brand || '');
      }
      if (sortBy === 'name_asc') {
        return (a.name || '').localeCompare(b.name || '');
      }
      if (sortBy === 'name_desc') {
        return (b.name || '').localeCompare(a.name || '');
      }
      return 0;
    });
  }, [products, selectedCategory, selectedOccasionId, brandFilterMode, selectedNote, selectedMacroGroup, selectedFamilyId, searchTerm, sortBy, inquiryIds]);

  const handleImageError = (productId: string) => {
    setImageErrors((prev) => ({ ...prev, [productId]: true }));
  };

  const activeOccasionObj = OCCASION_FILTERS.find(o => o.id === selectedOccasionId);

  return (
    <div className="space-y-3 sm:space-y-4 pb-20 max-w-6xl mx-auto animate-fade-in">
      {/* Mobile Top Bar / Controls */}
      <div className="flex flex-col gap-2.5 pt-0.5">
        {/* Search Bar (Full Width for generous space on mobile) */}
        <div className="relative w-full">
          <Search className="w-4 h-4 text-[#99907c] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            id="inventory-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar perfume, diseñador o notas..."
            className="w-full pl-11 pr-10 py-3.5 rounded-2xl bg-[#1b1b23] border border-[#292932] text-base sm:text-sm text-[#e4e1ed] placeholder-[#99907c] focus:outline-none focus:border-[#f2ca50] transition-colors shadow-sm"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-[#99907c] hover:text-[#e4e1ed] transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center"
              title="Limpiar búsqueda"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Secret Admin Stock Filter Indicator */}
        {parseStockQuery(searchTerm).hasStockFilter && (
          <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-[#f2ca50]/10 border border-[#f2ca50]/30 text-xs text-[#f2ca50] animate-fade-in shadow-sm">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#f2ca50] animate-pulse" />
              <span className="font-bold">Filtro Admin de Stock: {parseStockQuery(searchTerm).matchedStockLabel}</span>
              {parseStockQuery(searchTerm).remainingQuery && (
                <span className="text-[#e4e1ed]/70">("{parseStockQuery(searchTerm).remainingQuery}")</span>
              )}
            </div>
            <span className="text-[11px] font-bold bg-[#13131b] px-2 py-0.5 rounded-lg border border-[#f2ca50]/20">
              {filteredProducts.length} pzas
            </span>
          </div>
        )}

        {/* Sorting Select & Advanced Filters Row */}
        <div className="flex items-center gap-2">
          {/* Sorting Select Dropdown */}
          <div className="relative flex-1">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full appearance-none bg-[#1b1b23] border border-[#292932] text-[#e4e1ed] text-xs sm:text-sm font-semibold rounded-2xl pl-3.5 pr-9 py-3 focus:outline-none focus:border-[#f2ca50] transition-colors cursor-pointer shadow-sm"
              title="Ordenar catálogo"
            >
              <option value="default">✨ Ordenar por...</option>
              <option value="top_sales">🔥 Más Vendidos</option>
              <option value="brand_asc">🔤 Marca (A - Z)</option>
              <option value="brand_desc">🔠 Marca (Z - A)</option>
              <option value="name_asc">🏷️ Nombre (A - Z)</option>
              <option value="name_desc">🏷️ Nombre (Z - A)</option>
            </select>
            <ArrowUpDown className="w-3.5 h-3.5 text-[#f2ca50] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Toggle Filter Dropdowns Button */}
          <button
            type="button"
            onClick={() => setShowFiltersPanel((prev) => !prev)}
            id="toggle-filters-panel-btn"
            className={`px-4 py-3 rounded-2xl border transition-all flex items-center gap-2 shrink-0 min-h-[44px] ${
              showFiltersPanel || hasActiveAdvancedFilters
                ? 'bg-[#f2ca50] text-[#13131b] border-[#f2ca50] shadow-md shadow-[#f2ca50]/20 font-bold'
                : 'bg-[#1b1b23] text-[#99907c] hover:text-[#e4e1ed] border-[#292932] font-semibold text-xs sm:text-sm'
            }`}
            title="Filtros avanzados"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filtros</span>
          </button>
        </div>

        {/* Product Count */}
        <div className="flex items-center justify-end pt-0.5 px-1">
          <span className="text-xs text-[#99907c]">
            <strong className="text-[#f2ca50]">{filteredProducts.length}</strong> fragancias disponibles
          </span>
        </div>
      </div>

      {/* Advanced Filter Panel (Collapsible) with Notes Predictive Autocomplete List */}
      {showFiltersPanel && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-[#1b1b23] border border-[#292932] space-y-3.5 animate-fade-in shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#e4e1ed] tracking-wider uppercase flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#f2ca50]" />
              Filtros Avanzados (Categoría, Ocasión, Marca & Notas)
            </span>

            {hasActiveAdvancedFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="p-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors border border-red-500/30 flex items-center justify-center"
                title="Restablecer todos los filtros"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter Inside Advanced Filters */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#99907c] uppercase tracking-wider flex items-center gap-1 pl-0.5">
              Categoría
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    id={`inventory-cat-${cat.id.toLowerCase()}`}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full py-2 px-2 rounded-xl text-xs font-bold text-center flex items-center justify-center transition-all active:scale-95 ${
                      isSelected
                        ? 'bg-[#f2ca50] text-[#13131b] shadow-md shadow-[#f2ca50]/20'
                        : 'bg-[#13131b] text-[#99907c] hover:text-[#e4e1ed] border border-[#292932]'
                    }`}
                  >
                    <span className="truncate">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* 1. Selector de Ocasión / Momento */}
            <div className="space-y-1">
              <label htmlFor="gallery-select-ocasion" className="text-[10px] font-bold text-[#99907c] uppercase tracking-wider flex items-center gap-1 pl-0.5">
                <Compass className="w-3 h-3 text-[#f2ca50]" />
                Ocasión & Clima
              </label>
              <div className="relative">
                <select
                  id="gallery-select-ocasion"
                  value={selectedOccasionId}
                  onChange={(e) => setSelectedOccasionId(e.target.value)}
                  className="w-full appearance-none pl-3 pr-8 py-2.5 sm:py-3 rounded-xl bg-[#13131b] border border-[#292932] text-xs font-semibold text-[#e4e1ed] focus:outline-none focus:border-[#f2ca50] transition-colors cursor-pointer min-h-[44px]"
                >
                  {OCCASION_FILTERS.map((occ) => (
                    <option key={occ.id} value={occ.id} className="bg-[#13131b] text-[#e4e1ed]">
                      {occ.emoji} {occ.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#99907c] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* 2. Selector de Marca / Diseñador */}
            <div className="space-y-1">
              <label htmlFor="gallery-select-marca" className="text-[10px] font-bold text-[#99907c] uppercase tracking-wider flex items-center gap-1 pl-0.5">
                <Tag className="w-3 h-3 text-[#f2ca50]" />
                Marca / Diseñador
              </label>
              <div className="relative">
                <select
                  id="gallery-select-marca"
                  value={brandFilterMode}
                  onChange={(e) => setBrandFilterMode(e.target.value)}
                  className="w-full appearance-none pl-3 pr-8 py-2.5 sm:py-3 rounded-xl bg-[#13131b] border border-[#292932] text-xs font-semibold text-[#e4e1ed] focus:outline-none focus:border-[#f2ca50] transition-colors cursor-pointer min-h-[44px]"
                >
                  <option value="todas" className="bg-[#13131b] text-[#e4e1ed]">
                    Todas las marcas ({products.length})
                  </option>
                  <optgroup label="Marcas disponibles" className="bg-[#1b1b23] text-[#99907c]">
                    {allAvailableBrands.map(({ brand, count }) => (
                      <option key={brand} value={brand} className="bg-[#13131b] text-[#e4e1ed]">
                        {brand} ({count})
                      </option>
                    ))}
                  </optgroup>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#99907c] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* 3. Selector de Familia Olfativa */}
          <div className="space-y-1">
            <label htmlFor="gallery-select-estilo" className="text-[10px] font-bold text-[#99907c] uppercase tracking-wider flex items-center gap-1 pl-0.5">
              <Droplets className="w-3 h-3 text-[#4edea3]" />
              Familia Olfativa
            </label>
            <div className="relative">
              <select
                id="gallery-select-estilo"
                value={selectedMacroGroup}
                onChange={(e) => {
                  setSelectedMacroGroup(e.target.value);
                  setSelectedFamilyId('todos');
                }}
                className="w-full appearance-none pl-3 pr-8 py-2.5 sm:py-3 rounded-xl bg-[#13131b] border border-[#292932] text-xs font-semibold text-[#e4e1ed] focus:outline-none focus:border-[#f2ca50] transition-colors cursor-pointer min-h-[44px]"
              >
                {MACRO_GROUPS.map((mg) => (
                  <option key={mg.id} value={mg.id} className="bg-[#13131b] text-[#e4e1ed]">
                    {mg.emoji} {mg.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#99907c] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* 4. BUSCADOR Y LISTADO PREDICTIVO DE NOTAS OLFATIVAS */}
          <div className="pt-2 border-t border-[#292932]/70 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-[#99907c] uppercase tracking-wider flex items-center gap-1.5 pl-0.5">
                <Sparkles className="w-3 h-3 text-[#f2ca50]" />
                <span>Buscador y Listado de Notas Olfativas</span>
              </label>
              {selectedNote && (
                <button
                  type="button"
                  onClick={() => setSelectedNote('')}
                  className="text-[10px] text-[#f2ca50] hover:underline font-semibold"
                >
                  Quitar filtro de nota
                </button>
              )}
            </div>

            {/* Note Search Input with Live Autocomplete */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#99907c] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                id="notes-predictive-search-input"
                value={noteSearchQuery}
                onChange={(e) => setNoteSearchQuery(e.target.value)}
                placeholder="Escribe para buscar notas (ej. Vainilla, Bergamota, Oud, Cuero, Lavanda)..."
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#13131b] border border-[#292932] text-xs text-[#e4e1ed] placeholder-[#99907c] focus:outline-none focus:border-[#f2ca50] transition-colors"
              />
              {noteSearchQuery && (
                <button
                  type="button"
                  onClick={() => setNoteSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#99907c] hover:text-[#e4e1ed] p-1"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Active Selected Note Badge */}
            {selectedNote && (
              <div className="flex items-center gap-2 p-2 rounded-xl bg-[#f2ca50]/15 border border-[#f2ca50]/40 text-xs text-[#f2ca50]">
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span>
                  Filtrando por nota: <strong>{selectedNote}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedNote('')}
                  className="ml-auto p-1 text-[#f2ca50] hover:text-white"
                  title="Quitar filtro de nota"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Interactive Notes List / Chips */}
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1 py-1 custom-scrollbar">
              {filteredNotesList.length === 0 ? (
                <p className="text-xs text-[#99907c] py-2 px-1 italic">
                  No se encontraron notas con "{noteSearchQuery}". Intenta con otro ingrediente.
                </p>
              ) : (
                filteredNotesList.map(({ note, count }) => {
                  const isSelected = selectedNote.toLowerCase() === note.toLowerCase();
                  return (
                    <button
                      key={note}
                      type="button"
                      onClick={() => {
                        setSelectedNote(isSelected ? '' : note);
                      }}
                      id={`note-chip-${normalize(note)}`}
                      className={`py-1 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 border ${
                        isSelected
                          ? 'bg-[#f2ca50] text-[#13131b] border-[#f2ca50] shadow-md shadow-[#f2ca50]/20 font-bold'
                          : 'bg-[#13131b] hover:bg-[#22222d] text-[#e4e1ed] hover:text-[#f2ca50] border-[#292932]'
                      }`}
                    >
                      <span>{note}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded-md font-mono-numbers ${
                          isSelected
                            ? 'bg-[#13131b]/20 text-[#13131b]'
                            : 'bg-[#1b1b23] text-[#99907c] border border-[#292932]'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })
              )}
            </div>

            {/* Toggle Show All Notes if there are more */}
            {!noteSearchQuery && allOlfactoryNotes.length > 24 && (
              <button
                type="button"
                onClick={() => setShowAllNotes((prev) => !prev)}
                className="text-[10px] text-[#f2ca50] hover:underline font-semibold pt-0.5"
              >
                {showAllNotes ? 'Mostrar menos notas' : `Ver todas las notas disponibles (${allOlfactoryNotes.length})`}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Results Count & Quick Hint */}
      <div className="flex items-center justify-between text-xs text-[#99907c] px-1">
        <span>
          <strong className="text-[#f2ca50]">{filteredProducts.length}</strong> {filteredProducts.length === 1 ? 'fragancia' : 'fragancias disponibles'}
          {selectedOccasionId !== 'todas' && activeOccasionObj && (
            <span className="text-[#e4e1ed] ml-1">para {activeOccasionObj.name}</span>
          )}
          {selectedNote && (
            <span className="text-[#f2ca50] ml-1">con nota de {selectedNote}</span>
          )}
        </span>
        <span className="text-[11px] text-[#99907c] hidden xs:inline">
          Toca cualquier perfume para ver notas y consultar
        </span>
      </div>



      {/* ========================================================================= */}
      {/* MUESTRARIO VISUAL EN CUADRÍCULA */}
      {/* ========================================================================= */}
      {filteredProducts.length === 0 ? (
        <div className="p-8 sm:p-12 text-center rounded-3xl bg-[#1b1b23] border border-[#292932] space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#292932] text-[#f2ca50] flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#e4e1ed]">
            No se encontraron perfumes
          </h3>
          <p className="text-xs text-[#99907c] max-w-sm mx-auto">
            Prueba seleccionando otra ocasión o restablece los filtros.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-5 py-2.5 rounded-xl bg-[#292932] hover:bg-[#33333f] text-[#f2ca50] text-xs font-bold transition-colors inline-block min-h-[44px]"
          >
            Ver todas las fragancias
          </button>
        </div>
      ) : (
        /* Cards Grid: 2 columns on mobile for maximum touch comfort */
        <div 
          id="gallery-perfumes-grid"
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-3.5"
        >
          {filteredProducts.map((product) => {
            const hasImageError = imageErrors[product.id] || !product.image;
            const isTop = isPopularBrand(product.brand) || (product.topSalesRank && product.topSalesRank <= 5);
            const isWishlisted = inquiryIds.includes(product.id);

            return (
              <div
                key={product.id}
                onClick={() => onSelectProduct(product)}
                id={`gallery-product-card-${product.id}`}
                className="group relative flex flex-col justify-between p-2.5 sm:p-3 rounded-2xl bg-[#1b1b23] hover:bg-[#22222c] active:bg-[#252530] border border-[#292932] hover:border-[#f2ca50]/50 active:border-[#f2ca50] transition-all duration-150 cursor-pointer active:scale-[0.98] shadow-sm hover:shadow-xl overflow-hidden"
              >
                {/* Wishlist Heart Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleInquiryProduct?.(product.id);
                  }}
                  className={`absolute top-2 right-2 z-20 p-1.5 rounded-full backdrop-blur-md transition-all ${
                    isWishlisted
                      ? 'bg-pink-500/20 text-pink-400 border border-pink-500/40 shadow-sm'
                      : 'bg-[#13131b]/80 text-[#99907c] hover:text-pink-400 border border-[#292932]'
                  }`}
                  title={isWishlisted ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                >
                  <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-pink-400 text-pink-400' : ''}`} />
                </button>

                {/* Top Badge */}
                {product.topSalesRank !== undefined && product.topSalesRank <= 3 && (
                  <div className="absolute top-2 left-2 z-10">
                    <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-[#13131b]/95 backdrop-blur-sm border border-[#f2ca50]/50 text-[9px] font-extrabold text-[#f2ca50] shadow-md">
                      <span>{product.topSalesRank === 1 ? '🔥 #1 Más Vendido' : product.topSalesRank === 2 ? '⭐ Top 2' : '⭐ Top 3'}</span>
                    </span>
                  </div>
                )}



                {/* Perfume Bottle Image Container */}
                <div className="relative w-full aspect-square rounded-xl bg-[#13131b] overflow-hidden flex items-center justify-center p-2 border border-[#292932]/50 group-hover:border-[#f2ca50]/30 transition-colors">
                  {/* Stock Badge on Top-Right/Bottom-Right */}
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
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200 filter drop-shadow-md"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-center p-1 text-[#99907c]">
                      <Droplets className="w-6 h-6 text-[#f2ca50]/40 mb-1" />
                      <span className="text-[9px] font-medium leading-tight line-clamp-1">
                        {product.brand}
                      </span>
                    </div>
                  )}
                </div>

                {/* Product Brand & Name Info */}
                <div className="mt-2 text-center flex flex-col justify-between flex-grow">
                  <p className="text-[10px] sm:text-[11px] font-bold text-[#f2ca50] truncate tracking-wider uppercase">
                    {product.brand}
                  </p>

                  <div className="flex items-center justify-center gap-1 mt-0.5 min-h-[2.4em]">
                    <h4 className="text-xs sm:text-sm font-bold text-[#e4e1ed] group-hover:text-white transition-colors line-clamp-2 leading-tight">
                      {product.name}
                    </h4>
                    <GenderIcon category={product.category} sizeClass="w-3 h-3 shrink-0" />
                  </div>

                  {/* Presentation Volume & Category */}
                  <div className="mt-1.5 flex items-center justify-center gap-1.5">
                    <span className="text-[9px] text-[#99907c] bg-[#13131b]/80 px-2 py-0.5 rounded border border-[#292932]/70 font-mono-numbers">
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

      {/* Bottom floating inquiry bar removed as requested */}

      {/* Floating Back To Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          id="back-to-top-btn"
          className="fixed bottom-5 right-4 z-40 p-3 rounded-full bg-[#1b1b23]/95 hover:bg-[#f2ca50] text-[#f2ca50] hover:text-[#13131b] border border-[#f2ca50]/40 hover:border-[#f2ca50] shadow-2xl shadow-black/90 active:scale-90 transition-all flex items-center justify-center min-w-[42px] min-h-[42px] backdrop-blur-md"
          title="Volver arriba rápidamente"
          aria-label="Volver arriba"
        >
          <ArrowUp className="w-4 h-4 stroke-[2.5]" />
        </button>
      )}

      {/* Floating Reset All Filters Button */}
      {hasAnyActiveFilters && (
        <div className="fixed bottom-20 right-4 z-40 animate-slide-up">
          <button
            type="button"
            onClick={handleResetFilters}
            id="floating-reset-filters-btn"
            className="p-3 rounded-full bg-red-600 hover:bg-red-500 text-white shadow-2xl shadow-red-600/40 active:scale-90 transition-all flex items-center justify-center min-w-[42px] min-h-[42px] border border-red-400/40"
            title="Restablecer todos los filtros activos"
            aria-label="Restablecer filtros"
          >
            <RotateCcw className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      )}
    </div>
  );
};
