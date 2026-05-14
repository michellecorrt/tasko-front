import React, { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { LayoutGrid, User, Bell, LogOut, Briefcase, Menu, ChevronLeft, ChevronRight } from 'lucide-react'
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
    if (!window.confirm('¿Cerrar sesión?')) return
    localStorage.clear()
    logout()
    navigate('/login')
  }

  const navItems = [
    { to: '/workspaces', icon: <Briefcase size={20} />, label: 'Workspaces' },
    { to: '/personal', icon: <LayoutGrid size={20} />, label: 'Personal' },
    { to: '/notifications', icon: <Bell size={20} />, label: 'Notificaciones', badge: unread },
    { to: '/profile', icon: <User size={20} />, label: 'Perfil' },
  ]

  const SidebarContent = ({ mobile = false }) => (
    <aside className={`
      flex flex-col bg-[#0f172a] border-r border-slate-800/60 h-full transition-all duration-300
      ${mobile ? 'w-72' : collapsed ? 'w-20' : 'w-72'}
    `}>
      {/* Logo */}
      <div className={`flex items-center h-16 px-5 border-b border-slate-800/60 shrink-0 ${collapsed && !mobile ? 'justify-center' : 'justify-between'}`}>
        {(!collapsed || mobile) && (
          <div>
            <span className="text-2xl font-bold text-white tracking-tight">Task.o</span>
          </div>
        )}
        {!mobile && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-slate-500 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-slate-800"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {(!collapsed || mobile) && (
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-widest px-3 mb-3">Menú</p>
        )}
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => mobile && setMobileOpen(false)}
            className={({ isActive }) => `
              flex items-center gap-3.5 px-3 py-3 rounded-xl text-sm font-medium transition-all
              ${isActive
                ? 'bg-[#203d7f] text-white shadow-lg shadow-[#203d7f]/20'
                : 'text-slate-400 hover:bg-slate-800/70 hover:text-white'
              }
              ${collapsed && !mobile ? 'justify-center' : ''}
            `}
          >
            <span className="shrink-0 relative">
              {item.icon}
              {item.badge != null && item.badge > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
            </span>
            {(!collapsed || mobile) && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="border-t border-slate-800/60 p-3 shrink-0">
        {(!collapsed || mobile) ? (
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-slate-800/50 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-[#203d7f] flex items-center justify-center shrink-0">
              <span className="text-white text-sm font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold truncate">{user?.name}</p>
              <p className="text-slate-500 text-xs truncate">{user?.email}</p>
            </div>
            <button onClick={handleLogout} className="text-slate-500 hover:text-red-400 transition-colors p-1">
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button onClick={handleLogout} className="w-full flex justify-center text-slate-500 hover:text-red-400 transition-colors py-2">
            <LogOut size={20} />
          </button>
        )}
      </div>
    </aside>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-col shrink-0">
        <SidebarContent />
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="flex flex-col shrink-0">
            <SidebarContent mobile />
          </div>
          <div className="flex-1 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <header className="md:hidden flex items-center h-14 px-4 bg-[#0f172a] border-b border-slate-800/60 shrink-0">
          <button onClick={() => setMobileOpen(true)} className="text-white mr-3 p-1">
            <Menu size={22} />
          </button>
          <span className="text-white font-bold text-xl">Task.o</span>
        </header>

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}