"use client";
import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { Course } from '@/type/CourseType';
import CourseListCard from './CourseListCard';

export default function Courselist() {
  const[courseList,setCourseList]=useState<Course[]>([]);
  useEffect(() => {
      GetCourseList();
  },[] )
  const GetCourseList = async () => {
    const result = await axios.get('/api/course');
    console.log(result.data);
    setCourseList(result.data);
    console.log("COURSES:", courseList);
  }
  return (
    <div className='max-w-6xl mt-10'>
      <h2 className='font-bold text-2xl'>My Courses</h2>
      
      <div className='grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-5 mt-5'>
        {courseList.map((course,index)=>(
          <CourseListCard courseItem={course} key={index}/>
          ))}
      </div>
    </div>
  )
}
