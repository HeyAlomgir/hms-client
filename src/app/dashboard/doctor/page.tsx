"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Card, CardHeader } from "@heroui/react";
import { FiCheckCircle, FiCalendar, FiDollarSign } from "react-icons/fi";
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

function StatCard({
    icon,
    label,
    value,
    accent,
}: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    accent: string;
}) {
    return (
        <Card className="bg-neutral-900 border border-white/10 p-3 sm:p-4 min-w-0">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div
                    className={`h-9 w-9 sm:h-10 sm:w-10 rounded-xl flex items-center justify-center shrink-0 ${accent}`}
                >
                    {icon}
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-neutral-400 text-[11px] sm:text-xs truncate">
                        {label}
                    </p>
                    <p className="text-white text-base sm:text-lg font-bold truncate">
                        {value}
                    </p>
                </div>
            </div>
        </Card>
    );
}

export default function DoctorAnalytics() {
    const [stats, setStats] = useState<DoctorStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);
    const { data: session, isPending } = authClient.useSession();

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (isPending || !session?.user?.id) return;

        const load = async () => {
            try {
                const doctorRes = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/doctors/by-user/${session.user.id}`
                );
                const doctorData = await doctorRes.json();
                if (!doctorData.success) {
                    setLoading(false);
                    return;
                }

                const statsRes = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/doctor-stats/${doctorData.data._id}`
                );
                const statsData = await statsRes.json();
                setStats(statsData.data);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [session, isPending]);

    if (!mounted || isPending || loading) {
        return <div className="text-white p-6">Loading...</div>;
    }

    if (!stats) {
        return <div className="text-white p-6">Could not load analytics.</div>;
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-5 sm:gap-6 max-w-full overflow-hidden">
            <h1 className="text-xl sm:text-2xl font-bold text-white">Dashboard</h1>

            {/* Stat cards — 2 responsive */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                <StatCard
                    icon={<FiCheckCircle className="text-blue-400" size={17} />}
                    label="Completed"
                    value={stats.statusCounts.completed}
                    accent="bg-blue-500/10"
                />
                <StatCard
                    icon={<FiCalendar className="text-neutral-300" size={17} />}
                    label="Total Booked"
                    value={stats.totalAppointments}
                    accent="bg-white/5"
                />
                <StatCard
                    icon={<FiDollarSign className="text-emerald-400" size={17} />}
                    label="Est. Revenue"
                    value={`${stats.revenueEstimate}৳`}
                    accent="bg-emerald-500/10"
                />
            </div>

            {/* Completed appointments trend */}
            <Card className="bg-neutral-900 border border-white/10 p-3 sm:p-5 w-full overflow-hidden">
                <CardHeader className="p-0 mb-3 sm:mb-4">
                    <h2 className="text-white font-semibold text-sm sm:text-base">
                        Appointments — Last 14 Days
                    </h2>
                </CardHeader>
                <div className="h-52 sm:h-72 w-full -ml-2 sm:ml-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={stats.appointmentsOverTime} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                            <XAxis
                                dataKey="date"
                                stroke="#737373"
                                fontSize={10}
                                interval="preserveStartEnd"
                                tickMargin={8}
                            />
                            <YAxis stroke="#737373" fontSize={10} allowDecimals={false} width={28} />
                            <Tooltip
                                contentStyle={{
                                    background: "#171717",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                    borderRadius: 8,
                                    color: "#fff",
                                    fontSize: 12,
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="count"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                dot={{ r: 3, fill: "#3b82f6" }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </Card>
        </div>
    );
}