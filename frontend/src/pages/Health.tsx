import StackStatus from '../components/StackStatus'

/** Diagnostic page: live probe of the API, database, Redis and WebSocket. */
export default function Health() {
  return <StackStatus />
}
