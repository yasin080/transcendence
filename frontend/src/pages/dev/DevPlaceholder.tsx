import { useParams } from 'react-router'

/**
 * [RETOMAR] TEMPORAL: ocupa una ruta hasta que exista su página real.
 * Al sustituirla, cambiar el `element` de la ruta en main.tsx y quitar el
 * enlace del grupo Dev en SidebarNav.
 */
export default function DevPlaceholder({ title }: { title: string }) {
  const params = useParams()

  return (
    <section className="flex-1 min-w-0 overflow-y-auto px-7 pt-6 pb-8">
      <p className="text-eyebrow">Dev placeholder</p>
      <h1 className="mt-2 display-heading">{title}</h1>
      {Object.keys(params).length > 0 && (
        <pre className="mt-4 text-meta text-fg-muted">{JSON.stringify(params, null, 2)}</pre>
      )}
    </section>
  )
}
