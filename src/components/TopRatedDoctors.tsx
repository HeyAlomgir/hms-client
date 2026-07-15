"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaStar } from "react-icons/fa";

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
            <div className="h-full w-full flex items-center justify-center bg-blue-500/10 text-blue-400 font-bold text-2xl">
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
            className="h-full w-full object-cover object-top"
        />
    );
}

export default function TopRatedDoctors() {
    const [doctors, setDoctors] = useState<TopDoctor[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/top-doctors`);
                const data = await res.json();
                setDoctors(data.data || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) {
        return (
            <section className="w-full px-3 sm:px-6 py-8 sm:py-10">
                <div className="container mx-auto h-64 rounded-2xl bg-neutral-900 animate-pulse" />
            </section>
        );
    }

    if (doctors.length === 0) return null;

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
                    <h2 className="text-xl sm:text-2xl font-bold text-white">Top Rated Doctors</h2>
                    <p className="text-neutral-400 text-sm mt-1">
                        Highly rated by our patients.
                    </p>
                </motion.div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                    {doctors.map((doc, index) => (
                        <motion.div
                            key={doc._id}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{
                                duration: 0.4,
                                delay: index * 0.08,
                                ease: "easeOut",
                            }}
                            whileHover={{ y: -6, scale: 1.03 }}
                        >
                            <Link
                                href={`/doctors/${doc._id}`}
                                className="flex flex-col rounded-2xl overflow-hidden border border-white/10
                                           bg-neutral-900 hover:border-amber-500/40
                                           transition-colors duration-300 h-full"
                            >
                                <div className="h-36 sm:h-40 w-full bg-neutral-800 overflow-hidden">
                                    <DoctorImage src={doc.image} name={doc.name} />
                                </div>
                                <div className="p-3 flex flex-col gap-1">
                                    <p className="text-white font-semibold text-sm truncate">
                                        {doc.name}
                                    </p>
                                    <p className="text-blue-400 text-xs truncate">
                                        {doc.specialization}
                                    </p>
                                    <div className="flex items-center gap-1 mt-1">
                                        <FaStar className="text-amber-400" size={11} />
                                        <span className="text-white text-xs font-medium">
                                            {doc.avgRating}
                                        </span>
                                        <span className="text-neutral-500 text-[11px]">
                                            ({doc.totalReviews})
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}