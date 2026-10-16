import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Trash2 } from 'lucide-react';

interface EditableGalleryProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  title?: string;
  emptyMessage?: string;
}

export default function EditableGallery({ 
  images, 
  onImagesChange, 
  title = "Galería de Imágenes",
  emptyMessage = "No hay imágenes en la galería"
}: EditableGalleryProps) {
  const [imageToDelete, setImageToDelete] = useState<number | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleDeleteClick = (index: number) => {
    setImageToDelete(index);
    setTimeout(() => setShowConfirmModal(true), 10);
  };

  const handleDeleteConfirm = () => {
    if (imageToDelete !== null) {
      const newImages = images.filter((_, index) => index !== imageToDelete);
      onImagesChange(newImages);
      setImageToDelete(null);
      setShowConfirmModal(false);
    }
  };

  const handleDeleteCancel = () => {
    setImageToDelete(null);
    setShowConfirmModal(false);
  };

  if (images.length === 0) {
    return (
      <div className="border border-slate-700/50 rounded-xl p-6 text-center bg-slate-800/50 backdrop-blur-sm">
        <p className="text-slate-400 text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-slate-300">
          🖼️ {title}
          <span className="ml-2 text-xs text-slate-500 font-normal">({images.length} {images.length === 1 ? 'imagen' : 'imágenes'})</span>
        </h4>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
        {images.map((url, index) => (
          <div key={index} className="group relative aspect-square bg-slate-800/50 border border-slate-700/50 rounded-lg overflow-hidden hover:border-cyan-500/50 transition-all duration-300 backdrop-blur-sm">
            <img src={url} alt={`Imagen ${index + 1}`} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClick(index);
                }}
                className="p-2 bg-red-600/80 hover:bg-red-600 text-white rounded-lg transition shadow-lg backdrop-blur-sm"
                title="Eliminar imagen"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="absolute bottom-1 left-1 px-2 py-1 bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-md text-xs text-slate-200 font-medium">{index + 1}</div>
          </div>
        ))}
      </div>

      {showConfirmModal && imageToDelete !== null && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={(e) => { e.stopPropagation(); handleDeleteCancel(); }} />
          <div className="relative bg-slate-900 border border-slate-800/50 rounded-2xl p-6 max-w-md w-full shadow-2xl backdrop-blur-xl animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-100 mb-3">Confirmar eliminación</h3>
            <p className="text-sm text-slate-400 mb-6">¿Estás seguro de que deseas eliminar esta imagen de la galería?</p>
            <div className="flex gap-3 justify-end">
              <button onClick={(e) => { e.stopPropagation(); handleDeleteCancel(); }} className="px-4 py-2 bg-slate-800/50 hover:bg-slate-800 text-slate-300 rounded-lg transition">Cancelar</button>
              <button onClick={(e) => { e.stopPropagation(); handleDeleteConfirm(); }} className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition shadow-lg">
                <Trash2 className="w-4 h-4" />
                Eliminar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
