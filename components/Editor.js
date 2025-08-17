'use client';

import { uploadFiles } from '@/utils/uploadthing';

import '@blocknote/core/fonts/inter.css';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/mantine/style.css';
import { useCreateBlockNote } from '@blocknote/react';

const Editor = ({ onChange, initialContent, editable = true }) => {
  const editor = useCreateBlockNote({
    initialContent: initialContent ? JSON.parse(initialContent) : undefined,
    uploadFile: async (file) => {
      const [res] = await uploadFiles('imageUploader', { files: [file] });
      return res.url;
    },
  });

  return (
    <div className="-mx-[54px] my-4">
      <BlockNoteView
        editor={editor}
        editable={editable}
        theme="light"
        onChange={onChange}
      />
    </div>
  );
};

export default Editor;
