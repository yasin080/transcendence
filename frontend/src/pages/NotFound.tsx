import { Link } from 'react-router'

export default function NotFound() {
  return (
    <article className="grid min-h-[60vh] place-content-center gap-4 text-center">
      <p aria-hidden="true" className="display-hero text-8xl text-fuse-600">404</p>
      <h1 className="display-heading">Page not found</h1>
      <p className="text-fg-secondary">There is nothing at this address.</p>
      <Link to="/" className="inline-block text-fuse-400 hover:text-white">
        Back to the home page
      </Link>
    </article>
  )
}
