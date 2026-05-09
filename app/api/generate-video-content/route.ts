// import { GENERATE_VIDEO_CONTENT_PROMPT } from "@/data/Prompt";
// import { eq } from "drizzle-orm";
// import {
//   flashModel,
//   backupModel,
// } from "@/config/gemini";
// import {
//   NextRequest,
//   NextResponse,
// } from "next/server";
// import axios from "axios";
// import {
//   BlobServiceClient,
// } from "@azure/storage-blob";
// import {
//   chapterContentSlides,
// } from "@/config/schema";
// import { db } from "@/config/db";

// export async function POST(req: NextRequest) {
//   try {
//     const { chapter, courseId } =
//       await req.json();

//     // =========================
//     // 0. CHECK CHAPTER EXISTS
//     // =========================
//     const existingChapter =
//       await db
//         .select()
//         .from(chapterContentSlides)
//         .where(
//           eq(
//             chapterContentSlides.chapterId,
//             chapter.chapterId
//           )
//         )
//         .limit(1);

//     if (existingChapter.length > 0) {
//       return NextResponse.json({
//         success: true,
//         message:
//           "Chapter already generated",
//       });
//     }

//     // =========================
//     // 1. GENERATE CONTENT
//     // =========================
//     const finalPrompt = `
// ${GENERATE_VIDEO_CONTENT_PROMPT}

// Chapter Detail:
// ${JSON.stringify(chapter)}

// Return ONLY valid JSON.
// `;

//     let result;

//     try {
//       result =
//         await flashModel.generateContent(
//           finalPrompt
//         );
//     } catch {
//       result =
//         await backupModel.generateContent(
//           finalPrompt
//         );
//     }

//     const response =
//       await result.response;
//     const AiResult = response.text();

//     let VideoContentJson: any[] = [];

//     try {
//       VideoContentJson = JSON.parse(
//         AiResult.replace(/```json/g, "")
//           .replace(/```/g, "")
//           .replace(/\n/g, "")
//           .trim() || "[]"
//       );
//     } catch (err) {
//       console.error(
//         "❌ JSON PARSE ERROR:",
//         err
//       );

//       return NextResponse.json(
//         {
//           error:
//             "Invalid AI JSON response",
//         },
//         { status: 500 }
//       );
//     }

//     // =========================
//     // 2. AUDIO (CACHE)
//     // =========================
//     const audioFileUrls: string[] = [];

//     for (
//       let i = 0;
//       i < VideoContentJson.length;
//       i++
//     ) {
//       const narration =
//         VideoContentJson[i]
//           ?.narration?.fullText;

//       const fileName =
//         VideoContentJson[i]
//           ?.audioFileName;

//       if (!narration || !fileName) {
//         audioFileUrls.push("");
//         continue;
//       }

//       try {
//         const cachedUrl =
//           await GetAudioIfExists(
//             fileName
//           );

//         if (cachedUrl) {
//           console.log(
//             "✅ Using cached audio:",
//             fileName
//           );

//           audioFileUrls.push(
//             cachedUrl
//           );
//           continue;
//         }

//         const url =
//           await generateAudioWithRetry(
//             narration,
//             fileName
//           );

//         audioFileUrls.push(url);

//         await new Promise((res) =>
//           setTimeout(res, 1500)
//         );
//       } catch (err: any) {
//         console.error(
//           "❌ TTS ERROR:",
//           err?.message
//         );
//         audioFileUrls.push("");
//       }
//     }

//     // =========================
//     // 3. CAPTIONS
//     // =========================
//     const captionsArray =
//       VideoContentJson.map(
//         (slide: any) => {
//           const text =
//             slide?.narration
//               ?.fullText || "";

//           return {
//             chunks: text
//               .split(".")
//               .filter(
//                 (t: string) =>
//                   t.trim().length > 0
//               )
//               .map(
//                 (
//                   t: string,
//                   i: number
//                 ) => ({
//                   text: t.trim(),
//                   timestamp: [
//                     i * 5,
//                     (i + 1) * 5,
//                   ],
//                 })
//               ),
//           };
//         }
//       );

//     // =========================
//     // 4. SAVE
//     // =========================
//     await Promise.all(
//       VideoContentJson.map(
//         async (
//           slide: any,
//           index: number
//         ) => {
//           // slide duplicate check
//           const existingSlide =
//             await db
//               .select()
//               .from(
//                 chapterContentSlides
//               )
//               .where(
//                 eq(
//                   chapterContentSlides.slideId,
//                   slide.slideId
//                 )
//               )
//               .limit(1);

//           if (
//             existingSlide.length > 0
//           ) {
//             console.log(
//               "Skip:",
//               slide.slideId
//             );
//             return;
//           }

//           return db
//             .insert(
//               chapterContentSlides
//             )
//             .values({
//               chapterId:
//                 chapter.chapterId,
//               courseId: courseId,

//               slideIndex:
//                 slide.slideIndex,
//               slideId:
//                 slide.slideId,

//               audioFileName:
//                 slide.audioFileName,
//               narration:
//                 slide.narration,
//               html: slide.html,

//               audioFileUrl:
//                 audioFileUrls[
//                   index
//                 ] ?? "",

//               captions:
//                 captionsArray[
//                   index
//                 ]?.chunks ?? [],

//               revealData:
//                 slide.revealData ??
//                 [],
//             });
//         }
//       )
//     );

//     return NextResponse.json({
//       success: true,
//       VideoContentJson,
//       audioFileUrls,
//       captionsArray,
//     });
//   } catch (error: any) {
//     console.error(
//       "❌ API ERROR:",
//       error
//     );

//     return NextResponse.json(
//       {
//         error: error.message,
//       },
//       { status: 500 }
//     );
//   }
// }

// /* =========================
//    AUDIO GENERATE
// ========================= */
// const generateAudioWithRetry =
//   async (
//     narration: string,
//     fileName: string,
//     retries = 3
//   ) => {
//     for (
//       let i = 0;
//       i < retries;
//       i++
//     ) {
//       try {
//         const res =
//           await axios.post(
//             "https://api.fonada.ai/tts/generate-audio-large",
//             {
//               input: narration,
//               voice: "Pancham",
//               languages:
//                 "English",
//             },
//             {
//               headers: {
//                 "Content-Type":
//                   "application/json",
//                 Authorization: `Bearer ${process.env.FONADALAB_API_KEY}`,
//               },
//               responseType:
//                 "arraybuffer",
//               timeout: 120000,
//             }
//           );

//         const buffer =
//           Buffer.from(res.data);

//         return await SaveAudioToStorage(
//           buffer,
//           fileName
//         );
//       } catch (err: any) {
//         if (
//           err.response?.status ===
//           429
//         ) {
//           await new Promise(
//             (res) =>
//               setTimeout(
//                 res,
//                 3000
//               )
//           );
//         } else {
//           throw err;
//         }
//       }
//     }

//     return "";
//   };

// /* =========================
//    CHECK CACHE
// ========================= */
// const GetAudioIfExists =
//   async (fileName: string) => {
//     const blobService =
//       BlobServiceClient.fromConnectionString(
//         process.env
//           .AZURE_STORAGE_CONNECTION_STRING ||
//           ""
//       );

//     const container =
//       blobService.getContainerClient(
//         process.env
//           .AZURE_STORAGE_CONTAINER_NAME ||
//           ""
//       );

//     const cleanName =
//       fileName.replace(
//         /\.mp3$/,
//         ""
//       );

//     const blobName = `${cleanName}.mp3`;

//     const blockBlob =
//       container.getBlockBlobClient(
//         blobName
//       );

//     const exists =
//       await blockBlob.exists();

//     if (!exists) return null;

//     return blockBlob.url;
//   };

// /* =========================
//    SAVE AUDIO
// ========================= */
// const SaveAudioToStorage =
//   async (
//     audioBuffer: Buffer,
//     fileName: string
//   ) => {
//     const blobService =
//       BlobServiceClient.fromConnectionString(
//         process.env
//           .AZURE_STORAGE_CONNECTION_STRING ||
//           ""
//       );

//     const container =
//       blobService.getContainerClient(
//         process.env
//           .AZURE_STORAGE_CONTAINER_NAME ||
//           ""
//       );

//     const cleanName =
//       fileName.replace(
//         /\.mp3$/,
//         ""
//       );

//     const blobName = `${cleanName}.mp3`;

//     const blockBlob =
//       container.getBlockBlobClient(
//         blobName
//       );

//     await blockBlob.uploadData(
//       audioBuffer,
//       {
//         blobHTTPHeaders: {
//           blobContentType:
//             "audio/mpeg",
//           blobCacheControl:
//             "public, max-age=31536000",
//         },
//       }
//     );

//     return blockBlob.url;
//   };





import { GENERATE_VIDEO_CONTENT_PROMPT } from "@/data/Prompt";
import { eq } from "drizzle-orm";
import {
  flashModel,
  backupModel,
  liteModel,
} from "@/config/gemini";
import {
  NextRequest,
  NextResponse,
} from "next/server";
import axios from "axios";
import {
  BlobServiceClient,
} from "@azure/storage-blob";
import {
  chapterContentSlides,
} from "@/config/schema";
import { db } from "@/config/db";

export async function POST(req: NextRequest) {
  try {
    const { chapter, courseId } =
      await req.json();

    console.log("Generating video content for:", {
      courseId,
      chapterId: chapter.chapterId,
      chapterTitle: chapter.chapterTitle,
    });

    // =========================
    // 0. CHECK CHAPTER EXISTS
    // =========================
    const existingChapter =
      await db
        .select()
        .from(chapterContentSlides)
        .where(
          eq(
            chapterContentSlides.chapterId,
            chapter.chapterId
          )
        )
        .limit(1);

    if (existingChapter.length > 0) {
      return NextResponse.json({
        success: true,
        message:
          "Chapter already generated",
      });
    }

    // =========================
    // 1. GENERATE CONTENT
    // =========================
    const finalPrompt = `
${GENERATE_VIDEO_CONTENT_PROMPT}

Chapter Detail:
${JSON.stringify(chapter)}

Return ONLY valid JSON.
`;

    let result;

    try {
      console.log("Using Gemini 2.5 Flash");

      result =
        await flashModel.generateContent(
          finalPrompt
        );
    } catch (err1) {
      console.log(
        "2.5 Flash failed → switching to 1.5 Flash"
      );

      try {
        result =
          await backupModel.generateContent(
            finalPrompt
          );
      } catch (err2) {
        console.log(
          "1.5 Flash failed → switching to 1.5 Flash 8B"
        );

        try {
          result =
            await liteModel.generateContent(
              finalPrompt
            );
        } catch (err3) {
          console.error(
            "All Gemini models failed"
          );

          return NextResponse.json(
            {
              error:
                "AI generation failed",
            },
            { status: 500 }
          );
        }
      }
    }

    const response =
      await result.response;
    const AiResult = response.text();

    let VideoContentJson: any[] = [];

    try {
      VideoContentJson = JSON.parse(
        AiResult.replace(/```json/g, "")
          .replace(/```/g, "")
          .replace(/\n/g, "")
          .trim() || "[]"
      );
    } catch (err) {
      console.error(
        "❌ JSON PARSE ERROR:",
        err
      );

      return NextResponse.json(
        {
          error:
            "Invalid AI JSON response",
        },
        { status: 500 }
      );
    }

    // =========================
    // 2. AUDIO (CACHE)
    // =========================
    const audioFileUrls: string[] = [];

    for (
      let i = 0;
      i < VideoContentJson.length;
      i++
    ) {
      const narration =
        VideoContentJson[i]
          ?.narration?.fullText;

      const fileName =
        VideoContentJson[i]
          ?.audioFileName;

      if (!narration || !fileName) {
        audioFileUrls.push("");
        continue;
      }

      try {
        const cachedUrl =
          await GetAudioIfExists(
            fileName
          );

        if (cachedUrl) {
          console.log(
            "✅ Using cached audio:",
            fileName
          );

          audioFileUrls.push(
            cachedUrl
          );
          continue;
        }

        const url =
          await generateAudioWithRetry(
            narration,
            fileName
          );

        audioFileUrls.push(url);

        await new Promise((res) =>
          setTimeout(res, 1500)
        );
      } catch (err: any) {
        console.error(
          "❌ TTS ERROR:",
          err?.message
        );
        audioFileUrls.push("");
      }
    }

    // =========================
    // 3. CAPTIONS
    // =========================
    const captionsArray =
      VideoContentJson.map(
        (slide: any) => {
          const text =
            slide?.narration
              ?.fullText || "";

          return {
            chunks: text
              .split(".")
              .filter(
                (t: string) =>
                  t.trim().length > 0
              )
              .map(
                (
                  t: string,
                  i: number
                ) => ({
                  text: t.trim(),
                  timestamp: [
                    i * 5,
                    (i + 1) * 5,
                  ],
                }),
              ),
          };
        },
      );

    // =========================
    // 4. SAVE
    // =========================
    // =========================
// 4. SAVE (SEQUENTIAL INSERT)
// =========================
for (
  let index = 0;
  index < VideoContentJson.length;
  index++
) {
  const slide = VideoContentJson[index];

  const existingSlide =
    await db
      .select()
      .from(chapterContentSlides)
      .where(
        eq(
          chapterContentSlides.slideId,
          slide.slideId
        )
      )
      .limit(1);

  if (existingSlide.length > 0) {
    console.log(
      "Skip:",
      slide.slideId
    );
    continue;
  }

  await db
    .insert(chapterContentSlides)
    .values({
      chapterId: chapter.chapterId,
      courseId: courseId,

      slideIndex: slide.slideIndex,
      slideId: slide.slideId,

      audioFileName:
        slide.audioFileName,

      narration:
        slide.narration,

      html: slide.html,

      audioFileUrl:
        audioFileUrls[index] ?? "",

      captions:
        captionsArray[index]
          ?.chunks ?? [],

      revealData:
        slide.revealData ?? [],
    });

  console.log(
    "Inserted:",
    slide.slideId
  );
}

    return NextResponse.json({
      success: true,
      VideoContentJson,
      audioFileUrls,
      captionsArray,
    });
  } catch (error: any) {
    console.error(
      "❌ API ERROR:",
      error,
    );

    return NextResponse.json(
      {
        error: error.message,
      },
      { status: 500 },
    );
  }
}

/* =========================
   AUDIO GENERATE
========================= */
const generateAudioWithRetry =
  async (
    narration: string,
    fileName: string,
    retries = 3,
  ) => {
    for (
      let i = 0;
      i < retries;
      i++
    ) {
      try {
        const res =
          await axios.post(
            "https://api.fonada.ai/tts/generate-audio-large",
            {
              input: narration,
              voice: "Pancham",
              languages:
                "English",
            },
            {
              headers: {
                "Content-Type":
                  "application/json",
                Authorization: `Bearer ${process.env.FONADALAB_API_KEY}`,
              },
              responseType:
                "arraybuffer",
              timeout: 120000,
            },
          );

        const buffer =
          Buffer.from(res.data);

        return await SaveAudioToStorage(
          buffer,
          fileName,
        );
      } catch (err: any) {
        if (
          err.response?.status ===
          429
        ) {
          await new Promise(
            (res) =>
              setTimeout(
                res,
                3000,
              ),
          );
        } else {
          throw err;
        }
      }
    }

    return "";
  };

/* =========================
   CHECK CACHE
========================= */
const GetAudioIfExists =
  async (fileName: string) => {
    const blobService =
      BlobServiceClient.fromConnectionString(
        process.env
          .AZURE_STORAGE_CONNECTION_STRING ||
          "",
      );

    const container =
      blobService.getContainerClient(
        process.env
          .AZURE_STORAGE_CONTAINER_NAME ||
          "",
      );

    const cleanName =
      fileName.replace(
        /\.mp3$/,
        "",
      );

    const blobName = `${cleanName}.mp3`;

    const blockBlob =
      container.getBlockBlobClient(
        blobName,
      );

    const exists =
      await blockBlob.exists();

    if (!exists) return null;

    return blockBlob.url;
  };

/* =========================
   SAVE AUDIO
========================= */
const SaveAudioToStorage =
  async (
    audioBuffer: Buffer,
    fileName: string,
  ) => {
    const blobService =
      BlobServiceClient.fromConnectionString(
        process.env
          .AZURE_STORAGE_CONNECTION_STRING ||
          "",
      );

    const container =
      blobService.getContainerClient(
        process.env
          .AZURE_STORAGE_CONTAINER_NAME ||
          "",
      );

    const cleanName =
      fileName.replace(
        /\.mp3$/,
        "",
      );

    const blobName = `${cleanName}.mp3`;

    const blockBlob =
      container.getBlockBlobClient(
        blobName,
      );

    await blockBlob.uploadData(
      audioBuffer,
      {
        blobHTTPHeaders: {
          blobContentType:
            "audio/mpeg",
          blobCacheControl:
            "public, max-age=31536000",
        },
      },
    );

    return blockBlob.url;
  };