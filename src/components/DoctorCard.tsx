"use client";

import { useState } from "react";
import { Card, Button } from "@heroui/react";
import {
    FiClock,
    FiDollarSign,
    FiUsers,
    FiCalendar,
    FiCheckCircle,
} from "react-icons/fi";
import Link from "next/link";


interface Doctor {
    _id: string;
    name: string;
    email?: string;
    specialization: string;
    degree?: string;
    description: string;
    image?: string;
    consultationFee: string | number;
    workingDays: string[];
    startTime: string | null;
    endTime: string | null;
    maxAppointments: string | number;
    consultationType: "in-person" | "online";
    status?: "approved" | "pending" | string;
}


interface DoctorCardProps {
    doctor: Doctor;
}

const DoctorCard = ({ doctor }: DoctorCardProps): React.JSX.Element => {
    const [imgError, setImgError] = useState<boolean>(false);

  
    const initials: string = doctor.name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "";

    const isApproved: boolean = doctor.status === "approved";

    return (
        <Card
            className="group relative w-full max-w-sm mx-auto sm:max-w-none overflow-hidden
                 rounded-2xl border border-white/10 bg-gradient-to-b from-neutral-900 to-neutral-950
                 shadow-lg shadow-black/40 transition-all duration-300
                 hover:border-blue-500/40 hover:shadow-blue-500/10 hover:-translate-y-1"
        >
            {/* Status badge */}
            <div className="absolute top-3 right-3 z-10">
                <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium backdrop-blur-sm
            ${isApproved
                            ? "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30"
                            : "bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30"
                        }`}
                >
                    <FiCheckCircle size={12} />
                    {doctor.status || "pending"}
                </span>
            </div>

            <Card.Header className="flex-row items-center gap-4 p-5 pb-3">
                {!imgError && doctor.image ? (
                    <img
                        src={doctor.image}
                        alt={doctor.name}
                        onError={() => setImgError(true)}
                        referrerPolicy="no-referrer"
                        className="h-16 w-16 rounded-full object-cover ring-2 ring-blue-500/30 flex-shrink-0"
                    />
                ) : (
                    <div className="h-16 w-16 rounded-full flex-shrink-0 bg-blue-500/10 ring-2 ring-blue-500/30 flex items-center justify-center font-semibold text-sm text-blue-400">
                        {initials}
                    </div>
                )}
                <div className="flex flex-col min-w-0">
                    <Card.Title className="truncate text-white text-base">
                        {doctor.name}
                    </Card.Title>
                    <span className="text-xs font-medium text-blue-400 mt-0.5">
                        {doctor.specialization}
                    </span>
                </div>
            </Card.Header>

            <Card.Content className="flex flex-col gap-4 px-5 pb-5">
                <p className="text-sm text-neutral-400 line-clamp-2 leading-relaxed">
                    {doctor.description}
                </p>

                <span className="w-fit rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-neutral-300 ring-1 ring-white/10">
                    {doctor.consultationType}
                </span>

                <div className="grid grid-cols-2 gap-3 rounded-xl bg-white/[0.03] p-3 ring-1 ring-white/5">
                    <div className="flex items-center gap-2">
                        <FiDollarSign size={15} className="text-blue-400 flex-shrink-0" />
                        <div className="min-w-0">
                            <p className="text-[11px] text-neutral-500 leading-none">Fee</p>
                            <p className="text-sm font-medium text-white truncate">
                                {doctor.consultationFee}৳
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <FiUsers size={15} className="text-blue-400 flex-shrink-0" />
                        <div className="min-w-0">
                            <p className="text-[11px] text-neutral-500 leading-none">
                                Slots
                            </p>
                            <p className="text-sm font-medium text-white truncate">
                                {doctor.maxAppointments}
                            </p>
                        </div>
                    </div>
                    <div className="col-span-2 flex items-center gap-2">
                        <FiClock size={15} className="text-blue-400 flex-shrink-0" />
                        <p className="text-sm text-white">
                            {doctor.startTime} - {doctor.endTime}
                        </p>
                    </div>
                    <div className="col-span-2 flex items-start gap-2">
                        <FiCalendar size={15} className="text-blue-400 flex-shrink-0 mt-0.5" />
                        <div className="flex flex-wrap gap-1">
                            {doctor.workingDays?.map((day) => (
                                <span
                                    key={day}
                                    className="text-[11px] text-neutral-300 bg-white/5 px-2 py-0.5 rounded-full ring-1 ring-white/10"
                                >
                                    {day}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </Card.Content>

            <Card.Footer className="px-5 pb-5 pt-0">
                <Link href={`/doctors/${doctor._id}`} className="w-full">
                    <Button
                        className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium
                                 transition-colors duration-200"
                        size="sm"
                    >
                        View Details
                    </Button>
                </Link>
            </Card.Footer>
        </Card>
    );
};

export default DoctorCard;