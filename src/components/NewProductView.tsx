import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Link as LinkIcon, 
  CheckCircle2, 
  Calendar,
  Clock,
  Trash2,
  AlertCircle,
  Sparkles,
  Check
} from 'lucide-react';
import { PerfumeProduct, ProductCategory } from '../types';
import { TimePickerInput } from './TimePickerInput';
import { PerfumeApiSearchBox } from './PerfumeApiSearchBox';
import { FormattedPerfumeApiData } from '../utils/perfumeApi';

interface NewProductViewProps {
  onSaveProduct: (product: PerfumeProduct) => void;
  onBack: () => void;
}

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&auto=format&fit=crop&q=80';

export const NewProductView: React.FC<NewProductViewProps> = ({
  onSaveProduct,
  onBack,
}) => {
  const getCurrentDate = () => new Date().toISOString().slice(0, 10);
  const getCurrentTime = () => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  };

  const [registerDate, setRegisterDate] = useState<string>(getCurrentDate());
  const [registerTime, setRegisterTime] = useState<string>(getCurrentTime());

  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [price, setPrice] = useState('270.00');
  const [cost, setCost] = useState('170'); // Default $170 optional
  const [stock, setStock] = useState('1'); // Default 1 as requested
  const [minStockAlert, setMinStockAlert] = useState('3');
  const [category, setCategory] = useState<ProductCategory | ''>(''); // Empty by default as requested
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [apiLoadedBadge, setApiLoadedBadge] = useState<string | null>(null);

  // Form Validation Errors State
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    brand?: string;
    category?: string;
    stock?: string;
    general?: string;
  }>({});

  // Image handling mode: 'upload' | 'url'
  const [imageMode, setImageMode] = useState<'upload' | 'url'>('url');
  const [imageUrl, setImageUrl] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeImage = uploadedImage || imageUrl || DEFAULT_IMAGE;

  // Handle selection from official perfume database API
  const handleSelectFromApi = (perfume: FormattedPerfumeApiData) => {
    setName(perfume.cleanName || perfume.name);
    setBrand(perfume.brand);
    setCategory(perfume.gender);
    setNotes(perfume.notes);
    setDescription(perfume.description);

    if (perfume.imageUrl) {
      setImageUrl(perfume.imageUrl);
      setUploadedImage(null);
      setImageMode('url');
    }

    setApiLoadedBadge(`${perfume.cleanName} (${perfume.brand}${perfume.releaseYear ? ` • ${perfume.releaseYear}` : ''})`);

    // Clear matching validation errors
    setFormErrors((prev) => ({
      ...prev,
      name: undefined,
      brand: undefined,
      category: undefined,
      general: undefined,
    }));
  };

  const handleFileChange = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido (PNG, JPG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setUploadedImage(reader.result);
        setImageUrl('');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Strict validation as requested
    const errors: { name?: string; brand?: string; category?: string; stock?: string; general?: string } = {};

    if (!name.trim()) {
      errors.name = 'El nombre del perfume es obligatorio.';
    }
    if (!brand.trim()) {
      errors.brand = 'La marca o casa del perfume es obligatoria.';
    }
    if (!category) {
      errors.category = 'Debes seleccionar una categoría (Mujer, Hombre o Unisex).';
    }
    if (!stock.trim() || isNaN(parseInt(stock, 10)) || parseInt(stock, 10) < 0) {
      errors.stock = 'El stock inicial es obligatorio y debe ser 0 o mayor.';
    }

    if (Object.keys(errors).length > 0) {
      errors.general = 'Por favor completa todos los campos obligatorios marcados con asterisco (*).';
      setFormErrors(errors);
      // Scroll to top of form
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setFormErrors({});

    const finalVolume = '60ml'; // Fixed to 60ml as requested
    const finalPrice = parseFloat(price) || 270.00;
    const finalCost = cost.trim() ? parseFloat(cost) : 170.00;
    const finalStock = parseInt(stock, 10) >= 0 ? parseInt(stock, 10) : 1;
    const finalMinAlert = parseInt(minStockAlert, 10) || 3;

    const newProd: PerfumeProduct = {
      id: `perf-${Date.now()}`,
      name: name.trim(),
      brand: brand.trim(),
      volume: finalVolume,
      price: finalPrice,
      cost: finalCost,
      stock: finalStock,
      minStockAlert: finalMinAlert,
      category: (category || 'Unisex') as 'Mujer' | 'Hombre' | 'Unisex',
      description: description.trim() || `Fragancia de alta gama ${finalVolume} con notas olfativas exclusivas y fijación prolongada.`,
      notes: notes.trim() || 'Notas olfativas amaderadas, florales y ambarinas.',
      image: activeImage,
      sku: `${brand.slice(0, 3).toUpperCase()}-${name.slice(0, 3).toUpperCase()}-60`,
    };

    onSaveProduct(newProd);
  };

  return (
    <div className="space-y-5 pb-28 max-w-xl mx-auto">
      {/* Page Title */}
      <div className="pt-1">
        <h2 className="text-2xl sm:text-3xl font-bold font-serif-luxury text-[#e4e1ed]">
          Registrar Nuevo Perfume
        </h2>
        <p className="text-xs sm:text-sm text-[#99907c] mt-1">
          Añade una nueva fragancia a tu catálogo general (Presentación estándar 60 ml)
        </p>
      </div>

      {/* 🌟 Official Perfume Database API Search Box (Exclusive: https://perfumapidatabase.onrender.com/perfumes/search/{query}) */}
      <PerfumeApiSearchBox
        onSelectPerfume={handleSelectFromApi}
        selectedPerfumeName={name}
      />

      {/* Error Alert Banner */}
      {formErrors.general && (
        <div className="p-3.5 rounded-2xl bg-[#ff7b72]/15 border border-[#ff7b72]/40 text-[#ff7b72] flex items-start gap-3 animate-fade-in">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-xs font-semibold space-y-1">
            <p className="font-bold">{formErrors.general}</p>
            <ul className="list-disc list-inside space-y-0.5 opacity-90">
              {formErrors.name && <li>{formErrors.name}</li>}
              {formErrors.brand && <li>{formErrors.brand}</li>}
              {formErrors.category && <li>{formErrors.category}</li>}
              {formErrors.stock && <li>{formErrors.stock}</li>}
            </ul>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {/* Fecha y Hora de Registro */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#1b1b23] border border-[#292932] space-y-3">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#99907c] block">
            Fecha y Hora de Ingreso
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <Calendar className="w-4 h-4 text-[#99907c] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="date"
                id="new-product-date"
                value={registerDate}
                onChange={(e) => setRegisterDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#13131b] border border-[#292932] text-xs font-mono text-[#e4e1ed] focus:outline-none focus:border-[#f2ca50]"
              />
            </div>
            <div>
              <TimePickerInput
                id="new-product-time"
                value={registerTime}
                onChange={setRegisterTime}
              />
            </div>
          </div>
        </div>

        {/* Foto del Producto Section */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#1b1b23] border border-[#292932] space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#99907c]">
              Foto del Producto
            </label>
            <span className="text-[10px] text-[#f2ca50] font-semibold">
              Opcional
            </span>
          </div>

          {/* Mode Selector: Upload / URL */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-[#13131b] border border-[#292932] text-xs font-semibold">
            <button
              type="button"
              onClick={() => setImageMode('upload')}
              className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                imageMode === 'upload'
                  ? 'bg-[#292932] text-[#f2ca50] shadow-sm'
                  : 'text-[#99907c] hover:text-[#e4e1ed]'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Subir Foto</span>
            </button>
            <button
              type="button"
              onClick={() => setImageMode('url')}
              className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                imageMode === 'url'
                  ? 'bg-[#292932] text-[#f2ca50] shadow-sm'
                  : 'text-[#99907c] hover:text-[#e4e1ed]'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>Enlace / URL</span>
            </button>
          </div>

          {/* Upload Box */}
          {imageMode === 'upload' && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-[#f2ca50] bg-[#f2ca50]/5'
                  : 'border-[#292932] hover:border-[#f2ca50]/50 bg-[#13131b]/60'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                accept="image/*"
                className="hidden"
              />
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="w-12 h-12 rounded-xl bg-[#292932] text-[#f2ca50] flex items-center justify-center">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-[#e4e1ed]">
                  Haz clic para subir o arrastra la foto aquí
                </p>
                <p className="text-[11px] text-[#99907c]">
                  PNG, JPG o WEBP
                </p>
              </div>
            </div>
          )}

          {/* URL Input */}
          {imageMode === 'url' && (
            <div className="space-y-2">
              <div className="relative">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    setUploadedImage(null);
                  }}
                  placeholder="https://ejemplo.com/foto-perfume.jpg"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#13131b] border border-[#292932] text-xs text-[#e4e1ed] placeholder-[#99907c] focus:outline-none focus:border-[#f2ca50]"
                />
                <LinkIcon className="w-4 h-4 text-[#99907c] absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
              <p className="text-[10px] text-[#99907c]">
                Pega el enlace directo de una foto en internet.
              </p>
            </div>
          )}

          {/* Image Preview */}
          <div className="flex items-center gap-3.5 p-3 rounded-xl bg-[#13131b] border border-[#292932]">
            <div className="w-16 h-16 rounded-xl overflow-hidden border border-[#292932] bg-[#1f1f27] shrink-0">
              <img
                src={activeImage}
                alt="Vista previa"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = DEFAULT_IMAGE;
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[#e4e1ed] truncate">
                Vista previa de la imagen
              </p>
              <p className="text-[10px] text-[#99907c] truncate mt-0.5">
                {uploadedImage ? 'Foto cargada desde tu dispositivo' : imageUrl ? 'Enlace URL asignado' : 'Imagen de frasco por defecto'}
              </p>
            </div>
            {(uploadedImage || imageUrl) && (
              <button
                type="button"
                onClick={() => {
                  setUploadedImage(null);
                  setImageUrl('');
                }}
                className="p-2 text-[#99907c] hover:text-[#ffb4ab] transition-colors"
                title="Quitar foto personalizada"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Datos Principales (Nombre, Marca, Categoría, Stock Inicial) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#1b1b23] border border-[#292932] space-y-4">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#99907c] block">
            Información del Perfume
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nombre del Perfume */}
            <div>
              <label className="block text-xs font-semibold text-[#e4e1ed] mb-1.5">
                Nombre del Perfume <span className="text-[#ff7b72]">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (formErrors.name) setFormErrors((prev) => ({ ...prev, name: undefined }));
                }}
                placeholder="Ej: Baccarat Rouge 540"
                className={`w-full px-3.5 py-3 rounded-xl bg-[#13131b] border text-xs sm:text-sm text-[#e4e1ed] placeholder-[#99907c] focus:outline-none transition-colors ${
                  formErrors.name
                    ? 'border-[#ff7b72] focus:border-[#ff7b72] bg-[#ff7b72]/5'
                    : 'border-[#292932] focus:border-[#f2ca50]'
                }`}
              />
              {formErrors.name && (
                <p className="text-[11px] text-[#ff7b72] font-semibold mt-1">
                  {formErrors.name}
                </p>
              )}
            </div>

            {/* Marca / Casa */}
            <div>
              <label className="block text-xs font-semibold text-[#e4e1ed] mb-1.5">
                Marca / Casa <span className="text-[#ff7b72]">*</span>
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => {
                  setBrand(e.target.value);
                  if (formErrors.brand) setFormErrors((prev) => ({ ...prev, brand: undefined }));
                }}
                placeholder="Ej: Maison Francis Kurkdjian"
                className={`w-full px-3.5 py-3 rounded-xl bg-[#13131b] border text-xs sm:text-sm text-[#e4e1ed] placeholder-[#99907c] focus:outline-none transition-colors ${
                  formErrors.brand
                    ? 'border-[#ff7b72] focus:border-[#ff7b72] bg-[#ff7b72]/5'
                    : 'border-[#292932] focus:border-[#f2ca50]'
                }`}
              />
              {formErrors.brand && (
                <p className="text-[11px] text-[#ff7b72] font-semibold mt-1">
                  {formErrors.brand}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Categoría / Género (Vacía por defecto, obligatoria) */}
            <div>
              <label className="block text-xs font-semibold text-[#e4e1ed] mb-1.5 flex items-center justify-between">
                <span>
                  Categoría / Género <span className="text-[#ff7b72]">*</span>
                </span>
                {category && (
                  <span className="text-[10px] font-bold">
                    {category === 'Mujer' && <span className="text-[#f472b6]">🌸 Mujer</span>}
                    {category === 'Hombre' && <span className="text-[#38bdf8]">🌿 Hombre</span>}
                    {category === 'Unisex' && <span className="text-[#a78bfa]">✨ Unisex</span>}
                  </span>
                )}
              </label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value as any);
                  if (formErrors.category) setFormErrors((prev) => ({ ...prev, category: undefined }));
                }}
                className={`w-full px-3 py-3 rounded-xl bg-[#13131b] border text-xs sm:text-sm text-[#e4e1ed] focus:outline-none transition-colors cursor-pointer ${
                  formErrors.category
                    ? 'border-[#ff7b72] focus:border-[#ff7b72] bg-[#ff7b72]/5 text-[#ff7b72]'
                    : 'border-[#292932] focus:border-[#f2ca50]'
                }`}
              >
                <option value="" disabled className="text-[#99907c] bg-[#13131b]">
                  -- Selecciona el género / categoría * --
                </option>
                <option value="Mujer" className="bg-[#13131b] text-[#f472b6]">
                  🌸 Mujer (Femenino)
                </option>
                <option value="Hombre" className="bg-[#13131b] text-[#38bdf8]">
                  🌿 Hombre (Masculino)
                </option>
                <option value="Unisex" className="bg-[#13131b] text-[#a78bfa]">
                  ✨ Unisex (Compartido)
                </option>
              </select>
              {formErrors.category && (
                <p className="text-[11px] text-[#ff7b72] font-semibold mt-1">
                  {formErrors.category}
                </p>
              )}
            </div>

            {/* Stock Inicial (Predeterminado 1, obligatorio) */}
            <div>
              <label className="block text-xs font-semibold text-[#e4e1ed] mb-1.5">
                Stock Inicial (Piezas) <span className="text-[#ff7b72]">*</span>
              </label>
              <input
                type="number"
                min="0"
                value={stock}
                onChange={(e) => {
                  setStock(e.target.value);
                  if (formErrors.stock) setFormErrors((prev) => ({ ...prev, stock: undefined }));
                }}
                placeholder="1"
                className={`w-full px-3 py-3 rounded-xl bg-[#13131b] border font-mono-numbers text-xs sm:text-sm text-[#e4e1ed] focus:outline-none transition-colors ${
                  formErrors.stock
                    ? 'border-[#ff7b72] focus:border-[#ff7b72] bg-[#ff7b72]/5'
                    : 'border-[#292932] focus:border-[#f2ca50]'
                }`}
              />
              {formErrors.stock && (
                <p className="text-[11px] text-[#ff7b72] font-semibold mt-1">
                  {formErrors.stock}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Precios y Finanzas */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#1b1b23] border border-[#292932] space-y-4">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#99907c] block">
            Precios y Alertas
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#e4e1ed] mb-1.5">
                Precio de Venta ($) <span className="text-[#ff7b72]">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#f2ca50]">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="270.00"
                  className="w-full pl-8 pr-3.5 py-3 rounded-xl bg-[#13131b] border border-[#292932] font-mono-numbers text-xs sm:text-sm text-[#f2ca50] font-bold focus:outline-none focus:border-[#f2ca50]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#e4e1ed] mb-1.5">
                Costo Unitario ($) <span className="text-[#99907c] text-[10px] font-normal">(Opcional)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#99907c]">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  placeholder="170.00"
                  className="w-full pl-8 pr-3.5 py-3 rounded-xl bg-[#13131b] border border-[#292932] font-mono-numbers text-xs sm:text-sm text-[#e4e1ed] focus:outline-none focus:border-[#f2ca50]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#e4e1ed] mb-1.5">
                Alerta de Stock Mínimo
              </label>
              <input
                type="number"
                min="1"
                value={minStockAlert}
                onChange={(e) => setMinStockAlert(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl bg-[#13131b] border border-[#292932] font-mono-numbers text-xs sm:text-sm text-[#e4e1ed] focus:outline-none focus:border-[#f2ca50]"
              />
            </div>
          </div>
        </div>

        {/* Notas y Descripción */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#1b1b23] border border-[#292932] space-y-4">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#99907c] block">
            Detalles Olfativos y Descripción
          </label>

          <div>
            <label className="block text-xs font-semibold text-[#e4e1ed] mb-1.5">
              Notas y Acordes Olfativos
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Jazmín, azafrán, madera de cedro, ámbar gris"
              className="w-full px-3.5 py-3 rounded-xl bg-[#13131b] border border-[#292932] text-xs text-[#e4e1ed] placeholder-[#99907c] focus:outline-none focus:border-[#f2ca50]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#e4e1ed] mb-1.5">
              Descripción Sensorial
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción de la fragancia, proyección y fijación..."
              className="w-full px-3.5 py-3 rounded-xl bg-[#13131b] border border-[#292932] text-xs text-[#e4e1ed] placeholder-[#99907c] focus:outline-none focus:border-[#f2ca50] h-20"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          <button
            type="submit"
            id="new-product-submit-btn"
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-[#d4af37] hover:bg-[#f2ca50] text-[#13131b] font-bold text-sm sm:text-base tracking-wide transition-all shadow-lg active:scale-[0.99]"
          >
            <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
            <span>Guardar Producto en Inventario</span>
          </button>
        </div>
      </form>
    </div>
  );
};
