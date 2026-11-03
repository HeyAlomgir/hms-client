
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FiHelpCircle,
    FiPlus,
    FiMinus,
    FiMessageCircle,
} from "react-icons/fi";

const faqs = [
    {
        question: "How can I book an appointment with a doctor?",
        answer:
            "Visit our Doctors page, choose your preferred doctor, and select the appointment booking option. Follow the instructions to submit your appointment request.",
    },
    {
        question: "How do I know if my appointment is confirmed?",
        answer:
            "You can check your appointment status from your Patient Dashboard. It will display the latest status available for your booking.",
    },
    {
        question: "Can I choose a specific doctor?",
        answer:
            "Yes. You can explore the available doctors, check their specializations, and choose the doctor you prefer before booking an appointment.",
    },
    {
        question: "How can I create a patient account?",
        answer:
            "Open the signup page, provide the required information, and complete the registration process. You can then log in to access your patient dashboard.",
    },
    {
        question: "What payment methods are available?",
        answer:
            "Available payment options will be shown during the payment process. Follow the checkout instructions to complete your transaction.",
    },
    {
        question: "What should I do if I have a problem with my booking?",
        answer:
            "Please contact the hospital support team with your appointment information so they can help you resolve the issue.",
    },
];

export default function FAQSection() {
    const [activeIndex, setActiveIndex] = useState<number | null>(0);

    return (
        <section
            id="faq"
            className="container mx-auto relative overflow-hidden  px-4 py-20 sm:px-6 lg:px-8"
        >
            {/* Background Effects */}
            <div className="pointer-events-none absolute -left-32 top-20 h-80 w-80 rounded-full bg-cyan-500/10 blur-[120px]" />
            <div className="pointer-events-none absolute -right-32 bottom-10 h-80 w-80 rounded-full bg-blue-600/10 blur-[120px]" />

            <div className="relative mx-auto max-w-7xl">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mb-14 text-center"
                >
                    <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-2xl text-cyan-400 shadow-lg shadow-cyan-500/10">
                        <FiHelpCircle />
                    </div>

                    <p className="mb-3 text-sm font-semibold uppercase tracking-[4px] text-cyan-400">
                        Got Questions?
                    </p>

                    <h2 className="text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
                        Frequently Asked{" "}
                        <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                            Questions
                        </span>
                    </h2>

                    <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-gray-400 sm:text-base">
                        Find answers to common questions about appointments,
                        doctors, accounts, and our healthcare services.
                    </p>
                </motion.div>

                {/* FAQ Layout */}
                <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-3">

                    {/* Left Information Card */}
                    <motion.div
                        initial={{ opacity: 0, x: -35 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                        whileHover={{ y: -7, rotateY: 3 }}
                        style={{ transformStyle: "preserve-3d" }}
                        className="relative overflow-hidden rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-[#172c46] via-[#111c30] to-[#111827] p-7 shadow-2xl shadow-cyan-500/5 lg:sticky lg:top-24"
                    >
                        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl" />

                        <div className="relative">
                            <div className="mb-7 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 text-3xl text-white shadow-xl shadow-cyan-500/20">
                                <FiMessageCircle />
                            </div>

                            <h3 className="text-2xl font-bold leading-snug text-white">
                                Still Have
                                <span className="block text-cyan-400">
                                    Questions?
                                </span>
                            </h3>

                            <p className="mt-4 text-sm leading-7 text-gray-400">
                                We understand that healthcare decisions can
                                raise questions. Find the information you need
                                or contact our support team.
                            </p>

                            <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
                                <p className="text-xs text-gray-400">
                                    Need assistance?
                                </p>

                                <p className="mt-1 font-semibold text-white">
                                    We are here to help.
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Questions */}
                    <motion.div
                        initial={{ opacity: 0, x: 35 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                        className="space-y-4 lg:col-span-2"
                    >
                        {faqs.map((faq, index) => {
                            const isOpen = activeIndex === index;

                            return (
                                <motion.div
                                    key={faq.question}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.07 }}
                                    whileHover={{ y: -3 }}
                                    className={`group overflow-hidden rounded-2xl border transition-all duration-300 ${isOpen
                                            ? "border-cyan-400/40 bg-gradient-to-br from-[#172c46] to-[#111827] shadow-xl shadow-cyan-500/5"
                                            : "border-white/10 bg-[#111827]/80 hover:border-cyan-400/20"
                                        }`}
                                >
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setActiveIndex(isOpen ? null : index)
                                        }
                                        aria-expanded={isOpen}
                                        className="flex w-full items-center justify-between gap-4 p-5 text-left sm:p-6"
                                    >
                                        <div className="flex items-center gap-4">
                                            <span
                                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold transition-colors ${isOpen
                                                        ? "bg-cyan-400 text-[#0b1120]"
                                                        : "bg-white/5 text-cyan-400"
                                                    }`}
                                            >
                                                {String(index + 1).padStart(2, "0")}
                                            </span>

                                            <span
                                                className={`text-sm font-semibold leading-6 sm:text-base ${isOpen ? "text-cyan-300" : "text-white"
                                                    }`}
                                            >
                                                {faq.question}
                                            </span>
                                        </div>

                                        <span
                                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-300 ${isOpen
                                                    ? "rotate-180 bg-cyan-400 text-[#0b1120]"
                                                    : "bg-white/5 text-gray-400 group-hover:text-cyan-400"
                                                }`}
                                        >
                                            {isOpen ? <FiMinus /> : <FiPlus />}
                                        </span>
                                    </button>

                                    <AnimatePresence initial={false}>
                                        {isOpen && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{
                                                    height: { duration: 0.3 },
                                                    opacity: { duration: 0.2 },
                                                }}
                                            >
                                                <div className="px-5 pb-6 pl-[4.5rem] sm:pl-[5rem]">
                                                    <div className="mb-3 h-px w-full bg-gradient-to-r from-cyan-400/30 to-transparent" />

                                                    <p className="text-sm leading-7 text-gray-400">
                                                        {faq.answer}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
