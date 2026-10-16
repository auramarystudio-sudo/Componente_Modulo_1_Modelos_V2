import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

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

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
      else if (e.key === 'ArrowRight') setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, images.length]);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

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
    if (isLeftSwipe) setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    else if (isRightSwipe) setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  if (!isOpen || images.length === 0) return null;

  const carouselContent = (
    <div className="fixed inset-0 z-[9999] bg-slate-950/95 backdrop-blur-xl flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/50 bg-slate-900/90 backdrop-blur-xl">
        <div>
          <h3 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Galería de Imágenes</h3>
          <p className="text-sm text-slate-500">Imagen {currentIndex + 1} de {images.length}</p>
        </div>
        <button onClick={onClose} className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white transition">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div ref={carouselRef} className="flex-1 flex items-center justify-center relative overflow-hidden" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
        <button onClick={() => setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))} className="absolute left-4 z-10 p-3 rounded-full bg-slate-800/80 hover:bg-slate-700 text-white backdrop-blur-sm border border-slate-700/50 transition shadow-lg">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="max-w-full max-h-full flex items-center justify-center px-20">
          <img key={currentIndex} src={images[currentIndex]} alt={`Imagen ${currentIndex + 1}`} className="max-w-full max-h-[calc(100vh-200px)] object-contain rounded-xl shadow-2xl animate-fade-in" />
        </div>
        <button onClick={() => setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))} className="absolute right-4 z-10 p-3 rounded-full bg-slate-800/80 hover:bg-slate-700 text-white backdrop-blur-sm border border-slate-700/50 transition shadow-lg">
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
      <div className="border-t border-slate-800/50 bg-slate-900/90 backdrop-blur-xl px-6 py-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex-1 h-1.5 bg-slate-800/50 rounded-full overflow-hidden border border-slate-700/50">
            <div className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-300 ease-out" style={{ width: `${((currentIndex + 1) / images.length) * 100}%` }} />
          </div>
          <span className="text-sm text-slate-400 font-mono font-medium">{currentIndex + 1}/{images.length}</span>
        </div>
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2">
          {images.map((url, index) => (
            <button key={index} onClick={() => setCurrentIndex(index)} className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-300 ${index === currentIndex ? 'border-cyan-500 scale-110 shadow-lg shadow-cyan-500/30' : 'border-slate-700/50 hover:border-slate-600/50 opacity-60 hover:opacity-100'}`}>
              <img src={url} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return createPortal(carouselContent, document.body);
}
