
"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { motion, useMotionValue, useSpring } from "framer-motion";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  Area,
  AreaChart,
} from "recharts";

import {
  FiUsers,
  FiUserCheck,
  FiCalendar,
  FiTrendingUp,
  FiActivity,
  FiRefreshCw,
  FiAlertCircle,
} from "react-icons/fi";

interface AnalyticsData {
  totalPatients: number;
  totalDoctors: number;
  totalAppointments: number;
  statusStats: { _id: string; count: number }[];
  monthlyStats: { _id: number; count: number }[];
}

const COLORS = [
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#f43f5e",
];

const monthMap = [
  "Jan", "Feb", "Mar", "Apr",
  "May", "Jun", "Jul", "Aug",
  "Sep", "Oct", "Nov", "Dec",
];

// 3D Tilt Card
function TiltCard({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(x, {
    stiffness: 180,
    damping: 18,
  });

  const rotateY = useSpring(y, {
    stiffness: 180,
    damping: 18,
  });

  const handleMouseMove = (
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    const rect = event.currentTarget.getBoundingClientRect();

    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const rotateAmountX =
      ((mouseY / rect.height) - 0.5) * -12;

    const rotateAmountY =
      ((mouseX / rect.width) - 0.5) * 12;

    x.set(rotateAmountX);
    y.set(rotateAmountY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 35, rotateX: -8 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{
        duration: 0.7,
        delay,
        ease: "easeOut",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 1000,
        transformStyle: "preserve-3d",
      }}
      className={`group relative ${className}`}
    >
      {children}
    </motion.div>
  );
}

// Animated Number
function AnimatedNumber({
  value,
}: {
  value: number;
}) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let frame = 0;
    const duration = 1000;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const progress = Math.min(
        (currentTime - startTime) / duration,
        1
      );

      const eased = 1 - Math.pow(1 - progress, 3);

      setDisplayValue(
        Math.round(eased * value)
      );

      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    };

    frame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frame);
  }, [value]);

  return (
    <span>
      {displayValue.toLocaleString()}
    </span>
  );
}

export default function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin-analytics`,
        {
          cache: "no-store",
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch analytics");
      }

      const json = await res.json();

      if (!json.data) {
        throw new Error("Invalid analytics response");
      }

      setData(json.data);

      if (isRefresh) {
        toast.success("Analytics updated successfully");
      }
    } catch (error) {
      console.error("Analytics Error:", error);
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const monthlyData =
    data?.monthlyStats?.map((item) => ({
      name: monthMap[item._id - 1] || "Unknown",
      count: item.count,
    })) || [];

  const statusData = data?.statusStats || [];

  const stats = [
    {
      title: "Total Patients",
      value: data?.totalPatients || 0,
      icon: FiUsers,
      color: "from-cyan-500 to-blue-600",
      shadow: "shadow-cyan-500/20",
      description: "Registered patients",
    },
    {
      title: "Total Doctors",
      value: data?.totalDoctors || 0,
      icon: FiUserCheck,
      color: "from-violet-500 to-purple-600",
      shadow: "shadow-purple-500/20",
      description: "Medical professionals",
    },
    {
      title: "Appointments",
      value: data?.totalAppointments || 0,
      icon: FiCalendar,
      color: "from-emerald-500 to-teal-600",
      shadow: "shadow-emerald-500/20",
      description: "Total appointments",
    },
  ];

  // Loading State
  if (loading) {
    return (
      <div className="relative flex min-h-[500px] items-center justify-center overflow-hidden bg-[#080f1e] p-6 text-white">
        <div className="absolute h-64 w-64 animate-pulse rounded-full bg-cyan-500/10 blur-[100px]" />

        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            repeat: Infinity,
            duration: 1.5,
            ease: "linear",
          }}
          className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10 text-3xl text-cyan-400"
        >
          <FiActivity />
        </motion.div>
      </div>
    );
  }

  // Error / Empty State
  if (!data) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center bg-[#080f1e] p-6 text-center text-white">
        <FiAlertCircle className="mb-4 text-5xl text-rose-400" />

        <h2 className="text-xl font-bold">
          Analytics Unavailable
        </h2>

        <p className="mt-2 text-sm text-slate-400">
          Unable to retrieve dashboard information.
        </p>

        <button
          onClick={() => fetchAnalytics()}
          className="mt-5 flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-cyan-400"
        >
          <FiRefreshCw />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#080f1e] p-4 text-white sm:p-6 lg:p-8">

      {/* Background Effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 40, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -left-40 top-20 h-[450px] w-[450px] rounded-full bg-blue-600/10 blur-[130px]"
        />

        <motion.div
          animate={{
            x: [0, -30, 0],
            y: [0, 40, 0],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -right-40 bottom-0 h-[450px] w-[450px] rounded-full bg-cyan-500/10 blur-[130px]"
        />

        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
            backgroundSize: "45px 45px",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl space-y-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center"
        >
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[3px] text-cyan-400">
              <FiActivity />
              CarePulse Control Center
            </div>

            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
              Analytics{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Dashboard
              </span>
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Monitor your hospital performance and activities.
            </p>
          </div>

          <button
            onClick={() => fetchAnalytics(true)}
            disabled={refreshing}
            className="flex items-center justify-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-5 py-3 text-sm font-bold text-cyan-300 transition hover:border-cyan-400/50 hover:bg-cyan-400/20 disabled:opacity-50"
          >
            <motion.span
              animate={refreshing ? { rotate: 360 } : {}}
              transition={{
                duration: 1,
                repeat: refreshing ? Infinity : 0,
                ease: "linear",
              }}
            >
              <FiRefreshCw />
            </motion.span>

            {refreshing ? "Refreshing..." : "Refresh Data"}
          </button>
        </motion.div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">

          {stats.map((stat, index) => {
            const Icon = stat.icon;

            return (
              <TiltCard
                key={stat.title}
                delay={index * 0.15}
                className="h-full"
              >
                <div className="relative h-full overflow-hidden rounded-3xl border border-white/10 bg-white/[0.045] p-6 shadow-xl shadow-black/20 backdrop-blur-xl transition duration-500 hover:border-white/20">

                  {/* Glow */}
                  <div
                    className={`absolute -right-10 -top-10 h-36 w-36 rounded-full bg-gradient-to-br ${stat.color} opacity-10 blur-3xl transition duration-500 group-hover:opacity-30`}
                  />

                  <div className="relative flex items-start justify-between">

                    <div>
                      <p className="text-sm font-semibold text-slate-400">
                        {stat.title}
                      </p>

                      <h2 className="mt-4 text-4xl font-black tracking-tight text-white sm:text-5xl">
                        <AnimatedNumber value={stat.value} />
                      </h2>

                      <p className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                        <FiTrendingUp className="text-emerald-400" />
                        {stat.description}
                      </p>
                    </div>

                    <motion.div
                      whileHover={{
                        rotateY: 180,
                        scale: 1.12,
                      }}
                      transition={{ duration: 0.5 }}
                      className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${stat.color} text-2xl text-white shadow-xl ${stat.shadow}`}
                      style={{ transformStyle: "preserve-3d" }}
                    >
                      <Icon />
                    </motion.div>
                  </div>

                  <div className="relative mt-6 h-1.5 overflow-hidden rounded-full bg-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "75%" }}
                      transition={{
                        duration: 1.2,
                        delay: index * 0.2,
                      }}
                      className={`h-full rounded-full bg-gradient-to-r ${stat.color}`}
                    />
                  </div>
                </div>
              </TiltCard>
            );
          })}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

          {/* Appointment Status Pie */}
          <TiltCard delay={0.3}>
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.045] p-5 shadow-xl shadow-black/20 backdrop-blur-xl sm:p-6">

              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[2px] text-cyan-400">
                    Performance
                  </p>

                  <h2 className="mt-2 text-xl font-extrabold text-white">
                    Appointment Status
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Distribution of appointment statuses
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-xl text-cyan-400">
                  <FiActivity />
                </div>
              </div>

              {statusData.length > 0 ? (
                <>
                  <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusData}
                          dataKey="count"
                          nameKey="_id"
                          cx="50%"
                          cy="50%"
                          innerRadius={65}
                          outerRadius={105}
                          paddingAngle={5}
                          cornerRadius={7}
                          stroke="none"
                          animationBegin={200}
                          animationDuration={1300}
                        >
                          {statusData.map((item, index) => (
                            <Cell
                              key={`${item._id}-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>

                        <Tooltip
                          contentStyle={{
                            background: "#101d31",
                            border: "1px solid #334155",
                            borderRadius: "12px",
                            color: "#fff",
                          }}
                          itemStyle={{ color: "#fff" }}
                          formatter={(value) => [
                            Number(value ?? 0),
                            "Appointments",
                          ]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Chart Legend */}
                  <div className="mt-3 flex flex-wrap justify-center gap-4">
                    {statusData.map((item, index) => (
                      <div
                        key={`${item._id}-legend`}
                        className="flex items-center gap-2 text-xs text-slate-400"
                      >
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{
                            backgroundColor:
                              COLORS[index % COLORS.length],
                          }}
                        />
                        <span className="capitalize">
                          {item._id}
                        </span>
                        <span className="font-bold text-white">
                          {item.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex h-[280px] items-center justify-center text-sm text-slate-500">
                  No appointment status data available.
                </div>
              )}
            </div>
          </TiltCard>

          {/* Monthly Appointments */}
          <TiltCard delay={0.45}>
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.045] p-5 shadow-xl shadow-black/20 backdrop-blur-xl sm:p-6">

              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[2px] text-blue-400">
                    Monthly Report
                  </p>

                  <h2 className="mt-2 text-xl font-extrabold text-white">
                    Appointment Trends
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Monthly appointment activity
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-400/10 text-xl text-blue-400">
                  <FiTrendingUp />
                </div>
              </div>

              {monthlyData.length > 0 ? (
                <div className="h-[320px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={monthlyData}
                      margin={{
                        top: 15,
                        right: 10,
                        left: -20,
                        bottom: 5,
                      }}
                    >
                      <defs>
                        <linearGradient
                          id="appointmentGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#06b6d4"
                            stopOpacity={0.35}
                          />
                          <stop
                            offset="95%"
                            stopColor="#06b6d4"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>

                      <CartesianGrid
                        strokeDasharray="4 4"
                        stroke="#334155"
                        vertical={false}
                      />

                      <XAxis
                        dataKey="name"
                        stroke="#64748b"
                        tick={{
                          fill: "#94a3b8",
                          fontSize: 11,
                        }}
                        axisLine={false}
                        tickLine={false}
                      />

                      <YAxis
                        stroke="#64748b"
                        tick={{
                          fill: "#94a3b8",
                          fontSize: 11,
                        }}
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false}
                      />

                      <Tooltip
                        contentStyle={{
                          background: "#101d31",
                          border: "1px solid #334155",
                          borderRadius: "12px",
                          color: "#fff",
                        }}
                        itemStyle={{ color: "#22d3ee" }}
                        formatter={(value) => [
                          Number(value ?? 0),
                          "Appointments",
                        ]}
                      />

                      <Area
                        type="monotone"
                        dataKey="count"
                        stroke="#06b6d4"
                        strokeWidth={3}
                        fill="url(#appointmentGradient)"
                        activeDot={{
                          r: 7,
                          fill: "#22d3ee",
                          stroke: "#fff",
                          strokeWidth: 2,
                        }}
                        animationDuration={1500}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex h-[320px] items-center justify-center text-sm text-slate-500">
                  No monthly appointment data available.
                </div>
              )}
            </div>
          </TiltCard>
        </div>

        {/* Bottom Summary */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="relative overflow-hidden rounded-3xl border border-cyan-400/15 bg-gradient-to-r from-blue-600/15 via-cyan-500/10 to-indigo-600/15 p-6"
        >
          <div className="pointer-events-none absolute -right-10 -top-20 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="relative flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div>
              <div className="flex items-center gap-2 text-cyan-400">
                <FiActivity />
                <span className="text-xs font-bold uppercase tracking-[2px]">
                  CarePulse Analytics
                </span>
              </div>

              <h3 className="mt-2 text-lg font-extrabold text-white">
                Hospital Performance Overview
              </h3>

              <p className="mt-1 text-xs text-slate-400">
                Data is provided by your hospital analytics API.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-bold text-emerald-400">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              Dashboard Active
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
