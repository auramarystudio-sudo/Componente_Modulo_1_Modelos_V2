import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Image as ImageIcon, Sparkles } from 'lucide-react';
import type { Modelo, ModeloSD, ModeloLLM, ModeloVideo, ModeloAudio, ModeloComplemento, CategoriaModelo } from '../lib/demoData';
import { importarDesdeCivitai, esUrlCivitai } from '../lib/importers/civitai';
import { importarDesdeHuggingFace, esUrlHuggingFace } from '../lib/importers/huggingface';
import ImageSelector from './ImageSelector';
import EditableGallery from './EditableGallery';

interface ModelFormProps {
  onClose: () => void;
  onSave: (data: Record<string, unknown>, file?: File | null) => void;
  modeloInicial: Modelo | null;
}

type TabForm = 'manual' | 'importar';

const baseSD: Partial<ModeloSD> = { categoria: 'sd', nombre: '', tipo: 'checkpoint', ecosistema: 'sd15', modelo_base: 'SD 1.5', modelo_vae: '', upscaler: '', sampler: 'DPM++ 2M Karras', steps: 30, cfg_scale: 7, clip_skip: 1, tags: '', galeria_urls: '', url_civitai: '', url_huggingface: '', prompt_referencia: '', prompt_negativo_default: '', imagen_principal: '', posicion_imagen: 'center', vram_min: '', vram_rec: '', notas: '', estado: 'activo' };
const baseLLM: Partial<ModeloLLM> = { categoria: 'llm', nombre: '', tipo: 'chat', framework: 'ollama', creador: '', version: '', tamaño_parametros: '', cuantizacion: '', contexto_maximo: 4096, temperatura_default: 0.7, top_p: 0.9, top_k: 40, max_tokens: 2048, system_prompt_default: '', tags: '', url_descarga: '', url_huggingface: '', url_ollama: '', vram_min: '', vram_rec: '', imagen_principal: '', notas: '', estado: 'activo' };
const baseVideo: Partial<ModeloVideo> = { categoria: 'video', nombre: '', tipo: 'text_to_video', framework: 'stable_video_diffusion', modelo_base: '', fps_recomendado: 8, frames_totales: 25, resolucion: '512x512', cfg_scale: 7, steps: 25, motion_bucket_id: 127, tags: '', url_descarga: '', imagen_principal: '', notas: '', estado: 'activo' };
const baseAudio: Partial<ModeloAudio> = { categoria: 'audio', nombre: '', tipo: 'tts', framework: '', creador: '', tamaño_parametros: '', idiomas: '', calidad_audio: '', latencia: 'media', modo_ejecucion: 'local', tiempo_real: false, formato_entrada: 'texto', formato_salida: 'wav', caracteristicas: '', licencia: '', vram_min: '', url_descarga: '', url_github: '', url_demo: '', tags: '', notas: '', imagen_principal: '', estado: 'activo' };
const baseComplemento: Partial<ModeloComplemento> = { categoria: 'complemento', nombre: '', tipo: 'utilidad', subcategoria: 'nodos', autor: '', version: '', nodos_incluidos: 0, compatibilidad: '', requiere_gpu: 'cualquiera', descripcion: '', funcionalidades: '', vram_requerida: '', url_github: '', url_documentacion: '', tags: '', notas: '', imagen_principal: '', estado: 'activo' };

export default function ModelForm({ onClose, onSave, modeloInicial }: ModelFormProps) {
  const [tab, setTab] = useState<TabForm>(modeloInicial ? 'manual' : 'manual');
  const [categoriaActiva, setCategoriaActiva] = useState<CategoriaModelo>(modeloInicial?.categoria || 'sd');
  const [formData, setFormData] = useState<Partial<Modelo>>(modeloInicial || { ...baseSD });
  const [archivo, setArchivo] = useState<File | null>(null);
  const [archivoPreview, setArchivoPreview] = useState<string>('');
  const [enviando, setEnviando] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectorAbierto, setSelectorAbierto] = useState(false);
  const [urlImportar, setUrlImportar] = useState('');
  const [importando, setImportando] = useState(false);
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState(false);
  const [maxImagenes, setMaxImagenes] = useState<number>(20);
  const [maxImagenesCustom, setMaxImagenesCustom] = useState<string>('');
  const [usarCustom, setUsarCustom] = useState(false);

  useEffect(() => {
    if (modeloInicial) {
      setFormData(modeloInicial);
      setCategoriaActiva(modeloInicial.categoria);
      if (modeloInicial.imagen_principal) setArchivoPreview(modeloInicial.imagen_principal);
    }
  }, [modeloInicial]);

  const cambiarCategoria = (cat: CategoriaModelo) => {
    setCategoriaActiva(cat);
    if (cat === 'sd') setFormData({ ...baseSD });
    else if (cat === 'llm') setFormData({ ...baseLLM });
    else if (cat === 'video') setFormData({ ...baseVideo });
    else if (cat === 'audio') setFormData({ ...baseAudio });
    else setFormData({ ...baseComplemento });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setArchivo(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setArchivoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleImageSelect = (imageUrl: string, position: string) => {
    setFormData(prev => ({ ...prev, imagen_principal: imageUrl, posicion_imagen: position }));
    setArchivoPreview(imageUrl);
    setArchivo(null);
  };

  const handleGalleryChange = (images: string[]) => {
    setFormData(prev => ({ ...prev, galeria_urls: images.join('\n') }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre?.trim()) {
      alert('El nombre es obligatorio.');
      return;
    }
    setEnviando(true);
    try {
      await onSave({ ...formData, categoria: categoriaActiva }, archivo);
    } catch (err) {
      console.error('Error al guardar:', err);
      alert('Error al guardar el modelo.');
    } finally {
      setEnviando(false);
    }
  };

  const handleImportar = async () => {
    if (!urlImportar.trim()) {
      setImportError('Ingresa una URL válida.');
      return;
    }
    setImportando(true);
    setImportError('');
    setImportSuccess(false);
    const maxImages = usarCustom ? (parseInt(maxImagenesCustom) || 20) : maxImagenes;
    try {
      let result;
      if (esUrlCivitai(urlImportar)) {
        result = await importarDesdeCivitai(urlImportar, maxImages);
        setFormData({ ...baseSD, nombre: result.nombre, tipo: result.tipo as ModeloSD['tipo'], modelo_base: result.modelo_base, tags: result.tags, url_civitai: result.url_civitai, imagen_principal: result.imagen_principal, galeria_urls: result.galeria_urls, notas: result.notas });
        setArchivoPreview(result.imagen_principal);
        setCategoriaActiva('sd');
        setImportSuccess(true);
      } else if (esUrlHuggingFace(urlImportar)) {
        result = await importarDesdeHuggingFace(urlImportar, maxImages);
        setFormData({ ...baseSD, nombre: result.nombre, tags: result.tags, url_huggingface: result.url_huggingface, imagen_principal: result.imagen_principal, galeria_urls: result.galeria_urls, notas: result.notas });
        setArchivoPreview(result.imagen_principal);
        setCategoriaActiva('sd');
        setImportSuccess(true);
      } else {
        setImportError('URL no reconocida. Usa URLs de Civitai o HuggingFace.');
      }
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Error al importar.');
    } finally {
      setImportando(false);
    }
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-800/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col backdrop-blur-xl animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/50 bg-slate-900/90 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              {modeloInicial ? 'Editar Modelo' : 'Nuevo Modelo'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        {!modeloInicial && (
          <div className="flex border-b border-slate-800/50 bg-slate-800/30">
            <button onClick={() => setTab('manual')} className={`flex-1 px-4 py-3 text-sm font-medium transition ${tab === 'manual' ? 'text-cyan-400 border-b-2 border-cyan-500 bg-slate-900/50' : 'text-slate-400 hover:text-white'}`}>✍️ Manual</button>
            <button onClick={() => setTab('importar')} className={`flex-1 px-4 py-3 text-sm font-medium transition ${tab === 'importar' ? 'text-cyan-400 border-b-2 border-cyan-500 bg-slate-900/50' : 'text-slate-400 hover:text-white'}`}>🌐 Importar desde URL</button>
          </div>
        )}

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto p-6">
          {tab === 'importar' ? (
            <div className="space-y-6">
              <p className="text-sm text-slate-400">Pega una URL de <strong className="text-blue-400">Civitai</strong> o <strong className="text-yellow-400">HuggingFace</strong> para importar automáticamente los datos del modelo.</p>
              <div className="flex gap-2">
                <input type="url" value={urlImportar} onChange={(e) => { setUrlImportar(e.target.value); setImportError(''); }} placeholder="https://civitai.com/models/4201 o https://huggingface.co/..." className="flex-1 px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition" />
                <button onClick={handleImportar} disabled={importando || !urlImportar.trim()} className="flex items-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 text-white text-sm font-medium transition shadow-lg">
                  {importando ? '⏳ Analizando...' : '🔍 Analizar'}
                </button>
              </div>

              {/* Selector de cantidad */}
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 backdrop-blur-sm space-y-3">
                <label className="block text-sm font-medium text-slate-300">🖼️ Cantidad de imágenes a importar</label>
                <div className="flex flex-wrap gap-2">
                  {[10, 20, 30, 50, 100].map((num) => (
                    <button key={num} type="button" onClick={() => { setMaxImagenes(num); setUsarCustom(false); }} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${!usarCustom && maxImagenes === num ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg' : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 border border-slate-700/50'}`}>{num} imágenes</button>
                  ))}
                  <button type="button" onClick={() => setUsarCustom(true)} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${usarCustom ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg' : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 border border-slate-700/50'}`}>Personalizado</button>
                  <button type="button" onClick={() => { setMaxImagenes(-1); setUsarCustom(false); }} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${!usarCustom && maxImagenes === -1 ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg' : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 border border-slate-700/50'}`}>Todas</button>
                </div>
                {usarCustom && (
                  <div className="flex items-center gap-2">
                    <input type="number" value={maxImagenesCustom} onChange={(e) => setMaxImagenesCustom(e.target.value)} placeholder="Ingresa cantidad" min="1" max="500" className="flex-1 px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition" />
                    <span className="text-sm text-slate-400">imágenes</span>
                  </div>
                )}
                <p className="text-xs text-slate-500">{usarCustom && maxImagenesCustom ? `Se importarán ${maxImagenesCustom} imágenes` : maxImagenes === -1 ? 'Se importarán todas las imágenes disponibles' : `Se importarán ${maxImagenes} imágenes`}</p>
              </div>

              {importError && <div className="px-4 py-3 bg-red-950/50 border border-red-800/30 rounded-lg text-red-300 text-sm">❌ {importError}</div>}
              {importSuccess && (
                <div className="px-4 py-3 bg-green-950/50 border border-green-800/30 rounded-lg">
                  <p className="text-green-300 text-sm mb-2">✅ Datos importados correctamente. Revisa y guarda.</p>
                  <button onClick={() => { setTab('manual'); setImportSuccess(false); }} className="px-3 py-1.5 bg-green-900/50 hover:bg-green-800/50 border border-green-700/30 text-green-300 text-sm rounded-lg transition">→ Ir al formulario para editar</button>
                </div>
              )}
              {formData.nombre && importSuccess && (
                <div className="mt-4 p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl backdrop-blur-sm">
                  <h4 className="text-sm font-semibold text-slate-300 mb-2">Preview:</h4>
                  <p className="text-slate-100 font-medium">{formData.nombre}</p>
                  <p className="text-xs text-slate-400 mt-1">Tipo: {formData.tipo} | Categoría: {categoriaActiva}</p>
                  {formData.tags && <div className="flex flex-wrap gap-1.5 mt-2">{(formData.tags as string).split(',').slice(0, 5).map((t: string, i: number) => <span key={i} className="px-2 py-1 bg-slate-700/50 border border-slate-600/50 rounded-md text-xs text-slate-300">{t.trim()}</span>)}</div>}
                  {(formData as any).galeria_urls && ((formData as any).galeria_urls as string).split('\n').filter(Boolean).length > 0 && (
                    <div className="mt-4">
                      <EditableGallery images={((formData as any).galeria_urls as string).split('\n').filter(Boolean)} onImagesChange={handleGalleryChange} title="Galería importada" />
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {!modeloInicial && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Categoría</label>
                  <div className="flex gap-2">
                    {(['sd', 'llm', 'video', 'audio', 'complemento'] as CategoriaModelo[]).map(cat => (
                      <button key={cat} type="button" onClick={() => cambiarCategoria(cat)} className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium border transition ${categoriaActiva === cat ? cat === 'sd' ? 'bg-blue-950/50 border-blue-700/50 text-blue-300 shadow-lg' : cat === 'llm' ? 'bg-green-950/50 border-green-700/50 text-green-300 shadow-lg' : cat === 'video' ? 'bg-purple-950/50 border-purple-700/50 text-purple-300 shadow-lg' : cat === 'audio' ? 'bg-pink-950/50 border-pink-700/50 text-pink-300 shadow-lg' : 'bg-amber-950/50 border-amber-700/50 text-amber-300 shadow-lg' : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:text-white'}`}>{cat === 'sd' ? '🖼️ SD' : cat === 'llm' ? '💬 LLM' : cat === 'video' ? '🎬 Video' : cat === 'audio' ? '🎵 Audio' : '🔌 Complemento'}</button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Nombre del Modelo <span className="text-red-400">*</span></label>
                <input type="text" name="nombre" value={(formData.nombre as string) || ''} onChange={handleChange} placeholder="Nombre del modelo" className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition" required />
              </div>

              {categoriaActiva === 'sd' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Tipo</label>
                      <select name="tipo" value={(formData as any).tipo || 'checkpoint'} onChange={handleChange} className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition">
                        <option value="checkpoint">Checkpoint</option>
                        <option value="lora">LoRA</option>
                        <option value="vae">VAE</option>
                        <option value="upscaler">Upscaler</option>
                        <option value="controlnet">ControlNet</option>
                        <option value="embedding">Embedding</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Ecosistema</label>
                      <select name="ecosistema" value={(formData as any).ecosistema || 'sd15'} onChange={handleChange} className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition">
                        <option value="sd15">SD 1.5</option>
                        <option value="sdxl">SDXL</option>
                        <option value="flux">Flux</option>
                        <option value="pony">Pony</option>
                        <option value="illustrious">Illustrious</option>
                        <option value="other">Otro</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Modelo Base</label>
                      <input type="text" name="modelo_base" value={(formData as any).modelo_base || ''} onChange={handleChange} placeholder="SD 1.5, SDXL 1.0..." className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Sampler</label>
                      <input type="text" name="sampler" value={(formData as any).sampler || ''} onChange={handleChange} placeholder="DPM++ 2M Karras" className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Steps</label>
                      <input type="number" name="steps" value={(formData as any).steps || ''} onChange={handleNumberChange} className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">CFG Scale</label>
                      <input type="number" name="cfg_scale" value={(formData as any).cfg_scale || ''} onChange={handleNumberChange} step="0.5" className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">URL Civitai</label>
                      <input type="url" name="url_civitai" value={(formData as any).url_civitai || ''} onChange={handleChange} placeholder="https://civitai.com/models/..." className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">URL HuggingFace</label>
                      <input type="url" name="url_huggingface" value={(formData as any).url_huggingface || ''} onChange={handleChange} placeholder="https://huggingface.co/..." className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition" />
                    </div>
                  </div>
                  <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 backdrop-blur-sm space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Galería de Imágenes (URLs)</label>
                      <textarea name="galeria_urls" value={(formData as any).galeria_urls || ''} onChange={handleChange} placeholder="URLs de imágenes separadas por salto de línea" rows={3} className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition resize-y font-mono text-xs" />
                    </div>
                    {(formData as any).galeria_urls && (formData as any).galeria_urls.split('\n').filter(Boolean).length > 0 && (
                      <EditableGallery images={(formData as any).galeria_urls.split('\n').filter(Boolean)} onImagesChange={handleGalleryChange} title="Imágenes en la galería" />
                    )}
                  </div>
                </>
              )}

              {categoriaActiva === 'llm' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Tipo</label>
                      <select name="tipo" value={(formData as any).tipo || 'chat'} onChange={handleChange} className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition">
                        <option value="chat">Chat</option>
                        <option value="completion">Completion</option>
                        <option value="embedding">Embedding</option>
                        <option value="vision">Vision</option>
                        <option value="code">Code</option>
                        <option value="reasoning">Razonamiento</option>
                        <option value="multimodal">Multimodal</option>
                        <option value="lightweight">Ligero</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Framework</label>
                      <select name="framework" value={(formData as any).framework || 'ollama'} onChange={handleChange} className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition">
                        <option value="ollama">Ollama</option>
                        <option value="lm_studio">LM Studio</option>
                        <option value="llama_cpp">llama.cpp</option>
                        <option value="vllm">vLLM</option>
                        <option value="text_gen_webui">Text Gen WebUI</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Creador</label>
                      <input type="text" name="creador" value={(formData as any).creador || ''} onChange={handleChange} placeholder="Meta, Mistral AI..." className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Parámetros</label>
                      <input type="text" name="tamaño_parametros" value={(formData as any).tamaño_parametros || ''} onChange={handleChange} placeholder="7B, 70B..." className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Cuantización</label>
                      <input type="text" name="cuantizacion" value={(formData as any).cuantizacion || ''} onChange={handleChange} placeholder="Q4_K_M, FP16..." className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">URL HuggingFace</label>
                      <input type="url" name="url_huggingface" value={(formData as any).url_huggingface || ''} onChange={handleChange} placeholder="https://huggingface.co/..." className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Comando Ollama</label>
                      <input type="text" name="url_ollama" value={(formData as any).url_ollama || ''} onChange={handleChange} placeholder="llama3.1:70b" className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition" />
                    </div>
                  </div>
                </>
              )}

              {categoriaActiva === 'video' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Tipo</label>
                      <select name="tipo" value={(formData as any).tipo || 'text_to_video'} onChange={handleChange} className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition">
                        <option value="text_to_video">Text to Video</option>
                        <option value="image_to_video">Image to Video</option>
                        <option value="video_to_video">Video to Video</option>
                        <option value="animation">Animation</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Framework</label>
                      <select name="framework" value={(formData as any).framework || 'stable_video_diffusion'} onChange={handleChange} className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition">
                        <option value="stable_video_diffusion">Stable Video Diffusion</option>
                        <option value="animatediff">AnimateDiff</option>
                        <option value="deforum">Deforum</option>
                        <option value="wan">Wan</option>
                        <option value="ltx">LTX Video</option>
                        <option value="cogvideox">CogVideoX</option>
                        <option value="other">Otro</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">FPS</label>
                      <input type="number" name="fps_recomendado" value={(formData as any).fps_recomendado || ''} onChange={handleNumberChange} className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Frames</label>
                      <input type="number" name="frames_totales" value={(formData as any).frames_totales || ''} onChange={handleNumberChange} className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Steps</label>
                      <input type="number" name="steps" value={(formData as any).steps || ''} onChange={handleNumberChange} className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">CFG Scale</label>
                      <input type="number" name="cfg_scale" value={(formData as any).cfg_scale || ''} onChange={handleNumberChange} step="0.5" className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">URL de Descarga</label>
                    <input type="url" name="url_descarga" value={(formData as any).url_descarga || ''} onChange={handleChange} placeholder="https://..." className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition" />
                  </div>
                </>
              )}

              {categoriaActiva === 'audio' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Tipo</label>
                      <select name="tipo" value={(formData as any).tipo || 'tts'} onChange={handleChange} className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition">
                        <option value="tts">Text-to-Speech</option>
                        <option value="voice_cloning">Clonación de Voz</option>
                        <option value="asr">Speech-to-Text</option>
                        <option value="music_generation">Generación Musical</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Framework</label>
                      <input type="text" name="framework" value={(formData as any).framework || ''} onChange={handleChange} placeholder="kokoro, whisper, audiocraft..." className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Creador</label>
                      <input type="text" name="creador" value={(formData as any).creador || ''} onChange={handleChange} placeholder="Meta, OpenAI, Hexgrad..." className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Parámetros</label>
                      <input type="text" name="tamaño_parametros" value={(formData as any).tamaño_parametros || ''} onChange={handleChange} placeholder="82M, 1.5B, 3.3B..." className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Idiomas</label>
                      <input type="text" name="idiomas" value={(formData as any).idiomas || ''} onChange={handleChange} placeholder="en, es, fr..." className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Calidad Audio</label>
                      <input type="text" name="calidad_audio" value={(formData as any).calidad_audio || ''} onChange={handleChange} placeholder="24kHz, 44kHz..." className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Latencia</label>
                      <select name="latencia" value={(formData as any).latencia || 'media'} onChange={handleChange} className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition">
                        <option value="ultra-baja">Ultra-baja</option>
                        <option value="baja">Baja</option>
                        <option value="media">Media</option>
                        <option value="alta">Alta</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Modo Ejecución</label>
                      <select name="modo_ejecucion" value={(formData as any).modo_ejecucion || 'local'} onChange={handleChange} className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition">
                        <option value="local">Local</option>
                        <option value="api">API</option>
                        <option value="ambos">Ambos</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Formato Entrada</label>
                      <input type="text" name="formato_entrada" value={(formData as any).formato_entrada || ''} onChange={handleChange} placeholder="texto, audio, midi..." className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Formato Salida</label>
                      <input type="text" name="formato_salida" value={(formData as any).formato_salida || ''} onChange={handleChange} placeholder="wav, mp3, flac..." className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Características</label>
                    <textarea name="caracteristicas" value={(formData as any).caracteristicas || ''} onChange={handleChange} placeholder="clonación, emociones, multilingüe..." rows={2} className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition resize-y" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">URL GitHub</label>
                      <input type="url" name="url_github" value={(formData as any).url_github || ''} onChange={handleChange} placeholder="https://github.com/..." className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Licencia</label>
                      <input type="text" name="licencia" value={(formData as any).licencia || ''} onChange={handleChange} placeholder="MIT, Apache 2.0..." className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition" />
                    </div>
                  </div>
                </>
              )}

              {categoriaActiva === 'complemento' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Tipo</label>
                      <select name="tipo" value={(formData as any).tipo || 'utilidad'} onChange={handleChange} className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition">
                        <option value="control">Control/Estructura</option>
                        <option value="optimizacion">Optimización</option>
                        <option value="movimiento">Movimiento</option>
                        <option value="utilidad">Utilidad</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Subcategoría</label>
                      <select name="subcategoria" value={(formData as any).subcategoria || 'nodos'} onChange={handleChange} className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition">
                        <option value="nodos">Nodos</option>
                        <option value="wrapper">Wrapper</option>
                        <option value="manager">Manager</option>
                        <option value="suite">Suite</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Autor</label>
                      <input type="text" name="autor" value={(formData as any).autor || ''} onChange={handleChange} placeholder="ltdrdata, cubiq, Nvidia..." className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Versión</label>
                      <input type="text" name="version" value={(formData as any).version || ''} onChange={handleChange} placeholder="1.0, latest..." className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Nodos Incluidos</label>
                      <input type="number" name="nodos_incluidos" value={(formData as any).nodos_incluidos || ''} onChange={handleNumberChange} className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">GPU Requerida</label>
                      <select name="requiere_gpu" value={(formData as any).requiere_gpu || 'cualquiera'} onChange={handleChange} className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition">
                        <option value="nvidia">Nvidia</option>
                        <option value="amd">AMD</option>
                        <option value="cpu">CPU</option>
                        <option value="cualquiera">Cualquiera</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">VRAM Requerida</label>
                      <input type="text" name="vram_requerida" value={(formData as any).vram_requerida || ''} onChange={handleChange} placeholder="4GB, 8GB, N/A..." className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Compatibilidad</label>
                      <input type="text" name="compatibilidad" value={(formData as any).compatibilidad || ''} onChange={handleChange} placeholder="ComfyUI, SD1.5, SDXL..." className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Descripción</label>
                    <textarea name="descripcion" value={(formData as any).descripcion || ''} onChange={handleChange} placeholder="Descripción del complemento..." rows={2} className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition resize-y" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Funcionalidades</label>
                    <textarea name="funcionalidades" value={(formData as any).funcionalidades || ''} onChange={handleChange} placeholder="super_resolution, denoise, frame_interpolation..." rows={2} className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition resize-y" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">URL GitHub</label>
                      <input type="url" name="url_github" value={(formData as any).url_github || ''} onChange={handleChange} placeholder="https://github.com/..." className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">URL Documentación</label>
                      <input type="url" name="url_documentacion" value={(formData as any).url_documentacion || ''} onChange={handleChange} placeholder="https://..." className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition" />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Etiquetas / Tags</label>
                <input type="text" name="tags" value={(formData.tags as string) || ''} onChange={handleChange} placeholder="separadas por comas" className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Notas</label>
                <textarea name="notas" value={(formData.notas as string) || ''} onChange={handleChange} placeholder="Notas adicionales sobre el modelo..." rows={3} className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition resize-y" />
              </div>

              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 backdrop-blur-sm">
                <label className="block text-sm font-medium text-slate-300 mb-3">Imagen Principal</label>
                <div className="flex items-start gap-4">
                  <div className="w-24 h-24 rounded-lg bg-slate-900/50 border border-slate-700/50 flex items-center justify-center overflow-hidden cursor-pointer hover:border-cyan-500/50 transition" onClick={() => setSelectorAbierto(true)} style={{ objectPosition: (formData as any).posicion_imagen || 'center' }}>
                    {archivoPreview ? (
                      <img src={archivoPreview} alt="Preview" className="w-full h-full object-cover" style={{ objectPosition: (formData as any).posicion_imagen || 'center' }} />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-slate-500" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setSelectorAbierto(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-sm font-medium transition shadow-lg">
                        <ImageIcon className="w-4 h-4" />
                        De la galería
                      </button>
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 text-slate-300 text-sm rounded-lg transition">
                        <Upload className="w-4 h-4" />
                        Subir archivo
                      </button>
                    </div>
                    {archivo && <p className="text-xs text-slate-400">{archivo.name}</p>}
                    {(formData as any).posicion_imagen && archivoPreview && <p className="text-xs text-cyan-400">Posición: {(formData as any).posicion_imagen}</p>}
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-800/50 bg-slate-900/90 backdrop-blur-xl">
          <button onClick={onClose} className="px-4 py-2 bg-slate-800/50 hover:bg-slate-800 text-slate-300 font-medium rounded-lg transition">Cancelar</button>
          {tab === 'manual' && (
            <button onClick={handleSubmit} disabled={enviando} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 text-white text-sm font-medium transition shadow-lg">
              {enviando ? '⏳ Guardando...' : modeloInicial ? '💾 Actualizar' : '✅ Guardar'}
            </button>
          )}
        </div>
      </div>

      <ImageSelector isOpen={selectorAbierto} onClose={() => setSelectorAbierto(false)} images={((formData as any).galeria_urls || '').split('\n').filter(Boolean)} currentImage={archivoPreview || (formData as any).imagen_principal || ''} currentPosition={(formData as any).posicion_imagen || 'center'} onSelect={handleImageSelect} />
    </div>
  );
}
