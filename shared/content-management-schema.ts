/**
 * Comprehensive Content and Styling Management Schema
 * Text Content Management - Typography Control - Color Schemes - Component Styling
 */

import { pgTable, serial, text, varchar, boolean, timestamp, json, integer, real } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// TEXT CONTENT MANAGEMENT - Every string controllable via admin
export const platformTextContent = pgTable('platform_text_content', {
  id: serial('id').primaryKey(),
  contentKey: varchar('content_key', { length: 255 }).notNull().unique(), // e.g., 'button.save', 'header.dashboard'
  contentValue: text('content_value').notNull(), // The actual text
  contentType: varchar('content_type', { length: 50 }).notNull(), // 'button', 'heading', 'label', 'description', 'error', 'success'
  componentLocation: varchar('component_location', { length: 255 }), // e.g., 'AdminDashboard', 'BookingWorkflow'
  isMarkdown: boolean('is_markdown').default(false), // Support markdown formatting
  isHtml: boolean('is_html').default(false), // Support HTML tags
  context: text('context'), // Additional context for translators/editors
  priority: varchar('priority', { length: 20 }).default('normal'), // 'critical', 'high', 'normal', 'low'
  isActive: boolean('is_active').default(true),
  language: varchar('language', { length: 10 }).default('en'), // Multi-language support
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  createdBy: integer('created_by'), // User ID who created/modified
});

// TYPOGRAPHY CONTROL - Complete font management system
export const platformTypography = pgTable('platform_typography', {
  id: serial('id').primaryKey(),
  typographyKey: varchar('typography_key', { length: 255 }).notNull().unique(), // e.g., 'heading.h1', 'body.default'
  fontFamily: varchar('font_family', { length: 255 }).notNull(), // e.g., 'Inter, sans-serif'
  fontSize: varchar('font_size', { length: 50 }).notNull(), // e.g., '2.5rem', '16px'
  fontWeight: varchar('font_weight', { length: 50 }).notNull(), // e.g., '600', 'bold'
  lineHeight: varchar('line_height', { length: 50 }).notNull(), // e.g., '1.5', '24px'
  letterSpacing: varchar('letter_spacing', { length: 50 }).default('normal'), // e.g., '0.05em'
  textTransform: varchar('text_transform', { length: 50 }).default('none'), // 'uppercase', 'lowercase', 'capitalize'
  textAlign: varchar('text_align', { length: 50 }).default('left'), // 'left', 'center', 'right', 'justify'
  category: varchar('category', { length: 100 }).notNull(), // 'headings', 'body', 'buttons', 'labels', 'forms'
  responsiveSizes: json('responsive_sizes'), // { sm: '1rem', md: '1.25rem', lg: '1.5rem' }
  cssVariableName: varchar('css_variable_name', { length: 255 }), // Generated CSS variable name
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// COLOR SCHEME DATABASE - Dynamic brand control
export const platformColorSchemes = pgTable('platform_color_schemes', {
  id: serial('id').primaryKey(),
  schemeName: varchar('scheme_name', { length: 100 }).notNull().unique(), // e.g., 'default', 'dark', 'brand'
  isDefault: boolean('is_default').default(false),
  isActive: boolean('is_active').default(true),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const platformColors = pgTable('platform_colors', {
  id: serial('id').primaryKey(),
  schemeId: integer('scheme_id').notNull().references(() => platformColorSchemes.id, { onDelete: 'cascade' }),
  colorKey: varchar('color_key', { length: 255 }).notNull(), // e.g., 'primary', 'secondary', 'success', 'danger'
  colorValue: varchar('color_value', { length: 50 }).notNull(), // e.g., '#3B82F6', 'hsl(220, 91%, 60%)'
  colorName: varchar('color_name', { length: 100 }), // Human-readable name
  category: varchar('category', { length: 100 }).notNull(), // 'primary', 'semantic', 'neutral', 'accent'
  opacity: real('opacity').default(1.0), // 0.0 to 1.0
  cssVariableName: varchar('css_variable_name', { length: 255 }), // Generated CSS variable name
  usage: text('usage'), // Description of where this color is used
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// COMPONENT STYLING - Granular UI element control
export const platformComponentStyles = pgTable('platform_component_styles', {
  id: serial('id').primaryKey(),
  componentType: varchar('component_type', { length: 100 }).notNull(), // 'button', 'card', 'input', 'modal'
  variant: varchar('variant', { length: 100 }).notNull(), // 'primary', 'secondary', 'outline', 'ghost'
  styleKey: varchar('style_key', { length: 255 }).notNull(), // e.g., 'button.primary.padding'
  styleProperty: varchar('style_property', { length: 100 }).notNull(), // CSS property name
  styleValue: text('style_value').notNull(), // CSS value
  state: varchar('state', { length: 50 }).default('default'), // 'default', 'hover', 'focus', 'active', 'disabled'
  breakpoint: varchar('breakpoint', { length: 20 }).default('all'), // 'all', 'sm', 'md', 'lg', 'xl'
  priority: integer('priority').default(0), // For CSS specificity ordering
  isActive: boolean('is_active').default(true),
  category: varchar('category', { length: 100 }), // 'spacing', 'colors', 'borders', 'effects'
  cssClass: varchar('css_class', { length: 255 }), // Generated CSS class name
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// LAYOUT AND SPACING CONTROLS
export const platformLayoutControls = pgTable('platform_layout_controls', {
  id: serial('id').primaryKey(),
  layoutKey: varchar('layout_key', { length: 255 }).notNull().unique(), // e.g., 'spacing.section', 'grid.columns'
  property: varchar('property', { length: 100 }).notNull(), // 'margin', 'padding', 'gap', 'grid-template-columns'
  value: varchar('value', { length: 255 }).notNull(), // CSS value
  category: varchar('category', { length: 100 }).notNull(), // 'spacing', 'grid', 'flexbox', 'positioning'
  responsive: json('responsive'), // Responsive values for different breakpoints
  description: text('description'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// THEME CONFIGURATIONS - Overall theme management
export const platformThemes = pgTable('platform_themes', {
  id: serial('id').primaryKey(),
  themeName: varchar('theme_name', { length: 100 }).notNull().unique(),
  description: text('description'),
  colorSchemeId: integer('color_scheme_id').references(() => platformColorSchemes.id),
  isDefault: boolean('is_default').default(false),
  isActive: boolean('is_active').default(true),
  configuration: json('configuration'), // Complete theme configuration object
  cssOutput: text('css_output'), // Generated CSS for this theme
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  createdBy: integer('created_by'),
});

// Create Zod schemas for validation
export const insertPlatformTextContentSchema = createInsertSchema(platformTextContent).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPlatformTypographySchema = createInsertSchema(platformTypography).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPlatformColorSchemeSchema = createInsertSchema(platformColorSchemes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPlatformColorSchema = createInsertSchema(platformColors).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPlatformComponentStyleSchema = createInsertSchema(platformComponentStyles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPlatformLayoutControlSchema = createInsertSchema(platformLayoutControls).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPlatformThemeSchema = createInsertSchema(platformThemes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Type exports
export type PlatformTextContent = typeof platformTextContent.$inferSelect;
export type InsertPlatformTextContent = z.infer<typeof insertPlatformTextContentSchema>;

export type PlatformTypography = typeof platformTypography.$inferSelect;
export type InsertPlatformTypography = z.infer<typeof insertPlatformTypographySchema>;

export type PlatformColorScheme = typeof platformColorSchemes.$inferSelect;
export type InsertPlatformColorScheme = z.infer<typeof insertPlatformColorSchemeSchema>;

export type PlatformColor = typeof platformColors.$inferSelect;
export type InsertPlatformColor = z.infer<typeof insertPlatformColorSchema>;

export type PlatformComponentStyle = typeof platformComponentStyles.$inferSelect;
export type InsertPlatformComponentStyle = z.infer<typeof insertPlatformComponentStyleSchema>;

export type PlatformLayoutControl = typeof platformLayoutControls.$inferSelect;
export type InsertPlatformLayoutControl = z.infer<typeof insertPlatformLayoutControlSchema>;

export type PlatformTheme = typeof platformThemes.$inferSelect;
export type InsertPlatformTheme = z.infer<typeof insertPlatformThemeSchema>;