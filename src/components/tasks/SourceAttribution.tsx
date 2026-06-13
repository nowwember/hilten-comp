interface SourceAttributionProps {
  url: string
  accessedAt?: string
  id?: string
}

export function SourceAttribution({ url, accessedAt, id }: SourceAttributionProps) {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  return (
    <div className="mt-6 pt-3 text-[13px]" style={{ borderTop: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
      <div className="flex flex-wrap items-center gap-1">
        <span>Источник:</span>
        <a
          href={url}
          target="_blank"
          rel="nofollow noopener"
          className="hover:underline"
          style={{ color: 'var(--accent-from)' }}
        >
          Открытый банк заданий ФИПИ
        </a>
        <span>·</span>
        <a
          href={url}
          target="_blank"
          rel="nofollow noopener"
          className="hover:underline"
          style={{ color: 'var(--accent-from)' }}
        >
          Оригинал
        </a>
        {accessedAt && (
          <>
            <span>·</span>
            <span>доступ: {formatDate(accessedAt)}</span>
          </>
        )}
        {id && (
          <>
            <span>·</span>
            <span>ID: {id}</span>
          </>
        )}
      </div>
    </div>
  )
}
