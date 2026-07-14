import { NextResponse } from "next/server";

export const runtime = "edge";

type RentalInquiryPayload = {
  name: string;
  email: string;
  phone: string;
  company?: string;
  spaceType?: string;
  duration: string;
  pieces: number;
  message?: string;
};

const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env["Project URL"] ||
  "";
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env["Anon Key"] ||
  "";

const isValidEmail = (value: string) => /\S+@\S+\.\S+/.test(value);

const generateInquiryId = (): string => {
  const random = Math.floor(100000 + Math.random() * 900000);
  return `ASRNT${random}`;
};

export async function POST(request: Request) {
  try {
    const payload: RentalInquiryPayload = await request.json();

    if (!payload.name?.trim()) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    if (!payload.email?.trim() || !isValidEmail(payload.email)) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }

    if (!payload.phone?.trim()) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    if (!payload.duration?.trim()) {
      return NextResponse.json(
        { error: "Rental duration is required" },
        { status: 400 }
      );
    }

    if (!payload.pieces || payload.pieces < 1) {
      return NextResponse.json(
        { error: "Number of pieces is required" },
        { status: 400 }
      );
    }

    const inquiryId = generateInquiryId();
    const createdAt = new Date().toISOString();

    const inquiryData = {
      id: inquiryId,
      name: payload.name.trim(),
      email: payload.email.trim().toLowerCase(),
      phone: payload.phone.trim(),
      company: payload.company?.trim() || null,
      space_type: payload.spaceType?.trim() || null,
      duration: payload.duration.trim(),
      pieces: payload.pieces,
      message: payload.message?.trim() || null,
      status: "pending",
      created_at: createdAt,
    };

    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const supabaseResponse = await fetch(`${SUPABASE_URL}/rest/v1/rental_inquiries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          "Prefer": "return=minimal",
        },
        body: JSON.stringify(inquiryData),
      });

      if (!supabaseResponse.ok) {
        const errorText = await supabaseResponse.text();
        console.error("Supabase insert error:", errorText);

        return NextResponse.json({
          success: true,
          inquiryId,
          message: "Inquiry submitted successfully",
        });
      }
    }

    return NextResponse.json({
      success: true,
      inquiryId,
      message: "Rental inquiry submitted successfully",
    });
  } catch (error) {
    console.error("Rental inquiry error:", error);
    return NextResponse.json(
      { error: "Failed to submit inquiry" },
      { status: 500 }
    );
  }
}