# RightPanelView Cleanup & Refactoring Guide

A comprehensive guide to refactoring a bloated 600–900 line `RightPanelView.tsx` component into a clean, maintainable, and reusable architecture.

## 📊 Overview

**Goal:** Transform the monolithic RightPanelView into a modular system of hooks and components, reducing the main file to ~150–200 lines while improving maintainability and reusability.

**Expected Outcome:**
- 70–80% reduction in main component size
- Modular, testable architecture
- Reusable logic across the application
- Easier debugging and feature additions

## 📁 Project Structure

```
RightPanelView/
├── RightPanelView.tsx
├── components/
│   ├── RightPanelHeader.tsx
│   └── RightPanelContent.tsx
├── hooks/
│   ├── useUploadHandlers.ts
│   ├── useItemActions.ts
│   ├── useMultiSelect.ts
│   ├── useModalState.ts
│   ├── useDragAndDrop.ts
│   ├── useBulkActions.ts
│   └── useBreadcrumbNavigation.ts
└── utils/
    └── formatters.ts
```

## 🔧 Refactoring Steps

### Step 1: Extract Upload Logic (`useUploadHandlers`)

**Problem:** Upload logic is duplicated across file uploads, folder uploads, re-uploads, drag-and-drop, validations, toasts, and query invalidations.

**Solution:** Create a centralized upload hook.

**Hook API:**
```typescript
{
  uploadFiles: (files: File[]) => Promise<void>
  uploadFolder: (files: FileList) => Promise<void>
  reuploadFile: (fileId: string, file: File) => Promise<void>
  validateFileType: (file: File) => boolean
  formatError: (error: unknown) => string
  showToast: (message: string, type: 'success' | 'error') => void
}
```

**Benefits:**
- Removes ~150 lines from RightPanelView
- Reusable across Sidebar, Upload Modal, and Bulk Restore
- Centralized error handling and validation

---

### Step 2: Extract Multi-Select Logic (`useMultiSelect`)

**Problem:** Selection state management is scattered with mixed concerns for shift-select, cmd-select, and single selection.

**Solution:** Isolate selection logic in a dedicated hook.

**Hook API:**
```typescript
{
  selectedIds: Set<string>
  lastSelectedIndex: number | null
  selectItem: (id: string, index: number, modifiers: SelectModifiers) => void
  clearSelection: () => void
}
```

**Benefits:**
- Removes 40–60 lines of coupled UI and state logic
- Reusable in ListView, GridView, and TableView
- Simplified selection behavior

---

### Step 3: Extract File/Folder Actions (`useItemActions`)

**Problem:** Action handlers (download, rename, delete, tag, navigate) are mixed with UI logic.

**Solution:** Create a hook for all item-level operations.

**Hook API:**
```typescript
{
  handleDownload: (itemId: string) => Promise<void>
  handleRename: (itemId: string, newName: string) => Promise<void>
  handleDelete: (itemId: string) => Promise<void>
  handleAddTags: (itemId: string, tags: string[]) => Promise<void>
  handleShowInfo: (itemId: string) => void
  navigateToFolder: (folderId: string) => void
}
```

**Benefits:**
- Clean, readable component code
- Actions reusable across all views
- Centralized mutation logic

---

### Step 4: Extract Modal State Management (`useModalState`)

**Problem:** Multiple `useState` declarations for each modal create clutter and repetition.

**Solution:** Unified modal state management.

**Hook API:**
```typescript
{
  modals: Record<ModalType, boolean>
  openModal: (type: ModalType, item?: Item) => void
  closeModal: (type: ModalType) => void
  selectedItem: Item | null
  setSelectedItem: (item: Item | null) => void
}
```

**Benefits:**
- Removes 20–30 lines of repeated state declarations
- Easy to add new modals
- Cleaner modal handling pattern

---

### Step 5: Extract Drag & Drop Logic (`useDragAndDrop`)

**Problem:** DnD logic mixes UI highlighting, drop handling, upload logic, and type detection.

**Solution:** Encapsulate all drag-and-drop functionality.

**Hook API:**
```typescript
{
  isDragging: boolean
  handleDragEnter: (e: DragEvent) => void
  handleDragLeave: (e: DragEvent) => void
  handleDragOver: (e: DragEvent) => void
  handleDrop: (e: DragEvent) => void
}
```

**Benefits:**
- Cleaner UI component
- Reusable in empty states, list views, and folder views
- Isolated DnD complexity

---

### Step 6: Extract Header Component (`RightPanelHeader`)

**Problem:** Header logic (breadcrumbs, view toggle, info toggle, create folder) clutters the main component.

**Solution:** Separate header component.

**Component Props:**
```typescript
{
  viewMode: 'list' | 'grid'
  setViewMode: (mode: ViewMode) => void
  showInfoPanel: boolean
  setShowInfoPanel: (show: boolean) => void
  breadcrumbs: Breadcrumb[]
  onBreadcrumbClick: (id: string) => void
  onCreateFolder: () => void
}
```

**Benefits:**
- Moves 60–80 lines out of main component
- Reusable header across different panels
- Improved readability

---

### Step 7: Extract Content Component (`RightPanelContent`)

**Problem:** Main content area mixes list view, grid view, empty state, loading states, and selection visuals.

**Solution:** Dedicated content component.

**Component Props:**
```typescript
{
  items: Item[]
  isLoading: boolean
  error: Error | null
  selectedIds: Set<string>
  onSelectItem: (id: string, index: number, modifiers: SelectModifiers) => void
  onItemClick: (item: Item) => void
  viewMode: 'list' | 'grid'
}
```

**Benefits:**
- RightPanelView becomes UI-only orchestrator
- Content rendering logic is reusable
- Easy to implement infinite scroll later

---

### Step 8: Extract Bulk Actions (`useBulkActions`)

**Problem:** Bulk toolbar logic (delete, download, tag) with conditional rendering scattered throughout.

**Solution:** Centralized bulk operations hook.

**Hook API:**
```typescript
{
  bulkDelete: () => Promise<void>
  bulkDownload: () => Promise<void>
  bulkTag: (tags: string[]) => Promise<void>
  canDelete: boolean
  canDownload: boolean
  canTag: boolean
  selectedCount: number
}
```

**Benefits:**
- Removes 30–40 lines from main component
- Simplified multi-select UX
- Reusable bulk operations

---

### Step 9: Extract Breadcrumb Utility (`useBreadcrumbNavigation`)

**Problem:** Breadcrumb generation is duplicated across header, navigation, folder view, and files page.

**Solution:** Create a shared utility or hook.

**Utility/Hook API:**
```typescript
{
  breadcrumbs: Breadcrumb[]
  navigateTo: (id: string) => void
  generateBreadcrumbs: (currentPath: string) => Breadcrumb[]
}
```

**Benefits:**
- Consistent breadcrumbs everywhere
- DRY principle applied
- Cleaner header component

---

## 📋 Implementation Order

Follow this sequence for optimal refactoring:

1. ✅ `useUploadHandlers` - Foundation for file operations
2. ✅ `useMultiSelect` - Selection state management
3. ✅ `useItemActions` - Item-level operations
4. ✅ `useModalState` - Modal management
5. ✅ `useDragAndDrop` - Drag-and-drop functionality
6. ✅ `RightPanelHeader` - Header component extraction
7. ✅ `RightPanelContent` - Content component extraction
8. ✅ `useBulkActions` - Bulk operations
9. ✅ `useBreadcrumbNavigation` - Breadcrumb utility

## ✨ Final Result

After completing all steps:

- **Main Component:** ~150–200 lines (down from 600–900)
- **Modularity:** 9 clean, focused hooks
- **Components:** 2–3 presentational components
- **Reusability:** Logic available across entire application
- **Maintainability:** Easy to understand, test, and extend
- **Scalability:** Future features are 10× easier to implement

## 🎯 Key Benefits

| Aspect | Before | After |
|--------|--------|-------|
| Lines of Code | 600–900 | 150–200 |
| Testability | Difficult | Easy |
| Reusability | None | High |
| Maintainability | Low | High |
| Debugging | Complex | Simple |

## 🚀 Getting Started

1. Create the folder structure as outlined above
2. Follow the implementation order
3. Extract one hook/component at a time
4. Test thoroughly after each extraction
5. Update imports in the main component

## 📝 Notes

- Each hook should be independent and focused on a single responsibility
- Components should be presentational and receive all data via props
- Use TypeScript for type safety throughout
- Write unit tests for each hook and component
- Document complex logic with inline comments

---

**Happy Refactoring! 🎉**









✅ Complete Chunked Upload Implementation Done!
What I've Built:

Auto-Detection Logic:

Files ≤100MB → Direct upload (single PUT to S3)
Files >100MB → Chunked upload (multipart)


Chunked Upload Flow:

   1. initiateChunkedUpload() → Get S3 multipart uploadId
   2. Loop through chunks (5MB each)
      - uploadChunk() for each part
      - Track progress in store
   3. completeChunkedUpload() → Finalize & create document

Features Implemented:

✅ Progress tracking per chunk
✅ Cancellation support (aborts S3 multipart upload)
✅ Error handling per chunk
✅ Mixed uploads (some direct, some chunked in same batch)
✅ Store integration with totalChunks and uploadedChunks


Store Updates:

Direct uploads: method: 'direct', totalChunks: 0
Chunked uploads: method: 'chunked', totalChunks: X, updates uploadedChunks