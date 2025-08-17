'use client';

import '@blocknote/core/fonts/inter.css';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/shadcn';
import '@blocknote/shadcn/style.css';
import { useEffect, useRef } from 'react';

async function uploadFileToServer(file) {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch('/api/upload/image', { method: 'POST', body: fd });
  const json = await res.json();
  if (!json.success) throw new Error('Upload failed');
  return json.url;
}

function enhanceHTMLWithStyles(html) {
  if (!html) return '';
  let styledHTML = html
    .replace(/<h1>/g, '<h1 class="text-3xl font-bold mb-4">')
    .replace(/<h2>/g, '<h2 class="text-2xl font-semibold mb-3">')
    .replace(/<h3>/g, '<h3 class="text-xl font-medium mb-2">')
    .replace(/<p>/g, '<p class="mb-4 leading-relaxed">')
    .replace(/<ul>/g, '<ul class="list-disc list-inside mb-4 space-y-2">')
    .replace(/<ol>/g, '<ol class="list-decimal list-inside mb-4 space-y-2">')
    .replace(/<li>/g, '<li class="ml-4">')
    .replace(
      /<pre>/g,
      '<pre class="bg-gray-100 border rounded-lg p-4 mb-4 overflow-x-auto">'
    )
    .replace(
      /<code>/g,
      '<code class="bg-gray-100 px-2 py-1 rounded text-sm font-mono">'
    )
    .replace(
      /<blockquote>/g,
      '<blockquote class="border-l-4 border-gray-300 pl-4 italic mb-4 text-gray-700">'
    )
    .replace(/<a /g, '<a class="text-blue-600 hover:text-blue-800 underline" ')
    .replace(/<img /g, '<img class="max-w-full h-auto rounded-lg mb-4" ')
    .replace(
      /<table>/g,
      '<table class="w-full border-collapse border border-gray-300 mb-4">'
    )
    .replace(
      /<th>/g,
      '<th class="border border-gray-300 px-4 py-2 bg-gray-100 font-semibold">'
    )
    .replace(/<td>/g, '<td class="border border-gray-300 px-4 py-2">')
    .replace(/<strong>/g, '<strong class="font-bold">')
    .replace(/<em>/g, '<em class="italic">');

  return `<div class="prose prose-lg max-w-none">${styledHTML}</div>`;
}

const EditorShadcn = ({ onChange, initialContent = null, editable = true }) => {
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // 🔹 Crash-safe parser
  let parsedContent;
  try {
    parsedContent =
      typeof initialContent === 'string' && initialContent.trim() !== ''
        ? JSON.parse(initialContent)
        : Array.isArray(initialContent)
        ? initialContent
        : typeof initialContent === 'object' && initialContent !== null
        ? [initialContent]
        : undefined;
  } catch (err) {
    console.warn('Invalid initialContent, using empty editor:', err);
    parsedContent = undefined;
  }

  const editor = useCreateBlockNote({
    initialContent: parsedContent,
    uploadFile: uploadFileToServer,
  });

  useEffect(() => {
    if (!editor) return;

    const onContentChange = async () => {
      try {
        let json, html, styledHTML;

        if (editor.topLevelBlocks) {
          json = editor.topLevelBlocks;
        } else if (editor.document) {
          json = editor.document;
        } else {
          json = [];
        }

        if (typeof editor.blocksToHTMLLossy === 'function') {
          html = await editor.blocksToHTMLLossy(json);
        } else if (typeof editor.blocksToHTML === 'function') {
          html = await editor.blocksToHTML(json);
        } else {
          html = '';
        }

        styledHTML = enhanceHTMLWithStyles(html);

        const content = {
          json,
          html: styledHTML,
          rawHTML: html,
        };

        if (onChangeRef.current) {
          onChangeRef.current(content);
        }
      } catch (error) {
        console.error('Error in editor onChange:', error);
        if (onChangeRef.current) {
          onChangeRef.current({ json: [], html: '', rawHTML: '' });
        }
      }
    };

    if (typeof editor.onEditorContentChange === 'function') {
      editor.onEditorContentChange(onContentChange);
    } else if (typeof editor.on === 'function') {
      editor.on('contentChange', onContentChange);
    }

    const timeoutId = setTimeout(onContentChange, 500);

    return () => {
      clearTimeout(timeoutId);
      if (editor && typeof editor.off === 'function') {
        editor.off('contentChange', onContentChange);
      }
    };
  }, [editor]);

  return (
    <div className="-mx-[54px] my-4">
      <BlockNoteView editor={editor} editable={editable} theme="light" />
    </div>
  );
};

export default EditorShadcn;
