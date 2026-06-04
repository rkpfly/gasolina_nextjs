import { Node, mergeAttributes } from '@tiptap/core';

export const RawHtml = Node.create({
  name: 'rawHtml',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      html: { default: '' },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-raw-html]',
        getAttrs: (el) => ({
          // The editor still reads from innerHTML when parsing standard content
          html: (el as HTMLElement).innerHTML,
        }),
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    // Securely encode the HTML to Base64 to prevent quote corruption in the DOM string
    let encodedHtml = '';
    try {
        // btoa is globally available in modern browsers and Node 18+ (Next.js)
        encodedHtml = btoa(encodeURIComponent(HTMLAttributes.html || ''));
    } catch (e) {
        // Fallback for older server environments
        encodedHtml = Buffer.from(encodeURIComponent(HTMLAttributes.html || '')).toString('base64');
    }

    return [
      'div',
      mergeAttributes(
        { 'data-raw-html': 'true' },
        { 'data-encoded-html': encodedHtml } // Store securely without breaking syntax
      ),
    ];
  },
});