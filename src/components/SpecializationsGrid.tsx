
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
    FaHeartbeat,
    FaTooth,
    FaBrain,
    FaBaby,
    FaBone,
    FaEye,
    FaLungs,
    FaAllergies,
    FaStethoscope,
    FaArrowRight,
} from "react-icons/fa";

interface Doctor {
    _id?: string;
    specialization: string;
    status?: string;
}

interface SpecializationItem {
    name: string;
    count: number;
}

const ICON_MAP: Record<string, React.ReactNode> = {
    cardiology: <FaHeartbeat />,
    dental: <FaTooth />,
    "dental surgery": <FaTooth />,
    neurology: <FaBrain />,
    pediatrics: <FaBaby />,
    orthopedics: <FaBone />,
    ophthalmology: <FaEye />,
    pulmonology: <FaLungs />,
    "internal medicine": <FaAllergies />,
};

function getIcon(name: string) {
    return ICON_MAP[name.toLowerCase().trim()] || <FaStethoscope />;
}

export default function SpecializationsGrid() {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const controller = new AbortController();

        const loadDoctors = async () => {
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/doctors`,
                    { signal: controller.signal }
                );

                if (!res.ok) {
                    throw new Error("Failed to fetch doctors");
                }

                const data = await res.json();

                const doctorList = Array.isArray(data)
                    ? data
                    : Array.isArray(data.data)
                        ? data.data
                        : [];

                setDoctors(doctorList);
            } catch (err) {
                if (err instanceof Error && err.name === "AbortError") return;

                console.error("Specializations API Error:", err);
                setError(true);
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        loadDoctors();

        return () => controller.abort();
    }, []);

    const specializations = useMemo<SpecializationItem[]>(() => {
        const map = new Map<string, number>();

        doctors.forEach((doctor) => {
            if (doctor.status !== "approved" || !doctor.specialization?.trim()) {
                return;
            }

            const name = doctor.specialization.trim();
            map.set(name, (map.get(name) || 0) + 1);
        });

        return Array.from(map.entries())
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);
    }, [doctors]);

    if (loading) {
        return (
            <section className="w-full px-4 py-16 sm:px-6 lg:px-8">
                <div className="container mx-auto">
                    <div className="mb-8 h-10 w-64 animate-pulse rounded-lg bg-white/5" />
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                        {Array.from({ length: 8 }).map((_, index) => (
                            <div
                                key={index}
                                className="h-44 animate-pulse rounded-2xl bg-white/5"
                            />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="w-full px-4 py-16 sm:px-6 lg:px-8">
                <div className="container mx-auto text-center text-sm text-neutral-400">
                    Unable to load specializations. Please try again later.
                </div>
            </section>
        );
    }

    if (!specializations.length) return null;

    return (
        <section className="relative w-full overflow-hidden px-4 py-16 sm:px-6 sm:py-20 lg:px-8">

            {/* Subtle Background Decoration */}
            <div className="pointer-events-none absolute -left-32 top-10 h-72 w-72 rounded-full bg-cyan-500/[0.06] blur-[100px]" />
            <div className="pointer-events-none absolute -right-32 bottom-0 h-72 w-72 rounded-full bg-blue-500/[0.06] blur-[100px]" />

            <div className="container relative mx-auto">

                {/* Section Heading */}
                <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                    <div>
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5">
                            <FaStethoscope className="text-xs text-cyan-400" />
                            <span className="text-[11px] font-semibold tracking-widest text-cyan-300">
                                MEDICAL DEPARTMENTS
                            </span>
                        </div>

                        <h2 className="text-2xl font-bold leading-tight text-white sm:text-3xl lg:text-4xl">
                            Explore Our{" "}
                            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                                Specializations
                            </span>
                        </h2>

                        <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-400 sm:text-base">
                            Find experienced medical professionals across our
                            specialized healthcare departments.
                        </p>
                    </div>

                    <Link
                        href="/doctors"
                        className="group inline-flex w-fit items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-5 py-3 text-sm font-semibold text-cyan-300 transition-colors hover:border-cyan-400/50 hover:bg-cyan-400/15"
                    >
                        All Doctors
                        <FaArrowRight className="text-xs transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>

                {/* Specialization Cards */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 md:grid-cols-4 lg:gap-6">
                    {specializations.map((spec) => (
                        <Link
                            key={spec.name}
                            href={`/doctors?specialization=${encodeURIComponent(spec.name)}`}
                            className="group relative flex min-h-[190px] flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#17263c] via-[#111c30] to-[#0c1729] p-5 shadow-[0_8px_0_0_rgba(0,0,0,0.18),0_14px_30px_rgba(0,0,0,0.20)] transition-all duration-300 hover:-translate-y-1.5 hover:border-cyan-400/30 hover:shadow-[0_10px_0_0_rgba(0,0,0,0.18),0_20px_35px_rgba(6,182,212,0.10)] sm:min-h-[210px] sm:p-6"
                        >
                            {/* Decorative Corner */}
                            <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full border border-white/[0.04] transition-transform duration-500 group-hover:scale-110" />

                            {/* Icon 3D Box */}
                            <div className="relative mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-300/20 bg-gradient-to-br from-cyan-400/20 to-blue-600/20 text-2xl text-cyan-300 shadow-[0_5px_0_0_rgba(8,145,178,0.18),0_10px_20px_rgba(0,0,0,0.25)] transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_7px_0_0_rgba(8,145,178,0.20),0_14px_25px_rgba(6,182,212,0.15)]">
                                {getIcon(spec.name)}
                            </div>

                            {/* Specialization Name */}
                            <h3 className="relative text-sm font-bold text-white transition-colors group-hover:text-cyan-300 sm:text-base">
                                {spec.name}
                            </h3>

                            {/* Doctor Count */}
                            <div className="mt-2 flex items-center justify-between">
                                <span className="text-xs text-neutral-400">
                                    {spec.count} {spec.count === 1 ? "Doctor" : "Doctors"}
                                </span>

                                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-neutral-400 transition-all group-hover:border-cyan-400/30 group-hover:bg-cyan-400/10 group-hover:text-cyan-300">
                                    <FaArrowRight className="text-[10px]" />
                                </span>
                            </div>

                            {/* Bottom Accent */}
                            <div className="absolute bottom-0 left-5 right-5 h-px bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent transition-all duration-300 group-hover:via-cyan-400/70" />
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
