import { useNavigate } from 'react-router'


import StackStatus from '../components/StackStatus'
import { useAuth } from '../auth/useAuth'

export default function Home() {
  const { user, status } = useAuth()
  const navigate = useNavigate()
  const canPlay = status === 'authenticated' && !!user

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-2">
        <span
          className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
            canPlay
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
              : 'border-white/10 bg-white/5 text-slate-400'
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${canPlay ? 'bg-emerald-400' : 'bg-slate-500'}`} />
          {canPlay ? 'Sesión iniciada' : 'Sin sesión'}
        </span>

        <h1 className="text-3xl font-black tracking-tight">
          {canPlay ? `Hola, ${user.name}` : 'Bienvenido'}
        </h1>
        <p className="text-slate-400">
          {canPlay
            ? 'Listo para jugar cuando quieras.'
            : 'Inicia sesión desde la cabecera para empezar a jugar.'}
        </p>
      </section>

      <section className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={!canPlay}
          onClick={() => canPlay && navigate('/profile')}
          className="rounded-full bg-red-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-slate-500"
        >
          Jugar ahora
        </button>
        <button
          type="button"
          onClick={() => navigate('/profile')}
          className="rounded-full border border-white/10 px-6 py-3 text-sm font-bold text-slate-200 transition hover:border-white/20 hover:bg-white/5"
        >
          Ver perfil
        </button>
      </section>
     
      <StackStatus />
    </div>
  )
}
