const { Session } = require("@/lib/models/Session");
const { User } = require("@/lib/models/User");
const { connectToDB } = require("@/lib/utils/db/connectToDB");
const { cookies } = require("next/headers");

export async function sessionInfo() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("sessionId")?.value;

  if (!sessionId) {
    return { success: false };
  }

  await connectToDB();

  const session = await Session.findById(sessionId);

  if (!session || session.expiresAt < new Date()) {
    return { success: false };
  }

  const user = await User.findById(session.userId);

  if (!user) {
    return { success: false };
  }

  return {
    success: true,
    userId: user._id.toString(),
    userEmail: user.email.toString(),
  };
}
