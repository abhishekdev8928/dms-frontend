// src/config/store/selectionStore.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";

/* =======================================================
   TYPE DEFINITIONS
   ======================================================= */
export interface SelectedItem {
  id: string;
  name: string;
  type?: "file" | "folder" | string;
  [key: string]: any; // allow extra fields like size, createdAt, etc.
}

interface SelectionState {
  selectedItem: SelectedItem | null;
  setSelectedItem: (item: SelectedItem) => void;
  clearSelectedItem: () => void;
}

/* =======================================================
   STORE DEFINITION
   ======================================================= */
export const useSelectionStore = create<SelectionState>()(
  devtools(
    (set) => ({
      selectedItem: null,

     
      setSelectedItem: (item) => set({ selectedItem: item }, false, "selection/set"),

      
      clearSelectedItem: () => set({ selectedItem: null }, false, "selection/clear"),
    }),
    { name: "SelectionStore" }
  )
);

/* =======================================================
   SELECTORS (optional helpers)
   ======================================================= */
export const selectSelectedItem = (state: SelectionState) => state.selectedItem;
export const selectHasSelectedItem = (state: SelectionState) =>
  state.selectedItem !== null;
