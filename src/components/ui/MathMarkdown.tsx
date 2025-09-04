import React from 'react';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMath from 'remark-math';
import remarkRehype from 'remark-rehype';
import rehypeMathjax from 'rehype-mathjax/svg';
import rehypeStringify from 'rehype-stringify';
import { useRouter } from 'next/router';

interface MathMarkdownProps {
  source: string;
  className?: string;
  onOpenWhiteboard?: (fragment?: string) => void;
}

export const MathMarkdown: React.FC<MathMarkdownProps> = ({ source, className }) => {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const [html, setHtml] = React.useState<string>('');

  React.useEffect(() => {
    let cancelled = false;
    async function render() {
      setError(null);
      try {
        const file = await unified()
          .use(remarkParse)
          .use(remarkMath)
          .use(remarkRehype, { allowDangerousHtml: false })
          .use(rehypeMathjax)
          .use(rehypeStringify)
          .process(source);
        if (!cancelled) setHtml(String(file));
      } catch (e: any) {
        setError(e.message || 'Ошибка рендера формулы');
      }
    }
    render();
    return () => { cancelled = true; };
  }, [source]);

  if (error) {
    return (
      <div className={className || 'prose max-w-none'}>
        <pre className="bg-gray-100 rounded p-3 text-sm overflow-x-auto mb-2">{source}</pre>
        <div className="text-xs text-slate-500 mt-2">Не удалось отрисовать формулу</div>
        <button
          className="mt-2 px-3 py-1 rounded bg-blue-100 hover:bg-blue-200 text-blue-700 transition"
          onClick={() => router.push(`/whiteboard?fragment=${encodeURIComponent(source)}`)}
        >Открыть на доске</button>
      </div>
    );
  }
  return (
    <div
      className={className || 'prose max-w-none'}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
