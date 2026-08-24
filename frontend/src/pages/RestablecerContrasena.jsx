import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../services/api'
import { useSEO } from '../hooks/useSEO'

const validPassword = password =>
  password.length >= 12 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password) && /[^A-Za-z0-9]/.test(password)

export default function RestablecerContrasena() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useSEO({
    title: 'Restablecer contraseña',
    description: 'Recupera de forma segura el acceso privado al equipo VitaGloss RD.',
    canonical: 'https://www.vitaglossrd.com/restablecer-contrasena',
    robots: 'noindex, nofollow',
  })

  const requestLink = async event => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const result = await api.forgotPassword(email.trim().toLowerCase())
      setMessage(result.message)
    } catch (requestError) {
      setError(requestError.message || 'No pudimos procesar la solicitud. Intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  const changePassword = async event => {
    event.preventDefault()
    setError('')
    if (!validPassword(password)) {
      setError('Usa al menos 12 caracteres e incluye mayúscula, minúscula, número y símbolo.')
      return
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }
    setLoading(true)
    try {
      const result = await api.resetPassword(token, password)
      setMessage(result.message)
      setPassword('')
      setConfirmPassword('')
    } catch (requestError) {
      setError(requestError.message || 'No pudimos actualizar la contraseña.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f8fb] px-4 pb-20 pt-28">
      <div className="mx-auto w-full max-w-md overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl shadow-slate-900/5">
        <header className="bg-primary px-7 py-8 text-white">
          <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl border border-white/15 bg-white/10">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="10" rx="2" strokeWidth="1.8" /><path d="M8 10V7a4 4 0 018 0v3" strokeWidth="1.8" strokeLinecap="round" /></svg>
          </div>
          <h1 className="text-2xl font-black">{token ? 'Crea una nueva contraseña' : 'Recupera tu acceso'}</h1>
          <p className="mt-2 text-sm leading-relaxed text-white/60">
            {token ? 'Elige una contraseña segura que no utilices en otros servicios.' : 'Te enviaremos un enlace temporal al correo registrado de tu cuenta.'}
          </p>
        </header>

        <div className="px-7 py-8">
          {message ? (
            <div className="text-center">
              <div className="mb-5 rounded-2xl border border-green-200 bg-green-50 px-4 py-4 text-sm leading-relaxed text-green-800" role="status">{message}</div>
              <Link to="/equipo?acceso=equipo" className="inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-blue-900">Volver al inicio de sesión</Link>
            </div>
          ) : (
            <form onSubmit={token ? changePassword : requestLink} noValidate>
              {error && <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</div>}

              {!token ? (
                <div>
                  <label htmlFor="reset-email" className="mb-2 block text-sm font-semibold text-gray-700">Correo electrónico</label>
                  <input id="reset-email" type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} placeholder="tu@correo.com" className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="reset-password" className="mb-2 block text-sm font-semibold text-gray-700">Nueva contraseña</label>
                    <input id="reset-password" type="password" autoComplete="new-password" required value={password} onChange={event => setPassword(event.target.value)} className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <div>
                    <label htmlFor="reset-password-confirm" className="mb-2 block text-sm font-semibold text-gray-700">Confirmar contraseña</label>
                    <input id="reset-password-confirm" type="password" autoComplete="new-password" required value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <p className="text-xs leading-relaxed text-gray-400">Mínimo 12 caracteres, con mayúscula, minúscula, número y símbolo.</p>
                </div>
              )}

              <button type="submit" disabled={loading || (!token && !email)} className="mt-6 w-full rounded-2xl bg-primary py-4 font-black text-white transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-60">
                {loading ? 'Procesando…' : token ? 'Guardar nueva contraseña' : 'Enviar enlace seguro'}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  )
}
