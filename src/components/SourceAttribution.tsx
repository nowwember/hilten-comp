interface SourceAttributionProps {
  url: string
  id?: string
  accessedAt?: string
}

export function SourceAttribution({ url, id, accessedAt }: SourceAttributionProps) {
  const formatDate = (iso?: string) => {
    if (!iso) return null
    try {
      const d = new Date(iso)
      return d.toLocaleDateString('ru-RU', { year: 'numeric', month: '2-digit', day: '2-digit' })
    } catch {
      return iso
    }
  }

  const dateStr = formatDate(accessedAt)

  return (
    <div className="mt-6 rounded-2xl px-3 py-2 text-[13px]" style={{ border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-muted)' }}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1">
          <span>Источник:</span>
          <span className="font-medium">ФИПИ</span>
          <span>·</span>
          <a href={url} target="_blank" rel="noopener" className="hover:underline" style={{ color: 'var(--accent-from)' }}>
            Оригинал
          </a>
          {id && <span style={{ color: 'var(--text-muted)' }}>(ID: {id})</span>}
        </div>
        {dateStr && (
          <div className="shrink-0 text-[12px]" style={{ color: 'var(--text-muted)' }}>доступ: {dateStr}</div>
        )}
      </div>
    </div>
  )
}

export default SourceAttribution
