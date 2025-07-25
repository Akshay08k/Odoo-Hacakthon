import mongoose from "mongoose";
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    profile: String,
    avatarUrl: String,
    role: { type: String, enum: ["guest", "user", "admin"], default: "user" },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
