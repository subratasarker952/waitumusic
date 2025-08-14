import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { albums, merchandise, users } from "./schema";

// Album-Merchandise Assignment Table
export const albumMerchandiseAssignments = pgTable('album_merchandise_assignments', {
  id: serial('id').primaryKey(),
  albumId: integer('album_id').notNull().references(() => albums.id, { onDelete: 'cascade' }),
  merchandiseId: integer('merchandise_id').notNull().references(() => merchandise.id, { onDelete: 'cascade' }),
  assignedBy: integer('assigned_by').notNull().references(() => users.id),
  assignmentNotes: text('assignment_notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const albumMerchandiseAssignmentsRelations = relations(albumMerchandiseAssignments, ({ one }) => ({
  album: one(albums, { fields: [albumMerchandiseAssignments.albumId], references: [albums.id] }),
  merchandise: one(merchandise, { fields: [albumMerchandiseAssignments.merchandiseId], references: [merchandise.id] }),
  assignedByUser: one(users, { fields: [albumMerchandiseAssignments.assignedBy], references: [users.id] }),
}));

export const insertAlbumMerchandiseAssignmentSchema = createInsertSchema(albumMerchandiseAssignments).omit({
  id: true,
  createdAt: true,
});

// Types
export type AlbumMerchandiseAssignment = typeof albumMerchandiseAssignments.$inferSelect;
export type InsertAlbumMerchandiseAssignment = z.infer<typeof insertAlbumMerchandiseAssignmentSchema>;