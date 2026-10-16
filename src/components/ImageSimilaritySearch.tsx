import React, { useState, useRef } from 'react';
import { X, Upload, Search, Image as ImageIcon } from 'lucide-react';
import type { Modelo, ModeloSD } from '../lib/demoData';

interface ImageSimilaritySearchProps {
  modelos: Modelo[];
  isOpen: boolean;
  onClose: () => void;
  onSelectModel: (modelo: Modelo) => void;
}

export default function ImageSimilaritySearch({ modelos, isOpen, onClose, onSelectModel }: ImageSimilaritySearchProps) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [similarModels, setSimilarModels] = useState<Modelo[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedImage(reader.result as string);
      searchSimilarModels();
    };
    reader.readAsDataURL(file);
  };

  const searchSimilarModels = () => {
    setIsSearching(true);
    
    // Simulación de búsqueda por similitud
    // En producción, esto usaría un servicio de embedding de imágenes
    setTimeout(() => {
      const sdModels = modelos.filter(m => m.categoria === 'sd' && (m as ModeloSD).galeria_urls);
      const shuffled = [...sdModels].sort(() => Math.random() - 0.5);
      setSimilarModels(shuffled.slice(0, 6));
      setIsSearching(false);
    }, 1500);
  };

  const resetSearch = () => {
    setUploadedImage(null);
    setSimilarModels([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col backdrop-blur-xl animate-fade-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/50 bg-slate-900/90 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
              <Search className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Búsqueda por Similitud
              </h2>
              <p className="text-xs text-slate-500">Sube una imagen para encontrar modelos similares</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {!uploadedImage ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 bg-slate-800/50 border border-slate-700/50 rounded-2xl flex items-center justify-center">
                <ImageIcon className="w-12 h-12 text-slate-600" />
              </div>
              <p className="text-slate-400 mb-4">Sube una imagen para buscar modelos similares</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium transition shadow-lg"
              >
                <Upload className="w-5 h-5" />
                Subir Imagen
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-300">Imagen de referencia</h3>
                <button
                  onClick={resetSearch}
                  className="text-xs text-cyan-400 hover:text-cyan-300 transition"
                >
                  Buscar otra imagen
                </button>
              </div>
              
              <div className="w-full h-48 rounded-xl overflow-hidden mb-6 bg-slate-800/50 border border-slate-700/50">
                <img src={uploadedImage} alt="Referencia" className="w-full h-full object-contain" />
              </div>

              {isSearching ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 mx-auto mb-4 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
                  <p className="text-slate-400">Buscando modelos similares...</p>
                </div>
              ) : similarModels.length > 0 ? (
                <div>
                  <h3 className="text-sm font-semibold text-slate-300 mb-4">Modelos similares encontrados ({similarModels.length})</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {similarModels.map((modelo, index) => (
                      <button
                        key={modelo.id}
                        onClick={() => {
                          onSelectModel(modelo);
                          onClose();
                        }}
                        className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 backdrop-blur-sm hover:border-cyan-500/50 transition text-left group"
                      >
                        <div className="flex items-start gap-3">
                          {modelo.imagen_principal && (
                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-900/50 flex-shrink-0">
                              <img src={modelo.imagen_principal} alt={modelo.nombre} className="w-full h-full object-cover" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs text-cyan-400 font-medium">#{index + 1}</span>
                              <h4 className="text-sm font-bold text-slate-100 truncate group-hover:text-cyan-400 transition">{modelo.nombre}</h4>
                            </div>
                            <div className="text-xs text-slate-400 mb-2">{modelo.categoria.toUpperCase()} • {modelo.tipo}</div>
                            <p className="text-xs text-slate-500 line-clamp-2">{modelo.notas || 'Sin descripción'}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-slate-400">No se encontraron modelos similares</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
