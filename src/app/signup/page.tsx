
"use client";

import { authClient } from "@/lib/auth-client";
import { Button } from "@heroui/react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { FcGoogle } from "react-icons/fc";
import {
  FaUserPlus,
  FaUserMd,
  FaShieldAlt,
  FaHeartbeat,
} from "react-icons/fa";

const SignUpPage: React.FC = () => {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    setErrorMessage("");

    const formData = new FormData(e.currentTarget);
    const user = Object.fromEntries(
      formData.entries()
    ) as Record<string, string>;

    try {
      const { data, error } = await authClient.signUp.email({
        name: user.name,
        email: user.email,
        password: user.password,
        image: user.image || "",
        role: "patient",
        callbackURL: "/",
      });

      if (error) {
        const message =
          error.message || "Something went wrong during signup!";

        setErrorMessage(message);
        toast.error(message);
        return;
      }

      if (data) {
        toast.success("Account created successfully!");
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      const error = err as Error;
      const message =
        error.message || "An unexpected error occurred.";

      setErrorMessage(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      toast.loading("Connecting to Google...", {
        id: "google-auth",
      });

      const { error } = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      });

      if (error) {
        toast.error(error.message || "Google Sign-In failed!", {
          id: "google-auth",
        });
      }
    } catch (err) {
      const error = err as Error;

      toast.error(
        error.message || "Google Sign-In failed!",
        { id: "google-auth" }
      );
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050816] px-4 py-12 text-white sm:px-6 lg:py-16">

      <Toaster position="top-center" />

      {/* Background Effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-600/20 blur-[120px]" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-teal-500/20 blur-[120px]" />
        <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-600/10 blur-[120px]" />

        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)",
            backgroundSize: "45px 45px",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-16">

        {/* Left Side - 3D Information */}
        <motion.section
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="hidden lg:block"
        >
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-teal-400/20 bg-teal-400/10 px-4 py-2 text-sm text-teal-300">
            <FaHeartbeat />
            Welcome to CarePulse
          </div>

          <h1 className="text-5xl font-extrabold leading-tight xl:text-6xl">
            Your Health,
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Our Priority.
            </span>
          </h1>

          <p className="mt-6 max-w-lg text-base leading-8 text-slate-400">
            Create your account and experience a smarter way to
            manage healthcare. Connect with trusted doctors and
            manage your appointments easily.
          </p>

          {/* 3D Floating Cards */}
          <div className="relative mt-14 h-64 [perspective:1000px]">

            <motion.div
              animate={{ y: [0, -15, 0], rotateY: [-8, 0, -8] }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute left-5 top-3 w-64 rounded-2xl border border-blue-400/20 bg-gradient-to-br from-blue-500/20 to-blue-900/20 p-5 shadow-2xl shadow-blue-500/10 backdrop-blur-xl [transform-style:preserve-3d]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20 text-2xl text-blue-300">
                <FaUserMd />
              </div>

              <h3 className="mt-4 font-bold">Expert Doctors</h3>
              <p className="mt-2 text-sm text-slate-400">
                Find and connect with trusted healthcare professionals.
              </p>
            </motion.div>

            <motion.div
              animate={{ y: [0, 15, 0], rotateY: [8, 0, 8] }}
              transition={{
                duration: 4.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute right-0 top-20 w-64 rounded-2xl border border-teal-400/20 bg-gradient-to-br from-teal-500/20 to-emerald-900/20 p-5 shadow-2xl shadow-teal-500/10 backdrop-blur-xl [transform-style:preserve-3d]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-500/20 text-2xl text-teal-300">
                <FaShieldAlt />
              </div>

              <h3 className="mt-4 font-bold">Secure Healthcare</h3>
              <p className="mt-2 text-sm text-slate-400">
                Manage your healthcare information with confidence.
              </p>
            </motion.div>

          </div>

          <div className="mt-10 flex items-center gap-3 text-sm text-slate-500">
            <span className="h-2 w-2 animate-pulse rounded-full bg-teal-400" />
            Your healthcare journey starts here.
          </div>
        </motion.section>

        {/* Right Side - Signup Card */}
        <motion.section
          initial={{ opacity: 0, y: 40, rotateX: 8 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mx-auto w-full max-w-lg [perspective:1200px]"
        >
          <motion.div
            whileHover={{ rotateX: 1, rotateY: -1 }}
            transition={{ duration: 0.3 }}
            className="rounded-3xl border border-white/10 bg-[#0b1224]/90 p-6 shadow-[0_25px_80px_rgba(0,0,0,0.5)] backdrop-blur-2xl sm:p-9 [transform-style:preserve-3d]"
          >

            {/* Header */}
            <div className="mb-7 text-center">
              <motion.div
                initial={{ scale: 0.5, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-teal-400/20 bg-gradient-to-br from-blue-500/20 to-teal-500/20 text-3xl text-teal-300 shadow-lg shadow-teal-500/10"
              >
                <FaUserPlus />
              </motion.div>

              <h2 className="bg-gradient-to-r from-blue-400 to-teal-300 bg-clip-text text-3xl font-extrabold text-transparent">
                Create Account
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                Join CarePulse and manage your health digitally.
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-center text-sm text-red-300">
                {errorMessage}
              </div>
            )}

            {/* Signup Form */}
            <form onSubmit={onSubmit} className="space-y-4">

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <div>
                  <label className="mb-2 block text-xs font-medium text-slate-300">
                    Full Name *
                  </label>

                  <input
                    required
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    autoComplete="name"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] p-3.5 text-sm text-white outline-none transition-all placeholder:text-slate-600 focus:border-teal-400 focus:bg-teal-400/5 focus:ring-2 focus:ring-teal-400/10"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium text-slate-300">
                    Photo URL
                  </label>

                  <input
                    name="image"
                    type="url"
                    placeholder="https://example.com/photo.jpg"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] p-3.5 text-sm text-white outline-none transition-all placeholder:text-slate-600 focus:border-teal-400 focus:bg-teal-400/5 focus:ring-2 focus:ring-teal-400/10"
                  />
                </div>

              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-slate-300">
                  Email Address *
                </label>

                <input
                  required
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  autoComplete="email"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] p-3.5 text-sm text-white outline-none transition-all placeholder:text-slate-600 focus:border-teal-400 focus:bg-teal-400/5 focus:ring-2 focus:ring-teal-400/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-slate-300">
                  Password *
                </label>

                <input
                  required
                  name="password"
                  type="password"
                  minLength={8}
                  placeholder="Minimum 8 characters"
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] p-3.5 text-sm text-white outline-none transition-all placeholder:text-slate-600 focus:border-teal-400 focus:bg-teal-400/5 focus:ring-2 focus:ring-teal-400/10"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                type="submit"
                className="mt-3 w-full rounded-xl bg-gradient-to-r from-blue-600 to-teal-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-teal-500/20 transition-all hover:from-blue-500 hover:to-teal-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Creating Account..." : "Create Patient Account"}
              </motion.button>

            </form>

            {/* Sign In */}
            <div className="mt-6 text-center text-sm text-slate-400">
              Already have an account?{" "}
              <Link
                href="/signin"
                className="font-semibold text-teal-400 transition hover:text-teal-300 hover:underline"
              >
                Sign In
              </Link>
            </div>

            {/* Apply to Doctor */}
            <div className="mt-5 rounded-2xl border border-blue-400/20 bg-gradient-to-r from-blue-500/10 to-teal-500/10 p-4">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-400/10 text-xl text-teal-300">
                  <FaUserMd />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-white">
                    Are you a Doctor?
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    Join CarePulse as a healthcare professional.
                  </p>
                </div>

              </div>

              <Link
                href="/apply-doctor"
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-teal-400/30 bg-teal-400/10 py-3 text-sm font-bold text-teal-300 transition-all hover:border-teal-300 hover:bg-teal-400/20 hover:text-white"
              >
                <FaUserMd />
                Apply to Doctor
                <span aria-hidden="true">→</span>
              </Link>

            </div>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-[10px] font-bold uppercase tracking-[3px] text-slate-600">
                OR
              </span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            {/* Google Signup */}
            <Button
              onClick={handleGoogleSignIn}
              variant="bordered"
              className="w-full border-white/10 bg-white/[0.03] text-white hover:bg-white/10"
              radius="lg"
              size="lg"
            >
              <FcGoogle className="text-xl" />
              Continue with Google
            </Button>

            <p className="mt-6 text-center text-[11px] leading-5 text-slate-600">
              By creating an account, you agree to use CarePulse
              responsibly.
            </p>

          </motion.div>
        </motion.section>

      </div>
    </main>
  );
};

export default SignUpPage;
