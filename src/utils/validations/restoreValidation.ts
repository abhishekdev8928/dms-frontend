import { z } from "zod";

// ✅ Sort order validator
const sortOrderValidator = z.enum(["asc", "desc"]).default("desc");

// ✅ Item type validator
const itemTypeValidator = z.enum(["all", "folder", "document"]).default("all");

// ✅ Deleted by validator
const deletedByValidator = z.enum(["anyone", "me"]).default("anyone");

// ✅ Date deleted validator
const dateDeletedValidator = z
  .enum(["all", "last7days", "last30days", "older"])
  .default("all");

// ✅ Conflict resolution validator
const conflictResolutionValidator = z
  .enum(["rename", "replace", "skip"])
  .default("rename");

// ✅ Sort by validator
const sortByValidator = z
  .enum(["name", "deletedAt", "size", "type"])
  .default("deletedAt");

// ✅ Filters schema
export const filtersSchema = z.object({
  type: itemTypeValidator.optional(),
  deletedBy: deletedByValidator.optional(),
  dateDeleted: dateDeletedValidator.optional(),
  sortBy: sortByValidator.optional(),
  sortOrder: sortOrderValidator.optional(),
  search: z.string().optional(),
});

// ✅ Restore schema
export const restoreSchema = z.object({
  itemId: z.string().min(1, "Item ID is required"),
  conflictResolution: conflictResolutionValidator,
});

// ✅ Delete forever schema
export const deleteForeverSchema = z.object({
  itemIds: z.array(z.string().min(1, "Invalid item ID")),
});

// ✅ Bulk restore schema
export const bulkRestoreSchema = z.object({
  itemIds: z.array(z.string().min(1, "Invalid item ID")),
  conflictResolution: conflictResolutionValidator,
});

// ✅ Main trash schema (for filtering/sorting)
export const trashSchema = z.object({
  filters: filtersSchema,
  pagination: z.object({
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(100).default(10),
  }),
});
