
"use client";

import { authClient } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

// ================= TYPES =================

interface Appointment {
  _id: string;
  patientId: string;
  doctorId: string;
  date: string;
  status: "pending" | "completed" | "approved";
  doctorDetails?: {
    name: string;
    specialization?: string;
    consultationFee?: number | string;
    image?: string;
  };
}

interface ChartData {
  name: string;
  appointments: number;
}

// ================= ANIMATION =================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 25, rotateX: -8 },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: { duration: 0.55, ease: "easeOut" as const },
  },
};

// ================= COMPONENT =================

export default function PatientDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;

  // ================= FETCH APPOINTMENTS =================

  useEffect(() => {
    if (!userId) return;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/my-appointments/${userId}`
        );

        if (!res.ok) {
          throw new Error("Failed to fetch appointments");
        }

        const data = await res.json();

        if (data.success) {
          setAppointments(data.data || []);
        } else {
          setError(data.message || "Unable to load dashboard data.");
        }
      } catch (err) {
        console.error("Dashboard Error:", err);
        setError("Something went wrong while loading your appointments.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [userId]);

  // ================= SUMMARY DATA =================

  const totalAppointments = appointments.length;

  const pendingCount = appointments.filter(
    (app) => app.status === "pending"
  ).length;

  const completedCount = appointments.filter(
    (app) => app.status === "completed"
  ).length;

  const approvedCount = appointments.filter(
    (app) => app.status === "approved"
  ).length;

  const totalPaid = appointments.reduce((sum, app) => {
    return sum + (Number(app.doctorDetails?.consultationFee) || 0);
  }, 0);

  // ================= CHART DATA =================

  const generateChartData = (): ChartData[] => {
    const daysMap: Record<string, number> = {
      Sun: 0,
      Mon: 0,
      Tue: 0,
      Wed: 0,
      Thu: 0,
      Fri: 0,
      Sat: 0,
    };

    appointments.forEach((app) => {
      const appDate = new Date(app.date);

      if (Number.isNaN(appDate.getTime())) return;

      const dayName = appDate.toLocaleDateString("en-US", {
        weekday: "short",
      });

      if (daysMap[dayName] !== undefined) {
        daysMap[dayName] += 1;
      }
    });

    return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
      (day) => ({
        name: day,
        appointments: daysMap[day],
      })
    );
  };

  // ================= LOADING =================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f172a]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-cyan-400/20 border-t-cyan-400" />
          <p className="animate-pulse text-sm font-medium text-cyan-300">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  // ================= ERROR =================

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f172a] p-6">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-8 text-center">
          <p className="mb-3 text-lg font-semibold text-red-400">
            Dashboard Error
          </p>
          <p className="text-sm text-gray-300">{error}</p>
        </div>
      </div>
    );
  }

  // ================= SUMMARY CARDS =================

  const summaryCards = [
    {
      title: "Total Appointments",
      value: totalAppointments,
      subtitle: "All your appointments",
      icon: "📅",
      gradient: "from-blue-600 to-indigo-700",
      glow: "shadow-blue-500/20",
    },
    {
      title: "Pending",
      value: pendingCount,
      subtitle: "Waiting for confirmation",
      icon: "⏳",
      gradient: "from-amber-500 to-orange-600",
      glow: "shadow-orange-500/20",
    },
    {
      title: "Completed",
      value: completedCount,
      subtitle: "Successfully completed",
      icon: "✓",
      gradient: "from-emerald-500 to-teal-700",
      glow: "shadow-emerald-500/20",
    },
    {
      title: "Total Fees",
      value: `৳${totalPaid.toLocaleString()}`,
      subtitle: "Combined consultation fees",
      icon: "৳",
      gradient: "from-purple-600 to-fuchsia-700",
      glow: "shadow-purple-500/20",
    },
  ];

  const statusStyles: Record<string, string> = {
    pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    approved: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  };

  const accentColors = [
    "border-l-cyan-400",
    "border-l-purple-400",
    "border-l-emerald-400",
    "border-l-orange-400",
    "border-l-pink-400",
  ];

  // ================= MAIN UI =================

  return (
    <div className="min-h-screen overflow-hidden bg-[#0b1120] px-4 py-6 text-white sm:px-6 lg:px-8">

      {/* BACKGROUND EFFECTS */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute -right-40 top-80 h-96 w-96 rounded-full bg-purple-600/10 blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-cyan-500/5 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl space-y-8">

        {/* ================= HEADER ================= */}

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"
        >
          <div>
            <p className="mb-2 text-sm font-medium uppercase tracking-[3px] text-cyan-400">
              Patient Portal
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Dashboard
              <span className="ml-2 text-cyan-400">Overview</span>
            </h1>

            <p className="mt-2 text-sm text-gray-400">
              Manage your appointments and monitor your healthcare activity.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-cyan-400/20 bg-[#111c30]/80 px-4 py-3 shadow-lg shadow-cyan-500/5 backdrop-blur-xl">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 text-xl shadow-lg shadow-cyan-500/20">
              🏥
            </div>
            <div>
              <p className="text-sm font-semibold text-white">CarePulse</p>
              <p className="text-xs text-emerald-400">
                ● Patient Dashboard
              </p>
            </div>
          </div>
        </motion.div>

        {/* ================= SUMMARY CARDS ================= */}

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4"
        >
          {summaryCards.map((card, index) => (
            <motion.div
              key={card.title}
              variants={itemVariants}
              whileHover={{
                y: -9,
                rotateX: 5,
                rotateY: index % 2 === 0 ? 4 : -4,
                scale: 1.02,
              }}
              style={{ transformStyle: "preserve-3d", perspective: 1000 }}
              className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${card.gradient} p-[1px] shadow-xl ${card.glow}`}
            >
              <div className="relative h-full overflow-hidden rounded-2xl bg-[#111827]/95 p-5">
                <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/5 blur-2xl transition-all duration-500 group-hover:scale-150" />

                <div
                  className="relative flex items-start justify-between"
                  style={{ transform: "translateZ(25px)" }}
                >
                  <div>
                    <p className="text-sm font-medium text-gray-400">
                      {card.title}
                    </p>

                    <h2 className="mt-3 text-3xl font-bold tracking-tight text-white">
                      {card.value}
                    </h2>

                    <p className="mt-2 text-xs text-gray-500">
                      {card.subtitle}
                    </p>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-white/15 to-white/5 text-2xl shadow-lg">
                    {card.icon}
                  </div>
                </div>

                <div className="relative mt-6 h-1 overflow-hidden rounded-full bg-white/10">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${card.gradient} transition-all duration-700 group-hover:w-full`}
                    style={{ width: `${35 + index * 15}%` }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ================= CHART + QUICK STATS ================= */}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

          {/* CHART */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ y: -4 }}
            className="rounded-2xl border border-cyan-500/15 bg-gradient-to-br from-[#17243a] to-[#111827] p-5 shadow-xl shadow-black/20 sm:p-6 xl:col-span-2"
          >
            <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-white">
                  Appointment Activity
                </h2>
                <p className="mt-1 text-xs text-gray-400">
                  Appointment distribution by weekday
                </p>
              </div>

              <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-xs font-medium text-cyan-300">
                Weekly Overview
              </div>
            </div>

            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={generateChartData()}
                  margin={{ top: 10, right: 15, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="appointmentGradient"
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="0"
                    >
                      <stop offset="0%" stopColor="#06b6d4" />
                      <stop offset="100%" stopColor="#818cf8" />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    stroke="#334155"
                    strokeDasharray="4 5"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="name"
                    stroke="#64748b"
                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    dy={10}
                  />

                  <YAxis
                    allowDecimals={false}
                    stroke="#64748b"
                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#111827",
                      border: "1px solid #334155",
                      borderRadius: "12px",
                      color: "#fff",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                    }}
                    labelStyle={{ color: "#22d3ee" }}
                  />

                  <Line
                    type="monotone"
                    dataKey="appointments"
                    name="Appointments"
                    stroke="url(#appointmentGradient)"
                    strokeWidth={4}
                    dot={{
                      fill: "#06b6d4",
                      stroke: "#111827",
                      strokeWidth: 3,
                      r: 5,
                    }}
                    activeDot={{
                      r: 8,
                      fill: "#818cf8",
                      stroke: "#fff",
                      strokeWidth: 2,
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* QUICK STATS */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col justify-between rounded-2xl border border-purple-500/15 bg-gradient-to-br from-[#251c40] to-[#111827] p-6 shadow-xl shadow-black/20"
          >
            <div>
              <p className="text-sm font-medium text-purple-300">
                Appointment Summary
              </p>

              <h2 className="mt-2 text-xl font-bold text-white">
                Your Healthcare Activity
              </h2>
            </div>

            <div className="my-6 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="h-3 w-3 rounded-full bg-amber-400" />
                  <span className="text-sm text-gray-300">Pending</span>
                </div>
                <span className="font-bold text-white">{pendingCount}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="h-3 w-3 rounded-full bg-blue-400" />
                  <span className="text-sm text-gray-300">Approved</span>
                </div>
                <span className="font-bold text-white">{approvedCount}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="h-3 w-3 rounded-full bg-emerald-400" />
                  <span className="text-sm text-gray-300">Completed</span>
                </div>
                <span className="font-bold text-white">{completedCount}</span>
              </div>
            </div>

            <div className="rounded-xl border border-purple-400/20 bg-purple-400/10 p-4">
              <p className="text-xs text-purple-200">
                Total appointments
              </p>
              <p className="mt-1 text-3xl font-bold text-white">
                {totalAppointments}
              </p>
            </div>
          </motion.div>
        </div>

        {/* ================= RECENT APPOINTMENTS ================= */}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#17243a] to-[#111827] p-5 shadow-xl shadow-black/20 sm:p-6"
        >
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-white">
                Recent Appointments
              </h2>
              <p className="mt-1 text-xs text-gray-400">
                Your latest doctor appointments
              </p>
            </div>

            <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs font-medium text-emerald-300">
              {appointments.length} Total Records
            </div>
          </div>

          <div className="space-y-3">
            {appointments.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-700 bg-[#0b1120]/50 py-12 text-center">
                <div className="mb-3 text-4xl">🗓️</div>
                <p className="font-medium text-gray-300">
                  No appointments found
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Your appointments will appear here.
                </p>
              </div>
            ) : (
              appointments.slice(0, 5).map((app, index) => {
                const doctorName =
                  app.doctorDetails?.name || "Unknown Doctor";

                const initials = doctorName
                  .split(" ")
                  .map((name) => name[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();

                const formattedDate = new Date(app.date).toLocaleDateString(
                  "en-US",
                  {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  }
                );

                const validDate = !Number.isNaN(
                  new Date(app.date).getTime()
                );

                return (
                  <motion.div
                    key={app._id}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.08 }}
                    whileHover={{
                      x: 5,
                      scale: 1.005,
                    }}
                    className={`flex flex-col justify-between gap-4 rounded-xl border border-white/5 border-l-4 ${accentColors[index % accentColors.length]} bg-[#0b1120]/70 p-4 transition-colors hover:bg-[#1e293b]/80 sm:flex-row sm:items-center`}
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      {app.doctorDetails?.image ? (
                        <img
                          src={app.doctorDetails.image}
                          alt={doctorName}
                          className="h-14 w-14 shrink-0 rounded-xl border border-white/10 object-cover shadow-lg"
                        />
                      ) : (
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/30 to-blue-600/30 text-lg font-bold text-cyan-300">
                          {initials}
                        </div>
                      )}

                      <div className="min-w-0">
                        <h3 className="truncate font-semibold text-white">
                          {doctorName}
                        </h3>

                        <p className="mt-1 truncate text-xs text-gray-400">
                          {app.doctorDetails?.specialization ||
                            "Medical Specialist"}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {validDate ? formattedDate : "Date unavailable"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                      <div>
                        <p className="text-xs text-gray-500">
                          Consultation Fee
                        </p>
                        <p className="mt-1 font-semibold text-white">
                          ৳
                          {(
                            Number(app.doctorDetails?.consultationFee) || 0
                          ).toLocaleString()}
                        </p>
                      </div>

                      <span
                        className={`rounded-full border px-3 py-1.5 text-xs font-semibold capitalize ${
                          statusStyles[app.status] ||
                          "border-gray-500/20 bg-gray-500/10 text-gray-400"
                        }`}
                      >
                        {app.status}
                      </span>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </motion.div>

        {/* ================= FOOTER ================= */}

        <div className="border-t border-white/5 pt-5 text-center">
          <p className="text-xs text-gray-500">
            CarePulse Healthcare Management System
            <span className="mx-2 text-cyan-500">•</span>
            Patient Dashboard
          </p>
        </div>

      </div>
    </div>
  );
}
