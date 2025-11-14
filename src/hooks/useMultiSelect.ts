import { useState, useCallback } from 'react';

export function useMultiSelect<T extends { _id: string }>() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      
      // Exit selection mode if no items selected
      if (newSet.size === 0) {
        setIsSelectionMode(false);
      } else if (!isSelectionMode) {
        setIsSelectionMode(true);
      }
      
      return newSet;
    });
  }, [isSelectionMode]);

  const selectAll = useCallback((items: T[]) => {
    const allIds = new Set(items.map(item => item._id));
    setSelectedIds(allIds);
    setIsSelectionMode(true);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
    setIsSelectionMode(false);
  }, []);

  const isSelected = useCallback((id: string) => {
    return selectedIds.has(id);
  }, [selectedIds]);

  const selectRange = useCallback((items: T[], startId: string, endId: string) => {
    const startIndex = items.findIndex(item => item._id === startId);
    const endIndex = items.findIndex(item => item._id === endId);
    
    if (startIndex === -1 || endIndex === -1) return;
    
    const [start, end] = startIndex < endIndex 
      ? [startIndex, endIndex] 
      : [endIndex, startIndex];
    
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      for (let i = start; i <= end; i++) {
        newSet.add(items[i]._id);
      }
      return newSet;
    });
    setIsSelectionMode(true);
  }, []);

  const getSelectedItems = useCallback((items: T[]) => {
    return items.filter(item => selectedIds.has(item._id));
  }, [selectedIds]);

  return {
    selectedIds: Array.from(selectedIds),
    selectedCount: selectedIds.size,
    isSelectionMode,
    toggleSelection,
    selectAll,
    clearSelection,
    isSelected,
    selectRange,
    getSelectedItems,
  };
}