import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../utils/hooks'
import { Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react'

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', lastName: '', email: '', password: '', phone: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const { register, loading } = useAuth()
  const navigate = useNavigate()

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.name || !form.lastName || !form.email || !form.password || !form.phone) {
      setError('Por favor completa todos los campos'); return
    }
    const result = await register(form.name, form.lastName, form.email, form.password, form.phone)
    if (result.success) {
      setSuccess('¡Cuenta creada! Redirigiendo...')
      setTimeout(() => navigate('/login'), 1500)
    } else {
      setError(result.error || 'Error al registrarse')
    }
  }

  const fields = [
    { key: 'name', label: 'Nombre', icon: <User size={16} />, type: 'text', placeholder: 'María' },
    { key: 'lastName', label: 'Apellido', icon: <User size={16} />, type: 'text', placeholder: 'García' },
    { key: 'email', label: 'Email', icon: <Mail size={16} />, type: 'email', placeholder: 'tu@email.com' },
    { key: 'phone', label: 'Teléfono', icon: <Phone size={16} />, type: 'tel', placeholder: '+52 123 456 7890' },
  ]

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white">Task.o</h1>
          <p className="text-slate-400 mt-1">Crea tu cuenta gratis</p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg">{error}</div>
            )}
            {success && (
              <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm px-4 py-3 rounded-lg">{success}</div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {fields.slice(0, 2).map(f => (
                <div key={f.key}>
                  <label className="text-slate-300 text-sm font-medium mb-1.5 block">{f.label}</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">{f.icon}</span>
                    <input
                      type={f.type}
                      value={(form as any)[f.key]}
                      onChange={set(f.key)}
                      placeholder={f.placeholder}
                      className="w-full bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#203d7f] focus:ring-1 focus:ring-[#203d7f] transition"
                    />
                  </div>
                </div>
              ))}
            </div>

            {fields.slice(2).map(f => (
              <div key={f.key}>
                <label className="text-slate-300 text-sm font-medium mb-1.5 block">{f.label}</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">{f.icon}</span>
                  <input
                    type={f.type}
                    value={(form as any)[f.key]}
                    onChange={set(f.key)}
                    placeholder={f.placeholder}
                    className="w-full bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#203d7f] focus:ring-1 focus:ring-[#203d7f] transition"
                  />
                </div>
              </div>
            ))}

            <div>
              <label className="text-slate-300 text-sm font-medium mb-1.5 block">Contraseña</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={set('password')}
                  placeholder="••••••••"
                  className="w-full bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 rounded-lg pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:border-[#203d7f] focus:ring-1 focus:ring-[#203d7f] transition"
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
              {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </button>
          </form>

          <p className="text-slate-400 text-sm text-center mt-5">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-[#4f7be8] hover:text-white transition-colors font-medium">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
