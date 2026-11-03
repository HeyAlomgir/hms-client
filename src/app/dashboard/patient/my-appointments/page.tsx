
"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { motion } from "framer-motion";

import {
  FiCalendar,
  FiClock,
  FiActivity,
  FiUser,
  FiAlertCircle,
} from "react-icons/fi";

interface DoctorDetails {
  name?: string;
  image?: string;
  specialization?: string;
}

interface Appointment {
  _id: string;
  status: string;
  date: string;
  createdAt: string;
  doctorDetails?: DoctorDetails;
}

// ================= STATUS COLORS =================

const statusStyles: Record<string, string> = {
  pending:
    "bg-amber-400/10 text-amber-400 border-amber-400/20",
  approved:
    "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
  confirmed:
    "bg-blue-400/10 text-blue-400 border-blue-400/20",
  cancelled:
    "bg-red-400/10 text-red-400 border-red-400/20",
  rejected:
    "bg-rose-400/10 text-rose-400 border-rose-400/20",
};

// ================= CARD THEMES =================

const cardThemes = [
  {
    border: "border-cyan-400/30",
    accent: "bg-cyan-400",
    icon: "bg-cyan-400/10 text-cyan-400",
    glow: "group-hover:shadow-cyan-500/10",
    ring: "ring-cyan-400/20",
  },
  {
    border: "border-purple-400/30",
    accent: "bg-purple-400",
    icon: "bg-purple-400/10 text-purple-400",
    glow: "group-hover:shadow-purple-500/10",
    ring: "ring-purple-400/20",
  },
  {
    border: "border-emerald-400/30",
    accent: "bg-emerald-400",
    icon: "bg-emerald-400/10 text-emerald-400",
    glow: "group-hover:shadow-emerald-500/10",
    ring: "ring-emerald-400/20",
  },
  {
    border: "border-orange-400/30",
    accent: "bg-orange-400",
    icon: "bg-orange-400/10 text-orange-400",
    glow: "group-hover:shadow-orange-500/10",
    ring: "ring-orange-400/20",
  },
  {
    border: "border-pink-400/30",
    accent: "bg-pink-400",
    icon: "bg-pink-400/10 text-pink-400",
    glow: "group-hover:shadow-pink-500/10",
    ring: "ring-pink-400/20",
  },
  {
    border: "border-indigo-400/30",
    accent: "bg-indigo-400",
    icon: "bg-indigo-400/10 text-indigo-400",
    glow: "group-hover:shadow-indigo-500/10",
    ring: "ring-indigo-400/20",
  },
];

// ================= INITIALS =================

const getInitials = (name?: string): string =>
  name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?";

// ================= DOCTOR AVATAR =================

function DoctorAvatar({
  image,
  name,
  theme,
}: {
  image?: string;
  name?: string;
  theme: (typeof cardThemes)[number];
}) {
  const [imgError, setImgError] = useState(false);

  if (!image || imgError) {
    return (
      <div
        className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/10 text-lg font-bold ${theme.icon}`}
      >
        {getInitials(name)}
      </div>
    );
  }

  return (
    <img
      src={image}
      alt={name || "Doctor"}
      referrerPolicy="no-referrer"
      onError={() => setImgError(true)}
      className={`h-16 w-16 shrink-0 rounded-2xl border border-white/10 object-cover ring-2 ${theme.ring}`}
    />
  );
}

// ================= DATE FORMAT =================

const formatDate = (date: string) => {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date unavailable";
  }

  return parsedDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatDateTime = (date: string) => {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date unavailable";
  }

  return parsedDate.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ================= ANIMATIONS =================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 35,
    rotateX: -8,
  },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: {
      duration: 0.55,
      ease: "easeOut" as const,
    },
  },
};

// ================= MAIN COMPONENT =================

export default function PatientDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [mounted, setMounted] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");

  const { data: session, isPending } = authClient.useSession();

  // ================= MOUNT =================

  useEffect(() => {
    setMounted(true);
  }, []);

  // ================= FETCH APPOINTMENTS =================

  useEffect(() => {
    if (isPending) return;

    const userId = session?.user?.id;

    if (!userId) {
      setAppointments([]);
      setLoadingData(false);
      return;
    }

    const controller = new AbortController();

    const fetchAppointments = async () => {
      try {
        setLoadingData(true);
        setError("");

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/my-appointments/${userId}`,
          { signal: controller.signal }
        );

        if (!res.ok) {
          throw new Error("Failed to fetch appointments.");
        }

        const data = await res.json();

        if (!data.success) {
          throw new Error(data.message || "Unable to load appointments.");
        }

        setAppointments(data.data || []);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;

        console.error("Appointment Error:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoadingData(false);
        }
      }
    };

    fetchAppointments();

    return () => controller.abort();
  }, [session?.user?.id, isPending]);

  // ================= LOADING =================

  if (!mounted || isPending || loadingData) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#0b1120]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-cyan-400/20 border-t-cyan-400" />

          <p className="animate-pulse text-sm font-medium text-cyan-300">
            Loading your appointments...
          </p>
        </div>
      </div>
    );
  }

  // ================= MAIN UI =================

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0b1120] px-4 py-7 text-white sm:px-6 lg:px-8">

      {/* BACKGROUND GLOW */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 top-20 h-80 w-80 rounded-full bg-cyan-500/10 blur-[120px]" />

        <div className="absolute -right-32 top-60 h-96 w-96 rounded-full bg-purple-500/10 blur-[130px]" />

        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-blue-500/5 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl space-y-8">

        {/* ================= HEADER ================= */}

        <motion.div
          initial={{ opacity: 0, y: -25 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center"
        >
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[3px] text-cyan-400">
              Patient Portal
            </p>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              My <span className="text-cyan-400">Appointments</span>
            </h1>

            <p className="mt-2 text-sm text-gray-400">
              Manage and track your doctor appointments.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-cyan-400/20 bg-[#111c30]/80 p-4 shadow-lg shadow-cyan-500/5 backdrop-blur-xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 text-xl shadow-lg shadow-cyan-500/20">
              <FiCalendar />
            </div>

            <div>
              <p className="text-xs text-gray-400">
                Total Appointments
              </p>

              <p className="text-2xl font-bold text-white">
                {appointments.length}
              </p>
            </div>
          </div>
        </motion.div>

        {/* ================= ERROR ================= */}

        {error && (
          <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
            <FiAlertCircle size={20} />
            {error}
          </div>
        )}

        {/* ================= QUICK SUMMARY ================= */}

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 gap-4 sm:grid-cols-3"
        >
          {[
            {
              label: "Total Appointments",
              value: appointments.length,
              icon: <FiCalendar />,
              color: "text-cyan-400",
              bg: "bg-cyan-400/10",
            },
            {
              label: "Pending",
              value: appointments.filter(
                (item) => item.status === "pending"
              ).length,
              icon: <FiClock />,
              color: "text-amber-400",
              bg: "bg-amber-400/10",
            },
            {
              label: "Confirmed / Approved",
              value: appointments.filter(
                (item) =>
                  item.status === "approved" ||
                  item.status === "confirmed"
              ).length,
              icon: <FiActivity />,
              color: "text-emerald-400",
              bg: "bg-emerald-400/10",
            },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              variants={cardVariants}
              whileHover={{ y: -6, scale: 1.02 }}
              className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#17243a] to-[#111827] p-5 shadow-xl shadow-black/20"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">
                    {stat.label}
                  </p>

                  <h2 className="mt-3 text-3xl font-bold text-white">
                    {stat.value}
                  </h2>
                </div>

                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl text-xl ${stat.bg} ${stat.color}`}
                >
                  {stat.icon}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ================= APPOINTMENT CARDS ================= */}

        <div>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">
                Appointment History
              </h2>

              <p className="mt-1 text-xs text-gray-400">
                Your booked doctor appointments
              </p>
            </div>

            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-gray-300">
              {appointments.length} Records
            </span>
          </div>

          {appointments.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl border border-dashed border-gray-700 bg-[#111827]/70 px-5 py-16 text-center"
            >
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-400/10 text-3xl text-cyan-400">
                <FiCalendar />
              </div>

              <h3 className="text-lg font-semibold text-white">
                No Appointments Yet
              </h3>

              <p className="mt-2 text-sm text-gray-400">
                Your booked appointments will appear here.
              </p>
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3"
            >
              {appointments.map((item, index) => {
                const doctor = item.doctorDetails;
                const theme = cardThemes[index % cardThemes.length];

                const statusStyle =
                  statusStyles[item.status] ||
                  "border-gray-500/20 bg-gray-500/10 text-gray-400";

                return (
                  <motion.div
                    key={item._id}
                    variants={cardVariants}
                    whileHover={{
                      y: -10,
                      rotateX: 4,
                      rotateY: index % 2 === 0 ? 3 : -3,
                      scale: 1.015,
                    }}
                    style={{
                      transformStyle: "preserve-3d",
                      perspective: 1000,
                    }}
                    className={`group relative overflow-hidden rounded-2xl border ${theme.border} bg-gradient-to-br from-[#17243a] via-[#111827] to-[#0f172a] p-5 shadow-xl shadow-black/20 transition-shadow duration-300 ${theme.glow}`}
                  >
                    {/* TOP ACCENT */}

                    <div
                      className={`absolute left-0 top-0 h-1 w-full ${theme.accent}`}
                    />

                    {/* DECORATIVE CIRCLE */}

                    <div
                      className={`absolute -right-12 -top-12 h-36 w-36 rounded-full opacity-[0.07] blur-2xl transition-all duration-500 group-hover:scale-150 ${theme.accent}`}
                    />

                    <div
                      className="relative space-y-5"
                      style={{ transform: "translateZ(20px)" }}
                    >
                      {/* DOCTOR INFO */}

                      <div className="flex items-center gap-3">
                        <DoctorAvatar
                          image={doctor?.image}
                          name={doctor?.name}
                          theme={theme}
                        />

                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-base font-bold text-white">
                            {doctor?.name || "Doctor"}
                          </h3>

                          <p className="mt-1 truncate text-xs text-gray-400">
                            {doctor?.specialization ||
                              "Medical Specialist"}
                          </p>
                        </div>
                      </div>

                      {/* DIVIDER */}

                      <div className="h-px bg-gradient-to-r from-white/10 via-white/5 to-transparent" />

                      {/* STATUS */}

                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs font-medium text-gray-400">
                          Appointment Status
                        </span>

                        <span
                          className={`rounded-full border px-3 py-1.5 text-xs font-semibold capitalize ${statusStyle}`}
                        >
                          {item.status}
                        </span>
                      </div>

                      {/* APPOINTMENT DATE */}

                      <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-black/20 p-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-lg text-lg ${theme.icon}`}
                        >
                          <FiCalendar />
                        </div>

                        <div className="min-w-0">
                          <p className="text-[11px] text-gray-500">
                            Appointment Date
                          </p>

                          <p className="mt-1 truncate text-sm font-semibold text-white">
                            {formatDate(item.date)}
                          </p>
                        </div>
                      </div>

                      {/* BOOKING DATE */}

                      <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-black/20 p-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-400/10 text-lg text-purple-400">
                          <FiClock />
                        </div>

                        <div className="min-w-0">
                          <p className="text-[11px] text-gray-500">
                            Booking Created
                          </p>

                          <p className="mt-1 truncate text-sm font-medium text-gray-300">
                            {formatDateTime(item.createdAt)}
                          </p>
                        </div>
                      </div>

                      {/* FOOTER */}

                      <div className="flex items-center justify-between border-t border-white/5 pt-3">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <FiUser />
                          Patient Appointment
                        </div>

                        <span
                          className={`h-2 w-2 rounded-full ${theme.accent} shadow-lg`}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>

        {/* ================= FOOTER ================= */}

        <div className="border-t border-white/5 pt-5 text-center">
          <p className="text-xs text-gray-500">
            CarePulse Healthcare Management System
            <span className="mx-2 text-cyan-500">•</span>
            My Appointments
          </p>
        </div>
      </div>
    </div>
  );
}
