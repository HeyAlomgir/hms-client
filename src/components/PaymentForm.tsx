"use client";

import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useState } from "react";
import toast from "react-hot-toast";

export default function PaymentForm({ doctor }: any) {
    const stripe = useStripe();
    const elements = useElements();

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        if (!stripe || !elements) return;

        setLoading(true);

        //  1. create payment intent
        const res = await fetch("http://localhost:5000/api/create-payment-intent", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                amount: Math.round(Number(doctor.consultationFee) * 100), 
            }),
        });

        const data = await res.json();


     
        if (!res.ok || !data.clientSecret) {
            console.error("Payment intent creation failed:", data);
            toast.success(data.message || "Payment শুরু করা যায়নি। আবার চেষ্টা করো।")
            setLoading(false);
            return;
        }

        // 🔥 2. confirm payment
        const result = await stripe.confirmCardPayment(data.clientSecret, {
            payment_method: {
                card: elements.getElement(CardElement)!,
            },
        });

        if (result.paymentIntent?.status === "succeeded") {
            // 🔥 3. save appointment
            await fetch("http://localhost:5000/api/appointments", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    doctorId: doctor._id,
                    patientId: "USER_ID", 
                    date: new Date(),
                }),
            });

            alert("Appointment booked ✅");
        }

        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <CardElement
                options={{
                    hidePostalCode: true,
                    style: {
                        base: {
                            fontSize: "16px",
                            color: "#ffffff", 
                            "::placeholder": {
                                color: "#94a3b8", 
                            },
                            iconColor: "#60a5fa",
                        },
                        invalid: {
                            color: "#f87171",
                            iconColor: "#f87171",
                        },
                    },
                }}
                className="p-3 border border-gray-700 rounded-lg bg-[#1e293b]"
            />

            <button className="bg-blue-500 px-4 py-2 rounded text-white w-full">
                {loading ? "Processing..." : "Pay & Book Appointment"}
            </button>
        </form>
    );
}