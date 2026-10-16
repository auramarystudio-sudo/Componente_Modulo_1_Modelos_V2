import React, { useState } from 'react';
import { X, Zap, ExternalLink, Settings } from 'lucide-react';
import type { Modelo, ModeloSD, ModeloLLM } from '../lib/demoData';
import { openExternalUrl } from '../lib/urlUtils';

interface GenerationAPIProps {
  modelo: Modelo;
  isOpen: boolean;
  onClose: () => void;
}

export default function GenerationAPI({ modelo, isOpen, onClose }: GenerationAPIProps) {
  const [apiEndpoint, setApiEndpoint] = useState('http://127.0.0.1:7860');
  const [apiType, setApiType] = useState<'a1111' | 'comfyui' | 'ollama'>('a1111');

  if (!isOpen) return null;

  const generatePayload = () => {
    if (modelo.categoria === 'sd') {
      const m = modelo as ModeloSD;
      return {
        prompt: m.prompt_referencia || '',
        negative_prompt: m.prompt_negativo_default || '',
        steps: m.steps || 20,
        cfg_scale: m.cfg_scale || 7,
        sampler_name: m.sampler || 'Euler',
        width: 512,
        height: 512,
      };
    }

    if (modelo.categoria === 'llm') {
      const m = modelo as ModeloLLM;
      return {
        model: m.url_ollama || m.nombre.toLowerCase().replace(/\s+/g, '-'),
        prompt: 'Hello, how are you?',
        system: m.system_prompt_default || '',
        stream: false,
        options: {
          temperature: m.temperatura_default || 0.7,
          top_p: m.top_p || 0.9,
          top_k: m.top_k || 40,
          num_predict: m.max_tokens || 2048,
        },
      };
    }

    return {};
  };

  const handleTest = () => {
    const payload = generatePayload();
    
    if (modelo.categoria === 'sd') {
      // Abrir A1111 o ComfyUI con los parámetros
      if (apiType === 'a1111') {
        const m = modelo as ModeloSD;
        const params = new URLSearchParams({
          prompt: m.prompt_referencia || '',
          negative_prompt: m.prompt_negativo_default || '',
          steps: String(m.steps || 20),
          cfg_scale: String(m.cfg_scale || 7),
          sampler_name: m.sampler || 'Euler',
        });
        openExternalUrl(`${apiEndpoint}/?${params.toString()}`, 'A1111');
      } else {
        openExternalUrl(apiEndpoint, 'ComfyUI');
      }
    } else if (modelo.categoria === 'llm') {
      // Abrir Ollama o LM Studio
      if (apiType === 'ollama') {
        const m = modelo as ModeloLLM;
        const command = `ollama run ${m.url_ollama || m.nombre.toLowerCase().replace(/\s+/g, '-')}`;
        navigator.clipboard.writeText(command);
        alert(`Comando copiado al portapapeles:\n\n${command}\n\nPégalo en tu terminal para ejecutar el modelo.`);
      } else {
        openExternalUrl(apiEndpoint, 'LM Studio');
      }
    }
  };

  const payload = generatePayload();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-800/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col backdrop-blur-xl animate-fade-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/50 bg-slate-900/90 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                Probar Modelo
              </h2>
              <p className="text-xs text-slate-500">Genera con {modelo.nombre}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Configuración de API */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-5 h-5 text-slate-400" />
              <h3 className="text-sm font-semibold text-slate-300">Configuración de API</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">Tipo de API</label>
                <select
                  value={apiType}
                  onChange={(e) => setApiType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700/50 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 transition"
                >
                  {modelo.categoria === 'sd' && (
                    <>
                      <option value="a1111">Automatic1111</option>
                      <option value="comfyui">ComfyUI</option>
                    </>
                  )}
                  {modelo.categoria === 'llm' && (
                    <>
                      <option value="ollama">Ollama</option>
                      <option value="lmstudio">LM Studio</option>
                    </>
                  )}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">Endpoint</label>
                <input
                  type="text"
                  value={apiEndpoint}
                  onChange={(e) => setApiEndpoint(e.target.value)}
                  placeholder="http://127.0.0.1:7860"
                  className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700/50 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 transition"
                />
              </div>
            </div>
          </div>

          {/* Payload */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 backdrop-blur-sm">
            <h3 className="text-sm font-semibold text-slate-300 mb-3">Payload de Generación</h3>
            <pre className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-4 text-xs text-slate-300 font-mono overflow-x-auto">
              {JSON.stringify(payload, null, 2)}
            </pre>
          </div>

          {/* Botón de prueba */}
          <div className="flex gap-3">
            <button
              onClick={handleTest}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-medium transition shadow-lg"
            >
              <Zap className="w-5 h-5" />
              Probar Modelo
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
                alert('Payload copiado al portapapeles');
              }}
              className="px-4 py-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-300 transition"
              title="Copiar payload"
            >
              Copiar
            </button>
          </div>

          {/* Información */}
          <div className="bg-blue-950/30 border border-blue-800/30 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-blue-300 mb-2">ℹ️ Información</h4>
            <ul className="text-xs text-blue-200/70 space-y-1">
              <li>• Asegúrate de que la API esté corriendo en el endpoint especificado</li>
              <li>• Para A1111, inicia con: <code className="bg-slate-900/50 px-1 rounded">python launch.py --api</code></li>
              <li>• Para Ollama, usa: <code className="bg-slate-900/50 px-1 rounded">ollama serve</code></li>
              <li>• Los parámetros se cargan automáticamente desde la configuración del modelo</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
