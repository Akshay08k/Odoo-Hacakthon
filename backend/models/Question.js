import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String, 
      required: true,
    },
    tags: {
      type: [String], 
      default: [],
    },
    isResolved: {
      type: Boolean,
      default: false,
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
    acceptedAnswerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Answer",
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Question", questionSchema);
