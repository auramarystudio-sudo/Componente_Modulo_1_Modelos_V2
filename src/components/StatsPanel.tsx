import React from 'react';
import { X, TrendingUp, Star, Calendar, BarChart3 } from 'lucide-react';
import type { Modelo } from '../lib/demoData';

interface StatsPanelProps {
  modelos: Modelo[];
  isOpen: boolean;
  onClose: () => void;
}

export default function StatsPanel({ modelos, isOpen, onClose }: StatsPanelProps) {
  if (!isOpen) return null;

  const totalModelos = modelos.length;
  const porCategoria = {
    sd: modelos.filter(m => m.categoria === 'sd').length,
    llm: modelos.filter(m => m.categoria === 'llm').length,
    video: modelos.filter(m => m.categoria === 'video').length,
  };

  const favoritos = modelos.filter(m => m.favorito).length;

  const tiposCount: Record<string, number> = {};
  modelos.forEach(m => {
    tiposCount[m.tipo] = (tiposCount[m.tipo] || 0) + 1;
  });
  const topTipos = Object.entries(tiposCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const ultimosAgregados = [...modelos]
    .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())
    .slice(0, 5);

  const getPercentage = (value: number) => (value / totalModelos) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col backdrop-blur-xl animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/50 bg-slate-900/90 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Panel de Estadísticas
              </h2>
              <p className="text-xs text-slate-500">Análisis completo de tu colección</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Resumen general */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <p className="text-xs font-medium text-slate-400">Total</p>
              </div>
              <p className="text-3xl font-bold text-slate-100">{totalModelos}</p>
            </div>
            <div className="bg-blue-950/30 border border-blue-800/30 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🧠</span>
                <p className="text-xs font-medium text-blue-400">SD</p>
              </div>
              <p className="text-3xl font-bold text-blue-300">{porCategoria.sd}</p>
            </div>
            <div className="bg-green-950/30 border border-green-800/30 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">💬</span>
                <p className="text-xs font-medium text-green-400">LLM</p>
              </div>
              <p className="text-3xl font-bold text-green-300">{porCategoria.llm}</p>
            </div>
            <div className="bg-purple-950/30 border border-purple-800/30 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🎬</span>
                <p className="text-xs font-medium text-purple-400">Video</p>
              </div>
              <p className="text-3xl font-bold text-purple-300">{porCategoria.video}</p>
            </div>
          </div>

          {/* Favoritos */}
          <div className="bg-amber-950/30 border border-amber-800/30 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <p className="text-xs font-medium text-amber-400">Favoritos</p>
            </div>
            <p className="text-2xl font-bold text-amber-300">{favoritos} <span className="text-sm font-normal text-amber-400/70">({getPercentage(favoritos).toFixed(1)}%)</span></p>
          </div>

          {/* Distribución por categoría */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm">
            <h3 className="text-sm font-semibold text-slate-300 mb-4">Distribución por Categoría</h3>
            <div className="space-y-3">
              {Object.entries(porCategoria).map(([cat, count]) => (
                <div key={cat} className="flex items-center gap-3">
                  <span className="text-sm text-slate-300 w-16 uppercase font-medium">{cat}</span>
                  <div className="flex-1 h-8 bg-slate-900/50 rounded-lg overflow-hidden border border-slate-700/50">
                    <div
                      className={`h-full flex items-center justify-end pr-3 text-xs font-bold text-white transition-all ${
                        cat === 'sd' ? 'bg-gradient-to-r from-blue-600 to-blue-500' : cat === 'llm' ? 'bg-gradient-to-r from-green-600 to-green-500' : 'bg-gradient-to-r from-purple-600 to-purple-500'
                      }`}
                      style={{ width: `${getPercentage(count)}%` }}
                    >
                      {count > 0 && count}
                    </div>
                  </div>
                  <span className="text-sm text-slate-400 w-12 text-right font-medium">{getPercentage(count).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top tipos */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm">
            <h3 className="text-sm font-semibold text-slate-300 mb-4">Top 5 Tipos de Modelo</h3>
            <div className="space-y-3">
              {topTipos.map(([tipo, count]) => (
                <div key={tipo} className="flex items-center gap-3">
                  <span className="text-sm text-slate-300 w-32 truncate font-medium">{tipo}</span>
                  <div className="flex-1 h-6 bg-slate-900/50 rounded-lg overflow-hidden border border-slate-700/50">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-600 to-cyan-500 flex items-center justify-end pr-3 text-xs font-bold text-white"
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
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-semibold text-slate-300">Últimos Agregados</h3>
            </div>
            <div className="space-y-2">
              {ultimosAgregados.map(m => (
                <div key={m.id} className="flex items-center gap-3 bg-slate-900/50 border border-slate-700/50 rounded-lg p-3 backdrop-blur-sm hover:border-slate-600/50 transition">
                  <span className={`text-xs px-2 py-1 rounded-md font-medium ${
                    m.categoria === 'sd' ? 'bg-blue-950/50 text-blue-300 border border-blue-800/30' :
                    m.categoria === 'llm' ? 'bg-green-950/50 text-green-300 border border-green-800/30' :
                    'bg-purple-950/50 text-purple-300 border border-purple-800/30'
                  }`}>
                    {m.categoria.toUpperCase()}
                  </span>
                  <span className="text-sm text-slate-200 flex-1 truncate font-medium">{m.nombre}</span>
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
