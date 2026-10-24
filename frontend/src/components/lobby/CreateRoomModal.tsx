import { useState, type FormEvent, type ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { apiPost } from '../../lib/api.ts'
import Modal from '../ui/Modal.tsx'
import {
  BOARD_OPTIONS,
  BOMB_OPTIONS,
  BOMBS_ON,
  DEFAULT_CHOICES,
  FOOD_OPTIONS,
  maxStartLength,
  PLAYER_OPTIONS,
  SOFT_WALL_OPTIONS,
  SPEED_OPTIONS,
  startLengthOptions,
  toSettings,
  type Option,
  type RoomChoices,
} from './roomOptions.ts'
import type { Room } from './types.ts'
import FormField from '../ui/FormField.tsx'

interface CreateRoomModalProps {
  onClose: () => void
}

const FIELD_LABEL = 'block mb-[7px] text-micro-label text-fg-secondary'

export default function CreateRoomModal({ onClose }: CreateRoomModalProps) {
  const navigate = useNavigate()
  const [name, setName] = useState('my little worm')
  const [choices, setChoices] = useState<RoomChoices>(DEFAULT_CHOICES)
  const [busy, setBusy] = useState(false)
  const [nameError, setNameError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const choose = <K extends keyof RoomChoices>(key: K, value: RoomChoices[K]) => setChoices({ ...choices, [key]: value })

  // Pilares y muros que matan no van juntos: encender uno apaga el otro
  const toggleWallHit = () =>
    setChoices(choices.wallHit === 'die' ? { ...choices, wallHit: 'block' } : { ...choices, wallHit: 'die', pillars: false })

  // Con pilares no hay muros rompibles ni muros que maten
  const togglePillars = () =>
    setChoices(choices.pillars ? { ...choices, pillars: false } : { ...choices, pillars: true, wallHit: 'block', softWalls: 0 })

  // Un tablero más pequeño recorta el largo inicial a su nuevo máximo
  const chooseBoard = (boardSize: number) =>
    setChoices({ ...choices, boardSize, startLength: Math.min(choices.startLength, maxStartLength(boardSize)) })

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setNameError(null)
    setMessage(null)

    const result = await apiPost<Room>('/api/rooms', { name, settings: toSettings(choices) })

    if (!result.ok) {
      setBusy(false)
      const { errors, message } = result.failure
      setNameError(errors.name?.[0] ?? null)
      setMessage(errors.name ? null : message)
      return
    }

    onClose()
    void navigate(`/waiting-room/${result.data.code}`)
  }

  return (
    <Modal onClose={onClose}>
      <form onSubmit={onSubmit} noValidate>
        <h3 className="font-display text-xl">Create custom match</h3>

        <div className="mt-4.5">
          <FormField
            label="Room name"
            name="name"
            autoComplete="off"
            value={name}
            onChange={setName}
            maxLength={40}
            errors={nameError ? [nameError] : undefined}
          />
        </div>

        <div className="flex flex-col gap-4 mt-[18px]">
          <Slider label="Players" options={PLAYER_OPTIONS} value={choices.players} onChange={(v) => choose('players', v)} />
          <Slider label="Board size" options={BOARD_OPTIONS} value={choices.boardSize} onChange={chooseBoard} />
          <Slider
            label="Start length"
            options={startLengthOptions(choices.boardSize)}
            value={choices.startLength}
            onChange={(v) => choose('startLength', v)}
          />
          <Slider label="Speed" options={SPEED_OPTIONS} value={choices.tickMs} onChange={(v) => choose('tickMs', v)} />
          <Slider label="Food" options={FOOD_OPTIONS} value={choices.food} onChange={(v) => choose('food', v)} />
          {!choices.pillars && (
            <Slider label="Soft walls" options={SOFT_WALL_OPTIONS} value={choices.softWalls} onChange={(v) => choose('softWalls', v)} />
          )}
        </div>

        <div className="mt-[18px]">
          <span className={FIELD_LABEL}>Map</span>
          <div className="flex flex-wrap gap-2.5">
            <Switch on={choices.pillars} onClick={togglePillars}>
              Pillars
            </Switch>
          </div>
        </div>

        <div className="mt-[18px]">
          <span className={FIELD_LABEL}>Ways to die</span>
          <div className="flex flex-wrap gap-2.5">
            <Switch on={choices.wallHit === 'die'} onClick={toggleWallHit}>
              Wall hit
            </Switch>
            <Switch on={choices.bodyHit === 'die'} onClick={() => choose('bodyHit', choices.bodyHit === 'die' ? 'block' : 'die')}>
              Body hit
            </Switch>
            <Switch on={choices.bombs > 0} onClick={() => choose('bombs', choices.bombs > 0 ? 0 : BOMBS_ON)}>
              Bombs
            </Switch>
          </div>
        </div>

        {choices.bombs > 0 && (
          <div className="mt-4">
            <Slider label="Bomb count" options={BOMB_OPTIONS} value={choices.bombs} onChange={(v) => choose('bombs', v)} />
          </div>
        )}

        <div className="flex items-center justify-end gap-4 mt-4.5">
          {message && (
            <p role="alert" className="text-sm text-fuse-600">
              {message}
            </p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="px-7.5 py-3.5 rounded-xl bg-white font-display text-[15px] uppercase text-[#12102b] cursor-pointer enabled:hover:bg-fuse-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {busy ? 'Creating…' : 'Create room'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

interface SliderProps<T> {
  label: string
  options: Option<T>[]
  value: T
  onChange: (value: T) => void
}

// Slider que recorre las opciones en orden; la etiqueta muestra la elegida
function Slider<T>({ label, options, value, onChange }: SliderProps<T>) {
  const index = Math.max(0, options.findIndex((option) => option.value === value))
  return (
    <label>
      <span className={FIELD_LABEL}>
        {label} — {options[index].label}
      </span>
      <input
        type="range"
        min={0}
        max={options.length - 1}
        value={index}
        onChange={(event) => onChange(options[Number(event.target.value)].value)}
        className="w-full cursor-pointer accent-fuse-600"
      />
    </label>
  )
}

interface SwitchProps {
  on: boolean
  onClick: () => void
  children: ReactNode
}

// Píldora con interruptor: el botón se desliza y se enciende al activarla
function Switch({ on, onClick, children }: SwitchProps) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`inline-flex items-center gap-[9px] px-4 py-2.5 rounded-full border text-[13px] font-semibold cursor-pointer ${
        on ? 'border-fuse-600/50 bg-fuse-600/16 text-white' : 'border-white/12 bg-white/5 text-white/60'
      }`}
    >
      <span className={`relative w-[30px] h-[17px] flex-none rounded-full transition-colors ${on ? 'bg-fuse-600' : 'bg-white/20'}`}>
        <span className={`absolute top-0.5 size-[13px] rounded-full bg-white transition-all ${on ? 'left-[15px]' : 'left-0.5'}`} />
      </span>
      {children}
    </button>
  )
}
