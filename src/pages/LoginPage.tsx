import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../utils/hooks'
import { Eye, EyeOff, Mail, Lock, CheckSquare } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const { login, loading } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email || !password) { setError('Por favor completa todos los campos'); return }
    const result = await login(email, password)
    if (result.success) navigate('/')
    else setError(result.error || 'Error al iniciar sesión')
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex">
      {/* Left — branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-16 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#203d7f]/20 via-transparent to-transparent" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-[#203d7f]/10 blur-3xl" />
          <div className="absolute top-20 right-0 w-[300px] h-[300px] rounded-full bg-[#203d7f]/5 blur-2xl" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl bg-[#203d7f] flex items-center justify-center">
              <CheckSquare size={20} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-white">Task.o</span>
          </div>

          <h1 className="text-5xl font-bold text-white leading-tight mb-6">
            Gestiona tus<br />
            <span className="text-[#4f7be8]">ideas y proyectos</span><br />
            en un solo lugar
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed max-w-md">
            Organiza tus tareas con tableros Kanban, colabora con tu equipo y mantén el control de tus proyectos.
          </p>
        </div>

        <div className="relative z-10 space-y-4">
          {[
            'Tableros Kanban personalizables',
            'Workspaces para cada proyecto',
            'Notificaciones en tiempo real',
          ].map(f => (
            <div key={f} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-[#203d7f] flex items-center justify-center shrink-0">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-slate-300 text-sm">{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-8 h-8 rounded-lg bg-[#203d7f] flex items-center justify-center">
              <CheckSquare size={16} className="text-white" />
            </div>
            <span className="text-xl font-bold text-white">Task.o</span>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-bold text-white mb-2">Bienvenida de nuevo</h2>
            <p className="text-slate-400">Ingresa tus credenciales para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <div>
              <label className="text-slate-300 text-sm font-medium mb-2 block">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full bg-slate-800/60 border border-slate-700/60 text-white placeholder-slate-500 rounded-xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:border-[#203d7f] focus:ring-2 focus:ring-[#203d7f]/20 transition"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 text-sm font-medium mb-2 block">Contraseña</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-800/60 border border-slate-700/60 text-white placeholder-slate-500 rounded-xl pl-11 pr-11 py-3.5 text-sm focus:outline-none focus:border-[#203d7f] focus:ring-2 focus:ring-[#203d7f]/20 transition"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#203d7f] hover:bg-[#2d52a8] disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-[#203d7f]/20 hover:shadow-[#203d7f]/30 mt-2"
            >
              {loading ? 'Ingresando...' : 'Iniciar Sesión'}
            </button>
          </form>

          <p className="text-slate-500 text-sm text-center mt-8">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-[#4f7be8] hover:text-white transition-colors font-medium">
              Regístrate gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}