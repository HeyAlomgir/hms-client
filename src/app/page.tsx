"use client";

import Hero from "@/components/Hero";


export default function HomePage() {
  

    return (
        <div className=" min-h-screen bg-neutral-950 text-white">

            {/* ================= HERO BANNER SLIDER ================= */}
            <section className="w-full px-3 sm:px-6 pt-6 sm:pt-8">
                <Hero/>
            </section>
        </div>
    );
}