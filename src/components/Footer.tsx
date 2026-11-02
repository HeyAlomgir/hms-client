"use client";

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { FaFacebook, FaGithub, FaLinkedin } from "react-icons/fa";
import {
  MdAccessTime,
  MdArrowOutward,
  MdCalendarMonth,
  MdEmail,
  MdKeyboardArrowUp,
  MdLocationOn,
  MdPhone,
} from "react-icons/md";

const PHONE = "+880 1756135199";

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

/* ---------------------------------------------------------------
   Glass card: 3D tilt + cursor-following spotlight glow
---------------------------------------------------------------- */
function GlassCard({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const sx = useSpring(mx, { stiffness: 140, damping: 18 });
  const sy = useSpring(my, { stiffness: 140, damping: 18 });

  const rotateY = useTransform(sx, [0, 1], [-7, 7]);
  const rotateX = useTransform(sy, [0, 1], [7, -7]);

  const px = useTransform(sx, [0, 1], ["0%", "100%"]);
  const py = useTransform(sy, [0, 1], ["0%", "100%"]);
  const spotlight = useMotionTemplate`radial-gradient(320px circle at ${px} ${py}, rgba(45,212,191,0.16), transparent 70%)`;

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduceMotion || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  };
  const onLeave = () => {
    mx.set(0.5);
    my.set(0.5);
  };

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      transition={{ delay }}
      style={{ perspective: 1000 }}
      className="h-full"
    >
      <motion.div
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        style={
          reduceMotion
            ? undefined
            : { rotateX, rotateY, transformStyle: "preserve-3d" }
        }
        className={`group relative h-full overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-xl transition-colors duration-300 hover:border-teal-400/30 ${className}`}
      >
        {!reduceMotion && (
          <motion.div
            style={{ background: spotlight }}
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          />
        )}
        <div
          className="relative flex h-full flex-col"
          style={{ transform: "translateZ(24px)" }}
        >
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
}

function CardTitle({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="mb-6 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-white">
      <span className="h-5 w-1 rounded-full bg-gradient-to-b from-teal-300 to-cyan-500" />
      {children}
    </h4>
  );
}

/* ---------------------------------------------------------------
   Animated ECG heartbeat line
---------------------------------------------------------------- */
function Heartbeat() {
  const reduceMotion = useReducedMotion();
  return (
    <svg
      viewBox="0 0 400 60"
      fill="none"
      className="h-10 w-full max-w-[220px] text-teal-400"
      aria-hidden="true"
    >
      <path
        d="M0 30 H110 L125 30 L140 8 L160 54 L178 18 L190 30 H400"
        stroke="currentColor"
        strokeOpacity="0.15"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <motion.path
        d="M0 30 H110 L125 30 L140 8 L160 54 L178 18 L190 30 H400"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: "drop-shadow(0 0 6px rgba(45,212,191,0.9))" }}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={
          reduceMotion
            ? { pathLength: 1, opacity: 1 }
            : { pathLength: [0, 1, 1], opacity: [0, 1, 0] }
        }
        transition={{
          duration: 2.8,
          repeat: reduceMotion ? 0 : Infinity,
          ease: "easeInOut",
        }}
      />
    </svg>
  );
}

/* ---------------------------------------------------------------
   Footer
---------------------------------------------------------------- */
const Footer = () => {
  const reduceMotion = useReducedMotion();
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [year, setYear] = useState<number | null>(null);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setYear(now.getFullYear());
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

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 500);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTop = () =>
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });

  return (
    <footer className="relative isolate mt-auto w-full overflow-hidden bg-[#070d19] text-white">
      {/* Glowing animated top border */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal-400/70 to-transparent" />
      <motion.div
        aria-hidden="true"
        animate={reduceMotion ? {} : { x: ["-30%", "130%"] }}
        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
        className="absolute top-0 h-px w-1/4 bg-gradient-to-r from-transparent via-white to-transparent"
      />

      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-32 top-0 h-80 w-80 rounded-full bg-teal-500/15 blur-[110px]" />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-cyan-500/15 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "45px 45px",
            maskImage:
              "radial-gradient(ellipse at center, black 30%, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          }}
        />
        {/* giant watermark */}
        <p className="absolute -bottom-6 left-1/2 -translate-x-1/2 select-none whitespace-nowrap text-[18vw] font-black leading-none tracking-tighter text-white/[0.025] lg:text-[13rem]">
          CAREPULSE
        </p>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-8 pt-14 sm:px-6 lg:pt-16">
        {/* ============ CTA BAND ============ */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="relative mb-12 overflow-hidden rounded-3xl border border-teal-400/20 bg-gradient-to-r from-teal-500/15 via-cyan-500/10 to-blue-600/15 p-6 sm:p-9"
        >
          <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-teal-400/15 blur-3xl" />
          <div className="relative flex flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left">
            <div>
              <Heartbeat />
              <h3 className="mt-3 text-xl font-extrabold sm:text-2xl lg:text-3xl">
                Your health journey starts{" "}
                <span className="bg-gradient-to-r from-teal-300 to-cyan-300 bg-clip-text text-transparent">
                  right here
                </span>
              </h3>
              <p className="mt-2 text-sm text-slate-400">
                Find a trusted specialist and book your appointment in minutes.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/doctors"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-3.5 text-sm font-extrabold text-[#04101d] shadow-lg shadow-teal-500/25 transition hover:-translate-y-0.5 hover:shadow-teal-400/40"
              >
                <MdCalendarMonth size={18} />
                Book Appointment
              </Link>
              <a
                href={`tel:${PHONE.replace(/\s/g, "")}`}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-bold text-white transition hover:border-teal-400/40 hover:text-teal-300"
              >
                <MdPhone size={18} />
                Call Us
              </a>
            </div>
          </div>
        </motion.div>

        {/* ============ MAIN GRID ============ */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <GlassCard>
            <Link href="/" className="block w-fit">
              <Image
                src="/logoo.png"
                width={160}
                height={50}
                alt="CarePulse logo"
                className="h-auto w-36 object-contain"
              />
            </Link>

            <p className="mt-4 text-sm leading-7 text-slate-400">
              Your trusted partner in digital healthcare management. Providing
              seamless hospital experiences for both patients and doctors.
            </p>

            <div className="mt-auto flex items-center gap-2 pt-5 text-xs font-semibold text-teal-400">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-60" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-teal-400" />
              </span>
              Healthcare made smarter
            </div>
          </GlassCard>

          {/* Quick links */}
          <GlassCard delay={0.1}>
            <CardTitle>Quick Links</CardTitle>
            <ul className="flex flex-col gap-4">
              {QUICK_LINKS.map((link) => (
                <motion.li
                  key={link.label}
                  whileHover={reduceMotion ? {} : { x: 6 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Link
                    href={link.href}
                    className="group/link flex w-fit items-center gap-2 text-sm text-slate-400 transition-colors duration-300 hover:text-teal-300"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-600 transition-all duration-300 group-hover/link:bg-teal-400 group-hover/link:shadow-[0_0_10px_rgba(45,212,191,0.8)]" />
                    {link.label}
                    <MdArrowOutward className="opacity-0 transition-all duration-300 group-hover/link:-translate-y-1 group-hover/link:translate-x-1 group-hover/link:opacity-100" />
                  </Link>
                </motion.li>
              ))}
            </ul>
          </GlassCard>

          {/* Contact */}
          <GlassCard delay={0.2}>
            <CardTitle>Contact Info</CardTitle>
            <ul className="flex flex-col gap-5">
              <li className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-teal-400/20 bg-teal-400/10 text-lg text-teal-400">
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
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-teal-400/20 bg-teal-400/10 text-lg text-teal-400">
                  <MdPhone />
                </span>
                <div>
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Phone
                  </p>
                  <a
                    href={`tel:${PHONE.replace(/\s/g, "")}`}
                    className="text-sm text-slate-300 transition hover:text-teal-300"
                  >
                    {PHONE}
                  </a>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-teal-400/20 bg-teal-400/10 text-lg text-teal-400">
                  <MdEmail />
                </span>
                <div className="min-w-0">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Email
                  </p>
                  <a
                    href="mailto:alomgirhosssain71@gmail.com"
                    className="break-all text-sm text-slate-300 transition hover:text-teal-300"
                  >
                    alomgirhosssain71@gmail.com
                  </a>
                </div>
              </li>
            </ul>
          </GlassCard>

          {/* Social + clock */}
          <GlassCard delay={0.3}>
            <CardTitle>Follow Us</CardTitle>

            <div className="flex items-center gap-3">
              {SOCIAL_LINKS.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  whileHover={reduceMotion ? {} : { y: -7, rotateY: 18, scale: 1.12 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 300, damping: 12 }}
                  style={{ transformPerspective: 500 }}
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-slate-900/80 text-slate-400 shadow-[0_5px_15px_rgba(0,0,0,0.3)] transition-colors duration-300 hover:border-teal-400/50 hover:bg-teal-400/10 hover:text-teal-300 hover:shadow-[0_8px_25px_rgba(20,184,166,0.2)]"
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>

            <div className="mt-6 min-h-[92px]">
              {time && date && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative overflow-hidden rounded-2xl border border-teal-400/20 bg-gradient-to-br from-teal-400/10 to-cyan-500/5 p-4"
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
            </div>
          </GlassCard>
        </div>

        {/* ============ BOTTOM BAR ============ */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-7 text-center sm:flex-row sm:text-left"
        >
          <p className="text-xs text-slate-500">
            © {year ?? ""}{" "}
            <span className="font-semibold text-teal-400">CarePulse</span>. All
            rights reserved.
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

      {/* Back to top */}
      <motion.button
        type="button"
        onClick={scrollTop}
        aria-label="Back to top"
        initial={false}
        animate={{
          opacity: showTop ? 1 : 0,
          y: showTop ? 0 : 20,
          pointerEvents: showTop ? "auto" : "none",
        }}
        whileHover={reduceMotion ? {} : { y: -4, scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-2xl border border-teal-400/40 bg-[#0b1a2b]/90 text-2xl text-teal-300 shadow-lg shadow-teal-500/20 backdrop-blur-md transition-colors hover:bg-teal-400/15"
      >
        <MdKeyboardArrowUp />
      </motion.button>
    </footer>
  );
};

export default Footer;