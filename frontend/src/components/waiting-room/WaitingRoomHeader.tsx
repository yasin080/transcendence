import { BotIcon } from './icons.tsx'

interface WaitingRoomHeaderProps {
  isOwner: boolean
  hasFreeSeat: boolean
  onAddBot: () => void
}

export default function WaitingRoomHeader({
  isOwner,
  hasFreeSeat,
  onAddBot,
}: WaitingRoomHeaderProps) {
  return (
    <header className="mb-5 flex flex-wrap items-center gap-4">
      <h1 className="min-w-0 heading-display">Waiting room</h1>

      <div className="ml-auto flex items-center gap-2.5">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#080718]/50 px-3.5 py-2 text-xs font-semibold">
          <span
            aria-hidden="true"
            className={`size-2 rounded-full ${isOwner ? 'bg-online' : 'bg-ember-300'}`}
          />
          {isOwner ? 'Waiting for players' : 'Waiting for the host'}
        </span>

        {isOwner && hasFreeSeat && (
          <button
            type="button"
            onClick={onAddBot}
            title="Fill the next free seat with a bot"
            className="flex cursor-pointer items-center gap-2 rounded-full border border-mint/[.32] bg-online/10 py-[9px] pr-[15px] pl-[11px] text-bot-action hover:border-mint/[.65] hover:bg-online/20"
          >
            <BotIcon />
            <span>Add bot</span>
          </button>
        )}
      </div>
    </header>
  )
}