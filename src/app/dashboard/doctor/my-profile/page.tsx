"use client";

import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { authClient } from "@/lib/auth-client";
import toast from "react-hot-toast";
import {
    Card,
    TextField,
    TextArea,
    Input,
    InputGroup,
    Label,
    FieldError,
    Select,
    ListBox,
    Chip,
    Separator,
    Button,
} from "@heroui/react";
import { FiCamera, FiX, FiClock, FiDollarSign, FiSettings, FiLock } from "react-icons/fi";
import { AiOutlineInfoCircle } from "react-icons/ai";

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const TIME_SLOTS = [
    "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM",
    "06:00 PM", "07:00 PM", "08:00 PM",
];

interface DoctorFormData {
    name: string;
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

export default function DoctorProfilePage() {
    // 🔥 refetch যোগ করা হয়েছে, session রিফ্রেশ করার জন্য
    const { data: session, isPending, refetch } = authClient.useSession();

    const [doctorId, setDoctorId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const [formData, setFormData] = useState<DoctorFormData>({
        name: "",
        specialization: "",
        degree: "",
        description: "",
        image: "",
        consultationFee: "",
        workingDays: [],
        startTime: null,
        endTime: null,
        maxAppointments: "",
        consultationType: "in-person",
    });

    // password change state
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [changingPassword, setChangingPassword] = useState(false);

    useEffect(() => {
        if (isPending || !session?.user?.id) return;

        const loadProfile = async () => {
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/doctors/by-user/${session.user.id}`
                );
                const data = await res.json();

                if (!data.success) {
                    toast.error("Doctor profile not found");
                    return;
                }

                const doc = data.data;
                setDoctorId(doc._id);
                setFormData({
                    name: doc.name || "",
                    specialization: doc.specialization || "",
                    degree: doc.degree || "",
                    description: doc.description || "",
                    image: doc.image || "",
                    consultationFee: String(doc.consultationFee ?? ""),
                    workingDays: doc.workingDays || [],
                    startTime: doc.startTime || null,
                    endTime: doc.endTime || null,
                    maxAppointments: String(doc.maxAppointments ?? ""),
                    consultationType: doc.consultationType || "in-person",
                });
                setImagePreview(doc.image || null);
            } catch (err) {
                toast.error("Failed to load profile");
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, [session, isPending]);

    const handleInputChange = (field: keyof DoctorFormData) => (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

    const handleSelectChange = (field: keyof DoctorFormData) => (value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleWorkingDaysChange = (keys: any) => {
        setFormData((prev) => ({ ...prev, workingDays: Array.from(keys) as string[] }));
    };

    const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file.");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error("The image size cannot exceed 5MB.");
            return;
        }

        setImagePreview(URL.createObjectURL(file));
        setUploadingImage(true);
        try {
            const uploadFormData = new FormData();
            uploadFormData.append("image", file);

            const res = await fetch(
                `https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB_API_KEY}`,
                { method: "POST", body: uploadFormData }
            );
            const data = await res.json();

            if (!data.success) throw new Error("Image upload failed.");

            setFormData((prev) => ({ ...prev, image: data.data.url }));
            toast.success("Image uploaded!");
        } catch (err: any) {
            toast.error(err.message || "Something went wrong");
        } finally {
            setUploadingImage(false);
        }
    };

    const handleRemoveImage = () => {
        setImagePreview(null);
        setFormData((prev) => ({ ...prev, image: "" }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!doctorId) return;

        if (!formData.name || !formData.specialization || !formData.degree) {
            toast.error("Please fill in all the required fields.");
            return;
        }

        setSubmitting(true);
        const toastId = toast.loading("Updating profile...");

        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/doctors/update/${doctorId}`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                }
            );

            if (!res.ok) throw new Error();

            toast.success("Profile updated successfully!", { id: toastId });

            // 🔥 session রিফ্রেশ করা, যাতে navbar-এ নতুন নাম/ছবি সাথে সাথে দেখা যায়
            if (typeof refetch === "function") {
                await refetch();
            } else {
                // fallback, যদি refetch না থাকে এই Better Auth ভার্সনে
                await authClient.getSession();
            }
        } catch {
            toast.error("Failed to update profile.", { id: toastId });
        } finally {
            setSubmitting(false);
        }
    };

    const handleChangePassword = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.error("Please fill in all password fields.");
            return;
        }
        if (newPassword.length < 8) {
            toast.error("New password must be at least 8 characters.");
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("New passwords do not match.");
            return;
        }

        setChangingPassword(true);
        const toastId = toast.loading("Changing password...");

        try {
            const { error } = await authClient.changePassword({
                currentPassword,
                newPassword,
                revokeOtherSessions: true,
            });

            if (error) {
                toast.error(error.message || "Failed to change password.", { id: toastId });
                return;
            }

            toast.success("Password changed successfully!", { id: toastId });
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err: any) {
            toast.error(err.message || "Failed to change password.", { id: toastId });
        } finally {
            setChangingPassword(false);
        }
    };

    if (isPending || loading) {
        return <div className="text-white p-6">Loading...</div>;
    }

    return (
        <div className="w-full max-w-6xl mx-auto px-4 py-6 box-border overflow-hidden flex flex-col gap-6">

            {/* ================= PROFILE INFO ================= */}
            <Card className="w-full bg-[#0f172a] border border-gray-800 rounded-xl shadow-xl overflow-hidden">
                <Card.Header className="flex flex-row items-center gap-3 p-4 md:p-6">
                    <div className="bg-blue-600 p-3 rounded-xl shrink-0">
                        <AiOutlineInfoCircle className="text-white" size={22} />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <Card.Title className="text-lg md:text-xl font-bold text-white truncate">
                            My Profile
                        </Card.Title>
                        <Card.Description className="text-xs md:text-sm text-gray-400">
                            Update your public profile and availability.
                        </Card.Description>
                    </div>
                </Card.Header>

                <Separator className="bg-gray-800" />

                <Card.Content className="p-4 md:p-6">
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full min-w-0">

                        {/* LEFT COLUMN */}
                        <div className="flex flex-col gap-4 w-full min-w-0">
                            <div className="flex flex-col gap-1.5 w-full">
                                <Label>Doctor Photo</Label>
                                <div className="flex flex-row items-center gap-4">
                                    <div className="relative w-20 h-20 rounded-full bg-[#1e293b] border border-gray-700 flex items-center justify-center overflow-hidden shrink-0">
                                        {imagePreview ? (
                                            <img src={imagePreview} alt="Doctor" className="w-full h-full object-cover" />
                                        ) : (
                                            <FiCamera className="text-gray-500" size={22} />
                                        )}
                                        {uploadingImage && (
                                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label
                                            htmlFor="doctor-image"
                                            className="cursor-pointer inline-flex items-center gap-2 bg-[#1e293b] hover:bg-[#334155] border border-gray-700 text-white text-sm px-4 py-2 rounded-lg transition"
                                        >
                                            <FiCamera size={14} />
                                            {formData.image ? "Change Photo" : "Upload Photo"}
                                        </label>
                                        <input
                                            id="doctor-image"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleImageUpload}
                                            disabled={uploadingImage}
                                        />
                                        {formData.image && (
                                            <button
                                                type="button"
                                                onClick={handleRemoveImage}
                                                className="inline-flex items-center gap-1 text-red-400 text-xs hover:text-red-300 w-fit"
                                            >
                                                <FiX size={12} /> Remove photo
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <TextField isRequired className="w-full">
                                <Label>Doctor Name</Label>
                                <Input value={formData.name} onChange={handleInputChange("name")} />
                                <FieldError />
                            </TextField>

                            <TextField isRequired className="w-full">
                                <Label>Specialization</Label>
                                <Input value={formData.specialization} onChange={handleInputChange("specialization")} />
                                <FieldError />
                            </TextField>

                            <TextField isRequired className="w-full">
                                <Label>Highest Degree / Education</Label>
                                <Input value={formData.degree} onChange={handleInputChange("degree")} />
                                <FieldError />
                            </TextField>

                            <TextField className="w-full">
                                <Label>Description</Label>
                                <TextArea rows={4} value={formData.description} onChange={handleInputChange("description")} />
                            </TextField>

                            <TextField type="number" className="w-full">
                                <Label>Consultation Fee</Label>
                                <InputGroup>
                                    <InputGroup.Prefix>৳</InputGroup.Prefix>
                                    <InputGroup.Input
                                        value={formData.consultationFee}
                                        onChange={handleInputChange("consultationFee")}
                                    />
                                </InputGroup>
                            </TextField>
                        </div>

                        {/* RIGHT COLUMN */}
                        <div className="flex flex-col gap-4 w-full min-w-0">
                            <div className="flex items-center gap-2 text-orange-400 font-semibold">
                                <FiClock size={16} />
                                <span>Availability</span>
                            </div>

                            <div className="flex flex-col gap-1.5 w-full min-w-0">
                                <Label>Working Days</Label>
                                <ListBox
                                    selectionMode="multiple"
                                    selectedKeys={new Set(formData.workingDays)}
                                    onSelectionChange={handleWorkingDaysChange}
                                    className="flex flex-row flex-wrap gap-2 p-2 border border-gray-700 rounded-lg w-full max-w-full"
                                >
                                    {WEEK_DAYS.map((day) => (
                                        <ListBox.Item
                                            key={day}
                                            id={day}
                                            textValue={day}
                                            className="px-3 py-1 text-sm bg-[#1e293b] rounded-md data-[selected=true]:bg-purple-600"
                                        >
                                            {day}
                                        </ListBox.Item>
                                    ))}
                                </ListBox>

                                {formData.workingDays.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {formData.workingDays.map((day) => (
                                            <Chip key={day} size="sm" color="secondary">{day}</Chip>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 w-full">
                                <div className="w-full min-w-0">
                                    <Select
                                        placeholder="Start time"
                                        selectedKey={formData.startTime}
                                        onSelectionChange={(key) => handleSelectChange("startTime")(key)}
                                    >
                                        <Label>Start Time</Label>
                                        <Select.Trigger>
                                            <Select.Value />
                                            <Select.Indicator />
                                        </Select.Trigger>
                                        <Select.Popover>
                                            <ListBox>
                                                {TIME_SLOTS.map((t) => (
                                                    <ListBox.Item key={t} id={t} textValue={t}>{t}</ListBox.Item>
                                                ))}
                                            </ListBox>
                                        </Select.Popover>
                                    </Select>
                                </div>

                                <div className="w-full min-w-0">
                                    <Select
                                        placeholder="End time"
                                        selectedKey={formData.endTime}
                                        onSelectionChange={(key) => handleSelectChange("endTime")(key)}
                                    >
                                        <Label>End Time</Label>
                                        <Select.Trigger>
                                            <Select.Value />
                                            <Select.Indicator />
                                        </Select.Trigger>
                                        <Select.Popover>
                                            <ListBox>
                                                {TIME_SLOTS.map((t) => (
                                                    <ListBox.Item key={t} id={t} textValue={t}>{t}</ListBox.Item>
                                                ))}
                                            </ListBox>
                                        </Select.Popover>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-purple-400 font-semibold mt-2">
                                <FiSettings size={16} />
                                <span>Additional Options</span>
                            </div>

                            <TextField type="number" className="w-full">
                                <Label>Max Appointments Per Day</Label>
                                <Input value={formData.maxAppointments} onChange={handleInputChange("maxAppointments")} />
                            </TextField>
                        </div>

                        <div className="md:col-span-2 flex justify-end gap-3 pt-4 border-t border-gray-800 mt-4 w-full">
                            <Button
                                type="submit"
                                variant="primary"
                                isLoading={submitting}
                                isDisabled={uploadingImage || submitting}
                                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </Card.Content>
            </Card>

            {/* ================= CHANGE PASSWORD ================= */}
            <Card className="w-full bg-[#0f172a] border border-gray-800 rounded-xl shadow-xl overflow-hidden">
                <Card.Header className="flex flex-row items-center gap-3 p-4 md:p-6">
                    <div className="bg-red-600/80 p-3 rounded-xl shrink-0">
                        <FiLock className="text-white" size={20} />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <Card.Title className="text-lg md:text-xl font-bold text-white truncate">
                            Change Password
                        </Card.Title>
                        <Card.Description className="text-xs md:text-sm text-gray-400">
                            Update your account password.
                        </Card.Description>
                    </div>
                </Card.Header>

                <Separator className="bg-gray-800" />

                <Card.Content className="p-4 md:p-6">
                    <form onSubmit={handleChangePassword} className="flex flex-col gap-4 max-w-md">
                        <TextField isRequired className="w-full">
                            <Label>Current Password</Label>
                            <Input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                            />
                        </TextField>

                        <TextField isRequired className="w-full">
                            <Label>New Password</Label>
                            <Input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                        </TextField>

                        <TextField isRequired className="w-full">
                            <Label>Confirm New Password</Label>
                            <Input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </TextField>

                        <Button
                            type="submit"
                            variant="primary"
                            isLoading={changingPassword}
                            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white self-start"
                        >
                            Update Password
                        </Button>
                    </form>
                </Card.Content>
            </Card>
        </div>
    );
}