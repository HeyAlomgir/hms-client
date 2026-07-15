"use client";

import DoctorCard from "@/components/DoctorCard";
import { useEffect, useMemo, useState } from "react";
import { FiSearch } from "react-icons/fi";

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

type SortOption = "name-asc" | "fee-asc" | "fee-desc";

const Doctors = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // ---- search / filter / sort  state ----
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [specialityFilter, setSpecialityFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "in-person" | "online">("all");
  const [sortBy, setSortBy] = useState<SortOption>("name-asc");

  const loadProducts = async (): Promise<void> => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/doctors`);
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


  const specialityOptions = useMemo<string[]>(() => {
    const unique = new Set(doctors.map((d) => d.specialization));
    return Array.from(unique);
  }, [doctors]);

  const visibleDoctors = useMemo<Doctor[]>(() => {
    let result = [...doctors];

    // 1) Search -- name or specialization match
    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(term) ||
          d.specialization.toLowerCase().includes(term)
      );
    }

    // 2) Specialization filter
    if (specialityFilter !== "all") {
      result = result.filter((d) => d.specialization === specialityFilter);
    }

    // 3) Consultation type filter
    if (typeFilter !== "all") {
      result = result.filter((d) => d.consultationType === typeFilter);
    }

    // 4) Sort
    result.sort((a, b) => {
      if (sortBy === "name-asc") return a.name.localeCompare(b.name);
      if (sortBy === "fee-asc")
        return Number(a.consultationFee) - Number(b.consultationFee);
      if (sortBy === "fee-desc")
        return Number(b.consultationFee) - Number(a.consultationFee);
      return 0;
    });

    return result;
  }, [doctors, searchTerm, specialityFilter, typeFilter, sortBy]);

  if (loading) {
    return <div className="p-6 text-center">Loading doctors...</div>;
  }

  return (
    <div className=" container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold mb-6">Doctors</h1>

      {/* ---- Search + Filter + Sort  ---- */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        
       <div className="relative w-full md:flex-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <FiSearch className="h-5 w-5 text-gray-400" />
          </span>
          <input
            type="text"
            placeholder="Search by name or specialization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          
            className="w-full rounded-lg border border-gray-700 bg-[#1e293b] text-white pl-10 pr-4 py-2 text-sm outline-none focus:border-blue-500"
          />
        </div>

        <select
          value={specialityFilter}
          onChange={(e) => setSpecialityFilter(e.target.value)}
          className="rounded-lg border border-gray-700 bg-[#1e293b] text-white px-3 py-2 text-sm outline-none"
        >
          <option value="all">All Specializations</option>
          {specialityOptions.map((spec) => (
            <option key={spec} value={spec}>
              {spec}
            </option>
          ))}
        </select>

        <select
          value={typeFilter}
          onChange={(e) =>
            setTypeFilter(e.target.value as "all" | "in-person" | "online")
          }
          className="rounded-lg border border-gray-700 bg-[#1e293b] text-white px-3 py-2 text-sm outline-none"
        >
          <option value="all">All Types</option>
          <option value="in-person">In-person</option>
          <option value="online">Online</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="rounded-lg border border-gray-700 bg-[#1e293b] text-white px-3 py-2 text-sm outline-none"
        >
          <option value="name-asc">Name (A-Z)</option>
          <option value="fee-asc">Fee (Low to High)</option>
          <option value="fee-desc">Fee (High to Low)</option>
        </select>
      </div>

      {/* ---- Result count + empty state ---- */}
      <p className="text-sm text-gray-400 mb-4">
        {visibleDoctors.length} doctor{visibleDoctors.length !== 1 ? "s" : ""} found
      </p>

      {visibleDoctors.length === 0 ? (
        <div className="text-center text-gray-400 py-16">
          No doctor was found !! Try changing your search or filter settings.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {visibleDoctors.map((doctor) => (
            <DoctorCard key={doctor._id} doctor={doctor} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Doctors;