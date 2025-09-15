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
    <div className="mt-6 rounded-2xl border border-neutral-200/60 bg-neutral-50 px-3 py-2 text-[13px] text-slate-600">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1">
          <span>Источник:</span>
          <span className="font-medium">ФИПИ</span>
          <span>·</span>
          <a href={url} target="_blank" rel="noopener" className="text-blue-600 hover:underline">
            Оригинал
          </a>
          {id && <span className="text-slate-500">(ID: {id})</span>}
        </div>
        {dateStr && (
          <div className="shrink-0 text-[12px] text-slate-400">доступ: {dateStr}</div>
        )}
      </div>
    </div>
  )
}

export default SourceAttribution


