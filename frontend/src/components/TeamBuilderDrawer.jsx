import React, { useState } from 'react';
import { useTeam } from '../context/TeamContext';
import { POKEMON_TYPES } from '../data/types';
import { formatPokemonId, capitalize } from '../services/pokeApi';
import {
  Trash2,
  Share2,
  Dices,
  ShieldAlert,
  ShieldCheck,
  Activity,
  GripVertical,
  Plus,
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
        className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide-in Lateral Panel estilo GBA FireRed / Emerald PC Box */}
      <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[#122824] border-l-4 border-[#0c1e1a] shadow-[0_0_50px_rgba(0,0,0,0.85)] flex flex-col animate-slideLeft select-none">
        
        {/* Cabeçalho Retrô Estilo Barra GBA Fame Checker */}
        <div className="relative bg-[#2054c8] border-b-2 border-[#0e1c38] flex items-stretch overflow-hidden min-h-[58px]">
          {/* Aba Laranja com Corte Diagonal */}
          <div
            className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-[#ea7028] to-[#f89848] border-r-2 border-[#984010] shrink-0"
            style={{
              clipPath: 'polygon(0 0, 100% 0, calc(100% - 14px) 100%, 0 100%)',
              paddingRight: '1.5rem',
            }}
          >
            <span
              className="text-xs sm:text-sm font-black text-white tracking-wider uppercase"
              style={{
                textShadow: '2px 2px 0px #803008',
              }}
            >
              EQUIPE
            </span>
            <span className="px-1.5 py-0.2 rounded-sm bg-[#f8d030] text-[#381c00] text-[9px] font-black border border-[#a07008]">
              {team.length}/6
            </span>
          </div>

          {/* Área Azul com Botão de Fechar Retrô [B] SAIR */}
          <div className="flex-1 flex items-center justify-end px-3 py-2">
            <button
              onClick={onClose}
              title="Fechar (Esc)"
              className="px-2.5 py-1 text-[10px] font-black rounded-sm bg-[#e8ece8] hover:bg-[#fedcd0] text-[#881810] border-2 border-[#184840] shadow-[0_2px_0_#14342e] active:translate-y-0.5 active:shadow-none flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <span className="w-3.5 h-3.5 rounded-full bg-[#d83828] text-white flex items-center justify-center text-[9px] font-black">
                B
              </span>
              <span>SAIR</span>
            </button>
          </div>
        </div>

        {/* Faixa Amarela GBA */}
        <div className="h-1 bg-[#f8d030] border-b border-[#a88010]" />

        {/* Barra de Ferramentas Retrô: Abas e Botões GBA */}
        <div className="px-3 py-2 bg-[#183630] border-b-2 border-[#0e201c] flex items-center justify-between gap-2">
          {/* Abas Retrô com Rótulos de Controle */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('slots')}
              className={`px-2.5 py-1 rounded-sm border-2 text-[9px] sm:text-[10px] font-black transition-all flex items-center gap-1 cursor-pointer ${
                activeTab === 'slots'
                  ? 'bg-[#fcf8d8] text-[#1c3830] border-[#889050] shadow-[0_2px_0_#485830]'
                  : 'bg-[#102420] text-[#a0d0c4] border-[#0a1814] hover:bg-[#16302a]'
              }`}
            >
              <span className="text-[#388878] font-black">+</span>
              <span>SLOTS ({team.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('analysis')}
              className={`px-2.5 py-1 rounded-sm border-2 text-[9px] sm:text-[10px] font-black transition-all flex items-center gap-1 cursor-pointer ${
                activeTab === 'analysis'
                  ? 'bg-[#fcf8d8] text-[#1c3830] border-[#889050] shadow-[0_2px_0_#485830]'
                  : 'bg-[#102420] text-[#a0d0c4] border-[#0a1814] hover:bg-[#16302a]'
              }`}
            >
              <Activity className="w-3 h-3 text-[#3888f8]" />
              <span>ANÁLISE</span>
            </button>
          </div>

          {/* Botões de Ação Rápida Retrô ([R] Random, [START] Export, [B] Limpar) */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleRandomize}
              title="Gerar Equipe Aleatória"
              className="p-1.5 sm:px-2 sm:py-1 rounded-sm bg-[#e8ece8] hover:bg-white text-[#183828] border-2 border-[#587868] shadow-[0_2px_0_#385044] active:translate-y-0.5 active:shadow-none transition-all flex items-center gap-1 cursor-pointer"
            >
              <Dices className="w-3.5 h-3.5 text-[#e87820]" />
              <span className="text-[9px] font-black hidden sm:inline">RND</span>
            </button>
            <button
              onClick={() => setShowExportModal(true)}
              disabled={team.length === 0}
              title="Exportar Equipe (Showdown)"
              className="p-1.5 sm:px-2 sm:py-1 rounded-sm bg-[#e8ece8] hover:bg-white text-[#183828] border-2 border-[#587868] shadow-[0_2px_0_#385044] active:translate-y-0.5 active:shadow-none transition-all flex items-center gap-1 cursor-pointer disabled:opacity-40"
            >
              <Share2 className="w-3.5 h-3.5 text-[#2060d8]" />
              <span className="text-[9px] font-black hidden sm:inline">EXP</span>
            </button>
            <button
              onClick={clearTeam}
              disabled={team.length === 0}
              title="Limpar equipe"
              className="p-1.5 sm:px-2 sm:py-1 rounded-sm bg-[#f8d8d4] hover:bg-[#fed0cc] text-[#881810] border-2 border-[#a84838] shadow-[0_2px_0_#682818] active:translate-y-0.5 active:shadow-none transition-all flex items-center gap-1 cursor-pointer disabled:opacity-40"
            >
              <Trash2 className="w-3.5 h-3.5 text-[#d83828]" />
            </button>
          </div>
        </div>

        {/* Corpo do Drawer com Listas de Slots */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5 bg-[#122824]">
          {activeTab === 'slots' ? (
            <>
              {/* Dica Retrô */}
              <div className="p-2.5 rounded-sm bg-[#1a3832] border-2 border-[#2c544a] text-[10px] text-[#b8e8dc] flex items-center gap-2">
                <span className="text-[#f8d030] text-sm font-black">💡</span>
                <span>
                  Arraste Pokémon da lista ou use <strong>+TIME</strong> no card para preencher.
                </span>
              </div>

              {/* 6 Slots da Equipe estilo GBA PC Box */}
              <div className="space-y-2">
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
                        className={`group relative rounded-sm bg-[#1a3832] border-2 transition-all duration-150 p-2 flex items-center justify-between cursor-pointer select-none shadow-[0_2px_0_rgba(0,0,0,0.3)] ${
                          isDragOver
                            ? 'border-[#f8d030] scale-[1.02] bg-[#224840] ring-2 ring-[#f8d030]/50'
                            : 'border-[#38685c] hover:border-[#68b8a0]'
                        }`}
                        onClick={() => onSelectPokemonForDetail(member.id)}
                      >
                        {/* Drag Handle & Slot Number */}
                        <div className="flex items-center gap-2">
                          <span
                            className="text-[#689888] group-hover:text-white cursor-grab active:cursor-grabbing p-0.5"
                            title="Arraste para reordenar"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <GripVertical className="w-3.5 h-3.5" />
                          </span>

                          <span className="font-mono text-[10px] font-black text-[#f8d030] w-5">
                            #{slotIndex + 1}
                          </span>

                          {/* Sprite 2D com pedestal de batalha */}
                          <div
                            className="w-12 h-12 rounded-sm bg-[#0c1c18] border border-[#2c544a] flex items-center justify-center relative overflow-hidden"
                            style={{
                              boxShadow: `0 0 10px ${typeConfig.color}30`,
                            }}
                          >
                            <div className="absolute bottom-1 w-9 h-2.5 rounded-[100%] bg-emerald-900/50" />
                            <img
                              src={member.sprite}
                              alt={member.name}
                              style={{ imageRendering: 'pixelated' }}
                              className="max-h-10 max-w-10 object-contain drop-shadow z-10"
                            />
                          </div>

                          {/* Info */}
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-xs font-black text-white group-hover:text-[#f8d030] transition-colors uppercase truncate max-w-[130px]">
                                {capitalize(member.name)}
                              </h4>
                              <span className="font-mono text-[9px] font-bold text-[#88b8a8]">
                                {formatPokemonId(member.id)}
                              </span>
                            </div>

                            {/* Badges de Tipo Pixel Art */}
                            <div className="flex items-center gap-1 mt-1">
                              {member.types.map((t) => {
                                const tc = POKEMON_TYPES[t] || POKEMON_TYPES.normal;
                                return (
                                  <span
                                    key={t}
                                    style={{
                                      backgroundColor: tc.color,
                                    }}
                                    className="px-1.5 py-0.2 rounded-sm text-[8px] font-black uppercase text-white border border-black/30"
                                  >
                                    {tc.name}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Botão Retrô de Remover */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromTeam(slotIndex);
                          }}
                          title="Remover do time"
                          className="px-2 py-1 rounded-sm text-[9px] font-black bg-[#d83828] hover:bg-[#e84838] text-white border border-[#881810] shadow-[0_2px_0_#501008] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                        >
                          X
                        </button>
                      </div>
                    );
                  }

                  // Empty Slot Estilo Caixa Vazia do GBA
                  return (
                    <div
                      key={`empty-${slotIndex}`}
                      onDragOver={(e) => handleDragOver(e, slotIndex)}
                      onDragLeave={(e) => handleDragLeave(e, slotIndex)}
                      onDrop={(e) => handleDrop(e, slotIndex)}
                      className={`relative rounded-sm border-2 border-dashed transition-all duration-150 p-3 flex items-center justify-between ${
                        isDragOver
                          ? 'border-[#f8d030] bg-[#1a4038] scale-[1.02]'
                          : 'border-[#284840] bg-[#0e201c] hover:border-[#3c685c]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-[10px] font-black text-[#587868] w-5">
                          #{slotIndex + 1}
                        </span>

                        <div className="w-10 h-10 rounded-sm border border-dashed border-[#386054] bg-[#0a1814] flex items-center justify-center text-[#587868]">
                          <Plus className="w-4 h-4" />
                        </div>

                        <div>
                          <p className="text-[10px] font-black text-[#98c8bc] uppercase">
                            Slot Livre
                          </p>
                          <p className="text-[8px] text-[#588878]">
                            Solte um Pokémon aqui
                          </p>
                        </div>
                      </div>

                      <span className="text-[8px] font-black text-[#587868] uppercase px-1.5 py-0.5 rounded-sm bg-[#0a1814] border border-[#203830]">
                        VAZIO
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            /* Analysis Tab */
            <div className="space-y-3">
              {team.length === 0 ? (
                <div className="py-12 text-center text-[#689888] text-[10px] font-black bg-[#0e201c] p-6 rounded-sm border-2 border-[#203830]">
                  Adicione pelo menos 1 Pokémon ao time para visualizar o relatório de status e fraquezas.
                </div>
              ) : (
                <>
                  {/* Média de Status */}
                  <div className="p-3 rounded-sm bg-[#1a3832] border-2 border-[#2c544a]">
                    <div className="flex items-center justify-between mb-2 pb-1 border-b border-[#2c544a]">
                      <h3 className="text-[10px] font-black uppercase text-white flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-[#3888f8]" />
                        Média de Status
                      </h3>
                      <span className="font-mono text-[10px] font-black text-[#f8d030] bg-[#0c1c18] px-2 py-0.5 rounded-sm border border-[#203830]">
                        BST: {teamAnalysis.averageStats.total}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 text-[9px] font-black">
                      {[
                        { label: 'HP', val: teamAnalysis.averageStats.hp },
                        { label: 'Ataque', val: teamAnalysis.averageStats.attack },
                        { label: 'Defesa', val: teamAnalysis.averageStats.defense },
                        { label: 'Atq. Esp.', val: teamAnalysis.averageStats.specialAttack },
                        { label: 'Def. Esp.', val: teamAnalysis.averageStats.specialDefense },
                        { label: 'Velocidade', val: teamAnalysis.averageStats.speed },
                      ].map((s) => (
                        <div key={s.label} className="p-1.5 rounded-sm bg-[#0c1c18] border border-[#203830] flex justify-between items-center">
                          <span className="text-[#88b8a8]">{s.label}</span>
                          <span className="font-mono text-white">{s.val}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Fraquezas Críticas */}
                  <div className="p-3 rounded-sm bg-[#1a3832] border-2 border-[#2c544a]">
                    <h3 className="text-[10px] font-black uppercase text-white flex items-center gap-1.5 mb-2">
                      <ShieldAlert className="w-3.5 h-3.5 text-[#d83828]" />
                      Fraquezas Críticas do Time
                    </h3>

                    {severeWeaknesses.length === 0 ? (
                      <p className="text-[10px] text-[#48b878] font-bold flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#48b878]" />
                        Excelente equilíbrio! Nenhum tipo tem 3+ vantagens contra seu time.
                      </p>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-[9px] text-[#88b8a8] mb-1">
                          Tipos com vantagem contra múltiplos membros:
                        </p>
                        {severeWeaknesses.map(([type, count]) => {
                          const tc = POKEMON_TYPES[type] || POKEMON_TYPES.normal;
                          return (
                            <div
                              key={type}
                              className="p-1.5 rounded-sm bg-[#0c1c18] border border-[#d83828]/40 flex items-center justify-between text-[9px] font-black"
                            >
                              <div className="flex items-center gap-1.5">
                                <span
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: tc.color }}
                                />
                                <span className="text-white">{tc.name}</span>
                              </div>
                              <span className="text-[#e85848]">
                                {count} vulneráveis
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Resistências */}
                  <div className="p-3 rounded-sm bg-[#1a3832] border-2 border-[#2c544a]">
                    <h3 className="text-[10px] font-black uppercase text-white flex items-center gap-1.5 mb-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#48b878]" />
                      Maiores Resistências
                    </h3>

                    {strongResistances.length === 0 ? (
                      <p className="text-[9px] text-[#689888]">
                        Nenhuma resistência concentrada acima de 3 membros.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {strongResistances.map(([type, count]) => {
                          const tc = POKEMON_TYPES[type] || POKEMON_TYPES.normal;
                          return (
                            <span
                              key={type}
                              style={{ backgroundColor: tc.color }}
                              className="px-2 py-0.5 rounded-sm text-white text-[9px] font-black flex items-center gap-1 border border-black/30"
                            >
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

        {/* Rodapé com Botão Retrô de Exportação */}
        <div className="p-3 border-t-2 border-[#0e201c] bg-[#183630] flex items-center justify-between">
          <span className="text-[10px] font-black text-[#a0d0c4]">
            {6 - team.length === 0 ? 'TIME COMPLETO!' : `${6 - team.length} VAGA(S)`}
          </span>
          <button
            onClick={() => setShowExportModal(true)}
            disabled={team.length === 0}
            className="px-3.5 py-2 rounded-sm text-[10px] font-black text-[#381c00] bg-[#f8d030] hover:bg-[#fedd50] border-2 border-[#987008] shadow-[0_3px_0_#684800] active:translate-y-0.5 active:shadow-none transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
          >
            <span>[START] EXPORTAR TIME</span>
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
