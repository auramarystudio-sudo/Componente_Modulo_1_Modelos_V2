// Componente ImageGallery - Galería de imágenes con modal y carrusel
// Muestra miniaturas completas y permite navegar en modal

import React, { useState, useEffect } from 'react';

interface ImageGalleryProps {
  images: string[];
  title?: string;
  columns?: number;
  thumbnailHeight?: string;
}

export default function ImageGallery({ 
  images, 
  title = 'Galería', 
  columns = 4,
  thumbnailHeight = 'h-40'
}: ImageGalleryProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Navegación con teclado
  useEffect(() => {
    if (!modalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setModalOpen(false);
      } else if (e.key === 'ArrowLeft') {
        setCurrentIndex(prev => (prev > 0 ? prev - 1 : images.length - 1));
      } else if (e.key === 'ArrowRight') {
        setCurrentIndex(prev => (prev < images.length - 1 ? prev + 1 : 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalOpen, images.length]);

  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    if (modalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [modalOpen]);

  const openModal = (index: number) => {
    setCurrentIndex(index);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const goToPrevious = () => {
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const goToNext = () => {
    setCurrentIndex(prev => (prev < images.length - 1 ? prev + 1 : 0));
  };

  if (images.length === 0) return null;

  // Determinar clases de grid según columnas
  const gridClasses = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 sm:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5',
    6: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6',
  }[columns] || 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4';

  return (
    <>
      {/* Galería de miniaturas */}
      <div>
        <h4 className="text-sm font-semibold text-cyan-400 uppercase tracking-wide mb-3">
          🖼️ {title}
          <span className="ml-2 text-xs text-slate-400 font-normal">
            ({images.length} {images.length === 1 ? 'imagen' : 'imágenes'})
          </span>
        </h4>
        <div className={`grid ${gridClasses} gap-3`}>
          {images.map((url, index) => (
            <div
              key={index}
              className="group relative cursor-pointer"
              onClick={() => openModal(index)}
            >
              <div className={`${thumbnailHeight} bg-slate-900 border border-slate-700 rounded-lg overflow-hidden hover:border-cyan-500/50 transition-all duration-200 hover:shadow-lg hover:shadow-cyan-500/10`}>
                <img
                  src={url.trim()}
                  alt={`${title} ${index + 1}`}
                  className="w-full h-full object-contain"
                  loading="lazy"
                  onError={(e) => {
                    const parent = (e.target as HTMLImageElement).parentElement;
                    if (parent) {
                      parent.innerHTML = '<div class="w-full h-full flex items-center justify-center text-slate-600 text-2xl">❌</div>';
                    }
                  }}
                />
              </div>
              {/* Overlay con zoom */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                  <span className="text-white text-xl">🔍</span>
                </div>
              </div>
              {/* Número de imagen */}
              <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded text-xs text-white/90">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal con carrusel */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/95 backdrop-blur-sm"
            onClick={closeModal}
          />

          {/* Contenido del modal */}
          <div className="relative w-full h-full flex flex-col">
            {/* Header */}
            <div className="relative z-10 flex items-center justify-between px-6 py-4 bg-black/50">
              <div className="text-white">
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="text-sm text-slate-400">
                  Imagen {currentIndex + 1} de {images.length}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Imagen principal */}
            <div className="flex-1 flex items-center justify-center px-4 py-6 relative">
              {/* Botón anterior */}
              <button
                onClick={goToPrevious}
                className="absolute left-4 z-10 w-12 h-12 flex items-center justify-center rounded-full bg-slate-800/80 hover:bg-slate-700 text-white text-2xl transition-all hover:scale-110"
                aria-label="Imagen anterior"
              >
                ←
              </button>

              {/* Imagen */}
              <div className="max-w-full max-h-full flex items-center justify-center">
                <img
                  key={currentIndex}
                  src={images[currentIndex].trim()}
                  alt={`${title} ${currentIndex + 1}`}
                  className="max-w-full max-h-[calc(100vh-200px)] object-contain rounded-lg shadow-2xl animate-fade-in"
                  style={{ animation: 'fadeIn 0.3s ease-in-out' }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%231e293b" width="400" height="300"/%3E%3Ctext fill="%2364748b" font-size="20" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EError al cargar%3C/text%3E%3C/svg%3E';
                  }}
                />
              </div>

              {/* Botón siguiente */}
              <button
                onClick={goToNext}
                className="absolute right-4 z-10 w-12 h-12 flex items-center justify-center rounded-full bg-slate-800/80 hover:bg-slate-700 text-white text-2xl transition-all hover:scale-110"
                aria-label="Imagen siguiente"
              >
                →
              </button>
            </div>

            {/* Footer con thumbnails y barra de progreso */}
            <div className="relative z-10 bg-black/50 px-6 py-4">
              {/* Barra de progreso */}
              <div className="mb-3 flex items-center gap-3">
                <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300 ease-out"
                    style={{ width: `${((currentIndex + 1) / images.length) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-slate-400 font-mono">
                  {currentIndex + 1}/{images.length}
                </span>
              </div>
              
              {/* Thumbnails */}
              <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2">
                {images.map((url, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                      index === currentIndex
                        ? 'border-cyan-500 scale-110 shadow-lg shadow-cyan-500/30'
                        : 'border-slate-700 hover:border-slate-500 opacity-60 hover:opacity-100 hover:scale-105'
                    }`}
                  >
                    <img
                      src={url.trim()}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
