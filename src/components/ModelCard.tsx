import React from 'react';
import { Star, Copy, Edit, Trash2, ExternalLink, Zap } from 'lucide-react';
import type { Modelo, ModeloSD, ModeloLLM, ModeloVideo, ModeloAudio, ModeloComplemento } from '../lib/demoData';
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
  onTest?: (modelo: Modelo) => void;
}

const categoriaConfig = {
  sd: { gradient: 'from-blue-900/30 to-purple-900/30', border: 'border-blue-700/50 hover:border-blue-600/50', icon: '🖼️', label: 'SD' },
  llm: { gradient: 'from-green-900/30 to-teal-900/30', border: 'border-green-700/50 hover:border-green-600/50', icon: '💬', label: 'LLM' },
  video: { gradient: 'from-purple-900/30 to-pink-900/30', border: 'border-purple-700/50 hover:border-purple-600/50', icon: '🎬', label: 'Video' },
  audio: { gradient: 'from-pink-900/30 to-rose-900/30', border: 'border-pink-700/50 hover:border-pink-600/50', icon: '🎵', label: 'Audio' },
  complemento: { gradient: 'from-amber-900/30 to-orange-900/30', border: 'border-amber-700/50 hover:border-amber-600/50', icon: '🔌', label: 'Complemento' },
};

const tipoBadgeColors: Record<string, string> = {
  // SD
  checkpoint: 'bg-blue-950/50 text-blue-300 border-blue-800/30',
  lora: 'bg-green-950/50 text-green-300 border-green-800/30',
  vae: 'bg-orange-950/50 text-orange-300 border-orange-800/30',
  upscaler: 'bg-pink-950/50 text-pink-300 border-pink-800/30',
  controlnet: 'bg-yellow-950/50 text-yellow-300 border-yellow-800/30',
  embedding: 'bg-indigo-950/50 text-indigo-300 border-indigo-800/30',
  // LLM
  chat: 'bg-emerald-950/50 text-emerald-300 border-emerald-800/30',
  completion: 'bg-teal-950/50 text-teal-300 border-teal-800/30',
  code: 'bg-cyan-950/50 text-cyan-300 border-cyan-800/30',
  vision: 'bg-violet-950/50 text-violet-300 border-violet-800/30',
  reasoning: 'bg-purple-950/50 text-purple-300 border-purple-800/30',
  multimodal: 'bg-fuchsia-950/50 text-fuchsia-300 border-fuchsia-800/30',
  lightweight: 'bg-lime-950/50 text-lime-300 border-lime-800/30',
  // Video
  text_to_video: 'bg-purple-950/50 text-purple-300 border-purple-800/30',
  image_to_video: 'bg-fuchsia-950/50 text-fuchsia-300 border-fuchsia-800/30',
  video_to_video: 'bg-rose-950/50 text-rose-300 border-rose-800/30',
  animation: 'bg-amber-950/50 text-amber-300 border-amber-800/30',
  // Audio
  tts: 'bg-pink-950/50 text-pink-300 border-pink-800/30',
  voice_cloning: 'bg-rose-950/50 text-rose-300 border-rose-800/30',
  asr: 'bg-indigo-950/50 text-indigo-300 border-indigo-800/30',
  music_generation: 'bg-violet-950/50 text-violet-300 border-violet-800/30',
  // Complementos
  control: 'bg-amber-950/50 text-amber-300 border-amber-800/30',
  optimizacion: 'bg-orange-950/50 text-orange-300 border-orange-800/30',
  movimiento: 'bg-yellow-950/50 text-yellow-300 border-yellow-800/30',
  utilidad: 'bg-lime-950/50 text-lime-300 border-lime-800/30',
};

function renderModelInfo(modelo: Modelo) {
  if (modelo.categoria === 'sd') {
    const m = modelo as ModeloSD;
    return (
      <div className="flex flex-wrap gap-1.5 mt-3">
        {m.sampler && <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-800/50 border border-slate-700/50 rounded-md text-xs text-slate-300">◈ {m.sampler}</span>}
        {m.steps > 0 && <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-800/50 border border-slate-700/50 rounded-md text-xs text-slate-300">◈ {m.steps} steps</span>}
        {m.cfg_scale > 0 && <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-800/50 border border-slate-700/50 rounded-md text-xs text-slate-300">◈ CFG {m.cfg_scale}</span>}
      </div>
    );
  }
  if (modelo.categoria === 'llm') {
    const m = modelo as ModeloLLM;
    return (
      <div className="flex flex-wrap gap-1.5 mt-3">
        {m.tamaño_parametros && <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-950/50 border border-green-800/30 rounded-md text-xs text-green-300">{m.tamaño_parametros}</span>}
        {m.cuantizacion && <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-950/50 border border-green-800/30 rounded-md text-xs text-green-300">{m.cuantizacion}</span>}
        {m.framework && <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-800/50 border border-slate-700/50 rounded-md text-xs text-slate-300">{m.framework}</span>}
      </div>
    );
  }
  if (modelo.categoria === 'video') {
    const m = modelo as ModeloVideo;
    return (
      <div className="flex flex-wrap gap-1.5 mt-3">
        {m.framework && <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-950/50 border border-purple-800/30 rounded-md text-xs text-purple-300 uppercase">{m.framework}</span>}
        {m.fps_recomendado > 0 && <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-950/50 border border-purple-800/30 rounded-md text-xs text-purple-300">{m.fps_recomendado} FPS</span>}
        {m.frames_totales > 0 && <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-950/50 border border-purple-800/30 rounded-md text-xs text-purple-300">{m.frames_totales} frames</span>}
        {m.resolucion && <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-800/50 border border-slate-700/50 rounded-md text-xs text-slate-300">{m.resolucion}</span>}
      </div>
    );
  }
  if (modelo.categoria === 'audio') {
    const m = modelo as ModeloAudio;
    return (
      <div className="flex flex-wrap gap-1.5 mt-3">
        {m.tamaño_parametros && <span className="inline-flex items-center gap-1 px-2 py-1 bg-pink-950/50 border border-pink-800/30 rounded-md text-xs text-pink-300">{m.tamaño_parametros}</span>}
        {m.latencia && <span className="inline-flex items-center gap-1 px-2 py-1 bg-pink-950/50 border border-pink-800/30 rounded-md text-xs text-pink-300">{m.latencia}</span>}
        {m.modo_ejecucion && <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-800/50 border border-slate-700/50 rounded-md text-xs text-slate-300">{m.modo_ejecucion}</span>}
      </div>
    );
  }
  if (modelo.categoria === 'complemento') {
    const m = modelo as ModeloComplemento;
    return (
      <div className="flex flex-wrap gap-1.5 mt-3">
        {m.nodos_incluidos > 0 && <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-950/50 border border-amber-800/30 rounded-md text-xs text-amber-300">{m.nodos_incluidos} nodos</span>}
        {m.requiere_gpu && <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-950/50 border border-amber-800/30 rounded-md text-xs text-amber-300 uppercase">{m.requiere_gpu}</span>}
        {m.subcategoria && <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-800/50 border border-slate-700/50 rounded-md text-xs text-slate-300">{m.subcategoria}</span>}
      </div>
    );
  }
  return null;
}

export default function ModelCard({ modelo, onViewDetail, onEdit, onDelete, onToggleFavorite, onDuplicate, onTagClick, onTest }: ModelCardProps) {
  const config = categoriaConfig[modelo.categoria];
  const badgeColor = tipoBadgeColors[modelo.tipo] || 'bg-slate-950/50 text-slate-300 border-slate-800/30';
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
    <div className={`bg-gradient-to-br ${config.gradient} bg-slate-900/50 border ${config.border} rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl group flex flex-col backdrop-blur-sm shadow-xl ${modelo.favorito ? 'ring-2 ring-amber-500/50' : ''}`}>
      {/* Imagen */}
      <div className="h-40 relative overflow-hidden flex items-center justify-center bg-slate-800/50 cursor-pointer" onClick={() => onViewDetail(modelo)}>
        {modelo.imagen_principal ? (
          <img src={modelo.imagen_principal} alt={modelo.nombre} className="w-full h-full" style={modelo.categoria === 'sd' ? getImageStyle((modelo as ModeloSD).posicion_imagen || 'center') : { objectFit: 'cover', objectPosition: 'center' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        ) : modelo.categoria === 'sd' && (modelo as ModeloSD).galeria_urls ? (
          <img src={(modelo as ModeloSD).galeria_urls.split('\n').filter(Boolean)[0]?.trim() || ''} alt={modelo.nombre} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        ) : (
          <span className="text-5xl opacity-30 group-hover:opacity-50 transition-opacity">{config.icon}</span>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="px-2 py-1 bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-md text-xs text-slate-200 font-medium">{config.label}</span>
          <span className={`px-2 py-1 rounded-md text-xs font-medium border backdrop-blur-sm ${badgeColor}`}>{modelo.tipo}</span>
        </div>

        {modelo.categoria === 'sd' && (modelo as ModeloSD).galeria_urls && (modelo as ModeloSD).galeria_urls.split('\n').filter(Boolean).length > 0 && (
          <span className="absolute bottom-3 right-3 px-2 py-1 bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-md text-xs text-slate-200 font-medium">🖼️ {(modelo as ModeloSD).galeria_urls.split('\n').filter(Boolean).length}</span>
        )}

        {/* Favorito */}
        {onToggleFavorite && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(modelo.id, modelo.categoria); }}
            className={`absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-lg backdrop-blur-sm transition-all ${modelo.favorito ? 'bg-amber-500/80 text-white shadow-lg' : 'bg-slate-900/80 text-slate-400 hover:text-amber-400 border border-slate-700/50'}`}
            title={modelo.favorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          >
            <Star className={`w-4 h-4 ${modelo.favorito ? 'fill-white' : ''}`} />
          </button>
        )}
      </div>

      {/* Contenido */}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="text-sm font-bold text-slate-100 truncate cursor-pointer hover:text-cyan-400 transition" title={modelo.nombre} onClick={() => onViewDetail(modelo)}>{modelo.nombre}</h3>
        {descripcion && <p className="text-xs text-slate-400 mt-2 line-clamp-2">{descripcion}</p>}
        {renderModelInfo(modelo)}
        
        {/* Tags clickeables */}
        {tags.length > 0 && onTagClick && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {tags.map((tag, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); onTagClick(tag); }}
                className="px-2 py-1 bg-slate-800/50 hover:bg-cyan-950/50 border border-slate-700/50 hover:border-cyan-800/30 rounded-md text-xs text-slate-400 hover:text-cyan-300 transition"
                title={`Filtrar por: ${tag}`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}

        <div className="mt-3 text-xs text-slate-500">
          {modelo.categoria === 'sd' && (modelo as ModeloSD).modelo_base && <span>Base: {(modelo as ModeloSD).modelo_base}</span>}
          {modelo.categoria === 'llm' && (modelo as ModeloLLM).creador && <span>Por: {(modelo as ModeloLLM).creador}</span>}
          {modelo.categoria === 'video' && (modelo as ModeloVideo).framework && <span>Framework: {(modelo as ModeloVideo).framework}</span>}
        </div>

        <div className="flex-1" />

        {/* Acciones */}
        <div className="flex items-center gap-1.5 mt-4 pt-4 border-t border-slate-800/50">
          {urlCivitai && (
            <button onClick={(e) => { e.stopPropagation(); openExternalUrl(urlCivitai, 'Civitai'); }} className="flex-1 flex items-center justify-center gap-1 px-2 py-2 bg-blue-950/50 hover:bg-blue-900/50 border border-blue-800/30 text-blue-300 text-xs font-medium rounded-lg transition" title={`Abrir en Civitai`}>
              <ExternalLink className="w-3 h-3" />
              <span className="hidden sm:inline">Civitai</span>
            </button>
          )}
          {urlHuggingFace && (
            <button onClick={(e) => { e.stopPropagation(); openExternalUrl(urlHuggingFace, 'HuggingFace'); }} className="flex-1 flex items-center justify-center gap-1 px-2 py-2 bg-yellow-950/50 hover:bg-yellow-900/50 border border-yellow-800/30 text-yellow-300 text-xs font-medium rounded-lg transition" title={`Abrir en HuggingFace`}>
              <ExternalLink className="w-3 h-3" />
              <span className="hidden sm:inline">HF</span>
            </button>
          )}
          {onTest && (
            <button onClick={(e) => { e.stopPropagation(); onTest(modelo); }} className="p-2 bg-green-950/50 hover:bg-green-900/50 border border-green-800/30 text-green-400 rounded-lg transition" title="Probar modelo">
              <Zap className="w-4 h-4" />
            </button>
          )}
          {onDuplicate && (
            <button onClick={(e) => { e.stopPropagation(); onDuplicate(modelo); }} className="p-2 bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition" title="Duplicar">
              <Copy className="w-4 h-4" />
            </button>
          )}
          <button onClick={(e) => { e.stopPropagation(); onEdit(modelo); }} className="p-2 bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition" title="Editar">
            <Edit className="w-4 h-4" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); handleDelete(); }} className="p-2 bg-red-950/50 hover:bg-red-900/50 border border-red-800/30 text-red-400 rounded-lg transition" title="Eliminar">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
