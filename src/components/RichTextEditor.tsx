'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';

interface RichTextEditorProps {
  /** Stringified Tiptap JSON (or legacy plain text). */
  value?: string;
  /** Receives the stringified Tiptap JSON on every change (empty string when blank). */
  onChange: (value: string) => void;
  placeholder?: string;
}

// Accepts a stringified Tiptap JSON doc, a legacy plain-text string, or empty.
function parseInitialContent(value?: string) {
  if (!value) return '';
  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === 'object') return parsed;
  } catch {
    // not JSON — treat as legacy plain text
  }
  return value;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        link: { openOnClick: false },
      }),
      Placeholder.configure({
        placeholder: placeholder ?? 'Write the theme description…',
      }),
    ],
    content: parseInitialContent(value),
    editorProps: {
      attributes: { class: 'rte-prose focus:outline-none' },
    },
    onUpdate: ({ editor }) => {
      // Store empty string when there's no real content, so the field reads as blank.
      onChange(editor.getText().trim() ? JSON.stringify(editor.getJSON()) : '');
    },
  });

  if (!editor) {
    return (
      <div className="rounded-md border border-[#2a2d36] bg-[#0d0f13] px-3 py-2 text-sm text-[#3d4150]">
        Loading editor…
      </div>
    );
  }

  const btn = (active: boolean) =>
    `px-2 py-1 rounded text-xs font-medium border transition-colors ${
      active
        ? 'bg-indigo-600 border-indigo-500 text-white'
        : 'bg-[#0d0f13] border-[#2a2d36] text-[#9ca3b0] hover:text-white hover:border-[#3d4150]'
    }`;

  const setLink = () => {
    const prev = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Link URL', prev ?? 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className="rounded-md border border-[#2a2d36] bg-[#0d0f13] overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-[#2a2d36] bg-[#111318] px-2 py-2">
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btn(editor.isActive('bold'))} title="Bold">
          <strong>B</strong>
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btn(editor.isActive('italic'))} title="Italic">
          <em>I</em>
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} className={btn(editor.isActive('strike'))} title="Strikethrough">
          <s>S</s>
        </button>

        <span className="w-px h-5 bg-[#2a2d36] mx-1" />

        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={btn(editor.isActive('heading', { level: 1 }))} title="Heading 1">H1</button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btn(editor.isActive('heading', { level: 2 }))} title="Heading 2">H2</button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={btn(editor.isActive('heading', { level: 3 }))} title="Heading 3">H3</button>

        <span className="w-px h-5 bg-[#2a2d36] mx-1" />

        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btn(editor.isActive('bulletList'))} title="Bullet list">•</button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btn(editor.isActive('orderedList'))} title="Numbered list">1.</button>
        <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={btn(editor.isActive('blockquote'))} title="Quote">❝</button>

        <span className="w-px h-5 bg-[#2a2d36] mx-1" />

        <button type="button" onClick={setLink} className={btn(editor.isActive('link'))} title="Link">🔗</button>
      </div>

      {/* Editor surface */}
      <EditorContent editor={editor} />

      {/* Scoped styles for the editing surface (dark admin theme) */}
      <style>{`
        .rte-prose {
          min-height: 9rem;
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          line-height: 1.7;
          color: #e2e5ed;
        }
        .rte-prose:focus { outline: none; }
        .rte-prose p { margin: 0 0 0.75rem; }
        .rte-prose p:last-child { margin-bottom: 0; }
        .rte-prose h1 { font-size: 1.5rem; font-weight: 700; margin: 1rem 0 0.5rem; color: #fff; }
        .rte-prose h2 { font-size: 1.25rem; font-weight: 700; margin: 0.875rem 0 0.5rem; color: #fff; }
        .rte-prose h3 { font-size: 1.05rem; font-weight: 600; margin: 0.75rem 0 0.5rem; color: #fff; }
        .rte-prose ul { list-style: disc; margin: 0 0 0.75rem 1.25rem; }
        .rte-prose ol { list-style: decimal; margin: 0 0 0.75rem 1.25rem; }
        .rte-prose li { margin-bottom: 0.25rem; }
        .rte-prose a { color: #818cf8; text-decoration: underline; }
        .rte-prose blockquote { border-left: 3px solid #2a2d36; padding-left: 0.75rem; margin: 0 0 0.75rem; color: #9ca3b0; font-style: italic; }
        .rte-prose strong { color: #fff; }
        .rte-prose p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
          color: #3d4150;
        }
      `}</style>
    </div>
  );
}
