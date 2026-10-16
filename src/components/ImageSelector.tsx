import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ImageSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  currentImage: string;
  currentPosition: string;
  onSelect: (imageUrl: string, position: string) => void;
}

const POSICIONES = [
  { value: 'stretch', label: '⤢ Estirar' },
  { value: 'top-landing', label: '↑ Top Landing' },
  { value: 'center-landing', label: '● Center Landing' },
  { value: 'mid-landing', label: '◐ Mid Landing' },
  { value: 'bottom-landing', label: '↓ Bottom Landing' },
  { value: 'top-10', label: '↑10%' },
  { value: 'top-25', label: '↑25%' },
  { value: 'top-40', label: '↑40%' },
  { value: 'top-60', label: '↓40%' },
  { value: 'top-75', label: '↓25%' },
  { value: 'top-90', label: '↓10%' },
  { value: 'top', label: '↑ Arriba' },
  { value: 'center', label: '● Centro' },
  { value: 'bottom', label: '↓ Abajo' },
  { value: 'left', label: '← Izquierda' },
  { value: 'right', label: '→ Derecha' },
  { value: 'top left', label: '↖ Sup. Izq.' },
  { value: 'top right', label: '↗ Sup. Der.' },
  { value: 'bottom left', label: '↙ Inf. Izq.' },
  { value: 'bottom right', label: '↘ Inf. Der.' },
];

export function getImageStyle(position: string): React.CSSProperties {
  if (position === 'stretch') {
    return { objectFit: 'fill' };
  }
  if (position.endsWith('-landing')) {
    return { objectFit: 'contain', backgroundColor: 'transparent' };
  }
  if (position.startsWith('top-')) {
    const percent = position.split('-')[1];
    return { objectFit: 'cover', objectPosition: `center ${percent}%` };
  }
  return { objectFit: 'cover', objectPosition: position };
}

export default function ImageSelector({
  isOpen,
  onClose,
  images,
  currentImage,
  currentPosition,
  onSelect,
}: ImageSelectorProps) {
  const [selectedImage, setSelectedImage] = useState(currentImage);
  const [selectedPosition, setSelectedPosition] = useState(currentPosition || 'center');

  useEffect(() => {
    if (isOpen) {
      setSelectedImage(currentImage);
      setSelectedPosition(currentPosition || 'center');
    }
  }, [isOpen, currentImage, currentPosition]);

  if (!isOpen) return null;

  const handleSelect = () => {
    if (selectedImage) {
      onSelect(selectedImage, selectedPosition);
      onClose();
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-slate-900 border border-slate-800/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col backdrop-blur-xl animate-fade-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/50 bg-slate-900/90 backdrop-blur-xl">
          <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">🖼️ Seleccionar Imagen Principal</h2>
          <button onClick={onClose} className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-300 mb-4">Galería ({images.length} imágenes)</h3>
              {images.length === 0 ? (
                <div className="p-8 bg-slate-800/50 border border-slate-700/50 rounded-xl text-center backdrop-blur-sm">
                  <p className="text-slate-400">No hay imágenes en la galería</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-2">
                  {images.map((url, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(url)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === url ? 'border-cyan-500 scale-105 shadow-lg shadow-cyan-500/30' : 'border-slate-700/50 hover:border-slate-600/50'
                      }`}
                    >
                      <img src={url} alt={`Imagen ${index + 1}`} className="w-full h-full object-cover" />
                      {selectedImage === url && (
                        <div className="absolute inset-0 bg-cyan-500/20 flex items-center justify-center backdrop-blur-sm">
                          <span className="text-3xl text-white">✓</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-300 mb-4">Preview y Posición</h3>
              <div className="mb-4">
                <p className="text-xs text-slate-400 mb-2">Así se verá en la tarjeta:</p>
                <div className="w-full max-w-[280px] bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden backdrop-blur-sm">
                  <div className="h-32 relative overflow-hidden bg-slate-900/50">
                    {selectedImage ? (
                      <img src={selectedImage} alt="Preview" className="w-full h-full" style={getImageStyle(selectedPosition)} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl opacity-30">📷</div>
                    )}
                  </div>
                </div>
              </div>
              {selectedImage && (
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 backdrop-blur-sm">
                  <p className="text-xs text-slate-400 mb-3">Ajusta la posición:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {POSICIONES.map((pos) => (
                      <button
                        key={pos.value}
                        onClick={() => setSelectedPosition(pos.value)}
                        className={`px-3 py-2 text-xs rounded-lg transition ${
                          selectedPosition === pos.value ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg' : 'bg-slate-900/50 text-slate-300 hover:bg-slate-800/50 border border-slate-700/50'
                        }`}
                      >
                        {pos.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-800/50 bg-slate-900/90 backdrop-blur-xl">
          <button onClick={onClose} className="px-4 py-2 bg-slate-800/50 hover:bg-slate-800 text-slate-300 font-medium rounded-lg transition">Cancelar</button>
          <button onClick={handleSelect} disabled={!selectedImage} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 text-white text-sm font-medium transition shadow-lg">
            ✓ Seleccionar
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
