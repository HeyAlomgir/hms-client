"use client";

import DoctorCard from "@/components/DoctorCard";
import { useEffect, useState } from "react";



interface Doctor {
  _id: string;
  name: string;
  email: string;
  specialization: string;
  degree: string;
  description: string;
  image: string;
  consultationFee: string;
  workingDays: string[];
  startTime: string | null;
  endTime: string | null;
  maxAppointments: string;
  consultationType: "in-person" | "online";
}

const Doctors = () => {

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadProducts = async (): Promise<void> => {
    try {
      const res = await fetch(`http://localhost:5000/api/doctors`);
      const data: Doctor[] = await res.json();
      setDoctors(data);
    } catch (err) {
      console.error("Failed to load doctors:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  if (loading) {
    return <div className="p-6 text-center">Loading doctors...</div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold mb-6">Doctors</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {doctors.map((doctor) => (
          <DoctorCard key={doctor._id} doctor={doctor} />
        ))}
      </div>
    </div>
  );
};

export default Doctors;