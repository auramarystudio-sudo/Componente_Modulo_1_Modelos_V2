import React from 'react';
import type { Modelo } from '../lib/demoData';

interface StatsPanelProps {
  modelos: Modelo[];
  isOpen: boolean;
  onClose: () => void;
}

export default function StatsPanel({ modelos, isOpen, onClose }: StatsPanelProps) {
  if (!isOpen) return null;

  // Calcular estadísticas
  const totalModelos = modelos.length;
  const porCategoria = {
    sd: modelos.filter(m => m.categoria === 'sd').length,
    llm: modelos.filter(m => m.categoria === 'llm').length,
    video: modelos.filter(m => m.categoria === 'video').length,
  };

  const favoritos = modelos.filter(m => m.favorito).length;

  // Tipos más comunes
  const tiposCount: Record<string, number> = {};
  modelos.forEach(m => {
    tiposCount[m.tipo] = (tiposCount[m.tipo] || 0) + 1;
  });
  const topTipos = Object.entries(tiposCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Últimos agregados
  const ultimosAgregados = [...modelos]
    .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())
    .slice(0, 5);

  // Calcular porcentaje para gráficos
  const getPercentage = (value: number) => (value / totalModelos) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">📊 Panel de Estadísticas</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300">✕</button>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Resumen general */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
              <p className="text-xs text-slate-400 mb-1">Total Modelos</p>
              <p className="text-3xl font-bold text-white">{totalModelos}</p>
            </div>
            <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
              <p className="text-xs text-blue-400 mb-1">SD</p>
              <p className="text-3xl font-bold text-blue-300">{porCategoria.sd}</p>
            </div>
            <div className="bg-green-900/20 border border-green-700/30 rounded-lg p-4">
              <p className="text-xs text-green-400 mb-1">LLM</p>
              <p className="text-3xl font-bold text-green-300">{porCategoria.llm}</p>
            </div>
            <div className="bg-purple-900/20 border border-purple-700/30 rounded-lg p-4">
              <p className="text-xs text-purple-400 mb-1">Video</p>
              <p className="text-3xl font-bold text-purple-300">{porCategoria.video}</p>
            </div>
          </div>

          {/* Favoritos */}
          <div className="bg-amber-900/20 border border-amber-700/30 rounded-lg p-4">
            <p className="text-xs text-amber-400 mb-1">⭐ Favoritos</p>
            <p className="text-2xl font-bold text-amber-300">{favoritos} <span className="text-sm font-normal text-amber-400/70">({getPercentage(favoritos).toFixed(1)}%)</span></p>
          </div>

          {/* Distribución por categoría */}
          <div>
            <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wide mb-3">Distribución por Categoría</h3>
            <div className="space-y-2">
              {Object.entries(porCategoria).map(([cat, count]) => (
                <div key={cat} className="flex items-center gap-3">
                  <span className="text-sm text-slate-300 w-16 uppercase">{cat}</span>
                  <div className="flex-1 h-6 bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className={`h-full flex items-center justify-end pr-2 text-xs font-medium text-white transition-all ${
                        cat === 'sd' ? 'bg-blue-600' : cat === 'llm' ? 'bg-green-600' : 'bg-purple-600'
                      }`}
                      style={{ width: `${getPercentage(count)}%` }}
                    >
                      {count > 0 && count}
                    </div>
                  </div>
                  <span className="text-sm text-slate-400 w-12 text-right">{getPercentage(count).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top tipos */}
          <div>
            <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wide mb-3">Top 5 Tipos de Modelo</h3>
            <div className="space-y-2">
              {topTipos.map(([tipo, count]) => (
                <div key={tipo} className="flex items-center gap-3">
                  <span className="text-sm text-slate-300 w-32 truncate">{tipo}</span>
                  <div className="flex-1 h-4 bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-600 flex items-center justify-end pr-2 text-xs font-medium text-white"
                      style={{ width: `${getPercentage(count)}%` }}
                    >
                      {count}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Últimos agregados */}
          <div>
            <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wide mb-3">Últimos Agregados</h3>
            <div className="space-y-2">
              {ultimosAgregados.map(m => (
                <div key={m.id} className="flex items-center gap-3 bg-slate-900/50 border border-slate-700 rounded-lg p-3">
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    m.categoria === 'sd' ? 'bg-blue-600/20 text-blue-300' :
                    m.categoria === 'llm' ? 'bg-green-600/20 text-green-300' :
                    'bg-purple-600/20 text-purple-300'
                  }`}>
                    {m.categoria.toUpperCase()}
                  </span>
                  <span className="text-sm text-white flex-1 truncate">{m.nombre}</span>
                  <span className="text-xs text-slate-500">{new Date(m.created).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
