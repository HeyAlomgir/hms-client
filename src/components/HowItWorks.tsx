"use client";

import { motion } from "framer-motion";
import { FiSearch, FiCalendar, FiCreditCard } from "react-icons/fi";

const STEPS = [
    {
        icon: <FiSearch size={22} />,
        title: "Search Doctor",
        description: "Browse verified doctors by specialization, availability, and rating to find the right fit.",
    },
    {
        icon: <FiCalendar size={22} />,
        title: "Select Time",
        description: "Pick a date that matches the doctor's working days and available time slots.",
    },
    {
        icon: <FiCreditCard size={22} />,
        title: "Pay & Confirm",
        description: "Securely pay the consultation fee online and get your appointment instantly booked.",
    },
];

export default function HowItWorks() {
    return (
        <section className="w-full px-3 sm:px-6 py-8 sm:py-12">
            <div className="container mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="text-center mb-8 sm:mb-10"
                >
                    <h2 className="text-xl sm:text-2xl font-bold text-white">How It Works</h2>
                    <p className="text-neutral-400 text-sm mt-1">Book your appointment in three simple steps.</p>
                </motion.div>

                <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4">
                    <div className="hidden sm:block absolute top-9 left-[16.5%] right-[16.5%] h-px border-t-2 border-dashed border-white/10" />

                    {STEPS.map((step, index) => (
                        <motion.div
                            key={step.title}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.5, delay: index * 0.15, ease: "easeOut" }}
                            whileHover={{ y: -6 }}
                            className="relative z-10 flex flex-col items-center text-center gap-3 rounded-2xl border border-white/10 bg-neutral-900 px-5 py-8 transition-colors duration-300 hover:border-blue-500/40"
                        >
                            <div className="relative">
                                <motion.div
                                    whileHover={{ scale: 1.15, rotate: 5 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                                    className="h-14 w-14 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center"
                                >
                                    {step.icon}
                                </motion.div>
                                <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                                    {index + 1}
                                </span>
                            </div>

                            <h3 className="text-white font-semibold text-base sm:text-lg mt-2">{step.title}</h3>
                            <p className="text-neutral-400 text-xs sm:text-sm max-w-[220px]">{step.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}