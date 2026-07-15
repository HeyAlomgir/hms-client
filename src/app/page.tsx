"use client";

import CTABanner from "@/components/CTABanner";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import PlatformStats from "@/components/PlatformStats";
import SpecializationsGrid from "@/components/SpecializationsGrid";
import Testimonials from "@/components/Testmonials";
import TopRatedDoctors from "@/components/TopRatedDoctors";


export default function HomePage() {
  

    return (
        <div className=" min-h-screen bg-neutral-950 text-white">

            {/* ================= HERO BANNER SLIDER ================= */}
            <section className="w-full px-3 sm:px-6 pt-6 sm:pt-8">
                <Hero/>
                <PlatformStats/>
                <SpecializationsGrid/>
                <HowItWorks/>
                <TopRatedDoctors/>
                <Testimonials/>
                <CTABanner/>
            </section>
        </div>
    );
}