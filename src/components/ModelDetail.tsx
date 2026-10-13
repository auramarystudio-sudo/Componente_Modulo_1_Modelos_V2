import React, { useEffect, useState } from 'react';
import type { Modelo, ModeloSD, ModeloLLM, ModeloVideo } from '../lib/demoData';
import { openExternalUrl } from '../lib/urlUtils';
import { getImageStyle } from './ImageSelector';
import ImageCarousel from './ImageCarousel';

interface ModelDetailProps {
  modelo: Modelo;
  onClose: () => void;
  onEdit: (modelo: Modelo) => void;
  onDelete: (id: string, categoria: string) => void;
  onSetImagePosition?: (id: string, categoria: string, position: string) => void;
  onToggleFavorite?: (id: string, categoria: string) => void;
  onTagClick?: (tag: string) => void;
}

function copiarAlPortapapeles(texto: string) {
  navigator.clipboard.writeText(texto).catch(() => {
    const textarea = document.createElement('textarea');
    textarea.value = texto;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  });
}

export default function ModelDetail({ modelo, onClose, onEdit, onDelete, onSetImagePosition, onToggleFavorite, onTagClick }: ModelDetailProps) {
  const [carouselOpen, setCarouselOpen] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleDelete = () => {
    if (window.confirm(`¿Eliminar "${modelo.nombre}"?`)) {
      onDelete(modelo.id, modelo.categoria);
      onClose();
    }
  };

  const renderSDConfig = (m: ModeloSD) => (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-cyan-400 uppercase tracking-wide">⚙️ Configuración Recomendada</h4>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <InfoCard label="Modelo Base" value={m.modelo_base} />
        <InfoCard label="VAE" value={m.modelo_vae || 'Por defecto'} />
        <InfoCard label="Upscaler" value={m.upscaler || 'Ninguno'} />
        <InfoCard label="Sampler" value={m.sampler || 'N/A'} />
        <InfoCard label="Steps" value={m.steps > 0 ? String(m.steps) : 'N/A'} />
        <InfoCard label="CFG Scale" value={m.cfg_scale > 0 ? String(m.cfg_scale) : 'N/A'} />
        <InfoCard label="Clip Skip" value={m.clip_skip > 0 ? String(m.clip_skip) : 'N/A'} />
        <InfoCard label="Resolución" value="512x512 / 1024x1024" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <InfoCard label="VRAM Mínimo" value={m.vram_min || 'N/A'} icon="💾" />
        <InfoCard label="VRAM Recomendado" value={m.vram_rec || 'N/A'} icon="💾" />
      </div>
    </div>
  );

  const renderLLMConfig = (m: ModeloLLM) => (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-green-400 uppercase tracking-wide">⚙️ Parámetros del Modelo</h4>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <InfoCard label="Framework" value={m.framework} />
        <InfoCard label="Parámetros" value={m.tamaño_parametros || 'N/A'} />
        <InfoCard label="Cuantización" value={m.cuantizacion || 'N/A'} />
        <InfoCard label="Contexto Máx." value={m.contexto_maximo > 0 ? m.contexto_maximo.toLocaleString() : 'N/A'} />
        <InfoCard label="Temperatura" value={m.temperatura_default > 0 ? String(m.temperatura_default) : 'N/A'} />
        <InfoCard label="Top P" value={m.top_p > 0 ? String(m.top_p) : 'N/A'} />
        <InfoCard label="Top K" value={m.top_k > 0 ? String(m.top_k) : 'N/A'} />
        <InfoCard label="Max Tokens" value={m.max_tokens > 0 ? m.max_tokens.toLocaleString() : 'N/A'} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <InfoCard label="VRAM Mínimo" value={m.vram_min || 'N/A'} icon="💾" />
        <InfoCard label="VRAM Recomendado" value={m.vram_rec || 'N/A'} icon="💾" />
      </div>
      {m.url_ollama && (
        <div className="mt-3">
          <p className="text-xs text-slate-500 mb-1">Comando Ollama:</p>
          <code className="block px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-green-400 text-sm font-mono">ollama run {m.url_ollama}</code>
        </div>
      )}
    </div>
  );

  const renderVideoConfig = (m: ModeloVideo) => (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-purple-400 uppercase tracking-wide">⚙️ Configuración de Video</h4>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <InfoCard label="Framework" value={m.framework} />
        <InfoCard label="Modelo Base" value={m.modelo_base || 'N/A'} />
        <InfoCard label="FPS" value={m.fps_recomendado > 0 ? String(m.fps_recomendado) : 'N/A'} />
        <InfoCard label="Frames" value={m.frames_totales > 0 ? String(m.frames_totales) : 'N/A'} />
        <InfoCard label="Resolución" value={m.resolucion || 'N/A'} />
        <InfoCard label="CFG Scale" value={m.cfg_scale > 0 ? String(m.cfg_scale) : 'N/A'} />
        <InfoCard label="Steps" value={m.steps > 0 ? String(m.steps) : 'N/A'} />
        <InfoCard label="Motion Bucket" value={m.motion_bucket_id > 0 ? String(m.motion_bucket_id) : 'N/A'} />
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="relative h-48 bg-gradient-to-br from-slate-700 to-slate-800 overflow-hidden">
          {modelo.imagen_principal ? (
            <img src={modelo.imagen_principal} alt={modelo.nombre} className="w-full h-full opacity-60" style={modelo.categoria === 'sd' ? getImageStyle((modelo as ModeloSD).posicion_imagen || 'center') : { objectFit: 'cover', objectPosition: 'center' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl opacity-20">{modelo.categoria === 'sd' ? '🧠' : modelo.categoria === 'llm' ? '💬' : '🎬'}</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-800 via-slate-800/50 to-transparent" />
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg bg-black/50 hover:bg-black/70 text-white">✕</button>
          <div className="absolute bottom-4 left-6 right-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 bg-cyan-600/80 rounded text-xs text-white font-medium uppercase">{modelo.categoria}</span>
              <span className="px-2 py-0.5 bg-slate-600/80 rounded text-xs text-white font-medium">{modelo.tipo}</span>
              {modelo.estado && <span className={`px-2 py-0.5 rounded text-xs font-medium ${modelo.estado === 'activo' ? 'bg-green-600/80 text-white' : modelo.estado === 'archivado' ? 'bg-slate-600/80 text-slate-300' : 'bg-amber-600/80 text-white'}`}>{modelo.estado}</span>}
            </div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-white">{modelo.nombre}</h2>
              {onToggleFavorite && (
                <button
                  onClick={() => onToggleFavorite(modelo.id, modelo.categoria)}
                  className={`w-8 h-8 flex items-center justify-center rounded-full transition-all ${modelo.favorito ? 'bg-amber-500 text-white' : 'bg-slate-700 text-slate-400 hover:text-amber-400'}`}
                  title={modelo.favorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                >
                  {modelo.favorito ? '★' : '☆'}
                </button>
              )}
            </div>
          </div>
        </div>
        {modelo.categoria === 'sd' && modelo.imagen_principal && onSetImagePosition && (
          <div className="px-6 py-3 bg-slate-800/50 border-b border-slate-700">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm text-slate-400">📐 Posición:</span>
              <div className="flex gap-1.5 flex-wrap">
                {['stretch', 'top-landing', 'center-landing', 'mid-landing', 'bottom-landing', 'top-10', 'top-25', 'top-40', 'top-60', 'top-75', 'top-90', 'top', 'center', 'bottom', 'left', 'right', 'top left', 'top right', 'bottom left', 'bottom right'].map((pos) => (
                  <button key={pos} onClick={() => onSetImagePosition(modelo.id, modelo.categoria, pos)} className={`px-2 py-1 text-xs rounded transition-colors ${(modelo as ModeloSD).posicion_imagen === pos ? 'bg-cyan-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>{pos}</button>
                ))}
              </div>
            </div>
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {modelo.tags && (
            <div className="flex flex-wrap gap-1.5">
              {modelo.tags.split(',').map((tag: string, i: number) => (
                <button
                  key={i}
                  onClick={() => onTagClick?.(tag.trim())}
                  className="px-2 py-1 bg-slate-700/50 hover:bg-cyan-600/30 border border-slate-600/50 hover:border-cyan-500/50 rounded-full text-xs text-slate-300 hover:text-cyan-300 transition-colors"
                  title={`Filtrar por: ${tag.trim()}`}
                >
                  #{tag.trim()}
                </button>
              ))}
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {modelo.categoria === 'sd' && (modelo as ModeloSD).url_civitai && (
              <button onClick={() => openExternalUrl((modelo as ModeloSD).url_civitai, 'Civitai')} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 border border-blue-500/30 text-blue-300 rounded-lg text-sm hover:bg-blue-600/30">🔗 Civitai</button>
            )}
            {(modelo.categoria === 'sd' && (modelo as ModeloSD).url_huggingface || modelo.categoria === 'llm' && (modelo as ModeloLLM).url_huggingface) && (
              <button onClick={() => { const url = modelo.categoria === 'sd' ? (modelo as ModeloSD).url_huggingface : (modelo as ModeloLLM).url_huggingface; openExternalUrl(url, 'HuggingFace'); }} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-600/20 border border-yellow-500/30 text-yellow-300 rounded-lg text-sm hover:bg-yellow-600/30">🤗 HuggingFace</button>
            )}
            {modelo.categoria === 'llm' && (modelo as ModeloLLM).url_descarga && (
              <button onClick={() => openExternalUrl((modelo as ModeloLLM).url_descarga, 'descarga')} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600/20 border border-green-500/30 text-green-300 rounded-lg text-sm hover:bg-green-600/30">📥 Descargar</button>
            )}
          </div>
          {modelo.categoria === 'sd' && renderSDConfig(modelo as ModeloSD)}
          {modelo.categoria === 'llm' && renderLLMConfig(modelo as ModeloLLM)}
          {modelo.categoria === 'video' && renderVideoConfig(modelo as ModeloVideo)}
          {modelo.categoria === 'sd' && (modelo as ModeloSD).prompt_referencia && (
            <div>
              <h4 className="text-sm font-semibold text-cyan-400 uppercase tracking-wide mb-2">📝 Prompt Principal</h4>
              <div className="relative">
                <textarea readOnly value={(modelo as ModeloSD).prompt_referencia} rows={3} className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 text-sm font-mono resize-none" />
                <button onClick={() => copiarAlPortapapeles((modelo as ModeloSD).prompt_referencia)} className="absolute top-2 right-2 px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs rounded">📋 Copiar</button>
              </div>
            </div>
          )}
          {modelo.categoria === 'sd' && (modelo as ModeloSD).prompt_negativo_default && (
            <div>
              <h4 className="text-sm font-semibold text-red-400 uppercase tracking-wide mb-2">🚫 Prompt Negativo</h4>
              <div className="relative">
                <textarea readOnly value={(modelo as ModeloSD).prompt_negativo_default} rows={2} className="w-full px-4 py-3 bg-slate-900 border border-red-900/30 rounded-lg text-red-200 text-sm font-mono resize-none" />
                <button onClick={() => copiarAlPortapapeles((modelo as ModeloSD).prompt_negativo_default)} className="absolute top-2 right-2 px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs rounded">📋 Copiar</button>
              </div>
            </div>
          )}
          {modelo.categoria === 'llm' && (modelo as ModeloLLM).system_prompt_default && (
            <div>
              <h4 className="text-sm font-semibold text-green-400 uppercase tracking-wide mb-2">🤖 System Prompt</h4>
              <div className="relative">
                <textarea readOnly value={(modelo as ModeloLLM).system_prompt_default} rows={3} className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 text-sm font-mono resize-none" />
                <button onClick={() => copiarAlPortapapeles((modelo as ModeloLLM).system_prompt_default)} className="absolute top-2 right-2 px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs rounded">📋 Copiar</button>
              </div>
            </div>
          )}
          {modelo.categoria === 'sd' && (modelo as ModeloSD).galeria_urls && (
            <div>
              <h4 className="text-sm font-semibold text-cyan-400 uppercase tracking-wide mb-3">🖼️ Galería de Imágenes <span className="ml-2 text-xs text-slate-400 font-normal">({(modelo as ModeloSD).galeria_urls.split('\n').filter(Boolean).length} imágenes)</span></h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {(modelo as ModeloSD).galeria_urls.split('\n').filter(Boolean).map((url: string, i: number) => (
                  <div key={i} className="group relative cursor-pointer" onClick={() => { setCarouselIndex(i); setCarouselOpen(true); }}>
                    <div className="h-40 bg-slate-900 border border-slate-700 rounded-lg overflow-hidden hover:border-cyan-500/50 transition-all duration-200 hover:shadow-lg hover:shadow-cyan-500/10">
                      <img src={url.trim()} alt={`Galería ${i + 1}`} className="w-full h-full object-contain" loading="lazy" onError={(e) => { const parent = (e.target as HTMLImageElement).parentElement; if (parent) { parent.innerHTML = '<div class="w-full h-full flex items-center justify-center text-slate-600 text-2xl">❌</div>'; } }} />
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full p-3"><span className="text-white text-2xl">🔍</span></div>
                    </div>
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded text-xs text-white/90">{i + 1}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {modelo.notas && (
            <div>
              <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-2">📌 Notas</h4>
              <p className="text-sm text-slate-300 bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">{modelo.notas}</p>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700 bg-slate-800/80">
          <button onClick={handleDelete} className="px-4 py-2 bg-red-900/30 hover:bg-red-900/50 border border-red-800/30 text-red-300 text-sm font-medium rounded-lg">🗑️ Eliminar</button>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm font-medium rounded-lg">Cerrar</button>
            <button onClick={() => { onClose(); onEdit(modelo); }} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-medium rounded-lg">✏️ Editar</button>
          </div>
        </div>
      </div>
      {modelo.categoria === 'sd' && (modelo as ModeloSD).galeria_urls && (
        <ImageCarousel images={(modelo as ModeloSD).galeria_urls.split('\n').filter(Boolean)} initialIndex={carouselIndex} isOpen={carouselOpen} onClose={() => setCarouselOpen(false)} />
      )}
    </div>
  );
}

function InfoCard({ label, value, icon }: { label: string; value: string; icon?: string }) {
  return (
    <div className="px-3 py-2 bg-slate-900/50 border border-slate-700/50 rounded-lg">
      <p className="text-xs text-slate-500 mb-0.5">{icon} {label}</p>
      <p className="text-sm text-slate-200 font-medium truncate" title={value}>{value}</p>
    </div>
  );
}
