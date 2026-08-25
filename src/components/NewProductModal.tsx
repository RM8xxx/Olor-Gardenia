import React, { useState } from 'react';
import { X, Plus, Sparkles, CheckCircle2 } from 'lucide-react';
import { PerfumeProduct, ProductCategory } from '../types';
import { PerfumeApiSearchBox } from './PerfumeApiSearchBox';
import { FormattedPerfumeApiData } from '../utils/perfumeApi';

interface NewProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveProduct: (product: PerfumeProduct) => void;
}

export const NewProductModal: React.FC<NewProductModalProps> = ({
  isOpen,
  onClose,
  onSaveProduct,
}) => {
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [volume, setVolume] = useState('60ml');
  const [price, setPrice] = useState('270.00');
  const [stock, setStock] = useState('5');
  const [category, setCategory] = useState<ProductCategory>('Unisex');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [image, setImage] = useState('https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&auto=format&fit=crop&q=80');

  if (!isOpen) return null;

  const handleSelectFromApi = (perfume: FormattedPerfumeApiData) => {
    setName(perfume.cleanName || perfume.name);
    setBrand(perfume.brand);
    setCategory(perfume.gender);
    setNotes(perfume.notes);
    setDescription(perfume.description);
    if (perfume.imageUrl) {
      setImage(perfume.imageUrl);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !brand) return;

    const newProd: PerfumeProduct = {
      id: `perf-${Date.now()}`,
      name,
      brand,
      volume,
      price: parseFloat(price) || 100,
      stock: parseInt(stock, 10) || 0,
      minStockAlert: 3,
      category: category === 'Todos' ? 'Unisex' : category,
      description: description || 'Fragancia exclusiva de alta gama con fijación duradera.',
      notes: notes || 'Notas de salida cítricas, corazón amaderado y fondo ambarino.',
      image: image || 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&auto=format&fit=crop&q=80',
      sku: `${brand.slice(0, 3).toUpperCase()}-${name.slice(0, 3).toUpperCase()}-${volume}`,
    };

    onSaveProduct(newProd);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#13131b] border border-[#292932] rounded-3xl overflow-hidden shadow-2xl my-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#292932] bg-[#16161e]">
          <h3 className="text-base font-bold font-serif-luxury text-[#f2ca50]">
            Nuevo Perfume al Catálogo
          </h3>
          <button onClick={onClose} className="p-1 text-[#99907c] hover:text-[#e4e1ed]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[85vh] overflow-y-auto">
          {/* API Search box */}
          <PerfumeApiSearchBox
            onSelectPerfume={handleSelectFromApi}
            selectedPerfumeName={name}
          />

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[#99907c] font-bold uppercase mb-1">Nombre del Perfume</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Grand Soir"
                  className="w-full p-2.5 rounded-xl bg-[#1b1b23] border border-[#292932] text-[#e4e1ed] focus:outline-none focus:border-[#f2ca50]"
                />
              </div>
              <div>
                <label className="block text-[#99907c] font-bold uppercase mb-1">Marca / Casa</label>
                <input
                  type="text"
                  required
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="Ej: Maison Francis Kurkdjian"
                  className="w-full p-2.5 rounded-xl bg-[#1b1b23] border border-[#292932] text-[#e4e1ed] focus:outline-none focus:border-[#f2ca50]"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[#99907c] font-bold uppercase mb-1">Precio ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#1b1b23] border border-[#292932] font-mono-numbers text-[#f2ca50] focus:outline-none focus:border-[#f2ca50]"
                />
              </div>
              <div>
                <label className="block text-[#99907c] font-bold uppercase mb-1">Stock Inicial</label>
                <input
                  type="number"
                  required
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#1b1b23] border border-[#292932] font-mono-numbers text-[#e4e1ed] focus:outline-none focus:border-[#f2ca50]"
                />
              </div>
              <div>
                <label className="block text-[#99907c] font-bold uppercase mb-1">Categoría</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl bg-[#1b1b23] border border-[#292932] text-[#e4e1ed] focus:outline-none focus:border-[#f2ca50]"
                >
                  <option value="Mujer">Mujer</option>
                  <option value="Hombre">Hombre</option>
                  <option value="Unisex">Unisex</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[#99907c] font-bold uppercase mb-1">URL de la Imagen Oficial</label>
              <input
                type="url"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://..."
                className="w-full p-2.5 rounded-xl bg-[#1b1b23] border border-[#292932] text-[#e4e1ed] focus:outline-none focus:border-[#f2ca50]"
              />
            </div>

            <div>
              <label className="block text-[#99907c] font-bold uppercase mb-1">Notas y Aromas</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej: Vainilla, ámbar, haba tonka, benjuí"
                className="w-full p-2.5 rounded-xl bg-[#1b1b23] border border-[#292932] text-[#e4e1ed] focus:outline-none focus:border-[#f2ca50]"
              />
            </div>

            <div>
              <label className="block text-[#99907c] font-bold uppercase mb-1">Descripción</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descripción sensorial del perfume..."
                className="w-full p-2.5 rounded-xl bg-[#1b1b23] border border-[#292932] text-[#e4e1ed] focus:outline-none focus:border-[#f2ca50] h-16"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-[#f2ca50] hover:bg-[#ffe088] text-[#13131b] font-bold text-xs tracking-wider uppercase transition-colors shadow-lg shadow-[#f2ca50]/20"
              >
                Guardar Fragancia en Inventario
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

