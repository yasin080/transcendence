import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'

import { useAuth } from '../auth/useAuth'
import type { FieldErrors } from '../lib/api'
import Button from './ui/Button'
import FormField from './ui/FormField'
import { GoogleIcon, XIcon } from './ui/icons'
import Modal from './ui/Modal'
import ToggleChip from './ui/ToggleChip'

type Mode = 'login' | 'register'

type Values = {
  username: string
  email: string
  password: string
  password_confirmation: string
  remember: boolean
}

const EMPTY: Values = {
  username: '',
  email: '',
  password: '',
  password_confirmation: '',
  remember: false,
}

// Deliberately loose: the server is the authority on what a valid address is.
// This only catches the obvious typo before spending a round trip on it.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Same rule as the backend (RegisterRequest) and Edit profile.
const USERNAME = /^[A-Za-z0-9_-]{3,20}$/

/** Frontend half of the validation the subject requires on both sides. */
function validate(mode: Mode, values: Values): FieldErrors {
  const errors: FieldErrors = {}

  if (mode === 'register' && !USERNAME.test(values.username.trim())) {
    errors.username = ['Use 3–20 letters, numbers, _ or -.']
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
        : await register({ ...values, username: values.username.trim() })

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
    <Modal onClose={onClose} labelledBy={titleId}>
      <div className="flex items-start justify-between">
        <h2 id={titleId} className="display-heading">
          {mode === 'login' ? 'Log in' : 'Sign up'}
        </h2>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
          <XIcon />
        </Button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {(['login', 'register'] as const).map((tab) => (
          <ToggleChip key={tab} selected={mode === tab} onClick={() => switchTo(tab)}>
            {tab === 'login' ? 'Log in' : 'Sign up'}
          </ToggleChip>
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
          <FormField
            ref={firstField}
            label="Username"
            name="username"
            autoComplete="username"
            value={values.username}
            onChange={(value) => set('username', value)}
            errors={errors.username}
          />
        )}

        <FormField
          ref={mode === 'login' ? firstField : undefined}
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={(value) => set('email', value)}
          errors={errors.email}
        />

        <FormField
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
          <FormField
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

        <Button type="submit" variant="arcade" size="md" disabled={busy} className="w-full">
          {busy ? 'One moment…' : mode === 'login' ? 'Log in' : 'Create account'}
        </Button>
      </form>
    </Modal>
  )
}
