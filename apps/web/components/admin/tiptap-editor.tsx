'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import ImageExt from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import {
  Bold, Italic, Strikethrough, Code, List, ListOrdered,
  Heading1, Heading2, Heading3, Quote, Minus, Undo, Redo,
  Link as LinkIcon, Image as ImageIcon, Table as TableIcon,
  Trash2, Plus, Rows3, Columns3,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { API_URL } from '@/lib/api'

interface Props {
  content: string
  onChange: (html: string) => void
  onUploadImage?: () => Promise<string | null>
}

export default function TiptapEditor({ content, onChange, onUploadImage }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      ImageExt.configure({ inline: false }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: 'Tulis konten artikel di sini...' }),
    ],
    content,
    onUpdate: ({ editor: e }) => onChange(e.getHTML()),
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[300px] px-4 py-3',
      },
    },
  })

  if (!editor) return null

  const addImage = async () => {
    if (onUploadImage) {
      const url = await onUploadImage()
      if (url) {
        const src = url.startsWith('/') ? `${API_URL}${url}` : url
        editor.chain().focus().setImage({ src }).run()
      }
    } else {
      const url = prompt('URL gambar:')
      if (url) editor.chain().focus().setImage({ src: url }).run()
    }
  }

  const addLink = () => {
    const url = prompt('URL link:', 'https://')
    if (url) editor.chain().focus().setLink({ href: url }).run()
  }

  const Btn = ({ onClick, active, children, title }: {
    onClick: () => void; active?: boolean; children: React.ReactNode; title: string
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        'p-1.5 rounded-lg transition-colors',
        active
          ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
          : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
      )}
    >
      {children}
    </button>
  )

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
        <Btn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold">
          <Bold size={16} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic">
          <Italic size={16} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough">
          <Strikethrough size={16} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Code">
          <Code size={16} />
        </Btn>
        <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />
        <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="H1">
          <Heading1 size={16} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="H2">
          <Heading2 size={16} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="H3">
          <Heading3 size={16} />
        </Btn>
        <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />
        <Btn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet List">
          <List size={16} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Ordered List">
          <ListOrdered size={16} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Quote">
          <Quote size={16} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divider">
          <Minus size={16} />
        </Btn>
        <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />
        <Btn onClick={addLink} active={editor.isActive('link')} title="Link">
          <LinkIcon size={16} />
        </Btn>
        <Btn onClick={addImage} title="Gambar">
          <ImageIcon size={16} />
        </Btn>
        <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />
        <Btn onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} title="Tabel">
          <TableIcon size={16} />
        </Btn>
        {editor.isActive('table') && (
          <>
            <Btn onClick={() => editor.chain().focus().addRowAfter().run()} title="Tambah Baris">
              <Rows3 size={16} />
            </Btn>
            <Btn onClick={() => editor.chain().focus().addColumnAfter().run()} title="Tambah Kolom">
              <Columns3 size={16} />
            </Btn>
            <Btn onClick={() => editor.chain().focus().deleteTable().run()} title="Hapus Tabel">
              <Trash2 size={16} />
            </Btn>
          </>
        )}
        <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />
        <Btn onClick={() => editor.chain().focus().undo().run()} title="Undo">
          <Undo size={16} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().redo().run()} title="Redo">
          <Redo size={16} />
        </Btn>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  )
}
