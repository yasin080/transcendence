export type User = {
  id: number
  username: string
  name: string | null
  email: string
  avatar_url: string | null
  bio: string | null
  created_at: string
}

/** Laravel's 422 shape: one array of messages per field. */
export type FieldErrors = Record<string, string[]>

export type ApiFailure = {
  status: number
  message: string
  errors: FieldErrors
}

export type ApiResult<T> = { ok: true; data: T } | { ok: false; failure: ApiFailure }

function readCookie(name: string): string | null {
  const prefix = `${name}=`

  for (const chunk of document.cookie.split('; ')) {
    if (chunk.startsWith(prefix)) return decodeURIComponent(chunk.slice(prefix.length))
  }

  return null
}

let csrfRequest: Promise<Response> | null = null

/**
 * Sanctum's cookie flow: one call to /sanctum/csrf-cookie plants XSRF-TOKEN,
 * which every write then echoes back in a header. Concurrent callers share the
 * same in-flight request instead of racing for the cookie. `force` refetches
 * even when a (possibly stale) cookie is present; the response overwrites it.
 */
async function ensureCsrfCookie(force = false): Promise<void> {
  if (!force && readCookie('XSRF-TOKEN')) return

  csrfRequest ??= fetch('/sanctum/csrf-cookie', { credentials: 'include' })

  try {
    await csrfRequest
  } finally {
    csrfRequest = null
  }
}

function messageFor(status: number, payload: { message?: unknown } | null): string {
  if (status === 429) return 'Too many attempts. Wait a minute and try again.'
  if (status === 419) return 'Your session expired. Please try again.'
  if (typeof payload?.message === 'string' && payload.message !== '') return payload.message

  return 'Something went wrong. Please try again.'
}

async function request<T>(method: string, path: string, body?: unknown, retry = true, keepalive = false): Promise<ApiResult<T>> {
  if (method !== 'GET') await ensureCsrfCookie()

  const headers: Record<string, string> = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  const token = readCookie('XSRF-TOKEN')
  if (token) headers['X-XSRF-TOKEN'] = token

  let response: Response

  try {
    response = await fetch(path, {
      method,
      credentials: 'include',
      headers,
      keepalive,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    return {
      ok: false,
      failure: { status: 0, message: 'Could not reach the server.', errors: {} },
    }
  }

  if (response.status === 204) return { ok: true, data: undefined as T }

  const payload: unknown = await response.json().catch(() => null)
  const record = (payload ?? null) as { ok?: unknown; status?: unknown; message?: unknown; errors?: unknown } | null

  if (!response.ok || record?.ok === false) {
    const status = response.ok ? Number(record?.status) : response.status


    if (status === 419 && retry) {
      await ensureCsrfCookie(true)

      return request<T>(method, path, body, false)
    }

    if (status === 401 && window.location.pathname !== '/') window.location.assign('/')

    return {
      ok: false,
      failure: {
        status,
        message: messageFor(status, record),
        errors: (record?.errors ?? {}) as FieldErrors,
      },
    }
  }

  return { ok: true, data: payload as T }
}

export const apiGet = <T>(path: string) => request<T>('GET', path)
export const apiPost = <T>(path: string, body?: unknown) => request<T>('POST', path, body)
export const apiPostOnClose = (path: string) => request('POST', path, undefined, true, true)
export const apiDelete = <T>(path: string) => request<T>('DELETE', path)
