"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Card, CardHeader, Chip, Button, Tabs, Tab } from "@heroui/react";
import { FiCalendar, FiClock, FiCheck, FiX } from "react-icons/fi";
import toast from "react-hot-toast";

interface PatientDetails {
    name?: string;
    image?: string;
    email?: string;
}

interface Appointment {
    _id: string;
    status: string;
    date: string;
    createdAt: string;
    patientDetails?: PatientDetails;
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

const statusColorMap: Record<string, "warning" | "success" | "danger" | "default"> = {
    pending: "warning",
    approved: "success",
    completed: "default",
    rejected: "danger",
};

export default function DoctorAppointments() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
    const { data: session, isPending } = authClient.useSession();

    useEffect(() => {
        setMounted(true);
    }, []);

    const loadAppointments = async () => {
        if (!session?.user?.id) return;
        try {
            // 1. first userId to doctor profile- _id find
            const doctorRes = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/doctors/by-user/${session.user.id}`
            );
            const doctorData = await doctorRes.json();

            if (!doctorData.success) {
                toast.error("Doctor profile not found");
                setLoading(false);
                return;
            }

            const doctorId = doctorData.data._id;

            // 2.she doctorId to appointments
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/doctor-appointments/${doctorId}`
            );
            const data = await res.json();
            setAppointments(data.data || []);
        } catch (err) {
            toast.error("Failed to load appointments");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isPending) return;
        loadAppointments();
    }, [session, isPending]);

    const updateStatus = async (id: string, status: string) => {
        setActionLoadingId(id);
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/appointments/${id}/status`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status }),
                }
            );

            if (!res.ok) throw new Error();

            toast.success(`Appointment ${status}`);
            setAppointments((prev) =>
                prev.map((a) => (a._id === id ? { ...a, status } : a))
            );
        } catch {
            toast.error("Failed to update appointment");
        } finally {
            setActionLoadingId(null);
        }
    };

    if (!mounted || isPending || loading) {
        return <div className="text-white p-6">Loading...</div>;
    }

    const grouped = {
        pending: appointments.filter((a) => a.status === "pending"),
        approved: appointments.filter((a) => a.status === "approved"),
        completed: appointments.filter((a) => a.status === "completed" || a.status === "rejected"),
    };

    const renderList = (list: Appointment[], showActions: boolean) => {
        if (list.length === 0) {
            return <p className="text-neutral-400 text-sm py-6">No appointments here.</p>;
        }

        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 mt-4">
                {list.map((item) => {
                    const patient = item.patientDetails;
                    return (
                        <Card
                            key={item._id}
                            className="bg-neutral-900 border border-white/10 shadow-md shadow-black/30"
                        >
                            <CardHeader className="flex items-center gap-3 pb-0">
                                <PatientAvatar image={patient?.image} name={patient?.name} />
                                <div className="flex flex-col min-w-0">
                                    <p className="text-white font-semibold text-sm truncate">
                                        {patient?.name || "Patient"}
                                    </p>
                                    <p className="text-neutral-500 text-xs truncate">
                                        {patient?.email}
                                    </p>
                                </div>
                                <Chip
                                    color={statusColorMap[item.status] || "default"}
                                    variant="flat"
                                    size="sm"
                                    className="ml-auto capitalize flex-shrink-0"
                                >
                                    {item.status}
                                </Chip>
                            </CardHeader>

                            <div className="px-4 pb-4 pt-3 flex flex-col gap-2">
                                <div className="flex items-center gap-2 text-sm text-neutral-300">
                                    <FiCalendar className="text-blue-400 flex-shrink-0" size={14} />
                                    {new Date(item.date).toLocaleDateString(undefined, {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                    })}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-neutral-500">
                                    <FiClock size={12} />
                                    Booked on{" "}
                                    {new Date(item.createdAt).toLocaleDateString(undefined, {
                                        month: "short",
                                        day: "numeric",
                                    })}
                                </div>

                                {showActions && (
                                    <div className="flex gap-2 mt-2">
                                        <Button
                                            size="sm"
                                            className="bg-emerald-600 hover:bg-emerald-500 text-white flex-1"
                                            isLoading={actionLoadingId === item._id}
                                            onPress={() => updateStatus(item._id, "approved")}
                                        >
                                            <FiCheck size={14} /> Approve
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            className="bg-red-500/10 text-red-400 hover:bg-red-500/20 flex-1"
                                            isLoading={actionLoadingId === item._id}
                                            onPress={() => updateStatus(item._id, "rejected")}
                                        >
                                            <FiX size={14} /> Reject
                                        </Button>
                                    </div>
                                )}

                                {item.status === "approved" && (
                                    <Button
                                        size="sm"
                                        className="bg-blue-600 hover:bg-blue-500 text-white mt-2"
                                        isLoading={actionLoadingId === item._id}
                                        onPress={() => updateStatus(item._id, "completed")}
                                    >
                                        Mark as Completed
                                    </Button>
                                )}
                            </div>
                        </Card>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-xl sm:text-2xl font-bold mb-4 text-white">
                Appointments
            </h1>

            <Tabs
                defaultSelectedKey="pending"
                className="w-full"
            >
                <Tabs.ListContainer>
                    <Tabs.List aria-label="Appointment tabs">
                        <Tabs.Tab id="pending">
                            Pending ({grouped.pending.length})
                        </Tabs.Tab>
                        <Tabs.Tab id="approved">
                            Approved ({grouped.approved.length})
                        </Tabs.Tab>
                        <Tabs.Tab id="completed">
                            History ({grouped.completed.length})
                        </Tabs.Tab>
                    </Tabs.List>
                </Tabs.ListContainer>

                <Tabs.Panel id="pending">
                    {renderList(grouped.pending, true)}
                </Tabs.Panel>
                <Tabs.Panel id="approved">
                    {renderList(grouped.approved, false)}
                </Tabs.Panel>
                <Tabs.Panel id="completed">
                    {renderList(grouped.completed, false)}
                </Tabs.Panel>
            </Tabs>
        </div>
    );
}