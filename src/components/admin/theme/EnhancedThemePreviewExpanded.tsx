import React, { useState } from 'react';
import { EnhancedThemeConfig } from '@/config/enhancedTheme';
import { ThemedCard, ThemedCardContent, ThemedCardHeader, ThemedCardTitle } from '@/components/ui/themed-card';
import { ThemedButton } from '@/components/ui/themed-button';
import { ThemedInput } from '@/components/ui/themed-input';
import { ThemedLabel } from '@/components/ui/themed-label';
import { ThemedSelect, ThemedSelectContent, ThemedSelectItem, ThemedSelectTrigger, ThemedSelectValue } from '@/components/ui/themed-select';
import { ThemedDropdownMenu, ThemedDropdownMenuContent, ThemedDropdownMenuItem, ThemedDropdownMenuLabel, ThemedDropdownMenuSeparator, ThemedDropdownMenuTrigger } from '@/components/ui/themed-dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, Settings, User, Mail, Phone, Download, Share, Edit, Trash, Plus } from 'lucide-react';

interface EnhancedThemePreviewExpandedProps {
  theme: EnhancedThemeConfig;
  selectedElement?: string;
  onElementSelect?: (elementId: string) => void;
}

const EnhancedThemePreviewExpanded: React.FC<EnhancedThemePreviewExpandedProps> = ({
  theme,
  selectedElement,
  onElementSelect
}) => {
  const [inputValue, setInputValue] = useState('');
  const [selectValue, setSelectValue] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const getElementStyle = (elementId: string) => ({
    outline: selectedElement === elementId ? '2px solid hsl(var(--theme-primary))' : 'none',
    outlineOffset: '2px'
  });

  const handleElementClick = (elementId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onElementSelect?.(elementId);
  };

  return (
    <div className="w-full space-y-8 p-6 bg-[var(--theme-background)] text-[var(--theme-text)] min-h-screen">
      {/* Global Header */}
      <header 
        className="border-b border-[var(--theme-border)] pb-4"
        style={{
          background: 'var(--theme-element-global_header-bg, var(--theme-background))',
          color: 'var(--theme-element-global_header-color, var(--theme-text))',
          padding: 'var(--theme-element-global_header-padding, 1rem)',
          borderRadius: 'var(--theme-element-global_header-border-radius, 0)',
          ...getElementStyle('global_header')
        }}
        onClick={(e) => handleElementClick('global_header', e)}
      >
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-[var(--theme-font-heading)] text-[var(--theme-primary)]">
            Spit Hierarchy
          </h1>
          <div className="flex items-center gap-4">
            <Badge variant="secondary">Live Preview</Badge>
            <ThemedDropdownMenu>
              <ThemedDropdownMenuTrigger asChild>
                <ThemedButton 
                  variant="outline"
                  style={getElementStyle('dropdown')}
                  onClick={(e) => handleElementClick('dropdown', e)}
                >
                  <User className="w-4 h-4 mr-2" />
                  User Menu
                  <ChevronDown className="w-4 h-4 ml-2" />
                </ThemedButton>
              </ThemedDropdownMenuTrigger>
              <ThemedDropdownMenuContent 
                align="end" 
                className="w-56"
                style={getElementStyle('dropdown_item')}
                onClick={(e) => handleElementClick('dropdown_item', e)}
              >
                <ThemedDropdownMenuLabel>My Account</ThemedDropdownMenuLabel>
                <ThemedDropdownMenuSeparator />
                <ThemedDropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </ThemedDropdownMenuItem>
                <ThemedDropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </ThemedDropdownMenuItem>
                <ThemedDropdownMenuSeparator />
                <ThemedDropdownMenuItem>
                  <Share className="mr-2 h-4 w-4" />
                  Share
                </ThemedDropdownMenuItem>
                <ThemedDropdownMenuItem>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </ThemedDropdownMenuItem>
              </ThemedDropdownMenuContent>
            </ThemedDropdownMenu>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav 
        className="border-b border-[var(--theme-border)] pb-4"
        style={{
          background: 'var(--theme-element-navigation-bg, var(--theme-background))',
          color: 'var(--theme-element-navigation-color, var(--theme-text))',
          padding: 'var(--theme-element-navigation-padding, 1rem)',
          borderRadius: 'var(--theme-element-navigation-border-radius, 0)',
          ...getElementStyle('navigation')
        }}
        onClick={(e) => handleElementClick('navigation', e)}
      >
        <div className="flex items-center space-x-6">
          <a href="#" className="text-[var(--theme-primary)] font-[var(--theme-font-heading)] hover:opacity-80">
            Home
          </a>
          <a href="#" className="text-[var(--theme-text)] hover:text-[var(--theme-primary)]">
            Rankings
          </a>
          <a href="#" className="text-[var(--theme-text)] hover:text-[var(--theme-primary)]">
            Artists
          </a>
          <a href="#" className="text-[var(--theme-text)] hover:text-[var(--theme-primary)]">
            About
          </a>
        </div>
      </nav>

      {/* Typography Showcase */}
      <section className="space-y-4">
        <h1 
          className="text-4xl font-[var(--theme-font-heading)] text-[var(--theme-primary)]"
          style={getElementStyle('typography-h1')}
          onClick={(e) => handleElementClick('typography-h1', e)}
        >
          Typography H1 - Main Heading
        </h1>
        <h2 
          className="text-3xl font-[var(--theme-font-heading)] text-[var(--theme-text)]"
          style={getElementStyle('typography-h2')}
          onClick={(e) => handleElementClick('typography-h2', e)}
        >
          Typography H2 - Section Heading
        </h2>
        <h3 
          className="text-2xl font-[var(--theme-font-heading)] text-[var(--theme-text)]"
          style={getElementStyle('typography-h3')}
          onClick={(e) => handleElementClick('typography-h3', e)}
        >
          Typography H3 - Subsection
        </h3>
        <p 
          className="text-base font-[var(--theme-font-body)] text-[var(--theme-text)]"
          style={getElementStyle('typography-body')}
          onClick={(e) => handleElementClick('typography-body', e)}
        >
          This is body text using the body font. It demonstrates how regular content will appear 
          throughout the application with proper line height and spacing.
        </p>
        <p 
          className="text-xl font-[var(--theme-font-display)] text-[var(--theme-primary)]"
          style={getElementStyle('typography-display')}
          onClick={(e) => handleElementClick('typography-display', e)}
        >
          Display text for special emphasis and branding
        </p>
        <code 
          className="text-sm font-[var(--theme-font-code)] text-[var(--theme-textMuted)] bg-[var(--theme-surface)] px-2 py-1 rounded"
          style={getElementStyle('typography-code')}
          onClick={(e) => handleElementClick('typography-code', e)}
        >
          Code font for technical content
        </code>
      </section>

      {/* Button Variants */}
      <section className="space-y-6">
        <h2 className="text-2xl font-[var(--theme-font-heading)] text-[var(--theme-text)]">
          Button Variants
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ThemedButton 
            variant="default"
            style={getElementStyle('button-default')}
            onClick={(e) => handleElementClick('button-default', e)}
          >
            Primary Button
          </ThemedButton>
          <ThemedButton 
            variant="secondary"
            style={getElementStyle('button-secondary')}
            onClick={(e) => handleElementClick('button-secondary', e)}
          >
            Secondary Button
          </ThemedButton>
          <ThemedButton 
            variant="accent"
            style={getElementStyle('button-accent')}
            onClick={(e) => handleElementClick('button-accent', e)}
          >
            Accent Button
          </ThemedButton>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ThemedButton 
            variant="outline"
            style={getElementStyle('button-outline')}
            onClick={(e) => handleElementClick('button-outline', e)}
          >
            Outline Button
          </ThemedButton>
          <ThemedButton 
            variant="gradient"
            style={getElementStyle('button-gradient')}
            onClick={(e) => handleElementClick('button-gradient', e)}
          >
            Gradient Button
          </ThemedButton>
        </div>
      </section>

      {/* Cards */}
      <section className="space-y-6">
        <h2 className="text-2xl font-[var(--theme-font-heading)] text-[var(--theme-text)]">
          Card Components
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ThemedCard 
            style={getElementStyle('card')}
            onClick={(e) => handleElementClick('card', e)}
          >
            <ThemedCardHeader>
              <ThemedCardTitle>Card Title</ThemedCardTitle>
            </ThemedCardHeader>
            <ThemedCardContent>
              <p className="text-[var(--theme-textMuted)]">
                This is a card component with themed styling. Cards are used throughout
                the application to group related content and provide visual hierarchy.
              </p>
              <div className="flex gap-2 mt-4">
                <ThemedButton size="sm">Action</ThemedButton>
                <ThemedButton size="sm" variant="outline">Cancel</ThemedButton>
              </div>
            </ThemedCardContent>
          </ThemedCard>

          <ThemedCard 
            style={getElementStyle('card')}
            onClick={(e) => handleElementClick('card', e)}
          >
            <ThemedCardHeader>
              <ThemedCardTitle>Interactive Card</ThemedCardTitle>
            </ThemedCardHeader>
            <ThemedCardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[var(--theme-primary)]" />
                  <span className="text-sm">user@example.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[var(--theme-primary)]" />
                  <span className="text-sm">+1 (555) 123-4567</span>
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary">Active</Badge>
                  <Badge variant="outline">Premium</Badge>
                </div>
              </div>
            </ThemedCardContent>
          </ThemedCard>
        </div>
      </section>

      {/* Form Elements */}
      <section className="space-y-6">
        <h2 className="text-2xl font-[var(--theme-font-heading)] text-[var(--theme-text)]">
          Form Elements
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <ThemedLabel 
                htmlFor="sample-input"
                style={getElementStyle('input-label')}
                onClick={(e) => handleElementClick('input-label', e)}
              >
                Sample Input
              </ThemedLabel>
              <ThemedInput
                id="sample-input"
                placeholder="Enter text here..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                style={getElementStyle('input')}
                onClick={(e) => handleElementClick('input', e)}
              />
            </div>

            <div>
              <ThemedLabel 
                htmlFor="sample-select"
                style={getElementStyle('select-label')}
                onClick={(e) => handleElementClick('select-label', e)}
              >
                Sample Select
              </ThemedLabel>
              <ThemedSelect 
                value={selectValue} 
                onValueChange={setSelectValue}
              >
                <ThemedSelectTrigger 
                  id="sample-select"
                  style={getElementStyle('select')}
                  onClick={(e) => handleElementClick('select', e)}
                >
                  <ThemedSelectValue placeholder="Choose an option..." />
                </ThemedSelectTrigger>
                <ThemedSelectContent>
                  <ThemedSelectItem value="option1">Option 1</ThemedSelectItem>
                  <ThemedSelectItem value="option2">Option 2</ThemedSelectItem>
                  <ThemedSelectItem value="option3">Option 3</ThemedSelectItem>
                  <ThemedSelectItem value="option4">Option 4</ThemedSelectItem>
                </ThemedSelectContent>
              </ThemedSelect>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <ThemedLabel htmlFor="email-input">Email Address</ThemedLabel>
              <ThemedInput
                id="email-input"
                type="email"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <ThemedLabel htmlFor="phone-input">Phone Number</ThemedLabel>
              <ThemedInput
                id="phone-input"
                type="tel"
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Modal Preview */}
      <section className="space-y-6">
        <h2 className="text-2xl font-[var(--theme-font-heading)] text-[var(--theme-text)]">
          Modal Component
        </h2>
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogTrigger asChild>
            <ThemedButton 
              variant="outline"
              style={getElementStyle('modal-trigger')}
              onClick={(e) => handleElementClick('modal-trigger', e)}
            >
              Open Modal Preview
            </ThemedButton>
          </DialogTrigger>
          <DialogContent 
            className="sm:max-w-[425px]"
            style={getElementStyle('modal')}
            onClick={(e) => handleElementClick('modal', e)}
          >
            <DialogHeader>
              <DialogTitle className="text-[var(--theme-primary)] font-[var(--theme-font-heading)]">
                Modal Dialog
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-[var(--theme-text)]">
                This is a modal dialog demonstrating the themed modal styling.
                It uses the modal element configuration from your theme.
              </p>
              <div className="flex gap-2">
                <ThemedButton onClick={() => setModalOpen(false)}>
                  Confirm
                </ThemedButton>
                <ThemedButton variant="outline" onClick={() => setModalOpen(false)}>
                  Cancel
                </ThemedButton>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </section>

      {/* Interactive Elements */}
      <section className="space-y-6">
        <h2 className="text-2xl font-[var(--theme-font-heading)] text-[var(--theme-text)]">
          Interactive Elements
        </h2>
        <div className="flex flex-wrap gap-4">
          <ThemedButton size="sm" variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </ThemedButton>
          <ThemedButton size="sm" variant="secondary">
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </ThemedButton>
          <ThemedButton size="sm" variant="outline">
            <Trash className="w-4 h-4 mr-2" />
            Delete
          </ThemedButton>
          <ThemedButton size="sm">
            <Download className="w-4 h-4 mr-2" />
            Download
          </ThemedButton>
        </div>
      </section>

      {/* Footer */}
      <footer 
        className="border-t border-[var(--theme-border)] pt-8 mt-12"
        style={{
          background: 'var(--theme-element-footer-bg, var(--theme-background))',
          color: 'var(--theme-element-footer-color, var(--theme-text))',
          padding: 'var(--theme-element-footer-padding, 2rem 1rem)',
          borderRadius: 'var(--theme-element-footer-border-radius, 0)',
          ...getElementStyle('footer')
        }}
        onClick={(e) => handleElementClick('footer', e)}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-[var(--theme-font-heading)] text-[var(--theme-primary)] mb-4">
              Spit Hierarchy
            </h3>
            <p className="text-[var(--theme-textMuted)] text-sm">
              The ultimate platform for ranking and discovering hip-hop artists.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-[var(--theme-font-heading)] text-[var(--theme-text)] mb-2">
              Quick Links
            </h4>
            <ul className="space-y-1 text-sm text-[var(--theme-textMuted)]">
              <li><a href="#" className="hover:text-[var(--theme-primary)]">Rankings</a></li>
              <li><a href="#" className="hover:text-[var(--theme-primary)]">Artists</a></li>
              <li><a href="#" className="hover:text-[var(--theme-primary)]">About</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-[var(--theme-font-heading)] text-[var(--theme-text)] mb-2">
              Contact
            </h4>
            <p className="text-sm text-[var(--theme-textMuted)]">
              Get in touch with our team for support and feedback.
            </p>
          </div>
        </div>
        <div className="border-t border-[var(--theme-border)] mt-8 pt-4 text-center text-sm text-[var(--theme-textMuted)]">
          © 2024 Spit Hierarchy. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default EnhancedThemePreviewExpanded;