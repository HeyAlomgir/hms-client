import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";

export async function POST(req: NextRequest) {
  let client: MongoClient | null = null;

  try {
    const body = await req.json();

    const {
      name,
      email,
      password,
      image,
      ...doctorFields
    } = body;

    // Required field validation
    if (!name || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Name, email and password are required",
        },
        { status: 400 }
      );
    }

    // Password validation
    if (typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 8 characters long",
        },
        { status: 400 }
      );
    }

    // API URL validation
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!apiUrl) {
      return NextResponse.json(
        {
          success: false,
          message: "Backend API URL is not configured",
        },
        { status: 500 }
      );
    }

    // 1. Create Better Auth account using applicant's password
    const signUpResult = await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
      },
    });

    const userId = signUpResult?.user?.id;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Account creation failed. This email may already be registered.",
        },
        { status: 400 }
      );
    }

    // 2. Update user role and profile image
    client = new MongoClient(process.env.MONGO_DB_URI!);
    await client.connect();

    const db = client.db("hospital-management");

    if (!ObjectId.isValid(userId)) {
      throw new Error("Invalid user ID returned by authentication");
    }

    await db.collection("user").updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          role: "doctor",
          emailVerified: true,
          image: image || null,
        },
      }
    );

    await client.close();
    client = null;

    // 3. Create doctor profile in the existing Express API
    const doctorRes = await fetch(`${apiUrl}/api/doctors`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...doctorFields,
        name,
        email,
        image,
        userId,
      }),
    });

    const doctorData = await doctorRes.json();

    if (!doctorRes.ok) {
      return NextResponse.json(
        {
          success: false,
          message:
            doctorData?.message || "Account created, but doctor application failed.",
          accountCreated: true,
        },
        { status: doctorRes.status }
      );
    }

    // 4. Success response
    return NextResponse.json(
      {
        success: true,
        message: "Doctor application submitted successfully",
        doctor: doctorData,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Apply Doctor Error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message || "Something went wrong while submitting application",
      },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.close();
    }
  }
}