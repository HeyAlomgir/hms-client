
"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Card, Chip, Button } from "@heroui/react";
import {
    FiSearch,
    FiCalendar,
    FiMail,
    FiSlash,
    FiCheckCircle,
    FiUsers,
    FiUserCheck,
    FiUserX,
    FiActivity,
    FiRefreshCw,
    FiClock,
} from "react-icons/fi";

interface Patient {
    _id: string;
    name?: string;
    email?: string;
    image?: string;
    createdAt?: string;
    appointmentCount: number;
    banned?: boolean;
}

interface DoctorDetails {
    name?: string;
    specialization?: string;
}

interface PatientAppointment {
    _id: string;
    status: string;
    date: string;
    createdAt: string;
    doctorDetails?: DoctorDetails;
}

function PatientAvatar({
    image,
    name,
    size = "large",
}: {
    image?: string;
    name?: string;
    size?: "large" | "small";
}) {
    const [imgError, setImgError] = useState(false);

    const initials =
        name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "?";

    const sizeClass = size === "large" ? "size-14" : "size-10";

    if (!image || imgError) {
        return (
            <div
                className={`${sizeClass} flex shrink-0 items-center justify-center rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-cyan-400/20 to-blue-600/20 text-sm font-bold text-cyan-300 shadow-[0_6px_18px_rgba(6,182,212,0.12)]`}
            >
                {initials}
            </div>
        );
    }

    return (
        <img
            src={image}
            alt={name || "Patient"}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className={`${sizeClass} shrink-0 rounded-2xl border border-cyan-400/20 object-cover shadow-lg`}
        />
    );
}

function StatCard({
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
}) {
    return (
        <div
            style={{ animationDelay: `${delay}ms` }}
            className="group animate-[fadeUp_0.6s_ease_both] [perspective:1000px]"
        >
            <Card className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111c30] p-5 shadow-[0_15px_35px_rgba(0,0,0,0.25)] transition-all duration-500 hover:-translate-y-2 hover:[transform:rotateX(3deg)] hover:border-white/20 hover:shadow-[0_25px_45px_rgba(0,0,0,0.4)]">
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
}

export default function AdminPatientsPage() {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState("");
    const [banLoadingId, setBanLoadingId] = useState<string | null>(null);

    // Appointment history
    const [expandedPatientId, setExpandedPatientId] = useState<string | null>(null);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [history, setHistory] = useState<PatientAppointment[]>([]);

    const loadPatients = async () => {
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/patients`,
                { cache: "no-store" }
            );

            if (!res.ok) throw new Error();

            const data = await res.json();
            setPatients(Array.isArray(data.data) ? data.data : []);
        } catch {
            toast.error("Failed to load patients");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadPatients();
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        loadPatients();
    };

    // Patient statistics
    const stats = useMemo(() => {
        const banned = patients.filter((p) => p.banned).length;
        const totalAppointments = patients.reduce(
            (total, patient) => total + (Number(patient.appointmentCount) || 0),
            0
        );

        return {
            total: patients.length,
            active: patients.length - banned,
            banned,
            appointments: totalAppointments,
        };
    }, [patients]);

    // Ban / Unban
    const toggleBan = async (patient: Patient) => {
        setBanLoadingId(patient._id);

        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/patients/${patient._id}/ban`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ banned: !patient.banned }),
                }
            );

            if (!res.ok) throw new Error();

            setPatients((prev) =>
                prev.map((p) =>
                    p._id === patient._id
                        ? { ...p, banned: !p.banned }
                        : p
                )
            );

            toast.success(patient.banned ? "Patient unbanned" : "Patient banned");
        } catch {
            toast.error("Failed to update patient status");
        } finally {
            setBanLoadingId(null);
        }
    };

    // Appointment history
    const viewHistory = async (patientId: string) => {
        if (expandedPatientId === patientId) {
            setExpandedPatientId(null);
            return;
        }

        setExpandedPatientId(patientId);
        setHistoryLoading(true);
        setHistory([]);

        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/patients/${patientId}/appointments`,
                { cache: "no-store" }
            );

            if (!res.ok) throw new Error();

            const data = await res.json();
            setHistory(Array.isArray(data.data) ? data.data : []);
        } catch {
            toast.error("Failed to load appointment history");
        } finally {
            setHistoryLoading(false);
        }
    };

    // Search
    const filteredPatients = useMemo(() => {
        const q = search.toLowerCase().trim();

        return patients.filter((p) =>
            p.name?.toLowerCase().includes(q) ||
            p.email?.toLowerCase().includes(q)
        );
    }, [patients, search]);

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center bg-[#080f1e]">
                <div className="text-center">
                    <div className="mx-auto size-12 animate-spin rounded-full border-4 border-cyan-400/20 border-t-cyan-400" />
                    <p className="mt-4 text-sm text-slate-400">
                        Loading patients...
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
                            Patient <span className="text-cyan-400">Management</span>
                        </h1>

                        <p className="mt-2 text-sm text-slate-400">
                            Manage patient profiles, accounts and appointment history.
                        </p>
                    </div>

                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="flex items-center justify-center gap-2 self-start rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-5 py-3 text-xs font-bold text-cyan-300 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-cyan-400/20 disabled:opacity-50 sm:self-center"
                    >
                        <FiRefreshCw className={refreshing ? "animate-spin" : ""} />
                        Refresh Data
                    </button>
                </div>
            </section>

            {/* Statistics */}
            <section className="space-y-4">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-400">
                        Overview
                    </p>
                    <h2 className="mt-1 text-xl font-bold text-white">
                        Patient Statistics
                    </h2>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        title="Total Patients"
                        value={stats.total}
                        subtitle="Registered patients"
                        icon={FiUsers}
                        color="#06b6d4"
                        delay={0}
                    />

                    <StatCard
                        title="Active Patients"
                        value={stats.active}
                        subtitle="Currently active accounts"
                        icon={FiUserCheck}
                        color="#10b981"
                        delay={100}
                    />

                    <StatCard
                        title="Banned Patients"
                        value={stats.banned}
                        subtitle="Restricted accounts"
                        icon={FiUserX}
                        color="#ef4444"
                        delay={200}
                    />

                    <StatCard
                        title="Total Appointments"
                        value={stats.appointments}
                        subtitle="Appointments across patients"
                        icon={FiCalendar}
                        color="#a78bfa"
                        delay={300}
                    />
                </div>
            </section>

            {/* Patient Directory */}
            <section className="space-y-5">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-blue-400">
                            Directory
                        </p>

                        <h2 className="mt-1 text-xl font-bold text-white">
                            All Patients
                            <span className="ml-2 text-sm font-medium text-slate-500">
                                ({filteredPatients.length})
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
                            placeholder="Search by name or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-xl border border-white/10 bg-[#111c30] py-3 pl-10 pr-4 text-sm text-white outline-none transition-all placeholder:text-slate-500 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/10"
                        />
                    </div>
                </div>

                {/* Patient Cards */}
                {filteredPatients.length === 0 ? (
                    <div className="rounded-2xl border border-white/[0.08] bg-[#111c30] py-16 text-center">
                        <FiUsers className="mx-auto text-3xl text-slate-600" />

                        <p className="mt-4 text-sm font-semibold text-slate-300">
                            No patients found
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                            Try searching with another name or email.
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {filteredPatients.map((patient, index) => (
                            <Card
                                key={patient._id}
                                style={{
                                    animationDelay: `${Math.min(index * 50, 500)}ms`,
                                }}
                                className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[#111c30] p-4 shadow-[0_8px_25px_rgba(0,0,0,0.15)] transition-all duration-500 hover:-translate-y-1 hover:border-cyan-400/20 hover:shadow-[0_18px_35px_rgba(0,0,0,0.3)] sm:p-5"
                            >
                                <div className="pointer-events-none absolute -right-16 -top-16 size-40 rounded-full bg-cyan-500/0 blur-3xl transition-all duration-500 group-hover:bg-cyan-500/10" />

                                <div className="relative flex flex-col gap-4 xl:flex-row xl:items-center">

                                    {/* Patient Profile */}
                                    <div className="flex min-w-0 flex-1 items-center gap-4">
                                        <div className="relative">
                                            <PatientAvatar
                                                image={patient.image}
                                                name={patient.name}
                                            />

                                            <span
                                                className={`absolute -bottom-1 -right-1 size-4 rounded-full border-[3px] border-[#111c30] ${
                                                    patient.banned
                                                        ? "bg-red-500"
                                                        : "bg-emerald-400"
                                                }`}
                                            />
                                        </div>

                                        <div className="min-w-0">
                                            <p className="truncate text-base font-bold text-white transition-colors group-hover:text-cyan-300">
                                                {patient.name || "Unnamed Patient"}
                                            </p>

                                            <div className="mt-1 flex items-center gap-1.5 truncate text-xs text-slate-400">
                                                <FiMail className="shrink-0 text-cyan-400" />
                                                <span className="truncate">
                                                    {patient.email || "No email available"}
                                                </span>
                                            </div>

                                            {patient.createdAt && (
                                                <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-slate-500">
                                                    <FiCalendar />
                                                    Joined{" "}
                                                    {new Date(patient.createdAt).toLocaleDateString(
                                                        "en-US",
                                                        {
                                                            year: "numeric",
                                                            month: "short",
                                                            day: "numeric",
                                                        }
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Patient Details */}
                                    <div className="flex flex-wrap items-center gap-2 border-t border-white/[0.06] pt-3 xl:border-t-0 xl:pt-0">
                                        <div className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-2.5">
                                            <FiCalendar className="text-cyan-400" />

                                            <div>
                                                <p className="text-sm font-bold text-white">
                                                    {patient.appointmentCount || 0}
                                                </p>
                                                <p className="text-[9px] text-slate-500">
                                                    Appointments
                                                </p>
                                            </div>
                                        </div>

                                        <Chip
                                            size="sm"
                                            color={patient.banned ? "danger" : "success"}
                                            variant="flat"
                                        >
                                            {patient.banned ? "Banned" : "Active"}
                                        </Chip>

                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            className="border border-white/10 bg-white/[0.05] text-slate-300 transition-all hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-cyan-300"
                                            onPress={() => viewHistory(patient._id)}
                                        >
                                            {expandedPatientId === patient._id
                                                ? "Hide History"
                                                : "History"}
                                        </Button>

                                        <Button
                                            size="sm"
                                            isLoading={banLoadingId === patient._id}
                                            className={
                                                patient.banned
                                                    ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"
                                                    : "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                                            }
                                            onPress={() => toggleBan(patient)}
                                        >
                                            {patient.banned ? (
                                                <>
                                                    <FiCheckCircle size={13} />
                                                    Unban
                                                </>
                                            ) : (
                                                <>
                                                    <FiSlash size={13} />
                                                    Ban
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                {/* Appointment History */}
                                {expandedPatientId === patient._id && (
                                    <div className="relative mt-5 border-t border-white/[0.08] pt-5">
                                        <div className="mb-4 flex items-center gap-2">
                                            <div className="flex size-8 items-center justify-center rounded-lg bg-cyan-400/10 text-cyan-400">
                                                <FiClock />
                                            </div>

                                            <div>
                                                <h3 className="text-sm font-bold text-white">
                                                    Appointment History
                                                </h3>
                                                <p className="text-[10px] text-slate-500">
                                                    Previous patient appointments
                                                </p>
                                            </div>
                                        </div>

                                        {historyLoading ? (
                                            <div className="flex items-center gap-3 py-5 text-sm text-slate-400">
                                                <div className="size-5 animate-spin rounded-full border-2 border-cyan-400/20 border-t-cyan-400" />
                                                Loading history...
                                            </div>
                                        ) : history.length === 0 ? (
                                            <p className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 text-center text-sm text-slate-500">
                                                No appointments found.
                                            </p>
                                        ) : (
                                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                                {history.map((appt) => (
                                                    <div
                                                        key={appt._id}
                                                        className="group/history rounded-xl border border-white/[0.07] bg-[#080f1e]/70 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/20 hover:shadow-lg"
                                                    >
                                                        <div className="flex items-center justify-between gap-2">
                                                            <p className="truncate text-sm font-semibold text-white">
                                                                {appt.doctorDetails?.name || "Doctor"}
                                                            </p>

                                                            <Chip
                                                                size="sm"
                                                                variant="flat"
                                                                className="shrink-0 capitalize"
                                                            >
                                                                {appt.status}
                                                            </Chip>
                                                        </div>

                                                        <p className="mt-1 text-xs text-slate-500">
                                                            {appt.doctorDetails?.specialization || "General"}
                                                        </p>

                                                        <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                                                            <FiCalendar className="text-cyan-400" />
                                                            {appt.date &&
                                                            !Number.isNaN(new Date(appt.date).getTime())
                                                                ? new Date(appt.date).toLocaleDateString(
                                                                    "en-US",
                                                                    {
                                                                        year: "numeric",
                                                                        month: "short",
                                                                        day: "numeric",
                                                                    }
                                                                )
                                                                : "Date unavailable"}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </Card>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
