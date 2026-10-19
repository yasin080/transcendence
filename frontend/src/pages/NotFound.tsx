import { Link } from 'react-router'

export default function NotFound() {
  return (
    <article className="space-y-4">
      <h1 className="text-3xl font-bold tracking-tight">Page not found</h1>
      <p className="text-slate-400">There is nothing at this address.</p>
      <Link to="/" className="inline-block text-fuse-400 hover:text-white">
        Back to the home page
      </Link>
    </article>
  )
}
