"use client";

import React from "react"; // React ইমপোর্ট করা হয়েছে টাইপের জন্য
import { Spinner } from "@heroui/react";

export default function Loading(): React.JSX.Element {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white px-4 relative overflow-hidden">
  
      {/* Background Decorative Gradient Blob */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 sm:w-[500px] sm:h-[500px] bg-gradient-to-tr from-teal-500/10 via-blue-500/5 to-emerald-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="z-10 flex flex-col items-center gap-4">
        
        {/* HeroUI Spinner */}
        <Spinner 
          size="lg" // HeroUI বা NextUI স্পিনারের সাইজ সাধারণত 'sm', 'md', 'lg' হয় 
          color="success" 
          className="scale-125"
        />
        
        {/* Loading Text */}
        <div className="flex flex-col items-center mt-2">
          <p className="text-sm font-semibold tracking-widest uppercase bg-gradient-to-r from-teal-200 via-neutral-400 to-teal-200 bg-clip-text text-transparent animate-pulse">
            Securing Connection...
          </p>
          <span className="text-[11px] text-neutral-600 mt-1 tracking-wide">
            Loading CarePulse Medical Data
          </span>
        </div>
      </div>
    </div>
  );
}