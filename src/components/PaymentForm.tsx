"use client";

import { authClient } from "@/lib/auth-client";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useState, FormEvent } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface Doctor {
    _id: string;
    consultationFee: string | number;
}

interface PaymentFormProps {
    doctor: Doctor;
    selectedDate: string;
    isDateValid: boolean;
}

export default function PaymentForm({ doctor, selectedDate, isDateValid }: PaymentFormProps): React.JSX.Element {
    const stripe = useStripe();
    const elements = useElements();
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(false);

    const { data: session } = authClient.useSession();

    const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();

        if (!stripe || !elements) return;

        // 🔥 এক্সট্রা safety check — login না থাকলে booking আটকানো
        if (!session?.user?.id) {
            toast.error("Please sign in to book an appointment.");
            router.push(`/signin?redirect=/doctors/${doctor._id}`);
            return;
        }

        if (!isDateValid) {
            toast.error("Please select a valid appointment date first.");
            return;
        }

        setLoading(true);

        const toastId = toast.loading("Processing your payment intent...");

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/create-payment-intent`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount: Math.round(Number(doctor.consultationFee) * 100),
                }),
            });

            const data = await res.json();

            if (!res.ok || !data.clientSecret) {
                toast.error(data.message || "Could not initiate payment. Please try again.", { id: toastId });
                setLoading(false);
                return;
            }

            toast.loading("Confirming your payment...", { id: toastId });

            const result = await stripe.confirmCardPayment(data.clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement)!,
                },
            });

            if (result.error) {
                toast.error(result.error.message || "Payment confirmation failed.", { id: toastId });
                setLoading(false);
                return;
            }

            if (result.paymentIntent?.status === "succeeded") {
                toast.loading("Securing your appointment slot...", { id: toastId });

                const appointmentRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}//api/appointments`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        doctorId: doctor._id,
                        patientId: session.user.id,
                        date: selectedDate,
                    }),
                });

                if (appointmentRes.ok) {
                    toast.success("Appointment booked successfully! ✅", { id: toastId });
                } else {
                    toast.error("Payment received, but failed to secure appointment. Please contact support.", { id: toastId });
                }
            }
        } catch (err) {
            console.error("Payment Error:", err);
            toast.error("An unexpected error occurred. Please try again.", { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {!session?.user && (
                <p className="text-amber-400 text-xs">
                    ⚠️ You need to sign in before booking an appointment.
                </p>
            )}

            {session?.user && !isDateValid && (
                <p className="text-amber-400 text-xs">
                    ⚠️ Please select a valid appointment date above before paying.
                </p>
            )}

            <CardElement
                options={{
                    hidePostalCode: true,
                    style: {
                        base: {
                            fontSize: "16px",
                            color: "#ffffff",
                            "::placeholder": { color: "#94a3b8" },
                            iconColor: "#60a5fa",
                        },
                        invalid: { color: "#f87171", iconColor: "#f87171" },
                    },
                }}
                className={`p-3 border border-gray-700 rounded-lg bg-[#1e293b] transition-opacity ${
                    !isDateValid || !session?.user ? "opacity-50 pointer-events-none" : ""
                }`}
            />

            <button
                type="submit"
                disabled={loading || !stripe || !isDateValid}
                className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded text-white w-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading
                    ? "Processing..."
                    : !session?.user
                    ? "Sign in to book"
                    : !isDateValid
                    ? "Select a date to continue"
                    : "Pay & Book Appointment"}
            </button>
        </form>
    );
}