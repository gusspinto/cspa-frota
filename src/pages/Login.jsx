import { useState, useRef, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Mail, Lock, Loader2, AlertCircle } from 'lucide-react'
import clsx from 'clsx'

// Check dark mode from localStorage before store loads
const getIsDark = () => localStorage.getItem('csa_dark') === 'true'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isDark] = useState(getIsDark)
  const emailRef = useRef(null)

  useEffect(() => {
    emailRef.current?.focus()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
    } catch (err) {
      setError('Credenciais inválidas. Por favor verifique o email e a palavra-passe.')
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSubmit(e)
  }

  return (
    <div className={clsx(
      'min-h-screen flex flex-col items-center justify-center p-4',
      isDark ? 'bg-slate-950' : 'bg-[#f8fafc]'
    )}>
      <div className="w-full max-w-sm">
        {/* Logo + org name */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-[#1b4332] flex items-center justify-center mb-4 shadow-lg">
            <img
              src="https://www.centrosocialareosa.pt/uploads/7/2/4/0/7240418/published/1453202777.png"
              alt="Logo CSA"
              className="h-12 w-12 object-contain"
              style={{ filter: 'brightness(0) invert(1)' }}
              onError={(e) => { e.target.style.display = 'none' }}
            />
          </div>
          <h1 className={clsx(
            'text-xl font-bold text-center',
            isDark ? 'text-slate-100' : 'text-slate-900'
          )}>
            Centro Social da Areosa
          </h1>
          <p className={clsx(
            'text-sm mt-1 text-center',
            isDark ? 'text-slate-400' : 'text-slate-500'
          )}>
            Gestão de Frota
          </p>
        </div>

        {/* Form */}
        <div className={clsx(
          'rounded-xl border shadow-sm p-6',
          isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
        )}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-start gap-2.5 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle size={15} className="text-red-600 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div>
              <label className={clsx(
                'block text-sm font-medium mb-1.5',
                isDark ? 'text-slate-300' : 'text-slate-700'
              )}>
                Email
              </label>
              <div className="relative">
                <Mail size={15} className={clsx(
                  'absolute left-3 top-1/2 -translate-y-1/2',
                  isDark ? 'text-slate-500' : 'text-slate-400'
                )} />
                <input
                  ref={emailRef}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="utilizador@csareosa.pt"
                  className={clsx(
                    'w-full pl-9 pr-3 py-2.5 text-sm border rounded-lg outline-none transition-shadow',
                    isDark
                      ? 'bg-slate-800 border-slate-600 text-slate-100 placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500'
                      : 'bg-white border-slate-200 text-slate-900 focus:ring-2 focus:ring-[#2d6a4f]/20 focus:border-[#2d6a4f]'
                  )}
                  required
                />
              </div>
            </div>

            <div>
              <label className={clsx(
                'block text-sm font-medium mb-1.5',
                isDark ? 'text-slate-300' : 'text-slate-700'
              )}>
                Palavra-passe
              </label>
              <div className="relative">
                <Lock size={15} className={clsx(
                  'absolute left-3 top-1/2 -translate-y-1/2',
                  isDark ? 'text-slate-500' : 'text-slate-400'
                )} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="••••••••"
                  className={clsx(
                    'w-full pl-9 pr-3 py-2.5 text-sm border rounded-lg outline-none transition-shadow',
                    isDark
                      ? 'bg-slate-800 border-slate-600 text-slate-100 placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500'
                      : 'bg-white border-slate-200 text-slate-900 focus:ring-2 focus:ring-[#2d6a4f]/20 focus:border-[#2d6a4f]'
                  )}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#2d6a4f] hover:bg-[#1b4332] text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  A entrar...
                </>
              ) : (
                'Entrar'
              )}
            </button>
          </form>
        </div>

        <p className={clsx(
          'text-xs text-center mt-6',
          isDark ? 'text-slate-600' : 'text-slate-400'
        )}>
          Centro Social da Paróquia da Areosa • Porto
        </p>
      </div>
    </div>
  )
}
