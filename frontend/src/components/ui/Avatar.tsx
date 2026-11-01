const defaultAvatar = '/avatar/blue-worm.png'

export type AvatarStatus = 'online' | 'offline' | 'none'

// Token of the background behind the avatar: the ring and the dot's border
// are painted in that colour so they look "cut out" against it.
export type AvatarRing = 'void' | 'surface'

interface AvatarProps {
  size: number
  src?: string | null
  status?: AvatarStatus
  ring?: AvatarRing
  ringWidth?: number
}

export default function Avatar({
  size,
  src = null,
  status = 'none',
  ring = 'surface',
  ringWidth = 0,
}: AvatarProps) {
  const ringColor = `var(--color-${ring})`

  // Literals: geometry proportional to size (values from the design handoff).
  const radius = Math.round(size * 0.3)
  const dot = Math.min(22, Math.max(8, Math.round(size * 0.24)))
  const dotOffset = -dot * 0.18
  const dotBorder = Math.max(2, size * 0.05)
  const online = status === 'online'

  return (
    <div aria-hidden="true" className="relative flex-none" style={{ width: size, height: size }}>
      <img
        src={src ?? defaultAvatar}
        alt=""
        className="size-full bg-surface object-cover"
        style={{
          borderRadius: radius,
          boxShadow: `0 0 0 ${ringWidth}px ${ringColor}`,
        }}
      />

      {status !== 'none' && (
        <span
          className={`absolute rounded-full ${online ? 'bg-online' : 'bg-offline'}`}
          style={{
            right: dotOffset,
            bottom: dotOffset,
            width: dot,
            height: dot,
            boxShadow: online
              ? `0 0 0 ${dotBorder}px ${ringColor}, 0 0 10px 1px color-mix(in srgb, var(--color-online) 55%, transparent)`
              : `0 0 0 ${dotBorder}px ${ringColor}`,
          }}
        />
      )}
    </div>
  )
}