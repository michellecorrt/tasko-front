import React, { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutGrid, User, Bell, LogOut, Plus, ChevronLeft,
  ChevronRight, Briefcase, CheckSquare, Menu, X
} from 'lucide-react'
import { useAppStore } from '../../store'
import { useAuth } from '../../utils/hooks'

export default function AppLayout() {
  const { user, notifications } = useAppStore()
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const unread = notifications.filter(n => !n.read).length

  const handleLogout = () => {
    const ok = window.confirm('¿Cerrar sesión?')
    if (!ok) return
    localStorage.clear()
    logout()
    navigate('/login')
  }

  const navItems = [
    { to: '/workspaces', icon: <Briefcase size={18} />, label: 'Workspaces' },
    { to: '/personal', icon: <User size={18} />, label: 'Personal' },
    { to: '/notifications', icon: <Bell size={18} />, label: 'Notificaciones', badge: unread },
    { to: '/profile', icon: <User size={18} />, label: 'Perfil' },
  ]

  const Sidebar = ({ mobile = false }) => (
    <aside className={`
      flex flex-col bg-[#0f172a] border-r border-slate-800 h-full transition-all duration-200
      ${mobile ? 'w-64' : collapsed ? 'w-16' : 'w-60'}
    `}>
      {/* Logo */}
      <div className={`flex items-center h-16 px-4 border-b border-slate-800 ${collapsed && !mobile ? 'justify-center' : 'justify-between'}`}>
        {(!collapsed || mobile) && (
          <span className="text-xl font-bold text-white tracking-tight">Task.o</span>
        )}
        {!mobile && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => mobile && setMobileOpen(false)}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
              ${isActive
                ? 'bg-[#203d7f] text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }
              ${collapsed && !mobile ? 'justify-center' : ''}
            `}
          >
            <span className="shrink-0 relative">
              {item.icon}
              {item.badge && item.badge > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
            </span>
            {(!collapsed || mobile) && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="border-t border-slate-800 p-3">
        {(!collapsed || mobile) ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#203d7f] flex items-center justify-center shrink-0">
              <span className="text-white text-sm font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{user?.name}</p>
              <p className="text-slate-400 text-xs truncate">{user?.email}</p>
            </div>
            <button onClick={handleLogout} className="text-slate-400 hover:text-red-400 transition-colors">
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button onClick={handleLogout} className="w-full flex justify-center text-slate-400 hover:text-red-400 transition-colors py-1">
            <LogOut size={18} />
          </button>
        )}
      </div>
    </aside>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8fafc]">
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-col shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="w-64 flex flex-col">
            <Sidebar mobile />
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <header className="md:hidden flex items-center h-14 px-4 bg-[#0f172a] border-b border-slate-800">
          <button onClick={() => setMobileOpen(true)} className="text-white mr-3">
            <Menu size={20} />
          </button>
          <span className="text-white font-bold text-lg">Task.o</span>
        </header>

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
