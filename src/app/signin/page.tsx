"use client";

import { authClient } from "@/lib/auth-client"; 
import { Button } from "@heroui/react";
import { useRouter } from "next/navigation";
import React, { useState } from "react"; // React ইমপোর্ট করা হয়েছে টাইপের জন্য
import toast, { Toaster } from "react-hot-toast";
import { FcGoogle } from "react-icons/fc";

const SignInPage: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false); // explicit boolean type
  const [errorMessage, setErrorMessage] = useState<string>(""); // explicit string type


  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    const formData = new FormData(e.currentTarget);

    const user = Object.fromEntries(formData.entries()) as Record<string, string>;

    try {
      const { data, error } = await authClient.signIn.email({
        email: user.email,
        password: user.password,
        callbackURL: "/",
      });

      if (error) {
        const authErrMessage = error.message || "Invalid email or password!";
        setErrorMessage(authErrMessage);
        toast.error(authErrMessage); 
        console.error("Auth Error:", error);
      }

      if (data) {
        console.log("Login Successful:", data);
        toast.success("Welcome back! 🎉"); 

        router.push("/");
        router.refresh();
      }
    } catch (err) {

      const errorInstance = err as Error;
      const catchErrMessage = errorInstance.message || "An unexpected error occurred. Please try again.";
      setErrorMessage(catchErrMessage);
      toast.error(catchErrMessage);
      console.error("Catch Error:", err);
    } finally {
      setLoading(false);
    }
  };

    const handleGoogleSignIn = async () => {
    try {
      toast.loading("Connecting to Google...", { id: "google-auth" });

      const data = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      });

      console.log(data);
    } catch (err) {
      const errorInstance = err as Error;
      console.error("Google Sign-In Error:", err);
      toast.error(errorInstance.message || "Google Sign-In failed!", { id: "google-auth" });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-white px-4">
      <Toaster position="top-center" reverseOrder={false} />

      <div className="w-full max-w-md p-8 bg-[#0a0a0a] rounded-xl border border-neutral-800 shadow-2xl">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Welcome Back
          </h2>
          <p className="text-sm text-neutral-400 mt-1">
            Sign in to your Carepulse account
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 text-sm bg-red-950/50 border border-red-500 text-red-200 rounded-lg text-center">
            {errorMessage}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">Email Address *</label>
            <input
              required
              name="email"
              type="email"
              placeholder="name@example.com"
              className="w-full p-3 bg-[#121212] border border-neutral-800 rounded-lg text-sm focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">Password *</label>
            <input
              required
              name="password"
              type="password"
              placeholder="••••••••"
              className="w-full p-3 bg-[#121212] border border-neutral-800 rounded-lg text-sm focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          <button
            disabled={loading}
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 disabled:opacity-50 text-white font-medium rounded-lg text-sm transition-all mt-4 shadow-lg shadow-teal-500/10"
          >
            {loading ? "Signing In..." : "Sign In with Email"}
          </button>
        </form>

        <div className="text-center mt-6 text-xs text-neutral-500">
          Don't have an account?{" "}
          <a href="/signup" className="text-purple-400 hover:underline">
            Sign Up
          </a>
        </div>

           <div className="flex items-center my-5 gap-3">
          <div className="h-[1px] w-full bg-zinc-900" />
          <span className="text-[10px] uppercase tracking-widest text-zinc-600 font-semibold">OR</span>
          <div className="h-[1px] w-full bg-zinc-900" />
        </div>

        {/* Google sign in */}
        <Button
          onClick={handleGoogleSignIn}
          variant="bordered"
          className="w-full border-zinc-800 text-white hover:bg-zinc-900 font-medium gap-2 text-sm"
          radius="xl"
          size="lg"
        >
          <FcGoogle className="text-xl" />
          Continue with Google
        </Button>
      </div>
    </div>
  );
};

export default SignInPage;