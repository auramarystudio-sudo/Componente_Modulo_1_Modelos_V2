import React, { useState, useEffect, useRef } from 'react';
import type { Modelo, ModeloSD, ModeloLLM, ModeloVideo, CategoriaModelo } from '../lib/demoData';
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

const baseSD: Partial<ModeloSD> = { categoria: 'sd', nombre: '', tipo: 'checkpoint', modelo_base: 'SD 1.5', modelo_vae: '', upscaler: '', sampler: 'DPM++ 2M Karras', steps: 30, cfg_scale: 7, clip_skip: 1, tags: '', galeria_urls: '', url_civitai: '', url_huggingface: '', prompt_referencia: '', prompt_negativo_default: '', imagen_principal: '', posicion_imagen: 'center', vram_min: '', vram_rec: '', notas: '', estado: 'activo' };
const baseLLM: Partial<ModeloLLM> = { categoria: 'llm', nombre: '', tipo: 'chat', framework: 'ollama', creador: '', version: '', tamaño_parametros: '', cuantizacion: '', contexto_maximo: 4096, temperatura_default: 0.7, top_p: 0.9, top_k: 40, max_tokens: 2048, system_prompt_default: '', tags: '', url_descarga: '', url_huggingface: '', url_ollama: '', vram_min: '', vram_rec: '', imagen_principal: '', notas: '', estado: 'activo' };
const baseVideo: Partial<ModeloVideo> = { categoria: 'video', nombre: '', tipo: 'text_to_video', framework: 'stable_video_diffusion', modelo_base: '', fps_recomendado: 8, frames_totales: 25, resolucion: '512x512', cfg_scale: 7, steps: 25, motion_bucket_id: 127, tags: '', url_descarga: '', imagen_principal: '', notas: '', estado: 'activo' };

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
    else setFormData({ ...baseVideo });
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
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">{modeloInicial ? '✏️ Editar Modelo' : '➕ Nuevo Modelo'}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300">✕</button>
        </div>
        {!modeloInicial && (
          <div className="flex border-b border-slate-700">
            <button onClick={() => setTab('manual')} className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${tab === 'manual' ? 'text-cyan-400 border-b-2 border-cyan-400 bg-slate-800' : 'text-slate-400 hover:text-white'}`}>✍️ Manual</button>
            <button onClick={() => setTab('importar')} className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${tab === 'importar' ? 'text-cyan-400 border-b-2 border-cyan-400 bg-slate-800' : 'text-slate-400 hover:text-white'}`}>🌐 Importar desde URL</button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-6">
          {tab === 'importar' ? (
            <div className="space-y-4">
              <p className="text-sm text-slate-400">Pega una URL de <strong className="text-blue-400">Civitai</strong> o <strong className="text-yellow-400">HuggingFace</strong> para importar automáticamente los datos del modelo.</p>
              <div className="flex gap-2">
                <input type="url" value={urlImportar} onChange={(e) => { setUrlImportar(e.target.value); setImportError(''); }} placeholder="https://civitai.com/models/4201 o https://huggingface.co/..." className="flex-1 px-4 py-2.5 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none placeholder:text-slate-500" />
                <button onClick={handleImportar} disabled={importando || !urlImportar.trim()} className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-700 disabled:text-slate-500 text-white font-medium rounded-lg">{importando ? '⏳ Analizando...' : '🔍 Analizar'}</button>
              </div>
              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-300">🖼️ Cantidad de imágenes a importar</label>
                <div className="flex flex-wrap gap-2">
                  {[10, 20, 30, 50, 100].map((num) => (
                    <button key={num} type="button" onClick={() => { setMaxImagenes(num); setUsarCustom(false); }} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${!usarCustom && maxImagenes === num ? 'bg-cyan-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>{num} imágenes</button>
                  ))}
                  <button type="button" onClick={() => setUsarCustom(true)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${usarCustom ? 'bg-cyan-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>Personalizado</button>
                  <button type="button" onClick={() => { setMaxImagenes(-1); setUsarCustom(false); }} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${!usarCustom && maxImagenes === -1 ? 'bg-cyan-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>Todas</button>
                </div>
                {usarCustom && (
                  <div className="flex items-center gap-2">
                    <input type="number" value={maxImagenesCustom} onChange={(e) => setMaxImagenesCustom(e.target.value)} placeholder="Ingresa cantidad" min="1" max="500" className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none placeholder:text-slate-500" />
                    <span className="text-sm text-slate-400">imágenes</span>
                  </div>
                )}
                <p className="text-xs text-slate-500">{usarCustom && maxImagenesCustom ? `Se importarán ${maxImagenesCustom} imágenes` : maxImagenes === -1 ? 'Se importarán todas las imágenes disponibles' : `Se importarán ${maxImagenes} imágenes`}</p>
              </div>
              {importError && <div className="px-4 py-3 bg-red-900/20 border border-red-800/30 rounded-lg text-red-300 text-sm">❌ {importError}</div>}
              {importSuccess && (
                <div className="px-4 py-3 bg-green-900/20 border border-green-800/30 rounded-lg">
                  <p className="text-green-300 text-sm mb-2">✅ Datos importados correctamente. Revisa y guarda.</p>
                  <button onClick={() => { setTab('manual'); setImportSuccess(false); }} className="px-3 py-1.5 bg-green-600/30 hover:bg-green-600/50 border border-green-600/50 text-green-300 text-sm rounded-lg">→ Ir al formulario para editar</button>
                </div>
              )}
              {formData.nombre && importSuccess && (
                <div className="mt-4 p-4 bg-slate-900/50 border border-slate-700 rounded-lg">
                  <h4 className="text-sm font-semibold text-white mb-2">Preview:</h4>
                  <p className="text-white font-medium">{formData.nombre}</p>
                  <p className="text-xs text-slate-400 mt-1">Tipo: {formData.tipo} | Categoría: {categoriaActiva}</p>
                  {formData.tags && <div className="flex flex-wrap gap-1 mt-2">{(formData.tags as string).split(',').slice(0, 5).map((t: string, i: number) => <span key={i} className="px-1.5 py-0.5 bg-slate-700 rounded text-xs text-slate-300">{t.trim()}</span>)}</div>}
                  {(formData as any).galeria_urls && ((formData as any).galeria_urls as string).split('\n').filter(Boolean).length > 0 && (
                    <div className="mt-4">
                      <EditableGallery images={((formData as any).galeria_urls as string).split('\n').filter(Boolean)} onImagesChange={handleGalleryChange} title="Galería importada" />
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {!modeloInicial && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Categoría</label>
                  <div className="flex gap-2">
                    {(['sd', 'llm', 'video'] as CategoriaModelo[]).map(cat => (
                      <button key={cat} type="button" onClick={() => cambiarCategoria(cat)} className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium border transition-all ${categoriaActiva === cat ? cat === 'sd' ? 'bg-blue-600/30 border-blue-500/50 text-blue-300' : cat === 'llm' ? 'bg-green-600/30 border-green-500/50 text-green-300' : 'bg-purple-600/30 border-purple-500/50 text-purple-300' : 'bg-slate-700/50 border-slate-600 text-slate-400 hover:text-white'}`}>{cat === 'sd' ? '🧠 SD' : cat === 'llm' ? '💬 LLM' : '🎬 Video'}</button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Nombre del Modelo <span className="text-red-400">*</span></label>
                <input type="text" name="nombre" value={(formData.nombre as string) || ''} onChange={handleChange} placeholder="Nombre del modelo" className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none placeholder:text-slate-500" required />
              </div>
              {categoriaActiva === 'sd' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Tipo</label>
                      <select name="tipo" value={(formData as any).tipo || 'checkpoint'} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none">
                        <option value="checkpoint">Checkpoint</option>
                        <option value="lora">LoRA</option>
                        <option value="vae">VAE</option>
                        <option value="upscaler">Upscaler</option>
                        <option value="controlnet">ControlNet</option>
                        <option value="embedding">Embedding</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Modelo Base</label>
                      <input type="text" name="modelo_base" value={(formData as any).modelo_base || ''} onChange={handleChange} placeholder="SD 1.5, SDXL 1.0..." className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none placeholder:text-slate-500" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Sampler</label>
                      <input type="text" name="sampler" value={(formData as any).sampler || ''} onChange={handleChange} placeholder="DPM++ 2M Karras" className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none placeholder:text-slate-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Steps</label>
                      <input type="number" name="steps" value={(formData as any).steps || ''} onChange={handleNumberChange} className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">CFG Scale</label>
                      <input type="number" name="cfg_scale" value={(formData as any).cfg_scale || ''} onChange={handleNumberChange} step="0.5" className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">URL Civitai</label>
                      <input type="url" name="url_civitai" value={(formData as any).url_civitai || ''} onChange={handleChange} placeholder="https://civitai.com/models/..." className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none placeholder:text-slate-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">URL HuggingFace</label>
                      <input type="url" name="url_huggingface" value={(formData as any).url_huggingface || ''} onChange={handleChange} placeholder="https://huggingface.co/..." className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none placeholder:text-slate-500" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Galería de Imágenes (agregar URLs manualmente)</label>
                      <textarea name="galeria_urls" value={(formData as any).galeria_urls || ''} onChange={handleChange} placeholder="URLs de imágenes separadas por salto de línea" rows={3} className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none placeholder:text-slate-500 resize-y font-mono text-xs" />
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
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Tipo</label>
                      <select name="tipo" value={(formData as any).tipo || 'chat'} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none">
                        <option value="chat">Chat</option>
                        <option value="completion">Completion</option>
                        <option value="embedding">Embedding</option>
                        <option value="vision">Vision</option>
                        <option value="code">Code</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Framework</label>
                      <select name="framework" value={(formData as any).framework || 'ollama'} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none">
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
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Creador</label>
                      <input type="text" name="creador" value={(formData as any).creador || ''} onChange={handleChange} placeholder="Meta, Mistral AI..." className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none placeholder:text-slate-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Parámetros</label>
                      <input type="text" name="tamaño_parametros" value={(formData as any).tamaño_parametros || ''} onChange={handleChange} placeholder="7B, 70B..." className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none placeholder:text-slate-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Cuantización</label>
                      <input type="text" name="cuantizacion" value={(formData as any).cuantizacion || ''} onChange={handleChange} placeholder="Q4_K_M, FP16..." className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none placeholder:text-slate-500" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">URL HuggingFace</label>
                      <input type="url" name="url_huggingface" value={(formData as any).url_huggingface || ''} onChange={handleChange} placeholder="https://huggingface.co/..." className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none placeholder:text-slate-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Comando Ollama</label>
                      <input type="text" name="url_ollama" value={(formData as any).url_ollama || ''} onChange={handleChange} placeholder="llama3.1:70b" className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none placeholder:text-slate-500" />
                    </div>
                  </div>
                </>
              )}
              {categoriaActiva === 'video' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Tipo</label>
                      <select name="tipo" value={(formData as any).tipo || 'text_to_video'} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none">
                        <option value="text_to_video">Text to Video</option>
                        <option value="image_to_video">Image to Video</option>
                        <option value="video_to_video">Video to Video</option>
                        <option value="animation">Animation</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Framework</label>
                      <select name="framework" value={(formData as any).framework || 'stable_video_diffusion'} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none">
                        <option value="stable_video_diffusion">Stable Video Diffusion</option>
                        <option value="animatediff">AnimateDiff</option>
                        <option value="deforum">Deforum</option>
                        <option value="other">Otro</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">FPS</label>
                      <input type="number" name="fps_recomendado" value={(formData as any).fps_recomendado || ''} onChange={handleNumberChange} className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Frames</label>
                      <input type="number" name="frames_totales" value={(formData as any).frames_totales || ''} onChange={handleNumberChange} className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Steps</label>
                      <input type="number" name="steps" value={(formData as any).steps || ''} onChange={handleNumberChange} className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">CFG Scale</label>
                      <input type="number" name="cfg_scale" value={(formData as any).cfg_scale || ''} onChange={handleNumberChange} step="0.5" className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">URL de Descarga</label>
                    <input type="url" name="url_descarga" value={(formData as any).url_descarga || ''} onChange={handleChange} placeholder="https://..." className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none placeholder:text-slate-500" />
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Etiquetas / Tags</label>
                <input type="text" name="tags" value={(formData.tags as string) || ''} onChange={handleChange} placeholder="separadas por comas" className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none placeholder:text-slate-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Notas</label>
                <textarea name="notas" value={(formData.notas as string) || ''} onChange={handleChange} placeholder="Notas adicionales sobre el modelo..." rows={3} className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none placeholder:text-slate-500 resize-y" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Imagen Principal</label>
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 rounded-lg bg-slate-700 border border-slate-600 flex items-center justify-center overflow-hidden cursor-pointer hover:border-cyan-500 transition-colors" onClick={() => setSelectorAbierto(true)} style={{ objectPosition: (formData as any).posicion_imagen || 'center' }}>
                    {archivoPreview ? (
                      <img src={archivoPreview} alt="Preview" className="w-full h-full object-cover" style={{ objectPosition: (formData as any).posicion_imagen || 'center' }} />
                    ) : (
                      <span className="text-2xl text-slate-500">📷</span>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setSelectorAbierto(true)} className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white text-sm rounded-lg">🖼️ De la galería</button>
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-300 text-sm rounded-lg">📁 Subir archivo</button>
                    </div>
                    {archivo && <p className="text-xs text-slate-400">{archivo.name}</p>}
                    {(formData as any).posicion_imagen && archivoPreview && <p className="text-xs text-cyan-400">Posición: {(formData as any).posicion_imagen}</p>}
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-700">
          <button onClick={onClose} className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium rounded-lg">Cancelar</button>
          {tab === 'manual' && (
            <button onClick={handleSubmit} disabled={enviando} className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-800 disabled:opacity-50 text-white font-medium rounded-lg">{enviando ? '⏳ Guardando...' : modeloInicial ? '💾 Actualizar' : '✅ Guardar'}</button>
          )}
        </div>
      </div>
      <ImageSelector isOpen={selectorAbierto} onClose={() => setSelectorAbierto(false)} images={((formData as any).galeria_urls || '').split('\n').filter(Boolean)} currentImage={archivoPreview || (formData as any).imagen_principal || ''} currentPosition={(formData as any).posicion_imagen || 'center'} onSelect={handleImageSelect} />
    </div>
  );
}
