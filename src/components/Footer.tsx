"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { FaFacebook, FaGithub, FaLinkedin } from "react-icons/fa";
import { MdEmail, MdPhone, MdLocationOn, MdAccessTime } from "react-icons/md";

const SOCIAL_LINKS = [
    { icon: <FaFacebook size={16} />, href: "https://www.facebook.com/AlomgirWEB" },
    { icon: <FaGithub size={16} />, href: "https://github.com/HeyAlomgir" },
    { icon: <FaLinkedin size={16} />, href: "https://www.linkedin.com/in/alomgir-hossain-web/" },
];

const QUICK_LINKS = [
    { label: "Home", href: "/" },
    { label: "Find Doctors", href: "/doctors" },
    { label: "Join Portal", href: "/signin" },
];

const Footer = () => {
    const [time, setTime] = useState("");
    const [date, setDate] = useState("");

    useEffect(() => {
        const updateDateTime = () => {
            const now = new Date();

            setTime(now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true }));
            setDate(now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }));
        };

        updateDateTime();
        const timer = setInterval(updateDateTime, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <footer className="w-full bg-black text-white border-t border-neutral-900 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">

                    {/* brand info */}
                    <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.5, ease: "easeOut" }} className="flex flex-col gap-3">
                        <Link href="/" className="w-fit">
                            <Image src="/logoo.png" width={160} height={50} alt="CarePulse logo" className="w-36 h-auto" />
                        </Link>
                        <p className="text-xs text-neutral-400 leading-relaxed">
                            Your trusted partner in digital healthcare management. Providing seamless hospital experiences for both patients and doctors.
                        </p>
                    </motion.div>

                    {/* quick links */}
                    <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }} className="flex flex-col gap-3">
                        <h4 className="text-sm font-semibold text-neutral-300 uppercase tracking-wider">Quick Links</h4>
                        <ul className="flex flex-col gap-2 text-xs text-neutral-400">
                            {QUICK_LINKS.map((link) => (
                                <li key={link.label}>
                                    <Link href={link.href} className="hover:text-teal-400 transition-colors">{link.label}</Link>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* contact info */}
                    <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }} className="flex flex-col gap-3">
                        <h4 className="text-sm font-semibold text-neutral-300 uppercase tracking-wider">Contact Info</h4>
                        <ul className="flex flex-col gap-2 text-xs text-neutral-400">
                            <li className="flex items-center gap-2">
                                <MdLocationOn className="text-teal-400 text-sm shrink-0" />
                                <span>CarePuls, Mymensingh</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <MdPhone className="text-teal-400 text-sm shrink-0" />
                                <span>+880 1756135199</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <MdEmail className="text-teal-400 text-sm shrink-0" />
                                <span>alomgirhosssain71@gmail.com</span>
                            </li>
                        </ul>
                    </motion.div>

                    {/* social + live clock */}
                    <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }} className="flex flex-col gap-4">
                        <div>
                            <h4 className="text-sm font-semibold text-neutral-300 uppercase tracking-wider mb-2">Follow Us</h4>
                            <div className="flex items-center gap-3">
                                {SOCIAL_LINKS.map((social, index) => (
                                    <motion.a key={index} href={social.href} target="_blank" rel="noopener noreferrer" whileHover={{ y: -3, scale: 1.1 }} whileTap={{ scale: 0.9 }} className="p-2 bg-[#0a0a0a] border border-neutral-800 rounded-lg text-neutral-400 hover:text-teal-400 hover:border-teal-500/50 transition-colors">
                                        {social.icon}
                                    </motion.a>
                                ))}
                            </div>
                        </div>

                        {time && date && (
                            <div className="p-3 bg-[#0a0a0a] border border-neutral-800/80 rounded-xl flex items-center gap-3 max-w-60">
                                <MdAccessTime className="text-teal-400 text-xl animate-pulse shrink-0" />
                                <div className="flex flex-col">
                                    <span className="text-xs font-mono font-bold text-white tracking-wider">{time}</span>
                                    <span className="text-[10px] text-neutral-500 font-medium">{date}</span>
                                </div>
                            </div>
                        )}
                    </motion.div>

                </div>

                {/* bottom bar */}
                <div className="pt-6 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-500 font-medium">
                    <p>© {new Date().getFullYear()} CarePulse. All rights reserved.</p>
                    <div className="flex items-center gap-4">
                        <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
                        <Link href="/terms" className="hover:underline">Terms of Service</Link>
                    </div>
                </div>

            </div>
        </footer>
    );
};

export default Footer;