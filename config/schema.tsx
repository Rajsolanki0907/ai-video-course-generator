// import { json, integer, pgTable, timestamp, varchar, text } from "drizzle-orm/pg-core";
// export const usersTable = pgTable("users", {
//   id: integer().primaryKey().generatedAlwaysAsIdentity(),
//   name: varchar({ length: 255 }).notNull(),
//   email: varchar({ length: 255 }).notNull().unique(),
//   credits: integer().default(2)
// });

// export const coursesTable = pgTable("courses", {
//   id: integer().primaryKey().generatedAlwaysAsIdentity(),
//   userId: varchar({ length: 255 }).notNull().references(() => usersTable.email),
//   courseId: varchar({ length: 255 }).notNull().unique(),
//   courseName: varchar({ length: 255 }).notNull(),
//   userInput: varchar({ length: 1024 }).notNull(),
//   type: varchar({ length: 100 }).notNull(),
//   courseLayout:json(),
//   createdAt: timestamp().defaultNow()
// });



// export const chaptersTable = pgTable("chapters", {
//   id: integer().primaryKey().generatedAlwaysAsIdentity(),
//   courseId: varchar({ length: 255 }).notNull().references(() => coursesTable.courseId),                   
//   chapterId: varchar({ length: 255 }).notNull().unique(),
//   chapterTitle: varchar({ length: 255 }).notNull(),
//   videoContent:json(),
//   captions:json(),
//   audioFileUrl:varchar({length:1024}),
//   createdAt: timestamp().defaultNow()
// });


// export const chapterContentSlides = pgTable("chapter_content_slides", {
//   id: integer().primaryKey().generatedAlwaysAsIdentity(),
//   courseId: varchar({ length: 255 }).notNull().references(() => coursesTable.courseId),
//   chapterId: varchar({ length: 255 }).notNull(),
//   slideId:varchar({ length: 255 }).notNull(),
//   slideIndex:integer().notNull(),
//   audioFileName:varchar({ length: 255 }).notNull(),
//   captions:json().notNull(),
//   audioFileUrl:varchar({length:1024}).notNull(),
//   narration:json().notNull(),
//   html:text(),
//   revealData: json().notNull(),

// });


import {
  pgTable,
  integer,
  varchar,
  timestamp,
  text,
  json,
} from "drizzle-orm/pg-core";

import { relations } from "drizzle-orm";

/* =======================
   USERS TABLE
======================= */
export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  credits: integer().default(2),
});

/* =======================
   COURSES TABLE
======================= */
export const coursesTable = pgTable("courses", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar({ length: 255 })
    .notNull()
    .references(() => usersTable.email),

  courseId: varchar({ length: 255 }).notNull().unique(),
  courseName: varchar({ length: 255 }).notNull(),
  userInput: varchar({ length: 1024 }).notNull(),
  type: varchar({ length: 100 }).notNull(),
  courseLayout: json(),
  createdAt: timestamp().defaultNow(),
});

/* =======================
   CHAPTERS TABLE
======================= */
export const chaptersTable = pgTable("chapters", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),

  courseId: varchar({ length: 255 })
    .notNull()
    .references(() => coursesTable.courseId),

  chapterId: varchar({ length: 255 }).notNull().unique(),
  chapterTitle: varchar({ length: 255 }).notNull(),

  videoContent: json(),
  captions: json(),

  audioFileUrl: varchar({ length: 1024 }),

  createdAt: timestamp().defaultNow(),
});

/* =======================
   CHAPTER CONTENT SLIDES
   (FIXED: nullable fields)
======================= */
export const chapterContentSlides = pgTable("chapter_content_slides", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),

  courseId: varchar({ length: 255 })
    .notNull()
    .references(() => coursesTable.courseId),

  chapterId: varchar({ length: 255 }).notNull(),
  slideId: varchar({ length: 255 }).notNull(),
  slideIndex: integer().notNull(),

  audioFileName: varchar({ length: 255 }),

  captions: json(),        // ✅ removed notNull
  audioFileUrl: varchar({ length: 1024 }), // ✅ removed notNull

  narration: json().notNull(),
  html: text(),

  revealData: json(),      // ✅ removed notNull
});

/* =======================
   RELATIONS
======================= */

// courses → slides
export const coursesRelations = relations(coursesTable, ({ many }) => ({
  chapterContentSlides: many(chapterContentSlides),
}));

// slides → course
export const chapterContentSlidesRelations = relations(
  chapterContentSlides,
  ({ one }) => ({
    course: one(coursesTable, {
      fields: [chapterContentSlides.courseId],
      references: [coursesTable.courseId],
    }),
  })
);