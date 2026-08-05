// app/admin/components/BlogEditor.tsx
'use client';

import React, { useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { TableKit } from '@tiptap/extension-table';
import { RawHtml } from '@/lib/RawHtmlExtension'; // Make sure this path is correct

interface BlogEditorProps {
  onSave: (content: string) => void;
  initialContent?: string;
  isLoading?: boolean;
}

export function BlogEditor({ onSave, initialContent = '', isLoading = false }: BlogEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'editor-link',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'editor-image',
        },
      }),
      Placeholder.configure({
        placeholder: 'Start writing your blog post...',
      }),
      // Registers table/row/header/cell nodes so pasted HTML tables are
      // recognised instead of being flattened to plain text.
      TableKit.configure({
        table: { resizable: true, HTMLAttributes: { class: 'editor-table' } },
      }),
      RawHtml
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'editor-content',
      },
    },
  });

  const handleSave = useCallback(() => {
    if (editor) {
      onSave(editor.getHTML());
    }
  }, [editor, onSave]);

  if (!editor) {
    return <div className="editor-loading">Loading editor...</div>;
  }

  return (
    <div className="blog-editor">
      <EditorToolbar editor={editor} onSave={handleSave} isLoading={isLoading} />
      <EditorContent editor={editor} />
    </div>
  );
}

// ============================================
// EDITOR TOOLBAR
// ============================================

interface EditorToolbarProps {
  editor: any;
  onSave: () => void;
  isLoading: boolean;
}

function EditorToolbar({ editor, onSave, isLoading }: EditorToolbarProps) {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  const handleAddLink = () => {
    if (linkUrl) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
      setLinkUrl('');
      setShowLinkInput(false);
    }
  };

  const handleAddImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const handleAddRawHtml = () => {
    const html = prompt('Paste your raw HTML here:');
    if (html) {
      editor.chain().focus().insertContent({
        type: 'rawHtml',
        attrs: { html: html },
      }).run();
    }
  };

  const toggleHeading = (level: number) => {
    editor.chain().focus().toggleHeading({ level }).run();
  };

  return (
    <div className="editor-toolbar">
      <div className="toolbar-group">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`toolbar-btn ${editor.isActive('bold') ? 'active' : ''}`}
          title="Bold (Ctrl+B)"
        >
          <strong>B</strong>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`toolbar-btn ${editor.isActive('italic') ? 'active' : ''}`}
          title="Italic (Ctrl+I)"
        >
          <em>I</em>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`toolbar-btn ${editor.isActive('strike') ? 'active' : ''}`}
          title="Strikethrough"
        >
          S
        </button>
      </div>

      <div className="toolbar-group">
        <select
          className="toolbar-select"
          value={editor.isActive('heading', { level: 1 }) ? '1' : editor.isActive('heading', { level: 2 }) ? '2' : editor.isActive('heading', { level: 3 }) ? '3' : 'p'}
          onChange={(e) => {
            if (e.target.value === 'p') {
              editor.chain().focus().setParagraph().run();
            } else {
              toggleHeading(parseInt(e.target.value));
            }
          }}
        >
          <option value="p">Paragraph</option>
          <option value="1">Heading 1</option>
          <option value="2">Heading 2</option>
          <option value="3">Heading 3</option>
        </select>
      </div>

      <div className="toolbar-group">
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`toolbar-btn ${editor.isActive('bulletList') ? 'active' : ''}`}
          title="Bullet List"
        >
          •
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`toolbar-btn ${editor.isActive('orderedList') ? 'active' : ''}`}
          title="Ordered List"
        >
          1.
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`toolbar-btn ${editor.isActive('codeBlock') ? 'active' : ''}`}
          title="Code Block"
        >
          &lt;&gt;
        </button>
        <button
          onClick={() =>
            editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
          }
          className={`toolbar-btn ${editor.isActive('table') ? 'active' : ''}`}
          title="Insert Table"
        >
          ▦
        </button>
      </div>

      <div className="toolbar-group">
        <button
          onClick={() => setShowLinkInput(!showLinkInput)}
          className={`toolbar-btn ${editor.isActive('link') ? 'active' : ''}`}
          title="Add Link"
        >
          🔗
        </button>
        <button onClick={handleAddImage} className="toolbar-btn" title="Add Image">
          🖼️
        </button>
        <button onClick={handleAddRawHtml} className="toolbar-btn" title="Embed Raw HTML">
          &lt;/&gt; Embed
        </button>
      </div>

      <div className="toolbar-divider"></div>

      <button
        onClick={onSave}
        className="toolbar-btn toolbar-save"
        disabled={isLoading}
        title="Save"
      >
        {isLoading ? '💾 Saving...' : '💾 Save'}
      </button>

      {showLinkInput && (
        <div className="link-input-group">
          <input
            type="url"
            placeholder="Enter URL"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddLink()}
            className="toolbar-input"
          />
          <button onClick={handleAddLink} className="toolbar-btn">
            ✓
          </button>
          <button onClick={() => setShowLinkInput(false)} className="toolbar-btn">
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================
// TIPTAP EDITOR STYLES
// ============================================

const editorStyles = `
.blog-editor {
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--secondary);
}

.editor-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 1rem;
  border-bottom: 1px solid var(--border);
  background: var(--tertiary);
  align-items: center;
}

.toolbar-group {
  display: flex;
  gap: 0.25rem;
  padding: 0 0.5rem;
  border-right: 1px solid var(--border);
}

.toolbar-group:last-of-type {
  border-right: none;
}

.toolbar-btn {
  padding: 0.5rem 0.75rem;
  background: var(--secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  cursor: pointer;
  transition: var(--transition);
  font-weight: 600;
  min-width: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toolbar-btn:hover {
  background: var(--accent);
  border-color: var(--accent);
  color: white;
}

.toolbar-btn.active {
  background: var(--accent);
  border-color: var(--accent);
  color: white;
}

.toolbar-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.toolbar-select {
  padding: 0.5rem;
  background: var(--secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  cursor: pointer;
  transition: var(--transition);
}

.toolbar-select:focus {
  outline: none;
  border-color: var(--accent);
  background: rgba(59, 130, 246, 0.05);
}

.toolbar-divider {
  width: 1px;
  height: 24px;
  background: var(--border);
  margin: 0 0.25rem;
}

.toolbar-save {
  margin-left: auto;
  background: linear-gradient(135deg, var(--success) 0%, var(--green) 100%);
  border: none;
  color: white;
}

.toolbar-save:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.link-input-group {
  display: flex;
  gap: 0.5rem;
  padding: 0 0.5rem;
  flex-wrap: wrap;
  width: 100%;
}

.toolbar-input {
  flex: 1;
  min-width: 200px;
  padding: 0.5rem;
  background: var(--secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  transition: var(--transition);
}

.toolbar-input:focus {
  outline: none;
  border-color: var(--accent);
}

.editor-content {
  min-height: 400px;
  padding: 2rem;
  overflow-y: auto;
  color: var(--text-primary);
}

.editor-content h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 1.5rem 0 1rem;
  color: var(--text-primary);
}

.editor-content h2 {
  font-size: 2rem;
  font-weight: 700;
  margin: 1.25rem 0 0.75rem;
  color: var(--text-primary);
}

.editor-content h3 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 1rem 0 0.5rem;
  color: var(--text-primary);
}

.editor-content p {
  margin-bottom: 1rem;
  line-height: 1.8;
}

.editor-content ul,
.editor-content ol {
  margin: 1rem 0 1rem 2rem;
}

.editor-content li {
  margin-bottom: 0.5rem;
}

.editor-content a {
  color: var(--accent);
  text-decoration: underline;
  cursor: pointer;
}

.editor-content a:hover {
  color: var(--blue);
}

.editor-content code {
  background: var(--tertiary);
  padding: 0.2em 0.4em;
  border-radius: var(--radius-sm);
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 0.9em;
}

.editor-content pre {
  background: var(--tertiary);
  padding: 1rem;
  border-radius: var(--radius-md);
  overflow-x: auto;
  margin: 1rem 0;
}

.editor-content pre code {
  background: none;
  padding: 0;
}

.editor-content blockquote {
  border-left: 4px solid var(--accent);
  padding-left: 1rem;
  margin: 1rem 0;
  color: var(--text-secondary);
  font-style: italic;
}

.editor-image {
  max-width: 100%;
  height: auto;
  border-radius: var(--radius-md);
  margin: 1rem 0;
  cursor: pointer;
}

/* Tables (pasted or inserted) */
.editor-content table,
.editor-content .editor-table {
  border-collapse: collapse;
  width: 100%;
  margin: 1rem 0;
  overflow: hidden;
  table-layout: fixed;
}

.editor-content th,
.editor-content td {
  border: 1px solid var(--border);
  padding: 0.5rem 0.75rem;
  vertical-align: top;
  text-align: left;
  position: relative;
  min-width: 3rem;
}

.editor-content th {
  background: var(--tertiary);
  font-weight: 700;
}

/* Cell selection highlight while editing */
.editor-content .selectedCell::after {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(59, 130, 246, 0.15);
  pointer-events: none;
}

/* Column-resize handle */
.editor-content .column-resize-handle {
  position: absolute;
  right: -2px;
  top: 0;
  bottom: -2px;
  width: 4px;
  background: var(--accent);
  cursor: col-resize;
}

.editor-content .tableWrapper {
  overflow-x: auto;
}

.editor-loading {
  padding: 2rem;
  text-align: center;
  color: var(--text-secondary);
}
`;

export const blogEditorStyles = editorStyles;