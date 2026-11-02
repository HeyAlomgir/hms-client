
"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Card, Chip } from "@heroui/react";
import {
    FiCalendar,
    FiSearch,
    FiUsers,
    FiClock,
    FiCheckCircle,
    FiXCircle,
    FiRefreshCw,
    FiActivity,
} from "react-icons/fi";
import {
    FaRegCalendarCheck,
} from "react-icons/fa6";
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
} from "recharts";

interface DoctorDetails {
    name?: string;
    specialization?: string;
}

interface PatientDetails {
    name?: string;
    email?: string;
}

interface Appointment {
    _id: string;
    status: string;
    date: string;
    createdAt: string;
    doctorDetails?: DoctorDetails;
    patientDetails?: PatientDetails;
}

const STATUS_FILTERS = [
    "all",
    "pending",
    "approved",
    "completed",
    "rejected",
    "cancelled",
];

const STATUS_COLORS: Record<string, string> = {
    pending: "#f59e0b",
    approved: "#3b82f6",
    completed: "#10b981",
    rejected: "#ef4444",
    cancelled: "#a78bfa",
};

const statusColorMap: Record<
    string,
    "warning" | "success" | "danger" | "default" | "primary"
> = {
    pending: "warning",
    approved: "primary",
    completed: "success",
    rejected: "danger",
    cancelled: "danger",
};

const formatDate = (date: string) => {
    if (!date || Number.isNaN(new Date(date).getTime())) {
        return "Date unavailable";
    }

    return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};

const StatCard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    color,
    delay,
}: {
    title: string;
    value: number;
    subtitle: string;
    icon: React.ElementType;
    color: string;
    delay: number;
}) => {
    return (
        <div
            style={{ animationDelay: `${delay}ms` }}
            className="group relative animate-[fadeUp_0.6s_ease_both] perspective-1000"
        >
            <Card
                className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111c30] p-5 shadow-[0_15px_35px_rgba(0,0,0,0.25)] transition-all duration-500 hover:-translate-y-2 hover:rotate-x-2 hover:border-white/20 hover:shadow-[0_25px_45px_rgba(0,0,0,0.4)]"
            >
                <div
                    className="pointer-events-none absolute -right-12 -top-12 size-36 rounded-full opacity-20 blur-3xl transition-opacity duration-500 group-hover:opacity-50"
                    style={{ background: color }}
                />

                <div className="relative flex items-start justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-400">
                            {title}
                        </p>

                        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white">
                            {value}
                        </h2>

                        <p className="mt-2 text-xs text-slate-500">
                            {subtitle}
                        </p>
                    </div>

                    <div
                        className="flex size-12 items-center justify-center rounded-xl shadow-lg transition-all duration-500 group-hover:rotate-12 group-hover:scale-110"
                        style={{
                            background: `${color}20`,
                            color,
                            boxShadow: `0 8px 25px ${color}25`,
                        }}
                    >
                        <Icon size={23} />
                    </div>
                </div>

                <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                            width: value > 0 ? "75%" : "0%",
                            background: color,
                        }}
                    />
                </div>
            </Card>
        </div>
    );
};

const ChartCard = ({
    title,
    subtitle,
    children,
    icon: Icon,
}: {
    title: string;
    subtitle: string;
    children: React.ReactNode;
    icon: React.ElementType;
}) => (
    <Card className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111c30] p-5 shadow-[0_15px_35px_rgba(0,0,0,0.2)] transition-all duration-500 hover:-translate-y-1 hover:border-cyan-400/20 hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
        <div className="pointer-events-none absolute -right-16 -top-16 size-40 rounded-full bg-cyan-500/5 blur-3xl transition-all duration-500 group-hover:bg-cyan-500/10" />

        <div className="relative mb-5 flex items-center justify-between">
            <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-400">
                    Analytics
                </p>
                <h3 className="mt-2 text-lg font-bold text-white">
                    {title}
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                    {subtitle}
                </p>
            </div>

            <div className="flex size-10 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-400 transition-transform duration-500 group-hover:rotate-12">
                <Icon size={19} />
            </div>
        </div>

        <div className="relative h-[260px] w-full">
            {children}
        </div>
    </Card>
);

export default function AdminAllAppointments() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    const loadAppointments = async () => {
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/all-appointments`,
                { cache: "no-store" }
            );

            if (!res.ok) {
                throw new Error("Failed to fetch appointments");
            }

            const data = await res.json();
            setAppointments(Array.isArray(data.data) ? data.data : []);
        } catch {
            toast.error("Failed to load appointments");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadAppointments();
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        loadAppointments();
    };

    const updateStatus = async (id: string, status: string) => {
        setActionLoadingId(id);

        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/all-appointments/${id}/status`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status }),
                }
            );

            if (!res.ok) throw new Error();

            setAppointments((prev) =>
                prev.map((a) =>
                    a._id === id ? { ...a, status } : a
                )
            );

            toast.success(`Marked as ${status}`);
        } catch {
            toast.error("Failed to update appointment");
        } finally {
            setActionLoadingId(null);
        }
    };

    // Statistics from API data
    const stats = useMemo(() => {
        const count = (status: string) =>
            appointments.filter(
                (a) => a.status?.toLowerCase() === status
            ).length;

        return {
            total: appointments.length,
            pending: count("pending"),
            approved: count("approved"),
            completed: count("completed"),
            rejected: count("rejected"),
            cancelled: count("cancelled"),
        };
    }, [appointments]);

    // Pie Chart: Appointment Status
    const statusChartData = useMemo(() => {
        return Object.entries(STATUS_COLORS)
            .map(([status, color]) => ({
                name: status.charAt(0).toUpperCase() + status.slice(1),
                value: stats[status as keyof typeof stats],
                color,
            }))
            .filter((item) => item.value > 0);
    }, [stats]);

    // Bar Chart: Monthly Appointments
    const monthlyChartData = useMemo(() => {
        const monthMap: Record<string, number> = {};

        appointments.forEach((appt) => {
            const date = new Date(appt.date);

            if (Number.isNaN(date.getTime())) return;

            const key = `${date.getFullYear()}-${date.getMonth()}`;

            monthMap[key] = (monthMap[key] || 0) + 1;
        });

        return Object.entries(monthMap)
            .map(([key, count]) => {
                const [year, month] = key.split("-").map(Number);

                return {
                    month: new Date(year, month).toLocaleDateString(
                        "en-US",
                        { month: "short", year: "2-digit" }
                    ),
                    appointments: count,
                    sortKey: year * 12 + month,
                };
            })
            .sort((a, b) => a.sortKey - b.sortKey)
            .slice(-6);
    }, [appointments]);

    // Search and filter
    const filtered = useMemo(() => {
        const q = search.toLowerCase();

        return appointments.filter((a) => {
            const matchesStatus =
                statusFilter === "all" ||
                a.status?.toLowerCase() === statusFilter;

            const matchesSearch =
                !q ||
                a.doctorDetails?.name?.toLowerCase().includes(q) ||
                a.patientDetails?.name?.toLowerCase().includes(q) ||
                a.patientDetails?.email?.toLowerCase().includes(q) ||
                a.doctorDetails?.specialization?.toLowerCase().includes(q);

            return matchesStatus && matchesSearch;
        });
    }, [appointments, search, statusFilter]);

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center bg-[#080f1e]">
                <div className="text-center">
                    <div className="mx-auto size-12 animate-spin rounded-full border-4 border-cyan-400/20 border-t-cyan-400" />
                    <p className="mt-4 text-sm text-slate-400">
                        Loading appointments...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen space-y-8 bg-[#080f1e] p-4 text-white sm:p-6 lg:p-8">

            {/* Header */}
            <section className="relative overflow-hidden rounded-2xl border border-cyan-400/10 bg-gradient-to-br from-[#101e35] via-[#0d192c] to-[#10253a] p-6 shadow-[0_15px_40px_rgba(0,0,0,0.25)] sm:p-8">
                <div className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-cyan-400/10 blur-[90px]" />
                <div className="pointer-events-none absolute -bottom-20 left-1/3 size-56 rounded-full bg-blue-500/10 blur-[80px]" />

                <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                    <div>
                        <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-400">
                            <FiActivity />
                            CarePulse Control Center
                        </p>

                        <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
                            All <span className="text-cyan-400">Appointments</span>
                        </h1>

                        <p className="mt-2 text-sm text-slate-400">
                            Manage and monitor all hospital appointments.
                        </p>
                    </div>

                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="flex items-center justify-center gap-2 self-start rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-5 py-3 text-xs font-bold text-cyan-300 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-cyan-400/20 hover:shadow-cyan-500/10 disabled:opacity-50 sm:self-center"
                    >
                        <FiRefreshCw className={refreshing ? "animate-spin" : ""} />
                        Refresh Data
                    </button>
                </div>
            </section>

            {/* Overview Statistics */}
            <section className="space-y-4">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-400">
                        Overview
                    </p>
                    <h2 className="mt-1 text-xl font-bold text-white">
                        Appointment Statistics
                    </h2>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        title="Total Appointments"
                        value={stats.total}
                        subtitle="All registered appointments"
                        icon={FiUsers}
                        color="#06b6d4"
                        delay={0}
                    />

                    <StatCard
                        title="Pending"
                        value={stats.pending}
                        subtitle="Waiting for approval"
                        icon={FiClock}
                        color="#f59e0b"
                        delay={100}
                    />

                    <StatCard
                        title="Approved"
                        value={stats.approved}
                        subtitle="Confirmed appointments"
                        icon={FiCheckCircle}
                        color="#3b82f6"
                        delay={200}
                    />

                    <StatCard
                        title="Completed"
                        value={stats.completed}
                        subtitle="Successfully completed"
                        icon={FaRegCalendarCheck}
                        color="#10b981"
                        delay={300}
                    />
                </div>
            </section>

            {/* Separate Recharts Sections */}
            <section className="space-y-4">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-blue-400">
                        Visual Analytics
                    </p>
                    <h2 className="mt-1 text-xl font-bold text-white">
                        Appointment Reports
                    </h2>
                </div>

                <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">

                    {/* Status Pie Chart */}
                    <ChartCard
                        title="Appointment Status"
                        subtitle="Distribution of appointment statuses"
                        icon={FiActivity}
                    >
                        {statusChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusChartData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="48%"
                                        innerRadius={65}
                                        outerRadius={95}
                                        paddingAngle={4}
                                        cornerRadius={6}
                                        stroke="none"
                                    >
                                        {statusChartData.map((entry) => (
                                            <Cell
                                                key={entry.name}
                                                fill={entry.color}
                                            />
                                        ))}
                                    </Pie>

                                    <Tooltip
                                        contentStyle={{
                                            background: "#111c30",
                                            border: "1px solid #26354b",
                                            borderRadius: "12px",
                                            color: "#fff",
                                        }}
                                    />

                                    <Legend
                                        verticalAlign="bottom"
                                        iconType="circle"
                                        wrapperStyle={{
                                            fontSize: "11px",
                                            color: "#94a3b8",
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-full items-center justify-center text-sm text-slate-500">
                                No chart data available
                            </div>
                        )}
                    </ChartCard>

                    {/* Monthly Bar Chart */}
                    <ChartCard
                        title="Monthly Appointments"
                        subtitle="Appointment activity over recent months"
                        icon={FiCalendar}
                    >
                        {monthlyChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={monthlyChartData}
                                    margin={{
                                        top: 10,
                                        right: 10,
                                        left: -20,
                                        bottom: 0,
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
                                                stopOpacity={1}
                                            />
                                            <stop
                                                offset="100%"
                                                stopColor="#2563eb"
                                                stopOpacity={0.5}
                                            />
                                        </linearGradient>
                                    </defs>

                                    <CartesianGrid
                                        stroke="#26354b"
                                        strokeDasharray="4 4"
                                        vertical={false}
                                    />

                                    <XAxis
                                        dataKey="month"
                                        tick={{
                                            fill: "#94a3b8",
                                            fontSize: 11,
                                        }}
                                        axisLine={false}
                                        tickLine={false}
                                    />

                                    <YAxis
                                        allowDecimals={false}
                                        tick={{
                                            fill: "#94a3b8",
                                            fontSize: 11,
                                        }}
                                        axisLine={false}
                                        tickLine={false}
                                    />

                                    <Tooltip
                                        cursor={{
                                            fill: "rgba(6,182,212,0.06)",
                                        }}
                                        contentStyle={{
                                            background: "#111c30",
                                            border: "1px solid #26354b",
                                            borderRadius: "12px",
                                            color: "#fff",
                                        }}
                                    />

                                    <Bar
                                        dataKey="appointments"
                                        name="Appointments"
                                        fill="url(#appointmentGradient)"
                                        radius={[7, 7, 0, 0]}
                                        maxBarSize={48}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-full items-center justify-center text-sm text-slate-500">
                                No monthly data available
                            </div>
                        )}
                    </ChartCard>
                </div>
            </section>

            {/* Appointment Management */}
            <section className="space-y-5">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-400">
                            Management
                        </p>

                        <h2 className="mt-1 text-xl font-bold text-white">
                            Appointment Records
                            <span className="ml-2 text-sm font-medium text-slate-500">
                                ({filtered.length})
                            </span>
                        </h2>
                    </div>

                    {/* Search */}
                    <div className="relative w-full sm:w-80">
                        <FiSearch
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                            size={16}
                        />

                        <input
                            type="text"
                            placeholder="Search doctor or patient..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-xl border border-white/10 bg-[#111c30] py-3 pl-10 pr-4 text-sm text-white outline-none transition-all placeholder:text-slate-500 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/10"
                        />
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2">
                    {STATUS_FILTERS.map((s) => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`rounded-xl border px-4 py-2 text-xs font-semibold capitalize transition-all duration-300 hover:-translate-y-0.5 ${
                                statusFilter === s
                                    ? "border-cyan-400/30 bg-cyan-400/15 text-cyan-300 shadow-[0_5px_15px_rgba(6,182,212,0.1)]"
                                    : "border-white/[0.07] bg-[#111c30] text-slate-400 hover:border-white/20 hover:text-white"
                            }`}
                        >
                            {s}
                            {s === "all" && (
                                <span className="ml-2 text-[10px] opacity-70">
                                    {stats.total}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Records */}
                {filtered.length === 0 ? (
                    <div className="rounded-2xl border border-white/[0.08] bg-[#111c30] py-16 text-center">
                        <FiCalendar className="mx-auto text-3xl text-slate-600" />
                        <p className="mt-4 text-sm font-semibold text-slate-300">
                            No appointments found
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                            Try changing your search or status filter.
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {filtered.map((appt, index) => (
                            <Card
                                key={appt._id}
                                style={{
                                    animationDelay: `${Math.min(index * 50, 500)}ms`,
                                }}
                                className="group animate-[fadeUp_0.5s_ease_both] overflow-hidden rounded-2xl border border-white/[0.07] bg-[#111c30] p-4 shadow-[0_8px_25px_rgba(0,0,0,0.15)] transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/20 hover:shadow-[0_15px_35px_rgba(0,0,0,0.3)] sm:p-5"
                            >
                                <div className="flex flex-col gap-4 xl:flex-row xl:items-center">

                                    <div className="grid min-w-0 flex-1 grid-cols-1 gap-4 sm:grid-cols-3">

                                        {/* Patient */}
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                                Patient
                                            </p>

                                            <p className="mt-2 truncate text-sm font-bold text-white transition-colors group-hover:text-cyan-300">
                                                {appt.patientDetails?.name || "Unknown"}
                                            </p>

                                            <p className="mt-1 truncate text-xs text-slate-500">
                                                {appt.patientDetails?.email || "No email"}
                                            </p>
                                        </div>

                                        {/* Doctor */}
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                                Doctor
                                            </p>

                                            <p className="mt-2 truncate text-sm font-bold text-white">
                                                {appt.doctorDetails?.name || "Unknown"}
                                            </p>

                                            <p className="mt-1 truncate text-xs text-slate-500">
                                                {appt.doctorDetails?.specialization || "General"}
                                            </p>
                                        </div>

                                        {/* Date */}
                                        <div className="min-w-0">
                                            <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                                <FiCalendar />
                                                Appointment Date
                                            </p>

                                            <p className="mt-2 text-sm font-semibold text-slate-200">
                                                {formatDate(appt.date)}
                                            </p>

                                            <p className="mt-1 text-xs text-slate-500">
                                                Created: {formatDate(appt.createdAt)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Status and Actions */}
                                    <div className="flex flex-wrap items-center gap-3 border-t border-white/[0.06] pt-3 xl:border-l xl:border-t-0 xl:pl-5 xl:pt-0">
                                        <Chip
                                            size="sm"
                                            color={
                                                statusColorMap[
                                                    appt.status?.toLowerCase()
                                                ] || "default"
                                            }
                                            variant="flat"
                                            className="capitalize"
                                        >
                                            {appt.status}
                                        </Chip>

                                        {appt.status !== "cancelled" &&
                                            appt.status !== "completed" && (
                                                <button
                                                    disabled={
                                                        actionLoadingId === appt._id
                                                    }
                                                    onClick={() =>
                                                        updateStatus(
                                                            appt._id,
                                                            "cancelled"
                                                        )
                                                    }
                                                    className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-400 transition-all hover:bg-red-500/20 disabled:opacity-50"
                                                >
                                                    {actionLoadingId === appt._id
                                                        ? "Updating..."
                                                        : "Cancel"}
                                                </button>
                                            )}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
