import { relations } from 'drizzle-orm';
import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  index,
} from 'drizzle-orm/pg-core';

const timestamps = {
  createdAt: timestamp('created_at')
    .defaultNow()
    .notNull(),

  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
};

export const departments = pgTable('departments', {
  id: serial('id').primaryKey(),

  code: varchar('code', { length: 50 })
    .notNull()
    .unique(),

  name: varchar('name', { length: 255 })
    .notNull(),

  description: text('description'),

  ...timestamps,
});

export const subjects = pgTable(
  'subjects',
  {
    id: serial('id').primaryKey(),

    departmentId: integer('department_id')
      .notNull()
      .references(() => departments.id, { onDelete: 'restrict' }),

    code: varchar('code', { length: 50 })
      .notNull()
      .unique(),

    name: varchar('name', { length: 255 })
      .notNull(),

    description: text('description'),

    ...timestamps,
  },
  (table) => ({
    departmentIdx: index('subjects_department_id_idx').on(table.departmentId),
  })
);

export const departmentRelations = relations(departments, ({ many }) => ({
  subjects: many(subjects),
}));

export const subjectsRelations = relations(subjects, ({  one, many }) => ({
  department: one(departments, {
    fields: [subjects.departmentId],
    references: [departments.id],
  })
}));

export type Department = typeof departments.$inferSelect;

export type NewDepartment = typeof departments.$inferInsert;

export type Subject = typeof subjects.$inferSelect;

export type NewSubject = typeof subjects.$inferInsert;