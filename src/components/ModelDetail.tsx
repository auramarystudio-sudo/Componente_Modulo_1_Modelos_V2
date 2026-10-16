import React, { useEffect, useState } from 'react';
import { X, Star, Edit, Trash2, ExternalLink, Copy } from 'lucide-react';
import type { Modelo, ModeloSD, ModeloLLM, ModeloVideo, ModeloAudio, ModeloComplemento } from '../lib/demoData';
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
      <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">⚙️ Configuración Recomendada</h4>
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
      <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">⚙️ Parámetros del Modelo</h4>
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
          <p className="text-xs text-slate-500 mb-2">Comando Ollama:</p>
          <code className="block px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-green-400 text-sm font-mono backdrop-blur-sm">ollama run {m.url_ollama}</code>
        </div>
      )}
    </div>
  );

  const renderVideoConfig = (m: ModeloVideo) => (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">⚙️ Configuración de Video</h4>
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

  const renderAudioConfig = (m: ModeloAudio) => (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">🎵 Configuración de Audio</h4>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <InfoCard label="Framework" value={m.framework} />
        <InfoCard label="Parámetros" value={m.tamaño_parametros || 'N/A'} />
        <InfoCard label="Idiomas" value={m.idiomas || 'N/A'} />
        <InfoCard label="Calidad" value={m.calidad_audio || 'N/A'} />
        <InfoCard label="Latencia" value={m.latencia || 'N/A'} />
        <InfoCard label="Modo" value={m.modo_ejecucion || 'N/A'} />
        <InfoCard label="Tiempo Real" value={m.tiempo_real ? 'Sí' : 'No'} />
        <InfoCard label="VRAM" value={m.vram_min || 'N/A'} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <InfoCard label="Entrada" value={m.formato_entrada || 'N/A'} />
        <InfoCard label="Salida" value={m.formato_salida || 'N/A'} />
      </div>
      {m.caracteristicas && (
        <div className="mt-3">
          <p className="text-xs text-slate-500 mb-2">Características:</p>
          <p className="text-sm text-slate-300 bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">{m.caracteristicas}</p>
        </div>
      )}
      {m.licencia && (
        <div className="mt-3">
          <p className="text-xs text-slate-500 mb-2">Licencia:</p>
          <p className="text-sm text-slate-300 bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">{m.licencia}</p>
        </div>
      )}
    </div>
  );

  const renderComplementoConfig = (m: ModeloComplemento) => (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">🔌 Información del Complemento</h4>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <InfoCard label="Tipo" value={m.tipo} />
        <InfoCard label="Subcategoría" value={m.subcategoria} />
        <InfoCard label="Autor" value={m.autor || 'N/A'} />
        <InfoCard label="Versión" value={m.version || 'N/A'} />
        <InfoCard label="Nodos" value={m.nodos_incluidos > 0 ? String(m.nodos_incluidos) : 'N/A'} />
        <InfoCard label="Compatibilidad" value={m.compatibilidad || 'N/A'} />
        <InfoCard label="GPU" value={m.requiere_gpu || 'N/A'} />
        <InfoCard label="VRAM" value={m.vram_requerida || 'N/A'} />
      </div>
      {m.funcionalidades && (
        <div className="mt-3">
          <p className="text-xs text-slate-500 mb-2">Funcionalidades:</p>
          <p className="text-sm text-slate-300 bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">{m.funcionalidades}</p>
        </div>
      )}
      {m.descripcion && (
        <div className="mt-3">
          <p className="text-xs text-slate-500 mb-2">Descripción:</p>
          <p className="text-sm text-slate-300 bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">{m.descripcion}</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col backdrop-blur-xl animate-fade-in">
        {/* Header con imagen */}
        <div className="relative h-48 bg-gradient-to-br from-slate-700 to-slate-800 overflow-hidden">
          {modelo.imagen_principal ? (
            <img src={modelo.imagen_principal} alt={modelo.nombre} className="w-full h-full opacity-60" style={modelo.categoria === 'sd' ? getImageStyle((modelo as ModeloSD).posicion_imagen || 'center') : { objectFit: 'cover', objectPosition: 'center' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl opacity-20">{modelo.categoria === 'sd' ? '🖼️' : modelo.categoria === 'llm' ? '💬' : modelo.categoria === 'video' ? '🎬' : modelo.categoria === 'audio' ? '🎵' : '🔌'}</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
          
          <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-lg bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 hover:bg-slate-800 text-white transition">
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-6 right-6">
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-1 rounded-md text-xs font-medium backdrop-blur-sm ${
                modelo.categoria === 'sd' ? 'bg-blue-950/80 text-blue-300 border border-blue-800/30' :
                modelo.categoria === 'llm' ? 'bg-green-950/80 text-green-300 border border-green-800/30' :
                'bg-purple-950/80 text-purple-300 border border-purple-800/30'
              }`}>{modelo.categoria.toUpperCase()}</span>
              <span className="px-2 py-1 bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-md text-xs text-slate-200 font-medium">{modelo.tipo}</span>
              {modelo.estado && (
                <span className={`px-2 py-1 rounded-md text-xs font-medium backdrop-blur-sm ${
                  modelo.estado === 'activo' ? 'bg-green-950/80 text-green-300 border border-green-800/30' :
                  modelo.estado === 'archivado' ? 'bg-slate-900/80 text-slate-300 border border-slate-700/50' :
                  'bg-amber-950/80 text-amber-300 border border-amber-800/30'
                }`}>{modelo.estado}</span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-slate-100">{modelo.nombre}</h2>
              {onToggleFavorite && (
                <button
                  onClick={() => onToggleFavorite(modelo.id, modelo.categoria)}
                  className={`p-2 rounded-lg backdrop-blur-sm transition-all ${modelo.favorito ? 'bg-amber-500/80 text-white shadow-lg' : 'bg-slate-900/80 text-slate-400 hover:text-amber-400 border border-slate-700/50'}`}
                  title={modelo.favorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                >
                  <Star className={`w-5 h-5 ${modelo.favorito ? 'fill-white' : ''}`} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Control de posición */}
        {modelo.categoria === 'sd' && modelo.imagen_principal && onSetImagePosition && (
          <div className="px-6 py-3 bg-slate-800/50 border-b border-slate-700/50 backdrop-blur-sm">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm font-medium text-slate-400">📐 Posición:</span>
              <div className="flex gap-1.5 flex-wrap">
                {['stretch', 'top-landing', 'center-landing', 'mid-landing', 'bottom-landing', 'top-10', 'top-25', 'top-40', 'top-60', 'top-75', 'top-90', 'top', 'center', 'bottom', 'left', 'right', 'top left', 'top right', 'bottom left', 'bottom right'].map((pos) => (
                  <button key={pos} onClick={() => onSetImagePosition(modelo.id, modelo.categoria, pos)} className={`px-2 py-1 text-xs rounded-md transition ${(modelo as ModeloSD).posicion_imagen === pos ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg' : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 border border-slate-700/50'}`}>{pos}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Tags */}
          {modelo.tags && (
            <div className="flex flex-wrap gap-2">
              {modelo.tags.split(',').map((tag: string, i: number) => (
                <button
                  key={i}
                  onClick={() => onTagClick?.(tag.trim())}
                  className="px-3 py-1.5 bg-slate-800/50 hover:bg-cyan-950/50 border border-slate-700/50 hover:border-cyan-800/30 rounded-md text-xs text-slate-300 hover:text-cyan-300 transition font-medium"
                  title={`Filtrar por: ${tag.trim()}`}
                >
                  #{tag.trim()}
                </button>
              ))}
            </div>
          )}

          {/* Enlaces externos */}
          <div className="flex flex-wrap gap-2">
            {modelo.categoria === 'sd' && (modelo as ModeloSD).url_civitai && (
              <button onClick={() => openExternalUrl((modelo as ModeloSD).url_civitai, 'Civitai')} className="flex items-center gap-2 px-4 py-2 bg-blue-950/50 hover:bg-blue-900/50 border border-blue-800/30 text-blue-300 rounded-lg text-sm font-medium transition">
                <ExternalLink className="w-4 h-4" />
                Civitai
              </button>
            )}
            {(modelo.categoria === 'sd' && (modelo as ModeloSD).url_huggingface || modelo.categoria === 'llm' && (modelo as ModeloLLM).url_huggingface) && (
              <button onClick={() => { const url = modelo.categoria === 'sd' ? (modelo as ModeloSD).url_huggingface : (modelo as ModeloLLM).url_huggingface; openExternalUrl(url, 'HuggingFace'); }} className="flex items-center gap-2 px-4 py-2 bg-yellow-950/50 hover:bg-yellow-900/50 border border-yellow-800/30 text-yellow-300 rounded-lg text-sm font-medium transition">
                <ExternalLink className="w-4 h-4" />
                HuggingFace
              </button>
            )}
            {modelo.categoria === 'llm' && (modelo as ModeloLLM).url_descarga && (
              <button onClick={() => openExternalUrl((modelo as ModeloLLM).url_descarga, 'descarga')} className="flex items-center gap-2 px-4 py-2 bg-green-950/50 hover:bg-green-900/50 border border-green-800/30 text-green-300 rounded-lg text-sm font-medium transition">
                <ExternalLink className="w-4 h-4" />
                Descargar
              </button>
            )}
          </div>

          {/* Configuración */}
          {modelo.categoria === 'sd' && renderSDConfig(modelo as ModeloSD)}
          {modelo.categoria === 'llm' && renderLLMConfig(modelo as ModeloLLM)}
          {modelo.categoria === 'video' && renderVideoConfig(modelo as ModeloVideo)}
          {modelo.categoria === 'audio' && renderAudioConfig(modelo as ModeloAudio)}
          {modelo.categoria === 'complemento' && renderComplementoConfig(modelo as ModeloComplemento)}

          {/* Prompts */}
          {modelo.categoria === 'sd' && (modelo as ModeloSD).prompt_referencia && (
            <div>
              <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-3">📝 Prompt Principal</h4>
              <div className="relative">
                <textarea readOnly value={(modelo as ModeloSD).prompt_referencia} rows={3} className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-200 text-sm font-mono resize-none backdrop-blur-sm focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition" />
                <button onClick={() => copiarAlPortapapeles((modelo as ModeloSD).prompt_referencia)} className="absolute top-2 right-2 p-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-lg transition">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {modelo.categoria === 'sd' && (modelo as ModeloSD).prompt_negativo_default && (
            <div>
              <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-3">🚫 Prompt Negativo</h4>
              <div className="relative">
                <textarea readOnly value={(modelo as ModeloSD).prompt_negativo_default} rows={2} className="w-full px-4 py-3 bg-slate-800/50 border border-red-900/30 rounded-lg text-red-200 text-sm font-mono resize-none backdrop-blur-sm focus:outline-none focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 transition" />
                <button onClick={() => copiarAlPortapapeles((modelo as ModeloSD).prompt_negativo_default)} className="absolute top-2 right-2 p-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-lg transition">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {modelo.categoria === 'llm' && (modelo as ModeloLLM).system_prompt_default && (
            <div>
              <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-3">🤖 System Prompt</h4>
              <div className="relative">
                <textarea readOnly value={(modelo as ModeloLLM).system_prompt_default} rows={3} className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-200 text-sm font-mono resize-none backdrop-blur-sm focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition" />
                <button onClick={() => copiarAlPortapapeles((modelo as ModeloLLM).system_prompt_default)} className="absolute top-2 right-2 p-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-lg transition">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Galería */}
          {modelo.categoria === 'sd' && (modelo as ModeloSD).galeria_urls && (
            <div>
              <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-3">🖼️ Galería de Imágenes <span className="ml-2 text-xs text-slate-500 font-normal">({(modelo as ModeloSD).galeria_urls.split('\n').filter(Boolean).length} imágenes)</span></h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {(modelo as ModeloSD).galeria_urls.split('\n').filter(Boolean).map((url: string, i: number) => (
                  <div key={i} className="group relative cursor-pointer" onClick={() => { setCarouselIndex(i); setCarouselOpen(true); }}>
                    <div className="h-40 bg-slate-800/50 border border-slate-700/50 rounded-lg overflow-hidden hover:border-cyan-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/10 backdrop-blur-sm">
                      <img src={url.trim()} alt={`Galería ${i + 1}`} className="w-full h-full object-contain" loading="lazy" onError={(e) => { const parent = (e.target as HTMLImageElement).parentElement; if (parent) { parent.innerHTML = '<div class="w-full h-full flex items-center justify-center text-slate-600 text-2xl">❌</div>'; } }} />
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                        <span className="text-white text-2xl">🔍</span>
                      </div>
                    </div>
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-md text-xs text-slate-200 font-medium">{i + 1}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notas */}
          {modelo.notas && (
            <div>
              <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-3">📌 Notas</h4>
              <p className="text-sm text-slate-300 bg-slate-800/50 p-4 rounded-lg border border-slate-700/50 backdrop-blur-sm">{modelo.notas}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800/50 bg-slate-900/90 backdrop-blur-xl">
          <button onClick={handleDelete} className="flex items-center gap-2 px-4 py-2 bg-red-950/50 hover:bg-red-900/50 border border-red-800/30 text-red-300 text-sm font-medium rounded-lg transition">
            <Trash2 className="w-4 h-4" />
            Eliminar
          </button>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 bg-slate-800/50 hover:bg-slate-800 text-slate-300 text-sm font-medium rounded-lg transition">Cerrar</button>
            <button onClick={() => { onClose(); onEdit(modelo); }} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-sm font-medium rounded-lg transition shadow-lg">
              <Edit className="w-4 h-4" />
              Editar
            </button>
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
    <div className="px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg backdrop-blur-sm">
      <p className="text-xs text-slate-500 mb-0.5 font-medium">{icon} {label}</p>
      <p className="text-sm text-slate-200 font-medium truncate" title={value}>{value}</p>
    </div>
  );
}
