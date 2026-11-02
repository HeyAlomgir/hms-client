
"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiUsers,
  FiUserCheck,
  FiClock,
  FiUserX,
  FiSearch,
  FiRefreshCw,
  FiCheckCircle,
  FiTrash2,
  FiPlus,
  FiActivity,
  FiAward,
  FiShield,
} from "react-icons/fi";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";

interface Doctor {
  _id: string;
  name: string;
  email: string;
  specialization: string;
  status: string;
  createdAt?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

const cardVariants = {
  hidden: { opacity: 0, y: 35, rotateX: 15 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: { delay: i * 0.1, duration: 0.55 },
  }),
};

function StatCard({
  title,
  value,
  icon,
  color,
  index,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  index: number;
}) {
  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{
        y: -9,
        rotateY: 5,
        rotateX: -4,
        scale: 1.025,
      }}
      style={{ perspective: 1000, transformStyle: "preserve-3d" }}
      className="min-w-0"
    >
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#111827]/90 p-5 shadow-xl backdrop-blur-xl">
        <div
          className={`absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl opacity-20 ${color}`}
        />

        <div className="relative flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-gray-400">{title}</p>
            <motion.h2
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 + 0.3 }}
              className="mt-3 text-3xl font-bold text-white"
            >
              {value}
            </motion.h2>
            <p className="mt-2 text-xs text-gray-500">
              Doctor records
            </p>
          </div>

          <div
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${color} bg-opacity-20 text-white shadow-lg`}
          >
            {icon}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
  index,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15, duration: 0.6 }}
      whileHover={{ y: -4 }}
      className="min-w-0 rounded-2xl border border-white/10 bg-[#111827]/90 p-4 shadow-xl backdrop-blur-xl sm:p-5"
    >
      <h3 className="font-semibold text-white">{title}</h3>
      <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
      <div className="mt-5 h-[250px] w-full">{children}</div>
    </motion.div>
  );
}

function LoadingScreen() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <FiRefreshCw className="mx-auto animate-spin text-3xl text-blue-500" />
        <p className="mt-4 text-sm text-gray-400">Loading Doctors...</p>
      </div>
    </div>
  );
}

export default function AllDoctorPage() {
  const router = useRouter();

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [actionId, setActionId] = useState<string | null>(null);
  const [error, setError] = useState("");

  // Fetch all doctors
  const loadDoctors = useCallback(async (manual = false) => {
    try {
      if (manual) setRefreshing(true);
      else setLoading(true);

      setError("");

      const res = await fetch(
        `${API_URL}/api/doctors?status=all`,
        { cache: "no-store" }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch doctor records.");
      }

      const data = await res.json();

      if (!Array.isArray(data)) {
        throw new Error("Invalid doctors API response.");
      }

      setDoctors(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDoctors();
  }, [loadDoctors]);

  // Summary
  const total = doctors.length;

  const approved = doctors.filter(
    (doc) => doc.status === "approved"
  ).length;

  const pending = doctors.filter(
    (doc) => doc.status === "pending"
  ).length;

  const rejected = doctors.filter(
    (doc) => doc.status === "rejected"
  ).length;

  // Specialization Chart
  const specializationData = useMemo(() => {
    const counts: Record<string, number> = {};

    doctors.forEach((doc) => {
      const name = doc.specialization?.trim() || "Not specified";
      counts[name] = (counts[name] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [doctors]);

  // Status Pie Chart
  const statusData = [
    { name: "Approved", value: approved },
    { name: "Pending", value: pending },
    { name: "Rejected", value: rejected },
  ];

  const statusColors = ["#10b981", "#f59e0b", "#ef4444"];

  // Registration trend (based on available createdAt)
  const trendData = useMemo(() => {
    const counts: Record<string, number> = {};

    doctors.forEach((doc) => {
      if (!doc.createdAt) return;

      const date = new Date(doc.createdAt);
      if (Number.isNaN(date.getTime())) return;

      const key = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      counts[key] = (counts[key] || 0) + 1;
    });

    return Object.entries(counts).map(([date, count]) => ({
      date,
      count,
    }));
  }, [doctors]);

  // Search + Filter
  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch =
      doc.name?.toLowerCase().includes(search.toLowerCase()) ||
      doc.email?.toLowerCase().includes(search.toLowerCase()) ||
      doc.specialization?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      filter === "all" || doc.status === filter;

    return matchesSearch && matchesStatus;
  });

  // Approve Doctor
  const handleApprove = async (id: string) => {
    if (!window.confirm("Are you sure you want to approve this doctor?")) {
      return;
    }

    try {
      setActionId(id);

      const res = await fetch(
        `${API_URL}/api/doctors/approve/${id}`,
        { method: "PATCH" }
      );

      if (!res.ok) throw new Error("Doctor approval failed.");

      await loadDoctors(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Approval failed.");
    } finally {
      setActionId(null);
    }
  };

  // Delete Doctor
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this doctor?")) {
      return;
    }

    try {
      setActionId(id);

      const res = await fetch(`${API_URL}/api/doctors/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Doctor deletion failed.");

      await loadDoctors(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setActionId(null);
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#080b14] p-4 text-white sm:p-6 lg:p-8">

      {/* Background 3D Effects */}
      <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-blue-600/10 blur-[120px]" />
      <div className="pointer-events-none absolute -right-40 top-80 h-96 w-96 rounded-full bg-purple-600/10 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-[1600px]">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -25 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-center"
        >
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              <p className="text-xs font-bold uppercase tracking-[3px] text-emerald-400">
                Admin Control Center
              </p>
            </div>

            <h1 className="text-2xl font-bold sm:text-3xl lg:text-4xl">
              Doctor Management
            </h1>

            <p className="mt-2 text-sm text-gray-400">
              Monitor doctor applications, approvals and specializations.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => loadDoctors(true)}
              disabled={refreshing}
              className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm transition hover:bg-white/10 disabled:opacity-50"
            >
              <FiRefreshCw className={refreshing ? "animate-spin" : ""} />
              Refresh
            </button>

            <button
              onClick={() => router.push("/dashboard/admin/add-doctor")}
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
            >
              <FiPlus />
              Add Doctor
            </button>
          </div>
        </motion.div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
            <button
              onClick={() => loadDoctors(true)}
              className="ml-3 underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Summary Cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Doctors"
            value={total}
            icon={<FiUsers size={25} />}
            color="bg-blue-500"
            index={0}
          />

          <StatCard
            title="Approved Doctors"
            value={approved}
            icon={<FiUserCheck size={25} />}
            color="bg-emerald-500"
            index={1}
          />

          <StatCard
            title="Pending Applications"
            value={pending}
            icon={<FiClock size={25} />}
            color="bg-amber-500"
            index={2}
          />

          <StatCard
            title="Rejected Doctors"
            value={rejected}
            icon={<FiUserX size={25} />}
            color="bg-red-500"
            index={3}
          />
        </div>

        {/* Charts */}
        <div className="mb-8 grid grid-cols-1 gap-5 xl:grid-cols-3">

          {/* Specialization Chart */}
          <ChartCard
            title="Doctors by Specialization"
            subtitle="Number of doctors in each specialization"
            index={0}
          >
            {specializationData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={specializationData}
                  margin={{ top: 10, right: 5, left: -20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#273449" />
                  <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                    fontSize={10}
                    angle={-20}
                    textAnchor="end"
                    height={55}
                  />
                  <YAxis stroke="#94a3b8" allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      background: "#111827",
                      border: "1px solid #374151",
                      borderRadius: 10,
                      color: "#fff",
                    }}
                  />
                  <Bar
                    dataKey="count"
                    name="Doctors"
                    fill="#3b82f6"
                    radius={[7, 7, 0, 0]}
                    animationDuration={1400}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="flex h-full items-center justify-center text-sm text-gray-500">
                No specialization data
              </p>
            )}
          </ChartCard>

          {/* Approval Status */}
          <ChartCard
            title="Approval Overview"
            subtitle="Approved, pending and rejected doctors"
            index={1}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="48%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={5}
                  label
                  animationDuration={1300}
                >
                  {statusData.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={statusColors[index]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#111827",
                    border: "1px solid #374151",
                    borderRadius: 10,
                    color: "#fff",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-4 text-xs">
              {statusData.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: statusColors[index] }}
                  />
                  <span className="text-gray-400">
                    {item.name}: {item.value}
                  </span>
                </div>
              ))}
            </div>
          </ChartCard>

          {/* Registration Trend */}
          <ChartCard
            title="Registration Activity"
            subtitle="Doctor registrations by available date"
            index={2}
          >
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="doctorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#273449" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      background: "#111827",
                      border: "1px solid #374151",
                      borderRadius: 10,
                      color: "#fff",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    name="Registrations"
                    stroke="#8b5cf6"
                    fill="url(#doctorGradient)"
                    strokeWidth={3}
                    animationDuration={1400}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="flex h-full items-center justify-center text-sm text-gray-500">
                No registration date available
              </p>
            )}
          </ChartCard>
        </div>

        {/* Doctor List */}
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111827]/90 shadow-2xl">

          {/* List Header */}
          <div className="flex flex-col gap-4 border-b border-white/10 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <FiActivity className="text-blue-400" />
                <h2 className="text-lg font-bold">All Doctors</h2>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Showing {filteredDoctors.length} of {total} doctors
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search doctor..."
                  className="w-full rounded-xl border border-white/10 bg-[#080b14] py-2.5 pl-10 pr-4 text-sm text-white outline-none focus:border-blue-500 sm:w-64"
                />
              </div>

              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="rounded-xl border border-white/10 bg-[#080b14] px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="grid grid-cols-1 gap-3 p-4 md:hidden">
            <AnimatePresence>
              {filteredDoctors.map((doc) => (
                <motion.div
                  key={doc._id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="rounded-xl border border-white/10 bg-[#080b14] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="break-words font-semibold text-white">
                        {doc.name}
                      </h3>
                      <p className="mt-1 break-all text-xs text-gray-500">
                        {doc.email}
                      </p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
                      doc.status === "approved"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : doc.status === "pending"
                        ? "bg-amber-500/10 text-amber-400"
                        : "bg-red-500/10 text-red-400"
                    }`}>
                      {doc.status || "unknown"}
                    </span>
                  </div>

                  <div className="mt-3 rounded-lg bg-white/5 p-3 text-xs text-gray-300">
                    Specialization: {doc.specialization || "Not specified"}
                  </div>

                  <div className="mt-4 flex flex-wrap justify-end gap-2">
                    {doc.status !== "approved" && (
                      <button
                        disabled={actionId === doc._id}
                        onClick={() => handleApprove(doc._id)}
                        className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold disabled:opacity-50"
                      >
                        <FiCheckCircle />
                        Approve
                      </button>
                    )}
                    <button
                      disabled={actionId === doc._id}
                      onClick={() => handleDelete(doc._id)}
                      className="flex items-center gap-1 rounded-lg bg-red-600/90 px-3 py-2 text-xs font-semibold disabled:opacity-50"
                    >
                      <FiTrash2 />
                      Delete
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Desktop Table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[750px] text-left text-sm">
              <thead className="bg-white/5 text-xs uppercase tracking-wider text-gray-400">
                <tr>
                  <th className="px-5 py-4">Doctor</th>
                  <th className="px-5 py-4">Specialization</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-center">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/5">
                <AnimatePresence>
                  {filteredDoctors.map((doc) => (
                    <motion.tr
                      layout
                      key={doc._id}
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="transition hover:bg-white/[0.035]"
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold text-white">{doc.name}</p>
                        <p className="mt-1 text-xs text-gray-500">{doc.email}</p>
                      </td>

                      <td className="px-5 py-4 text-gray-300">
                        {doc.specialization || "Not specified"}
                      </td>

                      <td className="px-5 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
                          doc.status === "approved"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : doc.status === "pending"
                            ? "bg-amber-500/10 text-amber-400"
                            : "bg-red-500/10 text-red-400"
                        }`}>
                          {doc.status || "unknown"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-center gap-2">
                          {doc.status !== "approved" && (
                            <button
                              disabled={actionId === doc._id}
                              onClick={() => handleApprove(doc._id)}
                              className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold transition hover:bg-emerald-500 disabled:opacity-50"
                            >
                              Approve
                            </button>
                          )}

                          <button
                            disabled={actionId === doc._id}
                            onClick={() => handleDelete(doc._id)}
                            className="rounded-lg bg-red-600/90 px-3 py-2 text-xs font-semibold transition hover:bg-red-500 disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {filteredDoctors.length === 0 && (
            <div className="px-4 py-16 text-center">
              <FiShield className="mx-auto text-4xl text-gray-600" />
              <p className="mt-4 font-medium text-gray-300">
                No doctors found
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Try changing your search or status filter.
              </p>
            </div>
          )}
        </div>

        <p className="mt-5 text-center text-xs text-gray-600">
          CarePulse Admin Dashboard • Doctor Management
        </p>
      </div>
    </div>
  );
}
