
"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { FaFacebook, FaGithub, FaLinkedin } from "react-icons/fa";
import {
    MdEmail,
    MdPhone,
    MdLocationOn,
    MdAccessTime,
    MdArrowOutward,
} from "react-icons/md";

const SOCIAL_LINKS = [
    {
        icon: <FaFacebook size={17} />,
        href: "https://www.facebook.com/AlomgirWEB",
        label: "Facebook",
    },
    {
        icon: <FaGithub size={17} />,
        href: "https://github.com/HeyAlomgir",
        label: "GitHub",
    },
    {
        icon: <FaLinkedin size={17} />,
        href: "https://www.linkedin.com/in/alomgir-hossain-web/",
        label: "LinkedIn",
    },
];

const QUICK_LINKS = [
    { label: "Home", href: "/" },
    { label: "Find Doctors", href: "/doctors" },
    { label: "Join Portal", href: "/signin" },
];

const fadeUp = {
    hidden: { opacity: 0, y: 35 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.65, ease: "easeOut" as const },
    },
};

const Footer = () => {
    const [time, setTime] = useState("");
    const [date, setDate] = useState("");

    useEffect(() => {
        const updateDateTime = () => {
            const now = new Date();

            setTime(
                now.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: true,
                })
            );

            setDate(
                now.toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                })
            );
        };

        updateDateTime();
        const timer = setInterval(updateDateTime, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <footer className="relative isolate mt-auto w-full overflow-hidden border-t border-white/10 bg-[#0b1220] text-white">

            {/* Background decoration */}
            <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute -left-32 top-0 h-72 w-72 rounded-full bg-teal-500/10 blur-[100px]" />
                <div className="absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-cyan-500/10 blur-[110px]" />

                <div
                    className="absolute inset-0 opacity-[0.035]"
                    style={{
                        backgroundImage:
                            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
                        backgroundSize: "45px 45px",
                    }}
                />
            </div>

            <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-16">

                {/* Footer content */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

                    {/* Brand */}
                    <motion.div
                        variants={fadeUp}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        whileHover={{ y: -5 }}
                        className="group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] p-6 shadow-[0_15px_45px_rgba(0,0,0,0.2)] backdrop-blur-xl transition-colors duration-300 hover:border-teal-400/30 hover:bg-white/[0.055]"
                        style={{ transformStyle: "preserve-3d" }}
                    >
                        <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-teal-400/10 blur-2xl transition-all duration-500 group-hover:bg-teal-400/20" />

                        <motion.div
                            whileHover={{ scale: 1.04, rotateY: -5 }}
                            transition={{ type: "spring", stiffness: 200 }}
                            className="relative w-fit"
                        >
                            <Link href="/" className="block">
                                <Image
                                    src="/logoo.png"
                                    width={160}
                                    height={50}
                                    alt="CarePulse logo"
                                    className="h-auto w-36 object-contain"
                                />
                            </Link>
                        </motion.div>

                        <p className="relative text-sm leading-7 text-slate-400">
                            Your trusted partner in digital healthcare management.
                            Providing seamless hospital experiences for both patients
                            and doctors.
                        </p>

                        <div className="relative mt-auto flex items-center gap-2 text-xs font-semibold text-teal-400">
                            <span className="h-2 w-2 animate-pulse rounded-full bg-teal-400 shadow-[0_0_12px_rgba(45,212,191,0.8)]" />
                            Healthcare made smarter
                        </div>
                    </motion.div>

                    {/* Quick links */}
                    <motion.div
                        variants={fadeUp}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ delay: 0.1 }}
                        whileHover={{ y: -5 }}
                        className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] p-6 shadow-[0_15px_45px_rgba(0,0,0,0.2)] backdrop-blur-xl transition-colors duration-300 hover:border-teal-400/30"
                        style={{ transformStyle: "preserve-3d" }}
                    >
                        <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-cyan-400/10 blur-2xl" />

                        <h4 className="relative mb-6 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-white">
                            <span className="h-5 w-1 rounded-full bg-teal-400" />
                            Quick Links
                        </h4>

                        <ul className="relative flex flex-col gap-4">
                            {QUICK_LINKS.map((link, index) => (
                                <motion.li
                                    key={link.label}
                                    whileHover={{ x: 6 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    <Link
                                        href={link.href}
                                        className="group/link flex w-fit items-center gap-2 text-sm text-slate-400 transition-colors duration-300 hover:text-teal-300"
                                    >
                                        <span className="h-1.5 w-1.5 rounded-full bg-slate-600 transition-all duration-300 group-hover/link:bg-teal-400 group-hover/link:shadow-[0_0_10px_rgba(45,212,191,0.8)]" />
                                        {link.label}
                                        <MdArrowOutward className="opacity-0 transition-all duration-300 group-hover/link:translate-x-1 group-hover/link:-translate-y-1 group-hover/link:opacity-100" />
                                    </Link>
                                </motion.li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Contact info */}
                    <motion.div
                        variants={fadeUp}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ delay: 0.2 }}
                        whileHover={{ y: -5 }}
                        className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] p-6 shadow-[0_15px_45px_rgba(0,0,0,0.2)] backdrop-blur-xl transition-colors duration-300 hover:border-teal-400/30"
                        style={{ transformStyle: "preserve-3d" }}
                    >
                        <div className="absolute -bottom-12 -right-12 h-32 w-32 rounded-full bg-teal-400/10 blur-2xl" />

                        <h4 className="relative mb-6 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-white">
                            <span className="h-5 w-1 rounded-full bg-teal-400" />
                            Contact Info
                        </h4>

                        <ul className="relative flex flex-col gap-5">
                            <li className="flex items-start gap-3">
                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-teal-400/20 bg-teal-400/10 text-lg text-teal-400 shadow-[0_4px_15px_rgba(20,184,166,0.1)]">
                                    <MdLocationOn />
                                </span>
                                <div>
                                    <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                        Location
                                    </p>
                                    <span className="text-sm text-slate-300">
                                        CarePulse, Mymensingh
                                    </span>
                                </div>
                            </li>

                            <li className="flex items-start gap-3">
                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-teal-400/20 bg-teal-400/10 text-lg text-teal-400">
                                    <MdPhone />
                                </span>
                                <div>
                                    <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                        Phone
                                    </p>
                                    <span className="text-sm text-slate-300">
                                        +880 1756135199
                                    </span>
                                </div>
                            </li>

                            <li className="flex items-start gap-3">
                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-teal-400/20 bg-teal-400/10 text-lg text-teal-400">
                                    <MdEmail />
                                </span>
                                <div className="min-w-0">
                                    <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                        Email
                                    </p>
                                    <span className="break-all text-sm text-slate-300">
                                        alomgirhosssain71@gmail.com
                                    </span>
                                </div>
                            </li>
                        </ul>
                    </motion.div>

                    {/* Social + clock */}
                    <motion.div
                        variants={fadeUp}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ delay: 0.3 }}
                        whileHover={{ y: -5 }}
                        className="group relative flex flex-col gap-7 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] p-6 shadow-[0_15px_45px_rgba(0,0,0,0.2)] backdrop-blur-xl transition-colors duration-300 hover:border-teal-400/30"
                        style={{ transformStyle: "preserve-3d" }}
                    >
                        <div className="absolute -right-12 top-10 h-32 w-32 rounded-full bg-cyan-400/10 blur-2xl" />

                        <div className="relative">
                            <h4 className="mb-5 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-white">
                                <span className="h-5 w-1 rounded-full bg-teal-400" />
                                Follow Us
                            </h4>

                            <div className="flex items-center gap-3">
                                {SOCIAL_LINKS.map((social) => (
                                    <motion.a
                                        key={social.label}
                                        href={social.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={social.label}
                                        whileHover={{
                                            y: -7,
                                            rotateY: 15,
                                            scale: 1.12,
                                        }}
                                        whileTap={{ scale: 0.9 }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 300,
                                            damping: 12,
                                        }}
                                        className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-slate-900/80 text-slate-400 shadow-[0_5px_15px_rgba(0,0,0,0.25)] transition-colors duration-300 hover:border-teal-400/50 hover:bg-teal-400/10 hover:text-teal-300 hover:shadow-[0_8px_25px_rgba(20,184,166,0.15)]"
                                    >
                                        {social.icon}
                                    </motion.a>
                                ))}
                            </div>
                        </div>

                        {time && date && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="relative overflow-hidden rounded-xl border border-teal-400/20 bg-gradient-to-br from-teal-400/10 to-cyan-500/5 p-4 shadow-[0_8px_25px_rgba(20,184,166,0.08)]"
                            >
                                <div className="absolute -right-5 -top-5 h-20 w-20 rounded-full border border-teal-400/10" />
                                <div className="relative flex items-center gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-400/15 text-2xl text-teal-400">
                                        <MdAccessTime className="animate-pulse" />
                                    </div>

                                    <div className="min-w-0">
                                        <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.15em] text-teal-400/80">
                                            Local Time
                                        </p>
                                        <p className="font-mono text-lg font-bold tracking-wider text-white">
                                            {time}
                                        </p>
                                        <p className="mt-1 text-[10px] leading-relaxed text-slate-400">
                                            {date}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                </div>

                {/* Bottom bar */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-7 text-center sm:flex-row sm:text-left"
                >
                    <p className="text-xs text-slate-500">
                        © {new Date().getFullYear()}{" "}
                        <span className="font-semibold text-teal-400">
                            CarePulse
                        </span>
                        . All rights reserved.
                    </p>

                    <div className="flex items-center gap-5 text-xs text-slate-500">
                        <Link
                            href="/privacy"
                            className="transition-colors duration-300 hover:text-teal-300"
                        >
                            Privacy Policy
                        </Link>

                        <span className="h-1 w-1 rounded-full bg-slate-700" />

                        <Link
                            href="/terms"
                            className="transition-colors duration-300 hover:text-teal-300"
                        >
                            Terms of Service
                        </Link>
                    </div>
                </motion.div>

            </div>
        </footer>
    );
};

export default Footer;
