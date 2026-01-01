
import type { IFolderItem, IDocumentItem } from "./commonTypes";

// Starred folder item extends base folder with starredAt field
export interface IStarredFolderItem extends IFolderItem {
  starredAt: string;
}

// Starred document item extends base document with starredAt field
export interface IStarredDocumentItem extends IDocumentItem {
  starredAt: string;
}

// Union type for starred items
export type IStarredItem = IStarredFolderItem | IStarredDocumentItem;

// Starred API Response
export interface IStarredResponse {
  success: boolean;
  count: number;
  children: IStarredItem[];
}