import { Component, type ErrorInfo, type ReactNode } from 'react'

type Props = { children: ReactNode }
type State = { hasError: boolean }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Render error:', error, info.componentStack)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <article className="grid min-h-dvh place-content-center gap-4 bg-void text-center">
        <h1 className="display-heading">Something went wrong</h1>
        <p className="text-fg-secondary">An unexpected error occurred.</p>
        <a href="/lobby" className="inline-block text-fuse-400 hover:text-white">
          Back to the lobby
        </a>
      </article>
    )
  }
}
