"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Course } from "@/type/CourseType";
import { Player } from "@remotion/player";
import { Dot } from "lucide-react";
import React from "react";
import { CourseComposition } from "./ChapterVideo";

type Props = {
  course: Course | undefined;
  durationBySlideId: Record<string, number> | null;
};

function CourseChapters({
  course,
  durationBySlideId,
}: Props) {
  const slides =
    course?.chapterContentSlides || [];

  const GetChapterDurationInFrames = (
    chapterId: string
  ) => {
    if (!durationBySlideId || !course)
      return 30;

    const total = slides
      .filter(
        (slide) =>
          slide.chapterId === chapterId
      )
      .reduce(
        (sum, slide) =>
          sum +
          (durationBySlideId[
            slide.slideId
          ] ?? 30),
        0
      );

    // FIX → Remotion must be > 0
    return Math.max(30, total);
  };

  return (
    <div
      className="
      max-w-6xl -mt-5 p-10
      border rounded-3xl shadow
      w-full bg-background/80 backdrop-blur
    "
    >
      <div className="flex justify-between items-center">
        <h2 className="font-bold text-2xl">
          Course Preview
        </h2>

        <h2 className="text-sm text-muted-foreground">
          Chapters and Short preview
        </h2>
      </div>

      <div className="mt-5">
        {course?.courseLayout?.chapters.map(
          (chapter, index) => {
            const chapterSlides =
              slides.filter(
                (slide) =>
                  slide.chapterId ===
                  chapter.chapterId
              );

            return (
              <Card
                className="mb-5"
                key={index}
              >
                <CardHeader>
                  <div className="flex gap-3 items-center">
                    <h2
                      className="
                      p-2 bg-primary/40
                      inline-flex h-10 w-10
                      text-center rounded-2xl
                      justify-center
                    "
                    >
                      {index + 1}
                    </h2>

                    <CardTitle className="md:text-xl text-base">
                      {chapter.chapterTitle}
                    </CardTitle>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      {chapter?.subContent.map(
                        (
                          content,
                          index
                        ) => (
                          <div
                            className="
                            flex gap-2
                            items-center mt-2
                          "
                            key={index}
                          >
                            <Dot className="h-5 w-5 text-primary" />
                            <h2>
                              {content}
                            </h2>
                          </div>
                        )
                      )}
                    </div>

                    <div className="overflow-hidden rounded-xl border">
                      <Player
                        component={
                          CourseComposition
                        }
                        inputProps={{
                          slides:
                            chapterSlides,
                          durationsBySlideId:
                            durationBySlideId ??
                            {},
                        }}
                        durationInFrames={Math.max(
                          30,
                          GetChapterDurationInFrames(
                            chapter.chapterId
                          )
                        )}
                        compositionWidth={
                          1280
                        }
                        compositionHeight={
                          720
                        }
                        fps={30}
                        controls
                        style={{
                          width:
                            "100%",
                          height:
                            "180px",
                          aspectRatio:
                            "16/9",
                        }}
                      />
                    </div>
                  </div>

                  <div className="mt-3 text-sm text-muted-foreground">
                    Duration:{" "}
                    {Math.ceil(
                      GetChapterDurationInFrames(
                        chapter.chapterId
                      ) / 30
                    )}{" "}
                    sec
                  </div>
                </CardContent>
              </Card>
            );
          }
        )}
      </div>
    </div>
  );
}

export default CourseChapters;