export function formatDate(iso) {
  if (!iso) return '—'
  try {
    const d = new Date(iso)
    if (isNaN(d)) return '—'
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    return `${day}/${month}/${year}`
  } catch {
    return '—'
  }
}

export function formatKm(n) {
  if (n == null || n === '') return '—'
  return Number(n).toLocaleString('pt-PT') + ' km'
}

export function formatEuro(n) {
  if (n == null || n === '') return '—'
  return Number(n).toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'
}

export function daysDiff(fromISO, toISO) {
  if (!fromISO || !toISO) return null
  const from = new Date(fromISO)
  const to = new Date(toISO)
  const diff = Math.ceil((to - from) / (1000 * 60 * 60 * 24))
  return diff
}

export function todayISO() {
  return new Date().toISOString().split('T')[0]
}

export function daysUntil(dateISO) {
  if (!dateISO) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateISO)
  return Math.ceil((target - today) / (1000 * 60 * 60 * 24))
}

export function slugify(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}
