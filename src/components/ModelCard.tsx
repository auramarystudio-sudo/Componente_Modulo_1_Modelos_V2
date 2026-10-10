// Componente ModelCard - Tarjeta de modelo con diseño diferenciado por categoría
// SD = azul, LLM = verde, Video = púrpura

import React from 'react';
import type { Modelo, ModeloSD, ModeloLLM, ModeloVideo } from '../lib/demoData';

interface ModelCardProps {
  modelo: Modelo;
  onViewDetail: (modelo: Modelo) => void;
  onEdit: (modelo: Modelo) => void;
  onDelete: (id: string, categoria: string) => void;
}

// Configuración visual por categoría
const categoriaConfig = {
  sd: {
    bg: 'from-slate-800 to-slate-900',
    border: 'border-slate-700 hover:border-blue-500/50',
    icon: '🧠',
    label: 'SD',
  },
  llm: {
    bg: 'from-green-950/40 to-slate-900',
    border: 'border-green-900/50 hover:border-green-500/50',
    icon: '💬',
    label: 'LLM',
  },
  video: {
    bg: 'from-purple-950/40 to-slate-900',
    border: 'border-purple-900/50 hover:border-purple-500/50',
    icon: '🎬',
    label: 'Video',
  },
};

// Colores de badge por subtipo
const tipoBadgeColors: Record<string, string> = {
  // SD
  checkpoint: 'bg-blue-500/20 border-blue-500/40 text-blue-300',
  lora: 'bg-green-500/20 border-green-500/40 text-green-300',
  vae: 'bg-orange-500/20 border-orange-500/40 text-orange-300',
  upscaler: 'bg-pink-500/20 border-pink-500/40 text-pink-300',
  controlnet: 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300',
  embedding: 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300',
  // LLM
  chat: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
  completion: 'bg-teal-500/20 border-teal-500/40 text-teal-300',
  code: 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300',
  vision: 'bg-violet-500/20 border-violet-500/40 text-violet-300',
  // Video
  text_to_video: 'bg-purple-500/20 border-purple-500/40 text-purple-300',
  image_to_video: 'bg-fuchsia-500/20 border-fuchsia-500/40 text-fuchsia-300',
  video_to_video: 'bg-rose-500/20 border-rose-500/40 text-rose-300',
  animation: 'bg-amber-500/20 border-amber-500/40 text-amber-300',
};

// Renderiza contenido específico según el tipo de modelo
function renderModelInfo(modelo: Modelo) {
  if (modelo.categoria === 'sd') {
    const m = modelo as ModeloSD;
    return (
      <div className="flex flex-wrap gap-1.5 mt-2">
        {m.sampler && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-700/60 rounded text-xs text-slate-300">
            ◈ {m.sampler}
          </span>
        )}
        {m.steps > 0 && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-700/60 rounded text-xs text-slate-300">
            ◈ {m.steps} steps
          </span>
        )}
        {m.cfg_scale > 0 && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-700/60 rounded text-xs text-slate-300">
            ◈ CFG {m.cfg_scale}
          </span>
        )}
      </div>
    );
  }
  if (modelo.categoria === 'llm') {
    const m = modelo as ModeloLLM;
    return (
      <div className="flex flex-wrap gap-1.5 mt-2">
        {m.tamaño_parametros && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-900/30 border border-green-800/30 rounded text-xs text-green-300">
            {m.tamaño_parametros}
          </span>
        )}
        {m.cuantizacion && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-900/30 border border-green-800/30 rounded text-xs text-green-300">
            {m.cuantizacion}
          </span>
        )}
        {m.framework && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-700/60 rounded text-xs text-slate-300">
            {m.framework}
          </span>
        )}
      </div>
    );
  }
  if (modelo.categoria === 'video') {
    const m = modelo as ModeloVideo;
    return (
      <div className="flex flex-wrap gap-1.5 mt-2">
        {m.fps_recomendado > 0 && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-900/30 border border-purple-800/30 rounded text-xs text-purple-300">
            {m.fps_recomendado} FPS
          </span>
        )}
        {m.frames_totales > 0 && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-900/30 border border-purple-800/30 rounded text-xs text-purple-300">
            {m.frames_totales} frames
          </span>
        )}
        {m.resolucion && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-700/60 rounded text-xs text-slate-300">
            {m.resolucion}
          </span>
        )}
      </div>
    );
  }
  return null;
}

export default function ModelCard({ modelo, onViewDetail, onEdit, onDelete }: ModelCardProps) {
  const config = categoriaConfig[modelo.categoria];
  const badgeColor = tipoBadgeColors[modelo.tipo] || 'bg-slate-500/20 border-slate-500/40 text-slate-300';

  // Descripción corta
  const descripcion = modelo.notas
    ? modelo.notas.substring(0, 80) + (modelo.notas.length > 80 ? '...' : '')
    : '';

  // Manejar eliminación
  const handleDelete = () => {
    if (window.confirm(`¿Eliminar "${modelo.nombre}"? Esta acción no se puede deshacer.`)) {
      onDelete(modelo.id, modelo.categoria);
    }
  };

  // Obtener URLs externas
  const urlCivitai = modelo.categoria === 'sd' ? (modelo as ModeloSD).url_civitai : '';
  const urlHuggingFace = modelo.categoria === 'sd' 
    ? (modelo as ModeloSD).url_huggingface 
    : modelo.categoria === 'llm' 
    ? (modelo as ModeloLLM).url_huggingface 
    : '';

  return (
    <div 
      className={`bg-gradient-to-br ${config.bg} border ${config.border} rounded-xl overflow-hidden transition-all duration-200 hover:shadow-lg group flex flex-col cursor-pointer`}
      onClick={() => onViewDetail(modelo)}
    >
      {/* Imagen / Placeholder */}
      <div className="h-32 relative overflow-hidden flex items-center justify-center bg-slate-800/50">
        {modelo.imagen_principal ? (
          <img
            src={modelo.imagen_principal}
            alt={modelo.nombre}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : modelo.categoria === 'sd' && (modelo as ModeloSD).galeria_urls ? (
          // Si no hay imagen principal pero hay galería, mostrar la primera imagen de la galería
          <img
            src={(modelo as ModeloSD).galeria_urls.split('\n').filter(Boolean)[0]?.trim() || ''}
            alt={modelo.nombre}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <span className="text-4xl opacity-30 group-hover:opacity-50 transition-opacity">
            {config.icon}
          </span>
        )}
        {/* Badge de categoría */}
        <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/50 backdrop-blur-sm rounded text-xs text-white/80 font-medium">
          {config.label}
        </span>
        {/* Badge de tipo */}
        <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-medium border ${badgeColor}`}>
          {modelo.tipo}
        </span>
        {/* Indicador de galería */}
        {modelo.categoria === 'sd' && (modelo as ModeloSD).galeria_urls && (modelo as ModeloSD).galeria_urls.split('\n').filter(Boolean).length > 0 && (
          <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded text-xs text-white/90 font-medium">
            🖼️ {(modelo as ModeloSD).galeria_urls.split('\n').filter(Boolean).length}
          </span>
        )}
      </div>

      {/* Contenido */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Nombre */}
        <h3 className="text-sm font-bold text-white truncate" title={modelo.nombre}>
          {modelo.nombre}
        </h3>

        {/* Descripción */}
        {descripcion && (
          <p className="text-xs text-slate-400 mt-1 line-clamp-2">{descripcion}</p>
        )}

        {/* Info específica del tipo */}
        {renderModelInfo(modelo)}

        {/* Modelo base / framework */}
        <div className="mt-2 text-xs text-slate-500">
          {modelo.categoria === 'sd' && (modelo as ModeloSD).modelo_base && (
            <span>Base: {(modelo as ModeloSD).modelo_base}</span>
          )}
          {modelo.categoria === 'llm' && (modelo as ModeloLLM).creador && (
            <span>Por: {(modelo as ModeloLLM).creador}</span>
          )}
          {modelo.categoria === 'video' && (modelo as ModeloVideo).framework && (
            <span>Framework: {(modelo as ModeloVideo).framework}</span>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Botones de acción */}
        <div className="flex gap-1.5 mt-3 pt-3 border-t border-slate-700/50">
          {/* Botón Civitai */}
          {urlCivitai && (
            <a
              href={urlCivitai}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex-1 px-2 py-1.5 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-700/30 text-blue-300 text-xs font-medium rounded-lg transition-colors text-center"
              title="Ver en Civitai"
            >
              🔗 Civitai
            </a>
          )}
          
          {/* Botón HuggingFace */}
          {urlHuggingFace && (
            <a
              href={urlHuggingFace}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex-1 px-2 py-1.5 bg-yellow-600/20 hover:bg-yellow-600/40 border border-yellow-700/30 text-yellow-300 text-xs font-medium rounded-lg transition-colors text-center"
              title="Ver en HuggingFace"
            >
              🤗 HF
            </a>
          )}

          {/* Botón Editar (icono) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(modelo);
            }}
            className="px-2 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-medium rounded-lg transition-colors"
            title="Editar modelo"
          >
            ✏️
          </button>

          {/* Botón Eliminar */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            className="px-2 py-1.5 bg-red-900/20 hover:bg-red-900/40 border border-red-800/30 text-red-400 text-xs font-medium rounded-lg transition-colors"
            title="Eliminar modelo"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}
