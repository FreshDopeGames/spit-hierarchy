

## Add Drag-and-Drop Reordering to My Top 5

**Problem**: Users can't rearrange existing rappers in their Top 5. The edit button only lets you replace a slot with a rapper not already in the list, so swapping positions (e.g., moving #3 to #1) requires removing and re-adding.

**Solution**: Add drag-and-drop support using `@dnd-kit/core` + `@dnd-kit/sortable` so users can drag filled slots to reorder them.

### Changes

1. **Install `@dnd-kit/core` and `@dnd-kit/sortable`** — lightweight, accessible drag-and-drop library for React.

2. **`src/components/profile/MyTopFiveSection.tsx`**
   - Wrap the slot grids in `DndContext` + `SortableContext` from dnd-kit.
   - On `onDragEnd`, when two filled slots are involved, call a new `swapPositions` mutation to swap their positions in the database.
   - For mobile, render slots in a single sortable list. Desktop/tablet layouts will also be wrapped in sortable contexts.

3. **`src/components/profile/TopFiveSlot.tsx`**
   - Wrap in `useSortable` hook from dnd-kit.
   - Add a drag handle icon (e.g., `GripVertical`) visible only on filled slots.
   - Apply `transform` and `transition` styles from useSortable for smooth drag animation.
   - Show visual feedback (opacity change, border highlight) while dragging.

4. **`src/hooks/useUserTopRappers.ts`**
   - Add a `swapPositions` mutation that:
     - Takes two positions and swaps the `rapper_id` values in the `user_top_rappers` table.
     - Uses optimistic updates so the UI reorders instantly.
     - Rolls back on error.

### UX Details
- Drag handle icon appears on filled slots only (empty slots aren't draggable).
- Dragging an empty slot is disabled.
- On mobile, a visible grip icon makes the drag affordance clear.
- Smooth animation via dnd-kit's built-in CSS transform transitions.

