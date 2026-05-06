// import {db} from "@/config/db";
// import { chapterContentSlides, coursesTable } from "@/config/schema";
// import { eq } from "drizzle-orm";
// import { NextRequest, NextResponse } from "next/server";

// export async function GET(req:NextRequest){
//     const courseId =  req.nextUrl.searchParams.get('courseId');

//     const courses =  await db.select().from(coursesTable)
//     .where(eq(coursesTable.courseId,courseId as string));

     
//     const  chapterContentSlide = await db.select().from(chapterContentSlides)
//     .where(eq(chapterContentSlides?.courseId,courseId as string));



//     return NextResponse.json({
//         ...courses[0],
//         chapterContentSlides:chapterContentSlide
//     });
// }

import { db } from "@/config/db";
import { chapterContentSlides, coursesTable } from "@/config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq, desc } from "drizzle-orm";
import { PgColumn } from "drizzle-orm/pg-core";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // =========================
    // 1. GET courseId from URL
    // =========================
    const courseId = req.nextUrl.searchParams.get("courseId");
    const user = await currentUser();

    if (!courseId) {
      if (!user) {
        return NextResponse.json([]);
      }

      const userCourses = await db
        .select()
        .from(coursesTable)
        .where(eq(coursesTable.userId, user.primaryEmailAddress?.emailAddress!))
        .orderBy(desc(coursesTable.id));

      return NextResponse.json(userCourses);
    }

    // =========================
    // 2. FETCH COURSE
    // =========================
    const course = await db
      .select()
      .from(coursesTable)
      .where(eq(coursesTable.courseId, courseId));

    if (!course || course.length === 0) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    // =========================
    // 3. FETCH ALL SLIDES (ORDERED)
    // =========================
    const slides = await db
      .select()
      .from(chapterContentSlides)
      .where(eq(chapterContentSlides.courseId, courseId))
      .orderBy(chapterContentSlides.slideIndex); // ⭐ IMPORTANT

    // =========================
    // 4. RETURN RESPONSE
    // =========================
    return NextResponse.json({
      ...course[0],
      chapterContentSlides: slides,
    });

  } catch (error: any) {
    console.error("❌ COURSE API ERROR:", error);

    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}

function orderBy(createdAt: PgColumn<{ name: "createdAt"; tableName: "courses"; dataType: "date"; columnType: "PgTimestamp"; data: Date; driverParam: string; notNull: false; hasDefault: true; isPrimaryKey: false; isAutoincrement: false; hasRuntimeDefault: false; enumValues: undefined; baseColumn: never; identity: undefined; generated: undefined; }, {}, {}>, arg1: string) {
  throw new Error("Function not implemented.");
}
