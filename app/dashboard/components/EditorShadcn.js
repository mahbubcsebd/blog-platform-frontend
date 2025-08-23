/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import '@blocknote/core/fonts/inter.css';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/shadcn';
import '@blocknote/shadcn/style.css';
import { useEffect, useMemo, useRef, useState } from 'react';

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
  const [mounted, setMounted] = useState(false);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Handle mounting to prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Create default empty paragraph block that BlockNote expects
  const defaultContent = useMemo(
    () => [
      {
        id: 'default-block',
        type: 'paragraph',
        props: {},
        content: [],
        children: [],
      },
    ],
    []
  );

  // Safely parse and normalize initial content - only after mount
  const normalizedInitialContent = useMemo(() => {
    if (!mounted) {
      // Return consistent default for SSR
      return defaultContent;
    }

    try {
      // If initialContent is undefined or null, return default content
      if (initialContent == null) return defaultContent;

      // If it's already an array
      if (Array.isArray(initialContent)) {
        // If empty array, return default content
        if (initialContent.length === 0) return defaultContent;

        // Validate that each item has required BlockNote structure
        const isValidBlockNoteContent = initialContent.every(
          (block) => block && typeof block === 'object' && 'type' in block
        );

        return isValidBlockNoteContent ? initialContent : defaultContent;
      }

      // If it's a string, try to parse it
      if (typeof initialContent === 'string' && initialContent.trim() !== '') {
        const parsed = JSON.parse(initialContent);
        if (Array.isArray(parsed)) {
          return parsed.length > 0 ? parsed : defaultContent;
        }
        return defaultContent;
      }

      // If it's an object, check if it's a valid block
      if (typeof initialContent === 'object' && initialContent !== null) {
        if ('type' in initialContent) {
          return [initialContent];
        }
        return defaultContent;
      }

      // Fallback to default content
      return defaultContent;
    } catch (err) {
      console.warn('Invalid initialContent, using default content:', err);
      return defaultContent;
    }
  }, [initialContent, mounted, defaultContent]);

  // Only create editor after mount to prevent hydration issues
  const editor = useMemo(() => {
    if (!mounted) return null;

    try {
      return useCreateBlockNote({
        initialContent: normalizedInitialContent,
        uploadFile: uploadFileToServer,
      });
    } catch (error) {
      console.error('Error creating BlockNote editor:', error);
      return null;
    }
  }, [mounted, normalizedInitialContent]);

  useEffect(() => {
    if (!editor || !mounted) return;

    const onContentChange = async () => {
      try {
        let json, html, styledHTML;

        if (editor.topLevelBlocks) {
          json = editor.topLevelBlocks;
        } else if (editor.document) {
          json = editor.document;
        } else {
          json = normalizedInitialContent;
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
          onChangeRef.current({
            json: normalizedInitialContent,
            html: '',
            rawHTML: '',
          });
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
  }, [editor, normalizedInitialContent, mounted]);

  // Show loading state while not mounted
  if (!mounted) {
    return (
      <div className="-mx-[54px] my-4">
        <div className="h-[400px] bg-slate-50 rounded-lg animate-pulse flex items-center justify-center">
          <div className="text-slate-400">Loading editor...</div>
        </div>
      </div>
    );
  }

  // Show loading state if editor is not ready
  if (!editor) {
    return (
      <div className="-mx-[54px] my-4">
        <div className="h-[400px] bg-slate-50 rounded-lg animate-pulse flex items-center justify-center">
          <div className="text-slate-400">Initializing editor...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="-mx-[54px] my-4">
      <BlockNoteView editor={editor} editable={editable} theme="light" />
    </div>
  );
};

export default EditorShadcn;
