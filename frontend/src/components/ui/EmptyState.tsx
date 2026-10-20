interface EmptyStateProps {
  title: string
  text?: string
}

export default function EmptyState({ title, text }: EmptyStateProps) {
  return (
    <div className="rounded-xl border border-dashed border-line-strong p-5 text-center">
      <p className="text-sm font-bold">{title}</p>
      {text && <p className="mt-1 text-meta text-fg-muted">{text}</p>}
    </div>
  )
}
