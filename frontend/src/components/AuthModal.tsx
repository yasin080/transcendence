import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'

import { useAuth } from '../auth/useAuth'
import type { FieldErrors } from '../lib/api'

type Mode = 'login' | 'register'

type Values = {
  name: string
  email: string
  password: string
  password_confirmation: string
  remember: boolean
}

const EMPTY: Values = {
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
  remember: false,
}

// Deliberately loose: the server is the authority on what a valid address is.
// This only catches the obvious typo before spending a round trip on it.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Frontend half of the validation the subject requires on both sides. */
function validate(mode: Mode, values: Values): FieldErrors {
  const errors: FieldErrors = {}

  if (mode === 'register' && values.name.trim() === '') {
    errors.name = ['Enter a name.']
  }

  if (values.email.trim() === '') {
    errors.email = ['Enter your email.']
  } else if (!EMAIL.test(values.email)) {
    errors.email = ['That email address is not valid.']
  }

  if (values.password === '') {
    errors.password = ['Enter your password.']
  } else if (mode === 'register' && values.password.length < 8) {
    errors.password = ['Passwords need at least 8 characters.']
  }

  if (mode === 'register' && values.password !== values.password_confirmation) {
    errors.password_confirmation = ['Passwords do not match.']
  }

  return errors
}

export default function AuthModal({
  onClose,
  initialMessage = null,
}: {
  onClose: () => void
  initialMessage?: string | null
}) {
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const titleId = useId()

  const [mode, setMode] = useState<Mode>('login')
  const [values, setValues] = useState<Values>(EMPTY)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [message, setMessage] = useState<string | null>(initialMessage)
  const [busy, setBusy] = useState(false)

  const firstField = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', onKeyDown)

    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  useEffect(() => {
    firstField.current?.focus()
  }, [mode])

  function switchTo(next: Mode) {
    setMode(next)
    setErrors({})
    setMessage(null)
    setRemember(false)
  }

  function set(field: keyof Values, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
  }

  function setRemember(value: boolean) {
    setValues((current) => ({ ...current, remember: value }))
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()

    const found = validate(mode, values)
    setErrors(found)
    setMessage(null)

    if (Object.keys(found).length > 0) return

    setBusy(true)

    const failure =
      mode === 'login'
        ? await login({ email: values.email, password: values.password, remember: values.remember })
        : await register(values)

    setBusy(false)

    if (failure) {
      setErrors(failure.errors)
      // Only worth showing when it is not already spelled out under a field.
      setMessage(Object.keys(failure.errors).length > 0 ? null : failure.message)

      return
    }

    onClose()
    void navigate('/lobby')
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-surface-2 p-6 text-white shadow-[0_25px_60px_rgba(0,0,0,.55)] font-sans"
      >
        <div className="flex items-start justify-between">
          <h2 id={titleId} className="text-2xl font-black uppercase tracking-tight">
            {mode === 'login' ? 'Log in' : 'Sign up'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-1 -mt-1 rounded px-2 py-1 text-white/70 transition hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-fuse-600"
          >
            ×
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-1 rounded-lg border border-white/10 bg-black/30 p-1 text-sm">
          {(['login', 'register'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => switchTo(tab)}
              className={`rounded-md px-3 py-1.5 font-semibold uppercase tracking-wide transition ${
                mode === tab
                  ? 'bg-fuse-600 text-white shadow-[0_6px_18px_rgba(255,46,91,.45)]'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              {tab === 'login' ? 'Log in' : 'Sign up'}
            </button>
          ))}
        </div>

        <a
          href="/auth/google/redirect"
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-fuse-600"
        >
          <GoogleIcon />
          Continue with Google
        </a>

        <div className="mt-5 flex items-center gap-3 text-xs uppercase tracking-wide text-white/50">
          <span className="h-px flex-1 bg-white/10" />
          or
          <span className="h-px flex-1 bg-white/10" />
        </div>

        <form onSubmit={onSubmit} noValidate className="mt-5 space-y-4">
          {mode === 'register' && (
            <Field
              ref={firstField}
              label="Name"
              name="name"
              autoComplete="nickname"
              value={values.name}
              onChange={(value) => set('name', value)}
              errors={errors.name}
            />
          )}

          <Field
            ref={mode === 'login' ? firstField : undefined}
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(value) => set('email', value)}
            errors={errors.email}
          />

          <Field
            label="Password"
            name="password"
            type="password"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            value={values.password}
            onChange={(value) => set('password', value)}
            errors={errors.password}
          />

          {mode === 'login' && (
            <label className="flex items-center gap-2 text-sm text-white/80">
              <input
                type="checkbox"
                checked={values.remember}
                onChange={(event) => setRemember(event.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-black/30 text-fuse-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-fuse-600"
              />
              Remember me
            </label>
          )}

          {mode === 'register' && (
            <Field
              label="Repeat password"
              name="password_confirmation"
              type="password"
              autoComplete="new-password"
              value={values.password_confirmation}
              onChange={(value) => set('password_confirmation', value)}
              errors={errors.password_confirmation}
            />
          )}

          {message && (
            <p role="alert" className="text-sm text-fuse-600">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl border border-white/25 bg-gradient-to-br from-fuse-500 to-fuse-700 px-4 py-3 text-sm font-black uppercase tracking-wide text-white shadow-[0_12px_35px_rgba(255,46,91,.35)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(255,46,91,.55)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            {busy ? 'One moment…' : mode === 'login' ? 'Log in' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 18 18" width="18" height="18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.71v2.26h2.9c1.7-1.56 2.7-3.87 2.7-6.61z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.19l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.96v2.33A9 9 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.95 10.69A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.16.28-1.69V4.98H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.02l2.99-2.33z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.98l2.99 2.33C4.66 5.17 6.65 3.58 9 3.58z"
      />
    </svg>
  )
}

function Field({
  ref,
  label,
  name,
  type = 'text',
  autoComplete,
  value,
  onChange,
  errors,
}: {
  ref?: React.Ref<HTMLInputElement>
  label: string
  name: string
  type?: string
  autoComplete?: string
  value: string
  onChange: (value: string) => void
  errors?: string[]
}) {
  const id = useId()
  const errorId = `${id}-error`
  const invalid = Boolean(errors?.length)

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold uppercase tracking-wide text-white/80">
        {label}
      </label>
      <input
        ref={ref}
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? errorId : undefined}
        className={`mt-1 w-full rounded-lg border bg-black/30 px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus-visible:ring-2 ${
          invalid
            ? 'border-fuse-600 focus-visible:ring-fuse-600'
            : 'border-white/15 focus-visible:ring-fuse-600'
        }`}
      />
      {invalid && (
        <p id={errorId} className="mt-1 text-sm text-fuse-600">
          {errors?.[0]}
        </p>
      )}
    </div>
  )
}
