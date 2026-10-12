import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { apiPost } from '../../lib/api.ts'
import Modal from '../ui/Modal.tsx'
import ToggleChip from '../ui/ToggleChip.tsx'
import {
  BOARD_OPTIONS,
  DEFAULT_CHOICES,
  FOOD_OPTIONS,
  PLAYER_OPTIONS,
  SPEED_OPTIONS,
  toSettings,
  type Option,
  type RoomChoices,
} from './roomOptions.ts'
import type { Room } from './types.ts'

interface CreateRoomModalProps {
  onClose: () => void
}

const FIELD_LABEL = 'block mb-[7px] text-[11px] font-bold uppercase tracking-[.14em] text-white/45'

export default function CreateRoomModal({ onClose }: CreateRoomModalProps) {
  const navigate = useNavigate()
  const [name, setName] = useState('my little worm')
  const [choices, setChoices] = useState<RoomChoices>(DEFAULT_CHOICES)
  const [busy, setBusy] = useState(false)
  const [nameError, setNameError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const choose = <K extends keyof RoomChoices>(key: K, value: RoomChoices[K]) =>
    setChoices((prev) => ({ ...prev, [key]: value }))

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
    void navigate(`/dashboard/waiting-room/${result.data.code}`)
  }

  return (
    <Modal size="lg" onClose={onClose}>
      <form onSubmit={onSubmit} noValidate>
        <h3 className="font-display text-xl">Create custom match</h3>

        <label className="block mt-4.5">
          <span className={FIELD_LABEL}>Room name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={40}
            aria-invalid={nameError !== null}
            className="w-full px-3.5 py-3 rounded-[11px] border border-white/14 bg-surface-input text-sm text-white outline-none"
          />
          {nameError && <span className="block mt-1.5 text-sm text-fuse-600">{nameError}</span>}
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-[18px]">
          <ChipGroup label="Players" options={PLAYER_OPTIONS} value={choices.players} onChange={(v) => choose('players', v)} />
          <ChipGroup label="Board size" options={BOARD_OPTIONS} value={choices.boardSize} onChange={(v) => choose('boardSize', v)} />
          <ChipGroup label="Speed" options={SPEED_OPTIONS} value={choices.tickMs} onChange={(v) => choose('tickMs', v)} />
          <ChipGroup label="Food" options={FOOD_OPTIONS} value={choices.food} onChange={(v) => choose('food', v)} />

          <div>
            <span className={FIELD_LABEL}>Rules</span>
            <div className="flex flex-wrap gap-2">
              <ToggleChip selected={choices.wrap} onClick={() => choose('wrap', !choices.wrap)}>
                Wrap edges
              </ToggleChip>
              <ToggleChip selected={choices.pillars} onClick={() => choose('pillars', !choices.pillars)}>
                Pillars
              </ToggleChip>
            </div>
          </div>
        </div>

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

interface ChipGroupProps<T> {
  label: string
  options: Option<T>[]
  value: T
  onChange: (value: T) => void
}

// Grupo de chips donde solo uno puede estar seleccionado
function ChipGroup<T>({ label, options, value, onChange }: ChipGroupProps<T>) {
  return (
    <div>
      <span className={FIELD_LABEL}>{label}</span>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <ToggleChip key={option.label} selected={option.value === value} onClick={() => onChange(option.value)}>
            {option.label}
          </ToggleChip>
        ))}
      </div>
    </div>
  )
}
