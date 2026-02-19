export function getAuthHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('dashboard_token') : null
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  }
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
  }
  return headers
}
