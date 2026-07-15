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

function ReviewerAvatar({ image, name }: { image?: string | null; name?: string }) {
    const [error, setError] = useState(false);
    const initials =
        name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "?";

    if (!image || error) {
        return (
            <div className="h-10 w-10 flex-shrink-0 rounded-full bg-blue-500/10 ring-1 ring-blue-500/30 flex items-center justify-center text-xs font-semibold text-blue-400">
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
            className="h-10 w-10 flex-shrink-0 rounded-full object-cover ring-1 ring-blue-500/30"
        />
    );
}

export default function Testimonials() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/testimonials`);
                const data = await res.json();
                setReviews(data.data || []);
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
                <div className="max-w-7xl mx-auto h-64 rounded-2xl bg-neutral-900 animate-pulse" />
            </section>
        );
    }

    if (reviews.length === 0) return null;

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
                    <h2 className="text-xl sm:text-2xl font-bold text-white">What Our Patients Say</h2>
                    <p className="text-neutral-400 text-sm mt-1">Real feedback from real appointments.</p>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {reviews.map((review, index) => (
                        <motion.div
                            key={review._id}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
                            whileHover={{ y: -6, scale: 1.02 }}
                            className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-neutral-900 p-5 hover:border-blue-500/40 transition-colors duration-300"
                        >
                            <FaQuoteLeft className="text-blue-500/20" size={22} />

                            <p className="text-neutral-300 text-sm leading-relaxed line-clamp-4 flex-1">
                                {review.comment}
                            </p>

                            <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <FaStar
                                        key={star}
                                        size={12}
                                        className={star <= review.rating ? "text-amber-400" : "text-neutral-700"}
                                    />
                                ))}
                            </div>

                            <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                                <ReviewerAvatar image={review.patientImage} name={review.patientName} />
                                <p className="text-white text-sm font-medium truncate">{review.patientName}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}