"use client";

import { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import { Card, Chip } from "@heroui/react";
import { FiCalendar, FiSearch } from "react-icons/fi";

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

const statusColorMap: Record<string, "warning" | "success" | "danger" | "default"> = {
    pending: "warning",
    approved: "success",
    completed: "default",
    rejected: "danger",
    cancelled: "danger",
};

const STATUS_FILTERS = ["all", "pending", "approved", "completed", "rejected", "cancelled"];

export default function AdminAllAppointments() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

    const loadAppointments = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/all-appointments`);
            const data = await res.json();
            setAppointments(data.data || []);
        } catch {
            toast.error("Failed to load appointments");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAppointments();
    }, []);

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
                prev.map((a) => (a._id === id ? { ...a, status } : a))
            );
            toast.success(`Marked as ${status}`);
        } catch {
            toast.error("Failed to update appointment");
        } finally {
            setActionLoadingId(null);
        }
    };

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return appointments.filter((a) => {
            const matchesStatus = statusFilter === "all" || a.status === statusFilter;
            const matchesSearch =
                !q ||
                a.doctorDetails?.name?.toLowerCase().includes(q) ||
                a.patientDetails?.name?.toLowerCase().includes(q) ||
                a.patientDetails?.email?.toLowerCase().includes(q);
            return matchesStatus && matchesSearch;
        });
    }, [appointments, search, statusFilter]);

    if (loading) {
        return <div className="text-white p-6">Loading...</div>;
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h1 className="text-xl sm:text-2xl font-bold text-white">
                    All Appointments ({filtered.length})
                </h1>

                <div className="relative w-full sm:w-72">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={15} />
                    <input
                        type="text"
                        placeholder="Search doctor or patient..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-lg bg-neutral-900 border border-white/10 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Status filter chips */}
            <div className="flex flex-wrap gap-2">
                {STATUS_FILTERS.map((s) => (
                    <button
                        key={s}
                        onClick={() => setStatusFilter(s)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${
                            statusFilter === s
                                ? "bg-blue-600 text-white"
                                : "bg-white/5 text-neutral-400 hover:bg-white/10"
                        }`}
                    >
                        {s}
                    </button>
                ))}
            </div>

            {filtered.length === 0 ? (
                <p className="text-neutral-400 text-sm py-6">No appointments found.</p>
            ) : (
                <div className="flex flex-col gap-2">
                    {filtered.map((appt) => (
                        <Card
                            key={appt._id}
                            className="bg-neutral-900 border border-white/10 p-3 sm:p-4"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
                                    <div className="min-w-0">
                                        <p className="text-neutral-500 text-[11px]">Patient</p>
                                        <p className="text-white text-sm font-medium truncate">
                                            {appt.patientDetails?.name || "Unknown"}
                                        </p>
                                        <p className="text-neutral-500 text-xs truncate">
                                            {appt.patientDetails?.email}
                                        </p>
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-neutral-500 text-[11px]">Doctor</p>
                                        <p className="text-white text-sm font-medium truncate">
                                            {appt.doctorDetails?.name || "Unknown"}
                                        </p>
                                        <p className="text-neutral-500 text-xs truncate">
                                            {appt.doctorDetails?.specialization}
                                        </p>
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-neutral-500 text-[11px] flex items-center gap-1">
                                            <FiCalendar size={10} /> Date
                                        </p>
                                        <p className="text-white text-sm">
                                            {new Date(appt.date).toLocaleDateString(undefined, {
                                                year: "numeric",
                                                month: "short",
                                                day: "numeric",
                                            })}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <Chip
                                        size="sm"
                                        color={statusColorMap[appt.status] || "default"}
                                        variant="flat"
                                        className="capitalize"
                                    >
                                        {appt.status}
                                    </Chip>

                                    {appt.status !== "cancelled" && appt.status !== "completed" && (
                                        <button
                                            disabled={actionLoadingId === appt._id}
                                            onClick={() => updateStatus(appt._id, "cancelled")}
                                            className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}