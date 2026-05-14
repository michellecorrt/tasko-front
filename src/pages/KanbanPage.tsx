import React, { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useKanban } from '../utils/hooks'
import { Plus, ArrowLeft, Clock, CheckCircle2, Circle, X, Save, Trash2 } from 'lucide-react'
import { cardAPI } from '../services/api'
import { useAppStore } from '../store'

const LIST_META: Record<string, { color: string; bg: string; label: string; icon: React.ReactNode }> = {
  pending:    { color: 'text-red-500',    bg: 'bg-red-50 border-red-100',    label: 'Pending',      icon: <Clock size={14} /> },
  inprogress: { color: 'text-amber-500',  bg: 'bg-amber-50 border-amber-100', label: 'In Progress',  icon: <Circle size={14} /> },
  done:       { color: 'text-emerald-500',bg: 'bg-emerald-50 border-emerald-100', label: 'Done',    icon: <CheckCircle2 size={14} /> },
}

export default function KanbanPage() {
  const { boardId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const board = location.state?.board
  const { cards, lists, loading, refetch } = useKanban(boardId)
  const { updateCard, removeCard } = useAppStore()

  const [showCreate, setShowCreate] = useState<string | null>(null)
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [creating, setCreating] = useState(false)

  const [selectedCard, setSelectedCard] = useState<any>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [saving, setSaving] = useState(false)

  const { createCard } = useKanban(boardId)

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
    if (!selectedCard) return
    if (!window.confirm('¿Eliminar esta tarea?')) return
    try {
      await cardAPI.delete(selectedCard._id)
      removeCard(selectedCard._id)
      setSelectedCard(null)
    } catch {}
  }

  const getCards = (listId: string) =>
    cards.filter(c => c.listId === listId || c.list === listId).sort((a, b) => (a.order || 0) - (b.order || 0))

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-200 bg-white shrink-0">
        <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-slate-600 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-slate-900">{board?.name || 'Tablero'}</h1>
          <p className="text-slate-400 text-xs">{cards.length} tareas</p>
        </div>
        <button onClick={refetch} className="text-slate-400 hover:text-slate-600 text-xs px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
          Actualizar
        </button>
      </div>

      {/* Kanban columns */}
      <div className="flex-1 overflow-x-auto kanban-scroll">
        <div className="flex gap-5 p-6 h-full min-h-0" style={{ minWidth: `${lists.length * 300 + 48}px` }}>
          {lists.sort((a, b) => (a.order || 0) - (b.order || 0)).map(list => {
            const meta = LIST_META[list.type] || { color: 'text-slate-500', bg: 'bg-slate-50 border-slate-100', label: list.name, icon: <Circle size={14} /> }
            const listCards = getCards(list._id)

            return (
              <div key={list._id} className="flex flex-col w-72 shrink-0">
                {/* Column header */}
                <div className="flex items-center gap-2 mb-3">
                  <span className={meta.color}>{meta.icon}</span>
                  <span className={`text-sm font-semibold uppercase tracking-wide ${meta.color}`}>{list.name}</span>
                  <span className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded-full ${meta.color} ${meta.bg} border`}>
                    {listCards.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="flex-1 space-y-2 overflow-y-auto min-h-0">
                  {listCards.map(card => (
                    <div
                      key={card._id}
                      onClick={() => openCard(card)}
                      className="bg-white border border-slate-200 rounded-xl p-3.5 cursor-pointer hover:border-[#203d7f]/30 hover:shadow-sm transition-all"
                    >
                      <p className="text-sm font-medium text-slate-900 leading-snug">{card.title}</p>
                      {card.desc && <p className="text-xs text-slate-400 mt-1.5 line-clamp-2">{card.desc}</p>}
                      {card.due && (
                        <div className="flex items-center gap-1 mt-2 text-amber-500 text-xs">
                          <Clock size={11} />
                          {new Date(card.due).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Add card */}
                {showCreate === list._id ? (
                  <div className="mt-2 bg-white border border-slate-200 rounded-xl p-3 space-y-2">
                    <input
                      autoFocus
                      value={newTitle}
                      onChange={e => setNewTitle(e.target.value)}
                      placeholder="Título de la tarea"
                      className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#203d7f]"
                      onKeyDown={e => e.key === 'Enter' && handleCreate(list._id, list.type)}
                    />
                    <input
                      value={newDesc}
                      onChange={e => setNewDesc(e.target.value)}
                      placeholder="Descripción (opcional)"
                      className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#203d7f]"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCreate(list._id, list.type)}
                        disabled={creating || !newTitle.trim()}
                        className="flex-1 bg-[#203d7f] text-white text-xs font-medium py-2 rounded-lg hover:bg-[#2d52a8] disabled:opacity-50 transition-colors"
                      >
                        {creating ? 'Creando...' : 'Agregar'}
                      </button>
                      <button onClick={() => { setShowCreate(null); setNewTitle(''); setNewDesc('') }} className="p-2 text-slate-400 hover:text-slate-600">
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowCreate(list._id)}
                    className="mt-2 flex items-center gap-1.5 text-slate-400 hover:text-[#203d7f] text-sm py-2 px-3 rounded-xl hover:bg-[#203d7f]/5 transition-all w-full"
                  >
                    <Plus size={15} /> Agregar tarea
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Card detail modal */}
      {selectedCard && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900">Detalles de tarea</h3>
              <div className="flex items-center gap-2">
                <button onClick={handleDelete} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={16} />
                </button>
                <button onClick={() => setSelectedCard(null)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-slate-600 text-sm font-medium mb-1.5 block">Título</label>
                <input
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#203d7f]"
                />
              </div>
              <div>
                <label className="text-slate-600 text-sm font-medium mb-1.5 block">Descripción</label>
                <textarea
                  value={editDesc}
                  onChange={e => setEditDesc(e.target.value)}
                  rows={4}
                  placeholder="Sin descripción"
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#203d7f] resize-none"
                />
              </div>
              <div className="text-xs text-slate-400">
                Creado: {new Date(selectedCard.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>
            <div className="flex gap-3 p-6 pt-0">
              <button onClick={() => setSelectedCard(null)} className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-50">Cancelar</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 bg-[#203d7f] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#2d52a8] disabled:opacity-60 transition-colors flex items-center justify-center gap-2">
                <Save size={14} /> {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
