import React, { useState } from 'react';
import { 
  X, 
  Share2, 
  Copy, 
  Check, 
  MessageCircle, 
  Bookmark, 
  Sparkles,
  Smartphone
} from 'lucide-react';

interface ShareCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName?: string;
  brandName?: string;
}

export const ShareCatalogModal: React.FC<ShareCatalogModalProps> = ({
  isOpen,
  onClose,
  productName,
  brandName,
}) => {
  if (!isOpen) return null;

  const [copied, setCopied] = useState(false);

  // Exact custom direct link requested by user
  const directCatalogUrl = 'https://muestrario-perfumes-maria-maria.ai.studio';
  
  const shareTitle = productName 
    ? `${productName} (${brandName}) - Olor Gardenia Perfumes` 
    : 'Olor Gardenia • Catálogo de Perfumería Fina';

  const shareText = productName
    ? `Mira este perfume en Olor Gardenia: ${brandName ? `${brandName} ` : ''}${productName} ✨ Alta fijación e inspiraciones premium:`
    : '¡Hola! Te comparto el catálogo digital de Olor Gardenia con las mejores fragancias e inspiraciones de alta concentración ✨:';

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(directCatalogUrl);
      } else {
        // Fallback for older browsers / iframe restrictions
        const input = document.createElement('input');
        input.value = directCatalogUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.warn('Could not copy link:', e);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: directCatalogUrl,
        });
      } catch (e) {
        // User cancelled or not supported
      }
    } else {
      handleCopyLink();
    }
  };

  const handleWhatsAppShare = () => {
    const fullMessage = `${shareText}\n${directCatalogUrl}`;
    const encoded = encodeURIComponent(fullMessage);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="w-full max-w-md bg-[#13131b] border border-[#292932] rounded-3xl shadow-2xl overflow-hidden flex flex-col transition-all duration-200 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#292932]/80 bg-[#161620]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#f2ca50]/15 border border-[#f2ca50]/30 flex items-center justify-center text-[#f2ca50]">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold font-serif-luxury text-[#e4e1ed]">
                Guardar o Compartir Catálogo
              </h3>
              <p className="text-[11px] text-[#99907c]">
                Guarda este enlace para revisarlo cuando quieras
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            id="share-modal-close-btn"
            className="p-1.5 rounded-xl text-[#99907c] hover:text-[#e4e1ed] hover:bg-[#1b1b23] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Quick Copy Link Box */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#99907c] flex items-center gap-1">
              <Bookmark className="w-3.5 h-3.5 text-[#f2ca50]" />
              <span>Enlace Directo</span>
            </label>

            <div className="flex items-center gap-2 p-1.5 bg-[#0c0c13] border border-[#292932] rounded-2xl">
              <input
                type="text"
                readOnly
                value={directCatalogUrl}
                className="flex-1 bg-transparent px-2.5 text-xs text-[#d0c5af] font-mono focus:outline-none truncate select-all"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                id="share-copy-link-action-btn"
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm shrink-0 active:scale-95 ${
                  copied
                    ? 'bg-[#4edea3] text-[#13131b]'
                    : 'bg-[#f2ca50] hover:bg-[#ffe088] text-[#13131b]'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Action Grid: WhatsApp & Native Share */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* WhatsApp Share */}
            <button
              type="button"
              onClick={handleWhatsAppShare}
              id="share-whatsapp-action-btn"
              className="py-3 px-3.5 rounded-2xl bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/40 text-[#25D366] hover:text-white transition-all font-bold text-xs flex items-center justify-center gap-2 shadow-sm active:scale-95"
            >
              <MessageCircle className="w-4 h-4 fill-current shrink-0" />
              <span>Enviar por WhatsApp</span>
            </button>

            {/* Native Share or Copy */}
            <button
              type="button"
              onClick={handleNativeShare}
              id="share-native-action-btn"
              className="py-3 px-3.5 rounded-2xl bg-[#1b1b23] hover:bg-[#252530] border border-[#292932] hover:border-[#f2ca50]/40 text-[#e4e1ed] transition-all font-bold text-xs flex items-center justify-center gap-2 shadow-sm active:scale-95"
            >
              <Share2 className="w-4 h-4 text-[#f2ca50] shrink-0" />
              <span>Más Opciones...</span>
            </button>
          </div>

          {/* How to save instructions on mobile */}
          <div className="p-3.5 rounded-2xl bg-[#161620] border border-[#292932]/70 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#f2ca50]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>¿Cómo guardarlo en tu celular?</span>
            </div>
            
            <div className="flex items-start gap-2 text-[11px] text-[#99907c]">
              <Smartphone className="w-3.5 h-3.5 text-[#e4e1ed] shrink-0 mt-0.5" />
              <span>
                Abre el menú de tu navegador (Safari o Chrome) y toca <em>"Agregar a pantalla de inicio"</em> o <em>"Añadir a Marcadores"</em> para tenerlo siempre a la mano como una app.
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#292932]/80 bg-[#161620] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            id="share-modal-finish-btn"
            className="w-full py-2.5 rounded-xl bg-[#1b1b23] hover:bg-[#252530] border border-[#292932] text-xs font-bold text-[#e4e1ed] transition-colors"
          >
            Listo, cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
