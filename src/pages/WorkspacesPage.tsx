import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWorkspaces } from '../utils/hooks'
import { useAppStore } from '../store'
import { Plus, Briefcase, User, MoreHorizontal, Pencil, Trash2, ChevronRight } from 'lucide-react'

export default function WorkspacesPage() {
  const { workspaces, createWorkspace, updateWorkspace, deleteWorkspace, loading } = useWorkspaces()
  const { setCurrentWorkspace } = useAppStore()
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)
  const [name, setName] = useState('')
  const [editing, setEditing] = useState<any>(null)
  const [menuOpen, setMenuOpen] = useState<string | null>(null)
  const [error, setError] = useState('')

  const personalWorkspace = workspaces.find(w => w.name === 'Personal')
  const otherWorkspaces = workspaces.filter(w => w.name !== 'Personal')
  const all = personalWorkspace ? [personalWorkspace, ...otherWorkspaces] : otherWorkspaces

  const openCreate = () => { setEditing(null); setName(''); setError(''); setShowModal(true) }
  const openEdit = (ws: any) => { setEditing(ws); setName(ws.name); setError(''); setShowModal(true); setMenuOpen(null) }
  const closeModal = () => { setShowModal(false); setEditing(null); setName('') }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { setError('Ingresa un nombre'); return }
    const result = editing
      ? await updateWorkspace(editing._id, name.trim())
      : await createWorkspace(name.trim())
    if (result.success) closeModal()
    else setError(result.error || 'Error')
  }

  const handleDelete = async (ws: any) => {
    setMenuOpen(null)
    if (!window.confirm(`¿Eliminar "${ws.name}"?`)) return
    await deleteWorkspace(ws._id)
  }

  const handleClick = (ws: any) => {
    setCurrentWorkspace(ws)
    navigate(`/workspaces/${ws._id}/boards`)
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Workspaces</h1>
          <p className="text-slate-500 text-sm mt-0.5">Selecciona un workspace para ver sus tableros</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-[#203d7f] hover:bg-[#2d52a8] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} /> Nuevo workspace
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-slate-400 text-sm">Cargando...</div>
      ) : (
        <div className="space-y-3">
          {all.map(ws => (
            <div
              key={ws._id}
              className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4 hover:border-[#203d7f]/30 hover:shadow-sm transition-all cursor-pointer group"
              onClick={() => handleClick(ws)}
            >
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                {ws.name === 'Personal'
                  ? <User size={18} className="text-[#203d7f]" />
                  : <Briefcase size={18} className="text-[#203d7f]" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900">{ws.name}</p>
                <p className="text-slate-400 text-xs capitalize">
                  {ws.role === 'owner' ? 'Propietario' : ws.role === 'admin' ? 'Admin' : 'Miembro'}
                </p>
              </div>
              <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                {ws.name !== 'Personal' && !ws.isDefault && (
                  <div className="relative">
                    <button
                      onClick={() => setMenuOpen(menuOpen === ws._id ? null : ws._id)}
                      className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <MoreHorizontal size={16} />
                    </button>
                    {menuOpen === ws._id && (
                      <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-10 min-w-[140px] overflow-hidden">
                        <button onClick={() => openEdit(ws)} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                          <Pencil size={14} /> Editar
                        </button>
                        <button onClick={() => handleDelete(ws)} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50">
                          <Trash2 size={14} /> Eliminar
                        </button>
                      </div>
                    )}
                  </div>
                )}
                <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-400 transition-colors" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900 text-lg">
                {editing ? 'Editar workspace' : 'Nuevo workspace'}
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <div>
                <label className="text-slate-700 text-sm font-medium mb-1.5 block">Nombre</label>
                <input
                  autoFocus
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ej: Mi Empresa"
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#203d7f] focus:ring-1 focus:ring-[#203d7f]"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-50">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 bg-[#203d7f] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#2d52a8] transition-colors">
                  {editing ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
