import React, { useState } from 'react';
import { X, LayoutDashboard, TrendingUp, Star, Calendar, BarChart3, Settings } from 'lucide-react';
import type { Modelo } from '../lib/demoData';

interface DashboardProps {
  modelos: Modelo[];
  isOpen: boolean;
  onClose: () => void;
}

type WidgetType = 'stats' | 'favorites' | 'recent' | 'categories' | 'chart';

interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  icon: React.ReactNode;
}

export default function Dashboard({ modelos, isOpen, onClose }: DashboardProps) {
  const [widgets, setWidgets] = useState<Widget[]>([
    { id: '1', type: 'stats', title: 'Estadísticas', icon: <TrendingUp className="w-5 h-5" /> },
    { id: '2', type: 'favorites', title: 'Favoritos', icon: <Star className="w-5 h-5" /> },
    { id: '3', type: 'recent', title: 'Recientes', icon: <Calendar className="w-5 h-5" /> },
    { id: '4', type: 'categories', title: 'Categorías', icon: <BarChart3 className="w-5 h-5" /> },
  ]);

  const [showSettings, setShowSettings] = useState(false);

  if (!isOpen) return null;

  const availableWidgets: Widget[] = [
    { id: 'stats', type: 'stats', title: 'Estadísticas', icon: <TrendingUp className="w-5 h-5" /> },
    { id: 'favorites', type: 'favorites', title: 'Favoritos', icon: <Star className="w-5 h-5" /> },
    { id: 'recent', type: 'recent', title: 'Recientes', icon: <Calendar className="w-5 h-5" /> },
    { id: 'categories', type: 'categories', title: 'Categorías', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'chart', type: 'chart', title: 'Gráfico', icon: <BarChart3 className="w-5 h-5" /> },
  ];

  const addWidget = (widget: Widget) => {
    if (!widgets.find(w => w.type === widget.type)) {
      setWidgets([...widgets, { ...widget, id: Date.now().toString() }]);
    }
  };

  const removeWidget = (id: string) => {
    setWidgets(widgets.filter(w => w.id !== id));
  };

  const renderWidget = (widget: Widget) => {
    switch (widget.type) {
      case 'stats':
        return <StatsWidget modelos={modelos} />;
      case 'favorites':
        return <FavoritesWidget modelos={modelos} />;
      case 'recent':
        return <RecentWidget modelos={modelos} />;
      case 'categories':
        return <CategoriesWidget modelos={modelos} />;
      case 'chart':
        return <ChartWidget modelos={modelos} />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-7xl max-h-[90vh] bg-slate-900 border border-slate-800/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col backdrop-blur-xl animate-fade-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/50 bg-slate-900/90 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Dashboard Personalizable
              </h2>
              <p className="text-xs text-slate-500">Organiza tus widgets como prefieras</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-lg transition ${showSettings ? 'bg-indigo-950/50 text-indigo-400' : 'bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white'}`}
            >
              <Settings className="w-5 h-5" />
            </button>
            <button onClick={onClose} className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white transition">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {showSettings && (
            <div className="mb-6 bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 backdrop-blur-sm">
              <h3 className="text-sm font-semibold text-slate-300 mb-3">Agregar Widget</h3>
              <div className="flex flex-wrap gap-2">
                {availableWidgets.map(widget => {
                  const isAdded = widgets.find(w => w.type === widget.type);
                  return (
                    <button
                      key={widget.id}
                      onClick={() => addWidget(widget)}
                      disabled={!!isAdded}
                      className="flex items-center gap-2 px-3 py-2 bg-slate-900/50 border border-slate-700/50 rounded-lg text-sm text-slate-300 hover:border-indigo-500/50 hover:text-indigo-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {widget.icon}
                      {widget.title}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {widgets.map(widget => (
              <div key={widget.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="text-indigo-400">{widget.icon}</div>
                    <h3 className="text-sm font-semibold text-slate-300">{widget.title}</h3>
                  </div>
                  <button
                    onClick={() => removeWidget(widget.id)}
                    className="p-1 rounded-lg bg-red-950/50 hover:bg-red-900/50 text-red-400 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {renderWidget(widget)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsWidget({ modelos }: { modelos: Modelo[] }) {
  const total = modelos.length;
  const sd = modelos.filter(m => m.categoria === 'sd').length;
  const llm = modelos.filter(m => m.categoria === 'llm').length;
  const video = modelos.filter(m => m.categoria === 'video').length;

  return (
    <div className="space-y-3">
      <div className="text-3xl font-bold text-slate-100">{total}</div>
      <div className="text-xs text-slate-400">Total de modelos</div>
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-700/50">
        <div className="text-center">
          <div className="text-lg font-bold text-blue-400">{sd}</div>
          <div className="text-xs text-slate-500">SD</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-green-400">{llm}</div>
          <div className="text-xs text-slate-500">LLM</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-purple-400">{video}</div>
          <div className="text-xs text-slate-500">Video</div>
        </div>
      </div>
    </div>
  );
}

function FavoritesWidget({ modelos }: { modelos: Modelo[] }) {
  const favorites = modelos.filter(m => m.favorito).slice(0, 5);

  return (
    <div className="space-y-2">
      {favorites.length === 0 ? (
        <p className="text-xs text-slate-500 text-center py-4">No hay favoritos</p>
      ) : (
        favorites.map(modelo => (
          <div key={modelo.id} className="flex items-center gap-2 p-2 bg-slate-900/50 rounded-lg">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-slate-200 truncate">{modelo.nombre}</div>
              <div className="text-xs text-slate-500">{modelo.categoria.toUpperCase()}</div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function RecentWidget({ modelos }: { modelos: Modelo[] }) {
  const recent = [...modelos]
    .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-2">
      {recent.map(modelo => (
        <div key={modelo.id} className="flex items-center gap-2 p-2 bg-slate-900/50 rounded-lg">
          <Calendar className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-slate-200 truncate">{modelo.nombre}</div>
            <div className="text-xs text-slate-500">{new Date(modelo.created).toLocaleDateString()}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function CategoriesWidget({ modelos }: { modelos: Modelo[] }) {
  const categories = {
    checkpoint: modelos.filter(m => m.categoria === 'sd' && m.tipo === 'checkpoint').length,
    lora: modelos.filter(m => m.categoria === 'sd' && m.tipo === 'lora').length,
    chat: modelos.filter(m => m.categoria === 'llm' && m.tipo === 'chat').length,
    video: modelos.filter(m => m.categoria === 'video').length,
  };

  return (
    <div className="space-y-2">
      {Object.entries(categories).map(([category, count]) => (
        <div key={category} className="flex items-center justify-between p-2 bg-slate-900/50 rounded-lg">
          <span className="text-xs text-slate-300 capitalize">{category}</span>
          <span className="text-sm font-bold text-slate-100">{count}</span>
        </div>
      ))}
    </div>
  );
}

function ChartWidget({ modelos }: { modelos: Modelo[] }) {
  const total = modelos.length;
  const sd = modelos.filter(m => m.categoria === 'sd').length;
  const llm = modelos.filter(m => m.categoria === 'llm').length;
  const video = modelos.filter(m => m.categoria === 'video').length;

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">SD</span>
          <span className="text-slate-300">{sd}/{total}</span>
        </div>
        <div className="h-2 bg-slate-900/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-blue-500 transition-all"
            style={{ width: `${(sd / total) * 100}%` }}
          />
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">LLM</span>
          <span className="text-slate-300">{llm}/{total}</span>
        </div>
        <div className="h-2 bg-slate-900/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-600 to-green-500 transition-all"
            style={{ width: `${(llm / total) * 100}%` }}
          />
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">Video</span>
          <span className="text-slate-300">{video}/{total}</span>
        </div>
        <div className="h-2 bg-slate-900/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-600 to-purple-500 transition-all"
            style={{ width: `${(video / total) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
