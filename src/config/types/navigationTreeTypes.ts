// Navigation Tree Types

/**
 * Owner type for tree nodes
 */
export type TreeOwnerType = "ORG" | "USER";

/**
 * Node type for tree items
 */
export type TreeNodeType = "department" | "mydrive" | "folder";

/**
 * Base tree node interface
 */
export interface ITreeNode {
  id: string;
  name: string;
  type: TreeNodeType;
  ownerType?: TreeOwnerType;
  children: ITreeNode[];
}

/**
 * Department node in tree
 */
export interface IDepartmentNode extends ITreeNode {
  type: "department";
  ownerType: "ORG";
}

/**
 * MyDrive node in tree
 */
export interface IMyDriveNode extends ITreeNode {
  type: "mydrive";
  ownerType: "USER";
}

/**
 * Folder node in tree
 */
export interface IFolderNode extends ITreeNode {
  type: "folder";
  ownerType?: TreeOwnerType;
}

/**
 * Union type for all tree nodes
 * Use ITreeNode for general tree operations
 */
export type TreeNode = ITreeNode;


export interface INavigationTreeResponse {
  success: boolean;
  data: ITreeNode[];
}


export function isDepartmentNode(node: ITreeNode): node is IDepartmentNode {
  return node.type === "department";
}

export function isMyDriveNode(node: ITreeNode): node is IMyDriveNode {
  return node.type === "mydrive";
}

export function isFolderNode(node: ITreeNode): node is IFolderNode {
  return node.type === "folder";
}

/**
 * Helper function to check if node has children
 */
export function hasChildren(node: ITreeNode): boolean {
  return node.children?.length > 0;
}