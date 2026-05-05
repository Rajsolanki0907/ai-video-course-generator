// import { GENERATE_VIDEO_CONTENT_PROMPT } from "@/data/Prompt";
// import { flashModel, backupModel } from "@/config/gemini";
// import { NextRequest, NextResponse } from "next/server";
// import { VideoSlidesDummy } from "@/data/Dummy";
// import axios from "axios";
// import { BlobServiceClient, StorageSharedKeyCredential } from "@azure/storage-blob";
// import Replicate from "replicate";
// import { chapterContentSlides } from "@/config/schema";
// import { db } from "@/config/db";

// const replicate = new Replicate({
//   auth: process.env.REPLICATE_API_KEY || "",

// });

// export async function POST(req: NextRequest) {
//   try {
//     const { chapter, courseId } = await req.json();

//     // Generate JSON schema for video content
//     const finalPrompt = `
// ${GENERATE_VIDEO_CONTENT_PROMPT}
// Chapter Detail Is:
// ${JSON.stringify(chapter)}
// Return ONLY valid JSON.
// `;
// //    // Gemini response
//     let result;
//     try {
//       result = await flashModel.generateContent(finalPrompt);
//     } catch {
//       console.log("2.5 Flash busy → switching to Lite");
//       result = await backupModel.generateContent(finalPrompt);
//     }
// //     // Convert string → JSON
//     const response = await result.response;
//     const AiResult = response.text();

//     const VideoContentJson = JSON.parse(
//       AiResult.replace(/```json/g, "")
//         .replace(/```/g, "")
//         .trim() || "[]"
//     );
//   // Audio file generation using TTS for Narration    
//   // const VideoContentJson = VideoSlidesDummy;
//   let audioFileUrls:string[] = [];
//   for(let i =0 ; i< VideoContentJson?.length; i++){
//     if(i>0) break;
//     const narration = VideoContentJson[i].narration.fullText;
//     const fonadaResult = await axios.post('https://api.fonada.ai/tts/generate-audio-large', {
//       input: narration,
//       voice:'Pancham',
//       languages:'English'
//     },
//     {
//       headers:{
//         "Content-Type":"application/json",
//         Authorization:`Bearer ${process.env.FONADALAB_API_KEY}`
//     },
//     responseType:'arraybuffer',
//     timeout:120000
//   })
//    const audioBuffer = Buffer.from(fonadaResult.data);
//    console.log(audioBuffer);
//    const audioUrl = await SaveAudioToStorage(audioBuffer,VideoContentJson[i]?.audioFileName);
//    console.log("Audio URL:", audioUrl);
//    audioFileUrls.push(audioUrl);
//   }



//     // Storage Audio file in cloud storage (AWS S3 / Google Cloud)

//     // Generate Captions for the Audio
//     let captionsArray: any[] = [];
//     // for(let i = 0; i<audioFileUrls.length; i++){
//     //   const captions = await GenerateCaptions(audioFileUrls[i]);
//     //   console.log("Captions:", captions);
//     //   captionsArray.push(captions);
//     // }
//     for (let i = 0; i < audioFileUrls.length; i++) {
//   try {
//     console.log("🎧 Audio:", audioFileUrls[i]);
//     // const captions = await GenerateCaptions(audioFileUrls[i]);
//     const narrationText = VideoContentJson[i].narration.fullText;
//     const captions = await GenerateCaptions(narrationText);
//     console.log("Captions:", captions);
//     captionsArray.push(captions);
//   } catch (err) {
//     console.error("Replicate failed:", err);
//     captionsArray.push(null); // prevent crash
//   }
// }

//     // Save Everything to Database
//     // VideoContentJson.forEach(async(slide:any, index:number) => {
//     //         const result= await db.insert(chapterContentSlides).values({
//     //         chapterId: chapter.chapterId,
//     //         courseId: courseId,
//     //         slideIndex: VideoContentJson[index].slideIndex,
//     //         slideId: VideoContentJson[index].slideId,
//     //         audioFileName: VideoContentJson[index].audioFileName,
//     //         narration: VideoContentJson[index].narration,
//     //         revealData: {},
//     //         html: VideoContentJson[index].html,
//     //         audioFileUrl: audioFileUrls[index],
//     //         captions: captionsArray[index] ??{}
//     //       }).returning();
//     //       console.log("DB Insert Result:", result);
//     // });

// //@ts-ignore
// for (const [index, slide] of VideoContentJson.entries()) {
//   const result = await db.insert(chapterContentSlides).values({
//     chapterId: chapter.id,
//     courseId: chapter.courseId,
//     slideIndex: slide.slideIndex,
//     slideId: slide.slideId,
//     audioFileName: slide.audioFileName,
//     narration: slide.narration,
//     revealData: {},
//     html: slide.html,
//     audioFileUrl: audioFileUrls[index],
//     captions: captionsArray[index],
//   }).returning();

//   console.log("Inserted:", result);
// }

//      // Return Response
//     return NextResponse.json({...VideoContentJson, audioFileUrls, captionsArray});

//   } catch (error: any) {
//     return NextResponse.json(
//       { error: error.message },
//       { status: 500 }
//     );
//   }
// }

// const SaveAudioToStorage = async(audioBuffer:Buffer,fileName:string)=>{

//   //Implement cloud storage saving logic here
//   //azure storage account 
//   const blobService = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING|| "");
//   const container = blobService.getContainerClient(process.env.AZURE_STORAGE_CONTAINER_NAME|| "");
  
//   const blobName = `${fileName}.mp3`;
//   const blockBlob = container.getBlockBlobClient(blobName);

//   await blockBlob.uploadData(audioBuffer, {
//     blobHTTPHeaders: { 
//       blobContentType: "audio/mpeg",
//       blobCacheControl: "public, max-age=31536000, immutable"

//      },
//   });

//   //Return the URL of the uploaded audio file
//   const publicBase=process.env.AZURE_STORAGE_PUBLIC_BASE_URL || "";
//   const url=publicBase?
//   publicBase+'/'+container.containerName+'/'+ blobName:
//   blockBlob?.url;
//   return url;

// }

// // const GenerateCaptions= async (audioUrl: String)=>{
// //    const input = {
// //     audio: audioUrl,
// //     batch_size: 64
// // };

// // const output = await replicate.run("vaibhavs10/incredibly-fast-whisper:3ab86df6c8f54c11309d4d1f930ac292bad43ace52d10c80d87eb258b3c9f79c", { input });

// // console.log(output);
// // return output;
// // }


// // const GenerateCaptions = async (audioUrl: string) => {
// //   return {
// //     chunks: [
// //       { text: "Welcome to the course", timestamp: [0, 5] },
// //       { text: "This is a demo caption", timestamp: [5, 10] }
// //     ]
// //   };
// // };

// // type CaptionChunk = {
// //   text: string;
// //   timestamp: [number, number];
// // };


// const GenerateCaptions = async (text: string) => {
//   try {
//     if (!text) {
//       throw new Error("No narration text");
//     }

//     // split into sentences
//     const chunks = text
//       .split(".")
//       .filter((line: string) => line.trim().length > 0)
//       .map((line: string, index: number) => ({
//         text: line.trim(),
//         timestamp: [index * 5, (index + 1) * 5], // fake timing
//       }));

//     return { chunks };

//   } catch (err: any) {
//     return {
//       chunks: [],
//       error: err.message,
//     };
//   }
// };
import { GENERATE_VIDEO_CONTENT_PROMPT } from "@/data/Prompt";
import { flashModel, backupModel } from "@/config/gemini";
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { BlobServiceClient } from "@azure/storage-blob";
import { chapterContentSlides } from "@/config/schema";
import { db } from "@/config/db";

export async function POST(req: NextRequest) {
  try {
    const { chapter, courseId } = await req.json();

    // =========================
    // 1. GENERATE CONTENT (GEMINI)
    // =========================
    const finalPrompt = `
${GENERATE_VIDEO_CONTENT_PROMPT}

Chapter Detail:
${JSON.stringify(chapter)}

Return ONLY valid JSON.
`;

    let result;
    try {
      result = await flashModel.generateContent(finalPrompt);
    } catch {
      result = await backupModel.generateContent(finalPrompt);
    }

    const response = await result.response;
    const AiResult = response.text();

    const VideoContentJson = JSON.parse(
      AiResult.replace(/```json/g, "")
        .replace(/```/g, "")
        .trim() || "[]"
    );

    // =========================
    // 2. GENERATE AUDIO (ONLY IF NEEDED)
    // =========================
    const audioFileUrls: string[] = [];

    for (let i = 0; i < VideoContentJson.length; i++) {
      const narration = VideoContentJson[i].narration?.fullText;

      const fonadaResult = await axios.post(
        "https://api.fonada.ai/tts/generate-audio-large",
        {
          input: narration,
          voice: "Pancham",
          languages: "English",
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.FONADALAB_API_KEY}`,
          },
          responseType: "arraybuffer",
          timeout: 120000,
        }
      );

      const audioBuffer = Buffer.from(fonadaResult.data);
      const url = await SaveAudioToStorage(audioBuffer, VideoContentJson[i].audioFileName);

      audioFileUrls.push(url);
    }

    // =========================
    // 3. CAPTIONS (SAFE MOCK)
    // =========================
    const captionsArray = VideoContentJson.map((slide: any) => {
      const text = slide?.narration?.fullText || "";

      return {
        chunks: text
          .split(".")
          .filter((t: string) => t.trim().length > 0)
          .map((t: string, i: number) => ({
            text: t.trim(),
            timestamp: [i * 5, (i + 1) * 5],
          })),
      };
    });

    // =========================
    // 4. SAVE TO DATABASE (FIXED)
    // =========================
    await Promise.all(
      VideoContentJson.map(async (slide: any, index: number) => {
        return await db.insert(chapterContentSlides).values({
          chapterId: chapter.chapterId, // ✅ FIXED
          courseId: courseId,

          slideIndex: slide.slideIndex,
          slideId: slide.slideId,

          audioFileName: slide.audioFileName,

          narration: slide.narration,

          html: slide.html,

          audioFileUrl: audioFileUrls[index] ?? "",

          captions: captionsArray[index]?.chunks ?? [], // ✅ FIXED

          revealData: slide.revealData ?? {}, // safe
        });
      })
    );

    // =========================
    // 5. RESPONSE
    // =========================
    return NextResponse.json({
      success: true,
      VideoContentJson,
      audioFileUrls,
      captionsArray,
    });

  } catch (error: any) {
    console.error("❌ API ERROR:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

/* =========================
   AZURE STORAGE FUNCTION
========================= */
const SaveAudioToStorage = async (audioBuffer: Buffer, fileName: string) => {
  const blobService = BlobServiceClient.fromConnectionString(
    process.env.AZURE_STORAGE_CONNECTION_STRING || ""
  );

  const container = blobService.getContainerClient(
    process.env.AZURE_STORAGE_CONTAINER_NAME || ""
  );
const cleanName = fileName.replace(/\.mp3$/, "");
const blobName = `${cleanName}.mp3`;
  const blockBlob = container.getBlockBlobClient(blobName);

  await blockBlob.uploadData(audioBuffer, {
    blobHTTPHeaders: {
      blobContentType: "audio/mpeg",
      blobCacheControl: "public, max-age=31536000",
    },
  });

  const publicBase = process.env.AZURE_STORAGE_PUBLIC_BASE_URL || "";

  return publicBase
    ? `${publicBase}/${container.containerName}/${blobName}`
    : blockBlob.url;
};