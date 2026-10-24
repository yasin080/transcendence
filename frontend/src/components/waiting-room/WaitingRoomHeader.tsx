interface WaitingRoomHeaderProps {
  roomName: string
  isOwner: boolean
}

export default function WaitingRoomHeader({ roomName, isOwner }: WaitingRoomHeaderProps) {
  return (
    <header className="mb-5 flex flex-wrap items-center gap-4">
      <div className="min-w-0">
        <div className="text-eyebrow">Waiting room</div>
        <h1 className="display-title max-md:text-3xl md:truncate">{roomName}</h1>
      </div>

      <span className="ml-auto inline-flex items-center gap-2 rounded-full border border-line bg-void/50 px-3.5 py-2 text-meta">
        <span
          aria-hidden="true"
          className={`size-2 rounded-full ${isOwner ? 'bg-online' : 'bg-ember-300'}`}
        />
        {isOwner ? 'Waiting for players' : 'Waiting for the host'}
      </span>
    </header>
  )
}
