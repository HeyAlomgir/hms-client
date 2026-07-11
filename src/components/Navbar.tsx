"use client";

import { authClient } from "@/lib/auth-client";
import { Avatar, Button, Dropdown, Label } from "@heroui/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { BiLogOut } from "react-icons/bi";
import { CgProfile } from "react-icons/cg";
import { MdDashboard } from "react-icons/md";

interface CustomUser {
  id: string;
  email: string;
  name: string;
  image?: string;
  role?: string;
}

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false); 

  const { data: session } = authClient.useSession();

  const user = session?.user as CustomUser | undefined;

  const pathName = usePathname();

  if (pathName.includes("dashboard")) {
    return null;
  }

  const handleSignOut = async (): Promise<void> => {
    await authClient.signOut();
  };

  return (
    <div>
      <div className="bg-teal-950 border-b border-teal-900/50 p-1 text-teal-400 text-sm font-medium">
        <marquee scrollamount="4">
          🚑 Emergency Service Available 24/7 | 📞 Hotline: +880 1756135199 | 🩺 Book Online Appointments to Skip the Queue.
        </marquee>
      </div>

      <nav className="sticky top-0 z-40 w-full border-b border-slate-800 bg-[#0f172a]/80 backdrop-blur-lg">
        <header className=" flex h-16 container mx-auto items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden text-slate-300"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">Menu</span>
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
            <Link href={'/'}>
              <div className="flex items-center gap-3">
                <Image
                  height={300}
                  width={300}
                  loading="eager"
                  src="/logoo.png"
                  alt="logo"
                />
              </div>
            </Link>
          </div>
          <ul className="hidden lg:block items-center gap-6 lg:flex text-slate-300 font-medium text-sm">
            <li>
              <Link href="/">Home</Link>
            </li>
            <li>
              <Link href="/doctors">Doctors</Link>
            </li>
            <li>
              <Link href="/appointments">Appointments</Link>
            </li>
          </ul>

          {!user && (
            <div className="hidden gap-4 md:flex items-center">
              <Link href="/signin" className="text-xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">Login</Link>
              <Link href="/signup">
                <Button className="w-full py-3 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 disabled:opacity-50 text-white font-medium rounded-lg text-sm transition-all mt-4 shadow-lg shadow-teal-500/10">
                  Register
                </Button>
              </Link>
            </div>
          )}

          {user && (
            <div className="hidden items-center gap-4 md:flex">
              <Dropdown className="bg-slate-800 border border-slate-700 text-white">
                <Dropdown.Trigger className="rounded-full cursor-pointer">
                  <Avatar size="sm" color="teal">
                    <Avatar.Image
                      referrerPolicy="no-referrer"
                      alt={user?.name}
                      src={user?.image}
                    />
                    <Avatar.Fallback>{user?.name?.charAt(0)}</Avatar.Fallback>
                  </Avatar>
                </Dropdown.Trigger>
                <Dropdown.Popover>
                  <div className="px-3 pt-3 pb-1">
                    <div className="flex items-center gap-2">
                      <Avatar size="sm">
                        <Avatar.Image alt={user?.name} src={user?.image} />
                        <Avatar.Fallback>{user?.name?.charAt(0)}</Avatar.Fallback>
                      </Avatar>
                      <div className="flex flex-col gap-0">
                        <p className="text-sm leading-5 font-medium text-white">
                          {user?.name}
                        </p>
                        <p className="text-xs leading-none text-slate-400">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                  </div>
                  <Dropdown.Menu
                    onAction={(key) => console.log(`Selected: ${key}`)}
                  >
                    <Dropdown.Item id="dashboard" textValue="Dashboard">
                      <Link
                        className="flex items-center gap-2 text-slate-200"
                        href={`/dashboard/${user?.role || "patient"}`}
                      >
                        <MdDashboard className="text-teal-400" />
                        <Label>Dashboard</Label>
                      </Link>
                    </Dropdown.Item>

                    <Dropdown.Item id="profile" textValue="Profile">
                      <Link
                        className="flex items-center gap-2 text-slate-200"
                        href={`/dashboard/${user?.role || "patient"}/profile`}
                      >
                        <CgProfile className="text-teal-400" />
                        <Label>Profile</Label>
                      </Link>
                    </Dropdown.Item>

                    <Dropdown.Item
                      id="logout"
                      textValue="Logout"
                      variant="danger"
                      onClick={handleSignOut}
                    >
                      <div className="flex items-center gap-2">
                        <BiLogOut />
                        <Label>Logout</Label>
                      </div>
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown.Popover>
              </Dropdown>
            </div>
          )}
        </header>

        {isMenuOpen && (
          <div className="border-t border-slate-800 lg:hidden bg-[#0f172a]">
            <ul className="flex flex-col gap-2 p-4 text-slate-300 font-medium">
              <li>
                <Link href="/" className="block py-2" onClick={() => setIsMenuOpen(false)}>
                  Home
                </Link>
              </li>
              <li>
                <Link href="/doctors" className="block py-2" onClick={() => setIsMenuOpen(false)}>
                  Doctors
                </Link>
              </li>
              <li>
                <Link href="/appointments" className="block py-2" onClick={() => setIsMenuOpen(false)}>
                  Appointments
                </Link>
              </li>
              
              {!user ? (
                <li className="mt-4 flex flex-col gap-2 border-t border-slate-800 pt-4">
                  <Link href="/signin" className="text-xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent" onClick={() => setIsMenuOpen(false)}>
                    Login
                  </Link>
                  <Link href="/signup" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full py-3 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 disabled:opacity-50 text-white font-medium rounded-lg text-sm transition-all mt-4 shadow-lg shadow-teal-500/10">Register</Button>
                  </Link>
                </li>
              ) : (
                <li className="mt-4 flex flex-col gap-2 border-t border-slate-800 pt-4">
                  <Link href={`/dashboard/${user?.role || "patient"}`} className="flex items-center gap-2 py-2 text-teal-400" onClick={() => setIsMenuOpen(false)}>
                    <MdDashboard /> Dashboard
                  </Link>
                  <button onClick={() => { handleSignOut(); setIsMenuOpen(false); }} className="flex items-center gap-2 py-2 text-red-400 text-left">
                    <BiLogOut /> Logout
                  </button>
                </li>
              )}
            </ul>
          </div>
        )}
      </nav>
    </div>
  );
};

export default Navbar;