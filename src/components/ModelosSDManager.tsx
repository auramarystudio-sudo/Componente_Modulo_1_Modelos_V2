// Componente ModelosSDManager - Manager principal del catálogo de modelos SD
// Maneja estado, filtros, y operaciones CRUD con PocketBase

import React, { useState, useEffect, useCallback } from 'react';
import pbClient, { checkConnection, isDemoMode } from '../lib/pocketbase';
import { demoModelos } from '../lib/demoData';
import type { ModeloSD } from '../lib/demoData';
import ModelCard from './ModelCard';
import ModelForm from './ModelForm';

// Tipo de filtro
type FiltroTipo = 'todos' | 'checkpoint' | 'lora' | 'vae';

// Configuración de pestañas de filtro
const filtros: { key: FiltroTipo; label: string; icon: string }[] = [
  { key: 'todos', label: 'Todos', icon: '📋' },
  { key: 'checkpoint', label: 'Checkpoints', icon: '🧠' },
  { key: 'lora', label: 'LoRAs', icon: '🎨' },
  { key: 'vae', label: 'VAEs', icon: '⚙️' },
];

export default function ModelosSDManager() {
  // Estado principal
  const [modelos, setModelos] = useState<ModeloSD[]>([]);
  const [filtro, setFiltro] = useState<FiltroTipo>('todos');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modeloEditando, setModeloEditando] = useState<ModeloSD | null>(null);
  const [cargando, setCargando] = useState(true);
  const [conexionOk, setConexionOk] = useState<boolean | null>(null);
  const [busqueda, setBusqueda] = useState('');

  // Cargar modelos desde PocketBase o datos demo
  const cargarModelos = useCallback(async () => {
    setCargando(true);
    try {
      // Verificar conexión con PocketBase
      const conectado = await checkConnection();
      setConexionOk(conectado);

      if (conectado) {
        // Modo PocketBase real
        const lista = await pbClient.collection('modelos_sd').getFullList({
          sort: '-created',
        });
        setModelos(lista as unknown as ModeloSD[]);
      } else {
        // Modo demo
        setModelos(demoModelos);
      }
    } catch (err) {
      console.error('Error al cargar modelos:', err);
      setModelos(demoModelos);
      setConexionOk(false);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarModelos();
  }, [cargarModelos]);

  // Filtrar modelos por tipo y búsqueda
  const modelosFiltrados = modelos.filter((m) => {
    const coincideTipo = filtro === 'todos' || m.tipo === filtro;
    const coincideBusqueda = !busqueda || 
      m.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      m.modelo_base.toLowerCase().includes(busqueda.toLowerCase()) ||
      (m.tags && m.tags.toLowerCase().includes(busqueda.toLowerCase()));
    return coincideTipo && coincideBusqueda;
  });

  // Contadores por tipo
  const contadores = {
    todos: modelos.length,
    checkpoint: modelos.filter(m => m.tipo === 'checkpoint').length,
    lora: modelos.filter(m => m.tipo === 'lora').length,
    vae: modelos.filter(m => m.tipo === 'vae').length,
  };

  // Crear nuevo modelo
  const handleCrear = async (data: Partial<ModeloSD>, file?: File | null) => {
    if (isDemoMode()) {
      // Modo demo: agregar al estado local
      const nuevoModelo: ModeloSD = {
        id: `demo-${Date.now()}`,
        nombre: data.nombre || '',
        tipo: data.tipo || 'checkpoint',
        modelo_base: data.modelo_base || '',
        modelo_vae: data.modelo_vae || '',
        upscaler: data.upscaler || '',
        sampler: data.sampler || '',
        steps: data.steps || 0,
        cfg_scale: data.cfg_scale || 0,
        tags: data.tags || '',
        galeria_urls: data.galeria_urls || '',
        url_civitai: data.url_civitai || '',
        prompt_referencia: data.prompt_referencia || '',
        prompt_negativo_default: data.prompt_negativo_default || '',
        imagen_principal: file ? URL.createObjectURL(file) : '',
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
      };
      setModelos(prev => [nuevoModelo, ...prev]);
    } else {
      // PocketBase real
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          formData.append(key, String(value));
        }
      });
      if (file) {
        formData.append('imagen_principal', file);
      }
      const nuevo = await pbClient.collection('modelos_sd').create(formData);
      setModelos(prev => [nuevo as unknown as ModeloSD, ...prev]);
    }
    setModalAbierto(false);
    setModeloEditando(null);
  };

  // Actualizar modelo existente
  const handleEditar = async (data: Partial<ModeloSD>, file?: File | null) => {
    if (!modeloEditando) return;

    if (isDemoMode()) {
      // Modo demo: actualizar en estado local
      setModelos(prev => prev.map(m => {
        if (m.id === modeloEditando.id) {
          return {
            ...m,
            ...data,
            imagen_principal: file ? URL.createObjectURL(file) : m.imagen_principal,
            updated: new Date().toISOString(),
          };
        }
        return m;
      }));
    } else {
      // PocketBase real
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          formData.append(key, String(value));
        }
      });
      if (file) {
        formData.append('imagen_principal', file);
      }
      const actualizado = await pbClient.collection('modelos_sd').update(modeloEditando.id, formData);
      setModelos(prev => prev.map(m => m.id === modeloEditando.id ? actualizado as unknown as ModeloSD : m));
    }
    setModalAbierto(false);
    setModeloEditando(null);
  };

  // Eliminar modelo
  const handleEliminar = async (id: string) => {
    try {
      if (!isDemoMode()) {
        await pbClient.collection('modelos_sd').delete(id);
      }
      setModelos(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      console.error('Error al eliminar:', err);
      alert('Error al eliminar el modelo.');
    }
  };

  // Abrir modal para editar
  const abrirEditar = (modelo: ModeloSD) => {
    setModeloEditando(modelo);
    setModalAbierto(true);
  };

  // Abrir modal para crear nuevo
  const abrirCrear = () => {
    setModeloEditando(null);
    setModalAbierto(true);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Header de la página */}
      <div className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                🤖 Modelos de IA & Checkpoints
              </h1>
              <p className="mt-1 text-slate-400 text-sm sm:text-base">
                Catálogo extendido con galería, VAEs, upscalers y parámetros avanzados
              </p>
            </div>
            <button
              onClick={abrirCrear}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg shadow-lg shadow-cyan-500/20 transition-all hover:shadow-cyan-500/30 active:scale-95"
            >
              <span className="text-lg">+</span> Nuevo Modelo
            </button>
          </div>

          {/* Barra de estado de conexión */}
          {conexionOk !== null && (
            <div className={`mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
              conexionOk 
                ? 'bg-green-500/10 border border-green-500/30 text-green-400' 
                : 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
            }`}>
              <span className={`w-2 h-2 rounded-full ${conexionOk ? 'bg-green-400' : 'bg-amber-400'} animate-pulse`} />
              {conexionOk ? 'Conectado a PocketBase' : 'Modo Demo (PocketBase no disponible)'}
            </div>
          )}
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Barra de filtros y búsqueda */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          {/* Pestañas de filtro */}
          <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-xl p-1">
            {filtros.map((f) => (
              <button
                key={f.key}
                onClick={() => setFiltro(f.key)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  filtro === f.key
                    ? 'bg-cyan-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                <span>{f.icon}</span>
                <span className="hidden sm:inline">{f.label}</span>
                <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
                  filtro === f.key ? 'bg-cyan-500/30' : 'bg-slate-700'
                }`}>
                  {contadores[f.key]}
                </span>
              </button>
            ))}
          </div>

          {/* Búsqueda */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por nombre, base o tags..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all placeholder:text-slate-500"
              />
            </div>
          </div>
        </div>

        {/* Grid de modelos o estado vacío */}
        {cargando ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
            <p className="mt-4 text-slate-400">Cargando modelos...</p>
          </div>
        ) : modelosFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center mb-4 border border-slate-700">
              <span className="text-4xl">📦</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-300 mb-2">
              {busqueda || filtro !== 'todos'
                ? 'No se encontraron modelos con esos filtros'
                : 'No hay modelos registrados'}
            </h3>
            <p className="text-slate-500 max-w-md">
              {busqueda || filtro !== 'todos'
                ? 'Prueba ajustando los filtros o el término de búsqueda.'
                : 'Añade tu primer modelo usando el botón superior.'}
            </p>
            {!busqueda && filtro === 'todos' && (
              <button
                onClick={abrirCrear}
                className="mt-4 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-medium rounded-lg transition-colors"
              >
                + Añadir primer modelo
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {modelosFiltrados.map((modelo) => (
              <ModelCard
                key={modelo.id}
                modelo={modelo}
                onEdit={abrirEditar}
                onDelete={handleEliminar}
              />
            ))}
          </div>
        )}

        {/* Resumen en footer */}
        {modelosFiltrados.length > 0 && (
          <div className="mt-8 pt-4 border-t border-slate-800 text-center text-sm text-slate-500">
            Mostrando {modelosFiltrados.length} de {modelos.length} modelos
          </div>
        )}
      </div>

      {/* Modal de formulario */}
      {modalAbierto && (
        <ModelForm
          onClose={() => {
            setModalAbierto(false);
            setModeloEditando(null);
          }}
          onSave={modeloEditando ? handleEditar : handleCrear}
          modeloInicial={modeloEditando}
        />
      )}
    </div>
  );
}
