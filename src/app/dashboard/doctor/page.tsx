
"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Card, CardHeader } from "@heroui/react";
import { motion } from "framer-motion";
import {
    FiCheckCircle,
    FiCalendar,
    FiDollarSign,
    FiClock,
    FiShield,
    FiXCircle,
    FiRefreshCw,
} from "react-icons/fi";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

interface StatusCounts {
    pending: number;
    approved: number;
    completed: number;
    rejected: number;
}

interface TrendPoint {
    date: string;
    count: number;
}

interface DoctorStats {
    totalAppointments: number;
    statusCounts: StatusCounts;
    appointmentsOverTime: TrendPoint[];
    revenueEstimate: number;
}

type DoctorStatus = "pending" | "approved" | "rejected" | "unknown";

function StatCard({
    icon,
    label,
    value,
    accent,
    delay,
}: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    accent: string;
    delay: number;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 35, rotateX: 12 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 0.6, delay }}
            whileHover={{
                y: -8,
                rotateX: 5,
                rotateY: -5,
                scale: 1.03,
                transition: { duration: 0.25 },
            }}
            style={{ transformStyle: "preserve-3d", perspective: 1000 }}
            className="min-w-0"
        >
            <Card className="relative overflow-hidden bg-neutral-900/80 backdrop-blur-xl border border-white/10 p-4 sm:p-5 shadow-[0_10px_40px_rgba(0,0,0,0.25)]">
                <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-blue-500/10 blur-2xl" />

                <div className="relative flex items-center gap-3">
                    <div
                        className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${accent}`}
                    >
                        {icon}
                    </div>

                    <div className="min-w-0 flex-1">
                        <p className="text-neutral-400 text-xs truncate">
                            {label}
                        </p>

                        <motion.p
                            initial={{ opacity: 0, scale: 0.7 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: delay + 0.2 }}
                            className="text-white text-xl font-bold truncate"
                        >
                            {value}
                        </motion.p>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}

function LoadingScreen() {
    return (
        <div className="min-h-screen bg-[#080b14] flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
            >
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                        repeat: Infinity,
                        duration: 1.2,
                        ease: "linear",
                    }}
                    className="w-14 h-14 border-4 border-blue-500/20 border-t-blue-500 rounded-full mx-auto mb-5"
                />

                <p className="text-white font-semibold">
                    Loading Doctor Dashboard...
                </p>

                <p className="text-neutral-500 text-sm mt-2">
                    Please wait a moment
                </p>
            </motion.div>
        </div>
    );
}

function AccessMessage({
    status,
    message,
}: {
    status: DoctorStatus;
    message?: string;
}) {
    const isPending = status === "pending";

    return (
        <div className="min-h-screen bg-[#080b14] flex items-center justify-center p-5 relative overflow-hidden">
            <div className="absolute w-72 h-72 bg-blue-600/10 blur-[100px] rounded-full -top-20 -left-20" />
            <div className="absolute w-72 h-72 bg-purple-600/10 blur-[100px] rounded-full -bottom-20 -right-20" />

            <motion.div
                initial={{ opacity: 0, y: 40, rotateX: 15 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ duration: 0.7 }}
                whileHover={{ rotateY: 2, scale: 1.01 }}
                style={{ perspective: 1000 }}
                className="relative w-full max-w-lg"
            >
                <Card className="bg-neutral-900/80 backdrop-blur-2xl border border-white/10 p-7 sm:p-10 text-center shadow-2xl">
                    <motion.div
                        animate={
                            isPending
                                ? { scale: [1, 1.1, 1] }
                                : { rotate: [0, -5, 5, 0] }
                        }
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                        }}
                        className={`w-20 h-20 rounded-2xl mx-auto flex items-center justify-center mb-6 ${isPending
                                ? "bg-amber-500/10 text-amber-400"
                                : "bg-red-500/10 text-red-400"
                            }`}
                    >
                        {isPending ? (
                            <FiClock size={38} />
                        ) : (
                            <FiXCircle size={38} />
                        )}
                    </motion.div>

                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                        {isPending
                            ? "Application Under Review"
                            : "Dashboard Access Restricted"}
                    </h1>

                    <p className="text-neutral-400 leading-7 text-sm sm:text-base">
                        {message ||
                            (isPending
                                ? "Your doctor application is currently pending approval. You will get access to your dashboard after the admin approves your profile."
                                : "Your doctor application has not been approved. Please contact the administrator for more information.")}
                    </p>

                    <div className="mt-7 p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3 text-left">
                        <FiShield className="text-blue-400 shrink-0" size={22} />

                        <p className="text-xs sm:text-sm text-neutral-300">
                            Your dashboard will become available once your
                            doctor profile receives approval.
                        </p>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
}

export default function DoctorAnalytics() {
    const [stats, setStats] = useState<DoctorStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [doctorStatus, setDoctorStatus] =
        useState<DoctorStatus>("unknown");
    const [error, setError] = useState("");

    const { data: session, isPending } = authClient.useSession();

    useEffect(() => {
        if (isPending) return;

        if (!session?.user?.id) {
            setError("Please log in to access your doctor dashboard.");
            setLoading(false);
            return;
        }

        let cancelled = false;

        const loadDashboard = async () => {
            setLoading(true);
            setError("");
            setStats(null);

            try {
                // 1. Get doctor profile
                const doctorRes = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/doctors/by-user/${session.user.id}`,
                    { cache: "no-store" }
                );

                const doctorData = await doctorRes.json();

                if (!doctorRes.ok || !doctorData.success) {
                    throw new Error(
                        doctorData.message || "Doctor profile not found."
                    );
                }

                if (cancelled) return;

                const doctor = doctorData.data;

                // 2. Check doctor approval status
                const status: DoctorStatus =
                    doctor.status === "approved"
                        ? "approved"
                        : doctor.status === "pending"
                            ? "pending"
                            : doctor.status === "rejected"
                                ? "rejected"
                                : "unknown";

                setDoctorStatus(status);

                // Block every status except approved.
                // Legacy records without status are treated as approved,
                // matching the existing backend public-doctor filter.
                if (status !== "approved" && status !== "unknown") {
                    setLoading(false);
                    return;
                }

                // Unknown status is not allowed.
                if (status === "unknown" && doctor.status !== undefined) {
                    setLoading(false);
                    return;
                }

                // 3. Load doctor analytics only after approval check
                const statsRes = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/doctor-stats/${doctor._id}`,
                    { cache: "no-store" }
                );

                const statsData = await statsRes.json();

                if (!statsRes.ok) {
                    throw new Error(
                        statsData.message || "Failed to load analytics."
                    );
                }

                if (!cancelled) {
                    setStats(statsData.data);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "Something went wrong."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadDashboard();

        return () => {
            cancelled = true;
        };
    }, [session?.user?.id, isPending]);

    if (isPending || loading) {
        return <LoadingScreen />;
    }

    if (doctorStatus === "pending" || doctorStatus === "rejected") {
        return <AccessMessage status={doctorStatus} />;
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#080b14] flex items-center justify-center p-5">
                <Card className="bg-neutral-900 border border-red-500/20 p-8 max-w-md w-full text-center">
                    <FiXCircle className="text-red-400 mx-auto mb-4" size={40} />
                    <h2 className="text-white text-xl font-bold mb-2">
                        Unable to Load Dashboard
                    </h2>
                    <p className="text-neutral-400 text-sm">{error}</p>
                </Card>
            </div>
        );
    }

    if (!stats) {
        return (
            <AccessMessage
                status="unknown"
                message="Your doctor profile could not be verified. Please contact the administrator."
            />
        );
    }

    return (
        <div className="relative min-h-screen bg-[#080b14] p-4 sm:p-6 lg:p-8 flex flex-col gap-6 sm:gap-8 overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="relative z-10 max-w-full">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-7"
                >
                    <div className="flex items-center gap-2 mb-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                        <p className="text-emerald-400 text-xs font-semibold tracking-widest uppercase">
                            Approved Doctor
                        </p>
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-bold text-white">
                        Doctor Dashboard
                    </h1>

                    <p className="text-neutral-400 text-sm mt-2">
                        Track your appointments, performance and earnings.
                    </p>
                </motion.div>

                {/* Statistics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
                    <StatCard
                        icon={<FiCheckCircle className="text-blue-400" size={20} />}
                        label="Completed Appointments"
                        value={stats.statusCounts.completed}
                        accent="bg-blue-500/10"
                        delay={0.1}
                    />

                    <StatCard
                        icon={<FiCalendar className="text-purple-400" size={20} />}
                        label="Total Booked"
                        value={stats.totalAppointments}
                        accent="bg-purple-500/10"
                        delay={0.2}
                    />

                    <StatCard
                        icon={<FiDollarSign className="text-emerald-400" size={20} />}
                        label="Estimated Revenue"
                        value={`${stats.revenueEstimate}৳`}
                        accent="bg-emerald-500/10"
                        delay={0.3}
                    />
                </div>

                {/* Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.4 }}
                    whileHover={{ y: -3 }}
                    className="mt-7"
                >
                    <Card className="relative bg-neutral-900/80 backdrop-blur-xl border border-white/10 p-4 sm:p-6 w-full overflow-hidden shadow-[0_15px_50px_rgba(0,0,0,0.25)]">
                        <CardHeader className="p-0 mb-6">
                            <div>
                                <h2 className="text-white font-semibold text-base sm:text-lg">
                                    Appointment Activity
                                </h2>
                                <p className="text-neutral-500 text-xs mt-1">
                                    Your appointment activity over the last 14 days
                                </p>
                            </div>
                        </CardHeader>

                        <div className="h-60 sm:h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                    data={stats.appointmentsOverTime}
                                    margin={{
                                        top: 10,
                                        right: 15,
                                        left: -15,
                                        bottom: 5,
                                    }}
                                >
                                    <CartesianGrid
                                        strokeDasharray="4 4"
                                        stroke="rgba(255,255,255,0.07)"
                                    />

                                    <XAxis
                                        dataKey="date"
                                        stroke="#737373"
                                        fontSize={10}
                                        tickMargin={10}
                                        interval="preserveStartEnd"
                                    />

                                    <YAxis
                                        stroke="#737373"
                                        fontSize={10}
                                        allowDecimals={false}
                                        width={30}
                                    />

                                    <Tooltip
                                        contentStyle={{
                                            background: "#171717",
                                            border: "1px solid rgba(255,255,255,0.1)",
                                            borderRadius: 12,
                                            color: "#fff",
                                            fontSize: 12,
                                        }}
                                    />

                                    <Line
                                        type="monotone"
                                        dataKey="count"
                                        stroke="#3b82f6"
                                        strokeWidth={3}
                                        dot={{
                                            r: 4,
                                            fill: "#3b82f6",
                                            stroke: "#171717",
                                            strokeWidth: 2,
                                        }}
                                        activeDot={{ r: 7 }}
                                        animationDuration={1500}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
