import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Course } from "@/type/CourseType";
import {
  Calendar,
  Layers,
  Play,
  Clock3,
  Sparkles,
} from "lucide-react";
import moment from "moment";
import Link from "next/link";

type Props = {
  courseItem: Course;
};

function CourseListCard({ courseItem }: Props) {
  console.log("COURSE ITEM:", courseItem);
  return (
    <Card
      className="
    group
    relative
    overflow-hidden
    rounded-3xl
    border
    border-gray-200
    bg-white
    shadow-sm
    hover:shadow-2xl
    hover:-translate-y-1
    transition-all
    duration-300
    z-1
  "
    >
      {/* Top Gradient */}
      <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-blue-600 to-purple-600" />

      {/* Reduced padding */}
      <CardContent className="p-4">

        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            {/* Smaller title spacing */}
            <h2 className="text-lg font-bold text-gray-900 line-clamp-1">
              {courseItem?.courseName}
            </h2>

            {/* Reduced margin */}
            <p className="mt-1 text-sm text-gray-500 line-clamp-1">
              AI generated learning course tailored for your goals.
            </p>
          </div>

          {/* Smaller badge */}
          <div
            className="
          shrink-0
          rounded-full
          bg-blue-100
          text-blue-700
          px-2 py-1
          text-[11px]
          font-semibold
          border
          border-blue-200
        "
          >

            {courseItem?.courseLayout?.level}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 flex flex-wrap gap-2">

          <div
            className="
          flex items-center gap-1
          rounded-lg
          bg-gray-100
          px-2 py-1
          text-xs text-gray-700
        "
          >
            <Layers className="h-3.5 w-3.5 text-blue-600" />
            <span>
              {courseItem?.courseLayout?.totalChapters} Chapters
            </span>
          </div>

          <div
            className="
          flex items-center gap-1
          rounded-lg
          bg-gray-100
          px-2 py-1
          text-xs text-gray-700
        "
          >
            <Calendar className="h-3.5 w-3.5 text-purple-600" />
            <span>
              {moment(courseItem?.createdAt).format("MMM DD, YYYY")}
            </span>
          </div>

          <div
            className="
          flex items-center gap-1
          rounded-lg
          bg-gray-100
          px-2 py-1
          text-xs text-gray-700
        "
          >
            <Clock3 className="h-3.5 w-3.5 text-orange-500" />
            <span>
              {moment(courseItem?.createdAt).fromNow()}
            </span>
          </div>
        </div>

        {/* Smaller divider */}
        <div className="my-4 border-t border-gray-100" />

        {/* Footer */}
        <div className="flex items-center justify-between">

          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Sparkles className="h-3.5 w-3.5 text-yellow-500" />
            Keep Learning...
          </div>

          <Link href={"/course/" + courseItem?.courseId}>
            <Button
              size="sm"
              className="
            rounded-lg
            px-4
            bg-gradient-to-r
            from-blue-600
            to-purple-600
            hover:opacity-90
            transition-all
            shadow-md
          "
            >
              Watch
              <Play className="ml-1 h-3.5 w-3.5 fill-white" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default CourseListCard;