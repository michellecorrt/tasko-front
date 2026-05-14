import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../utils/hooks'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'

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
    if (result.success) {
      navigate('/')
    } else {
      setError(result.error || 'Error al iniciar sesión')
    }
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#203d7f]/30 to-transparent" />
        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-white tracking-tight">Task.o</h1>
          <p className="text-slate-400 mt-2">Gestiona tus ideas en un solo lugar</p>
        </div>
        <div className="relative z-10">
          <blockquote className="text-slate-300 text-lg font-light leading-relaxed">
            "La productividad no es hacer más cosas, <br />es hacer las cosas correctas."
          </blockquote>
        </div>
        {/* Decorative circles */}
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-[#203d7f]/20" />
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-[#203d7f]/10" />
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white">Bienvenida</h2>
            <p className="text-slate-400 mt-1">Ingresa a tu cuenta para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="text-slate-300 text-sm font-medium mb-1.5 block">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#203d7f] focus:ring-1 focus:ring-[#203d7f] transition"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 text-sm font-medium mb-1.5 block">Contraseña</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 rounded-lg pl-10 pr-10 py-3 text-sm focus:outline-none focus:border-[#203d7f] focus:ring-1 focus:ring-[#203d7f] transition"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#203d7f] hover:bg-[#2d52a8] disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition-colors mt-2"
            >
              {loading ? 'Ingresando...' : 'Iniciar Sesión'}
            </button>
          </form>

          <p className="text-slate-400 text-sm text-center mt-6">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-[#4f7be8] hover:text-white transition-colors font-medium">
              Regístrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
