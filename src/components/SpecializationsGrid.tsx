"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
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
} from "react-icons/fa";

interface Doctor {
    specialization: string;
    status?: string;
}

interface SpecializationItem {
    name: string;
    count: number;
}

const ICON_MAP: Record<string, React.ReactNode> = {
    cardiology: <FaHeartbeat size={22} />,
    dental: <FaTooth size={22} />,
    "dental surgery": <FaTooth size={22} />,
    neurology: <FaBrain size={22} />,
    pediatrics: <FaBaby size={22} />,
    orthopedics: <FaBone size={22} />,
    ophthalmology: <FaEye size={22} />,
    pulmonology: <FaLungs size={22} />,
    "internal medicine": <FaAllergies size={22} />,
};

function getIcon(name: string) {
    const key = name.toLowerCase().trim();
    return ICON_MAP[key] || <FaStethoscope size={22} />;
}

export default function SpecializationsGrid() {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);

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

    const specializations: SpecializationItem[] = useMemo(() => {
        const map = new Map<string, number>();
        doctors.forEach((d) => {
            if (!d.specialization) return;
            map.set(d.specialization, (map.get(d.specialization) || 0) + 1);
        });
        return Array.from(map.entries())
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);
    }, [doctors]);

    if (loading) {
        return (
            <section className="w-full px-3 sm:px-6 py-8 sm:py-10">
                <div className="container mx-auto h-48 rounded-2xl bg-neutral-900 animate-pulse" />
            </section>
        );
    }

    if (specializations.length === 0) return null;

    return (
        <section className="w-full px-3 sm:px-6 py-8 sm:py-10">
            <div className="container mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="mb-6 sm:mb-8"
                >
                    <h2 className="text-xl sm:text-2xl font-bold text-white">
                        Browse by Specialization
                    </h2>
                    <p className="text-neutral-400 text-sm mt-1">
                        Find the right specialist for your needs.
                    </p>
                </motion.div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                    {specializations.map((spec, index) => (
                        <motion.div
                            key={spec.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{
                                duration: 0.4,
                                delay: index * 0.06,
                                ease: "easeOut",
                            }}
                            whileHover={{ y: -6, scale: 1.03 }}
                        >
                            <Link
                                href={`/doctors?specialization=${encodeURIComponent(spec.name)}`}
                                className="flex flex-col items-center justify-center gap-2 text-center
                                           rounded-2xl border border-white/10 bg-neutral-900
                                           px-4 py-6 h-full
                                           hover:border-blue-500/40 hover:bg-neutral-900/80
                                           transition-colors duration-300"
                            >
                                <motion.div
                                    whileHover={{ scale: 1.15, rotate: 5 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                                    className="h-12 w-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center"
                                >
                                    {getIcon(spec.name)}
                                </motion.div>
                                <p className="text-white text-sm font-medium">{spec.name}</p>
                                <p className="text-neutral-500 text-xs">
                                    {spec.count} doctor{spec.count !== 1 ? "s" : ""}
                                </p>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}