import React, { useState } from 'react'
import { useNotifications } from '../utils/hooks'
import { Bell, CheckCheck, Clock, ArrowRightCircle, CheckCircle2, UserPlus, MessageSquare } from 'lucide-react'

const ICONS: Record<string, React.ReactNode> = {
  task_created: <Bell size={16} />,
  task_moved: <ArrowRightCircle size={16} />,
  task_completed: <CheckCircle2 size={16} />,
  task_assigned: <UserPlus size={16} />,
  comment_added: <MessageSquare size={16} />,
  due_date_reminder: <Clock size={16} />,
}

const COLORS: Record<string, string> = {
  task_created: 'text-emerald-500 bg-emerald-50',
  task_moved: 'text-blue-500 bg-blue-50',
  task_completed: 'text-emerald-500 bg-emerald-50',
  task_assigned: 'text-purple-500 bg-purple-50',
  comment_added: 'text-amber-500 bg-amber-50',
  due_date_reminder: 'text-red-500 bg-red-50',
}

const TITLES: Record<string, string> = {
  task_created: 'Nueva tarea creada',
  task_moved: 'Tarea movida',
  task_completed: 'Tarea completada',
  task_assigned: 'Tarea asignada',
  comment_added: 'Nuevo comentario',
  due_date_reminder: 'Fecha límite próxima',
}

function timeAgo(date: string) {
  const diff = (Date.now() - new Date(date).getTime()) / 1000
  if (diff < 60) return 'Ahora'
  if (diff < 3600) return `${Math.floor(diff / 60)} min`
  if (diff < 86400) return `${Math.floor(diff / 3600)} h`
  return `${Math.floor(diff / 86400)} d`
}

export default function NotificationsPage() {
  const { notifications, markAsRead, markAllAsRead } = useNotifications()
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const filtered = filter === 'unread' ? notifications.filter(n => !n.read) : notifications
  const unread = notifications.filter(n => !n.read).length

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notificaciones</h1>
          {unread > 0 && <p className="text-slate-500 text-sm mt-0.5">{unread} sin leer</p>}
        </div>
        {unread > 0 && (
          <button onClick={markAllAsRead} className="flex items-center gap-2 text-sm text-[#203d7f] hover:text-[#2d52a8] font-medium transition-colors">
            <CheckCheck size={16} /> Marcar todas
          </button>
        )}
      </div>

      <div className="flex gap-2 mb-5">
        {(['all', 'unread'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === f ? 'bg-[#203d7f] text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'}`}
          >
            {f === 'all' ? `Todas (${notifications.length})` : `Sin leer (${unread})`}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <Bell size={40} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Sin notificaciones</p>
            <p className="text-slate-400 text-sm mt-1">
              {filter === 'unread' ? 'No tienes notificaciones sin leer' : 'La actividad aparecerá aquí'}
            </p>
          </div>
        ) : filtered.map(n => (
          <div
            key={n._id}
            onClick={() => !n.read && markAsRead(n._id)}
            className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
              n.read ? 'bg-white border-slate-100 hover:border-slate-200' : 'bg-white border-l-4 border-l-[#203d7f] border-slate-100 hover:shadow-sm'
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${COLORS[n.type] || 'text-slate-500 bg-slate-100'}`}>
              {ICONS[n.type] || <Bell size={16} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900">{TITLES[n.type] || 'Notificación'}</p>
              <p className="text-sm text-slate-500 mt-0.5 leading-snug">{n.message}</p>
              {(n.user || n.status) && (
                <p className="text-xs text-slate-400 mt-1">
                  {n.user && `Por: ${n.user}`}{n.user && n.status && ' · '}{n.status && `Estado: ${n.status}`}
                </p>
              )}
              <p className="text-xs text-slate-300 mt-1">{timeAgo(n.createdAt)}</p>
            </div>
            {!n.read && <div className="w-2 h-2 rounded-full bg-[#203d7f] mt-1.5 shrink-0" />}
          </div>
        ))}
      </div>
    </div>
  )
}
