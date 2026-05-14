import React, { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useKanban } from '../utils/hooks'
import { Plus, ArrowLeft, Clock, CheckCircle2, Circle, X, Save, Trash2, RefreshCw } from 'lucide-react'
import { cardAPI } from '../services/api'
import { useAppStore } from '../store'

const LIST_CONFIG: Record<string, {
  color: string; lightColor: string; bg: string; border: string;
  headerBg: string; icon: React.ReactNode; dotColor: string
}> = {
  pending: {
    color: '#ef4444', lightColor: 'text-red-500', bg: 'bg-red-50/80',
    border: 'border-red-200', headerBg: 'bg-red-500/10',
    icon: <Clock size={15} />, dotColor: 'bg-red-400'
  },
  inprogress: {
    color: '#f59e0b', lightColor: 'text-amber-500', bg: 'bg-amber-50/80',
    border: 'border-amber-200', headerBg: 'bg-amber-500/10',
    icon: <Circle size={15} />, dotColor: 'bg-amber-400'
  },
  done: {
    color: '#10b981', lightColor: 'text-emerald-500', bg: 'bg-emerald-50/80',
    border: 'border-emerald-200', headerBg: 'bg-emerald-500/10',
    icon: <CheckCircle2 size={15} />, dotColor: 'bg-emerald-400'
  },
}

export default function KanbanPage() {
  const { boardId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const board = location.state?.board
  const { cards, lists, loading, refetch, createCard } = useKanban(boardId)
  const { updateCard, removeCard } = useAppStore()

  const [showCreate, setShowCreate] = useState<string | null>(null)
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [creating, setCreating] = useState(false)

  const [selectedCard, setSelectedCard] = useState<any>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [saving, setSaving] = useState(false)

  const handleCreate = async (listId: string, listType: string) => {
    if (!newTitle.trim()) return
    setCreating(true)
    await createCard({ title: newTitle.trim(), desc: newDesc.trim(), listId, boardId, list: listType })
    setNewTitle(''); setNewDesc(''); setShowCreate(null); setCreating(false)
  }

  const openCard = (card: any) => {
    setSelectedCard(card); setEditTitle(card.title); setEditDesc(card.desc || '')
  }

  const handleSave = async () => {
    if (!selectedCard) return
    setSaving(true)
    try {
      const res = await cardAPI.update(selectedCard._id, { title: editTitle, desc: editDesc })
      updateCard(selectedCard._id, res.data)
      setSelectedCard(null)
    } catch {}
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!selectedCard || !window.confirm('¿Eliminar esta tarea?')) return
    try {
      await cardAPI.delete(selectedCard._id)
      removeCard(selectedCard._id)
      setSelectedCard(null)
    } catch {}
  }

  const getCards = (listId: string) =>
    cards.filter(c => c.listId === listId || c.list === listId).sort((a, b) => (a.order || 0) - (b.order || 0))

  const sortedLists = lists.sort((a, b) => (a.order || 0) - (b.order || 0))

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="flex items-center gap-4 px-8 py-5 bg-white border-b border-slate-200 shrink-0">
        <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-slate-900">{board?.name || 'Tablero'}</h1>
          <p className="text-slate-400 text-xs mt-0.5">{cards.length} tarea{cards.length !== 1 ? 's' : ''} en total</p>
        </div>
        <button
          onClick={refetch}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
        >
          <RefreshCw size={14} /> Actualizar
        </button>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-x-auto p-8">
        <div
          className="flex gap-6 h-full"
          style={{ minWidth: sortedLists.length > 2 ? `${sortedLists.length * 340}px` : '100%' }}
        >
          {sortedLists.map(list => {
            const cfg = LIST_CONFIG[list.type] || {
              color: '#64748b', lightColor: 'text-slate-500', bg: 'bg-slate-50',
              border: 'border-slate-200', headerBg: 'bg-slate-100',
              icon: <Circle size={15} />, dotColor: 'bg-slate-400'
            }
            const listCards = getCards(list._id)

            return (
              <div
                key={list._id}
                className="flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden"
                style={{ flex: '1', minWidth: '280px', maxWidth: '420px' }}
              >
                {/* Column header */}
                <div className={`px-5 py-4 ${cfg.headerBg} border-b border-slate-100`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-2 h-2 rounded-full ${cfg.dotColor}`} />
                      <span className={`text-sm font-bold uppercase tracking-wider ${cfg.lightColor}`}>
                        {list.name}
                      </span>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full bg-white/80 border ${cfg.border} ${cfg.lightColor}`}>
                      {listCards.length}
                    </span>
                  </div>
                </div>

                {/* Cards */}
                <div className="flex-1 p-3 space-y-2.5 overflow-y-auto min-h-0" style={{ maxHeight: 'calc(100vh - 280px)' }}>
                  {listCards.map(card => (
                    <div
                      key={card._id}
                      onClick={() => openCard(card)}
                      className="bg-white border border-slate-200 rounded-xl p-4 cursor-pointer hover:border-slate-300 hover:shadow-md transition-all group"
                    >
                      <p className="text-sm font-semibold text-slate-800 leading-snug group-hover:text-[#203d7f] transition-colors">
                        {card.title}
                      </p>
                      {card.desc && (
                        <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">{card.desc}</p>
                      )}
                      {card.due && (
                        <div className={`inline-flex items-center gap-1.5 mt-3 px-2.5 py-1 rounded-lg text-xs font-medium ${cfg.bg} ${cfg.lightColor} border ${cfg.border}`}>
                          <Clock size={11} />
                          {new Date(card.due).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                        </div>
                      )}
                    </div>
                  ))}

                  {listCards.length === 0 && showCreate !== list._id && (
                    <div className="flex flex-col items-center justify-center py-10 text-slate-300">
                      <div className={`w-10 h-10 rounded-xl ${cfg.headerBg} flex items-center justify-center mb-2 ${cfg.lightColor}`}>
                        {cfg.icon}
                      </div>
                      <p className="text-xs">Sin tareas</p>
                    </div>
                  )}
                </div>

                {/* Add task */}
                <div className="p-3 border-t border-slate-100">
                  {showCreate === list._id ? (
                    <div className="space-y-2">
                      <input
                        autoFocus
                        value={newTitle}
                        onChange={e => setNewTitle(e.target.value)}
                        placeholder="Título de la tarea..."
                        className="w-full text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#203d7f] focus:ring-2 focus:ring-[#203d7f]/10 bg-slate-50"
                        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleCreate(list._id, list.type)}
                      />
                      <input
                        value={newDesc}
                        onChange={e => setNewDesc(e.target.value)}
                        placeholder="Descripción (opcional)"
                        className="w-full text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#203d7f] bg-slate-50"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCreate(list._id, list.type)}
                          disabled={creating || !newTitle.trim()}
                          className="flex-1 bg-[#203d7f] text-white text-xs font-semibold py-2.5 rounded-xl hover:bg-[#2d52a8] disabled:opacity-50 transition-colors shadow-sm"
                        >
                          {creating ? 'Agregando...' : 'Agregar tarea'}
                        </button>
                        <button
                          onClick={() => { setShowCreate(null); setNewTitle(''); setNewDesc('') }}
                          className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowCreate(list._id)}
                      className={`flex items-center gap-2 text-sm font-medium py-2 px-3 rounded-xl w-full transition-all ${cfg.lightColor} hover:${cfg.bg} hover:${cfg.border}`}
                      style={{ color: cfg.color + '99' }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = cfg.color + '10')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <Plus size={16} style={{ color: cfg.color }} /> Agregar tarea
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Card detail modal */}
      {selectedCard && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-lg">Editar tarea</h3>
              <div className="flex items-center gap-2">
                <button onClick={handleDelete} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                  <Trash2 size={16} />
                </button>
                <button onClick={() => setSelectedCard(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
                  <X size={16} />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-slate-600 text-sm font-semibold mb-2 block">Título</label>
                <input
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#203d7f] focus:ring-2 focus:ring-[#203d7f]/10 bg-slate-50"
                />
              </div>
              <div>
                <label className="text-slate-600 text-sm font-semibold mb-2 block">Descripción</label>
                <textarea
                  value={editDesc}
                  onChange={e => setEditDesc(e.target.value)}
                  rows={4}
                  placeholder="Sin descripción"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#203d7f] focus:ring-2 focus:ring-[#203d7f]/10 resize-none bg-slate-50"
                />
              </div>
              <p className="text-xs text-slate-400">
                Creado: {new Date(selectedCard.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <div className="flex gap-3 p-6 pt-0">
              <button onClick={() => setSelectedCard(null)} className="flex-1 border border-slate-200 text-slate-600 py-3 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors">
                Cancelar
              </button>
              <button onClick={handleSave} disabled={saving} className="flex-1 bg-[#203d7f] text-white py-3 rounded-xl text-sm font-semibold hover:bg-[#2d52a8] disabled:opacity-60 transition-colors flex items-center justify-center gap-2 shadow-sm">
                <Save size={14} /> {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}