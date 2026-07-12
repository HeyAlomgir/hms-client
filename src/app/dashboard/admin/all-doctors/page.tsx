"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

// ১. ডক্টরের ডেটা স্ট্রাকচারের জন্য টাইপ ইন্টারফেস
interface Doctor {
  _id: string;
  name: string;
  email: string;
  specialization: string;
  status: "approved" | "pending" | string;
}

export default function AllDoctorPage(): React.JSX.Element {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  // 👉 Fetch Doctors
  useEffect(() => {
    fetch("http://localhost:5000/api/doctors")
      .then((res) => res.json())
      .then((data: Doctor[]) => {
        setDoctors(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching doctors:", err);
        setLoading(false);
      });
  }, []);

  // 👉 Approve Doctor
  const handleApprove = (id: string): void => {
    fetch(`http://localhost:5000/api/doctors/approve/${id}`, {
      method: "PATCH",
    })
      .then((res) => res.json())
      .then(() => {
        const updated = doctors.map((doc) =>
          doc._id === id ? { ...doc, status: "approved" } : doc
        );
        setDoctors(updated);
      });
  };

  // 👉 Delete Doctor
  const handleDelete = (id: string): void => {
    fetch(`http://localhost:5000/api/doctors/${id}`, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then(() => {
        const remaining = doctors.filter((doc) => doc._id !== id);
        setDoctors(remaining);
      });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <p className="text-gray-400 font-medium tracking-wide animate-pulse">Loading Doctors Data...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* 🔥 Header Area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">All Doctors</h2>
          <p className="text-xs text-neutral-400 mt-0.5">Manage registered medical practitioners</p>
        </div>

        {/* ➕ Add Doctor Button */}
        <button
          onClick={() => router.push("/dashboard/admin/add-doctor")}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-blue-600/10 transition-all"
        >
          + Add Doctor
        </button>
      </div>

      {doctors.length === 0 ? (
        <div className="text-center py-12 bg-[#0f172a] rounded-xl border border-gray-800">
          <p className="text-gray-400 text-sm">No doctors found in the records.</p>
        </div>
      ) : (
        <>
          {/* 📱 Mobile & Small Tablet View (কার্ড লেআউট - ল্যাপটপ বা পিসিতে হিডেন থাকবে) */}
          <div className="grid grid-cols-1 md:hidden gap-4">
            {doctors.map((doc) => (
              <div 
                key={doc._id} 
                className="bg-[#0f172a] border border-gray-800 p-4 rounded-xl flex flex-col gap-3 shadow-md"
              >
                <div>
                  <h3 className="text-base font-bold text-white">{doc.name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{doc.email}</p>
                </div>
                
                <div className="flex justify-between items-center bg-[#1e293b]/50 px-3 py-2 rounded-lg text-xs">
                  <span className="text-gray-400">Specialization:</span>
                  <span className="text-gray-200 font-medium">{doc.specialization}</span>
                </div>

                <div className="flex justify-between items-center pt-1">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      doc.status === "approved"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    }`}
                  >
                    {doc.status}
                  </span>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {doc.status !== "approved" && (
                      <button
                        onClick={() => handleApprove(doc._id)}
                        className="bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-lg text-white text-xs font-medium transition"
                      >
                        Approve
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(doc._id)}
                      className="bg-red-600/90 hover:bg-red-700 px-3 py-1.5 rounded-lg text-white text-xs font-medium transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 💻 Desktop & Large Tablet View (স্ট্যান্ডার্ড প্রফেশনাল টেবিল) */}
          <div className="hidden md:block overflow-hidden bg-[#0f172a] rounded-xl border border-gray-800 shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-300 whitespace-nowrap">
                <thead className="text-xs uppercase bg-[#1e293b] text-gray-400 font-bold tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Specialization</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-800">
                  {doctors.map((doc) => (
                    <tr
                      key={doc._id}
                      className="hover:bg-[#1e293b]/40 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 font-semibold text-white">
                        {doc.name}
                      </td>
                      <td className="px-6 py-4 text-gray-400">{doc.email}</td>
                      <td className="px-6 py-4 text-gray-300">
                        {doc.specialization}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${
                            doc.status === "approved"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          }`}
                        >
                          {doc.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 justify-center items-center">
                          {doc.status !== "approved" && (
                            <button
                              onClick={() => handleApprove(doc._id)}
                              className="bg-emerald-600 hover:bg-emerald-700 px-3 py-1 rounded-lg text-white text-xs font-medium transition"
                            >
                              Approve
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(doc._id)}
                            className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded-lg text-white text-xs font-medium transition"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}