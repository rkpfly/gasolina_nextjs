"use client"
;
import React from 'react';
import { Node, mergeAttributes } from '@tiptap/core';
import { NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react';

// NodeView: renders live HTML inside the editor
function RawHtmlNodeView({ node }: { node: any }) {
  return (
    <NodeViewWrapper>
        <div data-raw-html="true" dangerouslySetInnerHTML={{ __html: node.attrs.html }} />
    </NodeViewWrapper>
  );
}

export const RawHtml = Node.create({
  name: 'rawHtml',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      html: {
        default: '',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-raw-html]',
        getAttrs: (el) => ({
          // Recover the raw HTML from the element's innerHTML on parse
          html: (el as HTMLElement).innerHTML,
        }),
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    // This is what gets written to storage/output.
    // We wrap it in a div and set innerHTML via a data attribute
    // so the frontend renderer can reconstruct it.
    return [
      'div',
      mergeAttributes({ 'data-raw-html': true }, { 'data-html': HTMLAttributes.html }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(RawHtmlNodeView);
  },
});