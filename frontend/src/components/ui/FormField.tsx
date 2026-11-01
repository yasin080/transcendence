import { useId, type ChangeEvent, type Ref } from 'react'

interface FormFieldProps {
  ref?: Ref<HTMLInputElement>
  label: string
  name: string
  value: string
  onChange: (value: string) => void
  type?: string
  autoComplete?: string
  // Same shape Laravel returns: a list of messages; the first one is shown
  errors?: string[]
  // Help text under the field; hidden when there is an error
  hint?: string
  // If set, limits the input and shows an "n / max" counter
  maxLength?: number
  multiline?: boolean
  rows?: number
}

export default function FormField({
  ref,
  label,
  name,
  value,
  onChange,
  type = 'text',
  autoComplete,
  errors,
  hint,
  maxLength,
  multiline = false,
  rows = 3,
}: FormFieldProps) {
  const id = useId()
  const messageId = `${id}-message`
  const invalid = Boolean(errors?.length)
  const message = invalid ? errors?.[0] : hint

  // Props shared by <input> and <textarea>
  const control = {
    id,
    name,
    value,
    maxLength,
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(event.target.value),
    'aria-invalid': invalid || undefined,
    'aria-describedby': message ? messageId : undefined,
    className: `mt-1.5 w-full resize-none rounded-lg border bg-surface-input px-3 py-2 text-sm text-white placeholder:text-fg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-fuse-600 ${
      invalid ? 'border-fuse-600' : 'border-line-strong'
    }`,
  }

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-micro-label text-fg-secondary">
          {label}
        </label>
        {maxLength !== undefined && (
          <span className="text-meta text-fg-muted">
            {value.length} / {maxLength}
          </span>
        )}
      </div>

      {multiline ? (
        <textarea {...control} rows={rows} />
      ) : (
        <input {...control} ref={ref} type={type} autoComplete={autoComplete} />
      )}

      {message && (
        <p
          id={messageId}
          role={invalid ? 'alert' : undefined}
          className={`mt-1.5 text-meta ${invalid ? 'text-fuse-600' : 'text-fg-muted'}`}
        >
          {message}
        </p>
      )}
    </div>
  )
}