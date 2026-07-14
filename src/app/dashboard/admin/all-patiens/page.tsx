"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Card, Chip, Button } from "@heroui/react";
import { FiSearch, FiCalendar, FiMail, FiSlash, FiCheckCircle, FiX } from "react-icons/fi";

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

function PatientAvatar({ image, name }: { image?: string; name?: string }) {
    const [imgError, setImgError] = useState(false);
    const initials =
        name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "?";

    if (!image || imgError) {
        return (
            <div className="h-11 w-11 flex-shrink-0 rounded-full bg-blue-500/10 ring-2 ring-blue-500/30 flex items-center justify-center text-sm font-semibold text-blue-400">
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
            className="h-11 w-11 flex-shrink-0 rounded-full object-cover ring-2 ring-blue-500/30"
        />
    );
}

export default function AdminPatientsPage() {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [banLoadingId, setBanLoadingId] = useState<string | null>(null);

    // appointment history modal- panel-এর
    const [expandedPatientId, setExpandedPatientId] = useState<string | null>(null);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [history, setHistory] = useState<PatientAppointment[]>([]);

    const loadPatients = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/patients`);
            const data = await res.json();
            setPatients(data.data || []);
        } catch {
            toast.error("Failed to load patients");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPatients();
    }, []);

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
                prev.map((p) => (p._id === patient._id ? { ...p, banned: !p.banned } : p))
            );
            toast.success(patient.banned ? "Patient unbanned" : "Patient banned");
        } catch {
            toast.error("Failed to update patient status");
        } finally {
            setBanLoadingId(null);
        }
    };

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
                `${process.env.NEXT_PUBLIC_API_URL}/api/patients/${patientId}/appointments`
            );
            const data = await res.json();
            setHistory(data.data || []);
        } catch {
            toast.error("Failed to load appointment history");
        } finally {
            setHistoryLoading(false);
        }
    };

    const filteredPatients = patients.filter((p) => {
        const q = search.toLowerCase();
        return (
            p.name?.toLowerCase().includes(q) ||
            p.email?.toLowerCase().includes(q)
        );
    });

    if (loading) {
        return <div className="text-white p-6">Loading...</div>;
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h1 className="text-xl sm:text-2xl font-bold text-white">
                    Patients ({patients.length})
                </h1>

                <div className="relative w-full sm:w-72">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={15} />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-lg bg-neutral-900 border border-white/10 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                </div>
            </div>

            {filteredPatients.length === 0 ? (
                <p className="text-neutral-400 text-sm">No patients found.</p>
            ) : (
                <div className="flex flex-col gap-3">
                    {filteredPatients.map((patient) => (
                        <Card
                            key={patient._id}
                            className="bg-neutral-900 border border-white/10 p-4"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <PatientAvatar image={patient.image} name={patient.name} />
                                    <div className="min-w-0">
                                        <p className="text-white font-semibold text-sm truncate">
                                            {patient.name || "Unnamed"}
                                        </p>
                                        <div className="flex items-center gap-1 text-neutral-500 text-xs truncate">
                                            <FiMail size={11} />
                                            {patient.email}
                                        </div>
                                        {patient.createdAt && (
                                            <div className="flex items-center gap-1 text-neutral-600 text-[11px] mt-0.5">
                                                <FiCalendar size={10} />
                                                Joined{" "}
                                                {new Date(patient.createdAt).toLocaleDateString(undefined, {
                                                    year: "numeric",
                                                    month: "short",
                                                    day: "numeric",
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 flex-wrap">
                                    <Chip size="sm" variant="flat" className="text-neutral-300">
                                        {patient.appointmentCount} appointment
                                        {patient.appointmentCount !== 1 ? "s" : ""}
                                    </Chip>

                                    {patient.banned && (
                                        <Chip size="sm" color="danger" variant="flat">
                                            Banned
                                        </Chip>
                                    )}

                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        className="bg-white/5 text-neutral-300 hover:bg-white/10"
                                        onPress={() => viewHistory(patient._id)}
                                    >
                                        {expandedPatientId === patient._id ? "Hide" : "History"}
                                    </Button>

                                    <Button
                                        size="sm"
                                        isLoading={banLoadingId === patient._id}
                                        className={
                                            patient.banned
                                                ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                                                : "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                                        }
                                        onPress={() => toggleBan(patient)}
                                    >
                                        {patient.banned ? (
                                            <>
                                                <FiCheckCircle size={13} /> Unban
                                            </>
                                        ) : (
                                            <>
                                                <FiSlash size={13} /> Ban
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>

                            {/* Expanded appointment history */}
                            {expandedPatientId === patient._id && (
                                <div className="mt-4 pt-4 border-t border-white/10">
                                    {historyLoading ? (
                                        <p className="text-neutral-500 text-sm">Loading history...</p>
                                    ) : history.length === 0 ? (
                                        <p className="text-neutral-500 text-sm">No appointments found.</p>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {history.map((appt) => (
                                                <div
                                                    key={appt._id}
                                                    className="rounded-lg bg-white/[0.03] border border-white/5 p-3 flex flex-col gap-1"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-white text-sm font-medium truncate">
                                                            {appt.doctorDetails?.name || "Doctor"}
                                                        </p>
                                                        <Chip size="sm" variant="flat" className="capitalize">
                                                            {appt.status}
                                                        </Chip>
                                                    </div>
                                                    <p className="text-neutral-500 text-xs">
                                                        {appt.doctorDetails?.specialization}
                                                    </p>
                                                    <p className="text-neutral-400 text-xs">
                                                        {new Date(appt.date).toLocaleDateString(undefined, {
                                                            year: "numeric",
                                                            month: "short",
                                                            day: "numeric",
                                                        })}
                                                    </p>
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
        </div>
    );
}