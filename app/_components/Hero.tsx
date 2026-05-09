"use client";

import React, { useState } from "react";
import { Loader } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { useUser, SignInButton } from "@clerk/nextjs";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { QUICK_VIDEO_SUGGESTIONS } from "@/data/constant";
import { useRouter } from "next/navigation";

function Hero() {
  const [userInput, setUserInput] = useState("");
  const [type, setType] = useState("full-course");
  const [loading, setLoading] = useState(false);

  const { user } = useUser();
  const router = useRouter();
  // const GenerateCourseLayout = async () => {
  //   if (!userInput) return;
  //         const toastId = toast.loading("Generating course layout...");
  //         const courseId = await crypto.randomUUID();


  //   try {
  //     setLoading(true);
  //     const result = await axios.post("/api/generate-course-layout", {
  //       userInput,
  //       type,
  //       courseId: courseId
  //     });
  //     console.log(result.data);
      
  //     //payment gateway integration pending
  //     if(result?.data?.msg === "max limit"){
  //       toast.error("maximum limit of free courses. Please upgrade to a paid plan to create more courses.", { id: toastId });
  //        return;
  //     }



  //     toast.success("Course generated!", { id: toastId });

  //     //navigate to course page
  //     router.push('/course/' + courseId);
      
      
  //   } catch (error) {
  //     console.error(error);
  //     toast.error("Something went wrong", { id: toastId });
  //   } finally {
  //     setLoading(false);
  //   }
  // };


  const GenerateCourseLayout = async () => {
  // if (!userInput) return;

  
  

   if (!userInput.trim()) {
    toast.error("Prompt is required");
    return;
  }

  const toastId = toast.loading("Generating course layout...");
  const courseId = crypto.randomUUID();

  try {
    setLoading(true);

    const result = await axios.post("/api/generate-course-layout", {
      userInput,
      type,
      courseId,
    });

    const course = result.data;
    const chapters = course?.courseLayout?.chapters || [];

    console.log("Course generated:", course.courseId);
    console.log("Chapters to process:", chapters.length);

    let allGenerated = true;

    // Loop through chapters to generate video content
    for (let i = 0; i < chapters.length; i++) {
      const chapter = chapters[i];
      console.log(`Processing Chapter ${i + 1}:`, chapter.chapterTitle);
      
      toast.loading(`Generating Chapter ${i + 1} of ${chapters.length}...`, {
        id: toastId,
      });

      try {
        await axios.post("/api/generate-video-content", {
          chapter,
          courseId: course.courseId,
        });

        console.log(`Chapter ${i + 1} Success`);

        // Small delay to prevent hitting rate limits or overlapping processes
        await new Promise((r) => setTimeout(r, 2000));
      } catch (err) {
        console.error(`Failed to generate chapter ${i + 1}:`, err);
        toast.error(`Failed at Chapter ${i + 1}`, { id: toastId });
        allGenerated = false;
        break;
      }
    }

    if (allGenerated) {
      toast.success("Course and content generated!", { id: toastId });
      console.log("All chapters generated. Redirecting...");
      // navigate to course page
      router.push("/course/" + courseId);
    } else {
      console.error("Generation failed or was interrupted.");
      setLoading(false);
    }

  } catch (error: any) {
    console.error(error);

    // FREE PLAN LIMIT
    if (error?.response?.status === 403) {
      toast.error(
        "You can only generate 2 courses on the free plan. Upgrade to continue.",
        { id: toastId }
      );

      setTimeout(() => {
        router.push("/pricing");
      }, 1500);

      return;
    }

    toast.error("Something went wrong", { id: toastId });

  } finally {
    setLoading(false);
  }
};
  return (
    <div className="relative z-50">
      {/* Heading */}
      <div>
        <h1 className="text-4xl font-bold text-center mt-20">
          Learn Smarter with{" "}
          <span className="text-blue-600">AI Video Courses</span>
        </h1>

        <p className="text-center mt-4 text-lg text-gray-600">
          Unlock your potential with personalized AI-driven video courses.
          Learn at your own pace, anytime, anywhere.
        </p>
      </div>

      {/* Input Section */}
      <div className="flex items-center gap-3 w-full max-w-2xl mx-auto mt-10 bg-white p-4 rounded-xl shadow-md">

        {/* TEXTAREA */}
        <textarea
          className="flex-1 min-h-[60px] resize-none outline-none px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Write your prompt here..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
        />

        {/* SELECT */}
        <Select value={type} onValueChange={(value) => setType(value)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="full-course" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="full-course">Full Course</SelectItem>
            <SelectItem value="quick-explain-video">
              Quick Explain
            </SelectItem>
          </SelectContent>
        </Select>

        {/* BUTTON */}
        {user ? (
          <button
            onClick={GenerateCourseLayout}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center"
          >
            {loading ? <Loader className="animate-spin" /> : "Generate"}
          </button>
        ) : (
          <SignInButton mode="modal">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
              Sign In
            </button>
          </SignInButton>
        )}
      </div>

      {/* Suggestions */}
      <div className="flex gap-3 mt-6 max-w-3xl mx-auto flex-wrap justify-center">
        {QUICK_VIDEO_SUGGESTIONS.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => setUserInput(suggestion.prompt)}
            className="border rounded-2xl cursor-pointer p-2 px-3 text-sm font-semibold bg-white hover:bg-gray-100 transition"
          >
            {suggestion.title}
          </button>
        ))}
      </div>
    </div>
  );
}

export default Hero;