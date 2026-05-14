import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWorkspaces } from '../utils/hooks'
import { useAppStore } from '../store'
import { Plus, Briefcase, User, MoreHorizontal, Pencil, Trash2, ChevronRight, FolderOpen } from 'lucide-react'

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
    const result = editing ? await updateWorkspace(editing._id, name.trim()) : await createWorkspace(name.trim())
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
    <div className="p-8 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Workspaces</h1>
          <p className="text-slate-500 mt-1">Selecciona un workspace para ver sus tableros</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-[#203d7f] hover:bg-[#2d52a8] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-[#203d7f]/20 hover:shadow-[#203d7f]/30"
        >
          <Plus size={16} /> Nuevo workspace
        </button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-slate-400 text-sm py-10">
          <div className="w-4 h-4 border-2 border-slate-300 border-t-[#203d7f] rounded-full animate-spin" />
          Cargando workspaces...
        </div>
      ) : all.length === 0 ? (
        <div className="text-center py-24">
          <FolderOpen size={48} className="text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 font-semibold text-lg">Sin workspaces</p>
          <p className="text-slate-400 text-sm mt-1 mb-6">Crea el primero para empezar a organizar tus proyectos</p>
          <button onClick={openCreate} className="bg-[#203d7f] text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-[#2d52a8] transition-colors">
            Crear workspace
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {all.map(ws => (
            <div
              key={ws._id}
              className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4 hover:border-[#203d7f]/30 hover:shadow-lg hover:shadow-slate-200/60 transition-all cursor-pointer group"
              onClick={() => handleClick(ws)}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${ws.name === 'Personal' ? 'bg-[#203d7f]/10' : 'bg-slate-100'}`}>
                {ws.name === 'Personal'
                  ? <User size={20} className="text-[#203d7f]" />
                  : <Briefcase size={20} className="text-slate-500" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900 text-base group-hover:text-[#203d7f] transition-colors">{ws.name}</p>
                <p className="text-slate-400 text-sm capitalize">
                  {ws.role === 'owner' ? 'Propietario' : ws.role === 'admin' ? 'Admin' : 'Miembro'}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                {ws.name !== 'Personal' && !ws.isDefault && (
                  <div className="relative">
                    <button
                      onClick={() => setMenuOpen(menuOpen === ws._id ? null : ws._id)}
                      className="p-2 text-slate-300 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                    >
                      <MoreHorizontal size={18} />
                    </button>
                    {menuOpen === ws._id && (
                      <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-10 min-w-[150px] overflow-hidden">
                        <button onClick={() => openEdit(ws)} className="flex items-center gap-2.5 w-full px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 font-medium">
                          <Pencil size={14} className="text-[#203d7f]" /> Editar
                        </button>
                        <button onClick={() => handleDelete(ws)} className="flex items-center gap-2.5 w-full px-4 py-3 text-sm text-red-500 hover:bg-red-50 font-medium border-t border-slate-100">
                          <Trash2 size={14} /> Eliminar
                        </button>
                      </div>
                    )}
                  </div>
                )}
                <div className="p-2 text-slate-300 group-hover:text-[#203d7f] transition-colors">
                  <ChevronRight size={18} />
                </div>
              </div>
            </div>
          ))}

          {/* Create card */}
          <button
            onClick={openCreate}
            className="border-2 border-dashed border-slate-200 rounded-2xl p-5 flex items-center gap-4 hover:border-[#203d7f]/40 hover:bg-[#203d7f]/5 transition-all text-slate-400 hover:text-[#203d7f]"
          >
            <div className="w-12 h-12 rounded-2xl bg-slate-100 hover:bg-[#203d7f]/10 flex items-center justify-center shrink-0 transition-colors">
              <Plus size={20} />
            </div>
            <div className="text-left">
              <p className="font-semibold text-sm">Nuevo workspace</p>
              <p className="text-xs text-slate-400 mt-0.5">Organiza un nuevo proyecto</p>
            </div>
          </button>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-lg">{editing ? 'Editar workspace' : 'Nuevo workspace'}</h3>
              <button onClick={closeModal} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && <p className="text-red-500 text-sm bg-red-50 px-4 py-2.5 rounded-xl">{error}</p>}
              <div>
                <label className="text-slate-700 text-sm font-semibold mb-2 block">Nombre del workspace</label>
                <input
                  autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Mi Empresa"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#203d7f] focus:ring-2 focus:ring-[#203d7f]/10 bg-slate-50"
                />
                <p className="text-slate-400 text-xs mt-2">Los workspaces te permiten organizar proyectos separados con sus propios tableros.</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="flex-1 border border-slate-200 text-slate-600 py-3 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 bg-[#203d7f] text-white py-3 rounded-xl text-sm font-semibold hover:bg-[#2d52a8] transition-colors shadow-sm">{editing ? 'Actualizar' : 'Crear workspace'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}