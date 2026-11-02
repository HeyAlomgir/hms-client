
"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";
import {
  FiUserPlus,
  FiCamera,
  FiX,
  FiClock,
  FiDollarSign,
  FiSettings,
  FiLock,
  FiEye,
  FiEyeOff,
  FiActivity,
  FiShield,
  FiArrowLeft,
  FiCheckCircle,
  FiCalendar,
  FiAward,
  FiMail,
  FiHeart,
  FiLogIn,
} from "react-icons/fi";

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const TIME_SLOTS = [
  "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM",
  "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM",
  "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM",
  "08:00 PM",
];

interface DoctorFormData {
  name: string;
  email: string;
  password: string;
  specialization: string;
  degree: string;
  description: string;
  image: string;
  consultationFee: string;
  workingDays: string[];
  startTime: string;
  endTime: string;
  maxAppointments: string;
  consultationType: "in-person" | "online";
}

const initialFormData: DoctorFormData = {
  name: "",
  email: "",
  password: "",
  specialization: "",
  degree: "",
  description: "",
  image: "",
  consultationFee: "",
  workingDays: [],
  startTime: "",
  endTime: "",
  maxAppointments: "",
  consultationType: "in-person",
};

const inputClass =
  "w-full rounded-xl border border-white/10 bg-[#0b1530]/80 px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 hover:border-blue-400/40";

const labelClass = "mb-2 block text-sm font-medium text-slate-300";

const ApplyDoctorPage = (): React.JSX.Element => {
  const router = useRouter();

  const [formData, setFormData] =
    useState<DoctorFormData>(initialFormData);

  const [confirmPassword, setConfirmPassword] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);

  const handleInputChange = (
    field: keyof DoctorFormData,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Upload doctor profile image
  const handleImageUpload = async (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size cannot exceed 5MB.");
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;

    if (!apiKey) {
      toast.error("Image upload configuration is missing.");
      return;
    }

    const preview = URL.createObjectURL(file);
    setImagePreview(preview);
    setUploadingImage(true);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append("image", file);

      const res = await fetch(
        `https://api.imgbb.com/1/upload?key=${apiKey}`,
        {
          method: "POST",
          body: uploadFormData,
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error("Image upload failed.");
      }

      setFormData((prev) => ({
        ...prev,
        image: data.data.url,
      }));

      toast.success("Profile photo uploaded successfully!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Upload failed."
      );

      URL.revokeObjectURL(preview);
      setImagePreview(null);
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  // Remove profile image
  const handleRemoveImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setImagePreview(null);

    setFormData((prev) => ({
      ...prev,
      image: "",
    }));
  };

  // Select working days
  const handleWorkingDay = (day: string) => {
    setFormData((prev) => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter((d) => d !== day)
        : [...prev.workingDays, day],
    }));
  };

  // Submit doctor application and create account
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.specialization ||
      !formData.degree.trim() ||
      !formData.password
    ) {
      toast.error("Please complete all required fields.");
      return;
    }

    if (formData.password.length < 8) {
      toast.error("Password must contain at least 8 characters.");
      return;
    }

    if (formData.password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (!formData.workingDays.length) {
      toast.error("Please select working days.");
      return;
    }

    if (!formData.startTime || !formData.endTime) {
      toast.error("Please select working hours.");
      return;
    }

    if (
      TIME_SLOTS.indexOf(formData.endTime) <=
      TIME_SLOTS.indexOf(formData.startTime)
    ) {
      toast.error("End time must be later than start time.");
      return;
    }

    if (
      !formData.consultationFee ||
      !Number.isFinite(Number(formData.consultationFee)) ||
      Number(formData.consultationFee) < 0
    ) {
      toast.error("Please enter a valid consultation fee.");
      return;
    }

    if (
      !formData.maxAppointments ||
      !Number.isInteger(Number(formData.maxAppointments)) ||
      Number(formData.maxAppointments) <= 0
    ) {
      toast.error("Please enter a valid appointment limit.");
      return;
    }

    if (uploadingImage) {
      toast.error("Please wait for the image upload to finish.");
      return;
    }

    setSubmitting(true);

    const loadingToast = toast.loading("Submitting your application...");

    try {
      const {
        password,
        ...otherData
      } = formData;

      // Send the applicant's own password to Better Auth API.
      // Confirm password is only checked on the frontend.
      const res = await fetch("/api/admin/create-doctor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...otherData,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(
          data.message || "Failed to submit doctor application."
        );
      }

      toast.success(
        "Application submitted successfully!",
        {
          id: loadingToast,
          duration: 4000,
        }
      );

      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }

      setApplicationSubmitted(true);

      setFormData(initialFormData);
      setConfirmPassword("");
      setImagePreview(null);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong.",
        { id: loadingToast }
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Application success screen
  if (applicationSubmitted) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#060b19] px-4 py-10 text-white">

        <div className="pointer-events-none absolute -left-32 top-20 h-96 w-96 rounded-full bg-blue-600/10 blur-[110px]" />
        <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-purple-600/10 blur-[110px]" />

        <div className="relative z-10 w-full max-w-xl rounded-3xl border border-emerald-400/20 bg-gradient-to-br from-[#111d37] to-[#0b1428] p-8 text-center shadow-2xl md:p-12">

          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-emerald-400/30 bg-emerald-500/10 text-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.15)]">
            <FiCheckCircle size={42} />
          </div>

          <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-bold text-emerald-400">
            APPLICATION SUBMITTED
          </span>

          <h1 className="mt-6 text-2xl font-bold md:text-3xl">
            Your Application Is Submitted!
          </h1>

          <p className="mt-4 text-sm leading-7 text-slate-400">
            Thank you for applying to join CarePulse. Your doctor
            profile is now waiting for Admin approval. Once approved,
            your profile will appear on the public Doctors page.
          </p>

          <div className="mt-7 rounded-2xl border border-blue-400/20 bg-blue-500/5 p-5 text-left">
            <div className="flex items-center gap-3">
              <FiClock className="text-xl text-blue-400" />
              <div>
                <h3 className="font-semibold">Approval Pending</h3>
                <p className="mt-1 text-xs text-slate-400">
                  Admin will review your professional information.
                </p>
              </div>
            </div>
          </div>

          <p className="mt-5 text-xs leading-6 text-slate-500">
            You can sign in using the same email and password you
            entered during registration. Doctor features should be
            available after approval.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => router.push("/signin")}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:-translate-y-1"
            >
              <FiLogIn />
              Go to Login
            </button>

            <button
              type="button"
              onClick={() => router.push("/")}
              className="rounded-xl border border-white/10 px-6 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/5"
            >
              Back to Home
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#060b19] px-4 py-8 text-white md:px-8 lg:px-12">

      {/* Background 3D Effects */}
      <div className="pointer-events-none absolute -left-32 top-20 h-96 w-96 rounded-full bg-blue-600/10 blur-[110px]" />
      <div className="pointer-events-none absolute -right-32 top-96 h-96 w-96 rounded-full bg-purple-600/10 blur-[110px]" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-72 w-72 rounded-full bg-cyan-500/10 blur-[100px]" />

      <div className="relative z-10 mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-center">

          <div>
            <button
              type="button"
              onClick={() => router.back()}
              className="mb-5 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-blue-400"
            >
              <FiArrowLeft />
              Go Back
            </button>

            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-400/30 bg-gradient-to-br from-blue-500 to-indigo-700 shadow-[0_10px_40px_rgba(37,99,235,0.35)]">
                <FiUserPlus size={25} />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                  Apply as a Doctor
                </h1>

                <p className="mt-1 text-sm text-slate-400">
                  Join CarePulse as a medical professional.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start rounded-full border border-blue-400/20 bg-blue-400/10 px-4 py-2 text-xs font-semibold text-blue-300 md:self-auto">
            <FiShield />
            DOCTOR APPLICATION
          </div>
        </div>

        {/* 3D Hero Card */}
        <div className="relative mb-8 overflow-hidden rounded-3xl border border-blue-400/20 bg-gradient-to-br from-[#142956] via-[#101d3a] to-[#11102d] p-6 shadow-[0_25px_70px_rgba(0,0,0,0.4)] md:p-9">

          <div className="pointer-events-none absolute -right-10 -top-20 h-64 w-64 rounded-full border-[35px] border-blue-400/10" />
          <div className="pointer-events-none absolute -bottom-24 right-48 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="relative z-10 flex flex-col items-center justify-between gap-6 md:flex-row">

            <div className="max-w-xl">
              <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
                <FiActivity />
                CarePulse Healthcare
              </div>

              <h2 className="text-2xl font-bold leading-tight md:text-3xl">
                Build a Healthier Future
                <span className="block text-blue-300">
                  One Doctor at a Time.
                </span>
              </h2>

              <p className="mt-3 max-w-lg text-sm leading-6 text-slate-300">
                Join our healthcare community. Submit your professional
                details and create your doctor account. Our Admin team
                will review your application.
              </p>

              <div className="mt-5 flex flex-wrap gap-3 text-xs">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">
                  <FiCheckCircle className="mr-1 inline text-emerald-400" />
                  Secure Account
                </span>

                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">
                  <FiCheckCircle className="mr-1 inline text-emerald-400" />
                  Admin Approval
                </span>
              </div>
            </div>

            <div className="relative flex h-40 w-40 shrink-0 items-center justify-center">
              <div className="absolute inset-0 animate-[spin_18s_linear_infinite] rounded-full border border-dashed border-blue-300/30" />
              <div className="absolute inset-4 rounded-full border border-cyan-300/20 bg-blue-400/5 shadow-[0_0_50px_rgba(59,130,246,0.2)]" />

              <div className="relative flex h-24 w-24 items-center justify-center rounded-[30px] border border-blue-300/30 bg-gradient-to-br from-blue-400 to-indigo-800 shadow-[0_15px_40px_rgba(37,99,235,0.5)] [transform:perspective(500px)_rotateY(-12deg)_rotateX(8deg)]">
                <FiActivity size={45} />
              </div>

              <div className="absolute right-1 top-5 rounded-xl border border-cyan-300/30 bg-[#142956] p-3 shadow-xl">
                <FiHeart size={20} className="text-cyan-300" />
              </div>

              <div className="absolute bottom-2 left-0 rounded-xl border border-purple-300/30 bg-[#19173b] p-3 shadow-xl">
                <FiShield size={20} className="text-purple-300" />
              </div>
            </div>
          </div>
        </div>

        {/* Application Form */}
        <form onSubmit={handleSubmit}>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

            {/* LEFT COLUMN */}
            <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#111d37]/95 to-[#0b1428]/95 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition duration-300 hover:border-blue-400/30 md:p-7">

              <div className="mb-7 flex items-center gap-3 border-b border-white/10 pb-5">
                <div className="rounded-xl bg-blue-500/15 p-3 text-blue-400">
                  <FiUserPlus size={21} />
                </div>

                <div>
                  <h3 className="font-bold">Basic Information</h3>
                  <p className="text-xs text-slate-400">
                    Personal and professional details
                  </p>
                </div>
              </div>

              {/* Doctor Photo */}
              <div className="mb-7 rounded-2xl border border-dashed border-blue-400/30 bg-blue-500/5 p-5">
                <div className="flex flex-col items-center gap-4 sm:flex-row">

                  <div className="relative flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-3xl border-2 border-blue-400/30 bg-gradient-to-br from-blue-500/20 to-indigo-700/20 shadow-[0_10px_30px_rgba(37,99,235,0.15)]">

                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Doctor preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <FiCamera size={35} className="text-blue-300" />
                    )}

                    {uploadingImage && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                        <div className="h-7 w-7 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      </div>
                    )}

                    {imagePreview && (
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute right-1 top-1 rounded-lg bg-red-500 p-1.5 text-white"
                      >
                        <FiX size={14} />
                      </button>
                    )}
                  </div>

                  <div className="text-center sm:text-left">
                    <h4 className="font-semibold">Doctor Profile Photo</h4>

                    <p className="mt-1 text-xs text-slate-400">
                      Upload a professional profile picture.
                    </p>

                    <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-blue-400/30 bg-blue-500/15 px-4 py-2.5 text-sm font-medium text-blue-300 transition hover:bg-blue-500/25">
                      <FiCamera />
                      {formData.image ? "Change Photo" : "Upload Photo"}

                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                      />
                    </label>

                    <p className="mt-2 text-[11px] text-slate-500">
                      JPG, PNG · Maximum 5MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Name */}
              <div className="mb-5">
                <label className={labelClass}>Doctor Full Name *</label>

                <input
                  type="text"
                  required
                  maxLength={100}
                  placeholder="Dr. John Smith"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={inputClass}
                />
              </div>

              {/* Email */}
              <div className="mb-5">
                <label className={labelClass}>
                  <FiMail className="mr-2 inline text-blue-400" />
                  Email Address *
                </label>

                <input
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="doctor@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={inputClass}
                />
              </div>

              {/* Specialization */}
              <div className="mb-5">
                <label className={labelClass}>
                  Medical Specialization *
                </label>

                <select
                  required
                  value={formData.specialization}
                  onChange={(e) =>
                    handleInputChange("specialization", e.target.value)
                  }
                  className={inputClass}
                >
                  <option value="" className="bg-[#101d37]">
                    Select Specialization
                  </option>

                  {[
                    "Cardiology",
                    "Neurology",
                    "Pathology",
                    "Dental Surgery",
                    "Pediatrics",
                    "Orthopedics",
                    "Internal Medicine",
                    "Gynecology",
                    "Dermatology",
                    "Ophthalmology",
                    "Psychiatry",
                    "General Surgery",
                    "Other",
                  ].map((item) => (
                    <option key={item} value={item} className="bg-[#101d37]">
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              {/* Degree */}
              <div className="mb-5">
                <label className={labelClass}>
                  <FiAward className="mr-2 inline text-amber-400" />
                  Highest Degree / Education *
                </label>

                <input
                  required
                  type="text"
                  placeholder="MBBS, FCPS, MD..."
                  value={formData.degree}
                  onChange={(e) => handleInputChange("degree", e.target.value)}
                  className={inputClass}
                />
              </div>

              {/* Description */}
              <div className="mb-5">
                <label className={labelClass}>
                  Professional Description
                </label>

                <textarea
                  rows={4}
                  maxLength={1500}
                  placeholder="Describe your experience, expertise and professional background..."
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  className={`${inputClass} resize-none`}
                />

                <p className="mt-1 text-right text-xs text-slate-500">
                  {formData.description.length}/1500
                </p>
              </div>

              {/* Account Security */}
              <div className="mt-7 border-t border-white/10 pt-6">

                <div className="mb-5 flex items-center gap-3">
                  <div className="rounded-xl bg-purple-500/15 p-3 text-purple-400">
                    <FiLock size={20} />
                  </div>

                  <div>
                    <h3 className="font-bold">Account Security</h3>
                    <p className="text-xs text-slate-400">
                      Create your CarePulse login password
                    </p>
                  </div>
                </div>

                {/* Password */}
                <div className="mb-5">
                  <label className={labelClass}>Set Password *</label>

                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={8}
                      autoComplete="new-password"
                      placeholder="Enter a secure password"
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      className={`${inputClass} pr-12`}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>

                  <p className="mt-2 text-xs text-slate-500">
                    Minimum 8 characters.
                  </p>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className={labelClass}>Confirm Password *</label>

                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      autoComplete="new-password"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`${inputClass} pr-12`}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* RIGHT COLUMN */}
            <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#111d37]/95 to-[#0b1428]/95 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition duration-300 hover:border-purple-400/30 md:p-7">

              <div className="mb-7 flex items-center gap-3 border-b border-white/10 pb-5">
                <div className="rounded-xl bg-purple-500/15 p-3 text-purple-400">
                  <FiCalendar size={21} />
                </div>

                <div>
                  <h3 className="font-bold">Availability & Schedule</h3>
                  <p className="text-xs text-slate-400">
                    Configure your working hours
                  </p>
                </div>
              </div>

              {/* Consultation Fee */}
              <div className="mb-7">
                <label className={labelClass}>
                  <FiDollarSign className="mr-2 inline text-emerald-400" />
                  Consultation Fee (USD) *
                </label>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-emerald-400">
                    $
                  </span>

                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    placeholder="50"
                    value={formData.consultationFee}
                    onChange={(e) =>
                      handleInputChange("consultationFee", e.target.value)
                    }
                    className={`${inputClass} pl-9`}
                  />
                </div>
              </div>

              {/* Consultation Type */}
              <div className="mb-7">
                <label className={labelClass}>Consultation Type</label>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: "in-person", label: "In Person" },
                    { value: "online", label: "Online" },
                  ].map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          consultationType: item.value as
                            | "in-person"
                            | "online",
                        }))
                      }
                      className={`rounded-xl border p-4 text-sm font-semibold transition duration-300 ${
                        formData.consultationType === item.value
                          ? "border-blue-400 bg-blue-500/20 text-blue-300 shadow-[0_0_20px_rgba(59,130,246,0.15)]"
                          : "border-white/10 bg-white/[0.02] text-slate-400 hover:border-blue-400/40"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Working Days */}
              <div className="mb-7">
                <label className={labelClass}>
                  <FiCalendar className="mr-2 inline text-orange-400" />
                  Working Days *
                </label>

                <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                  {WEEK_DAYS.map((day) => {
                    const selected = formData.workingDays.includes(day);

                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleWorkingDay(day)}
                        className={`rounded-xl border px-2 py-3 text-xs font-semibold transition duration-300 hover:-translate-y-1 ${
                          selected
                            ? "border-blue-400 bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-[0_8px_20px_rgba(37,99,235,0.3)]"
                            : "border-white/10 bg-white/[0.03] text-slate-400 hover:border-blue-400/40"
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>

                <p className="mt-2 text-xs text-slate-500">
                  {formData.workingDays.length} days selected
                </p>
              </div>

              {/* Working Hours */}
              <div className="mb-7">
                <label className={labelClass}>
                  <FiClock className="mr-2 inline text-orange-400" />
                  Working Hours *
                </label>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs text-slate-400">
                      Start Time
                    </label>

                    <select
                      required
                      value={formData.startTime}
                      onChange={(e) =>
                        handleInputChange("startTime", e.target.value)
                      }
                      className={inputClass}
                    >
                      <option value="" className="bg-[#101d37]">
                        Select start time
                      </option>

                      {TIME_SLOTS.map((time) => (
                        <option
                          key={time}
                          value={time}
                          className="bg-[#101d37]"
                        >
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs text-slate-400">
                      End Time
                    </label>

                    <select
                      required
                      value={formData.endTime}
                      onChange={(e) =>
                        handleInputChange("endTime", e.target.value)
                      }
                      className={inputClass}
                    >
                      <option value="" className="bg-[#101d37]">
                        Select end time
                      </option>

                      {TIME_SLOTS.map((time) => (
                        <option
                          key={time}
                          value={time}
                          className="bg-[#101d37]"
                        >
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Max Appointments */}
              <div className="mb-7">
                <label className={labelClass}>
                  <FiSettings className="mr-2 inline text-purple-400" />
                  Maximum Appointments Per Day *
                </label>

                <input
                  type="number"
                  required
                  min="1"
                  step="1"
                  placeholder="Example: 20"
                  value={formData.maxAppointments}
                  onChange={(e) =>
                    handleInputChange("maxAppointments", e.target.value)
                  }
                  className={inputClass}
                />
              </div>

              {/* Registration Summary */}
              <div className="rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/10 to-blue-600/10 p-5">

                <div className="mb-4 flex items-center gap-2 text-cyan-300">
                  <FiActivity size={18} />
                  <h4 className="font-semibold">Application Summary</h4>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between gap-3">
                    <span className="text-slate-400">Doctor</span>
                    <span className="max-w-[60%] truncate font-medium">
                      {formData.name || "Not provided"}
                    </span>
                  </div>

                  <div className="flex justify-between gap-3">
                    <span className="text-slate-400">Specialization</span>
                    <span className="max-w-[60%] truncate font-medium">
                      {formData.specialization || "Not selected"}
                    </span>
                  </div>

                  <div className="flex justify-between gap-3">
                    <span className="text-slate-400">Working Days</span>
                    <span className="font-medium">
                      {formData.workingDays.length} Days
                    </span>
                  </div>

                  <div className="flex justify-between gap-3">
                    <span className="text-slate-400">Consultation Fee</span>
                    <span className="font-semibold text-emerald-400">
                      ${formData.consultationFee || "0"}
                    </span>
                  </div>

                  <div className="flex justify-between gap-3">
                    <span className="text-slate-400">Appointments</span>
                    <span className="font-medium">
                      {formData.maxAppointments || "0"} / Day
                    </span>
                  </div>
                </div>

                <div className="mt-5 flex items-start gap-2 border-t border-white/10 pt-4 text-xs leading-5 text-slate-400">
                  <FiShield className="mt-0.5 shrink-0 text-cyan-400" />
                  Your application will remain pending until an Admin
                  reviews and approves it.
                </div>
              </div>
            </section>
          </div>

          {/* Footer Actions */}
          <div className="mt-7 flex flex-col-reverse justify-between gap-4 rounded-3xl border border-white/10 bg-[#101a30]/80 p-5 shadow-xl sm:flex-row sm:items-center md:p-6">

            <div className="text-xs text-slate-400">
              <FiShield className="mr-2 inline text-emerald-400" />
              Please verify all details before submitting your application.
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => router.back()}
                className="rounded-xl border border-white/10 px-6 py-3 text-sm font-semibold text-slate-300 transition hover:border-white/30 hover:bg-white/5"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting || uploadingImage}
                className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 px-7 py-3.5 text-sm font-bold text-white shadow-[0_10px_30px_rgba(37,99,235,0.3)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(37,99,235,0.45)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {submitting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Submitting Application...
                    </>
                  ) : (
                    <>
                      <FiUserPlus size={17} />
                      Submit Doctor Application
                    </>
                  )}
                </span>
              </button>
            </div>
          </div>
        </form>

        <p className="mt-8 text-center text-xs text-slate-600">
          © {new Date().getFullYear()} CarePulse Hospital Management System.
          All rights reserved.
        </p>
      </div>
    </main>
  );
};

export default ApplyDoctorPage;
