import { pgTable, text, serial, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
});

export const campaigns = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").notNull().default("draft"), // draft, active, completed
  userId: integer("user_id").notNull(),
  templateId: integer("template_id"),
  logoId: integer("logo_id"),
  companyName: text("company_name"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  validUntil: text("valid_until"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  originalPrice: real("original_price").notNull(),
  imageUrl: text("image_url"),
  description: text("description"),
});

export const campaignProducts = pgTable("campaign_products", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull().default(1),
  discountPercent: real("discount_percent").notNull().default(0),
  newPrice: real("new_price").notNull(),
  positionX: real("position_x").default(0),
  positionY: real("position_y").default(0),
  scaleX: real("scale_x").default(1),
  scaleY: real("scale_y").default(1),
  pageNumber: integer("page_number").default(1),
});

export const templates = pgTable("templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  filePath: text("file_path").notNull(),
  thumbnailPath: text("thumbnail_path"),
  userId: integer("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const logos = pgTable("logos", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  filePath: text("file_path").notNull(),
  isActive: boolean("is_active").notNull().default(false),
  userId: integer("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertCampaignSchema = createInsertSchema(campaigns).omit({
  id: true,
  createdAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
});

export const insertCampaignProductSchema = createInsertSchema(campaignProducts).omit({
  id: true,
});

export const insertTemplateSchema = createInsertSchema(templates).omit({
  id: true,
  createdAt: true,
});

export const insertLogoSchema = createInsertSchema(logos).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type CampaignProduct = typeof campaignProducts.$inferSelect;
export type InsertCampaignProduct = z.infer<typeof insertCampaignProductSchema>;

export type Template = typeof templates.$inferSelect;
export type InsertTemplate = z.infer<typeof insertTemplateSchema>;

export type Logo = typeof logos.$inferSelect;
export type InsertLogo = z.infer<typeof insertLogoSchema>;

// Login schema
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type LoginCredentials = z.infer<typeof loginSchema>;
