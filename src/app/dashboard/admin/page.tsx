"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";

interface AnalyticsData {
  totalPatients: number;
  totalDoctors: number;
  totalAppointments: number;
  statusStats: { _id: string; count: number }[];
  monthlyStats: { _id: number; count: number }[];
}

export default function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin-analytics`);

      if (!res.ok) throw new Error("API failed");

      const json = await res.json();

      console.log("Analytics:", json);

      setData(json.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load analytics");
    }
  };

  if (!data) {
    return <p className="text-white p-6">Loading...</p>;
  }

  const monthMap = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  const monthlyData = data.monthlyStats.map((m) => ({
    name: monthMap[m._id - 1],
    count: m.count
  }));

  return (
    <div className="p-4 sm:p-6 text-white flex flex-col gap-6">

      {/* TOP CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-neutral-900 p-4 rounded-lg">
          <h2 className="text-sm text-gray-400">Patients</h2>
          <p className="text-xl sm:text-2xl font-bold">{data.totalPatients}</p>
        </div>

        <div className="bg-neutral-900 p-4 rounded-lg">
          <h2 className="text-sm text-gray-400">Doctors</h2>
          <p className="text-xl sm:text-2xl font-bold">{data.totalDoctors}</p>
        </div>

        <div className="bg-neutral-900 p-4 rounded-lg">
          <h2 className="text-sm text-gray-400">Appointments</h2>
          <p className="text-xl sm:text-2xl font-bold">{data.totalAppointments}</p>
        </div>
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* PIE CHART */}
        <div className="bg-neutral-900 p-4 rounded-lg w-full h-[250px] sm:h-[300px]">
          <h2 className="mb-3 font-semibold text-sm sm:text-base">Appointment Status</h2>

          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.statusStats}
                dataKey="count"
                nameKey="_id"
                outerRadius={80}
              />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* LINE CHART */}
        <div className="bg-neutral-900 p-4 rounded-lg w-full h-[250px] sm:h-[300px]">
          <h2 className="mb-3 font-semibold text-sm sm:text-base">Monthly Appointments</h2>

          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" />
            </LineChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
}