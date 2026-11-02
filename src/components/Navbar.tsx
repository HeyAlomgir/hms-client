
"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Avatar, Button, Dropdown, Label } from "@heroui/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiMenu,
  FiX,
  FiHome,
  FiUsers,
  FiCalendar,
  FiChevronRight,
  FiLogIn,
  FiUserPlus,
  FiLogOut,
  FiLayout,
  FiHeart,
} from "react-icons/fi";

interface CustomUser {
  id: string;
  email: string;
  name: string;
  image?: string;
  role?: string;
}

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { data: session } = authClient.useSession();
  const user = session?.user as CustomUser | undefined;
  const pathName = usePathname();

  if (pathName.includes("/dashboard")) return null;

  const handleSignOut = async () => {
    await authClient.signOut();
    setIsMenuOpen(false);
  };

  const getAppointmentLink = () => {
    if (!user) return "/signin";
    if (user.role === "admin") return "/dashboard/admin/all-appointments";
    if (user.role === "doctor") return "/dashboard/doctor/appointments";
    return "/dashboard/patient/my-appointments";
  };

  const navLinks = [
    { name: "Home", href: "/",  },
    { name: "Doctors", href: "/doctors",  },
    {
      name: "Appointments",
      href: getAppointmentLink(),
    },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathName === "/";
    if (href === "/doctors") return pathName.startsWith("/doctors");
    return pathName === href;
  };

  return (
    <>
      {/* Emergency Top Bar */}
      <div className="relative z-50 overflow-hidden bg-gradient-to-r from-blue-700 via-cyan-700 to-teal-700 px-3 py-2 text-center text-[11px] font-semibold text-white sm:text-xs">
        <div className="flex items-center justify-center gap-2">
          <span className="animate-pulse">🚑</span>
          <span>Emergency Service Available 24/7</span>
          <span className="hidden sm:inline">|</span>
          <span className="hidden sm:inline">
            Hotline: +880 1756135199
          </span>
          <span className="hidden md:inline">|</span>
          <span className="hidden md:inline">
            Book Online Appointments to Skip the Queue
          </span>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="sticky top-0 z-40 w-full border-b border-slate-700/50 bg-[#0f172a]/90 shadow-[0_8px_35px_rgba(0,0,0,0.18)] backdrop-blur-2xl">
        <div className="mx-auto flex h-[78px] max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">

          {/* Logo */}
          <Link
            href="/"
            onClick={() => setIsMenuOpen(false)}
            className="group flex shrink-0 items-center gap-2.5"
          >
            <motion.div
              whileHover={{ rotateY: 15, rotateX: -10, scale: 1.06 }}
              transition={{ type: "spring", stiffness: 250 }}
              className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/20 bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 shadow-[0_7px_22px_rgba(6,182,212,0.28)]"
              style={{ transformStyle: "preserve-3d" }}
            >
              <Image
                src="/logoo.png"
                alt="CarePulse Logo"
                width={42}
                height={42}
                priority
                className="h-10 w-10 object-contain"
              />
            </motion.div>

            <div>
              <h1 className="text-xl font-black tracking-tight text-white sm:text-2xl">
                Care<span className="text-cyan-400">Pulse</span>
              </h1>
              <p className="text-[9px] font-semibold tracking-[0.19em] text-slate-400">
                HEALTHCARE PLATFORM
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-1 rounded-2xl border border-slate-700/70 bg-slate-800/70 p-1.5 shadow-inner shadow-white/[0.03] lg:flex">
            {navLinks.map((link) => {
              const active = isActive(link.href);

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-300 ${
                    active
                      ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-600/25"
                      : "text-slate-300 hover:bg-slate-700/70 hover:text-cyan-300"
                  }`}
                >
                  <span className="text-base">{link.icon}</span>
                  {link.name}
                  {active && (
                    <motion.span
                      layoutId="active-nav"
                      className="absolute -bottom-1 left-1/2 h-1 w-5 -translate-x-1/2 rounded-full bg-cyan-300"
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">

            {!user ? (
              <div className="hidden items-center gap-3 md:flex">
                <Link
                  href="/signin"
                  className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-slate-200 transition hover:text-cyan-400"
                >
                  <FiLogIn />
                  Login
                </Link>

                <Link href="/signup">
                  <Button className="!h-11 !rounded-xl !bg-gradient-to-r !from-blue-600 !to-cyan-500 !px-5 !font-bold !text-white !shadow-lg !shadow-cyan-500/20 transition-all hover:-translate-y-1 hover:!shadow-cyan-500/40">
                    <FiUserPlus />
                    Register
                    <FiChevronRight />
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="hidden md:block">
                <Dropdown>
                  <Dropdown.Trigger className="flex cursor-pointer items-center gap-2 rounded-2xl border border-slate-700 bg-slate-800/80 p-1.5 pr-3 transition-all hover:border-cyan-400/50 hover:shadow-lg hover:shadow-cyan-500/10">
                    <Avatar size="sm">
                      <Avatar.Image
                        src={user.image}
                        alt={user.name}
                        referrerPolicy="no-referrer"
                      />
                      <Avatar.Fallback>
                        {user.name?.charAt(0)}
                      </Avatar.Fallback>
                    </Avatar>

                    <div className="max-w-28 text-left">
                      <p className="truncate text-xs font-bold text-white">
                        {user.name}
                      </p>
                      <p className="text-[10px] capitalize text-cyan-400">
                        {user.role || "patient"}
                      </p>
                    </div>
                    <FiChevronRight className="rotate-90 text-slate-400" />
                  </Dropdown.Trigger>

                  <Dropdown.Popover className="min-w-56 rounded-2xl border border-slate-700 bg-slate-900 p-2 text-white shadow-2xl">
                    <div className="flex items-center gap-3 border-b border-slate-700 p-3">
                      <Avatar size="md">
                        <Avatar.Image src={user.image} alt={user.name} />
                        <Avatar.Fallback>
                          {user.name?.charAt(0)}
                        </Avatar.Fallback>
                      </Avatar>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-white">
                          {user.name}
                        </p>
                        <p className="truncate text-xs text-slate-400">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <Dropdown.Menu>
                      <Dropdown.Item id="dashboard" textValue="Dashboard">
                        <Link
                          href={`/dashboard/${user.role || "patient"}`}
                          className="flex items-center gap-3 py-1 text-slate-200"
                        >
                          <FiLayout className="text-cyan-400" />
                          <Label>Dashboard</Label>
                        </Link>
                      </Dropdown.Item>

                      <Dropdown.Item
                        id="logout"
                        textValue="Logout"
                        variant="danger"
                        onClick={handleSignOut}
                      >
                        <div className="flex items-center gap-3 py-1">
                          <FiLogOut />
                          <Label>Logout</Label>
                        </div>
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown.Popover>
                </Dropdown>
              </div>
            )}

            {/* Mobile Menu Button */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-xl text-white shadow-lg lg:hidden"
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <FiX /> : <FiMenu />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden border-t border-slate-700 bg-[#0f172a] lg:hidden"
            >
              <div className="mx-auto max-w-7xl space-y-2 px-4 py-5 sm:px-6">

                {navLinks.map((link) => {
                  const active = isActive(link.href);

                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                        active
                          ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/20"
                          : "text-slate-300 hover:bg-slate-800 hover:text-cyan-300"
                      }`}
                    >
                      {link.icon}
                      {link.name}
                    </Link>
                  );
                })}

                {!user ? (
                  <div className="grid grid-cols-2 gap-3 border-t border-slate-700 pt-4">
                    <Link
                      href="/signin"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 py-3 text-sm font-semibold text-white"
                    >
                      <FiLogIn />
                      Login
                    </Link>

                    <Link
                      href="/signup"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 py-3 text-sm font-bold text-white"
                    >
                      <FiUserPlus />
                      Register
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3 border-t border-slate-700 pt-4">
                    <div className="flex items-center gap-3 rounded-xl bg-slate-800 p-3">
                      <Avatar size="md">
                        <Avatar.Image src={user.image} alt={user.name} />
                        <Avatar.Fallback>
                          {user.name?.charAt(0)}
                        </Avatar.Fallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-white">
                          {user.name}
                        </p>
                        <p className="truncate text-xs text-slate-400">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <Link
                      href={`/dashboard/${user.role || "patient"}`}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-cyan-400 hover:bg-slate-800"
                    >
                      <FiLayout />
                      Dashboard
                    </Link>

                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-red-400 hover:bg-red-500/10"
                    >
                      <FiLogOut />
                      Logout
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-center gap-2 border-t border-slate-700 pt-4 text-xs text-slate-500">
                  <FiHeart className="text-rose-500" />
                  Your Health, Our Priority
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
};

export default Navbar;
