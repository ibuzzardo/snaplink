// @ts-nocheck
import {
  pgTable,
  bigserial,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============ Users ============
export const users = pgTable(
  'users',
  {
    id: bigserial('id', { mode: 'bigint' }).primaryKey(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    passwordHash: varchar('password_hash', { length: 255 }),
    name: varchar('name', { length: 100 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    deletedAt: timestamp('deleted_at'),
  },
  (table) => ({
    emailIdx: uniqueIndex('idx_users_email').on(table.email),
  })
);

// ============ Links ============
export const links = pgTable(
  'links',
  {
    id: bigserial('id', { mode: 'bigint' }).primaryKey(),
    userId: bigserial('user_id', { mode: 'bigint' })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    originalUrl: text('original_url').notNull(),
    slug: varchar('slug', { length: 20 }).notNull().unique(),
    customSlug: boolean('custom_slug').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    deletedAt: timestamp('deleted_at'),
  },
  (table) => ({
    slugIdx: uniqueIndex('idx_links_slug').on(table.slug),
    userIdIdx: index('idx_links_user_id').on(table.userId),
    createdAtIdx: index('idx_links_created_at').on(table.createdAt),
  })
);

// ============ Clicks (Analytics Events) ============
export const clicks = pgTable(
  'clicks',
  {
    id: bigserial('id', { mode: 'bigint' }).primaryKey(),
    linkId: bigserial('link_id', { mode: 'bigint' })
      .notNull()
      .references(() => links.id, { onDelete: 'cascade' }),
    referrer: text('referrer'),
    country: varchar('country', { length: 2 }),
    city: varchar('city', { length: 100 }),
    deviceType: varchar('device_type', { length: 20 }),
    browser: varchar('browser', { length: 50 }),
    userAgent: text('user_agent'),
    ipHash: varchar('ip_hash', { length: 64 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    linkIdCreatedAtIdx: index('idx_clicks_link_id_created_at').on(
      table.linkId,
      table.createdAt
    ),
    linkIdIdx: index('idx_clicks_link_id').on(table.linkId),
  })
);

// ============ NextAuth Sessions ============
export const sessions = pgTable(
  'sessions',
  {
    id: bigserial('id', { mode: 'bigint' }).primaryKey(),
    sessionToken: varchar('session_token', { length: 255 }).notNull().unique(),
    userId: bigserial('user_id', { mode: 'bigint' })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    expires: timestamp('expires').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    sessionTokenIdx: uniqueIndex('idx_sessions_session_token').on(
      table.sessionToken
    ),
    userIdIdx: index('idx_sessions_user_id').on(table.userId),
  })
);

// ============ NextAuth Accounts (OAuth) ============
export const accounts = pgTable(
  'accounts',
  {
    id: bigserial('id', { mode: 'bigint' }).primaryKey(),
    userId: bigserial('user_id', { mode: 'bigint' })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    provider: varchar('provider', { length: 50 }).notNull(),
    providerAccountId: varchar('provider_account_id', {
      length: 255,
    }).notNull(),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    expiresAt: integer('expires_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    providerIdx: uniqueIndex('idx_accounts_provider').on(
      table.userId,
      table.provider,
      table.providerAccountId
    ),
  })
);

// ============ NextAuth Verification Tokens ============
export const verificationTokens = pgTable(
  'verification_tokens',
  {
    email: varchar('email', { length: 255 }).notNull(),
    token: varchar('token', { length: 255 }).notNull(),
    expires: timestamp('expires').notNull(),
  },
  (table) => ({
    emailTokenIdx: uniqueIndex('idx_verification_tokens_email_token').on(
      table.email,
      table.token
    ),
  })
);

// ============ Relations ============
export const usersRelations = relations(users, ({ many }) => ({
  links: many(links),
  sessions: many(sessions),
  accounts: many(accounts),
}));

export const linksRelations = relations(links, ({ one, many }) => ({
  user: one(users, { fields: [links.userId], references: [users.id] }),
  clicks: many(clicks),
}));

export const clicksRelations = relations(clicks, ({ one }) => ({
  link: one(links, { fields: [clicks.linkId], references: [links.id] }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

// ============ Types ============
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Link = typeof links.$inferSelect;
export type NewLink = typeof links.$inferInsert;

export type Click = typeof clicks.$inferSelect;
export type NewClick = typeof clicks.$inferInsert;

export type Session = typeof sessions.$inferSelect;
export type Account = typeof accounts.$inferSelect;
