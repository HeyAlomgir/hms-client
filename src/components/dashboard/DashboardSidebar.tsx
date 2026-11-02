
import { auth } from "@/lib/auth";
import {
    Bars,
    ChartAreaStacked,
    House,
    Person,
} from "@gravity-ui/icons";
import { Button, Drawer } from "@heroui/react";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { BiMoney } from "react-icons/bi";
import { FaUserDoctor } from "react-icons/fa6";
import { GiAnatomy, GiDoctorFace } from "react-icons/gi";
import { SiSpringCreators } from "react-icons/si";
import { TbAsset } from "react-icons/tb";

interface SidebarItem {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    link: string;
}

interface DashboardItemsMap {
    [key: string]: SidebarItem[];
}

export async function DashboardSidebar(): Promise<React.JSX.Element> {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    const user = session?.user;
    const current = user?.role || "user";
    const role = current.toLowerCase();

    const dashboardItems: DashboardItemsMap = {
        patient: [
            {
                icon: GiAnatomy,
                label: "My Appointments",
                link: "/dashboard/patient/my-appointments",
            },
            {
                icon: ChartAreaStacked,
                label: "Analytics",
                link: "/dashboard/patient",
            },
        ],
        doctor: [
            {
                icon: SiSpringCreators,
                label: "Dashboard Home",
                link: "/dashboard/doctor",
            },
            {
                icon: FaUserDoctor,
                label: "Profile",
                link: "/dashboard/doctor/my-profile",
            },
            {
                icon: GiDoctorFace,
                label: "Appointments",
                link: "/dashboard/doctor/appointments",
            },
        ],
        admin: [
            {
                icon: Person,
                label: "All Patients",
                link: "/dashboard/admin/all-patiens",
            },
            {
                icon: TbAsset,
                label: "All Doctors",
                link: "/dashboard/admin/all-doctors",
            },
            {
                icon: BiMoney,
                label: "All Appointments",
                link: "/dashboard/admin/all-appointments",
            },
            {
                icon: ChartAreaStacked,
                label: "Analytics",
                link: "/dashboard/admin",
            },
        ],
        user: [],
    };

    const navItems = dashboardItems[role] ?? dashboardItems.user;

    const SidebarLinks = () => (
        <nav className="flex flex-col gap-2">
            {navItems.map((item, index) => (
                <Link
                    key={item.label}
                    href={item.link}
                    className="group relative flex items-center gap-3 overflow-hidden rounded-xl border border-transparent px-3 py-3 text-sm font-medium text-foreground/75 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/20 hover:bg-primary/10 hover:text-primary hover:shadow-[0_8px_20px_rgba(59,130,246,0.12)]"
                >
                    {/* Hover glow */}
                    <span className="absolute inset-y-0 left-0 w-1 -translate-x-full rounded-r-full bg-primary transition-transform duration-300 group-hover:translate-x-0" />

                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-default-200/50 bg-content2 shadow-[inset_0_1px_3px_rgba(255,255,255,0.08),0_3px_8px_rgba(0,0,0,0.12)] transition-all duration-300 group-hover:rotate-[-5deg] group-hover:scale-110 group-hover:border-primary/30 group-hover:bg-primary/15">
                        <item.icon className="size-5 transition-transform duration-300 group-hover:scale-110" />
                    </span>

                    <span className="flex-1">{item.label}</span>

                    <span className="translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                        →
                    </span>
                </Link>
            ))}
        </nav>
    );

    const HomeLink = () => (
        <Link
            href="/"
            className="group flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/10 px-3 py-3 text-sm font-semibold text-primary shadow-[0_5px_15px_rgba(59,130,246,0.08)] transition-all duration-300 hover:-translate-y-1 hover:bg-primary/20 hover:shadow-[0_10px_25px_rgba(59,130,246,0.18)]"
        >
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary/15 shadow-inner transition-transform duration-300 group-hover:-rotate-12">
                <House className="size-5" />
            </span>
            Back to Home
            <span className="ml-auto transition-transform duration-300 group-hover:translate-x-1">
                →
            </span>
        </Link>
    );

    return (
        <>
            {/* Mobile Sidebar */}
            <div className="lg:hidden">
                <Drawer>
                    <Button
                        variant="secondary"
                        className="m-3 border border-default-200 bg-content1/80 shadow-lg backdrop-blur-xl"
                    >
                        <Bars />
                        Menu
                    </Button>

                    <Drawer.Backdrop>
                        <Drawer.Content placement="left">
                            <Drawer.Dialog>
                                <Drawer.CloseTrigger />

                                <Drawer.Header>
                                    <Drawer.Heading>
                                        <div className="w-full rounded-xl border border-default-200 bg-content2 p-3 shadow-lg">
                                            <Image
                                                src="/logoo.png"
                                                width={300}
                                                height={100}
                                                alt="CarePulse Logo"
                                                className="h-auto w-full object-contain"
                                            />
                                        </div>
                                    </Drawer.Heading>
                                </Drawer.Header>

                                <Drawer.Body className="flex h-full flex-col justify-between pb-6">
                                    <div className="space-y-5">
                                        <div>
                                            <p className="mb-3 px-2 text-[10px] font-bold uppercase tracking-[0.25em] text-default-500">
                                                Main Navigation
                                            </p>
                                            <SidebarLinks />
                                        </div>
                                    </div>

                                    <div className="border-t border-default-200 pt-4">
                                        <HomeLink />
                                    </div>
                                </Drawer.Body>
                            </Drawer.Dialog>
                        </Drawer.Content>
                    </Drawer.Backdrop>
                </Drawer>
            </div>

            {/* Desktop Sidebar */}
            <aside className="relative hidden h-screen w-64 shrink-0 flex-col justify-between overflow-hidden border-r border-default-200/60 bg-background px-4 pb-6 pt-5 shadow-[12px_0_35px_rgba(0,0,0,0.08)] lg:flex">

                {/* Decorative 3D Background */}
                <div className="pointer-events-none absolute -left-20 top-20 size-52 rounded-full bg-primary/10 blur-[75px]" />
                <div className="pointer-events-none absolute -bottom-20 -right-20 size-56 rounded-full bg-secondary/10 blur-[80px]" />

                <div className="relative z-10 space-y-8">

                    {/* Logo */}
                    <Link
                        href="/"
                        className="group block rounded-2xl border border-default-200/70 bg-content1/70 p-3 shadow-[0_8px_20px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(59,130,246,0.12)]"
                    >
                        <Image
                            src="/logoo.png"
                            width={300}
                            height={100}
                            alt="CarePulse Logo"
                            className="h-auto w-full object-contain transition-transform duration-300 group-hover:scale-[1.03]"
                        />
                    </Link>

                    {/* Role Card */}
                    <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/15 via-content1 to-content2 p-4 shadow-[0_10px_25px_rgba(0,0,0,0.08)]">
                        <div className="absolute -right-5 -top-7 size-24 rounded-full bg-primary/15 blur-2xl" />

                        <div className="relative flex items-center gap-3">
                            <div className="flex size-11 items-center justify-center rounded-xl border border-primary/20 bg-primary/15 shadow-[0_5px_12px_rgba(59,130,246,0.15)]">
                                <FaUserDoctor className="size-5 text-primary" />
                            </div>

                            <div className="min-w-0">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-default-500">
                                    CarePulse
                                </p>
                                <p className="truncate text-sm font-bold capitalize text-foreground">
                                    {role} Dashboard
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div>
                        <div className="mb-3 flex items-center justify-between px-2">
                            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-default-500">
                                Main Menu
                            </p>
                            <span className="size-1.5 rounded-full bg-success shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                        </div>

                        <SidebarLinks />
                    </div>
                </div>

                {/* Bottom */}
                <div className="relative z-10 space-y-4">
                    <div className="rounded-xl border border-default-200/60 bg-content1/60 p-3 shadow-inner">
                        <div className="flex items-center gap-2">
                            <span className="size-2 rounded-full bg-success shadow-[0_0_8px_rgba(34,197,94,0.7)]" />
                            <span className="text-xs font-medium text-default-500">
                                System Online
                            </span>
                        </div>
                        <p className="mt-2 text-[10px] text-default-400">
                            CarePulse Hospital Management
                        </p>
                    </div>

                    <HomeLink />
                </div>
            </aside>
        </>
    );
}
