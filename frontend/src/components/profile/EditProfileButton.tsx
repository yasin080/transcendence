import { PencilIcon } from './icons.tsx'

interface EditProfileButtonProps {
  onClick: () => void
}

export default function EditProfileButton({ onClick }: EditProfileButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex cursor-pointer items-center gap-2 rounded-xl border border-line-strong bg-fill px-4.5 py-2.5 text-meta text-fg-secondary transition-colors hover:bg-fill-strong hover:text-white"
    >
      <PencilIcon />
      Edit profile
    </button>
  )
}