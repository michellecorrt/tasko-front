import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBoards, useWorkspaces } from '../utils/hooks'
import { useAppStore } from '../store'
import { Plus, Grid3X3 } from 'lucide-react'

export default function PersonalBoardsPage() {
  const { workspaces } = useWorkspaces()
  const { setCurrentWorkspace } = useAppStore()
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const boardCreatedRef = useRef(false)

  const personalWorkspace = workspaces.find(w => w.name === 'Personal')
  const { boards, createBoard, loading, refetch } = useBoards(personalWorkspace?._id)
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
    if (!name.trim()) { setError('Ingresa un nombre'); return }
    if (!personalWorkspace) return
    const result = await createBoard(personalWorkspace._id, name.trim())
    if (result.success) { setName(''); setShowModal(false) }
    else setError(result.error || 'Error')
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mis Tableros</h1>
          <p className="text-slate-500 text-sm mt-0.5">Workspace Personal</p>
        </div>
        <button
          onClick={() => { setShowModal(true); setError(''); setName('') }}
          className="flex items-center gap-2 bg-[#203d7f] hover:bg-[#2d52a8] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} /> Nuevo tablero
        </button>
      </div>

      {loading ? (
        <div className="text-slate-400 text-sm">Cargando...</div>
      ) : personalBoards.length === 0 ? (
        <div className="text-center py-20">
          <Grid3X3 size={40} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">Tu espacio personal</p>
          <p className="text-slate-400 text-sm mt-1">Crea tu primer tablero personal</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {personalBoards.map(b => (
            <div
              key={b._id}
              onClick={() => navigate(`/boards/${b._id}/kanban`, { state: { board: b, workspace: personalWorkspace } })}
              className="bg-white border border-slate-200 rounded-xl p-5 hover:border-[#203d7f]/40 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-[#203d7f]/10 flex items-center justify-center mb-3">
                <Grid3X3 size={18} className="text-[#203d7f]" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">{b.name}</h3>
              <p className="text-slate-400 text-xs">
                Creado {new Date(b.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
          ))}
          <button
            onClick={() => { setShowModal(true); setError(''); setName('') }}
            className="border-2 border-dashed border-slate-200 rounded-xl p-5 flex flex-col items-center justify-center gap-2 hover:border-[#203d7f]/40 hover:bg-slate-50 transition-all text-slate-400 hover:text-[#203d7f] min-h-[120px]"
          >
            <Plus size={20} />
            <span className="text-sm font-medium">Nuevo tablero</span>
          </button>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900 text-lg">Nuevo tablero personal</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <div>
                <label className="text-slate-700 text-sm font-medium mb-1.5 block">Nombre</label>
                <input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Tareas del Hogar" className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#203d7f] focus:ring-1 focus:ring-[#203d7f]" />
                <p className="text-slate-400 text-xs mt-2">Tendrá las listas: Pending, In Progress y Done.</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-50">Cancelar</button>
                <button type="submit" className="flex-1 bg-[#203d7f] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#2d52a8] transition-colors">Crear</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
