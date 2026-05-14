import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useBoards } from '../utils/hooks'
import { useAppStore } from '../store'
import { Plus, Grid3X3, MoreHorizontal, Pencil, Trash2, ChevronRight, ArrowLeft } from 'lucide-react'

export default function BoardsPage() {
  const { workspaceId } = useParams()
  const { workspaces, setCurrentWorkspace } = useAppStore()
  const workspace = workspaces.find(w => w._id === workspaceId)
  const { boards, createBoard, updateBoard, deleteBoard, loading } = useBoards(workspaceId)
  const navigate = useNavigate()

  const [showModal, setShowModal] = useState(false)
  const [name, setName] = useState('')
  const [editing, setEditing] = useState<any>(null)
  const [menuOpen, setMenuOpen] = useState<string | null>(null)
  const [error, setError] = useState('')

  const openCreate = () => { setEditing(null); setName(''); setError(''); setShowModal(true) }
  const openEdit = (b: any) => { setEditing(b); setName(b.name); setError(''); setShowModal(true); setMenuOpen(null) }
  const closeModal = () => { setShowModal(false); setEditing(null); setName('') }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { setError('Ingresa un nombre'); return }
    const result = editing
      ? await updateBoard(editing._id, name.trim())
      : await createBoard(workspaceId!, name.trim())
    if (result.success) closeModal()
    else setError(result.error || 'Error')
  }

  const handleDelete = async (b: any) => {
    setMenuOpen(null)
    if (!window.confirm(`¿Eliminar tablero "${b.name}"? Se eliminarán todas las tareas.`)) return
    await deleteBoard(b._id)
  }

  const handleClick = (b: any) => {
    navigate(`/boards/${b._id}/kanban`, { state: { board: b, workspace } })
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/workspaces')} className="text-slate-400 hover:text-slate-600 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">{workspace?.name || 'Tableros'}</h1>
          <p className="text-slate-500 text-sm mt-0.5">{boards.length} tablero{boards.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-[#203d7f] hover:bg-[#2d52a8] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} /> Nuevo tablero
        </button>
      </div>

      {loading ? (
        <div className="text-slate-400 text-sm">Cargando...</div>
      ) : boards.length === 0 ? (
        <div className="text-center py-20">
          <Grid3X3 size={40} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No hay tableros aún</p>
          <p className="text-slate-400 text-sm mt-1">Crea el primero para empezar</p>
          <button onClick={openCreate} className="mt-4 bg-[#203d7f] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#2d52a8] transition-colors">
            Crear tablero
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {boards.map(b => (
            <div
              key={b._id}
              onClick={() => handleClick(b)}
              className="bg-white border border-slate-200 rounded-xl p-5 hover:border-[#203d7f]/40 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#203d7f]/10 flex items-center justify-center">
                  <Grid3X3 size={18} className="text-[#203d7f]" />
                </div>
                {b.name !== 'Personal' && (
                  <div className="relative" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => setMenuOpen(menuOpen === b._id ? null : b._id)}
                      className="p-1.5 text-slate-300 hover:text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <MoreHorizontal size={16} />
                    </button>
                    {menuOpen === b._id && (
                      <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-10 min-w-[140px] overflow-hidden">
                        <button onClick={() => openEdit(b)} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                          <Pencil size={14} /> Editar
                        </button>
                        <button onClick={() => handleDelete(b)} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50">
                          <Trash2 size={14} /> Eliminar
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">{b.name}</h3>
              <p className="text-slate-400 text-xs">
                Creado {new Date(b.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
          ))}
          <button
            onClick={openCreate}
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
              <h3 className="font-semibold text-slate-900 text-lg">{editing ? 'Editar tablero' : 'Nuevo tablero'}</h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <div>
                <label className="text-slate-700 text-sm font-medium mb-1.5 block">Nombre</label>
                <input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Proyecto Mobile" className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#203d7f] focus:ring-1 focus:ring-[#203d7f]" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-50">Cancelar</button>
                <button type="submit" className="flex-1 bg-[#203d7f] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#2d52a8] transition-colors">{editing ? 'Actualizar' : 'Crear'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
