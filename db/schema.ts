import { integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  passwordSalt: text("password_salt").notNull(),
  businessName: text("business_name").notNull(),
  businessType: text("business_type").notNull(),
  phone: text("phone"),
  createdAt: integer("created_at").notNull(),
});

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  expiresAt: integer("expires_at").notNull(),
  createdAt: integer("created_at").notNull(),
});

export const transactions = sqliteTable("transactions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  date: text("date").notNull(),
  merchant: text("merchant").notNull(),
  receiptNumber: text("receipt_number"),
  description: text("description").notNull(),
  category: text("category").notNull(),
  account: text("account").notNull(),
  type: text("type").notNull(),
  amount: real("amount").notNull(),
  taxAmount: real("tax_amount").notNull().default(0),
  paymentMethod: text("payment_method").notNull(),
  status: text("status").notNull().default("confirmed"),
  receiptKey: text("receipt_key"),
  aiConfidence: real("ai_confidence").notNull().default(0.92),
  createdAt: integer("created_at").notNull(),
});

export const budgets = sqliteTable(
  "budgets",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    month: text("month").notNull(),
    category: text("category").notNull(),
    amount: real("amount").notNull(),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (table) => [
    uniqueIndex("budgets_user_month_category_idx").on(
      table.userId,
      table.month,
      table.category,
    ),
  ],
);
