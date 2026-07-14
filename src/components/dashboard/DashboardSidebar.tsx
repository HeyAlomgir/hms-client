import { auth } from "@/lib/auth";
import { Bars, ChartAreaStacked,  House, Person } from "@gravity-ui/icons";
import { Button, Drawer } from "@heroui/react";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { BiMoney } from "react-icons/bi";
import { FaUserDoctor } from "react-icons/fa6";
import { GiAnatomy, GiDoctorFace } from "react-icons/gi";
import { GoReport } from "react-icons/go";
import { SiSpringCreators } from "react-icons/si";
import { TbAsset } from "react-icons/tb";


interface SidebarItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  link: string;
}

// user role onujai map
interface DashboardItemsMap {
  [key: string]: SidebarItem[];
}

export async function DashboardSidebar(): Promise<React.JSX.Element> {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    const user = session?.user;
    
    // role type
    const current = user?.role || "user";
    const role = current.toLowerCase();

    console.log("Role:", role);
    console.log(user);

    const dashboardItems: DashboardItemsMap = {
        patient: [
            { icon: GiAnatomy, label: "My Appointments", link: '/dashboard/patient/my-appointments' },
           
        ],
        doctor: [
            { icon: SiSpringCreators, label: "Dashboard Home", link: '/dashboard/doctor' },
            { icon: FaUserDoctor, label: "Profile", link: '/dashboard/doctor/my-profile' },
            { icon: GiDoctorFace, label: "Appointments", link: '/dashboard/doctor/appointments' },
        ],
        admin: [
            { icon: Person, label: "All Patients", link: '/dashboard/admin/all-patiens' },
            { icon: TbAsset, label: "All Doctors", link: '/dashboard/admin/all-doctors' },
            { icon: BiMoney, label: "All Appointments", link: '/dashboard/admin/all-appointments' },
            { icon: GoReport, label: "Reports ", link: '/dashboard/admin/report' },
            { icon: ChartAreaStacked, label: "Analytics", link: '/dashboard/admin' },
        ],
     
        user: [] 
    };

    // 
    const navItems = dashboardItems[role] ?? dashboardItems["user"];

    return (
        <div className="flex flex-col h-full justify-between">
            {/* sm device */}
            <Drawer>
                <Button variant="secondary" className="lg:hidden m-3">
                    <Bars /> Menu
                </Button>

                <Drawer.Backdrop>
                    <Drawer.Content placement="left">
                        <Drawer.Dialog>
                            <Drawer.CloseTrigger />
                            <Drawer.Header>
                                <Drawer.Heading>
                                    <div>
                                        <Image
                                            src={"/logoo.png"}
                                            width={300}
                                            height={300}
                                            alt="logo"
                                            className="border-b-2"
                                        />
                                    </div>
                                </Drawer.Heading>
                            </Drawer.Header>
                            <Drawer.Body className="flex flex-col justify-between h-full pb-6">
                                {/* sm menu */}
                                <nav className="flex flex-col gap-1">
                                    {navItems.map((item) => (
                                        <Link key={item.label} href={item.link} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-default">
                                            <item.icon className="size-5 text-muted" />
                                            {item.label}
                                        </Link>
                                    ))}
                                </nav>

                                {/* sm device bk to home */}
                                <div className="border-t pt-3">
                                    <Link href="/" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-primary bg-primary/10 transition-colors hover:bg-primary/20">
                                        <House className="size-5" />
                                        Back to Home
                                    </Link>
                                </div>
                            </Drawer.Body>
                        </Drawer.Dialog>
                    </Drawer.Content>
                </Drawer.Backdrop>
            </Drawer>

            {/* desktop sidebar */}
            <div className="hidden lg:flex flex-col justify-between w-56 h-screen border-r bg-background pt-3 pb-6 px-4">
                <div className="flex flex-col gap-4">
                    {/* logo area */}
                    <div className="border-b pb-3">
                        <Link href="/">
                            <div>
                                <Image
                                    src={"/logoo.png"}
                                    height={300}
                                    width={300}
                                    alt="logo"
                                />
                            </div>
                        </Link>
                    </div>

                    {/* desktop menu item */}
                    <nav className="flex flex-col gap-1">
                        {navItems.map((item) => (
                            <Link key={item.label} href={item.link} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-default">
                                <item.icon className="size-5 text-muted" />
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* desktop bk to home */}
                <div className="border-t pt-3">
                    <Link href="/" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-primary bg-primary/10 transition-colors hover:bg-primary/20">
                        <House className="size-5" />
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}