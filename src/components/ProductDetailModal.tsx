import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Sparkles, 
  ZoomIn, 
  Droplets, 
  MessageCircle, 
  Check,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Heart,
  Share2,
  TrendingDown,
  Tag,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { PerfumeProduct } from '../types';
import { GenderIcon } from './GenderBadge';
import { OlfactoryNotesLinks } from './OlfactoryNotesLinks';
import { calculateSavings, formatPriceMXN } from '../utils/pricing';
import { getSimilarFragrances } from '../utils/recommendations';
import { getOptimizedImageUrl } from '../utils/imageUrl';

interface ProductDetailModalProps {
  product: PerfumeProduct | null;
  allProducts?: PerfumeProduct[];
  onSelectProduct?: (product: PerfumeProduct) => void;
  onClose: () => void;
  onUpdateProduct?: (updated: PerfumeProduct) => void;
  onEditProduct?: (product: PerfumeProduct) => void;
  isInWishlist?: boolean;
  onToggleWishlist?: (productId: string) => void;
  isInInquirySet?: boolean;
  onToggleInquirySet?: (productId: string) => void;
  onOpenInquiryModal?: () => void;
  onOpenShareModal?: (product?: PerfumeProduct) => void;
  isPcMode?: boolean;
  onNavigatePrevious?: () => void;
  onNavigateNext?: () => void;
  currentIndex?: number;
  totalProducts?: number;
  previousProduct?: PerfumeProduct | null;
  nextProduct?: PerfumeProduct | null;
}

const WHATSAPP_PHONE_NUMBER = '529987099043';

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  allProducts = [],
  onSelectProduct,
  onClose,
  onEditProduct,
  isInWishlist = false,
  onToggleWishlist,
  isInInquirySet = false,
  onToggleInquirySet,
  onOpenShareModal,
  isPcMode = false,
  onNavigatePrevious,
  onNavigateNext,
  currentIndex,
  totalProducts,
  previousProduct,
  nextProduct,
}) => {
  if (!product) return null;

  const [isImageZoomed, setIsImageZoomed] = useState(false);

  // Determine effective wishlist toggle handler
  const handleToggleFav = () => {
    if (onToggleWishlist) {
      onToggleWishlist(product.id);
    } else if (onToggleInquirySet) {
      onToggleInquirySet(product.id);
    }
  };

  const isFavorite = isInWishlist || isInInquirySet;

  // Calculate pricing comparison
  const pricingData = useMemo(() => {
    return calculateSavings(product, product.price || 270);
  }, [product]);

  // Calculate similar recommendations
  const similarList = useMemo(() => {
    if (!allProducts || allProducts.length === 0) return [];
    return getSimilarFragrances(product, allProducts, isPcMode ? 6 : 4);
  }, [product, allProducts, isPcMode]);

  // Keyboard navigation for PC Mode (ArrowLeft, ArrowRight, Escape)
  useEffect(() => {
    if (!isPcMode || !product) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onNavigatePrevious?.();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        onNavigateNext?.();
      } else if (e.key === 'Escape') {
        if (isImageZoomed) {
          setIsImageZoomed(false);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPcMode, product, onNavigatePrevious, onNavigateNext, onClose, isImageZoomed]);

  const inquiryText = `Hola, me interesa saber la disponibilidad de este perfume:\n\n• ${product.name} - ${product.brand} (${product.category})\nPresentación: ${product.volume || '60ml'}`;

  const handleWhatsAppInquiry = () => {
    const encoded = encodeURIComponent(inquiryText);
    window.open(`https://wa.me/${WHATSAPP_PHONE_NUMBER}?text=${encoded}`, '_blank');
  };

  const hasNavigation = isPcMode && totalProducts !== undefined && totalProducts > 1;

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in p-0 sm:p-4 overflow-y-auto"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        {/* Main Modal Wrapper (Allows relative placement of PC floating arrow buttons) */}
        <div className="relative w-full flex items-center justify-center max-w-lg md:max-w-5xl lg:max-w-6xl xl:max-w-7xl">
          {/* PC Mode Floating Left Navigation Arrow */}
          {hasNavigation && onNavigatePrevious && (
            <button
              type="button"
              onClick={onNavigatePrevious}
              id="pc-prev-product-arrow-btn"
              title={`Perfume anterior: ${previousProduct ? `${previousProduct.brand} ${previousProduct.name}` : ''} (Tecla ←)`}
              aria-label="Perfume anterior"
              className="hidden md:flex absolute -left-14 lg:-left-18 top-1/2 -translate-y-1/2 z-30 w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-[#1b1b23]/95 hover:bg-[#f2ca50] text-[#e4e1ed] hover:text-[#13131b] border border-[#292932] hover:border-[#f2ca50] shadow-2xl items-center justify-center transition-all duration-200 active:scale-90 group cursor-pointer"
            >
              <ChevronLeft className="w-6 h-6 stroke-[2.5] group-hover:-translate-x-0.5 transition-transform" />
            </button>
          )}

          {/* Modal Container */}
          <div 
            className={`relative w-full bg-[#13131b] border-t sm:border border-[#292932] rounded-t-[28px] sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 animate-slide-up ${
              isPcMode 
                ? 'max-w-5xl lg:max-w-6xl xl:max-w-7xl max-h-[92vh] xl:max-h-[95vh]' 
                : 'max-w-lg max-h-[92vh] sm:max-h-[90vh]'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Drag Indicator Handle */}
            <div className="pt-2.5 pb-1 flex justify-center sm:hidden cursor-pointer" onClick={onClose}>
              <div className="w-12 h-1.5 rounded-full bg-[#34343d]" />
            </div>

            {/* Header Bar with Heart & Share buttons */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 sm:py-3 border-b border-[#292932]/70 shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#f2ca50]" />
                <h3 className="text-sm sm:text-base font-bold font-serif-luxury text-[#e4e1ed] truncate">
                  Ficha de la Fragancia {isPcMode && <span className="text-xs text-[#f2ca50] font-normal ml-2">• Modo PC</span>}
                </h3>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* Wishlist Heart Button in Header */}
                <button
                  type="button"
                  onClick={handleToggleFav}
                  id="detail-header-wishlist-btn"
                  title={isFavorite ? 'Quitar de mis favoritos' : 'Guardar en mis favoritos'}
                  className={`p-2 rounded-xl border transition-all active:scale-90 flex items-center justify-center min-w-[36px] min-h-[36px] ${
                    isFavorite
                      ? 'bg-pink-500/20 border-pink-500/50 text-pink-400 shadow-md shadow-pink-500/20'
                      : 'bg-[#1b1b23] border-[#292932] text-[#99907c] hover:text-pink-400 hover:border-pink-500/30'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? 'fill-pink-400 text-pink-400 stroke-[2.5]' : ''}`} />
                </button>

                {/* Share / Save Button in Header */}
                <button
                  type="button"
                  onClick={() => onOpenShareModal?.(product)}
                  id="detail-header-share-btn"
                  title="Compartir o guardar este perfume"
                  className="p-2 rounded-xl bg-[#1b1b23] hover:bg-[#252530] border border-[#292932] hover:border-[#f2ca50]/40 text-[#99907c] hover:text-[#f2ca50] transition-all active:scale-90 min-w-[36px] min-h-[36px] flex items-center justify-center"
                >
                  <Share2 className="w-4 h-4" />
                </button>

                {/* PC Mode Header Navigation Widget */}
                {hasNavigation && (
                  <div className="flex items-center gap-1 bg-[#1b1b23] px-2 py-1 rounded-xl border border-[#292932]">
                    <button
                      type="button"
                      onClick={onNavigatePrevious}
                      id="detail-modal-prev-header-btn"
                      title={`Anterior (←): ${previousProduct ? `${previousProduct.brand} ${previousProduct.name}` : ''}`}
                      className="p-1 rounded-lg text-[#99907c] hover:text-[#f2ca50] hover:bg-[#252530] transition-all active:scale-90"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <span className="text-xs font-mono-numbers font-medium text-[#d0c5af] px-1.5 select-none">
                      {(currentIndex ?? 0) + 1} <span className="text-[#99907c]">/</span> {totalProducts}
                    </span>

                    <button
                      type="button"
                      onClick={onNavigateNext}
                      id="detail-modal-next-header-btn"
                      title={`Siguiente (→): ${nextProduct ? `${nextProduct.brand} ${nextProduct.name}` : ''}`}
                      className="p-1 rounded-lg text-[#99907c] hover:text-[#f2ca50] hover:bg-[#252530] transition-all active:scale-90"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <button
                  onClick={onClose}
                  id="detail-modal-close-btn"
                  className="p-2 rounded-xl text-[#99907c] hover:text-[#e4e1ed] hover:bg-[#1b1b23] transition-colors active:scale-95 min-w-[36px] min-h-[36px] flex items-center justify-center"
                  title="Cerrar ficha (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Container */}
            <div className="overflow-y-auto flex-1 overscroll-contain custom-scrollbar">
              {isPcMode ? (
                /* Landscape 2-Column Mode for PC */
                <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
                  {/* Left Column: Big Bottle Display + Quality Card + Price Comparison */}
                  <div className="md:col-span-5 xl:col-span-4 bg-[#0c0c13] border-b md:border-b-0 md:border-r border-[#292932] p-6 xl:p-8 flex flex-col justify-between relative space-y-5">
                    {/* Edit Button in PC Mode */}
                    {onEditProduct && (
                      <button
                        type="button"
                        onClick={() => {
                          onEditProduct(product);
                          onClose();
                        }}
                        className="absolute top-4 right-4 z-30 px-3 py-1.5 rounded-xl bg-[#1b1b23]/95 hover:bg-[#f2ca50] text-[#e4e1ed] hover:text-[#13131b] border border-[#292932] hover:border-[#f2ca50] shadow-2xl flex items-center gap-1.5 font-bold text-xs transition-all active:scale-95 group"
                        title="Editar perfume"
                      >
                        <Pencil className="w-3.5 h-3.5 text-[#f2ca50] group-hover:text-[#13131b]" />
                        <span>Editar</span>
                      </button>
                    )}

                    <div className="relative w-full aspect-square max-w-[380px] xl:max-w-[420px] flex items-center justify-center mx-auto my-auto">
                      <button
                        type="button"
                        onClick={() => setIsImageZoomed(true)}
                        id="detail-photo-enlarge-pc-btn"
                        title="Toca para ver la foto en grande"
                        className="w-full h-full cursor-zoom-in relative group flex items-center justify-center p-4"
                      >
                        <img
                          src={getOptimizedImageUrl(product.image)}
                          alt={product.name}
                          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300 filter drop-shadow-2xl"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c13]/70 via-transparent to-transparent pointer-events-none" />
                        
                        <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-sm border border-white/10 text-xs text-[#e4e1ed] font-medium flex items-center gap-1.5 shadow-md">
                          <ZoomIn className="w-4 h-4 text-[#f2ca50]" />
                          <span>Ampliar foto HD</span>
                        </div>
                      </button>
                    </div>

                    {/* REAL MARKET PRICE COMPARISON CARD (PC MODE) */}
                    <div className="w-full p-4 rounded-2xl bg-gradient-to-br from-[#161622] to-[#12121a] border border-[#f2ca50]/30 shadow-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#99907c] flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5 text-[#f2ca50]" />
                          <span>Comparativa de Valor Real</span>
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-[#4edea3]/15 border border-[#4edea3]/30 text-[10px] font-bold text-[#4edea3] flex items-center gap-1">
                          <TrendingDown className="w-3 h-3" />
                          <span>Ahorro de ~{pricingData.savingsPercentage}%</span>
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#292932]/70">
                        <div className="bg-[#0e0e15] p-2.5 rounded-xl border border-[#292932]">
                          <span className="text-[10px] text-[#99907c] block uppercase font-medium">
                            Valor real original:
                          </span>
                          <span className="text-sm lg:text-base font-bold text-[#e4e1ed] line-through decoration-red-500/80 decoration-2">
                            ~{pricingData.originalPriceFormatted}
                          </span>
                          <span className="text-[9px] text-[#99907c] block mt-0.5">Tienda departamental</span>
                        </div>

                        <div className="bg-[#1c1a12] p-2.5 rounded-xl border border-[#f2ca50]/40">
                          <span className="text-[10px] text-[#f2ca50] block uppercase font-bold">
                            Nuestra Inspiración:
                          </span>
                          <span className="text-base lg:text-lg font-black text-[#f2ca50] font-mono-numbers">
                            {pricingData.ourPriceFormatted}
                          </span>
                          <span className="text-[9px] text-[#f2ca50]/80 block mt-0.5">Misma fijación y calidad</span>
                        </div>
                      </div>

                      <p className="text-[11px] text-[#d0c5af] flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-[#4edea3] shrink-0" />
                        <span>¡Ahorras <strong>{pricingData.savedAmountFormatted} MXN</strong> obteniendo el mismo aroma de diseñador!</span>
                      </p>
                    </div>

                    {/* Dupe Quality Badge */}
                    <div className="w-full p-4 rounded-2xl bg-[#13131b] border border-[#292932] space-y-1.5">
                      <div className="flex items-center gap-2 text-xs lg:text-sm font-bold text-[#f2ca50]">
                        <Sparkles className="w-4 h-4 shrink-0" />
                        <span>Dupe de Alta Concentración</span>
                      </div>
                      <p className="text-xs text-[#d0c5af] leading-relaxed">
                        Elaborado con aceites aromáticos de perfumería fina con +95% de similitud aromática con <strong>{product.brand} {product.name}</strong>.
                      </p>
                    </div>
                  </div>

                  {/* Right Column: Details, Olfactory Notes & SIMILAR RECOMMENDATIONS */}
                  <div className="md:col-span-7 xl:col-span-8 p-6 xl:p-8 space-y-5 flex flex-col justify-between">
                    <div className="space-y-4">
                      {/* Brand & Name with Badges */}
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm lg:text-base font-bold uppercase tracking-widest text-[#f2ca50]">
                            {product.brand}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 rounded-xl bg-[#1b1b23] border border-[#292932] text-sm font-bold text-[#e4e1ed] flex items-center gap-1.5 shadow-sm">
                              <GenderIcon category={product.category} sizeClass="w-4 h-4" />
                              <span>{product.category}</span>
                            </span>
                            <span className="px-3 py-1 rounded-xl bg-[#1b1b23] border border-[#292932] text-sm font-mono-numbers text-[#f2ca50] font-bold shadow-sm">
                              {product.volume || '60ml'}
                            </span>
                          </div>
                        </div>
                        <h2 className="text-2xl lg:text-3xl font-bold font-serif-luxury text-[#e4e1ed] mt-1.5 leading-tight">
                          {product.name}
                        </h2>
                      </div>

                      {/* Olfactory Notes Box */}
                      {product.notes && (
                        <div className="p-4 rounded-2xl bg-[#1b1b23] border border-[#f2ca50]/25 space-y-2 shadow-md">
                          <div className="flex items-center gap-2 text-xs lg:text-sm font-bold uppercase tracking-wider text-[#f2ca50]">
                            <Droplets className="w-4 h-4 text-[#f2ca50]" />
                            <span>Pirámide & Notas Olfativas</span>
                          </div>
                          <OlfactoryNotesLinks notesString={product.notes} />
                        </div>
                      )}

                      {/* Description */}
                      {product.description && (
                        <div className="space-y-1 bg-[#161620] p-4 rounded-2xl border border-[#292932]/70">
                          <span className="text-xs font-bold uppercase tracking-wider text-[#99907c] block">
                            Perfil Aromático & Detalles
                          </span>
                          <p className="text-xs sm:text-sm text-[#d0c5af] leading-relaxed">
                            {product.description}
                          </p>
                        </div>
                      )}

                      {/* SIMILAR FRAGRANCE RECOMMENDATIONS (PC MODE) */}
                      {similarList.length > 0 && (
                        <div className="space-y-2.5 pt-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-[#f2ca50] flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Fragancias Similares & Recomendadas</span>
                            </span>
                            <span className="text-[11px] text-[#99907c]">
                              ¿Te gusta este estilo? Prueba también:
                            </span>
                          </div>

                          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5">
                            {similarList.map(({ product: sim, sharedNotes, reason }) => (
                              <button
                                key={sim.id}
                                type="button"
                                onClick={() => onSelectProduct?.(sim)}
                                className="group p-2.5 rounded-2xl bg-[#161620] hover:bg-[#1f1f2c] border border-[#292932] hover:border-[#f2ca50]/50 text-left transition-all flex items-center gap-3 active:scale-95 shadow-sm"
                              >
                                <div className="w-12 h-14 rounded-xl bg-[#0c0c13] border border-[#292932] p-1 shrink-0 flex items-center justify-center overflow-hidden">
                                  <img
                                    src={getOptimizedImageUrl(sim.image)}
                                    alt={sim.name}
                                    className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform"
                                    referrerPolicy="no-referrer"
                                  />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <span className="text-[10px] font-bold uppercase text-[#f2ca50] block truncate">
                                    {sim.brand}
                                  </span>
                                  <h4 className="text-xs font-bold text-[#e4e1ed] truncate group-hover:text-white">
                                    {sim.name}
                                  </h4>
                                  <p className="text-[10px] text-[#99907c] truncate mt-0.5">
                                    {sharedNotes.length > 0 ? `Notas: ${sharedNotes.slice(0, 2).join(', ')}` : reason}
                                  </p>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* PC Presentation Action Controls */}
                    <div className="pt-3 border-t border-[#292932]/70 flex items-center gap-2.5">
                      {hasNavigation && onNavigatePrevious && (
                        <button
                          type="button"
                          onClick={onNavigatePrevious}
                          id="detail-modal-prev-footer-btn"
                          title={`Ir al perfume anterior (←)`}
                          className="px-3.5 py-3 rounded-xl bg-[#1b1b23] hover:bg-[#252530] hover:text-[#f2ca50] border border-[#292932] text-[#e4e1ed] font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 shrink-0"
                        >
                          <ChevronLeft className="w-4 h-4 text-[#f2ca50]" />
                          <span className="hidden sm:inline">Anterior</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={handleWhatsAppInquiry}
                        className="py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-[#25D366]/20 active:scale-95 transition-all"
                      >
                        <MessageCircle className="w-4 h-4 fill-white" />
                        <span>Consultar por WhatsApp</span>
                      </button>

                      <button
                        onClick={onClose}
                        id="detail-modal-close-pc-btn"
                        className="flex-1 py-3 rounded-xl bg-[#f2ca50] hover:bg-[#ffe088] text-[#13131b] font-bold text-xs sm:text-sm transition-all shadow-md shadow-[#f2ca50]/20 active:scale-98 text-center truncate"
                      >
                        Cerrar y Volver a la Colección
                      </button>

                      {hasNavigation && onNavigateNext && (
                        <button
                          type="button"
                          onClick={onNavigateNext}
                          id="detail-modal-next-footer-btn"
                          title={`Ir al perfume siguiente (→)`}
                          className="px-3.5 py-3 rounded-xl bg-[#1b1b23] hover:bg-[#252530] hover:text-[#f2ca50] border border-[#292932] text-[#e4e1ed] font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 shrink-0"
                        >
                          <span className="hidden sm:inline">Siguiente</span>
                          <ChevronRight className="w-4 h-4 text-[#f2ca50]" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* ========================================================================= */
                /* Standard Mobile/Client Layout - Designed to fit in a single screen */
                /* ========================================================================= */
                <div className="p-3 space-y-2.5">
                  {/* Top Summary Card: Bottle photo side-by-side with Brand, Name & Key Badges */}
                  <div className="flex gap-2.5 items-center bg-[#0c0c13] p-2 rounded-2xl border border-[#292932]/80 shadow-sm relative">
                    {/* Photo with Tap to Zoom & Wishlist button attached to photo */}
                    <div className="relative w-20 h-24 sm:w-24 sm:h-28 shrink-0 bg-[#13131b] rounded-xl overflow-hidden border border-[#292932] flex items-center justify-center p-1">
                      <button
                        type="button"
                        onClick={() => setIsImageZoomed(true)}
                        id="detail-photo-enlarge-btn"
                        title="Toca para ver la foto en grande"
                        className="w-full h-full cursor-zoom-in relative group flex items-center justify-center"
                      >
                        <img
                          src={getOptimizedImageUrl(product.image)}
                          alt={product.name}
                          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300 filter drop-shadow-md"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors pointer-events-none" />
                        <div className="absolute bottom-1 right-1 p-0.5 rounded bg-black/80 text-[#f2ca50]">
                          <ZoomIn className="w-2.5 h-2.5" />
                        </div>
                      </button>

                      {/* Floating Heart over photo */}
                      <button
                        type="button"
                        onClick={handleToggleFav}
                        className={`absolute top-1 left-1 p-1 rounded-full backdrop-blur-md transition-all active:scale-75 ${
                          isFavorite 
                            ? 'bg-pink-500 text-white shadow-md' 
                            : 'bg-black/60 text-white/70 hover:text-pink-400'
                        }`}
                        title={isFavorite ? 'En tus favoritos' : 'Agregar a favoritos'}
                      >
                        <Heart className={`w-3 h-3 ${isFavorite ? 'fill-white stroke-[2.5]' : ''}`} />
                      </button>
                    </div>

                    {/* Brand, Name, Badges & High Similarity Pill */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch py-0.5">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#f2ca50] block truncate">
                          {product.brand}
                        </span>
                        <h2 className="text-sm sm:text-base font-bold font-serif-luxury text-[#e4e1ed] leading-snug line-clamp-1 mt-0.5">
                          {product.name}
                        </h2>
                      </div>

                      <div className="space-y-1 mt-1">
                        {/* Badges bar */}
                        <div className="flex flex-wrap items-center gap-1">
                          <span className="px-1.5 py-0.5 rounded-lg bg-[#1b1b23] border border-[#292932] text-[10px] font-bold text-[#e4e1ed] flex items-center gap-1">
                            <GenderIcon category={product.category} sizeClass="w-2.5 h-2.5" />
                            <span>{product.category}</span>
                          </span>

                          <span className="px-1.5 py-0.5 rounded-lg bg-[#1b1b23] border border-[#292932] text-[10px] font-mono-numbers text-[#f2ca50] font-bold">
                            {product.volume || '60ml'}
                          </span>

                          <span className="px-1.5 py-0.5 rounded-lg bg-[#1b1b23] border border-[#292932] text-[9px] text-[#99907c] font-medium">
                            Eau de Parfum
                          </span>
                        </div>

                        {/* Dupe Quality Mini Pill */}
                        <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[#f2ca50]/10 border border-[#f2ca50]/25 text-[9px] text-[#f2ca50] font-semibold">
                          <Sparkles className="w-2.5 h-2.5 shrink-0" />
                          <span>Inspiración +95% Similitud</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* REAL MARKET PRICE COMPARISON CARD (MOBILE - COMPACT) */}
                  <div className="p-2 rounded-xl bg-gradient-to-br from-[#161622] to-[#12121a] border border-[#f2ca50]/30 shadow-sm space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-[#99907c] flex items-center gap-1">
                        <Tag className="w-2.5 h-2.5 text-[#f2ca50]" />
                        <span>Comparativa de Precio Real</span>
                      </span>
                      <span className="px-1.5 py-0.5 rounded-full bg-[#4edea3]/15 border border-[#4edea3]/30 text-[9px] font-bold text-[#4edea3] flex items-center gap-0.5">
                        <TrendingDown className="w-2.5 h-2.5" />
                        <span>Ahorras ~{pricingData.savingsPercentage}%</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5">
                      <div className="bg-[#0e0e15] p-1.5 rounded-lg border border-[#292932] flex items-center justify-between">
                        <div>
                          <span className="text-[8px] text-[#99907c] block uppercase font-medium leading-none">
                            Original
                          </span>
                          <span className="text-[11px] sm:text-xs font-bold text-[#e4e1ed] line-through decoration-red-500/80 decoration-2">
                            ~{pricingData.originalPriceFormatted}
                          </span>
                        </div>
                        <span className="text-[8px] text-[#99907c] text-right leading-none">Tiendas</span>
                      </div>

                      <div className="bg-[#1c1a12] p-1.5 rounded-lg border border-[#f2ca50]/40 flex items-center justify-between">
                        <div>
                          <span className="text-[8px] text-[#f2ca50] block uppercase font-bold leading-none">
                            Nuestra Inspiración
                          </span>
                          <span className="text-xs sm:text-sm font-black text-[#f2ca50] font-mono-numbers">
                            {pricingData.ourPriceFormatted}
                          </span>
                        </div>
                        <span className="text-[8px] text-[#f2ca50]/80 text-right leading-none">60ml</span>
                      </div>
                    </div>
                  </div>

                  {/* Olfactory Notes (Prominent & interactive pop-up) */}
                  {product.notes && (
                    <div className="p-2 rounded-xl bg-[#1b1b23] border border-[#f2ca50]/25 space-y-1 shadow-sm">
                      <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#f2ca50]">
                        <Droplets className="w-3 h-3 text-[#f2ca50]" />
                        <span>Notas Olfativas</span>
                      </div>
                      <OlfactoryNotesLinks notesString={product.notes} className="text-xs" />
                    </div>
                  )}

                  {/* Description / Profile */}
                  {product.description && (
                    <div className="p-2 rounded-xl bg-[#161620] border border-[#292932]/70 space-y-0.5">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-[#99907c] block">
                        Perfil & Descripción
                      </span>
                      <p className="text-[11px] text-[#d0c5af] leading-relaxed line-clamp-2">
                        {product.description}
                      </p>
                    </div>
                  )}

                  {/* SIMILAR FRAGRANCE RECOMMENDATIONS SECTION (MOBILE - COMPACT) */}
                  {similarList.length > 0 && (
                    <div className="space-y-1.5 pt-0.5">
                      <div className="flex items-center justify-between px-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#f2ca50] flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>Perfumes Parecidos</span>
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5">
                        {similarList.map(({ product: sim, sharedNotes, reason }) => (
                          <button
                            key={sim.id}
                            type="button"
                            onClick={() => onSelectProduct?.(sim)}
                            id={`similar-fragrance-${sim.id}`}
                            className="p-1.5 rounded-xl bg-[#161620] hover:bg-[#1f1f2c] border border-[#292932] hover:border-[#f2ca50]/40 text-left transition-all flex items-center gap-1.5 active:scale-95 shadow-sm group"
                          >
                            <div className="w-8 h-9 rounded-lg bg-[#0c0c13] border border-[#292932] p-0.5 shrink-0 flex items-center justify-center overflow-hidden">
                              <img
                                src={getOptimizedImageUrl(sim.image)}
                                alt={sim.name}
                                className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="text-[8px] font-bold uppercase text-[#f2ca50] block truncate">
                                {sim.brand}
                              </span>
                              <h4 className="text-[10px] font-bold text-[#e4e1ed] truncate group-hover:text-white leading-tight">
                                {sim.name}
                              </h4>
                              <p className="text-[8px] text-[#99907c] truncate">
                                {sharedNotes.length > 0 ? sharedNotes[0] : reason}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Controls Section: WhatsApp, Wishlist Toggle, Share, Close */}
                  <div className="pt-1.5 border-t border-[#292932]/70 space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleWhatsAppInquiry}
                        id="inquire-whatsapp-btn"
                        className="flex-1 py-2 px-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-[#25D366]/20 active:scale-95 transition-all min-h-[38px]"
                      >
                        <MessageCircle className="w-3.5 h-3.5 fill-white shrink-0" />
                        <span>Consultar por WhatsApp</span>
                      </button>

                      {/* Wishlist Heart Action Button */}
                      <button
                        type="button"
                        onClick={handleToggleFav}
                        id="detail-toggle-inquiry-set-btn"
                        title={isFavorite ? 'Quitar de mis favoritos' : 'Guardar en mis favoritos'}
                        className={`py-2 px-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1 min-h-[38px] border shrink-0 active:scale-95 ${
                          isFavorite
                            ? 'bg-pink-500/20 text-pink-300 border-pink-500/50 shadow-sm'
                            : 'bg-[#1b1b23] text-[#99907c] hover:text-[#e4e1ed] border-[#292932]'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-pink-400 text-pink-400' : ''}`} />
                        <span>{isFavorite ? 'Guardado' : '+ Favorito'}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => onOpenShareModal?.(product)}
                        id="detail-share-action-btn"
                        className="w-full py-1.5 rounded-xl bg-[#1b1b23] hover:bg-[#252530] border border-[#292932] hover:border-[#f2ca50]/40 text-[#d0c5af] hover:text-[#f2ca50] font-semibold text-xs transition-all flex items-center justify-center gap-1 active:scale-98"
                      >
                        <Share2 className="w-3 h-3" />
                        <span>Compartir</span>
                      </button>

                      <button
                        onClick={onClose}
                        id="detail-modal-close-action-btn"
                        className="w-full py-1.5 rounded-xl bg-[#1b1b23] hover:bg-[#292932] border border-[#292932] text-[#99907c] hover:text-[#e4e1ed] font-semibold text-xs transition-colors active:scale-98"
                      >
                        Cerrar Ficha
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* PC Mode Floating Right Navigation Arrow */}
          {hasNavigation && onNavigateNext && (
            <button
              type="button"
              onClick={onNavigateNext}
              id="pc-next-product-arrow-btn"
              title={`Perfume siguiente: ${nextProduct ? `${nextProduct.brand} ${nextProduct.name}` : ''} (Tecla →)`}
              aria-label="Perfume siguiente"
              className="hidden md:flex absolute -right-14 lg:-right-16 top-1/2 -translate-y-1/2 z-30 w-11 h-11 lg:w-13 lg:h-13 rounded-full bg-[#1b1b23]/95 hover:bg-[#f2ca50] text-[#e4e1ed] hover:text-[#13131b] border border-[#292932] hover:border-[#f2ca50] shadow-2xl items-center justify-center transition-all duration-200 active:scale-90 group cursor-pointer"
            >
              <ChevronRight className="w-6 h-6 stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}
        </div>
      </div>

      {/* Lightbox / Zoomed Image Modal */}
      {isImageZoomed && (
        <div 
          onClick={() => setIsImageZoomed(false)}
          id="detail-image-zoom-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl cursor-zoom-out animate-fade-in"
        >
          {/* Floating Next/Prev in Zoomed View for PC Mode */}
          {hasNavigation && onNavigatePrevious && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onNavigatePrevious();
              }}
              id="zoom-modal-prev-btn"
              title="Anterior (←)"
              className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-[#1b1b23]/90 hover:bg-[#f2ca50] text-[#e4e1ed] hover:text-[#13131b] border border-[#292932] hover:border-[#f2ca50] items-center justify-center transition-colors shadow-xl active:scale-90 cursor-pointer"
            >
              <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
            </button>
          )}

          {hasNavigation && onNavigateNext && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onNavigateNext();
              }}
              id="zoom-modal-next-btn"
              title="Siguiente (→)"
              className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-[#1b1b23]/90 hover:bg-[#f2ca50] text-[#e4e1ed] hover:text-[#13131b] border border-[#292932] hover:border-[#f2ca50] items-center justify-center transition-colors shadow-xl active:scale-90 cursor-pointer"
            >
              <ChevronRight className="w-6 h-6 stroke-[2.5]" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsImageZoomed(false)}
            id="close-zoomed-image-btn"
            className="absolute top-4 right-4 p-3 rounded-full bg-[#1b1b23]/90 hover:bg-[#f2ca50] text-[#e4e1ed] hover:text-[#13131b] border border-[#292932] transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="relative max-w-lg max-h-[85vh] w-full flex flex-col items-center p-2" onClick={(e) => e.stopPropagation()}>
            <img
              src={getOptimizedImageUrl(product.image)}
              alt={product.name}
              className="max-h-[72vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl border border-[#292932]"
              referrerPolicy="no-referrer"
            />
            <div className="mt-4 text-center">
              <p className="text-base font-bold text-[#e4e1ed]">{product.name}</p>
              <p className="text-xs text-[#f2ca50] font-semibold">{product.brand} • {product.volume || '60ml'}</p>
              {isPcMode ? (
                <p className="text-[11px] text-[#99907c] mt-1">Usa las flechas ← → del teclado para ver otras botellas • Clic afuera para cerrar</p>
              ) : (
                <p className="text-[11px] text-[#99907c] mt-1">Toca en cualquier lugar para cerrar</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
