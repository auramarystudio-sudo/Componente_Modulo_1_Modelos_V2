import React from 'react';
import type { Modelo, ModeloSD, ModeloLLM, ModeloVideo } from '../lib/demoData';
import { openExternalUrl } from '../lib/urlUtils';
import { getImageStyle } from './ImageSelector';

interface ModelCardProps {
  modelo: Modelo;
  onViewDetail: (modelo: Modelo) => void;
  onEdit: (modelo: Modelo) => void;
  onDelete: (id: string, categoria: string) => void;
  onToggleFavorite?: (id: string, categoria: string) => void;
  onDuplicate?: (modelo: Modelo) => void;
  onTagClick?: (tag: string) => void;
}

const categoriaConfig = {
  sd: { bg: 'from-slate-800 to-slate-900', border: 'border-slate-700 hover:border-blue-500/50', icon: '🧠', label: 'SD' },
  llm: { bg: 'from-green-950/40 to-slate-900', border: 'border-green-900/50 hover:border-green-500/50', icon: '💬', label: 'LLM' },
  video: { bg: 'from-purple-950/40 to-slate-900', border: 'border-purple-900/50 hover:border-purple-500/50', icon: '🎬', label: 'Video' },
};

const tipoBadgeColors: Record<string, string> = {
  checkpoint: 'bg-blue-500/20 border-blue-500/40 text-blue-300',
  lora: 'bg-green-500/20 border-green-500/40 text-green-300',
  vae: 'bg-orange-500/20 border-orange-500/40 text-orange-300',
  upscaler: 'bg-pink-500/20 border-pink-500/40 text-pink-300',
  controlnet: 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300',
  embedding: 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300',
  chat: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
  completion: 'bg-teal-500/20 border-teal-500/40 text-teal-300',
  code: 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300',
  vision: 'bg-violet-500/20 border-violet-500/40 text-violet-300',
  text_to_video: 'bg-purple-500/20 border-purple-500/40 text-purple-300',
  image_to_video: 'bg-fuchsia-500/20 border-fuchsia-500/40 text-fuchsia-300',
  video_to_video: 'bg-rose-500/20 border-rose-500/40 text-rose-300',
  animation: 'bg-amber-500/20 border-amber-500/40 text-amber-300',
};

function renderModelInfo(modelo: Modelo) {
  if (modelo.categoria === 'sd') {
    const m = modelo as ModeloSD;
    return (
      <div className="flex flex-wrap gap-1.5 mt-2">
        {m.sampler && <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-700/60 rounded text-xs text-slate-300">◈ {m.sampler}</span>}
        {m.steps > 0 && <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-700/60 rounded text-xs text-slate-300">◈ {m.steps} steps</span>}
        {m.cfg_scale > 0 && <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-700/60 rounded text-xs text-slate-300">◈ CFG {m.cfg_scale}</span>}
      </div>
    );
  }
  if (modelo.categoria === 'llm') {
    const m = modelo as ModeloLLM;
    return (
      <div className="flex flex-wrap gap-1.5 mt-2">
        {m.tamaño_parametros && <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-900/30 border border-green-800/30 rounded text-xs text-green-300">{m.tamaño_parametros}</span>}
        {m.cuantizacion && <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-900/30 border border-green-800/30 rounded text-xs text-green-300">{m.cuantizacion}</span>}
        {m.framework && <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-700/60 rounded text-xs text-slate-300">{m.framework}</span>}
      </div>
    );
  }
  if (modelo.categoria === 'video') {
    const m = modelo as ModeloVideo;
    return (
      <div className="flex flex-wrap gap-1.5 mt-2">
        {m.fps_recomendado > 0 && <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-900/30 border border-purple-800/30 rounded text-xs text-purple-300">{m.fps_recomendado} FPS</span>}
        {m.frames_totales > 0 && <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-900/30 border border-purple-800/30 rounded text-xs text-purple-300">{m.frames_totales} frames</span>}
        {m.resolucion && <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-700/60 rounded text-xs text-slate-300">{m.resolucion}</span>}
      </div>
    );
  }
  return null;
}

export default function ModelCard({ modelo, onViewDetail, onEdit, onDelete, onToggleFavorite, onDuplicate, onTagClick }: ModelCardProps) {
  const config = categoriaConfig[modelo.categoria];
  const badgeColor = tipoBadgeColors[modelo.tipo] || 'bg-slate-500/20 border-slate-500/40 text-slate-300';
  const descripcion = modelo.notas ? modelo.notas.substring(0, 80) + (modelo.notas.length > 80 ? '...' : '') : '';
  const urlCivitai = modelo.categoria === 'sd' ? (modelo as ModeloSD).url_civitai : '';
  const urlHuggingFace = modelo.categoria === 'sd' ? (modelo as ModeloSD).url_huggingface : modelo.categoria === 'llm' ? (modelo as ModeloLLM).url_huggingface : '';
  const tags = modelo.tags ? modelo.tags.split(',').map(t => t.trim()).filter(Boolean).slice(0, 3) : [];

  const handleDelete = () => {
    if (window.confirm(`¿Eliminar "${modelo.nombre}"? Esta acción no se puede deshacer.`)) {
      onDelete(modelo.id, modelo.categoria);
    }
  };

  return (
    <div className={`bg-gradient-to-br ${config.bg} border ${config.border} rounded-xl overflow-hidden transition-all duration-200 hover:shadow-lg group flex flex-col ${modelo.favorito ? 'ring-1 ring-amber-500/30' : ''}`}>
      {/* Imagen / Placeholder */}
      <div className="h-32 relative overflow-hidden flex items-center justify-center bg-slate-800/50 cursor-pointer" onClick={() => onViewDetail(modelo)}>
        {modelo.imagen_principal ? (
          <img src={modelo.imagen_principal} alt={modelo.nombre} className="w-full h-full" style={modelo.categoria === 'sd' ? getImageStyle((modelo as ModeloSD).posicion_imagen || 'center') : { objectFit: 'cover', objectPosition: 'center' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        ) : modelo.categoria === 'sd' && (modelo as ModeloSD).galeria_urls ? (
          <img src={(modelo as ModeloSD).galeria_urls.split('\n').filter(Boolean)[0]?.trim() || ''} alt={modelo.nombre} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        ) : (
          <span className="text-4xl opacity-30 group-hover:opacity-50 transition-opacity">{config.icon}</span>
        )}
        <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/50 backdrop-blur-sm rounded text-xs text-white/80 font-medium">{config.label}</span>
        <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-medium border ${badgeColor}`}>{modelo.tipo}</span>
        {modelo.categoria === 'sd' && (modelo as ModeloSD).galeria_urls && (modelo as ModeloSD).galeria_urls.split('\n').filter(Boolean).length > 0 && (
          <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded text-xs text-white/90 font-medium">🖼️ {(modelo as ModeloSD).galeria_urls.split('\n').filter(Boolean).length}</span>
        )}
        {/* Botón de favorito */}
        {onToggleFavorite && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(modelo.id, modelo.categoria); }}
            className={`absolute top-2 left-1/2 -translate-x-1/2 w-7 h-7 flex items-center justify-center rounded-full transition-all ${modelo.favorito ? 'bg-amber-500 text-white' : 'bg-black/50 text-slate-400 hover:text-amber-400'}`}
            title={modelo.favorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          >
            {modelo.favorito ? '★' : '☆'}
          </button>
        )}
      </div>

      {/* Contenido */}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="text-sm font-bold text-white truncate cursor-pointer" title={modelo.nombre} onClick={() => onViewDetail(modelo)}>{modelo.nombre}</h3>
        {descripcion && <p className="text-xs text-slate-400 mt-1 line-clamp-2">{descripcion}</p>}
        {renderModelInfo(modelo)}
        
        {/* Tags clickeables */}
        {tags.length > 0 && onTagClick && (
          <div className="flex flex-wrap gap-1 mt-2">
            {tags.map((tag, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); onTagClick(tag); }}
                className="px-1.5 py-0.5 bg-slate-700/50 hover:bg-cyan-600/30 border border-slate-600/50 hover:border-cyan-500/50 rounded text-xs text-slate-400 hover:text-cyan-300 transition-colors"
                title={`Filtrar por: ${tag}`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}

        <div className="mt-2 text-xs text-slate-500">
          {modelo.categoria === 'sd' && (modelo as ModeloSD).modelo_base && <span>Base: {(modelo as ModeloSD).modelo_base}</span>}
          {modelo.categoria === 'llm' && (modelo as ModeloLLM).creador && <span>Por: {(modelo as ModeloLLM).creador}</span>}
          {modelo.categoria === 'video' && (modelo as ModeloVideo).framework && <span>Framework: {(modelo as ModeloVideo).framework}</span>}
        </div>

        <div className="flex-1" />

        {/* Botones de acción */}
        <div className="flex gap-1 mt-3 pt-3 border-t border-slate-700/50">
          {urlCivitai && (
            <button onClick={(e) => { e.stopPropagation(); openExternalUrl(urlCivitai, 'Civitai'); }} className="flex-1 px-1 py-1.5 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-700/30 text-blue-300 text-xs font-medium rounded-lg transition-colors text-center" title={`Abrir en Civitai: ${urlCivitai}`}>🔗</button>
          )}
          {urlHuggingFace && (
            <button onClick={(e) => { e.stopPropagation(); openExternalUrl(urlHuggingFace, 'HuggingFace'); }} className="flex-1 px-1 py-1.5 bg-yellow-600/20 hover:bg-yellow-600/40 border border-yellow-700/30 text-yellow-300 text-xs font-medium rounded-lg transition-colors text-center" title={`Abrir en HuggingFace: ${urlHuggingFace}`}>🤗</button>
          )}
          {onDuplicate && (
            <button onClick={(e) => { e.stopPropagation(); onDuplicate(modelo); }} className="px-1.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-medium rounded-lg transition-colors" title="Duplicar modelo">📋</button>
          )}
          <button onClick={(e) => { e.stopPropagation(); onEdit(modelo); }} className="px-1.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-medium rounded-lg transition-colors" title="Editar modelo">✏️</button>
          <button onClick={(e) => { e.stopPropagation(); handleDelete(); }} className="px-1.5 py-1.5 bg-red-900/20 hover:bg-red-900/40 border border-red-800/30 text-red-400 text-xs font-medium rounded-lg transition-colors" title="Eliminar modelo">🗑️</button>
        </div>
      </div>
    </div>
  );
}
