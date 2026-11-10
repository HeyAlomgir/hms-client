
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    FiUsers,
    FiUserCheck,
    FiCalendar,
    FiStar,
} from "react-icons/fi";

interface StatsData {
    totalPatients: number;
    totalDoctors: number;
    totalAppointments: number;
    avgRating: number;
}

function StatItem({
    icon,
    value,
    label,
    delay,
}: {
    icon: React.ReactNode;
    value: string;
    label: string;
    delay: number;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{
                duration: 0.5,
                delay,
                ease: "easeOut",
            }}
            whileHover={{ y: -5, scale: 1.02 }}
            className="group flex cursor-default flex-col items-center gap-2 rounded-xl border border-slate-700/60 bg-slate-800/70 px-4 py-6 text-center transition-all duration-300 hover:border-cyan-400/30 hover:bg-slate-800"
        >
            <motion.div
                whileHover={{ scale: 1.15, rotate: 5 }}
                transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 15,
                }}
                className="mb-1 flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-400/10 bg-cyan-500/10 text-cyan-400 transition-colors duration-300 group-hover:border-cyan-400/30 group-hover:bg-cyan-500/15 sm:h-12 sm:w-12"
            >
                {icon}
            </motion.div>

            <p className="text-2xl font-bold tracking-tight text-white transition-colors duration-300 group-hover:text-cyan-300 sm:text-3xl">
                {value}
            </p>

            <p className="text-xs font-medium text-slate-400 sm:text-sm">
                {label}
            </p>
        </motion.div>
    );
}

export default function PlatformStats() {
    const [stats, setStats] = useState<StatsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/admin-analytics`,
                    {
                        cache: "no-store",
                    }
                );

                if (!res.ok) {
                    throw new Error("Failed to fetch platform statistics");
                }

                const result = await res.json();

                if (!result.success || !result.data) {
                    throw new Error("Invalid analytics response");
                }

                setStats({
                    totalPatients: result.data.totalPatients ?? 0,
                    totalDoctors: result.data.totalDoctors ?? 0,
                    totalAppointments: result.data.totalAppointments ?? 0,
                    avgRating: result.data.avgRating ?? 0,
                });
            } catch (error) {
                console.error("Platform Stats Error:", error);
            } finally {
                setLoading(false);
            }
        };

        loadStats();
    }, []);

    // Loading State
    if (loading) {
        return (
            <section className="w-full px-3 py-8 sm:px-6">
                <div className="container mx-auto grid grid-cols-2 overflow-hidden rounded-2xl border border-slate-700/70 bg-slate-900/90 shadow-xl shadow-black/20 sm:grid-cols-4">
                    {[1, 2, 3, 4].map((item) => (
                        <div
                            key={item}
                            className="flex flex-col items-center gap-3 border-b border-r border-slate-700/60 px-4 py-6"
                        >
                            <div className="h-12 w-12 animate-pulse rounded-xl bg-slate-700/70" />
                            <div className="h-7 w-20 animate-pulse rounded bg-slate-700/70" />
                            <div className="h-4 w-24 animate-pulse rounded bg-slate-700/70" />
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    // Empty / Error State
    if (!stats) {
        return null;
    }

    return (
        <section className="w-full px-3 py-8 sm:px-6 sm:py-10">
            <div className="container mx-auto overflow-hidden rounded-2xl border border-slate-700/70 bg-slate-900/90 shadow-xl shadow-black/20">
                <div className="grid grid-cols-2 divide-x divide-y divide-slate-700/60 sm:grid-cols-4 sm:divide-y-0">

                    <StatItem
                        icon={<FiUserCheck size={20} />}
                        value={`${stats.totalDoctors.toLocaleString()}+`}
                        label="Verified Doctors"
                        delay={0}
                    />

                    <StatItem
                        icon={<FiUsers size={20} />}
                        value={`${stats.totalPatients.toLocaleString()}+`}
                        label="Patients Served"
                        delay={0.1}
                    />

                    <StatItem
                        icon={<FiCalendar size={20} />}
                        value={`${stats.totalAppointments.toLocaleString()}+`}
                        label="Appointments Booked"
                        delay={0.2}
                    />

                    <StatItem
                        icon={<FiStar size={20} />}
                        value={
                            stats.avgRating > 0
                                ? `${stats.avgRating.toFixed(1)}/5`
                                : "New"
                        }
                        label="Average Rating"
                        delay={0.3}
                    />

                </div>
            </div>
        </section>
    );
}
