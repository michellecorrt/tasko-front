import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../utils/hooks'
import { useAppStore } from '../store'
import { LogOut, User, Shield, Bell, HelpCircle, Info, CheckCircle2, Clock, ListTodo, Grid3X3, Briefcase, FileText } from 'lucide-react'

export default function ProfilePage() {
  const { logout, user } = useAuth()
  const { workspaces, boards, cards, lists } = useAppStore()
  const navigate = useNavigate()

  const personalWorkspace = workspaces.find(w => w.name === 'Personal')
  const personalBoards = boards.filter(b => b.workspaceId === personalWorkspace?._id)

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

  const handleLogout = () => {
    if (!window.confirm('¿Cerrar sesión?')) return
    localStorage.clear()
    logout()
    navigate('/login')
  }

  const stats = [
    { label: 'Completadas', value: completedTasks, icon: <CheckCircle2 size={20} />, color: 'text-emerald-500 bg-emerald-50' },
    { label: 'En Progreso', value: inProgressTasks, icon: <Clock size={20} />, color: 'text-amber-500 bg-amber-50' },
    { label: 'Pendientes', value: pendingTasks, icon: <ListTodo size={20} />, color: 'text-blue-500 bg-blue-50' },
  ]

  const menuSections = [
    {
      title: 'Mi Cuenta',
      items: [
        { icon: <User size={16} />, label: 'Información personal', sub: 'Nombre y email' },
        { icon: <Shield size={16} />, label: 'Seguridad', sub: 'Contraseña y privacidad' },
      ]
    },
    {
      title: 'Configuración',
      items: [
        { icon: <Bell size={16} />, label: 'Notificaciones', sub: 'Alertas y recordatorios' },
      ]
    },
    {
      title: 'Ayuda',
      items: [
        { icon: <HelpCircle size={16} />, label: 'Centro de ayuda', sub: 'Preguntas frecuentes' },
        { icon: <Info size={16} />, label: 'Acerca de Task.o', sub: 'Versión 1.0.0' },
      ]
    },
  ]

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Perfil</h1>

      {/* Profile card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex items-center gap-5 mb-6">
        <div className="w-16 h-16 rounded-2xl bg-[#203d7f] flex items-center justify-center shrink-0">
          <span className="text-white text-2xl font-bold">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">{user?.name} {(user as any)?.lastName}</h2>
          <p className="text-slate-500 text-sm">{user?.email}</p>
          <p className="text-slate-400 text-xs mt-0.5">
            Miembro desde {new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {stats.map(s => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col items-center gap-2">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>{s.icon}</div>
            <span className="text-2xl font-bold text-slate-900">{s.value}</span>
            <span className="text-xs text-slate-500 text-center">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Secondary stats */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap gap-x-8 gap-y-2 mb-6">
        {[
          { icon: <Grid3X3 size={14} />, label: `${personalBoards.length} tableros personales` },
          { icon: <Briefcase size={14} />, label: `${workspaces.length} workspace${workspaces.length !== 1 ? 's' : ''}` },
          { icon: <FileText size={14} />, label: `${cards.length} tareas totales` },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-2 text-slate-500 text-sm">
            {s.icon} {s.label}
          </div>
        ))}
      </div>

      {/* Menu sections */}
      {menuSections.map(section => (
        <div key={section.title} className="mb-4">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2 px-1">{section.title}</h3>
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            {section.items.map((item, i) => (
              <button
                key={item.label}
                onClick={() => alert('Próximamente')}
                className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 transition-colors text-left ${i > 0 ? 'border-t border-slate-100' : ''}`}
              >
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[#203d7f] shrink-0">{item.icon}</div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">{item.label}</p>
                  <p className="text-xs text-slate-400">{item.sub}</p>
                </div>
                <span className="text-slate-300">›</span>
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Logout */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mb-6">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-red-50 transition-colors text-left"
        >
          <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-500 shrink-0">
            <LogOut size={16} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-red-500">Cerrar sesión</p>
            <p className="text-xs text-slate-400">Salir de tu cuenta</p>
          </div>
        </button>
      </div>

      <p className="text-center text-xs text-slate-400">© 2024 Task.o. Todos los derechos reservados.</p>
    </div>
  )
}
