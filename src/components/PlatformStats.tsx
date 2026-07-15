"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiUsers, FiUserCheck, FiCalendar, FiStar } from "react-icons/fi";

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
            transition={{ duration: 0.5, delay, ease: "easeOut" }}
            whileHover={{ y: -6, scale: 1.03 }}
            className="flex flex-col items-center text-center gap-2 px-4 py-6 cursor-default
                       transition-colors duration-300 hover:bg-white/[0.03]"
        >
            <motion.div
                whileHover={{ scale: 1.15, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                className="h-11 w-11 sm:h-12 sm:w-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-1"
            >
                {icon}
            </motion.div>
            <p className="text-2xl sm:text-3xl font-bold text-white">{value}</p>
            <p className="text-neutral-400 text-xs sm:text-sm">{label}</p>
        </motion.div>
    );
}

export default function PlatformStats() {
    const [stats, setStats] = useState<StatsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin-analytics`);
                const data = await res.json();
                if (data.success) setStats(data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading || !stats) {
        return (
            <section className="w-full px-3 sm:px-6 py-8">
                <div className="container mx-auto h-32 rounded-2xl bg-neutral-900 animate-pulse" />
            </section>
        );
    }

    return (
        <section className="w-full px-3 sm:px-6 py-8 sm:py-10">
            <div className="container mx-auto rounded-2xl border border-white/10 bg-neutral-900/60 overflow-hidden">
                <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-white/10">
                    <StatItem
                        icon={<FiUserCheck size={20} />}
                        value={`${stats.totalDoctors}+`}
                        label="Verified Doctors"
                        delay={0}
                    />
                    <StatItem
                        icon={<FiUsers size={20} />}
                        value={`${stats.totalPatients}+`}
                        label="Patients Served"
                        delay={0.1}
                    />
                    <StatItem
                        icon={<FiCalendar size={20} />}
                        value={`${stats.totalAppointments}+`}
                        label="Appointments Booked"
                        delay={0.2}
                    />
                    <StatItem
                        icon={<FiStar size={20} />}
                        value={stats.avgRating ? `${stats.avgRating}/5` : "New"}
                        label="Average Rating"
                        delay={0.3}
                    />
                </div>
            </div>
        </section>
    );
}