"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function PatientDashboard() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isPending) return;
    if (!session?.user?.id) return;

    fetch(`http://localhost:5000/api/my-appointments/${session.user.id}`)
      .then(res => res.json())
      .then(data => setAppointments(data.data || []));
  }, [session, isPending]);

  
  if (!mounted || isPending) {
    return <div className="text-white p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">My Appointments</h1>
      <div className="grid gap-4">
        {appointments.map((item) => (
          <div key={item._id} className="p-4 border rounded bg-gray-800 text-white">
            <h2 className="text-lg font-semibold">{item.doctorDetails?.name}</h2>
            <p>Status: {item.status}</p>
            <p>Date: {new Date(item.date).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}