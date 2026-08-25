import React, { useState } from 'react';
import { X, Search, Plus, Check } from 'lucide-react';
import { PerfumeProduct } from '../types';
import { GenderIcon } from './GenderBadge';

interface ProductPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: PerfumeProduct[];
  onSelectProduct: (product: PerfumeProduct) => void;
}

export const ProductPickerModal: React.FC<ProductPickerModalProps> = ({
  isOpen,
  onClose,
  products,
  onSelectProduct,
}) => {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const filtered = products.filter((p) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      (p.notes && p.notes.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#13131b] border border-[#292932] rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#292932] bg-[#16161e]">
          <h3 className="text-base font-bold font-serif-luxury text-[#e4e1ed]">
            Seleccionar Producto
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#99907c] hover:text-[#e4e1ed]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-[#292932]">
          <div className="relative">
            <Search className="w-4 h-4 text-[#99907c] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre, marca o categoría..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#1b1b23] border border-[#292932] text-xs text-[#e4e1ed] placeholder-[#99907c] focus:outline-none focus:border-[#f2ca50]"
              autoFocus
            />
          </div>
        </div>

        {/* List */}
        <div className="p-4 overflow-y-auto divide-y divide-[#292932] flex-1">
          {filtered.length === 0 ? (
            <p className="text-xs text-center text-[#99907c] py-6">No se encontraron productos.</p>
          ) : (
            filtered.map((product) => (
              <div
                key={product.id}
                onClick={() => {
                  onSelectProduct(product);
                  onClose();
                }}
                className="py-2.5 flex items-center justify-between hover:bg-[#1b1b23] px-2 rounded-xl cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-10 h-10 rounded-lg object-cover border border-[#292932] shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-xs sm:text-sm text-[#e4e1ed] truncate">
                        {product.name}
                      </h4>
                      <GenderIcon category={product.category} sizeClass="w-3 h-3" />
                    </div>
                    <p className="text-[10px] text-[#99907c] mt-0.5">
                      {product.brand} • {product.volume} • Stock: {product.stock} u.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs font-mono-numbers text-[#f2ca50]">
                    ${product.price.toFixed(2)}
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-[#292932] hover:bg-[#f2ca50] text-[#99907c] hover:text-[#13131b] flex items-center justify-center transition-colors">
                    <Plus className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
