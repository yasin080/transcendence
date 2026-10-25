import StackStatus from '../components/StackStatus'

/** Diagnostic page: live probe of every service and of the last backup. */
export default function Health() {
  return (
    <article className="max-w-prose space-y-6">
      <h1 className="display-heading">Stack status</h1>
      <StackStatus />
    </article>
  )
}
