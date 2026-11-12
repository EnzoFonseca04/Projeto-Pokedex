import React, { useState } from 'react';
import { useTeam } from '../context/TeamContext';
import { POKEMON_TYPES } from '../data/types';
import { formatPokemonId, capitalize } from '../services/pokeApi';
import {
  X,
  Trash2,
  Share2,
  Dices,
  ShieldAlert,
  ShieldCheck,
  Activity,
  GripVertical,
  Plus,
  Sparkles,
  Layers,
} from 'lucide-react';
import ExportModal from './ExportModal';

export default function TeamBuilderDrawer({ isOpen, onClose, onSelectPokemonForDetail, availableList }) {
  const {
    team,
    addToTeam,
    removeFromTeam,
    clearTeam,
    reorderTeam,
    teamAnalysis,
  } = useTeam();

  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [draggedSlotIndex, setDraggedSlotIndex] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [activeTab, setActiveTab] = useState('slots'); // 'slots' | 'analysis'

  if (!isOpen) return null;

  // Handle Drag & Drop onto a Team Slot
  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = (e, index) => {
    if (dragOverIndex === index) {
      setDragOverIndex(null);
    }
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    setDragOverIndex(null);

    // If dragging from an existing team slot to reorder
    if (draggedSlotIndex !== null) {
      reorderTeam(draggedSlotIndex, targetIndex);
      setDraggedSlotIndex(null);
      return;
    }

    // Dropping from the main Pokédex list
    try {
      const dataStr = e.dataTransfer.getData('application/json');
      if (dataStr) {
        const pokemon = JSON.parse(dataStr);
        addToTeam(pokemon, targetIndex);
      }
    } catch (err) {
      console.error('Drop error:', err);
    }
  };

  // Dragging an existing member to reorder
  const handleSlotDragStart = (e, index) => {
    setDraggedSlotIndex(index);
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleSlotDragEnd = () => {
    setDraggedSlotIndex(null);
    setDragOverIndex(null);
  };

  // Randomize Team feature
  const handleRandomize = () => {
    if (!availableList || availableList.length === 0) return;
    clearTeam();
    const shuffled = [...availableList].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 6);
    selected.forEach((p) => {
      addToTeam(p);
    });
  };

  // Find severe weaknesses in team (e.g. 3 or more members weak to the same type)
  const severeWeaknesses = Object.entries(teamAnalysis.weaknesses)
    .filter(([_, count]) => count >= 3)
    .sort((a, b) => b[1] - a[1]);

  const strongResistances = Object.entries(teamAnalysis.resistances)
    .filter(([_, count]) => count >= 3)
    .sort((a, b) => b[1] - a[1]);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide-in Lateral Panel */}
      <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col animate-slideLeft">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-red-600/20">
              <span className="font-black text-sm">6</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white">Team Builder</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-500/20 text-red-400 border border-red-500/30">
                  {team.length}/6 Pokémon
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Monte, organize e analise sua equipe
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Tabs & Quick Tools */}
        <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('slots')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'slots'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Slots ({team.length})
            </button>
            <button
              onClick={() => setActiveTab('analysis')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                activeTab === 'analysis'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-blue-400" />
              <span>Análise</span>
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleRandomize}
              title="Gerar Time Aleatório"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 border border-slate-700 transition-colors"
            >
              <Dices className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowExportModal(true)}
              disabled={team.length === 0}
              title="Exportar Time (Showdown / Texto)"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-blue-400 border border-slate-700 transition-colors disabled:opacity-40"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={clearTeam}
              disabled={team.length === 0}
              title="Limpar todos os slots"
              className="p-2 rounded-xl bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-400 border border-slate-700 transition-colors disabled:opacity-40"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {activeTab === 'slots' ? (
            <>
              {/* Instructions banner */}
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-400 flex items-center gap-2.5">
                <span className="text-red-400 text-base">💡</span>
                <span>
                  <strong>Dica:</strong> Arraste cards da Pokédex diretamente para qualquer slot, ou clique em <strong>+Time</strong>.
                </span>
              </div>

              {/* 6 Slots Grid / List */}
              <div className="space-y-2.5">
                {Array.from({ length: 6 }).map((_, slotIndex) => {
                  const member = team[slotIndex];
                  const isDragOver = dragOverIndex === slotIndex;

                  if (member) {
                    const primaryType = member.types?.[0] || 'normal';
                    const typeConfig = POKEMON_TYPES[primaryType] || POKEMON_TYPES.normal;

                    return (
                      <div
                        key={member.id}
                        draggable={true}
                        onDragStart={(e) => handleSlotDragStart(e, slotIndex)}
                        onDragEnd={handleSlotDragEnd}
                        onDragOver={(e) => handleDragOver(e, slotIndex)}
                        onDragLeave={(e) => handleDragLeave(e, slotIndex)}
                        onDrop={(e) => handleDrop(e, slotIndex)}
                        className={`group relative rounded-2xl bg-slate-800/80 border transition-all duration-200 p-2.5 flex items-center justify-between cursor-pointer select-none ${
                          isDragOver
                            ? 'border-red-500 scale-[1.02] bg-slate-800 ring-2 ring-red-500/30 shadow-lg shadow-red-500/20'
                            : 'border-slate-700 hover:border-slate-600 shadow-md'
                        }`}
                        onClick={() => onSelectPokemonForDetail(member.id)}
                      >
                        {/* Drag Handle & Slot Number */}
                        <div className="flex items-center gap-2">
                          <span
                            className="text-slate-500 group-hover:text-slate-300 cursor-grab active:cursor-grabbing p-1"
                            title="Arraste para reordenar"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <GripVertical className="w-4 h-4" />
                          </span>

                          <span className="font-mono text-xs font-black text-slate-500 w-4">
                            #{slotIndex + 1}
                          </span>

                          {/* Sprite */}
                          <div
                            className="w-12 h-12 rounded-xl bg-slate-950/80 border border-slate-700/60 p-1 flex items-center justify-center relative overflow-hidden"
                            style={{
                              boxShadow: `0 0 15px ${typeConfig.color}20`,
                            }}
                          >
                            <img
                              src={member.sprite}
                              alt={member.name}
                              className="max-h-full max-w-full object-contain drop-shadow"
                            />
                          </div>

                          {/* Info */}
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-sm font-black text-white group-hover:text-red-400 transition-colors truncate max-w-[130px]">
                                {capitalize(member.name)}
                              </h4>
                              <span className="font-mono text-[10px] font-bold text-slate-500">
                                {formatPokemonId(member.id)}
                              </span>
                            </div>

                            {/* Type badges */}
                            <div className="flex items-center gap-1 mt-1">
                              {member.types.map((t) => {
                                const tc = POKEMON_TYPES[t] || POKEMON_TYPES.normal;
                                return (
                                  <span
                                    key={t}
                                    style={{
                                      backgroundColor: `${tc.color}25`,
                                      borderColor: `${tc.color}50`,
                                      color: tc.color,
                                    }}
                                    className="px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase border"
                                  >
                                    {tc.name}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Remove Action */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromTeam(slotIndex);
                          }}
                          title="Remover do time"
                          className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-700/60 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  }

                  // Empty Slot
                  return (
                    <div
                      key={`empty-${slotIndex}`}
                      onDragOver={(e) => handleDragOver(e, slotIndex)}
                      onDragLeave={(e) => handleDragLeave(e, slotIndex)}
                      onDrop={(e) => handleDrop(e, slotIndex)}
                      className={`relative rounded-2xl border-2 border-dashed transition-all duration-200 p-4 flex items-center justify-between ${
                        isDragOver
                          ? 'border-red-500 bg-red-500/10 scale-[1.02] ring-2 ring-red-500/30'
                          : 'border-slate-800 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-900/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-black text-slate-600 w-4">
                          #{slotIndex + 1}
                        </span>

                        <div className="w-12 h-12 rounded-xl border border-dashed border-slate-700/80 bg-slate-900/50 flex items-center justify-center text-slate-600">
                          <Plus className="w-5 h-5" />
                        </div>

                        <div>
                          <p className="text-xs font-bold text-slate-400">
                            Slot Disponível
                          </p>
                          <p className="text-[10px] text-slate-500">
                            Solte um Pokémon aqui
                          </p>
                        </div>
                      </div>

                      <span className="text-[10px] font-mono text-slate-600 uppercase px-2 py-1 rounded bg-slate-900 border border-slate-800">
                        Vazio
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            /* Analysis Tab */
            <div className="space-y-4">
              {team.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs font-medium">
                  Adicione pelo menos 1 Pokémon ao time para visualizar o relatório de análise e fraquezas.
                </div>
              ) : (
                <>
                  {/* Average Stats */}
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xs font-black uppercase text-slate-300 flex items-center gap-1.5">
                        <Activity className="w-4 h-4 text-emerald-400" />
                        Média de Status do Time
                      </h3>
                      <span className="font-mono text-xs font-extrabold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                        Total: {teamAnalysis.averageStats.total}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {[
                        { label: 'HP', val: teamAnalysis.averageStats.hp },
                        { label: 'Ataque', val: teamAnalysis.averageStats.attack },
                        { label: 'Defesa', val: teamAnalysis.averageStats.defense },
                        { label: 'Atq. Esp.', val: teamAnalysis.averageStats.specialAttack },
                        { label: 'Def. Esp.', val: teamAnalysis.averageStats.specialDefense },
                        { label: 'Velocidade', val: teamAnalysis.averageStats.speed },
                      ].map((s) => (
                        <div key={s.label} className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex justify-between items-center">
                          <span className="text-slate-400 font-semibold">{s.label}</span>
                          <span className="font-mono font-bold text-white">{s.val}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Severe Weakness Warnings */}
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                    <h3 className="text-xs font-black uppercase text-slate-300 flex items-center gap-1.5 mb-2.5">
                      <ShieldAlert className="w-4 h-4 text-rose-500" />
                      Fraquezas Críticas do Time
                    </h3>

                    {severeWeaknesses.length === 0 ? (
                      <p className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        Excelente equilíbrio! Nenhum tipo tem 3+ vantagens contra seu time.
                      </p>
                    ) : (
                      <div className="space-y-1.5">
                        <p className="text-[11px] text-slate-400 mb-2">
                          Tipos com vantagem contra múltiplos membros:
                        </p>
                        {severeWeaknesses.map(([type, count]) => {
                          const tc = POKEMON_TYPES[type] || POKEMON_TYPES.normal;
                          return (
                            <div
                              key={type}
                              className="p-2 rounded-xl bg-red-950/20 border border-red-500/30 flex items-center justify-between text-xs"
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className="w-2.5 h-2.5 rounded-full"
                                  style={{ backgroundColor: tc.color }}
                                />
                                <span className="font-bold text-white">{tc.name}</span>
                              </div>
                              <span className="text-rose-400 font-bold text-[11px]">
                                {count} Pokémon vulneráveis
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Strong Resistances */}
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                    <h3 className="text-xs font-black uppercase text-slate-300 flex items-center gap-1.5 mb-2.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      Maiores Resistências do Time
                    </h3>

                    {strongResistances.length === 0 ? (
                      <p className="text-xs text-slate-500">
                        Nenhuma resistência concentrada acima de 3 membros.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {strongResistances.map(([type, count]) => {
                          const tc = POKEMON_TYPES[type] || POKEMON_TYPES.normal;
                          return (
                            <span
                              key={type}
                              className="px-2.5 py-1 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5"
                            >
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: tc.color }}
                              />
                              {tc.name} ({count}x)
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            {6 - team.length === 0 ? 'Equipe completa!' : `${6 - team.length} vaga(s) restante(s)`}
          </span>
          <button
            onClick={() => setShowExportModal(true)}
            disabled={team.length === 0}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 transition-all shadow-lg shadow-red-600/20 disabled:opacity-40"
          >
            Exportar Time
          </button>
        </div>

      </aside>

      {/* Export Modal */}
      {showExportModal && (
        <ExportModal team={team} onClose={() => setShowExportModal(false)} />
      )}
    </>
  );
}
