// import { model } from "@/config/gemini";
// import { NextResponse } from "next/server";
// import { Course_config_prompt } from "@/data/Prompt";
// import { coursesTable } from "@/config/schema";
// import { currentUser } from "@clerk/nextjs/server";
// import { db } from "@/config/db";


// export async function POST(req: Request) {
//   try {
//     const { userInput, courseId, type } = await req.json();
//     const user = await currentUser();
//     const finalPrompt = `
// ${Course_config_prompt}

// Course Topic is: ${userInput}

// Return strictly valid JSON. Do not include backticks.
// `;

//     const result = await model.generateContent(finalPrompt);
//     const response = await result.response;

//     const rawResult = response
//       .text()
//       .replace(/```json/g, "")
//       .replace(/```/g, "")
//       .trim();

//     const JSONResult = JSON.parse(rawResult);

//     //save to DB
//     const courseResult = await db.insert(coursesTable).values({
//       courseId: courseId,
//       courseName: JSONResult.courseName,
//       userInput: userInput,
//       type: type,
//       courseLayout: JSONResult,
//        userId:user?.primaryEmailAddress?.emailAddress || ''
//     }).returning();

//     return NextResponse.json(courseResult[0]);

//   } catch (error: any) {
//     console.error(error);

//     return NextResponse.json(
//       { error: "Failed to generate course", details: error.message },
//       { status: 500 }
//     );
//   }
// }


//server busy fallback
import { flashModel, backupModel } from "@/config/gemini";
import { NextResponse } from "next/server";
import { Course_config_prompt } from "@/data/Prompt";
import { coursesTable } from "@/config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/config/db";

export async function POST(req: Request) {
  try {
    const { userInput, courseId, type } = await req.json();
    const user = await currentUser();

    const finalPrompt = `
${Course_config_prompt}

Course Topic is: ${userInput}

Return strictly valid JSON only.
`;

    let result;

    try {
      result = await flashModel.generateContent(finalPrompt);
    } catch {
      console.log("2.5 flash busy → switching to 1.5 flash");
      result = await backupModel.generateContent(finalPrompt);
    }

    const response = await result.response;

    const rawResult = response
      .text()
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const JSONResult = JSON.parse(rawResult);

    const courseResult = await db
      .insert(coursesTable)
      .values({
        courseId,
        courseName: JSONResult.courseName,
        userInput,
        type,
        courseLayout: JSONResult,
        userId: user?.primaryEmailAddress?.emailAddress || "",
      })
      .returning();

    return NextResponse.json(courseResult[0]);
  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to generate course", details: error.message },
      { status: 500 }
    );
  }
}