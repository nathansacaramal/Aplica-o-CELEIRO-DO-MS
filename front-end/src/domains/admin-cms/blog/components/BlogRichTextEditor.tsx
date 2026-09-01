import { useEffect, type ReactElement } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import ImageExtension from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { cn } from "@/design-system/utils/cn";

interface IBlogRichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  disabled?: boolean;
}

interface IToolbarButtonProps {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function ToolbarButton({
  label,
  active = false,
  disabled = false,
  onClick,
  children,
}: IToolbarButtonProps): ReactElement {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "rounded-lg border px-2.5 py-1.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50",
        active
          ? "border-[var(--color-primary)] bg-[var(--color-bg-light)] text-[var(--color-primary)]"
          : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50",
      )}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor, disabled }: { editor: Editor; disabled: boolean }): ReactElement {
  function handleSetLink(): void {
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link (https://...)", previousUrl ?? "");
    if (url === null) return;
    if (url.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  }

  function handleInsertImage(): void {
    const url = window.prompt("URL da imagem (https://...)");
    if (!url?.trim()) return;
    editor.chain().focus().setImage({ src: url.trim() }).run();
  }

  return (
    <div className="flex flex-wrap gap-1.5 rounded-t-xl border border-b-0 border-zinc-300 bg-zinc-50 p-2">
      <ToolbarButton
        label="Negrito"
        active={editor.isActive("bold")}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <span className="font-bold">B</span>
      </ToolbarButton>
      <ToolbarButton
        label="Itálico"
        active={editor.isActive("italic")}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <span className="italic">I</span>
      </ToolbarButton>
      <ToolbarButton
        label="Sublinhado"
        active={editor.isActive("underline")}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <span className="underline">S</span>
      </ToolbarButton>

      <div className="mx-1 w-px bg-zinc-300" />

      <ToolbarButton
        label="Título"
        active={editor.isActive("heading", { level: 2 })}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        H2
      </ToolbarButton>
      <ToolbarButton
        label="Subtítulo"
        active={editor.isActive("heading", { level: 3 })}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        H3
      </ToolbarButton>
      <ToolbarButton
        label="Parágrafo"
        active={editor.isActive("paragraph")}
        disabled={disabled}
        onClick={() => editor.chain().focus().setParagraph().run()}
      >
        P
      </ToolbarButton>

      <div className="mx-1 w-px bg-zinc-300" />

      <ToolbarButton
        label="Lista não ordenada"
        active={editor.isActive("bulletList")}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        • Lista
      </ToolbarButton>
      <ToolbarButton
        label="Lista ordenada"
        active={editor.isActive("orderedList")}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        1. Lista
      </ToolbarButton>
      <ToolbarButton
        label="Citação"
        active={editor.isActive("blockquote")}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        “ ”
      </ToolbarButton>

      <div className="mx-1 w-px bg-zinc-300" />

      <ToolbarButton
        label="Alinhar à esquerda"
        active={editor.isActive({ textAlign: "left" })}
        disabled={disabled}
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
      >
        ⯇
      </ToolbarButton>
      <ToolbarButton
        label="Centralizar"
        active={editor.isActive({ textAlign: "center" })}
        disabled={disabled}
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
      >
        ▬
      </ToolbarButton>
      <ToolbarButton
        label="Alinhar à direita"
        active={editor.isActive({ textAlign: "right" })}
        disabled={disabled}
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
      >
        ⯈
      </ToolbarButton>

      <div className="mx-1 w-px bg-zinc-300" />

      <ToolbarButton
        label="Link"
        active={editor.isActive("link")}
        disabled={disabled}
        onClick={handleSetLink}
      >
        🔗
      </ToolbarButton>
      <ToolbarButton label="Inserir imagem" disabled={disabled} onClick={handleInsertImage}>
        🖼
      </ToolbarButton>
      <ToolbarButton
        label="Quebra de linha"
        disabled={disabled}
        onClick={() => editor.chain().focus().setHardBreak().run()}
      >
        ↵
      </ToolbarButton>

      <div className="mx-1 w-px bg-zinc-300" />

      <ToolbarButton
        label="Desfazer"
        disabled={disabled}
        onClick={() => editor.chain().focus().undo().run()}
      >
        ↶
      </ToolbarButton>
      <ToolbarButton
        label="Refazer"
        disabled={disabled}
        onClick={() => editor.chain().focus().redo().run()}
      >
        ↷
      </ToolbarButton>
    </div>
  );
}

/** Editor de texto rico (TipTap) para o conteúdo das publicações do blog. Controlado via `value`. */
export function BlogRichTextEditor({
  value,
  onChange,
  disabled = false,
}: IBlogRichTextEditorProps): ReactElement {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ link: { openOnClick: false, autolink: false } }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      ImageExtension,
      Placeholder.configure({ placeholder: "Escreva o conteúdo da publicação..." }),
    ],
    content: value,
    editable: !disabled,
    onUpdate: ({ editor: updatedEditor }) => {
      onChange(updatedEditor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose-sm min-h-[240px] max-w-none rounded-b-xl border border-zinc-300 px-3 py-3 text-sm leading-6 text-zinc-800 outline-none focus:border-[var(--color-primary)] [&_a]:text-[var(--color-secondary)] [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-zinc-300 [&_blockquote]:pl-3 [&_blockquote]:italic [&_h2]:text-xl [&_h2]:font-bold [&_h3]:text-lg [&_h3]:font-semibold [&_img]:max-w-full [&_img]:rounded-lg [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-2 [&_ul]:list-disc [&_ul]:pl-6",
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (editor.getHTML() === value) return;
    editor.commands.setContent(value, { emitUpdate: false });
  }, [value, editor]);

  useEffect(() => {
    editor?.setEditable(!disabled);
  }, [disabled, editor]);

  if (!editor) {
    return <div className="h-[280px] animate-pulse rounded-xl bg-zinc-100" />;
  }

  return (
    <div>
      <Toolbar editor={editor} disabled={disabled} />
      <EditorContent editor={editor} />
    </div>
  );
}
