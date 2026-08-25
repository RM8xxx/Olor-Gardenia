import React, { useMemo } from 'react';
import { 
  ArrowLeft,
  X,
  MessageCircle, 
  Trash2, 
  Droplets,
  Heart
} from 'lucide-react';
import { PerfumeProduct } from '../types';
import { GenderIcon } from './GenderBadge';

interface AvailabilityInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: PerfumeProduct[];
  selectedProductIds: string[];
  onToggleProduct: (productId: string) => void;
  onClearSelected: () => void;
  onSelectAll?: () => void;
}

const WHATSAPP_PHONE_NUMBER = '529987099043';

export const AvailabilityInquiryModal: React.FC<AvailabilityInquiryModalProps> = ({
  isOpen,
  onClose,
  products,
  selectedProductIds,
  onToggleProduct,
  onClearSelected,
}) => {
  // Map of selected products
  const selectedProducts = useMemo(() => {
    return products.filter((p) => selectedProductIds.includes(p.id));
  }, [products, selectedProductIds]);

  // Formatted WhatsApp message with bullets for each product
  const generatedMessage = useMemo(() => {
    if (selectedProducts.length === 0) return '';
    
    const itemsText = selectedProducts
      .map((p) => `• ${p.name} - ${p.brand} (${p.category})`)
      .join('\n');

    return `Hola, me interesa pedir o consultar la disponibilidad de estos perfumes de mi lista de favoritos:\n\n${itemsText}`;
  }, [selectedProducts]);

  const handleSendWhatsApp = () => {
    if (selectedProducts.length === 0) return;
    const url = `https://wa.me/${WHATSAPP_PHONE_NUMBER}?text=${encodeURIComponent(generatedMessage)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    onClearSelected();
    onClose();
  };

  const handleGoBack = () => {
    onClose();
  };

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Modal Container */}
      <div 
        id="availability-inquiry-modal"
        className="w-full h-full sm:h-auto sm:max-h-[85vh] sm:max-w-xl sm:rounded-3xl bg-[#13131b] border-0 sm:border border-[#292932] shadow-2xl flex flex-col overflow-hidden text-[#e4e1ed]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-[#292932] bg-[#161622] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={handleGoBack}
              id="back-availability-modal-btn"
              className="p-2.5 rounded-xl bg-[#1b1b23] hover:bg-[#292932] text-pink-400 hover:text-pink-300 border border-[#292932] transition-all min-w-[42px] min-h-[42px] flex items-center justify-center shrink-0 active:scale-95"
              title="Volver"
              aria-label="Volver al catálogo"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            </button>

            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold font-serif-luxury text-[#e4e1ed] truncate flex items-center gap-2">
                <Heart className="w-4 h-4 fill-pink-400 text-pink-400 shrink-0" />
                Mis Favoritos (Wishlist)
              </h2>
              <p className="text-xs text-[#99907c] truncate">
                Tus perfumes seleccionados listos para consultar
              </p>
            </div>
          </div>

          {selectedProducts.length > 0 && (
            <button
              onClick={onClearSelected}
              className="text-xs text-[#ff6e6e] hover:underline flex items-center gap-1 font-medium transition-colors shrink-0 px-2.5 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Vaciar</span>
            </button>
          )}
        </div>

        {/* Selected Products List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 custom-scrollbar space-y-3">
          {selectedProducts.length === 0 ? (
            <div className="py-16 px-6 text-center space-y-3 rounded-2xl bg-[#181824] border border-dashed border-[#292932]">
              <div className="w-12 h-12 rounded-2xl bg-pink-500/10 text-pink-400 flex items-center justify-center mx-auto border border-pink-500/30">
                <Heart className="w-6 h-6 fill-pink-400/40" />
              </div>
              <h3 className="text-sm font-bold text-white">Tu lista de favoritos está vacía</h3>
              <p className="text-xs text-[#99907c] max-w-xs mx-auto">
                Toca el botón de corazón ❤️ en cualquier perfume del catálogo para agregarlo a tus favoritos.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {selectedProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-[#1b1b23] border border-[#292932] hover:border-pink-500/40 transition-all shadow-sm group"
                >
                  <div className="relative w-14 h-14 rounded-xl bg-[#13131b] border border-[#292932] flex items-center justify-center overflow-hidden p-1 shrink-0">
                    {prod.image ? (
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <Droplets className="w-5 h-5 text-pink-400" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold text-pink-400 uppercase tracking-wider truncate">
                      {prod.brand}
                    </p>
                    <h4 className="text-xs sm:text-sm font-bold text-[#e4e1ed] truncate mt-0.5">
                      {prod.name}
                    </h4>
                    <p className="text-[10px] text-[#99907c] truncate mt-0.5 flex items-center gap-1.5">
                      <GenderIcon category={prod.category} sizeClass="w-3 h-3" />
                      <span>{prod.category} • {prod.volume || '60ml'}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => onToggleProduct(prod.id)}
                    className="p-2 rounded-xl text-[#99907c] hover:text-[#ff6e6e] hover:bg-red-500/10 transition-colors shrink-0"
                    title="Quitar de favoritos"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Bottom Fixed Actions */}
        {selectedProducts.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-[#292932] bg-[#161622] shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-center sm:text-left w-full sm:w-auto">
              <span className="text-xs text-[#99907c]">
                Seleccionados:{' '}
                <strong className="text-pink-400 font-bold">
                  {selectedProducts.length} {selectedProducts.length === 1 ? 'fragancia' : 'fragancias'}
                </strong>
              </span>
            </div>

            <div className="w-full sm:w-auto">
              <button
                type="button"
                onClick={handleSendWhatsApp}
                id="send-whatsapp-inquiry-set-btn"
                className="w-full sm:w-auto py-3.5 px-6 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-[#25D366]/30 active:scale-95 transition-all border border-white/20 min-h-[48px]"
              >
                <MessageCircle className="w-5 h-5 fill-white shrink-0" />
                <span>Preguntar disponibilidad por WhatsApp</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
