"use client";

import { useState, useEffect, useRef } from 'react';
import { generateHTML } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { TableKit } from '@tiptap/extension-table';
import { RawHtml } from '@/lib/RawHtmlExtension';

export default function BlogContent({ content }: { content: object }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Runs only in the browser — never during SSR.
    // generateHTML and TipTap extensions require window/DOM APIs,
    // so they must live here, not in useMemo which executes on the server.
    if (!content || !containerRef.current) return;

    const rawGenerated = generateHTML(content, [
      StarterKit,
      Image,
      Link.configure({ openOnClick: false }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TableKit,
      RawHtml,
    ]);

    const decoded = rawGenerated.replace(
      /<div data-raw-html="true" data-encoded-html="([^"]+)"><\/div>/g,
      (match, encoded) => {
        try {
          return `<div data-raw-html="true">${decodeURIComponent(atob(encoded))}</div>`;
        } catch (e) {
          console.error('Failed to decode Raw HTML block');
          return match;
        }
      }
    );

    // Write directly to DOM via ref — React never owns these child nodes,
    // so back-navigation reconciliation can't freeze animations on the
    // previous page.
    containerRef.current.innerHTML = decoded;
  }, [content]);

  return (
    <div
      ref={containerRef}
      className="
        text-brand-black text-base md:text-lg leading-relaxed
        [&>p]:mb-6 [&>p]:text-brand-gray
        [&>h1]:text-4xl [&>h1]:font-display [&>h1]:font-bold [&>h1]:uppercase [&>h1]:tracking-tighter [&>h1]:mt-12 [&>h1]:mb-6
        [&>h2]:text-3xl [&>h2]:font-display [&>h2]:font-bold [&>h2]:uppercase [&>h2]:tracking-tighter [&>h2]:mt-10 [&>h2]:mb-4
        [&>h3]:text-2xl [&>h3]:font-display [&>h3]:font-bold [&>h3]:uppercase [&>h3]:tracking-tighter [&>h3]:mt-8 [&>h3]:mb-4
        [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-6 [&>ul>li]:mb-2 [&>ul>li]:text-brand-gray
        [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-6 [&>ol>li]:mb-2 [&>ol>li]:text-brand-gray
        [&>blockquote]:border-l-4 [&>blockquote]:border-brand-accent [&>blockquote]:pl-6 [&>blockquote]:italic [&>blockquote]:text-xl [&>blockquote]:my-8
        [&>img]:w-full [&>img]:rounded-xl [&>img]:my-10
        [&>a]:text-brand-accent [&>a]:underline [&>a]:underline-offset-4 hover:[&>a]:text-brand-black
        [&_pre]:bg-[#1E1E1E] [&_pre]:text-gray-100 [&_pre]:p-5 [&_pre]:rounded-xl [&_pre]:overflow-x-auto [&_pre]:my-6 [&_pre]:whitespace-pre
        [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-sm [&_pre_code]:font-mono
        [&_p_code]:bg-gray-100 [&_p_code]:text-brand-accent [&_p_code]:px-1.5 [&_p_code]:py-0.5 [&_p_code]:rounded-md [&_p_code]:font-mono [&_p_code]:text-sm
        [&_table]:w-full [&_table]:my-8 [&_table]:border-collapse [&_table]:text-base
        [&_th]:border [&_th]:border-brand-border [&_th]:bg-black/5 [&_th]:p-3 [&_th]:text-left [&_th]:font-bold [&_th]:text-brand-black
        [&_td]:border [&_td]:border-brand-border [&_td]:p-3 [&_td]:align-top [&_td]:text-brand-gray
        [&_.tableWrapper]:overflow-x-auto
      "
    />
  );
}