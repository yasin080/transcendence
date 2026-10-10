import type { ReactNode } from 'react'

type SidebarProps = {
  /** Zona superior fija */
  header?: ReactNode
  /** Zona inferior fija */
  footer?: ReactNode
  /** Contenido central; hace scroll si no cabe */
  children?: ReactNode
}

/**
* Generic sidebar shell: structure only, no content of its own.
 * Width, background and border are set by the container
 */
export default function Sidebar({ header, footer, children }: SidebarProps) {
  return (
    <div className="flex h-full flex-col">
      {header && <div className="flex-none">{header}</div>}
      <div className="flex-1 min-h-0 overflow-y-auto">{children}</div>
      {footer && <div className="flex-none p-4">{footer}</div>}
    </div>
  )
}
