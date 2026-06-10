import React from 'react';

type Tone = 'dark' | 'light';

// Per-tone class sets so the renderer reads well on both dark (offers modal)
// and light (theme / book pages) backgrounds.
const TONES: Record<Tone, {
  body: string;
  strong: string;
  marker: string;
  heading: string;
  link: string;
  quote: string;
}> = {
  dark: {
    body: 'text-brand-gray/80',
    strong: 'text-white',
    marker: 'marker:text-white/30',
    heading: 'text-white',
    link: 'text-white underline underline-offset-2 hover:text-white/70',
    quote: 'border-white/20 text-brand-gray/70',
  },
  light: {
    body: 'text-brand-gray',
    strong: 'text-brand-black',
    marker: 'marker:text-brand-gray/40',
    heading: 'text-brand-black',
    link: 'text-brand-black underline underline-offset-2 hover:text-brand-gray',
    quote: 'border-brand-border text-brand-gray/80',
  },
};

// Safely render JSONB content: stringified/parsed Tiptap JSON, plain strings, or arrays.
const JsonRenderer = ({ content, tone = 'dark' }: { content: any; tone?: Tone }) => {
  const t = TONES[tone];

  if (content === null || content === undefined || content === '') return null;

  // 0. A stringified value may itself be JSON (Tiptap doc) — try to parse it.
  if (typeof content === 'string') {
    const trimmed = content.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed && typeof parsed === 'object') {
          return <JsonRenderer content={parsed} tone={tone} />;
        }
      } catch {
        // not JSON — fall through to plain-text rendering
      }
    }
    // 1. Plain string (legacy data / flat strings). Preserve line breaks.
    return (
      <p className={`text-sm sm:text-base ${t.body} leading-relaxed font-medium whitespace-pre-line`}>
        {content}
      </p>
    );
  }

  // 2. Simple arrays (bullet points)
  if (Array.isArray(content)) {
    return (
      <ul className={`list-disc list-outside ml-4 space-y-2 text-sm sm:text-base ${t.body} leading-relaxed font-medium ${t.marker}`}>
        {content.map((item, index) => (
          <li key={index}>{typeof item === 'string' ? item : JSON.stringify(item)}</li>
        ))}
      </ul>
    );
  }

  // 3. Tiptap JSON AST
  if (content.type === 'doc' && Array.isArray(content.content)) {
    return <div className="tiptap-content space-y-1">{content.content.map((child: any, i: number) => renderNode(child, i, t))}</div>;
  }

  // 4. Fallback for unknown complex JSON structures
  return (
    <pre className={`text-xs ${t.body} whitespace-pre-wrap bg-white/5 p-4 rounded-sm border border-white/10 overflow-x-auto`}>
      {JSON.stringify(content, null, 2)}
    </pre>
  );
};

type ToneClasses = (typeof TONES)[Tone];

function renderNode(node: any, index: number, t: ToneClasses): React.ReactNode {
  switch (node?.type) {
    case 'text': {
      let el: React.ReactNode = node.text;
      if (node.marks) {
        node.marks.forEach((mark: any, mi: number) => {
          const key = `${index}-${mi}`;
          if (mark.type === 'bold') el = <strong key={`b-${key}`} className={`font-bold ${t.strong}`}>{el}</strong>;
          else if (mark.type === 'italic') el = <em key={`i-${key}`} className="italic">{el}</em>;
          else if (mark.type === 'strike') el = <s key={`s-${key}`}>{el}</s>;
          else if (mark.type === 'underline') el = <u key={`u-${key}`}>{el}</u>;
          else if (mark.type === 'code') el = <code key={`c-${key}`} className="px-1 py-0.5 rounded bg-black/10 font-mono text-[0.85em]">{el}</code>;
          else if (mark.type === 'link') {
            el = (
              <a key={`l-${key}`} href={mark.attrs?.href} target="_blank" rel="noopener noreferrer" className={t.link}>
                {el}
              </a>
            );
          }
        });
      }
      return <React.Fragment key={index}>{el}</React.Fragment>;
    }

    case 'hardBreak':
      return <br key={index} />;

    case 'paragraph':
      return (
        <p key={index} className={`mb-4 last:mb-0 text-sm sm:text-base ${t.body} leading-relaxed font-medium`}>
          {node.content ? node.content.map((c: any, i: number) => renderNode(c, i, t)) : <br />}
        </p>
      );

    case 'heading': {
      const level = node.attrs?.level ?? 2;
      const sizes: Record<number, string> = {
        1: 'text-2xl sm:text-3xl',
        2: 'text-xl sm:text-2xl',
        3: 'text-lg sm:text-xl',
      };
      const Tag = (`h${level}` as keyof React.JSX.IntrinsicElements);
      return (
        <Tag key={index} className={`${sizes[level] ?? sizes[3]} font-display font-bold tracking-tight ${t.heading} mt-6 mb-3 first:mt-0`}>
          {node.content?.map((c: any, i: number) => renderNode(c, i, t))}
        </Tag>
      );
    }

    case 'bulletList':
      return (
        <ul key={index} className={`list-disc list-outside ml-4 space-y-2 mb-4 last:mb-0 ${t.body} ${t.marker}`}>
          {node.content?.map((c: any, i: number) => renderNode(c, i, t))}
        </ul>
      );

    case 'orderedList':
      return (
        <ol key={index} className={`list-decimal list-outside ml-4 space-y-2 mb-4 last:mb-0 ${t.body} ${t.marker}`}>
          {node.content?.map((c: any, i: number) => renderNode(c, i, t))}
        </ol>
      );

    case 'listItem':
      return (
        <li key={index} className="text-sm sm:text-base leading-relaxed font-medium">
          {node.content?.map((c: any, i: number) => renderNode(c, i, t))}
        </li>
      );

    case 'blockquote':
      return (
        <blockquote key={index} className={`border-l-4 ${t.quote} pl-4 italic mb-4 last:mb-0`}>
          {node.content?.map((c: any, i: number) => renderNode(c, i, t))}
        </blockquote>
      );

    default:
      // Unknown node with children — render children so we never silently drop text.
      if (Array.isArray(node?.content)) {
        return <React.Fragment key={index}>{node.content.map((c: any, i: number) => renderNode(c, i, t))}</React.Fragment>;
      }
      return null;
  }
}

export default JsonRenderer;
