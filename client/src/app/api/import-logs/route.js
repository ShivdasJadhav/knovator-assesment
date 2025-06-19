import { NextResponse } from "next/server";
import ImportLog from "@/models/importLog.model.js"; // adjust path
import { connectDB } from "@/lib/mongoose.js"; // use your helper

export async function GET() {
  try {
    await connectDB();
    const logs = await ImportLog.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(logs);
  } catch (err) {
    console.error("❌ Error fetching logs:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
