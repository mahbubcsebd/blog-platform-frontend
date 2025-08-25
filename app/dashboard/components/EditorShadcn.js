/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import '@blocknote/core/fonts/inter.css';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/shadcn';
import '@blocknote/shadcn/style.css';
import { useEffect, useRef } from 'react';

// Import syntax highlighter

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

// Language detection function
function detectLanguageFromCode(code) {
  const patterns = {
    javascript: [
      /import\s+.*\s+from\s+['"].*['"];?/,
      /const\s+\w+\s*=.*=>/,
      /function\s+\w+\s*\(/,
      /console\.log\s*\(/,
      /\.then\s*\(/,
      /require\s*\(['"].*['"]\)/,
      /module\.exports/,
      /export\s+(default\s+)?/,
    ],
    python: [
      /import\s+\w+/,
      /from\s+\w+\s+import/,
      /def\s+\w+\s*\(/,
      /print\s*\(/,
      /if\s+__name__\s*==\s*['"]__main__['"]:/,
      /class\s+\w+.*:/,
    ],
    html: [
      /<\/?[a-zA-Z][\s\S]*?>/,
      /<!DOCTYPE/i,
      /<html/i,
      /<head>/i,
      /<body>/i,
    ],
    css: [
      /[.#]?[a-zA-Z][\w-]*\s*\{[\s\S]*\}/,
      /@media\s*\(/,
      /@import\s+/,
      /:\s*[\w-]+\s*;/,
    ],
    json: [/^\s*\{[\s\S]*\}\s*$/, /^\s*\[[\s\S]*\]\s*$/, /"[^"]*"\s*:\s*/],
    bash: [/#!/, /\$\w+/, /echo\s+/, /cd\s+/, /ls\s*/, /chmod\s+/, /sudo\s+/],
    sql: [
      /SELECT\s+.*\s+FROM\s+/i,
      /INSERT\s+INTO\s+/i,
      /UPDATE\s+.*\s+SET\s+/i,
      /DELETE\s+FROM\s+/i,
      /CREATE\s+TABLE\s+/i,
    ],
  };

  for (const [lang, regexes] of Object.entries(patterns)) {
    for (const regex of regexes) {
      if (regex.test(code)) {
        return lang;
      }
    }
  }

  return 'text';
}

// Enhanced JSON processor to detect and set languages
function enhanceJSONWithLanguages(blocks) {
  if (!Array.isArray(blocks)) return blocks;

  return blocks.map((block) => {
    if (block.type === 'codeBlock') {
      const codeContent = Array.isArray(block.content)
        ? block.content.map((item) => item.text || '').join('')
        : block.content?.text || '';

      // Auto-detect language if not set or set to 'text'
      let detectedLanguage = block.props?.language || 'text';
      if (detectedLanguage === 'text' && codeContent.trim()) {
        detectedLanguage = detectLanguageFromCode(codeContent);
      }

      return {
        ...block,
        props: {
          ...block.props,
          language: detectedLanguage,
        },
      };
    }

    // Recursively process children if they exist
    if (block.children && Array.isArray(block.children)) {
      return {
        ...block,
        children: enhanceJSONWithLanguages(block.children),
      };
    }

    return block;
  });
}

// Custom CSS for BlockNote editor with syntax highlighting
const customEditorStyles = `
  .bn-editor .bn-block-content[data-content-type="codeBlock"] {
    position: relative;
  }

  .bn-editor .bn-block-content[data-content-type="codeBlock"] pre {
    background: #1e1e1e !important;
    border-radius: 8px;
    padding: 16px;
    overflow-x: auto;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 14px;
    line-height: 1.5;
  }

  .bn-editor .bn-block-content[data-content-type="codeBlock"] code {
    background: transparent !important;
    padding: 0 !important;
    color: #d4d4d4;
  }

  .syntax-highlighter-wrapper {
    position: relative;
    border-radius: 8px;
    overflow: hidden;
    margin: 8px 0;
  }
`;

const EditorShadcn = ({ onChange, initialContent = null, editable = true }) => {
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    // Add custom CSS for syntax highlighting
    const styleElement = document.createElement('style');
    styleElement.textContent = customEditorStyles;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

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

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const editor = useCreateBlockNote({
    initialContent: parsedContent,
    uploadFile: uploadFileToServer,
    // Add custom renderers for better syntax highlighting
    blockSpecs: {
      // You can add custom block specs here if needed
    },
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

        // 🔹 Enhance JSON with auto-detected languages
        const enhancedJson = enhanceJSONWithLanguages(json);

        if (typeof editor.blocksToHTMLLossy === 'function') {
          html = await editor.blocksToHTMLLossy(enhancedJson);
        } else if (typeof editor.blocksToHTML === 'function') {
          html = await editor.blocksToHTML(enhancedJson);
        } else {
          html = '';
        }

        styledHTML = enhanceHTMLWithStyles(html);

        const content = {
          json: enhancedJson, // Use enhanced JSON with proper languages
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
