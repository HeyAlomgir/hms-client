"use client";

import { useEffect, useState, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@heroui/react";
import {
    FiClock,
    FiDollarSign,
    FiUsers,
    FiCalendar,
    FiCheckCircle,
    FiMail,
    FiBookmark,
} from "react-icons/fi";
import { FaStar, FaRegStar } from "react-icons/fa";
import toast from "react-hot-toast";
import { authClient } from "@/lib/auth-client";
import { Elements } from "@stripe/react-stripe-js";
import PaymentForm from "@/components/PaymentForm";
import { stripePromise } from "@/lib/stripe";

// --- INTERFACES FOR TYPES ---
interface Doctor {
    _id: string;
    name: string;
    email: string;
    specialization: string;
    degree?: string;
    description: string;
    image?: string;
    consultationFee: string | number;
    workingDays: string[];
    startTime: string | null;
    endTime: string | null;
    maxAppointments: string | number;
    consultationType: "in-person" | "online";
    status?: string;
}

interface Review {
    _id: string;
    doctorId: string;
    patientName: string;
    patientEmail: string;
    patientImage: string | null;
    rating: number;
    comment: string;
    createdAt?: string;
}

interface Bookmark {
    _id: string;
    doctorId: string;
    userEmail: string;
}

interface StarRatingProps {
    rating: number;
    size?: number;
}

// --- HELPER COMPONENTS & FUNCTIONS ---
const StarRating = ({ rating, size = 16 }: StarRatingProps): React.JSX.Element => (
    <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) =>
            star <= rating ? (
                <FaStar key={star} size={size} className="text-amber-400" />
            ) : (
                <FaRegStar key={star} size={size} className="text-neutral-600" />
            )
        )}
    </div>
);

const formatReviewDate = (createdAt?: string): string => {
    if (!createdAt) return "Recently";
    const date = new Date(createdAt);
    if (isNaN(date.getTime())) return "Recently";
    return date.toLocaleDateString();
};

const getInitials = (name?: string | null): string =>
    name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "?";


const DAY_NAME_MAP = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// --- MAIN COMPONENT ---
const DoctorDetails = (): React.JSX.Element => {
    const params = useParams();
    const id = params?.id as string; // useParams থেকে id-কে string হিসেবে নিশ্চিত করা হলো
    const router = useRouter();

    // authClient
    const { data: session, isPending: sessionLoading } = authClient.useSession();
    const user = session?.user;

    const [doctor, setDoctor] = useState<Doctor | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const [reviews, setReviews] = useState<Review[]>([]);
    const [reviewLoading, setReviewLoading] = useState<boolean>(true);

    const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
    const [bookmarkId, setBookmarkId] = useState<string | null>(null);
    const [bookmarkLoading, setBookmarkLoading] = useState<boolean>(false);

    const [newRating, setNewRating] = useState<number>(0);
    const [hoverRating, setHoverRating] = useState<number>(0);
    const [comment, setComment] = useState<string>("");
    const [submitting, setSubmitting] = useState<boolean>(false);

    // 🔥 নতুন: appointment date নির্বাচন করার জন্য state
    const [selectedDate, setSelectedDate] = useState<string>("");

    const loadDoctor = async (): Promise<void> => {
        try {
            const res = await fetch(`http://localhost:5000/api/doctors/${id}`);
            const data: Doctor = await res.json();
            setDoctor(data);
        } catch (err) {
            toast.error("Failed to load doctor details");
        } finally {
            setLoading(false);
        }
    };

    const loadReviews = async (): Promise<void> => {
        try {
            const res = await fetch(`http://localhost:5000/api/reviews/${id}`);
            const data: Review[] = await res.json();
            setReviews(data);
        } catch (err) {
            toast.error("Failed to load reviews");
        } finally {
            setReviewLoading(false);
        }
    };

    const loadBookmarkStatus = async (): Promise<void> => {
        if (!user?.email) return;
        try {
            const res = await fetch(
                `http://localhost:5000/api/bookmarks/${user.email}`
            );
            const data: Bookmark[] = await res.json();
            const found = data.find((b) => b.doctorId === id);
            if (found) {
                setIsBookmarked(true);
                setBookmarkId(found._id);
            }
        } catch (err) {
            // silent — status check failure shouldn't bother the user
        }
    };

    useEffect(() => {
        if (!id) return;
        loadDoctor();
        loadReviews();
    }, [id]);

    useEffect(() => {
        if (!sessionLoading && user?.email && id) {
            loadBookmarkStatus();
        }
    }, [sessionLoading, user?.email, id]);

    const toggleBookmark = async (): Promise<void> => {
        if (!user) {
            toast.error("Please sign in to save doctors");
            router.push("/signin");
            return;
        }

        setBookmarkLoading(true);
        try {
            if (isBookmarked && bookmarkId) {
                await fetch(`http://localhost:5000/api/bookmarks/${bookmarkId}`, {
                    method: "DELETE",
                });
                setIsBookmarked(false);
                setBookmarkId(null);
                toast.success("Removed from saved doctors");
            } else {
                const res = await fetch(`http://localhost:5000/api/bookmarks`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ doctorId: id, userEmail: user.email }),
                });
                if (!res.ok) throw new Error("Bookmark failed");
                const data = await res.json();
                setIsBookmarked(true);
                setBookmarkId(data.insertedId);
                toast.success("Doctor saved to your list");
            }
        } catch (err) {
            toast.error("Something went wrong, please try again");
        } finally {
            setBookmarkLoading(false);
        }
    };

    const submitReview = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        if (!user) {
            toast.error("Please sign in to leave a review");
            router.push("/signin");
            return;
        }
        if (newRating === 0) {
            toast.error("Please select a rating");
            return;
        }

        setSubmitting(true);
        const toastId = toast.loading("Submitting your review...");
        try {
            const res = await fetch(`http://localhost:5000/api/reviews`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    doctorId: id,
                    patientName: user.name,
                    patientEmail: user.email,
                    patientImage: user.image || null,
                    rating: newRating,
                    comment,
                }),
            });
            if (!res.ok) throw new Error("Failed to submit");
            await res.json();
            setNewRating(0);
            setComment("");
            await loadReviews();
            toast.success("Review submitted!", { id: toastId });
        } catch (err) {
            toast.error("Failed to submit review", { id: toastId });
        } finally {
            setSubmitting(false);
        }
    };

    const avgRating: string | null = reviews.length
        ? (
            reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        ).toFixed(1)
        : null;

    // New: doctor Date selected available helper
    const isDoctorAvailableOnDate = (dateStr: string): boolean => {
        if (!dateStr || !doctor?.workingDays?.length) return false;
        const dayIndex = new Date(dateStr).getDay(); // 0 (Sun) - 6 (Sat)
        return doctor.workingDays.includes(DAY_NAME_MAP[dayIndex]);
    };

    const todayStr = new Date().toISOString().split("T")[0];

    if (loading) {
        return <div className="p-6 text-center text-white">Loading...</div>;
    }
    if (!doctor) {
        return <div className="p-6 text-center text-white">Doctor not found</div>;
    }

    const isApproved: boolean = doctor.status === "approved";

    return (
        <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 text-white">
            {/* Profile section */}
            <div
                className="relative rounded-2xl border border-white/10 bg-gradient-to-b
                   from-neutral-900 to-neutral-950 shadow-lg shadow-black/40
                   p-5 sm:p-6 lg:p-8 flex flex-col sm:flex-row gap-6"
            >
                <button
                    onClick={toggleBookmark}
                    disabled={bookmarkLoading}
                    className={`absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-1.5
                      rounded-full px-3 py-1.5 text-xs font-medium ring-1 transition-colors disabled:opacity-50
            ${isBookmarked
                            ? "bg-blue-500/15 text-blue-400 ring-blue-500/30"
                            : "bg-white/5 text-neutral-300 ring-white/10 hover:bg-white/10"
                        }`}
                >
                    <FiBookmark className={isBookmarked ? "fill-blue-400" : ""} size={14} />
                    {bookmarkLoading ? "..." : isBookmarked ? "Saved" : "Save"}
                </button>

                <img
                    src={doctor.image}
                    alt={doctor.name}
                    referrerPolicy="no-referrer"
                    className="h-24 w-24 sm:h-28 sm:w-28 rounded-full object-cover ring-2 ring-blue-500/30 flex-shrink-0"
                />

                <div className="flex flex-col gap-3 min-w-0">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold">{doctor.name}</h1>
                        <p className="text-blue-400 font-medium text-sm">
                            {doctor.specialization}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ring-1
                ${isApproved
                                    ? "bg-emerald-500/15 text-emerald-400 ring-emerald-500/30"
                                    : "bg-amber-500/15 text-amber-400 ring-amber-500/30"
                                }`}
                        >
                            <FiCheckCircle size={12} />
                            {doctor.status || "pending"}
                        </span>
                        <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-neutral-300 ring-1 ring-white/10">
                            {doctor.consultationType}
                        </span>
                        {avgRating && (
                            <span className="inline-flex items-center gap-1 text-xs text-neutral-300">
                                <StarRating rating={Math.round(parseFloat(avgRating))} size={12} />
                                {avgRating} ({reviews.length})
                            </span>
                        )}
                    </div>

                    <p className="text-sm text-neutral-400 leading-relaxed">
                        {doctor.description}
                    </p>

                    <div className="flex items-center gap-2 text-sm text-neutral-400">
                        <FiMail size={14} className="text-blue-400" />
                        {doctor.email}
                    </div>
                </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                <div className="rounded-xl bg-white/[0.03] p-4 ring-1 ring-white/5 flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-neutral-500 text-xs">
                        <FiDollarSign size={13} /> Fee
                    </div>
                    <p className="font-semibold">{doctor.consultationFee}৳</p>
                </div>
                <div className="rounded-xl bg-white/[0.03] p-4 ring-1 ring-white/5 flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-neutral-500 text-xs">
                        <FiUsers size={13} /> Slots
                    </div>
                    <p className="font-semibold">{doctor.maxAppointments}</p>
                </div>
                <div className="rounded-xl bg-white/[0.03] p-4 ring-1 ring-white/5 flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-neutral-500 text-xs">
                        <FiClock size={13} /> Time
                    </div>
                    <p className="font-semibold text-sm">
                        {doctor.startTime} - {doctor.endTime}
                    </p>
                </div>
                <div className="rounded-xl bg-white/[0.03] p-4 ring-1 ring-white/5 flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-neutral-500 text-xs">
                        <FiCalendar size={13} /> Days
                    </div>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                        {doctor.workingDays?.map((day) => (
                            <span
                                key={day}
                                className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded-full ring-1 ring-white/10"
                            >
                                {day}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* New: Appointment date selet + Payment section */}
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Select Appointment Date
                </label>
                <input
                    type="date"
                    min={todayStr}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full sm:w-64 rounded-lg bg-neutral-900 border border-white/10 p-2.5 text-sm
                               text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />

                {selectedDate && !isDoctorAvailableOnDate(selectedDate) && (
                    <p className="text-red-400 text-xs mt-2">
                        Doctor is not available on this day. Available days: {doctor.workingDays?.join(", ")}
                    </p>
                )}

                <div className="mt-4">
                    <Elements stripe={stripePromise}>
                        <PaymentForm
                            doctor={doctor}
                            selectedDate={selectedDate}
                            isDateValid={!!selectedDate && isDoctorAvailableOnDate(selectedDate)}
                        />
                    </Elements>
                </div>
            </div>

            {/* Reviews section */}
            <div className="mt-10">
                <h2 className="text-lg font-bold mb-4">
                    Reviews {reviews.length > 0 && `(${reviews.length})`}
                </h2>

                {/* Add review form */}
                <form
                    onSubmit={submitReview}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5 mb-6 flex flex-col gap-3"
                >
                    <div className="flex items-center gap-2">
                        {user?.image ? (
                            <img
                                src={user.image}
                                alt={user.name}
                                referrerPolicy="no-referrer"
                                className="h-8 w-8 rounded-full object-cover ring-1 ring-white/10"
                            />
                        ) : user ? (
                            <div className="h-8 w-8 rounded-full bg-blue-500/10 ring-1 ring-blue-500/30 flex items-center justify-center text-[10px] font-semibold text-blue-400">
                                {getInitials(user.name)}
                            </div>
                        ) : null}
                        <p className="text-sm font-medium text-neutral-300">
                            {user ? `Reviewing as ${user.name}` : "Rate your experience"}
                        </p>
                    </div>

                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                type="button"
                                key={star}
                                onClick={() => setNewRating(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                            >
                                {star <= (hoverRating || newRating) ? (
                                    <FaStar size={22} className="text-amber-400" />
                                ) : (
                                    <FaRegStar size={22} className="text-neutral-600" />
                                )}
                            </button>
                        ))}
                    </div>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Share your experience with this doctor..."
                        rows={3}
                        className="w-full rounded-lg bg-neutral-900 border border-white/10 p-3 text-sm
                       text-white placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <Button
                        type="submit"
                        disabled={newRating === 0 || submitting}
                        className="self-start rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm px-5 disabled:opacity-50"
                    >
                        {submitting ? "Submitting..." : "Submit Review"}
                    </Button>
                </form>

                {/* Review list */}
                {reviewLoading ? (
                    <p className="text-sm text-neutral-500">Loading reviews...</p>
                ) : reviews.length === 0 ? (
                    <p className="text-sm text-neutral-500">
                        No reviews yet. Be the first to review this doctor.
                    </p>
                ) : (
                    <div className="flex flex-col gap-3">
                        {reviews.map((review) => (
                            <div
                                key={review._id}
                                className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                        {review.patientImage ? (
                                            <img
                                                src={review.patientImage}
                                                alt={review.patientName}
                                                referrerPolicy="no-referrer"
                                                className="h-8 w-8 rounded-full object-cover ring-1 ring-white/10"
                                            />
                                        ) : (
                                            <div className="h-8 w-8 rounded-full bg-blue-500/10 ring-1 ring-blue-500/30 flex items-center justify-center text-[10px] font-semibold text-blue-400">
                                                {getInitials(review.patientName)}
                                            </div>
                                        )}
                                        <p className="font-medium text-sm">{review.patientName}</p>
                                    </div>
                                    <StarRating rating={review.rating} size={13} />
                                </div>
                                {review.comment && (
                                    <p className="text-sm text-neutral-400 mt-1 ml-10">
                                        {review.comment}
                                    </p>
                                )}
                                <p className="text-[11px] text-neutral-600 mt-2 ml-10">
                                    {formatReviewDate(review.createdAt)}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DoctorDetails;