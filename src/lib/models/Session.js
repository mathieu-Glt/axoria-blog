import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 }, // suppression de la session automatiquement qd la date d'expiration sera expiré
  },
});

export const Session =
  mongoose.models?.Session || mongoose.model("Session", sessionSchema);
