"use client";

import CTABanner from "@/components/CTABanner";
import DoctorsShowcase from "@/components/DoctorShowcase";
import FAQSection from "@/components/FAQSection";
import Hero from "@/components/Hero";
import PlatformStats from "@/components/PlatformStats";
import SpecializationsGrid from "@/components/SpecializationsGrid";
import Testimonials from "@/components/Testmonials";
import TopRatedDoctors from "@/components/TopRatedDoctors";


export default function HomePage() {
  

    return (
        <div className=" min-h-screen  text-white">

            {/* ================= HERO BANNER SLIDER ================= */}
            <section className="w-full px-3 sm:px-6 pt-6 sm:pt-8">
                <Hero/>
                <DoctorsShowcase/>
                <PlatformStats/>
                <SpecializationsGrid/>
                {/* <HowItWorks/> */}
                <TopRatedDoctors/>
                <Testimonials/>
                <CTABanner/>
                <FAQSection/>
            </section>
        </div>
    );
}