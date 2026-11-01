import { Link } from 'react-router'

export default function LegalLinks() {
  return (
    <div className="flex gap-5 text-xs text-fg-faint">
      <Link to="/privacy" className="flex min-h-11 items-center hover:text-fg-secondary">Privacy Policy</Link>
      <Link to="/terms" className="flex min-h-11 items-center hover:text-fg-secondary">Terms of Service</Link>
      <Link to="/health" className="flex min-h-11 items-center hover:text-fg-secondary">Status</Link>
    </div>
  )
}
