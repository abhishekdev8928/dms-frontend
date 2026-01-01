import type { ITreeNode } from "@/config/types/navigationTreeTypes";

/**
 * Check if a node or its descendants contain the target ID
 */
export const hasDescendant = (
  nodes: ITreeNode[],
  targetId: string
): boolean => {
  return nodes.some(
    (node) =>
      node.id === targetId ||
      (node.children && hasDescendant(node.children, targetId))
  );
};

/**
 * Check if a node is in the active path to the target
 */
export const isInActivePath = (
  nodes: ITreeNode[],
  nodeId: string,
  targetId: string
): boolean => {
  return nodes.some(
    (node) =>
      (node.id === nodeId && hasDescendant(node.children, targetId)) ||
      (node.children && isInActivePath(node.children, nodeId, targetId))
  );
};

/**
 * Find the parent node of a target node
 */
export const findParent = (
  nodes: ITreeNode[],
  targetId: string,
  parent: ITreeNode | null = null
): ITreeNode | null => {
  for (const node of nodes) {
    if (node.id === targetId) return parent;
    if (node.children?.length) {
      const found = findParent(node.children, targetId, node);
      if (found) return found;
    }
  }
  return null;
};

/**
 * Get formatted date and time
 */
export const getFormattedDateTime = (): string => {
  const now = new Date();
  const formattedDate = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedTime = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${formattedDate} at ${formattedTime}`;
};