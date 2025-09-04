import { normalizeMathMarkdown } from '@/lib/markdown/normalizeMath';

export function prepareAiMarkdown(input: string): string {
  return normalizeMathMarkdown(input);
}
