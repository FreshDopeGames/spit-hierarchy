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
import { ChevronDown, Settings, User, Mail, Phone, Download, Share, Edit, Trash, Plus, TrendingUp, Award } from 'lucide-react';

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <div>
              <ThemedLabel 
                htmlFor="sample-input"
                style={getElementStyle('input')}
                onClick={(e) => handleElementClick('input', e)}
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
                style={getElementStyle('select')}
                onClick={(e) => handleElementClick('select', e)}
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
              <ThemedLabel 
                htmlFor="textarea-sample"
                style={getElementStyle('textarea')}
                onClick={(e) => handleElementClick('textarea', e)}
              >
                Textarea Element
              </ThemedLabel>
              <textarea
                id="textarea-sample"
                className="w-full min-h-[100px] rounded-[var(--theme-element-textarea-border-radius,8px)] border border-[var(--theme-element-textarea-border-color,var(--theme-border))] bg-[var(--theme-element-textarea-bg,var(--theme-surface))] px-3 py-2 text-[var(--theme-element-textarea-color,var(--theme-text))]"
                placeholder="Enter your message..."
                style={getElementStyle('textarea')}
                onClick={(e) => handleElementClick('textarea', e)}
              />
            </div>

            <div className="space-y-2">
              <ThemedLabel>Form Controls</ThemedLabel>
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded bg-[var(--theme-element-checkbox-bg,var(--theme-surface))] border-[var(--theme-element-checkbox-border-color,var(--theme-primary))] text-[var(--theme-element-checkbox-color,var(--theme-primary))]"
                    style={getElementStyle('checkbox')}
                    onClick={(e) => handleElementClick('checkbox', e)}
                  />
                  <span className="text-sm">Checkbox</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="radio-group"
                    className="w-4 h-4 rounded-full bg-[var(--theme-element-radio-bg,var(--theme-surface))] border-[var(--theme-element-radio-border-color,var(--theme-primary))] text-[var(--theme-element-radio-color,var(--theme-primary))]"
                    style={getElementStyle('radio')}
                    onClick={(e) => handleElementClick('radio', e)}
                  />
                  <span className="text-sm">Radio</span>
                </label>
              </div>
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

      {/* Content Elements */}
      <section className="space-y-6">
        <h2 className="text-2xl font-[var(--theme-font-heading)] text-[var(--theme-text)]">
          Content Elements
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Badges</h3>
            <div className="flex flex-wrap gap-2">
              <span
                className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-[var(--theme-element-badge-bg,var(--theme-primary))] text-[var(--theme-element-badge-color,var(--theme-background))]"
                style={getElementStyle('badge')}
                onClick={(e) => handleElementClick('badge', e)}
              >
                Primary Badge
              </span>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Avatar</h3>
            <div
              className="relative flex h-16 w-16 shrink-0 overflow-hidden rounded-[var(--theme-element-avatar-border-radius,50%)] bg-[var(--theme-element-avatar-bg,var(--theme-surface))] border-2 border-[var(--theme-element-avatar-border-color,var(--theme-primary))]"
              style={getElementStyle('avatar')}
              onClick={(e) => handleElementClick('avatar', e)}
            >
              <div className="flex h-full w-full items-center justify-center text-[var(--theme-element-avatar-color,var(--theme-text))]">
                <User className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Separator</h3>
            <div
              className="shrink-0 bg-[var(--theme-element-separator-bg,var(--theme-border))] h-px w-full"
              style={getElementStyle('separator')}
              onClick={(e) => handleElementClick('separator', e)}
            />
            <p className="text-sm text-[var(--theme-textMuted)]">Horizontal separator</p>
          </div>
        </div>
      </section>

      {/* Table Elements */}
      <section className="space-y-6">
        <h2 className="text-2xl font-[var(--theme-font-heading)] text-[var(--theme-text)]">
          Table Elements
        </h2>
        <div className="rounded-lg overflow-hidden border border-[var(--theme-border)]">
          <table className="w-full">
            <thead
              className="bg-[var(--theme-element-table_header-bg,var(--theme-surface))] text-[var(--theme-element-table_header-color,var(--theme-text))]"
              style={getElementStyle('table_header')}
              onClick={(e) => handleElementClick('table_header', e)}
            >
              <tr>
                <th className="px-4 py-2 text-left font-semibold">Name</th>
                <th className="px-4 py-2 text-left font-semibold">Role</th>
                <th className="px-4 py-2 text-left font-semibold">Status</th>
              </tr>
            </thead>
            <tbody
              className="bg-[var(--theme-element-table-bg,var(--theme-background))]"
              style={getElementStyle('table')}
              onClick={(e) => handleElementClick('table', e)}
            >
              <tr
                className="border-t border-[var(--theme-border)] hover:bg-[var(--theme-element-table_row-hover-bg,var(--theme-surface))]"
                style={getElementStyle('table_row')}
                onClick={(e) => handleElementClick('table_row', e)}
              >
                <td className="px-4 py-2">John Doe</td>
                <td className="px-4 py-2">Admin</td>
                <td className="px-4 py-2">Active</td>
              </tr>
              <tr className="border-t border-[var(--theme-border)] hover:bg-[var(--theme-element-table_row-hover-bg,var(--theme-surface))]">
                <td className="px-4 py-2">Jane Smith</td>
                <td className="px-4 py-2">User</td>
                <td className="px-4 py-2">Inactive</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Ranking Card Elements */}
      <section className="space-y-6">
        <h2 className="text-2xl font-[var(--theme-font-heading)] text-[var(--theme-text)]">
          Ranking Card Elements
        </h2>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Ranking Preview Card</h3>
          <div className="max-w-md">
            <div className="group">
              <div 
                className="relative h-[300px] overflow-hidden transition-all duration-300 group-hover:scale-[1.02]"
                style={{
                  borderRadius: 'var(--theme-element-ranking_card-border-radius, 12px)',
                  border: `var(--theme-element-ranking_card-border-width, 1px) var(--theme-element-ranking_card-border-style, solid) var(--theme-element-ranking_card-border-color, var(--theme-primary))`,
                  backgroundColor: 'var(--theme-element-ranking_card-bg, #1A1A1A)',
                  boxShadow: 'var(--theme-element-ranking_card-shadow, 0 4px 6px rgba(0, 0, 0, 0.2))'
                }}
                onClick={(e) => handleElementClick('ranking_card', e)}
              >
                {/* Rapper Mosaic Background */}
                <div className="absolute inset-0 h-[43%] grid grid-rows-2 gap-0">
                  <div className="grid grid-cols-2">
                    <div 
                      className="relative aspect-[3/2] overflow-hidden bg-gradient-to-br from-muted/40 to-muted/60"
                      style={{
                        border: `var(--theme-element-ranking_card_avatar_border-border-width, 3px) var(--theme-element-ranking_card_avatar_border-border-style, solid) var(--theme-element-ranking_card_avatar_border-border-color, #000000)`
                      }}
                    />
                    <div 
                      className="relative aspect-[3/2] overflow-hidden bg-gradient-to-br from-muted/30 to-muted/50"
                      style={{
                        border: `var(--theme-element-ranking_card_avatar_border-border-width, 3px) var(--theme-element-ranking_card_avatar_border-border-style, solid) var(--theme-element-ranking_card_avatar_border-border-color, #000000)`
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-3">
                    <div 
                      className="relative aspect-[3/2] overflow-hidden bg-gradient-to-br from-muted/50 to-muted/70"
                      style={{
                        border: `var(--theme-element-ranking_card_avatar_border-border-width, 3px) var(--theme-element-ranking_card_avatar_border-border-style, solid) var(--theme-element-ranking_card_avatar_border-border-color, #000000)`
                      }}
                    />
                    <div 
                      className="relative aspect-[3/2] overflow-hidden bg-gradient-to-br from-muted/40 to-muted/60"
                      style={{
                        border: `var(--theme-element-ranking_card_avatar_border-border-width, 3px) var(--theme-element-ranking_card_avatar_border-border-style, solid) var(--theme-element-ranking_card_avatar_border-border-color, #000000)`
                      }}
                    />
                    <div 
                      className="relative aspect-[3/2] overflow-hidden bg-gradient-to-br from-muted/60 to-muted/80"
                      style={{
                        border: `var(--theme-element-ranking_card_avatar_border-border-width, 3px) var(--theme-element-ranking_card_avatar_border-border-style, solid) var(--theme-element-ranking_card_avatar_border-border-color, #000000)`
                      }}
                    />
                  </div>
                </div>
                
                {/* Gradient Overlay */}
                <div 
                  className="absolute bottom-0 left-0 right-0 h-[57%]"
                  style={{
                    background: 'var(--theme-element-ranking_card-overlay, linear-gradient(to top, rgba(0, 0, 0, 0.95), rgba(0, 0, 0, 0.8), transparent))'
                  }}
                />
                
                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 h-[57%] flex flex-col justify-center p-4">
                  {/* Category Badge */}
                  <div className="mb-3">
                    <span 
                      className="inline-flex items-center backdrop-blur-sm"
                      style={{
                        backgroundColor: 'var(--theme-element-ranking_card_category_badge-bg, rgba(212, 175, 55, 0.2))',
                        color: 'var(--theme-element-ranking_card_category_badge-color, #D4AF37)',
                        border: `var(--theme-element-ranking_card_category_badge-border-width, 1px) var(--theme-element-ranking_card_category_badge-border-style, solid) var(--theme-element-ranking_card_category_badge-border-color, rgba(212, 175, 55, 0.3))`,
                        borderRadius: 'var(--theme-element-ranking_card_category_badge-border-radius, 999px)',
                        padding: 'var(--theme-element-ranking_card_category_badge-padding, 0.5rem 0.75rem)',
                        fontSize: 'var(--theme-element-ranking_card_category_badge-font-size, 0.75rem)',
                        fontWeight: 'var(--theme-element-ranking_card_category_badge-font-weight, 600)',
                        lineHeight: 'var(--theme-element-ranking_card_category_badge-line-height, 1)'
                      }}
                      onClick={(e) => handleElementClick('ranking_card_category_badge', e)}
                    >
                      Hip Hop Legends
                    </span>
                  </div>
                  
                  {/* Title */}
                  <h3 
                    className="text-xl mb-2 leading-tight transition-colors duration-300"
                    style={{
                      fontFamily: 'var(--theme-font-heading)',
                      color: 'var(--theme-element-ranking_card_title-color, #FFFFFF)',
                      fontSize: 'var(--theme-element-ranking_card_title-font-size, 1.875rem)',
                      fontWeight: 'var(--theme-element-ranking_card_title-font-weight, 700)',
                      lineHeight: 'var(--theme-element-ranking_card_title-line-height, 1.2)',
                      textShadow: 'var(--theme-element-ranking_card_title-shadow, 2px 2px 8px rgba(0, 0, 0, 0.8))'
                    }}
                    onClick={(e) => handleElementClick('ranking_card_title', e)}
                  >
                    Greatest of All Time
                  </h3>
                  
                  {/* Description */}
                  <p 
                    className="text-sm mb-3 line-clamp-2"
                    style={{
                      color: 'var(--theme-element-ranking_card_description-color, #BFBFBF)',
                      fontSize: 'var(--theme-element-ranking_card_description-font-size, 0.875rem)',
                      fontWeight: 'var(--theme-element-ranking_card_description-font-weight, 400)',
                      lineHeight: 'var(--theme-element-ranking_card_description-line-height, 1.5)',
                      textShadow: 'var(--theme-element-ranking_card_description-shadow, 1px 1px 4px rgba(0, 0, 0, 0.8))'
                    }}
                    onClick={(e) => handleElementClick('ranking_card_description', e)}
                  >
                    The definitive ranking of hip hop legends who shaped the culture.
                  </p>
                  
                  {/* Stats Row */}
                  <div className="flex items-center justify-between">
                    <div 
                      className="flex items-center gap-1 text-xs"
                      style={{
                        color: 'var(--theme-element-ranking_card_stats-color, #BFBFBF)',
                        fontSize: 'var(--theme-element-ranking_card_stats-font-size, 0.75rem)',
                        fontWeight: 'var(--theme-element-ranking_card_stats-font-weight, 400)',
                        lineHeight: 'var(--theme-element-ranking_card_stats-line-height, 1.25)'
                      }}
                      onClick={(e) => handleElementClick('ranking_card_stats', e)}
                    >
                      <TrendingUp className="w-4 h-4" />
                      <span>1,234 Votes</span>
                    </div>
                    
                    <div 
                      className="flex items-center gap-1 text-xs transition-colors duration-300"
                      style={{
                        color: 'var(--theme-element-ranking_card_cta-color, var(--theme-primary))',
                        fontFamily: 'var(--theme-font-body)',
                        fontSize: 'var(--theme-element-ranking_card_cta-font-size, 0.75rem)',
                        fontWeight: 'var(--theme-element-ranking_card_cta-font-weight, 500)',
                        lineHeight: 'var(--theme-element-ranking_card_cta-line-height, 1.25)'
                      }}
                      onClick={(e) => handleElementClick('ranking_card_cta', e)}
                    >
                      <Award className="w-4 h-4" />
                      <span>View Ranking</span>
                    </div>
                  </div>
                </div>
                
                {/* Hover State Overlay */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: 'var(--theme-element-ranking_card-hover-overlay, rgba(212, 175, 55, 0.05))'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feedback Elements */}
      <section className="space-y-6">
        <h2 className="text-2xl font-[var(--theme-font-heading)] text-[var(--theme-text)]">
          Feedback Elements
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            className="rounded-lg p-4 bg-[var(--theme-element-alert-bg,var(--theme-surface))] text-[var(--theme-element-alert-color,var(--theme-text))] border border-[var(--theme-element-alert-border-color,var(--theme-border))]"
            style={getElementStyle('alert')}
            onClick={(e) => handleElementClick('alert', e)}
          >
            <h4 className="font-semibold mb-2">Alert Component</h4>
            <p className="text-sm">This is an alert message for user feedback.</p>
          </div>

          <div
            className="rounded-lg p-4 bg-[var(--theme-element-notification-bg,var(--theme-background))] text-[var(--theme-element-notification-color,var(--theme-text))] border border-[var(--theme-element-notification-border-color,var(--theme-border))] shadow-lg"
            style={getElementStyle('notification')}
            onClick={(e) => handleElementClick('notification', e)}
          >
            <h4 className="font-semibold mb-2">Notification</h4>
            <p className="text-sm">This is a notification with enhanced styling.</p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Loading & Skeleton</h3>
          <div className="flex items-center gap-4">
            <div
              className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--theme-element-loading-color,var(--theme-primary))]"
              style={getElementStyle('loading')}
              onClick={(e) => handleElementClick('loading', e)}
            />
            <div
              className="animate-pulse rounded h-4 bg-[var(--theme-element-skeleton-bg,var(--theme-surface))] w-32"
              style={getElementStyle('skeleton')}
              onClick={(e) => handleElementClick('skeleton', e)}
            />
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