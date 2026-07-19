import { NextResponse } from "next/server";
import { getExchangeRates } from "@/lib/currency/rates";

export async function GET() {
  const rates = await getExchangeRates();
  return NextResponse.json(
    { rates },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
