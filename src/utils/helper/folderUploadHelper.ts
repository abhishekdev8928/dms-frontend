import { createFolder } from "@/config/api/folderApi";
import { uploadFiles } from "@/utils/helper/fileUploadHelper";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================
export interface FolderUploadOptions {
  parentId: string;
  onProgress?: (status: FolderUploadProgress) => void;
  onSuccess?: (result: FolderUploadResult) => void;
  onError?: (error: any) => void;
}

export interface FolderUploadProgress {
  stage: 'building_structure' | 'creating_folders' | 'uploading_files';
  current: number;
  total: number;
  message: string;
}

export interface FolderUploadResult {
  success: boolean;
  filesCount: number;
  foldersCount: number;
  createdFolders: Map<string, string>;
}

// ============================================================================
// FOLDER STRUCTURE BUILDER
// ============================================================================
export const buildFolderStructure = (files: File[]): Map<string, string> => {
  const folderStructure = new Map<string, string>();
  
  files.forEach((file: any) => {
    const path = file.webkitRelativePath || file.name;
    const pathParts = path.split('/');
    
    // Build all parent folder paths
    for (let i = 1; i < pathParts.length; i++) {
      const folderPath = pathParts.slice(0, i).join('/');
      if (!folderStructure.has(folderPath)) {
        folderStructure.set(folderPath, '');
      }
    }
  });

  return folderStructure;
};

// ============================================================================
// MAIN FOLDER UPLOAD FUNCTION
// ============================================================================
export const uploadFolder = async (
  files: File[],
  options: FolderUploadOptions
): Promise<FolderUploadResult> => {
  const { parentId, onProgress, onSuccess, onError } = options;

  if (!files || files.length === 0) {
    throw new Error("No files provided");
  }

  if (!parentId) {
    throw new Error("Parent ID is required");
  }

  try {
    // Step 1: Build folder structure
    onProgress?.({
      stage: 'building_structure',
      current: 0,
      total: 1,
      message: 'Analyzing folder structure...'
    });

    const folderStructure = buildFolderStructure(files);
    const createdFolders = new Map<string, string>();
    createdFolders.set('', parentId); // Root is current parentId

    // Sort paths by depth to create parent folders first
    const sortedPaths = Array.from(folderStructure.keys()).sort((a, b) => {
      return a.split('/').length - b.split('/').length;
    });

    // Step 2: Create all folders in the structure
    onProgress?.({
      stage: 'creating_folders',
      current: 0,
      total: sortedPaths.length,
      message: `Creating ${sortedPaths.length} folders...`
    });

    let foldersCreated = 0;
    for (const path of sortedPaths) {
      if (!path) continue; // Skip root
      
      const pathParts = path.split('/');
      const folderName = pathParts[pathParts.length - 1];
      const parentPath = pathParts.slice(0, -1).join('/');
      const parentFolderId = createdFolders.get(parentPath) || parentId;

      try {
        const result = await createFolder({
          name: folderName,
          parent_id: parentFolderId,
        });
        createdFolders.set(path, result.data._id);
        foldersCreated++;

        onProgress?.({
          stage: 'creating_folders',
          current: foldersCreated,
          total: sortedPaths.length,
          message: `Created folder: ${folderName}`
        });
      } catch (error) {
        console.error(`Failed to create folder: ${folderName}`, error);
        // Continue creating other folders even if one fails
      }
    }

    // Step 3: Upload files to their respective folders
    onProgress?.({
      stage: 'uploading_files',
      current: 0,
      total: files.length,
      message: `Uploading ${files.length} files...`
    });

    const uploadPromises = files.map(async (file, index) => {
      const filePath = (file as any).webkitRelativePath || file.name;
      const pathParts = filePath.split('/');
      const folderPath = pathParts.slice(0, -1).join('/');
      const targetFolderId = createdFolders.get(folderPath) || parentId;

      try {
        await uploadFiles([file], {
          parentId: targetFolderId,
        });

        onProgress?.({
          stage: 'uploading_files',
          current: index + 1,
          total: files.length,
          message: `Uploaded: ${file.name}`
        });
      } catch (error) {
        console.error(`Failed to upload file: ${file.name}`, error);
        throw error;
      }
    });

    await Promise.all(uploadPromises);

    const result: FolderUploadResult = {
      success: true,
      filesCount: files.length,
      foldersCount: sortedPaths.length,
      createdFolders
    };

    onSuccess?.(result);
    return result;

  } catch (error) {
    onError?.(error);
    throw error;
  }
};

// ============================================================================
// HELPER: Get folder name from files
// ============================================================================
export const getFolderNameFromFiles = (files: File[]): string => {
  if (files.length === 0) return 'Unknown Folder';
  
  const firstFile = files[0] as any;
  const path = firstFile.webkitRelativePath || firstFile.name;
  const pathParts = path.split('/');
  
  return pathParts[0] || 'Unknown Folder';
};