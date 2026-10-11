// Componente ImageCarousel - Carrusel de imágenes con soporte para swipe
// Permite navegar con flechas del mouse, teclado y gestos táctiles

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface ImageCarouselProps {
  images: string[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function ImageCarousel({ images, initialIndex = 0, isOpen, onClose }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Navegación con teclado
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, images.length]);

  // Resetear índice cuando cambia initialIndex
  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  // Handlers para touch/swipe
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrevious();
    }
  };

  if (!isOpen || images.length === 0) return null;

  const carouselContent = (
    <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-sm flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-black/50">
        <div className="text-white">
          <h3 className="text-lg font-semibold">Galería de Imágenes</h3>
          <p className="text-sm text-slate-400">
            Imagen {currentIndex + 1} de {images.length}
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Carrusel principal */}
      <div
        ref={carouselRef}
        className="flex-1 flex items-center justify-center relative overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Botón anterior */}
        <button
          onClick={goToPrevious}
          className="absolute left-4 z-10 w-12 h-12 flex items-center justify-center rounded-full bg-slate-800/80 hover:bg-slate-700 text-white text-2xl transition-all hover:scale-110"
          aria-label="Imagen anterior"
        >
          ←
        </button>

        {/* Imagen actual */}
        <div className="max-w-full max-h-full flex items-center justify-center px-20">
          <img
            key={currentIndex}
            src={images[currentIndex]}
            alt={`Imagen ${currentIndex + 1}`}
            className="max-w-full max-h-[calc(100vh-200px)] object-contain rounded-lg shadow-2xl"
            style={{ animation: 'fadeIn 0.3s ease-in-out' }}
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

      {/* Footer con thumbnails */}
      <div className="bg-black/50 px-6 py-4">
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
                src={url}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return createPortal(carouselContent, document.body);
}
