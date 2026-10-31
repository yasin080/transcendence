import { SearchIcon, XIcon } from './icons.tsx'

interface SearchInputProps {
  name: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  active?: boolean
  className?: string
  maxLength?: number
}

export default function SearchInput({
  name,
  value,
  onChange,
  placeholder,
  active = false,
  className = '',
  maxLength,
}: SearchInputProps) {
  return (
    <div
      className={`flex items-center gap-2.5 rounded-xl border bg-fill-strong px-3.5 py-2.5 transition-colors ${
        active ? 'border-fuse-600/50' : 'border-line-strong'
      } ${className}`}
    >
      <SearchIcon className="size-4 flex-none text-fg-muted" />
      <input
        name={name}
        maxLength={maxLength}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-fg-muted"
      />
      {value && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => onChange('')}
          className="grid size-5 flex-none cursor-pointer place-items-center rounded-full bg-fill-strong text-fg-secondary hover:text-white"
        >
          <XIcon className="size-3" />
        </button>
      )}
    </div>
  )
}
