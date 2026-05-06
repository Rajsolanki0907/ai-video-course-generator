// "use client"
// import React, { useEffect, useState } from 'react';
// import CourseInfoCard from './_components/CourseInfoCard';
// import { useParams } from 'next/navigation';
// import axios from 'axios';
// import { Course } from '@/type/CourseType';
// import CourseChapters from './_components/CourseChapters';
// import { toast } from 'sonner';

// function CoursePreview(){

//     const {courseId } = useParams();
//     const [courseDetail,setCourseDetail] = useState<Course>();


//     useEffect(() => {
//         courseId && GetCourseDetail();
//     }, [courseId])


//     const GetCourseDetail = async () => {
//   const loadingToast = toast.loading('Fetching Course Details...');

//   const result = await axios.get('/api/course?courseId=' + courseId);

//   console.log(result.data);
//   setCourseDetail(result.data);

//   toast.success('Course Details Fetched Successfully!', {
//     id: loadingToast
//   });

//   if (result?.data?.chapterContentSlides?.length === 0) {
//     GenerateVideoContent(result?.data);
//   }  
// }

//     const GenerateVideoContent = async(course: Course)=>{
        
//         for(let i=0;i<course?.courseLayout?.chapters?.length; i++){


//             if(i>0)break; //for testing only first chapter remove this in production
//          const toastLoading = toast.loading('Generating Video Content for chapter ' + (i + 1) + '...');

//            const result = await axios.post('/api/generate-video-content',
//             {
//                 chapter:course?.courseLayout?.chapters[0],
//                 courseId: course?.courseId
//             });

//             console.log(JSON.stringify(result.data));

//             toast.success('Video Content Generated for Chapter '+(i+1),{id:toastLoading});
//         }
       
//     }
    
//     return(
//         <div className='flex flex-col items-center'>
//             <CourseInfoCard course={courseDetail} />
//             <CourseChapters course={courseDetail} />
//         </div>
//     )
// }

// export default CoursePreview;   
"use client";

import React, { useEffect, useState } from 'react';
import CourseInfoCard from './_components/CourseInfoCard';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { Course } from '@/type/CourseType';
import CourseChapters from './_components/CourseChapters';
import { toast } from 'sonner';
import { getAudioData } from '@remotion/media-utils';

function CoursePreview() {

  const { courseId } = useParams();
  const [courseDetail, setCourseDetail] = useState<Course>();

  useEffect(() => {
    if (courseId) {
      GetCourseDetail();
    }
  }, [courseId]);

  // =========================
  // FETCH COURSE DATA
  // =========================
  const GetCourseDetail = async () => {
    const loadingToast = toast.loading('Fetching Course Details...');

    try {
      const result = await axios.get('/api/course?courseId=' + courseId);

      console.log(result.data);
      setCourseDetail(result.data);

      toast.success('Course Details Fetched Successfully!', {
        id: loadingToast
      });

      // ✅ If no slides exist → generate for ALL chapters
      if (result?.data?.chapterContentSlides?.length === 0) {
        await GenerateVideoContent(result.data);
      }

    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch course', { id: loadingToast });
    }
  };

  // =========================
  // GENERATE VIDEO CONTENT FOR ALL CHAPTERS
  // =========================
  const GenerateVideoContent = async (course: Course) => {

    if (!course?.courseLayout?.chapters?.length) return;

    for (let i = 0; i < course.courseLayout.chapters.length; i++) {

      const chapter = course.courseLayout.chapters[i]; // ✅ correct chapter

      const toastLoading = toast.loading(
        'Generating Video Content for chapter ' + (i + 1) + '...'
      );

      try {
        const result = await axios.post('/api/generate-video-content', {
          chapter: chapter, // ✅ FIXED
          courseId: course.courseId
        });

        console.log("Generated:", result.data);

        toast.success('Video Content Generated for Chapter ' + (i + 1), {
          id: toastLoading
        });

      } catch (error) {
        console.error("Error generating chapter:", i + 1, error);

        toast.error('Failed for Chapter ' + (i + 1), {
          id: toastLoading
        });
      }
    }

    // 🔄 Refresh course after generation
    GetCourseDetail();
  };
    const fps = 30;
    const slides = courseDetail?.chapterContentSlides ?? [];
    const [durationBySlideId, setDurationBySlideId] =
      useState<Record<string, number> | null>(null);
  
    useEffect(() => {
      if (!slides || slides.length === 0) return;
  
      let cancelled = false;
  
      const run = async () => {
        const entries: [string, number][] = [];
  
        for (const slide of slides) {
          try {
            if (!slide.audioFileUrl) {
              entries.push([slide.slideId, 1]);
              continue;
            }
  
            const audioData = await getAudioData(slide.audioFileUrl);
            const audioSec = audioData?.durationInSeconds ?? 0;
            const frames = Math.max(1, Math.ceil(audioSec * fps));
  
            entries.push([slide.slideId, frames]);
          } catch (err) {
            console.error("Audio failed:", slide.slideId, err);
            entries.push([slide.slideId, 1]);
          }
        }
  
        if (!cancelled) {
          setDurationBySlideId(Object.fromEntries(entries));
        }
      };
  
      run();
  
      return () => {
        cancelled = true;
      };
    }, [slides]);  

  return (
    <div className='flex flex-col items-center'>
      <CourseInfoCard course={courseDetail} durationBySlideId={durationBySlideId}/>
      <CourseChapters course={courseDetail}  durationBySlideId={durationBySlideId}/>
    </div>
  );
}

export default CoursePreview;