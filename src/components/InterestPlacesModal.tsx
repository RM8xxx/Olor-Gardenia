import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  ExternalLink, 
  Plus, 
  X, 
  Trash2, 
  Copy, 
  Check, 
  Navigation,
  Compass,
  Pencil,
  Save,
  RotateCcw
} from 'lucide-react';
import { InterestPlace } from '../types';

interface InterestPlacesModalProps {
  isOpen: boolean;
  onClose: () => void;
  places?: InterestPlace[];
  onUpdatePlace?: (updated: InterestPlace) => void;
  onAddPlace?: (newPlace: InterestPlace) => void;
  onDeletePlace?: (id: string) => void;
  initialEditPlaceId?: string | null;
}

export const DEFAULT_INTEREST_PLACES: InterestPlace[] = [
  {
    id: 'place-1',
    name: 'Plaza del chorro',
    address: 'Dr. José Ma. Coss 629, Centro, 64000 Monterrey, N.L.',
    notes: 'Punto céntrico de entrega y referencia',
  },
  {
    id: 'place-2',
    name: 'María María Rocallosos',
    address: 'Montes Rocallosos 600, Residencial San Agustín 2o Sector, 66260 San Pedro Garza García, N.L., México',
    notes: 'San Pedro Garza García',
  },
];

export const INTEREST_PLACES_STORAGE_KEY = 'perfume_interest_places_v1';

export const InterestPlacesModal: React.FC<InterestPlacesModalProps> = ({
  isOpen,
  onClose,
  places: propPlaces,
  onUpdatePlace,
  onAddPlace,
  onDeletePlace,
  initialEditPlaceId = null,
}) => {
  const [localPlaces, setLocalPlaces] = useState<InterestPlace[]>(() => {
    try {
      const saved = localStorage.getItem(INTEREST_PLACES_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return DEFAULT_INTEREST_PLACES;
  });

  const places = propPlaces || localPlaces;

  // New Place creation form state
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newNotes, setNewNotes] = useState('');

  // Editing existing place state
  const [editingPlaceId, setEditingPlaceId] = useState<string | null>(initialEditPlaceId);
  const [editName, setEditName] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Sync initialEditPlaceId when opened
  useEffect(() => {
    if (initialEditPlaceId) {
      const target = places.find((p) => p.id === initialEditPlaceId);
      if (target) {
        startEditing(target);
      }
    }
  }, [initialEditPlaceId, isOpen]);

  // Sync to local storage
  const persistPlaces = (updatedPlaces: InterestPlace[]) => {
    try {
      localStorage.setItem(INTEREST_PLACES_STORAGE_KEY, JSON.stringify(updatedPlaces));
    } catch (e) {
      console.error('Failed to save interest places:', e);
    }
  };

  if (!isOpen) return null;

  const startEditing = (place: InterestPlace) => {
    setEditingPlaceId(place.id);
    setEditName(place.name);
    setEditAddress(place.address);
    setEditNotes(place.notes || '');
    setIsAdding(false);
  };

  const cancelEditing = () => {
    setEditingPlaceId(null);
    setEditName('');
    setEditAddress('');
    setEditNotes('');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlaceId) return;

    if (!editName.trim() || !editAddress.trim()) {
      alert('Por favor completa el nombre y la dirección del sitio.');
      return;
    }

    const updatedPlace: InterestPlace = {
      id: editingPlaceId,
      name: editName.trim(),
      address: editAddress.trim(),
      notes: editNotes.trim() || undefined,
    };

    if (onUpdatePlace) {
      onUpdatePlace(updatedPlace);
    } else {
      const next = localPlaces.map((p) => (p.id === editingPlaceId ? updatedPlace : p));
      setLocalPlaces(next);
      persistPlaces(next);
    }

    cancelEditing();
  };

  const handleAddPlace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newAddress.trim()) {
      alert('Por favor ingresa el nombre y la dirección del sitio.');
      return;
    }

    const newPlace: InterestPlace = {
      id: `place-${Date.now()}`,
      name: newName.trim(),
      address: newAddress.trim(),
      notes: newNotes.trim() || undefined,
    };

    if (onAddPlace) {
      onAddPlace(newPlace);
    } else {
      const next = [...localPlaces, newPlace];
      setLocalPlaces(next);
      persistPlaces(next);
    }

    setNewName('');
    setNewAddress('');
    setNewNotes('');
    setIsAdding(false);
  };

  const handleDeletePlace = (id: string) => {
    if (confirm('¿Deseas eliminar este sitio de interés?')) {
      if (onDeletePlace) {
        onDeletePlace(id);
      } else {
        const next = localPlaces.filter((p) => p.id !== id);
        setLocalPlaces(next);
        persistPlaces(next);
      }
      if (editingPlaceId === id) {
        cancelEditing();
      }
    }
  };

  const handleCopyAddress = (id: string, address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const getGoogleMapsUrl = (address: string) => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#13131b] border border-[#292932] rounded-3xl overflow-hidden shadow-2xl my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#292932]/70 bg-[#171720]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#f2ca50]/15 flex items-center justify-center text-[#f2ca50]">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold font-serif-luxury text-[#e4e1ed]">
                Sitios de Interés
              </h3>
              <p className="text-[10px] text-[#99907c]">
                Puntos de entrega y ubicaciones en Google Maps
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            id="interest-places-close-btn"
            className="p-1.5 rounded-xl text-[#99907c] hover:text-[#e4e1ed] hover:bg-[#23232e] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Add New Place Form (Collapsible) */}
          {isAdding ? (
            <form onSubmit={handleAddPlace} className="p-4 rounded-2xl bg-[#1b1b23] border border-[#f2ca50]/40 space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between pb-1 border-b border-[#292932]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#f2ca50] flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5" />
                  Nueva Ubicación
                </h4>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="text-xs text-[#99907c] hover:text-[#e4e1ed]"
                >
                  Cancelar
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#e4e1ed] mb-1">
                  Nombre del Sitio *
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ej: Punto Sucursal Valle"
                  className="w-full px-3 py-2 rounded-xl bg-[#13131b] border border-[#292932] text-xs text-[#e4e1ed] placeholder-[#99907c] focus:outline-none focus:border-[#f2ca50]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#e4e1ed] mb-1">
                  Dirección Completa *
                </label>
                <input
                  type="text"
                  required
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="Ej: Av. Constitución 1234, Monterrey, N.L."
                  className="w-full px-3 py-2 rounded-xl bg-[#13131b] border border-[#292932] text-xs text-[#e4e1ed] placeholder-[#99907c] focus:outline-none focus:border-[#f2ca50]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#e4e1ed] mb-1">
                  Notas / Referencia <span className="text-[#99907c] font-normal">(Opcional)</span>
                </label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Ej: Frente al kiosco principal"
                  className="w-full px-3 py-2 rounded-xl bg-[#13131b] border border-[#292932] text-xs text-[#e4e1ed] placeholder-[#99907c] focus:outline-none focus:border-[#f2ca50]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[#13131b] hover:bg-[#292932] text-xs font-bold text-[#99907c] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  id="save-interest-place-btn"
                  className="flex-1 py-2.5 rounded-xl bg-[#f2ca50] hover:bg-[#ffe088] text-[#13131b] text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-[#f2ca50]/20"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Guardar Sitio</span>
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => {
                cancelEditing();
                setIsAdding(true);
              }}
              id="add-new-interest-place-btn"
              className="w-full py-2.5 px-3 rounded-2xl bg-[#1b1b23] hover:bg-[#23232e] border border-dashed border-[#292932] hover:border-[#f2ca50]/60 text-xs font-bold text-[#f2ca50] flex items-center justify-center gap-2 transition-all group"
            >
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
              <span>+ Añadir Nueva Dirección</span>
            </button>
          )}

          {/* List of Places */}
          <div className="space-y-3">
            {places.map((place) => {
              const isCurrentlyEditing = editingPlaceId === place.id;

              return isCurrentlyEditing ? (
                /* Inline Edit Form for this specific place */
                <form
                  key={place.id}
                  onSubmit={handleSaveEdit}
                  id={`edit-place-form-${place.id}`}
                  className="p-4 rounded-2xl bg-[#1b1b23] border-2 border-[#f2ca50] shadow-lg space-y-3 animate-fadeIn"
                >
                  <div className="flex items-center justify-between pb-1.5 border-b border-[#292932]">
                    <span className="text-xs font-bold text-[#f2ca50] uppercase tracking-wider flex items-center gap-1.5">
                      <Pencil className="w-3.5 h-3.5" />
                      Editando Ubicación
                    </span>
                    <button
                      type="button"
                      onClick={cancelEditing}
                      className="text-xs text-[#99907c] hover:text-[#e4e1ed]"
                    >
                      Cancelar
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#e4e1ed] mb-1">
                      Nombre del Sitio *
                    </label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Nombre del sitio o sucursal"
                      className="w-full px-3 py-2 rounded-xl bg-[#13131b] border border-[#292932] text-xs text-[#e4e1ed] placeholder-[#99907c] focus:outline-none focus:border-[#f2ca50]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#e4e1ed] mb-1">
                      Dirección Completa *
                    </label>
                    <input
                      type="text"
                      required
                      value={editAddress}
                      onChange={(e) => setEditAddress(e.target.value)}
                      placeholder="Calle, número, colonia, ciudad, código postal"
                      className="w-full px-3 py-2 rounded-xl bg-[#13131b] border border-[#292932] text-xs text-[#e4e1ed] placeholder-[#99907c] focus:outline-none focus:border-[#f2ca50]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#e4e1ed] mb-1">
                      Notas / Referencia <span className="text-[#99907c] font-normal">(Opcional)</span>
                    </label>
                    <input
                      type="text"
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      placeholder="Puntos de referencia, indicaciones para entrega"
                      className="w-full px-3 py-2 rounded-xl bg-[#13131b] border border-[#292932] text-xs text-[#e4e1ed] placeholder-[#99907c] focus:outline-none focus:border-[#f2ca50]"
                    />
                  </div>

                  {/* Actions for editing */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={cancelEditing}
                      className="flex-1 py-2.5 rounded-xl bg-[#13131b] hover:bg-[#292932] text-xs font-bold text-[#99907c] hover:text-[#e4e1ed] transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      id={`save-edit-btn-${place.id}`}
                      className="flex-1 py-2.5 rounded-xl bg-[#f2ca50] hover:bg-[#ffe088] text-[#13131b] text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-[#f2ca50]/20"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Guardar Cambios</span>
                    </button>
                  </div>
                </form>
              ) : (
                /* View Card */
                <div
                  key={place.id}
                  id={`interest-place-card-${place.id}`}
                  className="p-3.5 sm:p-4 rounded-2xl bg-[#1b1b23] border border-[#292932] hover:border-[#f2ca50]/40 transition-all space-y-3 shadow-sm group"
                >
                  {/* Header: Name + Action Buttons */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="w-8 h-8 rounded-xl bg-[#292932] group-hover:bg-[#f2ca50]/20 text-[#f2ca50] flex items-center justify-center shrink-0 transition-colors">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-sm text-[#e4e1ed] truncate">
                          {place.name}
                        </h4>
                        {place.notes && (
                          <p className="text-[10px] text-[#99907c] truncate">
                            {place.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => startEditing(place)}
                        id={`edit-place-btn-${place.id}`}
                        className="p-1.5 rounded-lg text-[#99907c] hover:text-[#f2ca50] hover:bg-[#292932] transition-colors"
                        title="Editar información de este sitio"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      {/* Copy Address */}
                      <button
                        type="button"
                        onClick={() => handleCopyAddress(place.id, place.address)}
                        className="p-1.5 rounded-lg text-[#99907c] hover:text-[#e4e1ed] hover:bg-[#292932] transition-colors"
                        title="Copiar dirección"
                      >
                        {copiedId === place.id ? (
                          <Check className="w-3.5 h-3.5 text-[#4edea3]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleDeletePlace(place.id)}
                        id={`delete-place-btn-${place.id}`}
                        className="p-1.5 rounded-lg text-[#99907c] hover:text-[#ffb4ab] hover:bg-[#292932] transition-colors"
                        title="Eliminar sitio"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Address Text */}
                  <div className="p-2.5 rounded-xl bg-[#13131b] border border-[#24242e] text-xs text-[#d0c5af] leading-relaxed select-all">
                    {place.address}
                  </div>

                  {/* Google Maps Action Button */}
                  <a
                    href={getGoogleMapsUrl(place.address)}
                    target="_blank"
                    rel="noopener noreferrer"
                    id={`open-gmaps-btn-${place.id}`}
                    className="w-full py-2.5 px-3 rounded-xl bg-[#292932] hover:bg-[#f2ca50] text-[#e4e1ed] hover:text-[#13131b] font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Abrir en Google Maps</span>
                    <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
                  </a>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#292932] bg-[#171720]">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-[#1b1b23] hover:bg-[#23232e] text-[#e4e1ed] text-xs font-bold transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
