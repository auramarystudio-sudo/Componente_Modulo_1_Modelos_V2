import React, { useState } from 'react';
import { GripVertical, Trash2, Image as ImageIcon } from 'lucide-react';

interface DragDropGalleryProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  onSetMainImage?: (imageUrl: string) => void;
  mainImage?: string;
}

export default function DragDropGallery({ images, onImagesChange, onSetMainImage, mainImage }: DragDropGalleryProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newImages = [...images];
    const [draggedItem] = newImages.splice(draggedIndex, 1);
    newImages.splice(dropIndex, 0, draggedItem);
    
    onImagesChange(newImages);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDelete = (index: number) => {
    if (window.confirm('¿Eliminar esta imagen de la galería?')) {
      const newImages = images.filter((_, i) => i !== index);
      onImagesChange(newImages);
    }
  };

  const handleSetAsMain = (imageUrl: string) => {
    if (onSetMainImage) {
      onSetMainImage(imageUrl);
    }
  };

  if (images.length === 0) {
    return (
      <div className="border border-slate-700/50 rounded-xl p-8 text-center bg-slate-800/50 backdrop-blur-sm">
        <ImageIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <p className="text-slate-400 text-sm">No hay imágenes en la galería</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-slate-300">
          🖼️ Galería ({images.length} imágenes)
        </h4>
        <p className="text-xs text-slate-500">Arrastra para reordenar • Arrastra al top para imagen principal</p>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
        {images.map((url, index) => {
          const isMainImage = mainImage === url;
          const isDragged = draggedIndex === index;
          const isDragOver = dragOverIndex === index;

          return (
            <div
              key={`${url}-${index}`}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={`group relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 cursor-move ${
                isDragged
                  ? 'opacity-50 scale-95'
                  : isDragOver
                  ? 'border-cyan-500 scale-105 shadow-lg shadow-cyan-500/30'
                  : isMainImage
                  ? 'border-amber-500 shadow-lg shadow-amber-500/30'
                  : 'border-slate-700/50 hover:border-slate-600/50'
              } bg-slate-800/50 backdrop-blur-sm`}
            >
              <img
                src={url}
                alt={`Imagen ${index + 1}`}
                className="w-full h-full object-cover"
                draggable={false}
              />

              {/* Handle de arrastre */}
              <div className="absolute top-1 left-1 p-1 bg-slate-900/80 backdrop-blur-sm rounded-md opacity-0 group-hover:opacity-100 transition cursor-move">
                <GripVertical className="w-4 h-4 text-slate-300" />
              </div>

              {/* Badge de imagen principal */}
              {isMainImage && (
                <div className="absolute top-1 right-1 px-2 py-1 bg-amber-500/90 backdrop-blur-sm rounded-md text-xs text-white font-medium">
                  ★ Principal
                </div>
              )}

              {/* Número de imagen */}
              <div className="absolute bottom-1 left-1 px-2 py-1 bg-slate-900/80 backdrop-blur-sm rounded-md text-xs text-slate-200 font-medium">
                {index + 1}
              </div>

              {/* Overlay con acciones */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-200 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                {onSetMainImage && !isMainImage && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSetAsMain(url);
                    }}
                    className="p-2 bg-amber-600/80 hover:bg-amber-600 text-white rounded-lg transition shadow-lg backdrop-blur-sm"
                    title="Establecer como imagen principal"
                  >
                    ★
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(index);
                  }}
                  className="p-2 bg-red-600/80 hover:bg-red-600 text-white rounded-lg transition shadow-lg backdrop-blur-sm"
                  title="Eliminar imagen"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
