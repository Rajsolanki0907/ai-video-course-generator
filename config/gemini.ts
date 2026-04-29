

// import { GoogleGenerativeAI } from "@google/generative-ai";

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// export const model = genAI.getGenerativeModel({
  
//   model: "gemini-2.5-flash",
// });


// server busy fallback
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const flashModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

export const backupModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash-lite",
});