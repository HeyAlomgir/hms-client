"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FiClock, FiChevronLeft, FiChevronRight, FiArrowRight } from "react-icons/fi";

interface Doctor {
    _id: string;
    name: string;
    image: string;
    specialization: string;
    description?: string;
    consultationFee?: string | number;
    startTime?: string | null;
    endTime?: string | null;
    status?: string;
}

function useHorizontalScroll() {
    const ref = useRef<HTMLDivElement>(null);

    const scroll = (dir: "left" | "right") => {
        if (!ref.current) return;
        const amount = ref.current.clientWidth;
        ref.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
    };

    return { ref, scroll };
}

export default function Hero() {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const slider = useHorizontalScroll();

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/doctors`);
                const data: Doctor[] = await res.json();
                setDoctors(data.filter((d) => d.status === "approved"));
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    return (
        <section className="w-full px-3 sm:px-6 pt-6 sm:pt-8">
            <div className="max-w-7xl mx-auto">

                {/* Hero text — fade-in + slide-up */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="text-center mb-6 sm:mb-8"
                >
                    <h1 className="text-2xl sm:text-4xl font-bold mb-2 text-white">
                        Find the Right Doctor, <span className="text-blue-400">Book Instantly</span>
                    </h1>
                    <p className="text-neutral-400 text-sm sm:text-base max-w-xl mx-auto">
                        Browse verified doctors, check their availability, and book an appointment in minutes.
                    </p>
                </motion.div>

                {loading ? (
                    <div className="h-72 sm:h-[420px] rounded-2xl bg-neutral-900 animate-pulse" />
                ) : doctors.length === 0 ? (
                    <p className="text-center text-neutral-500 text-sm">No doctors available yet.</p>
                ) : (
                    <div className="relative">
                        <div
                            ref={slider.ref}
                            className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide"
                        >
                            {doctors.map((doc, index) => (
                                <motion.div
                                    key={doc._id}
                                    initial={{ opacity: 0, y: 24 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        duration: 0.5,
                                        delay: 0.15 + index * 0.08,
                                        ease: "easeOut",
                                    }}
                                    whileHover={{ y: -4 }}
                                    className="snap-center shrink-0 w-full rounded-2xl overflow-hidden
                                               border border-white/10 bg-neutral-900
                                               flex flex-col-reverse sm:flex-row
                                               h-auto sm:h-[420px]
                                               transition-shadow hover:shadow-xl hover:shadow-blue-500/10"
                                >
                                    {/* left side text */}
                                    <div className="flex-1 flex flex-col justify-center px-5 sm:px-10 py-6 sm:py-0 min-w-0">
                                        <span className="inline-block w-fit text-[11px] uppercase tracking-wide text-blue-400 font-semibold bg-blue-500/10 px-2.5 py-1 rounded-full mb-3">
                                            {doc.specialization}
                                        </span>

                                        <h2 className="text-xl sm:text-3xl font-bold mb-2 text-white">
                                            {doc.name}
                                        </h2>

                                        {doc.description && (
                                            <p className="text-neutral-400 text-xs sm:text-sm mb-4 line-clamp-3 max-w-sm">
                                                {doc.description}
                                            </p>
                                        )}

                                        <div className="flex items-center flex-wrap gap-4 mb-5">
                                            {(doc.startTime || doc.endTime) && (
                                                <div className="flex items-center gap-1.5 text-neutral-300 text-xs sm:text-sm">
                                                    <FiClock size={13} />
                                                    {doc.startTime} - {doc.endTime}
                                                </div>
                                            )}
                                            {doc.consultationFee && (
                                                <div className="text-neutral-300 text-xs sm:text-sm">
                                                    Fee: {doc.consultationFee}৳
                                                </div>
                                            )}
                                        </div>

                                        <motion.div whileTap={{ scale: 0.96 }} className="w-fit">
                                            <Link
                                                href={`/doctors/${doc._id}`}
                                                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
                                            >
                                                Book Appointment <FiArrowRight size={14} />
                                            </Link>
                                        </motion.div>
                                    </div>

                                    {/* right side img */}
                                    <div className="w-full sm:w-[45%] h-56 sm:h-full shrink-0 bg-neutral-800 overflow-hidden">
                                        <motion.img
                                            src={doc.image}
                                            alt={doc.name}
                                            referrerPolicy="no-referrer"
                                            initial={{ scale: 1.08 }}
                                            animate={{ scale: 1 }}
                                            transition={{ duration: 0.7, ease: "easeOut" }}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Navigation buttons */}
                        <motion.button
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.92 }}
                            onClick={() => slider.scroll("left")}
                            className="absolute left-2 sm:-left-4 top-1/2 -translate-y-1/2 h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-black/60 hover:bg-black/80 border border-white/10 flex items-center justify-center backdrop-blur-sm z-20"
                        >
                            <FiChevronLeft size={18} className="text-white" />
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.92 }}
                            onClick={() => slider.scroll("right")}
                            className="absolute right-2 sm:-right-4 top-1/2 -translate-y-1/2 h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-black/60 hover:bg-black/80 border border-white/10 flex items-center justify-center backdrop-blur-sm z-20"
                        >
                            <FiChevronRight size={18} className="text-white" />
                        </motion.button>

                        {/* Dots indicator */}
                        <div className="flex justify-center gap-1.5 mt-4">
                            {doctors.map((doc) => (
                                <div
                                    key={doc._id}
                                    className="h-1.5 w-1.5 rounded-full bg-white/20"
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}