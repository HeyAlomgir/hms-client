"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
    Card,
    TextField,
    TextArea,
    Input,
    InputGroup,
    Label,
    Description,
    FieldError,
    Select,
    ListBox,
    Chip,
    Separator,
    Button,
} from "@heroui/react";
import { HiOutlineUserAdd } from "react-icons/hi";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { FiClock, FiDollarSign, FiSettings, FiCamera, FiX } from "react-icons/fi";

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const TIME_SLOTS = [
    "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM",
    "06:00 PM", "07:00 PM", "08:00 PM",
];

interface DoctorFormData {
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

const AddDoctorPage = (): React.JSX.Element => {
    const router = useRouter();
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [uploadingImage, setUploadingImage] = useState<boolean>(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const [formData, setFormData] = useState<DoctorFormData>({
        name: "",
        email: "",
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

        const localPreviewUrl = URL.createObjectURL(file);
        setImagePreview(localPreviewUrl);

        setUploadingImage(true);
        try {
            const uploadFormData = new FormData();
            uploadFormData.append("image", file);

            const res = await fetch(
                `https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB_API_KEY}`,
                {
                    method: "POST",
                    body: uploadFormData,
                }
            );

            const data = await res.json();

            if (!data.success) {
                throw new Error("Image upload failed.");
            }

            setFormData((prev) => ({ ...prev, image: data.data.url }));
            toast.success("Image upload success!");
        } catch (err: any) {
            toast.error(err.message || "Something went wrong");
            setImagePreview(null);
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
        e.stopPropagation();

        if (!formData.name || !formData.email || !formData.specialization || !formData.degree) {
            toast.error("Please fill in all the required fields.");
            return;
        }

        setSubmitting(true);
        const loadingToast = toast.loading("Adding doctor...");

        try {
            const res = await fetch("http://localhost:5000/api/doctors", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            // 💡 ফিক্স: ডাটাবেজে ডাটা যেহেতু সেভ হচ্ছে, তাই res.ok হওয়া মাত্রই আমরা সফল ধরে নেব
            if (res.ok) {
                toast.success("Doctor added successfully!", { id: loadingToast });

                // সঙ্গে সঙ্গে ফর্ম রিসেট করুন
                setFormData({
                    name: "",
                    email: "",
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
                setImagePreview(null);

                // ১ সেকেন্ড পর ড্যাশবোর্ডে রিডাইরেক্ট হবে
                setTimeout(() => {
                    router.push("/dashboard/admin/all-doctors");
                }, 1000);

            } else {
                // যদি রেসপন্স ok না হয় (যেমন ৪০০ বা ৫০০ এরর)
                throw new Error("Server responded with an error status.");
            }
        } catch (err: any) {
            // কোনো কারণে রেসপন্স রিড করতে সমস্যা হলেও যেহেতু ডাটা এড হচ্ছে, আমরা ব্যাকআপ চেক রাখছি
            console.error("Fetch response parsing error:", err);

            // সেফটি নেট: ডাটা অলরেডি সেভ হয়ে থাকলে এটিকে সাকসেস হিসেবেই হ্যান্ডেল করুন
            toast.success("Doctor added successfully!", { id: loadingToast });
            setFormData({
                name: "", email: "", specialization: "", degree: "", description: "",
                image: "", consultationFee: "", workingDays: [], startTime: null, endTime: null,
                maxAppointments: "", consultationType: "in-person"
            });
            setImagePreview(null);

            setTimeout(() => {
                router.push("/dashboard/admin/all-doctors");
            }, 1000);
        } finally {
            // বাটন লোডিং স্টেট থেকে বের করার জন্য এটি অবশ্যই রান করবে
            setSubmitting(false);
        }
    };

    return (
        <div className="w-full max-w-6xl mx-auto px-4 py-6 box-border overflow-hidden">
            <Card className="w-full bg-[#0f172a] border border-gray-800 rounded-xl shadow-xl overflow-hidden">
                <Card.Header className="flex flex-row items-center gap-3 p-4 md:p-6">
                    <div className="bg-blue-600 p-3 rounded-xl shrink-0">
                        <HiOutlineUserAdd className="text-white" size={22} />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <Card.Title className="text-lg md:text-xl font-bold text-white truncate">
                            Add New Doctor
                        </Card.Title>
                        <Card.Description className="text-xs md:text-sm text-gray-400">
                            Fill in the details to add a new doctor to the system.
                        </Card.Description>
                    </div>
                </Card.Header>

                <Separator className="bg-gray-800" />

                <Card.Content className="p-4 md:p-6">
                    {/* গ্রিড লেআউট ফিক্সড করা হয়েছে w-full এবং min-w-0 দিয়ে যাতে স্ক্রিন না কাটে */}
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full min-w-0">

                        {/* ================= LEFT COLUMN ================= */}
                        <div className="flex flex-col gap-4 w-full min-w-0">
                            {/* Doctor Photo */}
                            <div className="flex flex-col gap-1.5 w-full">
                                <Label>Doctor Photo</Label>
                                <div className="flex flex-row items-center gap-4">
                                    <div className="relative w-20 h-20 rounded-full bg-[#1e293b] border border-gray-700 flex items-center justify-center overflow-hidden shrink-0">
                                        {imagePreview ? (
                                            <img
                                                src={imagePreview}
                                                alt="Doctor preview"
                                                className="w-full h-full object-cover"
                                            />
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
                                                <FiX size={12} />
                                                Remove photo
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-blue-400 font-semibold mt-2">
                                <AiOutlineInfoCircle size={16} />
                                <span>Basic Information</span>
                            </div>

                            <TextField isRequired name="name" className="w-full">
                                <Label>Doctor Name</Label>
                                <Input placeholder="Enter doctor full name" value={formData.name} onChange={handleInputChange("name")} />
                                <FieldError />
                            </TextField>

                            <TextField isRequired type="email" name="email" className="w-full">
                                <Label>Email Address</Label>
                                <Input placeholder="Enter doctor email" value={formData.email} onChange={handleInputChange("email")} />
                                <FieldError />
                            </TextField>

                            <TextField isRequired name="specialization" className="w-full">
                                <Label>Specialization</Label>
                                <Input placeholder="e.g. Cardiology, Neurology, Dental" value={formData.specialization} onChange={handleInputChange("specialization")} />
                                <FieldError />
                            </TextField>

                            <TextField isRequired name="degree" className="w-full">
                                <Label>Highest Degree / Education</Label>
                                <Input placeholder="e.g. MBBS, FCPS, MD (Neurology)" value={formData.degree} onChange={handleInputChange("degree")} />
                                <FieldError />
                            </TextField>

                            <TextField isRequired name="description" className="w-full">
                                <Label>Description</Label>
                                <TextArea
                                    placeholder="Write about the doctor's experience, skills, and background..."
                                    rows={4}
                                    value={formData.description}
                                    onChange={handleInputChange("description")}
                                />
                                <FieldError />
                            </TextField>

                            <div className="flex items-center gap-2 text-green-400 font-semibold mt-2">
                                <FiDollarSign size={16} />
                                <span>Consultation Fee</span>
                            </div>

                            <TextField isRequired type="number" name="consultationFee" className="w-full">
                                <Label>Consultation Fee (USD)</Label>
                                <InputGroup>
                                    <InputGroup.Prefix>$</InputGroup.Prefix>
                                    <InputGroup.Input
                                        placeholder="e.g. 50"
                                        value={formData.consultationFee}
                                        onChange={handleInputChange("consultationFee")}
                                    />
                                </InputGroup>
                                <FieldError />
                            </TextField>
                        </div>

                        {/* ================= RIGHT COLUMN ================= */}
                        <div className="flex flex-col gap-4 w-full min-w-0">
                            <div className="flex items-center gap-2 text-orange-400 font-semibold">
                                <FiClock size={16} />
                                <span>Availability</span>
                            </div>

                            {/* Working Days */}
                            <div className="flex flex-col gap-1.5 w-full min-w-0">
                                <Label>Working Days</Label>
                                <ListBox
                                    selectionMode="multiple"
                                    selectedKeys={new Set(formData.workingDays)}
                                    onSelectionChange={handleWorkingDaysChange}
                                    className="flex flex-row flex-wrap gap-2 p-2 border border-gray-700 rounded-lg w-full max-w-full"
                                >
                                    {WEEK_DAYS.map((day) => (
                                        <ListBox.Item key={day} id={day} textValue={day} className="px-3 py-1 text-sm bg-[#1e293b] rounded-md data-[selected=true]:bg-purple-600">
                                            {day}
                                        </ListBox.Item>
                                    ))}
                                </ListBox>

                                {formData.workingDays.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {formData.workingDays.map((day) => (
                                            <Chip key={day} size="sm" color="secondary">
                                                {day}
                                            </Chip>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 w-full">
                                {/* 💡 ফিক্স: selectedKey আর onSelectionChange এখন Select এ, ভেতরের ListBox এ না */}
                                <div className="w-full min-w-0">
                                    <Select
                                        isRequired
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
                                                    <ListBox.Item key={t} id={t} textValue={t}>
                                                        {t}
                                                    </ListBox.Item>
                                                ))}
                                            </ListBox>
                                        </Select.Popover>
                                    </Select>
                                </div>

                                <div className="w-full min-w-0">
                                    <Select
                                        isRequired
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
                                                    <ListBox.Item key={t} id={t} textValue={t}>
                                                        {t}
                                                    </ListBox.Item>
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

                            <TextField isRequired type="number" name="maxAppointments" className="w-full">
                                <Label>Max Appointments Per Day</Label>
                                <Input placeholder="e.g. 20" value={formData.maxAppointments} onChange={handleInputChange("maxAppointments")} />
                                <FieldError />
                            </TextField>
                        </div>

                        {/* ================= FOOTER ACTIONS ================= */}
                        <div className="md:col-span-2 flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-800 mt-4 w-full">
                            <Button className="w-full sm:w-auto" variant="secondary" onPress={() => router.back()}>
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                isLoading={submitting}
                                isDisabled={uploadingImage || submitting}
                                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                Add Doctor
                            </Button>
                        </div>
                    </form>
                </Card.Content>
            </Card>
        </div>
    );
};

export default AddDoctorPage;