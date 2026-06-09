'use client'

import { useEffect, useState } from 'react'
import { Mark, Extension } from '@tiptap/core'
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
  Quote, Minus, Undo, Redo,
  Link as LinkIcon, Image as ImageIcon, Table as TableIcon,
  Trash2, Rows3, Columns3, AlignCenter, AlignLeft, AlignRight, Square,
  AlignJustify, Underline as UnderlineIcon, Highlighter, Palette,
  RemoveFormatting, Unlink, FileCode2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { API_URL } from '@/lib/api'

interface Props {
  content: string
  onChange: (html: string) => void
  onUploadImage?: () => Promise<string | null>
  editorKey?: string | number
}

const ArticleImage = ImageExt.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      class: {
        default: null,
        parseHTML: (element) => element.getAttribute('class'),
        renderHTML: (attributes) => attributes.class ? { class: attributes.class } : {},
      },
    }
  },
})

const UnderlineMark = Mark.create({
  name: 'underline',
  parseHTML() {
    return [{ tag: 'u' }, { style: 'text-decoration-line=underline' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['u', HTMLAttributes, 0]
  },
  addCommands() {
    return {
      toggleUnderline: () => ({ commands }: any) => commands.toggleMark(this.name),
    } as any
  },
  addKeyboardShortcuts() {
    return {
      'Mod-u': () => (this.editor.commands as any).toggleUnderline(),
    }
  },
})

const TextColorMark = Mark.create({
  name: 'textColor',
  addAttributes() {
    return {
      color: {
        default: null,
        parseHTML: (element) => element.style.color || null,
        renderHTML: (attributes) => attributes.color ? { style: `color: ${attributes.color}` } : {},
      },
    }
  },
  parseHTML() {
    return [{ style: 'color' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['span', HTMLAttributes, 0]
  },
  addCommands() {
    return {
      setTextColor: (color: string) => ({ commands }: any) => commands.setMark(this.name, { color }),
      unsetTextColor: () => ({ commands }: any) => commands.unsetMark(this.name),
    } as any
  },
})

const HighlightMark = Mark.create({
  name: 'highlightColor',
  addAttributes() {
    return {
      color: {
        default: null,
        parseHTML: (element) => element.style.backgroundColor || null,
        renderHTML: (attributes) => attributes.color ? { style: `background-color: ${attributes.color}` } : {},
      },
    }
  },
  parseHTML() {
    return [{ style: 'background-color' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['mark', HTMLAttributes, 0]
  },
  addCommands() {
    return {
      setHighlightColor: (color: string) => ({ commands }: any) => commands.setMark(this.name, { color }),
      unsetHighlightColor: () => ({ commands }: any) => commands.unsetMark(this.name),
    } as any
  },
})

const FontSizeMark = Mark.create({
  name: 'fontSize',
  addAttributes() {
    return {
      size: {
        default: null,
        parseHTML: (element) => element.style.fontSize || null,
        renderHTML: (attributes) => attributes.size ? { style: `font-size: ${attributes.size}` } : {},
      },
    }
  },
  parseHTML() {
    return [{ style: 'font-size' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['span', HTMLAttributes, 0]
  },
  addCommands() {
    return {
      setFontSize: (size: string) => ({ commands }: any) => commands.setMark(this.name, { size }),
      unsetFontSize: () => ({ commands }: any) => commands.unsetMark(this.name),
    } as any
  },
})

const TextAlignment = Extension.create({
  name: 'textAlignment',
  addGlobalAttributes() {
    return [
      {
        types: ['heading', 'paragraph'],
        attributes: {
          textAlign: {
            default: null,
            parseHTML: (element) => element.style.textAlign || null,
            renderHTML: (attributes) => attributes.textAlign ? { style: `text-align: ${attributes.textAlign}` } : {},
          },
        },
      },
    ]
  },
  addCommands() {
    return {
      setTextAlign: (textAlign: string) => ({ commands }: any) => commands.updateAttributes('paragraph', { textAlign }) || commands.updateAttributes('heading', { textAlign }),
      unsetTextAlign: () => ({ commands }: any) => commands.resetAttributes('paragraph', 'textAlign') || commands.resetAttributes('heading', 'textAlign'),
    } as any
  },
})

export default function TiptapEditor({ content, onChange, onUploadImage, editorKey }: Props) {
  const [showHtml, setShowHtml] = useState(false)
  const [htmlDraft, setHtmlDraft] = useState(content)

  const editor = useEditor({
    extensions: [
      StarterKit,
      UnderlineMark,
      TextColorMark,
      HighlightMark,
      FontSizeMark,
      TextAlignment,
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      ArticleImage.configure({ inline: false }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: 'Tulis konten artikel di sini...' }),
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor: e }) => onChange(e.getHTML()),
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[300px] px-4 py-3',
      },
    },
  }, [editorKey])

  useEffect(() => {
    if (!showHtml) setHtmlDraft(content)
  }, [content, showHtml])

  if (!editor) return null

  const customChain = () => editor.chain().focus() as any

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

  const setImageLayout = (layout: string | null) => {
    editor.chain().focus().updateAttributes('image', { class: layout }).run()
  }

  const setBlockStyle = (value: string) => {
    const chain = editor.chain().focus()
    if (value === 'paragraph') chain.setParagraph().run()
    else if (value === 'codeBlock') chain.toggleCodeBlock().run()
    else chain.toggleHeading({ level: Number(value) as 1 | 2 | 3 }).run()
  }

  const setTextAlign = (align: 'left' | 'center' | 'right' | 'justify') => {
    editor.chain().focus().updateAttributes('paragraph', { textAlign: align }).updateAttributes('heading', { textAlign: align }).run()
  }

  const applyHtml = () => {
    editor.commands.setContent(htmlDraft)
    onChange(htmlDraft)
    setShowHtml(false)
  }

  const wordCount = editor.getText().trim().split(/\s+/).filter(Boolean).length

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
      <div className="flex flex-wrap items-center gap-1.5 px-2 py-2 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
        <select
          value={editor.isActive('heading', { level: 1 }) ? '1' : editor.isActive('heading', { level: 2 }) ? '2' : editor.isActive('heading', { level: 3 }) ? '3' : editor.isActive('codeBlock') ? 'codeBlock' : 'paragraph'}
          onChange={(e) => setBlockStyle(e.target.value)}
          className="h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 text-xs font-semibold text-slate-600 dark:text-slate-300"
          title="Format blok"
        >
          <option value="paragraph">Paragraf</option>
          <option value="1">Heading 1</option>
          <option value="2">Heading 2</option>
          <option value="3">Heading 3</option>
          <option value="codeBlock">Kode</option>
        </select>
        <select
          defaultValue=""
          onChange={(e) => {
            const size = e.target.value
            if (size) customChain().setFontSize(size).run()
            else customChain().unsetFontSize().run()
          }}
          className="h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 text-xs font-semibold text-slate-600 dark:text-slate-300"
          title="Ukuran teks"
        >
          <option value="">Ukuran</option>
          <option value="0.875rem">Kecil</option>
          <option value="1rem">Normal</option>
          <option value="1.125rem">Besar</option>
          <option value="1.35rem">Sangat Besar</option>
        </select>
        <Btn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold">
          <Bold size={16} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic">
          <Italic size={16} />
        </Btn>
        <Btn onClick={() => customChain().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline">
          <UnderlineIcon size={16} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough">
          <Strikethrough size={16} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Code">
          <Code size={16} />
        </Btn>
        <label className="relative p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 cursor-pointer" title="Warna teks">
          <Palette size={16} />
          <input type="color" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => customChain().setTextColor(e.target.value).run()} />
        </label>
        <label className="relative p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 cursor-pointer" title="Highlight">
          <Highlighter size={16} />
          <input type="color" defaultValue="#fef3c7" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => customChain().setHighlightColor(e.target.value).run()} />
        </label>
        <Btn onClick={() => customChain().unsetFontSize().unsetTextColor().unsetHighlightColor().unsetAllMarks().clearNodes().run()} title="Hapus Format">
          <RemoveFormatting size={16} />
        </Btn>
        <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />
        <Btn onClick={() => setTextAlign('left')} title="Rata Kiri">
          <AlignLeft size={16} />
        </Btn>
        <Btn onClick={() => setTextAlign('center')} title="Rata Tengah">
          <AlignCenter size={16} />
        </Btn>
        <Btn onClick={() => setTextAlign('right')} title="Rata Kanan">
          <AlignRight size={16} />
        </Btn>
        <Btn onClick={() => setTextAlign('justify')} title="Rata Kanan Kiri">
          <AlignJustify size={16} />
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
        <Btn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Code Block">
          <FileCode2 size={16} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divider">
          <Minus size={16} />
        </Btn>
        <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />
        <Btn onClick={addLink} active={editor.isActive('link')} title="Link">
          <LinkIcon size={16} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().unsetLink().run()} title="Hapus Link">
          <Unlink size={16} />
        </Btn>
        <Btn onClick={addImage} title="Gambar">
          <ImageIcon size={16} />
        </Btn>
        {editor.isActive('image') && (
          <>
            <Btn onClick={() => setImageLayout(null)} title="Gambar Normal">
              <ImageIcon size={16} />
            </Btn>
            <Btn onClick={() => setImageLayout('article-image-center')} title="Gambar Tengah">
              <AlignCenter size={16} />
            </Btn>
            <Btn onClick={() => setImageLayout('article-image-left')} title="Gambar Kiri">
              <AlignLeft size={16} />
            </Btn>
            <Btn onClick={() => setImageLayout('article-image-right')} title="Gambar Kanan">
              <AlignRight size={16} />
            </Btn>
            <Btn onClick={() => setImageLayout('article-image-square-left')} title="Square Kiri">
              <Square size={16} />
            </Btn>
            <Btn onClick={() => setImageLayout('article-image-square-right')} title="Square Kanan">
              <Square size={16} className="scale-x-[-1]" />
            </Btn>
          </>
        )}
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
        <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />
        <Btn onClick={() => setShowHtml((value) => !value)} active={showHtml} title="Edit HTML">
          <FileCode2 size={16} />
        </Btn>
      </div>

      {/* Editor */}
      {showHtml ? (
        <div className="p-3 space-y-3">
          <textarea
            value={htmlDraft}
            onChange={(e) => setHtmlDraft(e.target.value)}
            className="min-h-[360px] w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-950 p-4 font-mono text-xs leading-relaxed text-slate-100 outline-none focus:ring-2 focus:ring-primary-500/30"
            spellCheck={false}
          />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => { setHtmlDraft(editor.getHTML()); setShowHtml(false) }} className="px-3 py-2 text-xs font-bold text-slate-500 hover:text-slate-700">
              Batal
            </button>
            <button type="button" onClick={applyHtml} className="px-4 py-2 rounded-lg bg-primary-600 text-xs font-bold text-white hover:bg-primary-700">
              Terapkan HTML
            </button>
          </div>
        </div>
      ) : (
        <EditorContent editor={editor} />
      )}
      <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 text-[11px] font-semibold text-slate-400">
        <span>{wordCount} kata</span>
        <span>Visual Editor</span>
      </div>
    </div>
  )
}
