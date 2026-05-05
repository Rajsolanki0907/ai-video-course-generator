import { Course } from '@/type/CourseType';
import { BookOpen, ChartNoAxesColumnIncreasing, Sparkle } from 'lucide-react';
import { Player } from '@remotion/player';
import ChapterVideo from './ChapterVideo';
import { useEffect, useState } from 'react';
import {getAudioData} from '@remotion/media-utils';



// ...existing code...
type Props = {
    course : Course | undefined
}

function CourseInfoCard({course}:Props) {
    const fps=30;
    const slides=course?.chapterContentSlides??[];
    const[durationBySlideId,setDurationBySlideId]=useState<Record<string,number>|null>(null);
// useEffect(() => {
//     let cancelled = false;

//     const run = async () => {
//         if (slides.length === 0) return;

//         const entries = [];

//         for (const slide of slides) {
//             try {
//                 const audioData = await getAudioData(slide?.audioFileUrl);
//                 const audioSec = audioData?.durationInSeconds ?? 0;
//                 const frames = Math.max(1, Math.ceil(audioSec * fps));
//                 entries.push([slide.slideId, frames]);
//             } catch (err) {
//                 console.error("Audio fetch failed:", slide.slideId, err);
//                 entries.push([slide.slideId, 1]);
//             }
//         }

//         if (!cancelled) {
//             setDurationBySlideId(Object.fromEntries(entries));
//         }
//     };

//     run();

//     return () => {
//         cancelled = true;
//     };
// }, [slides]);
    // useEffect(()=>{
    //     let cancelled = false;
    //     const run = async()=>{
    //         if(!slides){
    //             return;
    //         }
    //         const entries = await Promise.all(
    //             slides.map(async(slide)=>{
    //                 const audioData = await getAudioData(slide?.audioFileUrl);
    //                 const audioSec = audioData?.durationInSeconds;
    //                 const frames=Math.max(1,Math.ceil(audioSec*fps));
    //                 return [slide.slideId, frames] as const;

    //             })
    //         );
    //         if(!cancelled){
    //             setDurationBySlideId(Object.fromEntries(entries));
    //         }
    //     }
    //     run();
    //     return()=>{
    //         cancelled=true;
    //     }
    // },[slides,fps]);
    // console.log("durationbySlideId: ",durationBySlideId);


    useEffect(() => {
  if (!slides || slides.length === 0) return;

  console.log("Slides received:", slides);

  let cancelled = false;

  const run = async () => {
    const entries: [string, number][] = [];

    for (const slide of slides) {
      try {
        if (!slide.audioFileUrl) {
          console.warn("Missing audio URL for:", slide.slideId);
          entries.push([slide.slideId, 1]);
          continue;
        }

        console.log("Fetching audio:", slide.audioFileUrl);

        const audioData = await getAudioData(slide.audioFileUrl);

        const audioSec = audioData?.durationInSeconds ?? 0;
        const frames = Math.max(1, Math.ceil(audioSec * 30));

        entries.push([slide.slideId, frames]);

      } catch (err) {
        console.error("Audio failed:", slide.slideId, err);
        entries.push([slide.slideId, 1]);
      }
    }

    if (!cancelled) {
      const result = Object.fromEntries(entries);
      console.log("Final Frames:", result);
      setDurationBySlideId(result);
    }
  };

  run();

  return () => {
    cancelled = true;
  };
}, [slides]);
 console.log("durationbySlideId: ",durationBySlideId);
 console.log("Slides length:", slides.length);


  return (
    <div>
        <div className='p-20 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-5
        bg-gradient-to-br from-slate-950 via-slate-800 to-emerald-950'>
            <div>
                <h2 className='flex gap-2 p-1 px-2 border rounded-2xl inline-flex text-white border-gray-200/70 '><Sparkle/>Course Preview</h2>
                <h2 className='text-4xl font-bold mt-4 text-white'>{course?.courseName}</h2>
                <p className='text-lg text-muted-foreground mt-3'>{course?.courseLayout?.courseDescription}</p>
                <div className='mt-5 flex gap-5 text-white'>
                    <h2 className='px-3 p-2 border rounded-4xl flex gap-2 items-center inline-flex'> <ChartNoAxesColumnIncreasing className='text-sky-400'/> {course?.courseLayout?.level}</h2>
                    <h2 className='px-3 p-2 border rounded-4xl flex gap-2 items-center inline-flex'> <BookOpen className='text-green-400'/> {course?.courseLayout?.totalChapters} Chapters</h2>

                </div>
            </div>

            <div className="border-2 border-white/10 rounded-2xl">
                <Player 
                component={ChapterVideo}
                durationInFrames={30}
                compositionWidth={1280}
                compositionHeight={720}
                fps={30}
                controls
                style={{
                    width:'100%',
                    aspectRatio:'16/9',
                }}
                />
            </div>
        </div>
    </div>
  )
}

export default CourseInfoCard