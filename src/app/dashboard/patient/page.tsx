"use client";

import { authClient } from "@/lib/auth-client";


import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// data type
interface Appointment {
  _id: string;
  patientId: string;
  doctorId: string;
  date: string;
  status: "pending" | "completed" | "approved";
  doctorDetails?: {
    name: string;
    specialization?: string;
    consultationFee?: number | string;
  };
}

interface ChartData {
  name: string;
  appointments: number;
}

export default function PatientDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const { data: session } = authClient.useSession();

  // dynamic userid
  const userId = session?.user?.id;
  console.log("userID", userId)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/my-appointments/${userId}`);
        const data = await res.json();
        if (data.success) {
          setAppointments(data.data);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [userId]);

  // 🔹 ১. Summary Cards 
  const totalAppointments = appointments.length;
  const pendingCount = appointments.filter(app => app.status === "pending").length;
  const completedCount = appointments.filter(app => app.status === "completed").length;

  // paid total amount
  const totalPaid = appointments.reduce((sum, app) => {
    const fee = Number(app.doctorDetails?.consultationFee) || 0;
    return sum + fee;
  }, 0);

  // 🔹 ২. Recharts 
  const generateChartData = (): ChartData[] => {
    const daysMap: Record<string, number> = {
      Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0
    };

    appointments.forEach((app) => {
      const appDate = new Date(app.date);

      const dayName = appDate.toLocaleDateString("en-US", { weekday: "short" });
      if (daysMap[dayName] !== undefined) {
        daysMap[dayName] += 1;
      }
    });

    // Recharts 
    const chartOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return chartOrder.map(day => ({
      name: day,
      appointments: daysMap[day]
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#0f172a]">
        <p className="text-white text-lg animate-pulse">Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-[#0f172a] min-h-screen">

      {/* 🔹 Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

        <div className="bg-[#111827] p-5 rounded-xl shadow-md border border-gray-800">
          <h2 className="text-gray-400">Total Appointments</h2>
          <p className="text-2xl font-bold text-white">{totalAppointments}</p>
        </div>

        <div className="bg-[#111827] p-5 rounded-xl shadow-md border border-gray-800">
          <h2 className="text-yellow-400">Pending</h2>
          <p className="text-2xl font-bold text-white">{pendingCount}</p>
        </div>

        <div className="bg-[#111827] p-5 rounded-xl shadow-md border border-gray-800">
          <h2 className="text-green-400">Completed</h2>
          <p className="text-2xl font-bold text-white">{completedCount}</p>
        </div>

        <div className="bg-[#111827] p-5 rounded-xl shadow-md border border-gray-800">
          <h2 className="text-blue-400">Total Spent</h2>
          <p className="text-2xl font-bold text-white">৳{totalPaid}</p>
        </div>

      </div>

      {/* 🔹 Recharts Chart Section */}
      <div className="bg-[#111827] p-6 rounded-xl shadow-md border border-gray-800">
        <h2 className="text-white mb-4 text-lg font-semibold">
          Appointment Activity
        </h2>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={generateChartData()}>
            <XAxis dataKey="name" stroke="#888" />
            <Tooltip
              contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151" }}
              labelStyle={{ color: "#fff" }}
            />
            <Line
              type="monotone"
              dataKey="appointments"
              stroke="#3b82f6"
              strokeWidth={3}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 🔹 Recent Appointments */}
   {/* 🔹 Recent Appointments */}
<div className="bg-[#111827] p-6 rounded-xl shadow-md border border-gray-800">
  <h2 className="text-white mb-4 text-lg font-semibold">
    Recent Appointments
  </h2>

  <div className="space-y-3">
    {appointments.length === 0 ? (
      <p className="text-gray-500 py-4 text-center">No appointments found.</p>
    ) : (
      appointments.slice(0, 5).map((app) => {

        const formattedDate = new Date(app.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric"
        });


        const initials = app.doctorDetails?.name 
          ? app.doctorDetails.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
          : "DR";

        return (
          <div key={app._id} className="flex justify-between items-center bg-[#1f2937] p-3 rounded-lg border border-gray-700">

            <div className="flex items-center gap-3">
             <img src={app.doctorDetails.image} alt="doctorimg" className="w-12 rounded-full" />
              
              <div>
                <p className="text-white font-medium">
                  {app.doctorDetails?.name || "Unknown Doctor"}
                </p>
                <p className={`text-sm font-medium ${app.status === "completed" ? "text-green-400" :
                    app.status === "pending" ? "text-yellow-400" : "text-blue-400"
                  }`}>
                  {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                </p>
              </div>
            </div>


            <span className="text-sm text-gray-400">{formattedDate}</span>
          </div>
        );
      })
    )}
  </div>
</div>

    </div>
  );
}