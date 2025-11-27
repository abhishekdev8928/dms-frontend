import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  toggleStarredItem,
  addStarredItem,
  removeStarredItem,
  bulkToggleStarredItems,
} from '@/config/api/starredApi';

/**
 * Hook for toggling starred status of a single item
 * @param {Object} options - Mutation options
 * @returns {Object} Mutation object
 */
export const useMutationToggleStarred = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleStarredItem,
    onSuccess: (data, variables) => {
      // Invalidate starred items list
      queryClient.invalidateQueries({ queryKey: ['starred-items'] });
      
      // Invalidate the specific item query if it exists
      queryClient.invalidateQueries({ 
        queryKey: [variables.type === 'folder' ? 'folder' : 'file', variables.id] 
      });
      
      // Invalidate folder/file lists
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      queryClient.invalidateQueries({ queryKey: ['files'] });
      
      options.onSuccess?.(data, variables);
    },
    onError: (error, variables, context) => {
      options.onError?.(error, variables, context);
    },
    ...options,
  });
};

/**
 * Hook for adding starred status to a single item
 * @param {Object} options - Mutation options
 * @returns {Object} Mutation object
 */
export const useMutationAddStarred = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addStarredItem,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['starred-items'] });
      queryClient.invalidateQueries({ 
        queryKey: [variables.type === 'folder' ? 'folder' : 'file', variables.id] 
      });
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      queryClient.invalidateQueries({ queryKey: ['files'] });
      
      options.onSuccess?.(data, variables);
    },
    onError: (error, variables, context) => {
      options.onError?.(error, variables, context);
    },
    ...options,
  });
};

/**
 * Hook for removing starred status from a single item
 * @param {Object} options - Mutation options
 * @returns {Object} Mutation object
 */
export const useMutationRemoveStarred = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeStarredItem,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['starred-items'] });
      queryClient.invalidateQueries({ 
        queryKey: [variables.type === 'folder' ? 'folder' : 'file', variables.id] 
      });
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      queryClient.invalidateQueries({ queryKey: ['files'] });
      
      options.onSuccess?.(data, variables);
    },
    onError: (error, variables, context) => {
      options.onError?.(error, variables, context);
    },
    ...options,
  });
};

/**
 * Hook for bulk toggling starred status of multiple items
 * @param {Object} options - Mutation options
 * @returns {Object} Mutation object
 */
export const useMutationBulkToggleStarred = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bulkToggleStarredItems,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['starred-items'] });
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      queryClient.invalidateQueries({ queryKey: ['files'] });
      
      // Invalidate each individual item
      variables.items?.forEach(item => {
        queryClient.invalidateQueries({ 
          queryKey: [item.type === 'folder' ? 'folder' : 'file', item.id] 
        });
      });
      
      options.onSuccess?.(data, variables);
    },
    onError: (error, variables, context) => {
      options.onError?.(error, variables, context);
    },
    ...options,
  });
};

// Usage example:
/*
import { 
  useMutationToggleStarred, 
  useMutationAddStarred,
  useMutationRemoveStarred,
  useMutationBulkToggleStarred 
} from './useMutationStarred';

function MyComponent() {
  const toggleStarred = useMutationToggleStarred({
    onSuccess: (data) => {
      console.log('Toggled:', data.message);
    },
    onError: (error) => {
      console.error('Error:', error);
    }
  });

  const addStarred = useMutationAddStarred();
  const removeStarred = useMutationRemoveStarred();
  const bulkToggle = useMutationBulkToggleStarred();

  const handleToggle = () => {
    toggleStarred.mutate({ id: '123', type: 'file' });
  };

  const handleBulkToggle = () => {
    bulkToggle.mutate({
      items: [
        { id: '123', type: 'file' },
        { id: '456', type: 'folder' }
      ]
    });
  };

  return (
    <div>
      <button 
        onClick={handleToggle}
        disabled={toggleStarred.isPending}
      >
        {toggleStarred.isPending ? 'Loading...' : 'Toggle Star'}
      </button>
    </div>
  );
}
*/