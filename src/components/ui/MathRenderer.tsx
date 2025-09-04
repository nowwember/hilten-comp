import React, { useState, useEffect, useMemo, useRef } from 'react';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMath from 'remark-math';
import remarkRehype from 'remark-rehype';
import rehypeMathjax from 'rehype-mathjax/svg';
import rehypeStringify from 'rehype-stringify';

interface MathRendererProps {
  markdown: string;
  className?: string;
}

// Правильная функция для конвертации markdown в HTML с поддержкой математики
async function processMarkdownWithMath(text: string): Promise<string> {
  // MATH_DBG: Логируем входные данные
  if (process.env.NODE_ENV === 'development') {
    console.log('MATH_DBG: Input markdown length:', text.length);
    console.log('MATH_DBG: First 120 chars:', text.substring(0, 120));
  }

  try {
    const file = await unified()
      .use(remarkParse)
      .use(remarkMath)
      .use(remarkRehype, { allowDangerousHtml: false })
      .use(rehypeMathjax)
      .use(rehypeStringify)
      .process(text);

    const result = String(file);

    // MATH_DBG: Логируем конфигурацию
    if (process.env.NODE_ENV === 'development') {
      console.log('MATH_DBG: Plugin chain: ReactMarkdown + remarkMath + rehypeMathjax/svg (no sanitize after mathjax)');
      console.log('MATH_DBG: Generated HTML length:', result.length);
    }

    return result;
  } catch (error) {
    console.error('MATH_DBG: Error processing markdown:', error);
    return text; // Fallback to original text
  }
}

// Безопасная функция для рендеринга MathJax
const safeTypeset = () => {
  if (typeof window !== 'undefined' && (window as any).MathJax && (window as any).MathJax.typesetPromise) {
    try {
      return (window as any).MathJax.typesetPromise();
    } catch (error) {
      console.warn('MathJax typeset failed:', error);
    }
  }
};

export function MathRenderer({ markdown, className }: MathRendererProps) {
  const [isClient, setIsClient] = useState(false);
  const [html, setHtml] = useState<string>('');
  const lastMarkdownRef = useRef<string>('');
  const typesetTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Обрабатываем markdown с математикой
  useEffect(() => {
    if (markdown && markdown !== lastMarkdownRef.current) {
      lastMarkdownRef.current = markdown;
      
      processMarkdownWithMath(markdown).then(setHtml);
    }
  }, [markdown]);

  useEffect(() => {
    if (isClient && html) {
      // Очищаем предыдущий таймаут
      if (typesetTimeoutRef.current) {
        clearTimeout(typesetTimeoutRef.current);
      }
      
      // Небольшая задержка для гарантии загрузки MathJax
      typesetTimeoutRef.current = setTimeout(() => {
        safeTypeset();
      }, 100);
    }
    
    return () => {
      if (typesetTimeoutRef.current) {
        clearTimeout(typesetTimeoutRef.current);
      }
    };
  }, [html, isClient]);

  // Мемоизируем HTML для предотвращения лишних пересчетов
  const memoizedHtml = useMemo(() => {
    if (!html) return '';
    
    // Оборачиваем блочные формулы в my-4
    return html.replace(
      /<div class="math-block([^"]*)">/g,
      '<div class="math-block my-4$1">'
    );
  }, [html]);

  if (!markdown) return null;

  return (
    <div className={className || 'prose max-w-none'}>
      <div 
        className="math-content"
        dangerouslySetInnerHTML={{ __html: memoizedHtml }}
      />
    </div>
  );
}

export default MathRenderer;
