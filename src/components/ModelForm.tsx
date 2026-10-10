// Componente ModelForm - Modal de formulario para crear/editar modelos SD
// Formulario controlado con todos los campos del esquema de PocketBase

import React, { useState, useEffect, useRef } from 'react';
import type { ModeloSD } from '../lib/demoData';

interface ModelFormProps {
  onClose: () => void;
  onSave: (data: Partial<ModeloSD>, file?: File | null) => void;
  modeloInicial: ModeloSD | null;
}

export default function ModelForm({ onClose, onSave, modeloInicial }: ModelFormProps) {
  // Estado del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    tipo: 'checkpoint' as 'checkpoint' | 'lora' | 'vae',
    modelo_base: '',
    modelo_vae: '',
    upscaler: '',
    sampler: '',
    steps: 0,
    cfg_scale: 0,
    tags: '',
    galeria_urls: '',
    url_civitai: '',
    prompt_referencia: '',
    prompt_negativo_default: '',
  });

  const [archivo, setArchivo] = useState<File | null>(null);
  const [archivoPreview, setArchivoPreview] = useState<string>('');
  const [enviando, setEnviando] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cargar datos iniciales si se está editando
  useEffect(() => {
    if (modeloInicial) {
      setFormData({
        nombre: modeloInicial.nombre || '',
        tipo: modeloInicial.tipo || 'checkpoint',
        modelo_base: modeloInicial.modelo_base || '',
        modelo_vae: modeloInicial.modelo_vae || '',
        upscaler: modeloInicial.upscaler || '',
        sampler: modeloInicial.sampler || '',
        steps: modeloInicial.steps || 0,
        cfg_scale: modeloInicial.cfg_scale || 0,
        tags: modeloInicial.tags || '',
        galeria_urls: modeloInicial.galeria_urls || '',
        url_civitai: modeloInicial.url_civitai || '',
        prompt_referencia: modeloInicial.prompt_referencia || '',
        prompt_negativo_default: modeloInicial.prompt_negativo_default || '',
      });
      if (modeloInicial.imagen_principal) {
        setArchivoPreview(modeloInicial.imagen_principal);
      }
    }
  }, [modeloInicial]);

  // Manejar cambios en inputs de texto
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Manejar cambios en inputs numéricos
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  // Manejar selección de archivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setArchivo(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setArchivoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setArchivoPreview(modeloInicial?.imagen_principal || '');
    }
  };

  // Enviar formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación básica
    if (!formData.nombre.trim()) {
      alert('El nombre del modelo es obligatorio.');
      return;
    }
    if (!formData.modelo_base.trim()) {
      alert('El modelo base es obligatorio.');
      return;
    }

    setEnviando(true);
    try {
      await onSave(formData, archivo);
    } catch (err) {
      console.error('Error al guardar:', err);
      alert('Error al guardar el modelo. Verifica la conexión con PocketBase.');
    } finally {
      setEnviando(false);
    }
  };

  // Cerrar modal con tecla Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header del modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-slate-800/80">
          <h2 className="text-xl font-bold text-white">
            {modeloInicial ? '✏️ Editar Modelo' : '➕ Nuevo Modelo SD'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Cuerpo del formulario con scroll */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Nombre del Modelo */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Nombre del Modelo <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ej: Realistic Vision V6.0"
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all placeholder:text-slate-500"
              required
            />
          </div>

          {/* Tipo y Modelo Base en fila */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Tipo <span className="text-red-400">*</span>
              </label>
              <select
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
                required
              >
                <option value="checkpoint">🧠 Checkpoint</option>
                <option value="lora">🎨 LoRA</option>
                <option value="vae">⚙️ VAE</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Modelo Base <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="modelo_base"
                value={formData.modelo_base}
                onChange={handleChange}
                placeholder="Ej: SD 1.5, SDXL 1.0"
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all placeholder:text-slate-500"
                required
              />
            </div>
          </div>

          {/* Modelo VAE y Upscaler en fila */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Modelo VAE
              </label>
              <input
                type="text"
                name="modelo_vae"
                value={formData.modelo_vae}
                onChange={handleChange}
                placeholder="Ej: vae-ft-mse-840000"
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all placeholder:text-slate-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Upscaler / Refinamiento
              </label>
              <input
                type="text"
                name="upscaler"
                value={formData.upscaler}
                onChange={handleChange}
                placeholder="Ej: 4x-UltraSharp"
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all placeholder:text-slate-500"
              />
            </div>
          </div>

          {/* Sampler, Steps y CFG Scale */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Sampler
              </label>
              <input
                type="text"
                name="sampler"
                value={formData.sampler}
                onChange={handleChange}
                placeholder="Ej: DPM++ 2M Karras"
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all placeholder:text-slate-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Steps
              </label>
              <input
                type="number"
                name="steps"
                value={formData.steps || ''}
                onChange={handleNumberChange}
                placeholder="20"
                min="0"
                max="150"
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all placeholder:text-slate-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                CFG Scale
              </label>
              <input
                type="number"
                name="cfg_scale"
                value={formData.cfg_scale || ''}
                onChange={handleNumberChange}
                placeholder="7.0"
                min="0"
                max="30"
                step="0.5"
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all placeholder:text-slate-500"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Etiquetas / Tags
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="separadas por comas"
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all placeholder:text-slate-500"
            />
          </div>

          {/* Galería de imágenes */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Galería de Imágenes
            </label>
            <textarea
              name="galeria_urls"
              value={formData.galeria_urls}
              onChange={handleChange}
              placeholder="URLs separadas por salto de línea"
              rows={3}
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all placeholder:text-slate-500 resize-y"
            />
          </div>

          {/* URL Civitai */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Enlace Civitai / Descarga
            </label>
            <input
              type="url"
              name="url_civitai"
              value={formData.url_civitai}
              onChange={handleChange}
              placeholder="https://civitai.com/models/..."
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all placeholder:text-slate-500"
            />
          </div>

          {/* Prompt de referencia */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Prompt Principal de Referencia
            </label>
            <textarea
              name="prompt_referencia"
              value={formData.prompt_referencia}
              onChange={handleChange}
              placeholder="masterpiece, best quality, ..."
              rows={3}
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all placeholder:text-slate-500 resize-y font-mono text-sm"
            />
          </div>

          {/* Prompt negativo */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Prompt Negativo por Defecto
            </label>
            <textarea
              name="prompt_negativo_default"
              value={formData.prompt_negativo_default}
              onChange={handleChange}
              placeholder="bad anatomy, blurry, low quality, ..."
              rows={3}
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all placeholder:text-slate-500 resize-y font-mono text-sm"
            />
          </div>

          {/* Imagen principal */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Imagen Principal
            </label>
            <div className="flex items-start gap-4">
              <div
                className="w-24 h-24 rounded-lg bg-slate-700 border border-slate-600 flex items-center justify-center overflow-hidden cursor-pointer hover:border-cyan-500 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {archivoPreview ? (
                  <img src={archivoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl text-slate-500">📷</span>
                )}
              </div>
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-300 text-sm rounded-lg transition-colors"
                >
                  Seleccionar imagen
                </button>
                {archivo && (
                  <p className="mt-1 text-xs text-slate-400">{archivo.name}</p>
                )}
                <p className="mt-1 text-xs text-slate-500">PNG, JPG hasta 5MB</p>
              </div>
            </div>
          </div>
        </form>

        {/* Footer del modal */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-700 bg-slate-800/80">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={enviando}
            className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-800 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
          >
            {enviando ? '⏳ Guardando...' : modeloInicial ? '💾 Actualizar' : '✅ Guardar Modelo'}
          </button>
        </div>
      </div>
    </div>
  );
}
