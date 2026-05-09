
"use client";

import React, {
  useEffect,
  useState,
} from "react";
import CourseInfoCard from "./_components/CourseInfoCard";
import { useParams } from "next/navigation";
import axios from "axios";
import { Course } from "@/type/CourseType";
import CourseChapters from "./_components/CourseChapters";
import { toast } from "sonner";
import { getAudioData } from "@remotion/media-utils";

function CoursePreview() {
  const { courseId } = useParams();

  const [courseDetail, setCourseDetail] =
    useState<Course>();

  const [isGenerating, setIsGenerating] =
    useState(false);

  const fps = 30;
  const slides =
    courseDetail?.chapterContentSlides ??
    [];

  const [
    durationBySlideId,
    setDurationBySlideId,
  ] = useState<
    Record<string, number> | null
  >(null);

  useEffect(() => {
    if (courseId) {
      GetCourseDetail();
    }
  }, [courseId]);

  // =========================
  // FETCH COURSE
  // =========================
  const GetCourseDetail =
    async () => {
      const loadingToast =
        toast.loading(
          "Fetching Course Details..."
        );

      try {
        const result =
          await axios.get(
            "/api/course?courseId=" +
            courseId
          );

        setCourseDetail(result.data);

        toast.success(
          "Course Details Fetched Successfully!",
          {
            id: loadingToast,
          }
        );

        // Handled by Hero component now
        // if (
        //   result?.data
        //     ?.chapterContentSlides
        //     ?.length === 0 &&
        //   !isGenerating
        // ) {
        //   GenerateVideoContent(
        //     result.data
        //   );
        // }
      } catch (error) {
        console.error(error);

        toast.error(
          "Failed to fetch course",
          {
            id: loadingToast,
          }
        );
      }
    };

  // =========================
  // GENERATE
  // =========================
  const GenerateVideoContent =
    async (course: Course) => {
      if (
        !course?.courseLayout?.chapters
          ?.length
      )
        return;

      setIsGenerating(true);

      for (
        let i = 0;
        i <
        course.courseLayout.chapters
          .length;
        i++
      ) {
        const chapter =
          course.courseLayout.chapters[
          i
          ];

        // skip generated chapter
        const alreadyExists =
          course.chapterContentSlides?.some(
            (slide) =>
              slide.chapterId ===
              chapter.chapterId
          );

        if (alreadyExists) {
          console.log(
            "Skip:",
            chapter.chapterTitle
          );
          continue;
        }

        const toastLoading =
          toast.loading(
            `Generating Chapter ${i + 1
            }...`
          );

        try {
          await axios.post(
            "/api/generate-video-content",
            {
              chapter,
              courseId:
                course.courseId,
            }
          );

          toast.success(
            `Chapter ${i + 1
            } Generated`,
            {
              id: toastLoading,
            }
          );

          // wait before next
          await new Promise(
            (r) =>
              setTimeout(r, 2000)
          );
        } catch (error) {
          console.error(error);

          toast.error(
            `Failed Chapter ${i + 1
            }`,
            {
              id: toastLoading,
            }
          );

          break;
        }
      }

      setIsGenerating(false);

      await GetCourseDetail();
    };

  // =========================
  // AUDIO DURATION
  // =========================
  useEffect(() => {
    if (!slides.length) return;

    let cancelled = false;

    const run = async () => {
      const entries: [
        string,
        number
      ][] = [];

      for (const slide of slides) {
        try {
          if (!slide.audioFileUrl) {
            entries.push([
              slide.slideId,
              1,
            ]);
            continue;
          }

          const audioData =
            await getAudioData(
              slide.audioFileUrl
            );

          const audioSec =
            audioData?.durationInSeconds ??
            0;

          const frames =
            Math.max(
              1,
              Math.ceil(
                audioSec * fps
              )
            );

          entries.push([
            slide.slideId,
            frames,
          ]);
        } catch {
          entries.push([
            slide.slideId,
            1,
          ]);
        }
      }

      if (!cancelled) {
        setDurationBySlideId(
          Object.fromEntries(
            entries
          )
        );
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [slides]);

  return (
    <div className="flex flex-col items-center">
      <CourseInfoCard
        course={courseDetail}
        durationBySlideId={
          durationBySlideId
        }
      />

      <CourseChapters
        course={courseDetail}
        durationBySlideId={
          durationBySlideId
        }
      />
    </div>
  );
}

export default CoursePreview;