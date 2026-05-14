import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBoards, useWorkspaces } from '../utils/hooks'
import { useAppStore } from '../store'
import { Plus, Grid3X3, ArrowRight, CheckCircle2, Clock, Circle, Zap, Bell, X, Check } from 'lucide-react'

interface QuickTask {
  id: string
  text: string
  done: boolean
  createdAt: string
}

function useQuickTasks() {
  const [tasks, setTasks] = useState<QuickTask[]>(() => {
    try { return JSON.parse(localStorage.getItem('quickTasks') || '[]') } catch { return [] }
  })
  const save = (t: QuickTask[]) => { setTasks(t); localStorage.setItem('quickTasks', JSON.stringify(t)) }
  const add = (text: string) => {
    if (!text.trim()) return
    save([{ id: Date.now().toString(), text: text.trim(), done: false, createdAt: new Date().toISOString() }, ...tasks])
  }
  const toggle = (id: string) => save(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t))
  const remove = (id: string) => save(tasks.filter(t => t.id !== id))
  const clearDone = () => save(tasks.filter(t => !t.done))
  return { tasks, add, toggle, remove, clearDone }
}

export default function PersonalBoardsPage() {
  const { workspaces } = useWorkspaces()
  const { setCurrentWorkspace, cards, lists, notifications } = useAppStore()
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)
  const [boardName, setBoardName] = useState('')
  const [error, setError] = useState('')
  const boardCreatedRef = useRef(false)
  const [quickInput, setQuickInput] = useState('')
  const { tasks, add, toggle, remove, clearDone } = useQuickTasks()

  const personalWorkspace = workspaces.find(w => w.name === 'Personal')
  const { boards, createBoard, loading } = useBoards(personalWorkspace?._id)
  const personalBoards = boards.filter(b => b.workspaceId === personalWorkspace?._id)

  useEffect(() => {
    if (personalWorkspace) setCurrentWorkspace(personalWorkspace)
  }, [personalWorkspace?._id])

  useEffect(() => {
    if (personalWorkspace && personalBoards.length === 0 && !loading && !boardCreatedRef.current) {
      boardCreatedRef.current = true
      createBoard(personalWorkspace._id, 'Personal')
    }
  }, [personalWorkspace?._id, loading, personalBoards.length])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!boardName.trim()) { setError('Ingresa un nombre'); return }
    if (!personalWorkspace) return
    const result = await createBoard(personalWorkspace._id, boardName.trim())
    if (result.success) { setBoardName(''); setShowModal(false) }
    else setError(result.error || 'Error')
  }

  const completedTasks = cards.filter(c => {
    const list = lists.find(l => l._id === c.listId)
    return c.list === 'done' || list?.type === 'done'
  }).length

  const inProgressTasks = cards.filter(c => {
    const list = lists.find(l => l._id === c.listId)
    return c.list === 'inprogress' || list?.type === 'inprogress'
  }).length

  const pendingTasks = cards.filter(c => {
    const list = lists.find(l => l._id === c.listId)
    return c.list === 'pending' || list?.type === 'pending'
  }).length

  const recentNotifications = notifications.slice(0, 4)
  const colorPalette = ['#203d7f', '#059669', '#d97706', '#7c3aed', '#db2777', '#0891b2']

  const statCards = [
    { label: 'Completadas', value: completedTasks, icon: <CheckCircle2 size={18} />, color: '#10b981', bg: 'bg-emerald-50' },
    { label: 'En Progreso', value: inProgressTasks, icon: <Clock size={18} />, color: '#f59e0b', bg: 'bg-amber-50' },
    { label: 'Pendientes', value: pendingTasks, icon: <Circle size={18} />, color: '#ef4444', bg: 'bg-red-50' },
    { label: 'Tableros', value: personalBoards.length, icon: <Grid3X3 size={18} />, color: '#203d7f', bg: 'bg-blue-50' },
  ]

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-[#203d7f] flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Mi Espacio</h1>
          </div>
          <p className="text-slate-500 ml-10">Tu hub personal de productividad</p>
        </div>
        <button
          onClick={() => { setShowModal(true); setError(''); setBoardName('') }}
          className="flex items-center gap-2 bg-[#203d7f] hover:bg-[#2d52a8] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-[#203d7f]/20"
        >
          <Plus size={16} /> Nuevo tablero
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(s => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl ${s.bg} flex items-center justify-center shrink-0`} style={{ color: s.color }}>
              {s.icon}
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{s.value}</p>
              <p className="text-xs text-slate-500 font-medium">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: Boards + Activity */}
        <div className="lg:col-span-2 space-y-6">

          {/* Boards */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <Grid3X3 size={18} className="text-[#203d7f]" />
              <h2 className="font-bold text-slate-900">Mis Tableros</h2>
              <span className="text-xs bg-slate-100 text-slate-500 font-semibold px-2 py-0.5 rounded-full">{personalBoards.length}</span>
            </div>
            {loading ? (
              <div className="flex items-center gap-2 text-slate-400 text-sm py-4">
                <div className="w-4 h-4 border-2 border-slate-200 border-t-[#203d7f] rounded-full animate-spin" />
                Cargando...
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {personalBoards.map((b, i) => {
                  const color = colorPalette[i % colorPalette.length]
                  return (
                    <div
                      key={b._id}
                      onClick={() => navigate(`/boards/${b._id}/kanban`, { state: { board: b, workspace: personalWorkspace } })}
                      className="border border-slate-200 rounded-xl overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group"
                    >
                      <div className="h-1.5" style={{ backgroundColor: color }} />
                      <div className="p-4">
                        <h3 className="font-semibold text-slate-900 group-hover:text-[#203d7f] transition-colors">{b.name}</h3>
                        <p className="text-slate-400 text-xs mt-0.5">
                          {new Date(b.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                        </p>
                        <div className="flex items-center gap-1 mt-3 text-xs font-semibold" style={{ color }}>
                          Abrir <ArrowRight size={11} />
                        </div>
                      </div>
                    </div>
                  )
                })}
                <button
                  onClick={() => { setShowModal(true); setError(''); setBoardName('') }}
                  className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:border-[#203d7f]/40 hover:bg-[#203d7f]/5 transition-all text-slate-400 hover:text-[#203d7f] min-h-[90px]"
                >
                  <Plus size={18} />
                  <span className="text-xs font-semibold">Nuevo tablero</span>
                </button>
              </div>
            )}
          </div>

          {/* Activity */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <Bell size={18} className="text-[#203d7f]" />
              <h2 className="font-bold text-slate-900">Actividad Reciente</h2>
            </div>
            {recentNotifications.length === 0 ? (
              <p className="text-slate-400 text-sm py-4 text-center">Sin actividad reciente</p>
            ) : (
              <div className="space-y-3">
                {recentNotifications.map(n => (
                  <div key={n._id} className={`flex items-start gap-3 p-3 rounded-xl ${!n.read ? 'bg-[#203d7f]/5 border border-[#203d7f]/10' : 'bg-slate-50'}`}>
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.read ? 'bg-[#203d7f]' : 'bg-slate-300'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700 leading-snug">{n.message}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {(() => {
                          const diff = (Date.now() - new Date(n.createdAt).getTime()) / 1000
                          if (diff < 60) return 'Ahora'
                          if (diff < 3600) return `${Math.floor(diff / 60)} min`
                          if (diff < 86400) return `${Math.floor(diff / 3600)} h`
                          return `${Math.floor(diff / 86400)} d`
                        })()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Quick tasks */}
        <div>
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sticky top-6">
            <div className="flex items-center gap-2 mb-5">
              <Zap size={18} className="text-[#203d7f]" />
              <h2 className="font-bold text-slate-900">Tareas Rápidas</h2>
              <span className="text-xs bg-slate-100 text-slate-500 font-semibold px-2 py-0.5 rounded-full">
                {tasks.filter(t => !t.done).length}
              </span>
            </div>

            <div className="flex gap-2 mb-4">
              <input
                value={quickInput}
                onChange={e => setQuickInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { add(quickInput); setQuickInput('') } }}
                placeholder="Añadir tarea rápida..."
                className="flex-1 text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#203d7f] focus:ring-2 focus:ring-[#203d7f]/10 bg-slate-50 placeholder-slate-400"
              />
              <button
                onClick={() => { add(quickInput); setQuickInput('') }}
                disabled={!quickInput.trim()}
                className="w-9 h-9 bg-[#203d7f] text-white rounded-xl flex items-center justify-center hover:bg-[#2d52a8] disabled:opacity-40 transition-all shrink-0"
              >
                <Plus size={16} />
              </button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {tasks.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 size={32} className="text-slate-200 mx-auto mb-2" />
                  <p className="text-slate-400 text-sm">Sin tareas rápidas</p>
                  <p className="text-slate-300 text-xs mt-0.5">Escribe y presiona Enter</p>
                </div>
              ) : tasks.map(t => (
                <div key={t.id} className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${t.done ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                  <button
                    onClick={() => toggle(t.id)}
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${t.done ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 hover:border-[#203d7f]'}`}
                  >
                    {t.done && <Check size={11} className="text-white" strokeWidth={3} />}
                  </button>
                  <span className={`text-sm flex-1 leading-snug ${t.done ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                    {t.text}
                  </span>
                  <button onClick={() => remove(t.id)} className="text-slate-300 hover:text-red-400 transition-colors shrink-0 mt-0.5">
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>

            {tasks.filter(t => t.done).length > 0 && (
              <button
                onClick={clearDone}
                className="mt-3 text-xs text-slate-400 hover:text-red-400 transition-colors w-full text-center"
              >
                Limpiar completadas ({tasks.filter(t => t.done).length})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-lg">Nuevo tablero personal</h3>
              <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              {error && <p className="text-red-500 text-sm bg-red-50 px-4 py-2.5 rounded-xl">{error}</p>}
              <div>
                <label className="text-slate-700 text-sm font-semibold mb-2 block">Nombre del tablero</label>
                <input
                  autoFocus value={boardName} onChange={e => setBoardName(e.target.value)}
                  placeholder="Ej: Tareas del Hogar"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#203d7f] focus:ring-2 focus:ring-[#203d7f]/10 bg-slate-50"
                />
                <p className="text-slate-400 text-xs mt-2">Incluirá las listas: Pending, In Progress y Done.</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-slate-200 text-slate-600 py-3 rounded-xl text-sm font-semibold hover:bg-slate-50">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 bg-[#203d7f] text-white py-3 rounded-xl text-sm font-semibold hover:bg-[#2d52a8] transition-colors shadow-sm">
                  Crear tablero
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}