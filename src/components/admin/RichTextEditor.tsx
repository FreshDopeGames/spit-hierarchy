
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import EmbedPreviewPanel from './EmbedPreviewPanel';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Link2,
  Code,
  Image as ImageIcon,
  Youtube,
  Film,
  Instagram,
  Music2,
  Twitter,
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const RichTextEditor = ({ value, onChange, placeholder, className }: RichTextEditorProps) => {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const insertAtCursor = (snippet: string) => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newText = value.substring(0, start) + snippet + value.substring(end);
    onChange(newText);
    setTimeout(() => {
      if (textarea) {
        const pos = start + snippet.length;
        textarea.setSelectionRange(pos, pos);
        textarea.focus();
      }
    }, 0);
  };

  const insertMarkdown = (before: string, after: string = '') => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText =
      value.substring(0, start) + before + selectedText + after + value.substring(end);
    onChange(newText);
    setTimeout(() => {
      if (textarea) {
        const newPosition = start + before.length + selectedText.length + after.length;
        textarea.setSelectionRange(newPosition, newPosition);
        textarea.focus();
      }
    }, 0);
  };

  const promptInsertImage = () => {
    const url = window.prompt('Image URL (https://...)');
    if (!url) return;
    const alt = window.prompt('Alt text (for accessibility / SEO)', '') || '';
    insertAtCursor(`\n\n![${alt}](${url})\n\n`);
  };

  const promptInsertEmbed = (kind: 'youtube' | 'video' | 'instagram' | 'tiktok' | 'twitter', label: string) => {
    const url = window.prompt(`${label} URL`);
    if (!url) return;
    insertAtCursor(`\n\n@[${kind}](${url.trim()})\n\n`);
  };

  const formattingButtons = [
    { icon: Bold, label: 'Bold', before: '**', after: '**' },
    { icon: Italic, label: 'Italic', before: '*', after: '*' },
    { icon: List, label: 'Bullet List', before: '- ', after: '' },
    { icon: ListOrdered, label: 'Numbered List', before: '1. ', after: '' },
    { icon: Quote, label: 'Quote', before: '> ', after: '' },
    { icon: Link2, label: 'Link', before: '[', after: '](url)' },
    { icon: Code, label: 'Code', before: '`', after: '`' },
  ];

  const embedButtons = [
    { icon: ImageIcon, label: 'Insert Image', onClick: promptInsertImage },
    { icon: Youtube, label: 'Embed YouTube', onClick: () => promptInsertEmbed('youtube', 'YouTube') },
    { icon: Film, label: 'Embed Video (MP4)', onClick: () => promptInsertEmbed('video', 'Video file (MP4/WebM)') },
    { icon: Instagram, label: 'Embed Instagram', onClick: () => promptInsertEmbed('instagram', 'Instagram post') },
    { icon: Music2, label: 'Embed TikTok', onClick: () => promptInsertEmbed('tiktok', 'TikTok') },
    { icon: Twitter, label: 'Embed X / Twitter', onClick: () => promptInsertEmbed('twitter', 'X / Twitter post') },
  ];

  return (
    <div className="space-y-2">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-white border border-gray-300 rounded-t-md">
        {formattingButtons.map(({ icon: Icon, label, before, after }) => (
          <Button
            key={label}
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => insertMarkdown(before, after)}
            className="h-8 px-2 text-gray-900 hover:bg-gray-100"
            title={label}
          >
            <Icon className="w-4 h-4" />
          </Button>
        ))}

        <span className="mx-1 h-6 w-px bg-gray-300" aria-hidden />

        {embedButtons.map(({ icon: Icon, label, onClick }) => (
          <Button
            key={label}
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClick}
            className="h-8 px-2 text-gray-900 hover:bg-gray-100"
            title={label}
          >
            <Icon className="w-4 h-4" />
          </Button>
        ))}
      </div>

      {/* Editor */}
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${className} rounded-t-none border-t-0 font-mono text-sm`}
        rows={15}
      />

      {/* Help text */}
      <div className="text-xs text-gray-700 p-2 bg-white border border-gray-300 rounded-b-md border-t-0">
        <p className="mb-1"><strong>Markdown & embed formatting:</strong></p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <span>**bold** or *italic*</span>
          <span>- bullet lists</span>
          <span>`inline code`</span>
          <span>{'>'} blockquotes</span>
          <span>[link text](url)</span>
          <span># Headings</span>
          <span>![alt](image-url) — image</span>
          <span>@[youtube](url) — YouTube</span>
          <span>@[video](url) — MP4/WebM</span>
          <span>@[instagram](url) — IG post</span>
          <span>@[tiktok](url) — TikTok</span>
          <span>@[twitter](url) — X post</span>
        </div>
      </div>
    </div>
  );
};

export default RichTextEditor;
