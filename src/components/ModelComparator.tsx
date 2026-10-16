import React, { useState } from 'react';
import { X, GitCompare } from 'lucide-react';
import type { Modelo, ModeloSD, ModeloLLM, ModeloVideo } from '../lib/demoData';

interface ModelComparatorProps {
  modelos: Modelo[];
  isOpen: boolean;
  onClose: () => void;
}

export default function ModelComparator({ modelos, isOpen, onClose }: ModelComparatorProps) {
  const [selectedModels, setSelectedModels] = useState<Modelo[]>([]);

  if (!isOpen) return null;

  const toggleModel = (modelo: Modelo) => {
    if (selectedModels.find(m => m.id === modelo.id)) {
      setSelectedModels(selectedModels.filter(m => m.id !== modelo.id));
    } else if (selectedModels.length < 4) {
      setSelectedModels([...selectedModels, modelo]);
    }
  };

  const renderModelDetails = (modelo: Modelo) => {
    const baseInfo = (
      <>
        <div className="text-xs text-slate-400 mb-2">{modelo.categoria.toUpperCase()} • {modelo.tipo}</div>
        <div className="text-sm text-slate-300 mb-4 line-clamp-2">{modelo.notas || 'Sin descripción'}</div>
      </>
    );

    if (modelo.categoria === 'sd') {
      const m = modelo as ModeloSD;
      return (
        <>
          {baseInfo}
          <div className="space-y-2 text-xs">
            <div><span className="text-slate-500">Base:</span> <span className="text-slate-300">{m.modelo_base}</span></div>
            <div><span className="text-slate-500">Sampler:</span> <span className="text-slate-300">{m.sampler || 'N/A'}</span></div>
            <div><span className="text-slate-500">Steps:</span> <span className="text-slate-300">{m.steps || 'N/A'}</span></div>
            <div><span className="text-slate-500">CFG:</span> <span className="text-slate-300">{m.cfg_scale || 'N/A'}</span></div>
            {m.prompt_referencia && (
              <div className="mt-3 pt-3 border-t border-slate-700/50">
                <div className="text-slate-500 mb-1">Prompt:</div>
                <div className="text-slate-300 text-xs line-clamp-3 font-mono">{m.prompt_referencia}</div>
              </div>
            )}
          </div>
        </>
      );
    }

    if (modelo.categoria === 'llm') {
      const m = modelo as ModeloLLM;
      return (
        <>
          {baseInfo}
          <div className="space-y-2 text-xs">
            <div><span className="text-slate-500">Framework:</span> <span className="text-slate-300">{m.framework}</span></div>
            <div><span className="text-slate-500">Parámetros:</span> <span className="text-slate-300">{m.tamaño_parametros || 'N/A'}</span></div>
            <div><span className="text-slate-500">Contexto:</span> <span className="text-slate-300">{m.contexto_maximo?.toLocaleString() || 'N/A'}</span></div>
            <div><span className="text-slate-500">Temp:</span> <span className="text-slate-300">{m.temperatura_default || 'N/A'}</span></div>
            {m.system_prompt_default && (
              <div className="mt-3 pt-3 border-t border-slate-700/50">
                <div className="text-slate-500 mb-1">System Prompt:</div>
                <div className="text-slate-300 text-xs line-clamp-3 font-mono">{m.system_prompt_default}</div>
              </div>
            )}
          </div>
        </>
      );
    }

    if (modelo.categoria === 'video') {
      const m = modelo as ModeloVideo;
      return (
        <>
          {baseInfo}
          <div className="space-y-2 text-xs">
            <div><span className="text-slate-500">Framework:</span> <span className="text-slate-300">{m.framework}</span></div>
            <div><span className="text-slate-500">FPS:</span> <span className="text-slate-300">{m.fps_recomendado || 'N/A'}</span></div>
            <div><span className="text-slate-500">Frames:</span> <span className="text-slate-300">{m.frames_totales || 'N/A'}</span></div>
            <div><span className="text-slate-500">Resolución:</span> <span className="text-slate-300">{m.resolucion || 'N/A'}</span></div>
          </div>
        </>
      );
    }

    return baseInfo;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-7xl max-h-[90vh] bg-slate-900 border border-slate-800/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col backdrop-blur-xl animate-fade-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/50 bg-slate-900/90 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
              <GitCompare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Comparador de Modelos
              </h2>
              <p className="text-xs text-slate-500">Selecciona 2-4 modelos para comparar</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {selectedModels.length === 0 ? (
            <div className="text-center py-12">
              <GitCompare className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 mb-2">Selecciona modelos para comparar</p>
              <p className="text-xs text-slate-500">Haz clic en las tarjetas de abajo para agregarlas</p>
            </div>
          ) : (
            <div className={`grid gap-4 mb-6 ${
              selectedModels.length === 1 ? 'grid-cols-1' :
              selectedModels.length === 2 ? 'grid-cols-1 md:grid-cols-2' :
              selectedModels.length === 3 ? 'grid-cols-1 md:grid-cols-3' :
              'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
            }`}>
              {selectedModels.map(modelo => (
                <div key={modelo.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 backdrop-blur-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-slate-100 mb-1">{modelo.nombre}</h3>
                      {modelo.version && <span className="text-xs text-cyan-400">v{modelo.version}</span>}
                    </div>
                    <button
                      onClick={() => toggleModel(modelo)}
                      className="p-1 rounded-lg bg-red-950/50 hover:bg-red-900/50 text-red-400 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  {modelo.imagen_principal && (
                    <div className="w-full h-32 rounded-lg overflow-hidden mb-3 bg-slate-900/50">
                      <img src={modelo.imagen_principal} alt={modelo.nombre} className="w-full h-full object-cover" />
                    </div>
                  )}
                  {renderModelDetails(modelo)}
                </div>
              ))}
            </div>
          )}

          <div className="border-t border-slate-800/50 pt-6">
            <h3 className="text-sm font-semibold text-slate-300 mb-4">Selecciona modelos para comparar ({selectedModels.length}/4)</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {modelos.map(modelo => {
                const isSelected = selectedModels.find(m => m.id === modelo.id);
                return (
                  <button
                    key={modelo.id}
                    onClick={() => toggleModel(modelo)}
                    disabled={!isSelected && selectedModels.length >= 4}
                    className={`p-3 rounded-xl border text-left transition ${
                      isSelected
                        ? 'bg-cyan-950/30 border-cyan-700/50'
                        : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600/50 disabled:opacity-50 disabled:cursor-not-allowed'
                    }`}
                  >
                    <div className="text-sm font-medium text-slate-100 mb-1 truncate">{modelo.nombre}</div>
                    <div className="text-xs text-slate-400">{modelo.categoria.toUpperCase()} • {modelo.tipo}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
