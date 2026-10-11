import React, { useState } from 'react';
import { createPortal } from 'react-dom';

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
    // Pequeño delay para evitar que el click se propague al overlay
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
      <div className="border border-slate-700 rounded-lg p-6 text-center">
        <p className="text-slate-400 text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-cyan-400 uppercase tracking-wide">
          🖼️ {title}
          <span className="ml-2 text-xs text-slate-400 font-normal">
            ({images.length} {images.length === 1 ? 'imagen' : 'imágenes'})
          </span>
        </h4>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
        {images.map((url, index) => (
          <div
            key={index}
            className="group relative aspect-square bg-slate-900 border border-slate-700 rounded-lg overflow-hidden hover:border-cyan-500/50 transition-all duration-200"
          >
            <img
              src={url}
              alt={`Imagen ${index + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                const parent = (e.target as HTMLImageElement).parentElement;
                if (parent) {
                  parent.innerHTML = '<div class="w-full h-full flex items-center justify-center text-slate-600 text-2xl">❌</div>';
                }
              }}
            />
            
            {/* Overlay con botón de eliminar */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClick(index);
                }}
                className="bg-red-600 hover:bg-red-700 text-white rounded-full p-2 transition-colors shadow-lg"
                title="Eliminar imagen"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Número de imagen */}
            <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/60 backdrop-blur-sm rounded text-xs text-white/90">
              {index + 1}
            </div>
          </div>
        ))}
      </div>

      {/* Modal de confirmación - usando Portal para evitar conflictos */}
      {showConfirmModal && imageToDelete !== null && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteCancel();
            }}
          />
          <div className="relative bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-white mb-3">
              Confirmar eliminación
            </h3>
            <p className="text-slate-300 mb-6">
              ¿Estás seguro de que deseas eliminar esta imagen de la galería?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteCancel();
                }}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteConfirm();
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
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
