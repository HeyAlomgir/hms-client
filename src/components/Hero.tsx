
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  FiArrowRight,
  FiClock,
  FiChevronRight,
  FiCalendar,
  FiSearch,
  FiShield,
  FiStar,
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

const FEATURED_DOCTOR_ID = "6a5685de401b21bace725399";

export default function Hero() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL;

        const res = await fetch(
          `${API_URL}/api/doctors?status=approved`,
          { cache: "no-store" }
        );

        if (!res.ok) throw new Error("Failed to fetch doctors");

        const data = await res.json();

        const approvedDoctors: Doctor[] = (
          Array.isArray(data) ? data : data?.data || []
        ).filter(
          (doctor: Doctor) =>
            doctor.status === "approved" || !doctor.status
        );

        setDoctors(approvedDoctors);

        const featured =
          approvedDoctors.find(
            (doctor) => doctor._id === FEATURED_DOCTOR_ID
          ) || approvedDoctors[0];

        setSelectedDoctor(featured || null);
      } catch (error) {
        console.error("Doctor loading error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDoctors();
  }, []);

  const filteredDoctors = doctors.filter((doctor) =>
    `${doctor.name} ${doctor.specialization}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const selectDoctor = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
  };

  return (
    <section className="relative isolate overflow-hidden bg-[#07111F] px-3 py-16 text-white sm:px-6 sm:py-20 lg:py-24">

      {/* Background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-40 top-0 h-[450px] w-[450px] rounded-full bg-blue-600/15 blur-[130px]" />
        <div className="absolute -right-40 bottom-0 h-[450px] w-[450px] rounded-full bg-cyan-500/15 blur-[130px]" />

        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      <div className="mx-auto max-w-7xl">

        {/* Heading */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-12 text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-semibold tracking-widest text-cyan-300">
            <FiShield />
            CAREPULSE HEALTHCARE
          </span>

          <h1 className="mt-5 text-3xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
            Meet Your Trusted
            <span className="block bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-300 bg-clip-text text-transparent">
              Healthcare Experts
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
            Discover experienced healthcare professionals and find
            the right specialist for your health journey.
          </p>
        </motion.div>

        {/* Main Showcase */}
        <div className="grid items-stretch gap-5 lg:grid-cols-[1fr_340px]">

          {/* Featured Doctor */}
          <div className="relative min-w-0">

            {loading ? (
              <div className="h-[540px] animate-pulse rounded-3xl border border-white/10 bg-white/5" />
            ) : selectedDoctor ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedDoctor._id}
                  initial={
                    reduceMotion
                      ? false
                      : { opacity: 0, y: 20, rotateX: 4 }
                  }
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  exit={
                    reduceMotion
                      ? {}
                      : { opacity: 0, y: -12 }
                  }
                  transition={{ duration: 0.4 }}
                  className="relative grid h-full min-h-[540px] overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#142B47] via-[#0D1B30] to-[#091525] shadow-2xl shadow-blue-950/40 md:grid-cols-2"
                >
                  {/* Image Side */}
                  <div
                    className="group relative min-h-[300px] overflow-hidden bg-[#142943] md:min-h-full"
                    style={{ perspective: "1000px" }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-700/20" />

                    {selectedDoctor.image ? (
                      <motion.img
                        src={selectedDoctor.image}
                        alt={selectedDoctor.name}
                        referrerPolicy="no-referrer"
                        initial={reduceMotion ? false : { scale: 1.12 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.8 }}
                        className="relative z-10 h-full min-h-[300px] w-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.04] md:absolute md:inset-0"
                      />
                    ) : (
                      <div className="flex h-full min-h-[300px] items-center justify-center text-7xl font-bold text-cyan-300">
                        {selectedDoctor.name.charAt(0)}
                      </div>
                    )}

                    <div className="absolute inset-x-0 bottom-0 z-20 h-40 bg-gradient-to-t from-[#0B192C] to-transparent md:h-52" />

                    <div className="absolute left-5 top-5 z-30 flex items-center gap-2 rounded-full border border-white/20 bg-black/30 px-3 py-2 text-xs font-semibold backdrop-blur-lg">
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      Verified Specialist
                    </div>

                    <div className="absolute bottom-5 left-5 z-30">
                      <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-300">
                        Featured Specialist
                      </p>
                      <p className="mt-1 text-sm text-white/80">
                        Trusted healthcare professional
                      </p>
                    </div>
                  </div>

                  {/* Details Side */}
                  <div className="flex flex-col justify-center p-6 sm:p-9 lg:p-10">

                    <span className="w-fit rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-xs font-semibold text-cyan-300">
                      {selectedDoctor.specialization}
                    </span>

                    <h2 className="mt-5 text-3xl font-bold leading-tight sm:text-4xl">
                      {selectedDoctor.name}
                    </h2>

                    <p className="mt-4 line-clamp-4 text-sm leading-7 text-slate-400">
                      {selectedDoctor.description ||
                        "Dedicated to providing quality healthcare and personalized treatment for every patient."}
                    </p>

                    <div className="mt-7 space-y-4 border-y border-white/10 py-5">

                      {(selectedDoctor.startTime ||
                        selectedDoctor.endTime) && (
                        <div className="flex items-center gap-3 text-sm text-slate-300">
                          <span className="rounded-lg bg-cyan-400/10 p-2.5 text-cyan-300">
                            <FiClock />
                          </span>
                          <div>
                            <p className="text-xs text-slate-500">
                              Available Hours
                            </p>
                            <p className="mt-1 font-medium">
                              {selectedDoctor.startTime || "N/A"} -{" "}
                              {selectedDoctor.endTime || "N/A"}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-3 text-sm text-slate-300">
                        <span className="rounded-lg bg-blue-400/10 p-2.5 text-blue-300">
                          <FiStar />
                        </span>
                        <div>
                          <p className="text-xs text-slate-500">
                            Consultation Fee
                          </p>
                          <p className="mt-1 font-medium">
                            {selectedDoctor.consultationFee !== undefined &&
                            selectedDoctor.consultationFee !== null
                              ? `${selectedDoctor.consultationFee} ৳`
                              : "Contact for fee"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Link
                      href={`/doctors/${selectedDoctor._id}`}
                      className="group mt-7 inline-flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4 text-sm font-bold shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-1 hover:shadow-cyan-500/20"
                    >
                      Book Appointment
                      <FiArrowRight className="transition-transform group-hover:translate-x-1" />
                    </Link>

                    <p className="mt-4 text-center text-xs text-slate-500">
                      Your health deserves the best care.
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            ) : (
              <div className="flex min-h-[540px] flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
                <FiCalendar className="mb-5 text-4xl text-cyan-400" />
                <h2 className="text-xl font-bold">
                  No Doctors Available
                </h2>
                <p className="mt-3 text-sm text-slate-400">
                  Approved doctors will appear here.
                </p>
                <Link
                  href="/doctors"
                  className="mt-5 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold"
                >
                  Explore Doctors
                </Link>
              </div>
            )}
          </div>

          {/* Doctor Sidebar */}
          <aside className="flex min-h-[540px] flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0C192A]/90 backdrop-blur-xl">

            <div className="border-b border-white/10 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold">
                    Our Doctors
                  </h3>
                  <p className="mt-1 text-xs text-slate-400">
                    Select a specialist
                  </p>
                </div>

                <span className="rounded-lg bg-blue-500/10 px-3 py-2 text-xs font-bold text-cyan-300">
                  {doctors.length} Doctors
                </span>
              </div>

              <div className="mt-5 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3">
                <FiSearch className="shrink-0 text-slate-500" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search doctor..."
                  className="w-full bg-transparent py-3 text-sm text-white outline-none placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto p-3 lg:max-h-[490px]">
              {filteredDoctors.map((doctor) => {
                const active =
                  selectedDoctor?._id === doctor._id;

                return (
                  <motion.button
                    key={doctor._id}
                    type="button"
                    onClick={() => selectDoctor(doctor)}
                    whileTap={reduceMotion ? {} : { scale: 0.98 }}
                    className={`group flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-all duration-300 ${
                      active
                        ? "border-cyan-400/40 bg-gradient-to-r from-blue-500/20 to-cyan-500/10 shadow-lg shadow-blue-950/20"
                        : "border-transparent bg-white/[0.025] hover:border-white/10 hover:bg-white/[0.07]"
                    }`}
                  >
                    <div
                      className={`h-14 w-14 shrink-0 overflow-hidden rounded-xl border ${
                        active
                          ? "border-cyan-400/50"
                          : "border-white/10"
                      }`}
                    >
                      {doctor.image ? (
                        <img
                          src={doctor.image}
                          alt={doctor.name}
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-slate-800 text-lg font-bold text-cyan-300">
                          {doctor.name.charAt(0)}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p
                        className={`truncate text-sm font-semibold ${
                          active ? "text-cyan-300" : "text-white"
                        }`}
                      >
                        {doctor.name}
                      </p>
                      <p className="mt-1 truncate text-xs text-slate-400">
                        {doctor.specialization}
                      </p>
                    </div>

                    <FiChevronRight
                      className={`shrink-0 transition-all ${
                        active
                          ? "translate-x-0 text-cyan-300"
                          : "-translate-x-1 text-slate-600 group-hover:translate-x-0 group-hover:text-white"
                      }`}
                    />
                  </motion.button>
                );
              })}

              {!loading && filteredDoctors.length === 0 && (
                <p className="py-10 text-center text-sm text-slate-500">
                  No matching doctors found.
                </p>
              )}
            </div>

            <div className="border-t border-white/10 p-4">
              <Link
                href="/doctors"
                className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-semibold text-slate-300 transition hover:border-cyan-400/30 hover:text-cyan-300"
              >
                View All Doctors
                <FiArrowRight />
              </Link>
            </div>
          </aside>
        </div>

        {/* Bottom Trust Bar */}
        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            {
              icon: <FiShield />,
              title: "Verified Professionals",
              desc: "Approved doctor profiles",
            },
            {
              icon: <FiCalendar />,
              title: "Easy Appointment",
              desc: "Simple online booking",
            },
            {
              icon: <FiClock />,
              title: "Convenient Scheduling",
              desc: "Explore available hours",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4"
            >
              <span className="rounded-xl bg-cyan-400/10 p-3 text-xl text-cyan-300">
                {item.icon}
              </span>
              <div>
                <p className="text-sm font-semibold text-white">
                  {item.title}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
