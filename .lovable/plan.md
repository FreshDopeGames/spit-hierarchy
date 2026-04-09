

## Plan: Add "Favorite Bars" CTA Below Best Quote

### What it does
Adds a styled subsection beneath each rapper's Best Quote card, separated by a themed divider. It displays a message like *"Let Kendrick Lamar know your favorite bars in the Comments Section!"* with a button that programmatically opens the floating CommentBubble.

### Files

1. **Modify `src/components/rapper/RapperBestQuote.tsx`**
   - Add a `ThemedSeparator` below the quote card (medium width, centered)
   - Below the separator, render a text block: `"Let {rapperName} know your favorite bars in the Comments Section!"`
   - Add a themed button with a `MessageCircle` icon labeled "Drop Your Bars"
   - Button `onClick` finds the collapsed CommentBubble button in the DOM (`document.querySelector('.fixed.bottom-6.right-6 button')`) and programmatically clicks it to expand the comment panel
   - Wrap the whole subsection in the existing `mb-8` container

2. **Modify `src/components/CommentBubble.tsx`** (minor)
   - Add a `data-comment-trigger` attribute to the collapsed bubble's `ThemedButton` so the CTA can target it reliably instead of using fragile CSS selectors

### Visual layout
```text
┌─────────────────────────────────┐
│  Best Quote card (existing)     │
└─────────────────────────────────┘
         ─────────────  (divider, ~50% width, centered)
  "Let [name] know your favorite
   bars in the Comments Section!"
       [ 💬 Drop Your Bars ]
```

### Technical notes
- No new files needed — all changes fit in existing components
- The button click approach reuses the existing CommentBubble expand logic without needing to lift state or create a global event system

