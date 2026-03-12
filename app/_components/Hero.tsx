import React from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Send } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QUICK_VIDEO_SUGGESTIONS } from "@/data/constant";

function Hero() {
  return (
    <div>
      <div>
        <h1 className="text-4xl font-bold text-center mt-20">
          Learn Smarter with
          <span className="text-blue-600"> AI Video Courses</span>
        </h1>
        <p className="text-center mt-4 text-lg text-gray-600">
          Unlock your potential with personalized AI-driven video courses. Learn
          at your own pace, anytime, anywhere.
        </p>
      </div>
      <div className="grid w-full max-w-sm gap-2 mx-auto mt-10 bg-white z-10">
        <InputGroup>
          <InputGroupTextarea
            data-slot="input-group-control"
            className="flex field-sizing-content min-h-16 w-full resize-none rounded-md bg-white px-3 py-2.5 text-base transition-[color,box-shadow] outline-none md:text-sm"
            placeholder="Autoresize textarea..."
          />

          <InputGroupAddon align="block-end">
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="full-course" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="full-course">Full- Course</SelectItem>
                  <SelectItem value="quick-explain-video">Quick Explain Video</SelectItem>
                 
                </SelectGroup>
              </SelectContent>
            </Select>
            <InputGroupButton
              className="ml-auto bg-blue-600 p-4"
              size="icon-sm"
              variant="default"
            >
              <Send />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </div>

      <div className="flex gap-5 mt-5 max-w-3xl mx-auto flex-wrap justify-center z-10">
        {QUICK_VIDEO_SUGGESTIONS.map((suggestion,index) => (
            <h2 key = {index} className="border rounded-2xl p-1 px-2 text-sm font-bold bg-white">{suggestion.title}</h2>
        ))}
      </div>
    </div>
  );
}

export default Hero;
