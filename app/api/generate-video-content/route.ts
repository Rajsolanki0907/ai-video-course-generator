import { GENERATE_VIDEO_CONTENT_PROMPT } from "@/data/Prompt";
import { flashModel, backupModel } from "@/config/gemini";
import { NextRequest, NextResponse } from "next/server";
import { VideoSlidesDummy } from "@/data/Dummy";
import axios from "axios";

export async function POST(req: NextRequest) {
  try {
    const { chapter } = await req.json();

    // Generate JSON schema for video content

//     const finalPrompt = `
// ${GENERATE_VIDEO_CONTENT_PROMPT}

// Chapter Detail Is:
// ${JSON.stringify(chapter)}

// Return ONLY valid JSON.
// `;


//    // Gemini response
//     let result;

//     try {
//       result = await flashModel.generateContent(finalPrompt);
//     } catch {
//       console.log("2.5 Flash busy → switching to Lite");
//       result = await backupModel.generateContent(finalPrompt);
//     }


//     // Convert string → JSON
//     const response = await result.response;
//     const AiResult = response.text();

//     const VideoContentJson = JSON.parse(
//       AiResult.replace(/```json/g, "")
//         .replace(/```/g, "")
//         .trim() || "[]"
//     );
// 


  // Audio file generation using TTS for Narration
    
  const VideoContentJson = VideoSlidesDummy;
  for(let i =0 ; i< VideoContentJson?.length; i++){
    const narration = VideoContentJson[i].narration.fullText;
    const fonadaResult = await axios.post('https://api.fonada.ai/tts/generate-audio-large', {
      input: narration,
      voice:'Pancham',
      languages:'English'
    },
    {
      headers:{
        "Content-Type":"application/json",
        Authorization:`Bearer ${process.env.FONADALAB_API_KEY}`
    },
    responseType:'arraybuffer',
    timeout:120000

  })
   const audioBuffer = Buffer.from(fonadaResult.data);
   console.log(audioBuffer);

  }



    // Storage Audio file in cloud storage (AWS S3 / Google Cloud)

    // Generate Captions for the Audio

    // Save Everything to Database


     // Return Response
    return NextResponse.json(VideoContentJson);

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

const SaveAudioToStorage = async(audioBuffer:Buffer,fileName:string)=>{

  //Implement cloud storage saving logic here
  //azure storage account 
}
