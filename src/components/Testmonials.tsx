
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaStar, FaQuoteLeft } from "react-icons/fa";

interface Review {
    _id: string;
    doctorId: string;
    patientName: string;
    patientImage: string | null;
    rating: number;
    comment: string;
    createdAt?: string;
}

function ReviewerAvatar({
    image,
    name,
}: {
    image?: string | null;
    name?: string;
}) {
    const [error, setError] = useState(false);

    const initials =
        name
            ?.trim()
            .split(/\s+/)
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase() || "?";

    if (!image || error) {
        return (
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-500/10 text-sm font-bold text-cyan-400">
                {initials}
            </div>
        );
    }

    return (
        <img
            src={image}
            alt={name || "Patient"}
            referrerPolicy="no-referrer"
            onError={() => setError(true)}
            className="h-11 w-11 flex-shrink-0 rounded-full border border-cyan-400/20 object-cover"
        />
    );
}

export default function Testimonials() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadReviews = async () => {
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/testimonials`,
                    {
                        cache: "no-store",
                    }
                );

                if (!res.ok) {
                    throw new Error("Failed to fetch testimonials");
                }

                const result = await res.json();

                if (!result.success && !Array.isArray(result.data)) {
                    throw new Error("Invalid testimonials response");
                }

                setReviews(
                    Array.isArray(result.data) ? result.data : []
                );
            } catch (error) {
                console.error("Testimonials Error:", error);
                setReviews([]);
            } finally {
                setLoading(false);
            }
        };

        loadReviews();
    }, []);

    // Loading State
    if (loading) {
        return (
            <section className="w-full px-3 py-8 sm:px-6 sm:py-10">
                <div className="container mx-auto">
                    <div className="mb-6 h-8 w-56 animate-pulse rounded-lg bg-slate-800" />

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {[1, 2, 3, 4].map((item) => (
                            <div
                                key={item}
                                className="flex h-56 flex-col gap-4 rounded-2xl border border-slate-700/60 bg-slate-900/80 p-5"
                            >
                                <div className="h-6 w-6 animate-pulse rounded bg-slate-700" />
                                <div className="h-4 w-full animate-pulse rounded bg-slate-800" />
                                <div className="h-4 w-4/5 animate-pulse rounded bg-slate-800" />
                                <div className="mt-auto flex items-center gap-3">
                                    <div className="h-11 w-11 animate-pulse rounded-full bg-slate-700" />
                                    <div className="h-4 w-24 animate-pulse rounded bg-slate-800" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    // Empty State
    if (reviews.length === 0) {
        return null;
    }

    return (
        <section className="w-full px-3 py-8 sm:px-6 sm:py-10">
            <div className="container mx-auto">

                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{
                        duration: 0.5,
                        ease: "easeOut",
                    }}
                    className="mb-6 sm:mb-8"
                >
                    <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[2px] text-cyan-400">
                        <FaStar />
                        Patient Experiences
                    </div>

                    <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                        What Our Patients Say
                    </h2>

                    <p className="mt-1 text-sm text-slate-400">
                        Real feedback from real appointments.
                    </p>
                </motion.div>

                {/* Testimonials Grid */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {reviews.map((review, index) => {
                        const rating = Math.min(
                            5,
                            Math.max(0, Math.floor(Number(review.rating) || 0))
                        );

                        return (
                            <motion.div
                                key={review._id}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{
                                    duration: 0.4,
                                    delay: index * 0.08,
                                    ease: "easeOut",
                                }}
                                whileHover={{
                                    y: -5,
                                    scale: 1.02,
                                }}
                                className="group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-900/90 p-5 shadow-lg shadow-black/10 transition-all duration-300 hover:border-cyan-400/30 hover:bg-slate-800/90"
                            >
                                {/* Decorative Glow */}
                                <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-cyan-500/5 blur-3xl transition-opacity duration-300 group-hover:bg-cyan-500/10" />

                                {/* Quote Icon */}
                                <div className="relative flex items-center justify-between">
                                    <FaQuoteLeft
                                        size={22}
                                        className="text-cyan-400/40 transition-colors duration-300 group-hover:text-cyan-400/70"
                                    />

                                    <span className="rounded-full border border-slate-700/60 bg-slate-800 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                        Verified Feedback
                                    </span>
                                </div>

                                {/* Review Comment */}
                                <p className="relative flex-1 text-sm leading-relaxed text-slate-300 line-clamp-4">
                                    {review.comment}
                                </p>

                                {/* Rating */}
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <FaStar
                                            key={star}
                                            size={13}
                                            className={
                                                star <= rating
                                                    ? "text-amber-400"
                                                    : "text-slate-700"
                                            }
                                        />
                                    ))}

                                    <span className="ml-1 text-xs font-semibold text-slate-400">
                                        {rating > 0 ? `${rating}.0` : "No rating"}
                                    </span>
                                </div>

                                {/* Reviewer Information */}
                                <div className="flex items-center gap-3 border-t border-slate-700/60 pt-3">
                                    <ReviewerAvatar
                                        image={review.patientImage}
                                        name={review.patientName}
                                    />

                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold text-white transition-colors duration-300 group-hover:text-cyan-300">
                                            {review.patientName || "Anonymous Patient"}
                                        </p>

                                        <p className="text-xs text-slate-500">
                                            Patient
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
