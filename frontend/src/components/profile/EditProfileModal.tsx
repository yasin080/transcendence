import { useEffect, useRef, useState, type ChangeEvent, type SubmitEvent } from 'react'
import Avatar from '../ui/Avatar.tsx'
import Button from '../ui/Button.tsx'
import Modal from '../ui/Modal.tsx'
import { AVATAR_GALLERY } from './avatars.ts'
import FormField from '../ui/FormField.tsx'
import { updateProfile, uploadAvatar, type ProfileUpdate } from './api.ts'
import type { ProfileUser } from './types.ts'

// Same types the backend accepts (POST /api/user/avatar)
const AVATAR_TYPES = ['image/png', 'image/jpeg']
const AVATAR_MAX_BYTES = 2 * 1024 * 1024 // 2 MB
const AVATAR_ERROR = 'That file is not a valid image. Use PNG or JPG up to 2 MB.'

const NICK = /^[A-Za-z0-9_-]{3,20}$/
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const NAME_MAX = 50

interface FormValues {
  username: string
  name: string
  email: string
  bio: string
  password: string
  password_confirmation: string
  current_password: string
}

// Same shape as Laravel: a list of messages per field
type FormErrors = Partial<Record<keyof FormValues, string[]>>

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {}

  if (!NICK.test(values.username.trim())) {
    errors.username = ['Use 3–20 letters, numbers, _ or -.']
  }
  if (values.name.trim().length > NAME_MAX) {
    errors.name = [`Name can be at most ${NAME_MAX} characters.`]
  }
  const email = values.email.trim()
  if (email === '') {
    errors.email = ['Enter your email.']
  } else if (!EMAIL.test(email)) {
    errors.email = ['That email address is not valid.']
  }
  const changingPassword = values.password !== '' || values.password_confirmation !== ''
  if (changingPassword) {
    if (values.password.length < 8) {
      errors.password = ['Passwords need at least 8 characters.']
    }
    if (values.password !== values.password_confirmation) {
      errors.password_confirmation = ['Passwords do not match.']
    }
  }
  return errors
}

interface EditProfileModalProps {
  profile: ProfileUser
  email: string
  onSaved: () => void
  onClose: () => void
}

export default function EditProfileModal({ profile, email, onSaved, onClose }: EditProfileModalProps) {
  const [values, setValues] = useState<FormValues>({
    username: profile.username,
    name: profile.name ?? '',
    email,
    bio: profile.bio,
    password: '',
    password_confirmation: '',
    current_password: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  // Avatar picked from the gallery (null = default)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile.avatarUrl)
  // Avatar the server has right now (changes after an upload)
  const [savedAvatar, setSavedAvatar] = useState<string | null>(profile.avatarUrl)
  // File chosen by the user and its temporary URL for the preview
  const [upload, setUpload] = useState<{ file: File; preview: string } | null>(null)
  const [avatarError, setAvatarError] = useState<string | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  const [saving, setSaving] = useState(false)
  // Error not tied to a field (e.g. the server could not be reached)
  const [formError, setFormError] = useState<string | null>(null)

  function set(field: keyof FormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  // Release the temporary URL when the file changes or the modal closes
  useEffect(() => {
    if (!upload) return
    return () => URL.revokeObjectURL(upload.preview)
  }, [upload])

  function chooseGallery(url: string | null) {
    setUpload(null)
    setAvatarError(null)
    setAvatarUrl(url)
  }

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = '' // lets the user pick the same file again
    if (!file) return

    if (!AVATAR_TYPES.includes(file.type) || file.size > AVATAR_MAX_BYTES) {
      setAvatarError(AVATAR_ERROR)
      return
    }

    setAvatarError(null)
    setUpload({ file, preview: URL.createObjectURL(file) })
  }

  const preview = upload?.preview ?? avatarUrl

  async function onSubmit(event: SubmitEvent) {
    event.preventDefault()

    const found = validate(values)
    setErrors(found)
    setFormError(null)
    if (Object.keys(found).length > 0) return

    setSaving(true)

    // 1. The uploaded photo goes through its own endpoint, which saves it
    if (upload) {
      const result = await uploadAvatar(upload.file)
      if (!result.ok) {
        setAvatarError(result.failure.errors.avatar?.[0] ?? result.failure.message)
        setSaving(false)
        return
      }
      // Already on the server: if the PATCH fails, a retry won't upload it again
      setUpload(null)
      setAvatarUrl(result.data.avatar)
      setSavedAvatar(result.data.avatar)
      onSaved() // show the new photo even if the user cancels
    }

    // 2. The rest of the data
    const update: ProfileUpdate = {
      username: values.username.trim(),
      name: values.name.trim(),
      email: values.email.trim(),
      bio: values.bio.trim(),
    }
    // Only send the avatar if another gallery one (or the default) was picked
    if (!upload && avatarUrl !== savedAvatar) update.avatar = avatarUrl
    if (values.password !== '') {
      update.password = values.password
      update.password_confirmation = values.password_confirmation
    }
    if (values.current_password !== '') update.current_password = values.current_password

    const result = await updateProfile(update)
    setSaving(false)

    if (!result.ok) {
      setErrors(result.failure.errors as FormErrors)
      setAvatarError(result.failure.errors.avatar?.[0] ?? null)
      if (Object.keys(result.failure.errors).length === 0) setFormError(result.failure.message)
      return
    }

    onSaved()
    onClose()
  }

  return (
    <Modal size="lg" onClose={onClose}>
      <h3 className="display-heading">Edit profile</h3>

      <form onSubmit={(event) => void onSubmit(event)} noValidate className="mt-4.5 flex flex-col gap-4.5">
        <div className="flex gap-5 rounded-xl border border-line bg-fill p-4">
          <Avatar size={92} src={preview} />

          <div className="flex min-w-0 flex-1 flex-col gap-2.5">
            <span className="text-micro-label text-fg-secondary">Avatar</span>

            <div className="flex flex-wrap gap-2.5">
              {AVATAR_GALLERY.map((item) => {
                const selected = !upload && avatarUrl === item.url
                return (
                  <button
                    key={item.label}
                    type="button"
                    aria-label={item.label}
                    aria-pressed={selected}
                    onClick={() => chooseGallery(item.url)}
                    className={`cursor-pointer rounded-2xl transition-opacity ${selected
                        ? 'ring-2 ring-fuse-600 ring-offset-2 ring-offset-surface'
                        : 'opacity-70 hover:opacity-100'
                      }`}
                  >
                    <Avatar size={48} src={item.url} />
                  </button>
                )
              })}
            </div>

            <div>
              <input
                ref={fileInput}
                type="file"
                name="avatar"
                accept={AVATAR_TYPES.join(',')}
                onChange={onFileChange}
                className="hidden"
              />
              <div className="flex flex-wrap items-center gap-2.5">
                <Button variant="ghost" size="sm" onClick={() => fileInput.current?.click()}>
                  Upload your own
                </Button>
                <span className="text-meta text-fg-muted">PNG or JPG · max 2 MB</span>
              </div>
              {avatarError && (
                <p role="alert" className="mt-1.5 text-meta text-fuse-600">
                  {avatarError}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Username"
            name="username"
            autoComplete="username"
            value={values.username}
            onChange={(value) => set('username', value)}
            errors={errors.username}
            hint="3–20 letters, numbers, _ or -"
          />
          <FormField
            label="Name"
            name="name"
            autoComplete="name"
            value={values.name}
            onChange={(value) => set('name', value)}
            errors={errors.name}
            hint="Optional · only visible to you"
          />
        </div>

        <FormField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={(value) => set('email', value)}
          errors={errors.email}
        />

        <FormField
          label="Bio"
          name="bio"
          value={values.bio}
          onChange={(value) => set('bio', value)}
          errors={errors.bio}
          maxLength={160}
          multiline
        />

        <div className="flex flex-col gap-3 border-t border-line pt-4">
          <div className="flex flex-wrap items-baseline gap-2.5">
            <h4 className="text-section-title">Change password</h4>
            <span className="text-meta text-fg-muted">Optional · leave blank to keep the current one</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="New password"
              name="password"
              type="password"
              autoComplete="new-password"
              value={values.password}
              onChange={(value) => set('password', value)}
              errors={errors.password}
            />
            <FormField
              label="Repeat password"
              name="password_confirmation"
              type="password"
              autoComplete="new-password"
              value={values.password_confirmation}
              onChange={(value) => set('password_confirmation', value)}
              errors={errors.password_confirmation}
            />
          </div>

          <FormField
            label="Current password"
            name="current_password"
            type="password"
            autoComplete="current-password"
            value={values.current_password}
            onChange={(value) => set('current_password', value)}
            errors={errors.current_password}
            hint="Required only if you change your email or password."
          />
        </div>

        {formError && (
          <p role="alert" className="text-meta text-fuse-600">
            {formError}
          </p>
        )}

        <div className="flex justify-end gap-2.5 border-t border-line pt-4">
          <Button variant="secondary" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md" disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}