import React, { useState } from 'react';
import { X, FolderPlus, Folder, Trash2 } from 'lucide-react';
import type { Modelo } from '../lib/demoData';

interface FolderManagerProps {
  modelos: Modelo[];
  isOpen: boolean;
  onClose: () => void;
  onUpdateModel: (id: string, updates: Partial<Modelo>) => void;
}

export default function FolderManager({ modelos, isOpen, onClose, onUpdateModel }: FolderManagerProps) {
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  if (!isOpen) return null;

  // Obtener carpetas únicas de todos los modelos
  const folders = Array.from(new Set(modelos.map(m => m.carpeta).filter(Boolean))).sort();

  const modelsInFolder = selectedFolder 
    ? modelos.filter(m => m.carpeta === selectedFolder)
    : [];

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    // Las carpetas se crean implícitamente al asignarlas a modelos
    setNewFolderName('');
  };

  const handleMoveToFolder = (modelId: string, folder: string) => {
    onUpdateModel(modelId, { carpeta: folder });
  };

  const handleRemoveFromFolder = (modelId: string) => {
    onUpdateModel(modelId, { carpeta: '' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-slate-900 border border-slate-800/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col backdrop-blur-xl animate-fade-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/50 bg-slate-900/90 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
              <Folder className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                Carpetas y Colecciones
              </h2>
              <p className="text-xs text-slate-500">Organiza tus modelos en carpetas virtuales</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
            {/* Lista de carpetas */}
            <div className="space-y-4">
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 backdrop-blur-sm">
                <h3 className="text-sm font-semibold text-slate-300 mb-3">Carpetas ({folders.length})</h3>
                <div className="space-y-2 mb-4">
                  {folders.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-4">No hay carpetas creadas</p>
                  ) : (
                    folders.map(folder => {
                      const count = modelos.filter(m => m.carpeta === folder).length;
                      return (
                        <button
                          key={folder}
                          onClick={() => setSelectedFolder(folder === selectedFolder ? null : folder)}
                          className={`w-full flex items-center justify-between p-3 rounded-lg transition ${
                            selectedFolder === folder
                              ? 'bg-amber-950/50 border border-amber-700/50'
                              : 'bg-slate-900/50 border border-slate-700/50 hover:border-slate-600/50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Folder className="w-4 h-4 text-amber-400" />
                            <span className="text-sm text-slate-200">{folder}</span>
                          </div>
                          <span className="text-xs text-slate-500">{count}</span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 backdrop-blur-sm">
                <h3 className="text-sm font-semibold text-slate-300 mb-3">Crear carpeta</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Nombre de la carpeta"
                    className="flex-1 px-3 py-2 bg-slate-900/50 border border-slate-700/50 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition"
                  />
                  <button
                    onClick={handleCreateFolder}
                    disabled={!newFolderName.trim()}
                    className="p-2 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 text-white transition shadow-lg"
                  >
                    <FolderPlus className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-2">Las carpetas se crean al asignarlas a modelos</p>
              </div>
            </div>

            {/* Contenido de la carpeta seleccionada */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 backdrop-blur-sm">
              {selectedFolder ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-slate-300">
                      Modelos en "{selectedFolder}" ({modelsInFolder.length})
                    </h3>
                  </div>
                  {modelsInFolder.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-8">No hay modelos en esta carpeta</p>
                  ) : (
                    <div className="space-y-2">
                      {modelsInFolder.map(modelo => (
                        <div
                          key={modelo.id}
                          className="flex items-center justify-between p-3 bg-slate-900/50 border border-slate-700/50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            {modelo.imagen_principal && (
                              <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-800/50">
                                <img src={modelo.imagen_principal} alt={modelo.nombre} className="w-full h-full object-cover" />
                              </div>
                            )}
                            <div>
                              <div className="text-sm font-medium text-slate-200">{modelo.nombre}</div>
                              <div className="text-xs text-slate-500">{modelo.categoria.toUpperCase()} • {modelo.tipo}</div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveFromFolder(modelo.id)}
                            className="p-2 rounded-lg bg-red-950/50 hover:bg-red-900/50 text-red-400 transition"
                            title="Quitar de carpeta"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <Folder className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400 mb-2">Selecciona una carpeta</p>
                  <p className="text-xs text-slate-500">O crea una nueva carpeta para organizar tus modelos</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
