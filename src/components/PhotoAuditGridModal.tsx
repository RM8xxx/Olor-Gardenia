import React, { useState, useMemo, useEffect } from 'react';
import { INITIAL_PRODUCTS } from '../data/initialProducts';
import { 
  X, 
  Copy, 
  Check, 
  Search, 
  Camera, 
  ImageIcon, 
  ZoomIn,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { PerfumeProduct, ProductCategory } from '../types';
import { GenderBadge } from './GenderBadge';
import { getOptimizedImageUrl, bumpPhotoCacheVersion } from '../utils/imageUrl';
import { syncAllProductImagesToFirebase } from '../services/firebase';
import { triggerAdminActionHaptic } from '../utils/haptics';

interface PhotoAuditGridModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PhotoAuditGridModal: React.FC<PhotoAuditGridModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [imageErrorMap, setImageErrorMap] = useState<Record<string, boolean>>({});
  const [zoomedProduct, setZoomedProduct] = useState<PerfumeProduct | null>(null);
  const [isRefreshingCache, setIsRefreshingCache] = useState(false);
  const [refreshSuccessMsg, setRefreshSuccessMsg] = useState<string | null>(null);

  const handleForceRefreshCloudinary = async () => {
    try {
      triggerAdminActionHaptic();
      setIsRefreshingCache(true);
      setRefreshSuccessMsg(null);
      setImageErrorMap({});
      bumpPhotoCacheVersion();
      await syncAllProductImagesToFirebase();
      setRefreshSuccessMsg('¡Fotos recargadas e historial de caché invalidado!');
      setTimeout(() => setRefreshSuccessMsg(null), 4000);
    } catch (e) {
      setRefreshSuccessMsg('Fotos refrescadas localmente.');
      setTimeout(() => setRefreshSuccessMsg(null), 3000);
    } finally {
      setIsRefreshingCache(false);
    }
  };

  const products = INITIAL_PRODUCTS;

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products.filter((p) => {
      const matchesSearch = !q || (
        p.id.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        (p.category && p.category.toLowerCase().includes(q))
      );

      const matchesGender = selectedGender === 'all' || p.category === selectedGender;

      return matchesSearch && matchesGender;
    });
  }, [products, searchQuery, selectedGender]);

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleCopyAllVisibleIds = () => {
    const list = filteredProducts.map(p => `${p.id} - ${p.brand} ${p.name} (${p.category})`).join('\n');
    navigator.clipboard.writeText(list).then(() => {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    });
  };

  // Keyboard navigation when zoomed
  useEffect(() => {
    if (!zoomedProduct) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setZoomedProduct(null);
      } else if (e.key === 'ArrowRight') {
        const currentIndex = filteredProducts.findIndex(p => p.id === zoomedProduct.id);
        if (currentIndex !== -1 && currentIndex < filteredProducts.length - 1) {
          setZoomedProduct(filteredProducts[currentIndex + 1]);
        }
      } else if (e.key === 'ArrowLeft') {
        const currentIndex = filteredProducts.findIndex(p => p.id === zoomedProduct.id);
        if (currentIndex > 0) {
          setZoomedProduct(filteredProducts[currentIndex - 1]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zoomedProduct, filteredProducts]);

  if (!isOpen) return null;

  const zoomedIndex = zoomedProduct 
    ? filteredProducts.findIndex(p => p.id === zoomedProduct.id) 
    : -1;

  const handleNextZoom = () => {
    if (zoomedIndex !== -1 && zoomedIndex < filteredProducts.length - 1) {
      setZoomedProduct(filteredProducts[zoomedIndex + 1]);
    }
  };

  const handlePrevZoom = () => {
    if (zoomedIndex > 0) {
      setZoomedProduct(filteredProducts[zoomedIndex - 1]);
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-fade-in"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div 
          className="relative w-full max-w-[96vw] xl:max-w-[1400px] h-[92vh] bg-[#111118] border border-[#292932] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-[#e4e1ed] animate-slide-up"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-[#292932] bg-[#161622] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#f2ca50]/15 border border-[#f2ca50]/30 flex items-center justify-center text-[#f2ca50]">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-white font-display-friendly">
                    Auditoría Visual de Fotos
                  </h3>
                  <span className="px-2 py-0.5 rounded-md bg-[#f2ca50]/15 border border-[#f2ca50]/30 text-[11px] font-bold text-[#f2ca50]">
                    {filteredProducts.length} de {products.length} fragancias
                  </span>
                  <span className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-[#1f1f2e] text-[#99907c] text-[10px] font-mono">
                    initialProducts.ts
                  </span>
                </div>
                <p className="text-xs text-[#99907c]">
                  Toca cualquier foto para verla en grande. Copia el ID para corregir cualquier imagen en <code className="text-[#f2ca50]">initialProducts.ts</code>.
                </p>
              </div>
            </div>

            <div className="flex items-center flex-wrap gap-2">
              {/* Category Filter Pills */}
              <div className="flex items-center bg-[#181824] p-1 rounded-xl border border-[#292932]">
                <button
                  type="button"
                  onClick={() => setSelectedGender('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    selectedGender === 'all'
                      ? 'bg-[#f2ca50] text-[#13131b]'
                      : 'text-[#99907c] hover:text-white'
                  }`}
                >
                  Todos
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedGender('Hombre')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    selectedGender === 'Hombre'
                      ? 'bg-[#33ccff] text-[#0c1824]'
                      : 'text-[#99907c] hover:text-white'
                  }`}
                >
                  Hombre
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedGender('Mujer')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    selectedGender === 'Mujer'
                      ? 'bg-[#ff6699] text-[#240c18]'
                      : 'text-[#99907c] hover:text-white'
                  }`}
                >
                  Mujer
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedGender('Unisex')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    selectedGender === 'Unisex'
                      ? 'bg-[#b388ff] text-[#1a0c28]'
                      : 'text-[#99907c] hover:text-white'
                  }`}
                >
                  Unisex
                </button>
              </div>

              {/* Search Box */}
              <div className="relative min-w-[180px] sm:min-w-[240px]">
                <Search className="w-3.5 h-3.5 text-[#99907c] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar perfume o ID..."
                  className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-[#1b1b26] border border-[#292932] text-xs text-[#e4e1ed] placeholder-[#99907c] focus:outline-none focus:border-[#f2ca50] transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#99907c] hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Quick batch copy */}
              <button
                type="button"
                onClick={handleCopyAllVisibleIds}
                id="photo-audit-copy-all-btn"
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1b1b26] hover:bg-[#252536] border border-[#292932] hover:border-[#f2ca50]/40 text-xs font-semibold text-[#e4e1ed] transition-all"
                title="Copiar lista de IDs visibles"
              >
                {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#f2ca50]" />}
                <span>{copiedAll ? '¡Copiados!' : 'Copiar IDs'}</span>
              </button>

              {/* Force Refresh Cloudinary Button */}
              <button
                type="button"
                onClick={handleForceRefreshCloudinary}
                disabled={isRefreshingCache}
                id="photo-audit-refresh-cache-btn"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#f2ca50]/15 hover:bg-[#f2ca50] border border-[#f2ca50]/40 text-xs font-bold text-[#f2ca50] hover:text-[#13131b] transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                title="Invalidar caché del navegador y recargar fotos actualizadas en Cloudinary"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingCache ? 'animate-spin' : ''}`} />
                <span>{isRefreshingCache ? 'Actualizando...' : 'Refrescar Fotos'}</span>
              </button>

              {/* Close button */}
              <button
                type="button"
                onClick={onClose}
                id="photo-audit-close-btn"
                className="p-2 rounded-xl bg-[#1b1b26] hover:bg-[#282834] border border-[#292932] text-[#99907c] hover:text-white transition-all"
                aria-label="Cerrar modal de auditoría"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Success Banner if photos were refreshed */}
          {refreshSuccessMsg && (
            <div className="px-5 py-2.5 bg-emerald-950/80 border-b border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-between animate-fade-in">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{refreshSuccessMsg}</span>
              </div>
              <button onClick={() => setRefreshSuccessMsg(null)} className="text-emerald-400/80 hover:text-emerald-200">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Compact Grid of Products */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 custom-scrollbar">
            {filteredProducts.length === 0 ? (
              <div className="py-20 text-center text-[#99907c] flex flex-col items-center justify-center">
                <ImageIcon className="w-12 h-12 text-[#99907c]/50 mb-2" />
                <p className="text-sm font-semibold text-white">No se encontraron fragancias con ese criterio</p>
                <p className="text-xs mt-1">Prueba borrando el término de búsqueda o cambiando el género.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3">
                {filteredProducts.map((product) => {
                  const hasError = imageErrorMap[product.id] || !product.image;
                  const isCopied = copiedId === product.id;

                  return (
                    <div
                      key={product.id}
                      id={`photo-card-${product.id}`}
                      className="group relative flex flex-col bg-[#161622] rounded-2xl border border-[#292932] hover:border-[#f2ca50]/50 p-2.5 transition-all shadow-sm hover:shadow-lg hover:shadow-black/40 overflow-hidden"
                    >
                      {/* Image Box - Clickable for Large Zoom */}
                      <button
                        type="button"
                        onClick={() => setZoomedProduct(product)}
                        id={`photo-zoom-btn-${product.id}`}
                        className="relative w-full aspect-square bg-[#0d0d14] rounded-xl border border-[#232330] hover:border-[#f2ca50]/40 overflow-hidden flex items-center justify-center p-2 mb-2 cursor-zoom-in group/img transition-all"
                        title="Toca para ver la foto en tamaño grande"
                      >
                        {hasError ? (
                          <div className="flex flex-col items-center justify-center text-center p-2 text-rose-400">
                            <ImageIcon className="w-8 h-8 opacity-60 mb-1" />
                            <span className="text-[9px] font-bold">Sin Imagen</span>
                          </div>
                        ) : (
                          <img
                            src={getOptimizedImageUrl(product.image)}
                            alt={product.name}
                            className="w-full h-full object-contain filter drop-shadow-md group-hover/img:scale-110 transition-transform duration-200"
                            referrerPolicy="no-referrer"
                            onError={() => {
                              setImageErrorMap((prev) => ({ ...prev, [product.id]: true }));
                            }}
                          />
                        )}

                        {/* Category Badge overlay on top-left of image */}
                        <div className="absolute top-1.5 left-1.5 z-10 scale-90 origin-top-left pointer-events-none">
                          <GenderBadge category={product.category} size="sm" />
                        </div>

                        {/* Zoom overlay badge on hover */}
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity">
                          <span className="px-2.5 py-1 rounded-lg bg-[#f2ca50] text-[#13131b] font-bold text-[10px] flex items-center gap-1 shadow-lg">
                            <ZoomIn className="w-3.5 h-3.5" />
                            <span>Ampliar</span>
                          </span>
                        </div>
                      </button>

                      {/* ID & Copiar ID Button Bar */}
                      <div className="flex items-center justify-between gap-1.5 mb-1.5 bg-[#0f0f17] p-1.5 rounded-lg border border-[#252533]">
                        <span 
                          className="font-mono text-[10px] font-bold text-[#f2ca50] truncate select-all"
                          title={product.id}
                        >
                          {product.id}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleCopyId(product.id)}
                          id={`copy-id-btn-${product.id}`}
                          className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold transition-all shrink-0 active:scale-95 ${
                            isCopied
                              ? 'bg-emerald-500 text-white'
                              : 'bg-[#222230] hover:bg-[#f2ca50] text-[#d0c5af] hover:text-[#13131b]'
                          }`}
                          title="Copiar ID al portapapeles"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                              <span>Copiado</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-2.5 h-2.5" />
                              <span>Copiar</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Name, Brand & Prominent Google Button */}
                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div>
                          <h4 
                            className="text-xs font-bold text-white leading-tight line-clamp-2"
                            title={product.name}
                          >
                            {product.name}
                          </h4>
                          <p 
                            className="text-[11px] font-medium text-[#99907c] truncate mt-0.5"
                            title={product.brand}
                          >
                            {product.brand}
                          </p>
                        </div>

                        {/* Bigger Google Search Button */}
                        <div className="pt-2 mt-auto">
                          <a
                            href={`https://www.google.com/search?q=${encodeURIComponent(`${product.brand} ${product.name} perfume`)}&tbm=isch`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-1.5 px-2 rounded-lg bg-[#1e1e2c] hover:bg-[#2a2a3e] border border-[#353548] hover:border-[#f2ca50]/50 text-[11px] font-bold text-[#e4e1ed] hover:text-[#f2ca50] flex items-center justify-center gap-1.5 transition-all shadow-sm group/google"
                            title="Buscar foto en Google Imágenes"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-[#f2ca50] group-hover/google:translate-x-0.5 transition-transform" />
                            <span>Buscar en Google</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer info */}
          <div className="px-5 py-2.5 bg-[#14141e] border-t border-[#292932] flex items-center justify-between text-xs text-[#99907c] shrink-0">
            <span>Haz clic en cualquier imagen para verla en tamaño grande. Toca "Copiar" para copiar el ID de las fotos erróneas.</span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1 rounded-lg bg-[#1b1b26] hover:bg-[#252536] text-white text-xs font-bold transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>

      {/* Fullscreen Photo Lightbox Modal */}
      {zoomedProduct && (
        <div 
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/95 backdrop-blur-xl animate-fade-in p-4 sm:p-6"
          onClick={() => setZoomedProduct(null)}
        >
          {/* Top close button */}
          <button
            type="button"
            onClick={() => setZoomedProduct(null)}
            id="photo-lightbox-close-btn"
            className="absolute top-5 right-5 z-70 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95"
            aria-label="Cerrar vista previa grande"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Navigation Arrows */}
          {zoomedIndex > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePrevZoom();
              }}
              id="photo-lightbox-prev-btn"
              className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-70 w-12 h-12 rounded-full bg-black/60 hover:bg-[#f2ca50] border border-white/20 hover:border-[#f2ca50] text-white hover:text-[#13131b] flex items-center justify-center transition-all cursor-pointer shadow-2xl active:scale-95 group"
              title="Anterior (Flecha izquierda)"
            >
              <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
            </button>
          )}

          {zoomedIndex < filteredProducts.length - 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNextZoom();
              }}
              id="photo-lightbox-next-btn"
              className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-70 w-12 h-12 rounded-full bg-black/60 hover:bg-[#f2ca50] border border-white/20 hover:border-[#f2ca50] text-white hover:text-[#13131b] flex items-center justify-center transition-all cursor-pointer shadow-2xl active:scale-95 group"
              title="Siguiente (Flecha derecha)"
            >
              <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}

          {/* Lightbox Content Container */}
          <div 
            className="relative max-w-3xl w-full max-h-[92vh] flex flex-col items-center justify-center gap-3 animate-zoom-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image Preview */}
            <div className="relative w-full max-h-[72vh] flex items-center justify-center bg-gradient-to-b from-[#181824]/60 to-[#0e0e16]/90 p-6 rounded-3xl border border-[#2c2c3d] shadow-2xl overflow-hidden">
              {imageErrorMap[zoomedProduct.id] || !zoomedProduct.image ? (
                <div className="py-24 text-center text-rose-400">
                  <ImageIcon className="w-16 h-16 opacity-60 mx-auto mb-2" />
                  <p className="text-sm font-bold">Imagen no disponible o URL rota</p>
                </div>
              ) : (
                <img
                  src={getOptimizedImageUrl(zoomedProduct.image)}
                  alt={zoomedProduct.name}
                  className="max-h-[64vh] max-w-full object-contain rounded-xl drop-shadow-[0_20px_50px_rgba(242,202,80,0.15)]"
                  referrerPolicy="no-referrer"
                />
              )}

              {/* Index counter */}
              <div className="absolute top-3 left-4 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-mono text-[#99907c]">
                {zoomedIndex + 1} / {filteredProducts.length}
              </div>

              {/* Category Badge top right in lightbox */}
              <div className="absolute top-3 right-4">
                <GenderBadge category={zoomedProduct.category} size="md" />
              </div>
            </div>

            {/* Bottom Details & Copy Bar */}
            <div className="w-full bg-[#13131b]/95 backdrop-blur-md px-5 py-3.5 rounded-2xl border border-[#f2ca50]/30 shadow-xl flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#f2ca50]">
                    {zoomedProduct.brand}
                  </span>
                  <span className="text-[#99907c]">•</span>
                  <span className="text-[11px] font-bold uppercase text-[#e4e1ed]">
                    {zoomedProduct.category}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white truncate mt-0.5">
                  {zoomedProduct.name}
                </h3>
              </div>

              <div className="flex items-center flex-wrap gap-2.5">
                {/* ID with Copy button */}
                <button
                  type="button"
                  onClick={() => handleCopyId(zoomedProduct.id)}
                  id="lightbox-copy-id-btn"
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 ${
                    copiedId === zoomedProduct.id
                      ? 'bg-emerald-500 text-white'
                      : 'bg-[#222230] hover:bg-[#f2ca50] text-[#e4e1ed] hover:text-[#13131b] border border-[#383848]'
                  }`}
                >
                  <span className="font-mono text-[#f2ca50]">{zoomedProduct.id}</span>
                  {copiedId === zoomedProduct.id ? (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar ID</span>
                    </>
                  )}
                </button>

                {/* Big Google Search Link */}
                <a
                  href={`https://www.google.com/search?q=${encodeURIComponent(`${zoomedProduct.brand} ${zoomedProduct.name} perfume`)}&tbm=isch`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2a293c] hover:bg-[#383652] border border-[#f2ca50]/50 hover:border-[#f2ca50] text-xs font-bold text-[#f2ca50] hover:text-white transition-all shadow-md active:scale-95"
                  title="Buscar en Google Imágenes"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Buscar en Google Imágenes</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
