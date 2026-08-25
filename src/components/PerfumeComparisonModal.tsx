import React from 'react';
import { PerfumeProduct } from '../types';
import { X, ArrowLeftRight, Heart } from 'lucide-react';
import { GenderBadge } from './GenderBadge';

interface PerfumeComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: PerfumeProduct[];
  onSelectProduct: (product: PerfumeProduct) => void;
  inquiryIds?: string[];
}

export const PerfumeComparisonModal: React.FC<PerfumeComparisonModalProps> = ({
  isOpen,
  onClose,
  products,
  inquiryIds = [],
}) => {
  if (!isOpen) return null;

  const wishlistProducts = products.filter(p => inquiryIds.includes(p.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        id="perfume-comparison-modal-card"
        className="relative w-full max-w-5xl bg-[#181822] border border-[#3b3b4a] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#2d2d3b] flex items-center justify-between bg-[#13131b]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-pink-500/15 border border-pink-500/30 flex items-center justify-center text-pink-400">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Comparador de Favoritos (Vs.)
              </h2>
              <p className="text-xs text-[#a09cb0]">Comparativa directa de los perfumes que elegiste en tu wishlist</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-[#252533] hover:bg-[#323246] text-[#a09cb0] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          {wishlistProducts.length === 0 ? (
            <div className="py-20 px-6 text-center space-y-4 rounded-2xl bg-[#13131b] border border-dashed border-[#2d2d3b] my-auto">
              <div className="w-14 h-14 rounded-2xl bg-pink-500/15 text-pink-400 flex items-center justify-center mx-auto border border-pink-500/30">
                <Heart className="w-7 h-7 fill-pink-400/40" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">No hay favoritos seleccionados</h3>
                <p className="text-xs text-[#a09cb0] max-w-sm mx-auto">
                  Agrega perfumes a tus Favoritos ❤️ desde el catálogo para poder compararlos lado a lado automáticamente aquí.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-pink-400 flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 fill-pink-400" />
                  Comparando {wishlistProducts.length} {wishlistProducts.length === 1 ? 'perfume seleccionado' : 'perfumes seleccionados'}
                </span>
              </div>

              {/* Grid of Wishlist Products Side-by-Side (2 by 2) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-4xl mx-auto">
                {wishlistProducts.map((product, idx) => (
                  <div
                    key={`compare-wish-${product.id}`}
                    className="bg-[#13131b] border border-[#2d2d3b] hover:border-pink-500/40 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4 shadow-lg transition-all"
                  >
                    <div className="space-y-3">
                      <div className="relative aspect-[4/3] w-full rounded-xl bg-[#1b1b26] overflow-hidden border border-[#3b3b4a] flex items-center justify-center p-2">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-contain filter drop-shadow-md"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <Heart className="w-8 h-8 text-pink-400/30" />
                        )}
                        <div className="absolute top-2.5 left-2.5">
                          <span className="px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md text-pink-400 text-[10px] font-black uppercase tracking-wider border border-pink-500/35">
                            Favorito #{idx + 1}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <GenderBadge gender={product.gender} />
                          <span className="px-2 py-0.5 rounded-md bg-[#252533] text-[10px] font-semibold text-[#a09cb0] uppercase">
                            {product.category}
                          </span>
                        </div>
                        <p className="text-[10px] font-bold text-pink-400 uppercase tracking-wider">{product.brand}</p>
                        <h3 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
                          {product.name}
                        </h3>
                      </div>

                      <div className="space-y-2.5 pt-2 border-t border-[#2d2d3b] text-xs">
                        <div>
                          <span className="text-[#8e8a9d] block text-[10px] uppercase font-semibold mb-0.5">Notas Olfativas</span>
                          <p className="text-[#d0ccde] font-medium leading-relaxed line-clamp-3">{product.notes || 'No especificadas'}</p>
                        </div>

                        <div>
                          <span className="text-[#8e8a9d] block text-[10px] uppercase font-semibold mb-0.5">Descripción / Estilo</span>
                          <p className="text-[#d0ccde] leading-relaxed line-clamp-3">{product.description || 'Sin descripción adicional'}</p>
                        </div>

                        {product.volume && (
                          <div className="pt-1">
                            <span className="text-[#8e8a9d] text-[10px] uppercase font-semibold">Presentación: </span>
                            <span className="text-white font-medium">{product.volume}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#2d2d3b] bg-[#13131b] flex items-center justify-between text-[11px] text-[#8e8a9d]">
          <span>Comparador automático de Wishlist</span>
          <button
            type="button"
            onClick={onClose}
            className="text-pink-400 hover:underline font-semibold"
          >
            Cerrar Comparador
          </button>
        </div>
      </div>
    </div>
  );
};
