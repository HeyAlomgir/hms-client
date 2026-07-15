"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";
import { authClient } from "@/lib/auth-client";

export default function CTABanner() {
    const { data: session } = authClient.useSession();
    const isLoggedIn = !!session?.user;

    return (
        <section className="w-full px-3 sm:px-6 py-10 sm:py-16">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    whileHover={{ scale: 1.01 }}
                    className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-blue-600/20 via-neutral-900 to-neutral-900 px-6 sm:px-12 py-10 sm:py-16 text-center"
                >
                    {/* সাজসজ্জার গ্লো, ব্যাকগ্রাউন্ডে */}
                    <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

                    <div className="relative z-10 flex flex-col items-center gap-4">
                        <h2 className="text-2xl sm:text-4xl font-bold text-white max-w-2xl">
                            Ready to Take Care of Your Health?
                        </h2>
                        <p className="text-neutral-300 text-sm sm:text-base max-w-xl">
                            Join thousands of patients who trust CarePulse for fast, reliable, and verified doctor appointments.
                        </p>

                        <motion.div whileTap={{ scale: 0.96 }} className="mt-4">
                            <Link
                                href={isLoggedIn ? "/doctors" : "/signup"}
                                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm sm:text-base font-medium px-6 sm:px-8 py-3 rounded-xl transition-colors"
                            >
                                {isLoggedIn ? "Browse Doctors" : "Get Started Now"}
                                <FiArrowRight size={16} />
                            </Link>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}