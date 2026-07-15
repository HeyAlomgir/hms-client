import { auth } from "@/lib/auth"; 
import { NextRequest, NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";

function generateTempPassword(): string {
  return Math.random().toString(36).slice(-10) + "Aa1!";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, image, ...doctorFields } = body;

    if (!name || !email) {
      return NextResponse.json(
        { success: false, message: "Name and email are required" },
        { status: 400 }
      );
    }

    const tempPassword = generateTempPassword();


    const signUpResult = await auth.api.signUpEmail({
      body: { name, email, password: tempPassword },
    });

    const userId = signUpResult?.user?.id;
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Failed to create auth account (email may already exist)" },
        { status: 500 }
      );
    }


    const client = new MongoClient(process.env.MONGO_DB_URI!);
    await client.connect();
    const db = client.db("hospital-management");
    await db.collection("user").updateOne(
      { _id: new ObjectId(userId) },
      { $set: { role: "doctor", emailVerified: true, image: image || null } }
    );
    await client.close();

    // 3️⃣ Express backend-এ doctor profile 
    const doctorRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/doctors`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...doctorFields, name, email, image, userId }),
    });
    const doctorData = await doctorRes.json();

    return NextResponse.json({
      success: true,
      doctor: doctorData,
      tempPassword, // এটা এখন admin-কে দেখাও, doctor-কে শেয়ার করার জন্য
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}