/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import '@blocknote/core/fonts/inter.css';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/shadcn';
import '@blocknote/shadcn/style.css';
import { CodeIcon, SearchIcon, XIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

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
      '<pre class="bg-gray-900 text-gray-100 border rounded-lg p-4 mb-4 overflow-x-auto font-mono text-sm relative">'
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

const EditorShadcn = ({
  onChange,
  initialContent = null,
  editable = true,
  defaultCodeLanguage = 'typescript',
}) => {
  const [defaultLanguage, setDefaultLanguage] = useState(defaultCodeLanguage);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const onChangeRef = useRef(onChange);

  const languages = [
    { value: 'typescript', label: 'TypeScript', emoji: '🟦' },
    { value: 'javascript', label: 'JavaScript', emoji: '🟨' },
    { value: 'python', label: 'Python', emoji: '🐍' },
    { value: 'java', label: 'Java', emoji: '☕' },
    { value: 'cpp', label: 'C++', emoji: '⚡' },
    { value: 'c', label: 'C', emoji: '🔧' },
    { value: 'csharp', label: 'C#', emoji: '💜' },
    { value: 'php', label: 'PHP', emoji: '🐘' },
    { value: 'html', label: 'HTML', emoji: '🌐' },
    { value: 'css', label: 'CSS', emoji: '🎨' },
    { value: 'scss', label: 'SCSS', emoji: '💅' },
    { value: 'json', label: 'JSON', emoji: '📋' },
    { value: 'xml', label: 'XML', emoji: '📄' },
    { value: 'yaml', label: 'YAML', emoji: '⚙️' },
    { value: 'markdown', label: 'Markdown', emoji: '📝' },
    { value: 'sql', label: 'SQL', emoji: '🗄️' },
    { value: 'bash', label: 'Bash', emoji: '🐚' },
    { value: 'powershell', label: 'PowerShell', emoji: '💙' },
    { value: 'go', label: 'Go', emoji: '🐹' },
    { value: 'rust', label: 'Rust', emoji: '🦀' },
    { value: 'swift', label: 'Swift', emoji: '🍎' },
    { value: 'kotlin', label: 'Kotlin', emoji: '🎯' },
    { value: 'dart', label: 'Dart', emoji: '🎯' },
    { value: 'ruby', label: 'Ruby', emoji: '💎' },
    { value: 'perl', label: 'Perl', emoji: '🐪' },
    { value: 'r', label: 'R', emoji: '📊' },
    { value: 'matlab', label: 'MATLAB', emoji: '🧮' },
  ];

  const filteredLanguages = languages.filter(
    (lang) =>
      lang.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.value.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedLanguage = languages.find(
    (lang) => lang.value === defaultLanguage
  );

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

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const editor = useCreateBlockNote({
    initialContent: parsedContent,
    uploadFile: uploadFileToServer,
    codeBlock: {
      indentLineWithTab: true,
      defaultLanguage: defaultLanguage,
      supportedLanguages: {
        typescript: { name: 'TypeScript', aliases: ['ts', 'tsx'] },
        javascript: { name: 'JavaScript', aliases: ['js', 'jsx'] },
        python: { name: 'Python', aliases: ['py'] },
        java: { name: 'Java', aliases: ['java'] },
        cpp: { name: 'C++', aliases: ['c++', 'cpp', 'cxx'] },
        c: { name: 'C', aliases: ['c'] },
        csharp: { name: 'C#', aliases: ['cs', 'csharp'] },
        php: { name: 'PHP', aliases: ['php'] },
        html: { name: 'HTML', aliases: ['html', 'htm'] },
        css: { name: 'CSS', aliases: ['css'] },
        scss: { name: 'SCSS', aliases: ['scss'] },
        json: { name: 'JSON', aliases: ['json'] },
        xml: { name: 'XML', aliases: ['xml'] },
        yaml: { name: 'YAML', aliases: ['yaml', 'yml'] },
        markdown: { name: 'Markdown', aliases: ['md', 'markdown'] },
        sql: { name: 'SQL', aliases: ['sql'] },
        bash: { name: 'Bash', aliases: ['bash', 'sh'] },
        powershell: { name: 'PowerShell', aliases: ['ps1', 'powershell'] },
        go: { name: 'Go', aliases: ['go'] },
        rust: { name: 'Rust', aliases: ['rust', 'rs'] },
        swift: { name: 'Swift', aliases: ['swift'] },
        kotlin: { name: 'Kotlin', aliases: ['kt', 'kotlin'] },
        dart: { name: 'Dart', aliases: ['dart'] },
        ruby: { name: 'Ruby', aliases: ['rb', 'ruby'] },
        perl: { name: 'Perl', aliases: ['pl', 'perl'] },
        r: { name: 'R', aliases: ['r'] },
        matlab: { name: 'MATLAB', aliases: ['m', 'matlab'] },
      },
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

  // Advanced language selector with search (VSCode/Shadcn style)
  const AdvancedLanguageSelector = () => (
    <div className="fixed top-16 right-6 z-50 w-80 bg-white border border-gray-200 rounded-lg shadow-2xl animate-in slide-in-from-right-2 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <CodeIcon className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-medium text-gray-700">
            Code Language
          </span>
        </div>
        <button
          onClick={() => {
            setShowLanguageSelector(false);
            setSearchQuery('');
          }}
          className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors"
        >
          <XIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Search Input */}
      <div className="p-3 border-b border-gray-100">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search for a language..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoFocus
          />
        </div>
      </div>

      {/* Current Selection */}
      <div className="p-3 bg-gray-50 border-b border-gray-100">
        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
          Current Default
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <span>{selectedLanguage?.emoji}</span>
          <span>{selectedLanguage?.label}</span>
        </div>
      </div>

      {/* Language List */}
      <div className="max-h-64 overflow-y-auto">
        {filteredLanguages.length > 0 ? (
          filteredLanguages.map((language) => (
            <button
              key={language.value}
              onClick={() => {
                setDefaultLanguage(language.value);
                setShowLanguageSelector(false);
                setSearchQuery('');
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-blue-50 transition-colors text-sm ${
                defaultLanguage === language.value
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500'
                  : 'text-gray-700'
              }`}
            >
              <span className="text-base">{language.emoji}</span>
              <span className="font-medium">{language.label}</span>
              {defaultLanguage === language.value && (
                <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full"></div>
              )}
            </button>
          ))
        ) : (
          <div className="px-4 py-6 text-center text-sm text-gray-500">
            No languages found matching "{searchQuery}"
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-100 bg-gray-50">
        <p className="text-xs text-gray-500 text-center">
          This will be the default language for new code blocks
        </p>
      </div>
    </div>
  );

  return (
    <div className="-mx-[54px] my-4 relative">
      {editable && (
        <>
          {/* Floating toggle button */}
          <button
            onClick={() => setShowLanguageSelector(!showLanguageSelector)}
            className="fixed top-4 right-6 z-40 bg-white border border-gray-200 rounded-lg p-2.5 shadow-md hover:shadow-lg transition-all duration-200 hover:border-gray-300 group"
            title="Code Language Settings"
          >
            <CodeIcon className="w-4 h-4 text-gray-600 group-hover:text-blue-600 transition-colors" />
          </button>

          {/* Floating language selector */}
          {showLanguageSelector && <AdvancedLanguageSelector />}
        </>
      )}
      <BlockNoteView editor={editor} editable={editable} theme="light" />
    </div>
  );
};

export default EditorShadcn;
