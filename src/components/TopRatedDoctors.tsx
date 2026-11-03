
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaStar, FaArrowRight } from "react-icons/fa";

interface TopDoctor {
    _id: string;
    name: string;
    image: string;
    specialization: string;
    avgRating: number;
    totalReviews: number;
}

function DoctorImage({ src, name }: { src?: string; name?: string }) {
    const [error, setError] = useState(false);

    const initials =
        name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "?";

    if (!src || error) {
        return (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-cyan-500/20 to-blue-600/20 text-3xl font-bold text-cyan-300">
                {initials}
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={name || "Doctor"}
            referrerPolicy="no-referrer"
            onError={() => setError(true)}
            className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
        />
    );
}

export default function TopRatedDoctors() {
    const [doctors, setDoctors] = useState<TopDoctor[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDoctors = async () => {
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/top-doctors`
                );

                if (!res.ok) {
                    throw new Error("Failed to load top doctors");
                }

                const data = await res.json();
                setDoctors(Array.isArray(data.data) ? data.data : []);
            } catch (error) {
                console.error("Top doctors error:", error);
            } finally {
                setLoading(false);
            }
        };

        loadDoctors();
    }, []);

    if (loading) {
        return (
            <section className="w-full px-4 py-16 sm:px-6 lg:px-8">
                <div className="container mx-auto">
                    <div className="mb-8 h-12 w-64 animate-pulse rounded-xl bg-white/5" />
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <div
                                key={index}
                                className="h-64 animate-pulse rounded-2xl border border-white/5 bg-white/5"
                            />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (doctors.length === 0) return null;

    return (
        <section className="relative w-full overflow-hidden px-4 py-16 sm:px-6 sm:py-20 lg:px-8">

            {/* Background Effects */}
            <div className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-cyan-500/10 blur-[120px]" />
            <div className="pointer-events-none absolute -right-32 bottom-10 h-72 w-72 rounded-full bg-blue-600/10 blur-[120px]" />

            <div className="container relative mx-auto">

                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 25 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"
                >
                    <div>
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2">
                            <FaStar className="text-xs text-amber-400" />
                            <span className="text-xs font-semibold tracking-wider text-cyan-300">
                                TRUSTED SPECIALISTS
                            </span>
                        </div>

                        <h2 className="text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
                            Our Top Rated{" "}
                            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                                Doctors
                            </span>
                        </h2>

                        <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-400 sm:text-base">
                            Meet our highly experienced doctors, trusted and rated
                            by patients for their excellent care.
                        </p>
                    </div>

                    <Link
                        href="/doctors"
                        className="group inline-flex w-fit items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-5 py-3 text-sm font-semibold text-cyan-300 transition-all duration-300 hover:border-cyan-400/50 hover:bg-cyan-400/20"
                    >
                        View All Doctors
                        <FaArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                </motion.div>

                {/* Doctors Grid */}
                <div
                    className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-6"
                    style={{ perspective: "1200px" }}
                >
                    {doctors.map((doc, index) => (
                        <motion.div
                            key={doc._id}
                            initial={{ opacity: 0, y: 35, rotateX: 8 }}
                            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                            viewport={{ once: true, amount: 0.15 }}
                            transition={{
                                duration: 0.55,
                                delay: index * 0.07,
                                ease: "easeOut",
                            }}
                            whileHover={{
                                y: -10,
                                rotateX: 4,
                                rotateY: -3,
                                scale: 1.025,
                                transition: { duration: 0.3 },
                            }}
                            className="group relative h-full"
                            style={{
                                transformStyle: "preserve-3d",
                            }}
                        >
                            {/* Glow */}
                            <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-cyan-400/0 via-blue-500/0 to-cyan-400/0 opacity-0 blur-sm transition duration-500 group-hover:from-cyan-400/50 group-hover:via-blue-500/30 group-hover:to-cyan-400/50 group-hover:opacity-100" />

                            <Link
                                href={`/doctors/${doc._id}`}
                                className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#111c30]/95 shadow-[0_10px_30px_rgba(0,0,0,0.2)] transition-all duration-300 group-hover:border-cyan-400/40 group-hover:shadow-[0_20px_45px_rgba(6,182,212,0.12)]"
                            >
                                {/* Doctor Image */}
                                <div className="relative h-36 w-full overflow-hidden bg-slate-800 sm:h-44">
                                    <DoctorImage
                                        src={doc.image}
                                        name={doc.name}
                                    />

                                    <div className="absolute inset-0 bg-gradient-to-t from-[#111c30] via-transparent to-transparent opacity-80" />

                                    {/* Rating Badge */}
                                    <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full border border-white/10 bg-black/50 px-2.5 py-1.5 shadow-lg backdrop-blur-md">
                                        <FaStar className="text-[10px] text-amber-400" />
                                        <span className="text-xs font-bold text-white">
                                            {Number(doc.avgRating || 0).toFixed(1)}
                                        </span>
                                    </div>

                                    {/* Bottom Glow */}
                                    <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500 group-hover:w-full" />
                                </div>

                                {/* Doctor Information */}
                                <div className="flex flex-1 flex-col p-3 sm:p-4">

                                    <h3 className="truncate text-sm font-bold text-white transition-colors group-hover:text-cyan-300 sm:text-base">
                                        {doc.name}
                                    </h3>

                                    <p className="mt-1 truncate text-xs font-medium text-cyan-400 sm:text-sm">
                                        {doc.specialization}
                                    </p>

                                    <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
                                        <div className="flex items-center gap-1.5">
                                            <FaStar className="text-xs text-amber-400" />
                                            <span className="text-xs font-semibold text-neutral-200">
                                                {Number(doc.avgRating || 0).toFixed(1)}
                                            </span>
                                            <span className="text-[10px] text-neutral-500 sm:text-xs">
                                                ({doc.totalReviews || 0})
                                            </span>
                                        </div>

                                        <FaArrowRight className="text-xs text-neutral-500 transition-all duration-300 group-hover:translate-x-1 group-hover:text-cyan-400" />
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* Bottom Info */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="mt-8 text-center"
                >
                    <p className="text-xs text-neutral-500 sm:text-sm">
                        Quality healthcare starts with the right specialist.
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
