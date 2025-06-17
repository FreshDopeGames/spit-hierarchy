
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Bold, Italic, List, ListOrdered, Quote, Link2, Code } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const RichTextEditor = ({ value, onChange, placeholder, className }: RichTextEditorProps) => {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const insertMarkdown = (before: string, after: string = '') => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
    onChange(newText);
    
    // Set cursor position after the inserted text
    setTimeout(() => {
      if (textarea) {
        const newPosition = start + before.length + selectedText.length + after.length;
        textarea.setSelectionRange(newPosition, newPosition);
        textarea.focus();
      }
    }, 0);
  };

  const toolbarButtons = [
    { icon: Bold, label: 'Bold', before: '**', after: '**' },
    { icon: Italic, label: 'Italic', before: '*', after: '*' },
    { icon: List, label: 'Bullet List', before: '- ', after: '' },
    { icon: ListOrdered, label: 'Numbered List', before: '1. ', after: '' },
    { icon: Quote, label: 'Quote', before: '> ', after: '' },
    { icon: Link2, label: 'Link', before: '[', after: '](url)' },
    { icon: Code, label: 'Code', before: '`', after: '`' },
  ];

  return (
    <div className="space-y-2">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 bg-gray-50 border border-rap-smoke rounded-t-md">
        {toolbarButtons.map(({ icon: Icon, label, before, after }) => (
          <Button
            key={label}
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => insertMarkdown(before, after)}
            className="h-8 px-2 text-rap-carbon hover:bg-gray-200"
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
      <div className="text-xs text-rap-smoke p-2 bg-gray-50 border border-rap-smoke rounded-b-md border-t-0">
        <p className="mb-1"><strong>Markdown formatting supported:</strong></p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <span>**bold** or *italic*</span>
          <span>- bullet lists</span>
          <span>`inline code`</span>
          <span>{'>'} blockquotes</span>
          <span>[link text](url)</span>
          <span># Headings</span>
        </div>
      </div>
    </div>
  );
};

export default RichTextEditor;
