"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
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
  FiAlertCircle,
  FiArrowRight,
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiEye,
  FiGrid,
  FiHeart,
  FiRefreshCw,
  FiStar,
  FiUser,
} from "react-icons/fi";
// FiBaby doesn't exist in Feather icons -> use FaBaby from Font Awesome
import { FaBaby } from "react-icons/fa";

interface Doctor {
  _id?: string;
  id?: string;
  name?: string;
  fullName?: string;
  image?: string;
  photo?: string;
  profileImage?: string;
  profilePicture?: string;
  specialization?: string;
  specialty?: string;
  department?: string;
  qualification?: string;
  qualifications?: string;
  degree?: string;
  designation?: string;
  experience?: string | number;
  availability?: string;
  status?: string;
  rating?: number;
  averageRating?: number;
  totalReviews?: number;
  reviews?: number;
  consultationFee?: number;
  fee?: number;
  [key: string]: unknown;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
const PER_PAGE = 4;

const categories = [
  { name: "All Doctors", icon: FiGrid },
  { name: "Cardiologist", icon: FiHeart },
  { name: "Neurologist", icon: FiActivity },
  { name: "Pediatrician", icon: FaBaby },
  { name: "Dermatologist", icon: FiEye },
  { name: "Gynecologist", icon: FiUser },
];

/* ---------------- helpers ---------------- */
const getDoctorId = (d: Doctor) => String(d._id || d.id || "");
const getDoctorName = (d: Doctor) => d.name || d.fullName || "Medical Specialist";
const getDoctorImage = (d: Doctor) =>
  d.image || d.profileImage || d.profilePicture || d.photo || "";
const getDoctorSpecialty = (d: Doctor) =>
  d.specialization || d.specialty || d.department || "General Physician";
const getDoctorQualification = (d: Doctor) =>
  d.qualification ||
  d.qualifications ||
  d.degree ||
  d.designation ||
  "Qualified Medical Professional";

const getDoctorRating = (d: Doctor) => {
  const r = Number(d.averageRating ?? d.rating);
  return Number.isFinite(r) && r > 0 ? r : null;
};
const getDoctorReviews = (d: Doctor) => {
  const r = Number(d.totalReviews ?? d.reviews);
  return Number.isFinite(r) && r > 0 ? r : null;
};
const getDoctorFee = (d: Doctor) => {
  const f = Number(d.consultationFee ?? d.fee);
  return Number.isFinite(f) && f > 0 ? f : null;
};
const getAvailability = (d: Doctor) => {
  const v = String(d.availability || "").toLowerCase();
  if (v.includes("leave") || v.includes("unavailable") || v.includes("off"))
    return "On Leave";
  return "Available";
};

const normalizeDoctors = (data: unknown): Doctor[] => {
  if (Array.isArray(data)) return data as Doctor[];
  if (data && typeof data === "object") {
    const res = data as Record<string, unknown>;
    if (Array.isArray(res.doctors)) return res.doctors as Doctor[];
    if (Array.isArray(res.data)) return res.data as Doctor[];
    if (
      res.data &&
      typeof res.data === "object" &&
      Array.isArray((res.data as Record<string, unknown>).doctors)
    ) {
      return (res.data as Record<string, unknown>).doctors as Doctor[];
    }
  }
  return [];
};

/* ---------------- 3D tilt card ---------------- */
function DoctorCard3D({
  doctor,
  index,
  reduceMotion,
}: {
  doctor: Doctor;
  index: number;
  reduceMotion: boolean | null;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 150, damping: 18 });
  const sy = useSpring(my, { stiffness: 150, damping: 18 });

  const rotateY = useTransform(sx, [-0.5, 0.5], [-14, 14]);
  const rotateX = useTransform(sy, [-0.5, 0.5], [14, -14]);
  const imgX = useTransform(sx, [-0.5, 0.5], [-10, 10]);
  const imgY = useTransform(sy, [-0.5, 0.5], [-8, 8]);
  const glareX = useTransform(sx, [-0.5, 0.5], ["10%", "90%"]);
  const glareY = useTransform(sy, [-0.5, 0.5], ["10%", "90%"]);
  const glare = useTransform(
    [glareX, glareY],
    ([x, y]) =>
      `radial-gradient(260px circle at ${x} ${y}, rgba(255,255,255,0.22), transparent 65%)`
  );

  const id = getDoctorId(doctor);
  const name = getDoctorName(doctor);
  const image = getDoctorImage(doctor);
  const specialty = getDoctorSpecialty(doctor);
  const qualification = getDoctorQualification(doctor);
  const rating = getDoctorRating(doctor);
  const reviews = getDoctorReviews(doctor);
  const fee = getDoctorFee(doctor);
  const availability = getAvailability(doctor);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduceMotion || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 40, rotateX: -12 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ delay: index * 0.09, duration: 0.6 }}
      style={{ perspective: 1100 }}
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
        className="group relative h-full rounded-3xl border border-white/10 bg-gradient-to-b from-[#183049] to-[#0a1a2e] shadow-xl shadow-black/30 transition-[border-color,box-shadow] duration-500 hover:border-cyan-400/40 hover:shadow-2xl hover:shadow-cyan-500/20"
      >
        {/* glare */}
        {!reduceMotion && (
          <motion.div
            style={{ background: glare }}
            className="pointer-events-none absolute inset-0 z-40 rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          />
        )}

        {/* IMAGE (pops out in 3D) */}
        <Link
          href={`/doctors/${id}`}
          className="relative block h-[250px] overflow-hidden rounded-t-3xl bg-gradient-to-br from-[#dcecff] via-[#b8d9f8] to-[#e9f4ff]"
          style={{ transform: "translateZ(0)" }}
        >
          {image ? (
            <motion.img
              src={image}
              alt={name}
              referrerPolicy="no-referrer"
              loading="lazy"
              style={reduceMotion ? undefined : { x: imgX, y: imgY, scale: 1.12 }}
              className="h-full w-full object-cover object-top"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-7xl text-slate-400">
              <FiUser />
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0a1a2e]/85 to-transparent" />
        </Link>

        {/* Floating badges */}
        <div
          className={`absolute right-3 top-3 z-30 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold shadow-lg backdrop-blur-md ${
            availability === "Available"
              ? "bg-emerald-500/90 text-white"
              : "bg-slate-700/90 text-white"
          }`}
          style={{ transform: "translateZ(50px)" }}
        >
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
          {availability}
        </div>

        <div
          className="absolute left-3 top-[212px] z-30 rounded-full border border-white/25 bg-black/35 px-3 py-1 text-[10px] font-semibold text-white backdrop-blur-md"
          style={{ transform: "translateZ(40px)" }}
        >
          Verified Specialist
        </div>

        {/* DETAILS */}
        <div className="relative p-4" style={{ transform: "translateZ(30px)" }}>
          <div className="mb-3 min-h-[72px] text-center">
            <h3 className="truncate text-base font-extrabold text-white" title={name}>
              {name}
            </h3>
            <p className="mt-1 truncate text-xs font-semibold text-cyan-300">
              {specialty}
            </p>
            <p
              className="mt-1 truncate text-[11px] text-slate-400"
              title={qualification}
            >
              {qualification}
            </p>
          </div>

          <div className="mb-3 flex min-h-5 items-center justify-center gap-2 text-xs">
            {rating !== null ? (
              <>
                <FiStar className="fill-amber-400 text-amber-400" />
                <span className="font-bold text-amber-300">{rating.toFixed(1)}</span>
                {reviews !== null && (
                  <span className="text-slate-400">({reviews} reviews)</span>
                )}
              </>
            ) : (
              <span className="text-slate-500">Rating not available</span>
            )}
          </div>

          <div className="mb-4 flex items-center justify-center gap-2 text-xs text-slate-400">
            <FiClock className="text-cyan-400" />
            {fee !== null ? (
              <span>Consultation Fee: ৳{fee}</span>
            ) : (
              <span>Contact for consultation fee</span>
            )}
          </div>

          <Link
            href={`/appointments?doctorId=${encodeURIComponent(id)}`}
            style={{ transform: "translateZ(25px)" }}
            className="group/btn flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-400/40 bg-gradient-to-r from-blue-600 to-cyan-500 px-3 py-3 text-xs font-extrabold text-white shadow-lg shadow-blue-500/25 transition duration-300 hover:from-cyan-500 hover:to-blue-600 hover:shadow-cyan-500/40"
          >
            <FiCalendar size={15} />
            Book Appointment
            <FiArrowRight className="transition group-hover/btn:translate-x-1" />
          </Link>
        </div>

        <div className="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-cyan-400/10 blur-3xl transition group-hover:bg-cyan-400/25" />
      </motion.div>
    </motion.div>
  );
}

/* ---------------- main section ---------------- */
const DoctorsShowcase = () => {
  const reduceMotion = useReducedMotion();

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All Doctors");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const fetchDoctors = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/api/doctors?status=approved`, {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Unable to load doctors.");

        const result = await response.json();
        setDoctors(normalizeDoctors(result).filter((d) => getDoctorId(d)));
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchDoctors();
    return () => controller.abort();
  }, []);

  const filteredDoctors = useMemo(() => {
    if (selectedCategory === "All Doctors") return doctors;
    return doctors.filter((d) =>
      getDoctorSpecialty(d).toLowerCase().includes(selectedCategory.toLowerCase())
    );
  }, [doctors, selectedCategory]);

  const totalPages = Math.ceil(filteredDoctors.length / PER_PAGE);

  const visibleDoctors = useMemo(() => {
    const start = page * PER_PAGE;
    return filteredDoctors.slice(start, start + PER_PAGE);
  }, [filteredDoctors, page]);

  const changeCategory = (category: string) => {
    setSelectedCategory(category);
    setPage(0);
  };
  const nextPage = () => setPage((c) => Math.min(c + 1, totalPages - 1));
  const previousPage = () => setPage((c) => Math.max(c - 1, 0));

  return (
    <section className="relative isolate overflow-hidden bg-[#071426] py-20 text-white sm:py-24">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-40 top-20 h-[450px] w-[450px] rounded-full bg-blue-600/15 blur-[130px]" />
        <div className="absolute -right-40 bottom-0 h-[500px] w-[500px] rounded-full bg-cyan-500/15 blur-[140px]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
            backgroundSize: "55px 55px",
          }}
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-12 flex flex-col justify-between gap-5 md:flex-row md:items-end"
        >
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[2px] text-cyan-300">
              <FiHeart />
              Meet Our Medical Experts
            </div>
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
              Our Expert{" "}
              <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Doctors
              </span>
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
              Find experienced medical professionals and get personalized
              healthcare from trusted specialists.
            </p>
          </div>

          <Link
            href="/doctors"
            className="group inline-flex w-fit items-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-5 py-3 text-sm font-bold text-cyan-300 transition hover:border-cyan-300 hover:bg-cyan-400/20"
          >
            View All Doctors
            <FiArrowRight className="transition group-hover:translate-x-1" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[230px_1fr]">
          {/* Sidebar */}
          <motion.aside
            initial={reduceMotion ? false : { opacity: 0, x: -25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="h-fit rounded-3xl border border-white/10 bg-white/[0.04] p-4 shadow-2xl shadow-black/20 backdrop-blur-xl"
          >
            <div className="mb-5 px-3">
              <p className="text-xs font-bold uppercase tracking-[2px] text-slate-500">
                Specialties
              </p>
              <h3 className="mt-2 text-lg font-bold text-white">Find a Doctor</h3>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-1">
              {categories.map((category) => {
                const Icon = category.icon;
                const active = selectedCategory === category.name;

                return (
                  <motion.button
                    key={category.name}
                    type="button"
                    onClick={() => changeCategory(category.name)}
                    whileHover={reduceMotion ? {} : { x: 6, rotateY: -8 }}
                    whileTap={reduceMotion ? {} : { scale: 0.96 }}
                    style={{ transformPerspective: 600 }}
                    className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition-colors duration-300 ${
                      active
                        ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/30"
                        : "text-slate-400 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon
                      size={19}
                      className={
                        active
                          ? "shrink-0 text-white"
                          : "shrink-0 text-cyan-400 transition group-hover:scale-110"
                      }
                    />
                    <span>{category.name}</span>
                  </motion.button>
                );
              })}
            </div>

            <div className="mt-6 hidden rounded-2xl border border-cyan-400/10 bg-gradient-to-br from-cyan-400/10 to-blue-500/10 p-4 lg:block">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/15 text-cyan-300">
                <FiHeart size={20} />
              </div>
              <p className="text-sm font-bold text-white">Your Health Matters</p>
              <p className="mt-2 text-xs leading-5 text-slate-400">
                Choose a specialist and take the next step toward better health.
              </p>
            </div>
          </motion.aside>

          {/* Cards area */}
          <div className="min-w-0">
            {loading && (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: PER_PAGE }).map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse overflow-hidden rounded-3xl border border-white/10 bg-white/5"
                  >
                    <div className="h-64 bg-white/10" />
                    <div className="space-y-3 p-5">
                      <div className="mx-auto h-4 w-2/3 rounded bg-white/10" />
                      <div className="mx-auto h-3 w-1/2 rounded bg-white/10" />
                      <div className="h-10 rounded-xl bg-white/10" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && error && (
              <div className="flex min-h-[300px] flex-col items-center justify-center rounded-3xl border border-rose-400/20 bg-rose-400/5 p-8 text-center">
                <FiAlertCircle className="mb-4 text-4xl text-rose-400" />
                <h3 className="text-lg font-bold text-white">Unable to load doctors</h3>
                <p className="mt-2 text-sm text-slate-400">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-rose-500/15 px-5 py-3 text-sm font-bold text-rose-300"
                >
                  <FiRefreshCw />
                  Try Again
                </button>
              </div>
            )}

            {!loading && !error && filteredDoctors.length === 0 && (
              <div className="flex min-h-[300px] flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/[0.035] p-8 text-center">
                <FiUser className="mb-4 text-5xl text-cyan-400" />
                <h3 className="text-xl font-bold text-white">No Doctors Found</h3>
                <p className="mt-2 text-sm text-slate-400">
                  No approved doctors are available in this category.
                </p>
                <button
                  onClick={() => changeCategory("All Doctors")}
                  className="mt-5 rounded-xl bg-cyan-500/15 px-5 py-3 text-sm font-bold text-cyan-300"
                >
                  View All Doctors
                </button>
              </div>
            )}

            {!loading && !error && filteredDoctors.length > 0 && (
              <>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedCategory + page}
                    exit={reduceMotion ? {} : { opacity: 0, y: -15 }}
                    transition={{ duration: 0.25 }}
                    className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4"
                  >
                    {visibleDoctors.map((doctor, index) => (
                      <DoctorCard3D
                        key={getDoctorId(doctor)}
                        doctor={doctor}
                        index={index}
                        reduceMotion={reduceMotion}
                      />
                    ))}
                  </motion.div>
                </AnimatePresence>

                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                    <p className="text-xs text-slate-400">
                      Showing{" "}
                      <span className="font-bold text-white">
                        {page * PER_PAGE + 1}–
                        {Math.min((page + 1) * PER_PAGE, filteredDoctors.length)}
                      </span>{" "}
                      of{" "}
                      <span className="font-bold text-white">
                        {filteredDoctors.length}
                      </span>{" "}
                      doctors
                    </p>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={previousPage}
                        disabled={page === 0}
                        aria-label="Previous doctors"
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <FiChevronLeft />
                      </button>
                      <span className="px-2 text-xs font-bold text-cyan-300">
                        {page + 1} / {totalPages}
                      </span>
                      <button
                        onClick={nextPage}
                        disabled={page >= totalPages - 1}
                        aria-label="Next doctors"
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <FiChevronRight />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative mt-14 overflow-hidden rounded-3xl border border-cyan-400/20 bg-gradient-to-r from-blue-600/20 via-cyan-500/10 to-indigo-600/20 p-7 sm:p-9"
        >
          <div className="pointer-events-none absolute -right-10 -top-20 h-60 w-60 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="relative flex flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left">
            <div>
              <h3 className="text-xl font-extrabold text-white sm:text-2xl">
                Need Help Finding the Right Doctor?
              </h3>
              <p className="mt-2 text-sm text-slate-400">
                Explore our complete list of medical specialists.
              </p>
            </div>
            <Link
              href="/doctors"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-blue-500/20 transition hover:scale-105"
            >
              Explore All Doctors
              <FiArrowRight />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DoctorsShowcase;