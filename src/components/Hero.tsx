"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  FiActivity,
  FiArrowRight,
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiHeart,
  FiMapPin,
  FiPause,
  FiPlay,
  FiSearch,
  FiShield,
  FiStar,
  FiUsers,
} from "react-icons/fi";

interface Doctor {
  _id: string;
  name: string;
  image: string;
  specialization: string;
  description?: string;
  consultationFee?: string | number;
  startTime?: string | null;
  endTime?: string | null;
  status?: string;
}

const AUTOPLAY_MS = 4500;

export default function Hero3D() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [hovering, setHovering] = useState(false);
  const [query, setQuery] = useState("");

  /* ---------- Fetch doctors (dynamic) ---------- */
  useEffect(() => {
    const load = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL;
        const res = await fetch(`${API_URL}/api/doctors?status=approved`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Failed to fetch doctors");
        const data = await res.json();
        const list: Doctor[] = (Array.isArray(data) ? data : data?.data || [])
          .filter((d: Doctor) => d.status === "approved" || !d.status);
        setDoctors(list);
      } catch (e) {
        console.error("Doctor loading error:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const total = doctors.length;
  const current = doctors[active] ?? null;

  /* ---------- Autoplay ---------- */
  useEffect(() => {
    if (!playing || hovering || total < 2 || reduceMotion) return;
    const id = setInterval(() => setActive((p) => (p + 1) % total), AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [playing, hovering, total, reduceMotion]);

  const next = () => total && setActive((p) => (p + 1) % total);
  const prev = () => total && setActive((p) => (p - 1 + total) % total);

  /* ---------- Mouse 3D tilt for whole stage ---------- */
  const stageRef = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 80, damping: 18 });
  const sy = useSpring(my, { stiffness: 80, damping: 18 });
  const stageRotY = useTransform(sx, [-0.5, 0.5], [-10, 10]);
  const stageRotX = useTransform(sy, [-0.5, 0.5], [8, -8]);
  const glowX = useTransform(sx, [-0.5, 0.5], ["20%", "80%"]);
  const glowY = useTransform(sy, [-0.5, 0.5], ["20%", "80%"]);
  const glow = useTransform(
    [glowX, glowY],
    ([x, y]) =>
      `radial-gradient(500px circle at ${x} ${y}, rgba(34,211,238,0.22), transparent 60%)`
  );
  // floating layers move at different depths (parallax)
  const p1x = useTransform(sx, [-0.5, 0.5], [-24, 24]);
  const p1y = useTransform(sy, [-0.5, 0.5], [-16, 16]);
  const p2x = useTransform(sx, [-0.5, 0.5], [30, -30]);
  const p2y = useTransform(sy, [-0.5, 0.5], [20, -20]);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduceMotion || !stageRef.current) return;
    const r = stageRef.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => {
    mx.set(0);
    my.set(0);
    setHovering(false);
  };

  /* ---------- Coverflow positions ---------- */
  const cards = useMemo(() => {
    return doctors.map((doc, i) => {
      let off = i - active;
      if (off > total / 2) off -= total;
      if (off < -total / 2) off += total;
      return { doc, off, i };
    });
  }, [doctors, active, total]);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/doctors?search=${encodeURIComponent(q)}` : "/doctors");
  };

  const quick = [
    { icon: <FiUsers />, title: "Find a Doctor", desc: "Explore our experts", href: "/doctors" },
    { icon: <FiCalendar />, title: "Book Appointment", desc: "Easy & fast booking", href: "/doctors" },
    { icon: <FiActivity />, title: "Our Services", desc: "Comprehensive care", href: "/services" },
    { icon: <FiHeart />, title: "Emergency Care", desc: "24/7 available", href: "/contact" },
  ];

  return (
    <section className="relative isolate overflow-hidden bg-[#06101D] px-4 pb-16 pt-14 text-white sm:px-6 lg:pt-20">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-32 top-0 h-[460px] w-[460px] rounded-full bg-blue-600/20 blur-[130px]" />
        <div className="absolute -right-32 bottom-10 h-[460px] w-[460px] rounded-full bg-cyan-500/20 blur-[130px]" />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.4) 1px, transparent 1px)",
            backgroundSize: "52px 52px",
          }}
        />
      </div>

      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.05fr]">
          {/* ================= LEFT: TEXT ================= */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-4 py-2 text-xs font-semibold tracking-widest text-cyan-300">
              <FiShield /> YOUR HEALTH, OUR PRIORITY
            </span>

            <h1 className="mt-6 text-4xl font-extrabold leading-[1.1] sm:text-5xl lg:text-6xl">
              Expert Medical Care
              <span className="block">
                For{" "}
                <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-300 bg-clip-text text-transparent">
                  Everyone
                </span>
              </span>
            </h1>

            <p className="mt-5 max-w-lg text-sm leading-7 text-slate-400 sm:text-base">
              Find experienced doctors, book appointments, and get the best
              healthcare services — all in one place.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/doctors"
                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-3.5 text-sm font-bold shadow-lg shadow-blue-600/25 transition hover:-translate-y-0.5"
              >
                <FiCalendar /> Book Appointment
                <FiArrowRight className="transition group-hover:translate-x-1" />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-semibold text-slate-200 transition hover:border-cyan-400/40 hover:text-cyan-300"
              >
                <FiPlay /> Watch Video
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-10 grid max-w-md grid-cols-3 gap-3">
              {[
                { v: loading ? "…" : `${total}+`, l: "Specialists" },
                { v: "10K+", l: "Happy Patients" },
                { v: "24/7", l: "Support" },
              ].map((s) => (
                <div
                  key={s.l}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-center"
                >
                  <p className="text-xl font-extrabold text-cyan-300">{s.v}</p>
                  <p className="mt-1 text-[11px] text-slate-400">{s.l}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ================= RIGHT: 3D STAGE ================= */}
          <div
            ref={stageRef}
            onPointerMove={onMove}
            onPointerEnter={() => setHovering(true)}
            onPointerLeave={onLeave}
            className="relative"
            style={{ perspective: "1400px" }}
          >
            <motion.div
              style={
                reduceMotion
                  ? undefined
                  : { rotateX: stageRotX, rotateY: stageRotY, transformStyle: "preserve-3d" }
              }
              className="relative h-[460px] sm:h-[520px]"
            >
              {/* glow following the cursor */}
              <motion.div
                style={{ background: glow }}
                className="absolute inset-0 rounded-[40px]"
              />

              {/* rotating ring on the floor */}
              <div
                className="absolute inset-x-6 bottom-4 h-24"
                style={{ transform: "rotateX(75deg) translateZ(-60px)" }}
              >
                <motion.div
                  animate={reduceMotion ? {} : { rotate: 360 }}
                  transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
                  className="h-full w-full rounded-full border-2 border-dashed border-cyan-400/30"
                />
              </div>

              {/* Doctor coverflow */}
              {loading ? (
                <div className="absolute inset-x-[22%] inset-y-6 animate-pulse rounded-3xl border border-white/10 bg-white/5" />
              ) : total === 0 ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <FiCalendar className="mb-4 text-4xl text-cyan-400" />
                  <p className="font-bold">No Doctors Available</p>
                  <p className="mt-2 text-sm text-slate-400">
                    Approved doctors will appear here.
                  </p>
                </div>
              ) : (
                <div
                  className="absolute inset-0"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  {cards.map(({ doc, off, i }) => {
                    const abs = Math.abs(off);
                    const visible = abs <= 2;
                    return (
                      <motion.button
                        key={doc._id}
                        type="button"
                        onClick={() => setActive(i)}
                        initial={false}
                        animate={{
                          x: `calc(-50% + ${off * 135}px)`,
                          z: -abs * 150,
                          rotateY: off * -28,
                          scale: off === 0 ? 1 : 0.86 - abs * 0.04,
                          opacity: visible ? (off === 0 ? 1 : 0.65 - abs * 0.12) : 0,
                        }}
                        transition={{ type: "spring", stiffness: 120, damping: 20 }}
                        style={{
                          zIndex: 10 - abs,
                          transformStyle: "preserve-3d",
                          pointerEvents: visible ? "auto" : "none",
                        }}
                        className="absolute left-1/2 top-4 h-[330px] w-[220px] overflow-hidden rounded-3xl border border-white/15 bg-[#10243B] shadow-2xl shadow-black/50 sm:h-[370px] sm:w-[250px]"
                        aria-label={`Select ${doc.name}`}
                      >
                        {doc.image ? (
                          <img
                            src={doc.image}
                            alt={doc.name}
                            referrerPolicy="no-referrer"
                            className="h-full w-full object-cover object-top"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-slate-800 text-6xl font-bold text-cyan-300">
                            {doc.name.charAt(0)}
                          </div>
                        )}
                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#06101D] via-[#06101D]/70 to-transparent" />
                        <div className="absolute inset-x-0 bottom-0 p-4 text-left">
                          <p className="truncate text-sm font-bold">{doc.name}</p>
                          <p className="truncate text-xs text-cyan-300">
                            {doc.specialization}
                          </p>
                        </div>
                        {off === 0 && (
                          <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full border border-white/20 bg-black/40 px-2.5 py-1 text-[10px] font-semibold backdrop-blur">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            Verified
                          </span>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              )}

              {/* Floating 3D badges (different depth layers) */}
              <motion.div
                style={reduceMotion ? undefined : { x: p1x, y: p1y, translateZ: 90 }}
                className="absolute -left-2 top-16 z-20 hidden sm:block"
              >
                <motion.div
                  animate={reduceMotion ? {} : { y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="flex items-center gap-3 rounded-2xl border border-white/15 bg-[#0C192A]/80 px-4 py-3 shadow-xl backdrop-blur-xl"
                >
                  <span className="rounded-xl bg-cyan-400/15 p-2.5 text-cyan-300">
                    <FiHeart />
                  </span>
                  <div>
                    <p className="text-sm font-bold">24/7</p>
                    <p className="text-[11px] text-slate-400">Care</p>
                  </div>
                </motion.div>
              </motion.div>

              <motion.div
                style={reduceMotion ? undefined : { x: p2x, y: p2y, translateZ: 120 }}
                className="absolute -right-2 bottom-28 z-20 hidden sm:block"
              >
                <motion.div
                  animate={reduceMotion ? {} : { y: [0, 12, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="flex items-center gap-3 rounded-2xl border border-white/15 bg-[#0C192A]/80 px-4 py-3 shadow-xl backdrop-blur-xl"
                >
                  <span className="rounded-xl bg-amber-400/15 p-2.5 text-amber-300">
                    <FiStar />
                  </span>
                  <div>
                    <p className="text-sm font-bold">4.9 Rating</p>
                    <p className="text-[11px] text-slate-400">Trusted by patients</p>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Controls */}
            {total > 1 && (
              <div className="mt-2 flex items-center justify-center gap-3">
                <button
                  onClick={prev}
                  aria-label="Previous doctor"
                  className="rounded-full border border-white/15 bg-white/5 p-2.5 transition hover:border-cyan-400/40 hover:text-cyan-300"
                >
                  <FiChevronLeft />
                </button>
                <div className="flex items-center gap-1.5">
                  {doctors.slice(0, 10).map((d, i) => (
                    <button
                      key={d._id}
                      onClick={() => setActive(i)}
                      aria-label={`Go to ${d.name}`}
                      className={`h-1.5 rounded-full transition-all ${
                        i === active ? "w-6 bg-cyan-400" : "w-1.5 bg-white/25"
                      }`}
                    />
                  ))}
                </div>
                <button
                  onClick={next}
                  aria-label="Next doctor"
                  className="rounded-full border border-white/15 bg-white/5 p-2.5 transition hover:border-cyan-400/40 hover:text-cyan-300"
                >
                  <FiChevronRight />
                </button>
                <button
                  onClick={() => setPlaying((p) => !p)}
                  aria-label={playing ? "Pause autoplay" : "Start autoplay"}
                  className="rounded-full border border-white/15 bg-white/5 p-2.5 transition hover:border-cyan-400/40 hover:text-cyan-300"
                >
                  {playing ? <FiPause /> : <FiPlay />}
                </button>
              </div>
            )}

            {/* Selected doctor info */}
            <div className="mt-5 min-h-[104px]">
              <AnimatePresence mode="wait">
                {current && (
                  <motion.div
                    key={current._id}
                    initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduceMotion ? {} : { opacity: 0, y: -8 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-lg font-bold">{current.name}</p>
                      <p className="text-xs text-cyan-300">{current.specialization}</p>
                      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-400">
                        {(current.startTime || current.endTime) && (
                          <span className="inline-flex items-center gap-1.5">
                            <FiClock className="text-cyan-300" />
                            {current.startTime || "N/A"} - {current.endTime || "N/A"}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1.5">
                          <FiStar className="text-cyan-300" />
                          {current.consultationFee !== undefined &&
                          current.consultationFee !== null &&
                          current.consultationFee !== ""
                            ? `${current.consultationFee} ৳`
                            : "Contact for fee"}
                        </span>
                      </div>
                    </div>
                    <Link
                      href={`/doctors/${current._id}`}
                      className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-5 py-3 text-sm font-bold shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5"
                    >
                      Book Now
                      <FiArrowRight className="transition group-hover:translate-x-1" />
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* ================= SEARCH BAR ================= */}
        <form
          onSubmit={onSearch}
          className="mx-auto mt-14 flex max-w-3xl flex-col gap-2 rounded-2xl border border-white/10 bg-white/[0.05] p-2 backdrop-blur-xl sm:flex-row sm:items-center"
        >
          <div className="flex flex-1 items-center gap-3 px-3">
            <FiSearch className="shrink-0 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for doctors, departments or services..."
              className="w-full bg-transparent py-3 text-sm text-white outline-none placeholder:text-slate-500"
            />
          </div>
          <div className="hidden items-center gap-2 border-l border-white/10 px-4 text-sm text-slate-300 sm:flex">
            <FiMapPin className="text-cyan-300" />
            Select Location
          </div>
          <button
            type="submit"
            className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-3 text-sm font-bold transition hover:opacity-90"
          >
            Search
          </button>
        </form>

        {/* ================= QUICK ACTIONS (3D hover tilt) ================= */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quick.map((q, idx) => (
            <motion.div
              key={q.title}
              initial={reduceMotion ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08 }}
              whileHover={reduceMotion ? {} : { rotateX: 8, rotateY: -6, y: -6 }}
              style={{ transformPerspective: 800 }}
            >
              <Link
                href={q.href}
                className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition hover:border-cyan-400/30 hover:bg-white/[0.08] hover:shadow-xl hover:shadow-cyan-950/30"
              >
                <span className="rounded-xl bg-cyan-400/10 p-3 text-2xl text-cyan-300">
                  {q.icon}
                </span>
                <div>
                  <p className="text-sm font-semibold">{q.title}</p>
                  <p className="mt-0.5 text-xs text-slate-400">{q.desc}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}