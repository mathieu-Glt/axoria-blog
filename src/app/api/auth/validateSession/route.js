import { Session } from "@/lib/models/Session";
import { User } from "@/lib/models/User";
import { connectToDB } from "@/lib/utils/db/connectToDB";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const sessionId = (await cookies()).get("sessionId")?.value;

    if (!sessionId) {
      return NextResponse.json({ authorized: false }, { status: 301 });
    }

    await connectToDB();

    const session = await Session.findById(sessionId);
    if (!session || session.expiredAt < new Date()) {
      return NextResponse.json({ authorized: false }, { status: 301 });
    }

    const user = await User.findById(session.userId);
    if (!user) {
      return NextResponse.json({ authorized: false }, { status: 301 });
    }

    return NextResponse.json(
      { authorized: true },
      { status: 200 },
      { userId: user._id.toString() },
    );
  } catch (error) {
    console.log("Error while validating session : ", error);
    return NextResponse.json({ authorized: false }, { status: 301 });
  }
}
