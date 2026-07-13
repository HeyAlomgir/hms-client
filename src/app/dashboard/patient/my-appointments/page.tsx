"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";

import { FiCalendar, FiClock } from "react-icons/fi";
import { Card, CardHeader, Chip } from "@heroui/react";
import { RxDividerHorizontal } from "react-icons/rx";

interface DoctorDetails {
    name?: string;
    image?: string;
    specialization?: string;
}

interface Appointment {
    _id: string;
    status: string;
    date: string;
    createdAt: string;
    doctorDetails?: DoctorDetails;
}

const statusColorMap: Record<string, "warning" | "success" | "danger" | "default"> = {
    pending: "warning",
    approved: "success",
    confirmed: "success",
    cancelled: "danger",
    rejected: "danger",
};

const getInitials = (name?: string): string =>
    name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "?";

// 🔥 কাস্টম Avatar — referrerPolicy সেট করা এবং broken image হলে initials fallback
function DoctorAvatar({ image, name }: { image?: string; name?: string }) {
    const [imgError, setImgError] = useState(false);

    if (!image || imgError) {
        return (
            <div className="h-12 w-12 flex-shrink-0 rounded-full bg-blue-500/10 ring-2 ring-blue-500/30 flex items-center justify-center text-sm font-semibold text-blue-400">
                {getInitials(name)}
            </div>
        );
    }

    return (
        <img
            src={image}
            alt={name || "Doctor"}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="h-12 w-12 flex-shrink-0 rounded-full object-cover ring-2 ring-blue-500/30"
        />
    );
}

export default function PatientDashboard() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [mounted, setMounted] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const { data: session, isPending } = authClient.useSession();

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (isPending) return;
        if (!session?.user?.id) return;

        fetch(`http://localhost:5000/api/my-appointments/${session.user.id}`)
            .then((res) => res.json())
            .then((data) => setAppointments(data.data || []))
            .finally(() => setLoadingData(false));
    }, [session, isPending]);

    if (!mounted || isPending) {
        return <div className="text-white p-6">Loading...</div>;
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-xl sm:text-2xl font-bold mb-6 text-white">
                My Appointments
            </h1>

            {loadingData ? (
                <p className="text-neutral-400 text-sm">Loading your appointments...</p>
            ) : appointments.length === 0 ? (
                <p className="text-neutral-400 text-sm">You have no appointments yet.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
                    {appointments.map((item) => {
                        const doctor = item.doctorDetails;
                        const statusColor = statusColorMap[item.status] || "default";

                        return (
                            <Card
                                key={item._id}
                                className="bg-neutral-900 border border-white/10 shadow-md shadow-black/30"
                            >
                                <CardHeader className="flex items-center gap-3 pb-0">
                                    <DoctorAvatar image={doctor?.image} name={doctor?.name} />

                                    <div className="flex flex-col min-w-0">
                                        <p className="text-white font-semibold text-sm sm:text-base truncate">
                                            {doctor?.name || "Doctor"}
                                        </p>
                                        {doctor?.specialization && (
                                            <p className="text-blue-400 text-xs truncate">
                                                {doctor.specialization}
                                            </p>
                                        )}
                                    </div>

                                    <Chip
                                        color={statusColor}
                                        variant="flat"
                                        size="sm"
                                        className="ml-auto capitalize flex-shrink-0"
                                    >
                                        {item.status}
                                    </Chip>
                                </CardHeader>



                                <div className="pt-0 flex flex-col gap-2 px-4 pb-4">
                                    <div className="flex items-center gap-2 text-sm text-neutral-300">
                                        <FiCalendar className="text-blue-400 flex-shrink-0" size={15} />
                                        <span>
                                            Appointment:{" "}
                                            <span className="text-white font-medium">
                                                {new Date(item.date).toLocaleDateString(undefined, {
                                                    year: "numeric",
                                                    month: "short",
                                                    day: "numeric",
                                                })}
                                            </span>
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 text-xs text-neutral-500">
                                        <FiClock className="flex-shrink-0" size={13} />
                                        <span>
                                            Booked on{" "}
                                            {new Date(item.createdAt).toLocaleString(undefined, {
                                                year: "numeric",
                                                month: "short",
                                                day: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </span>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}