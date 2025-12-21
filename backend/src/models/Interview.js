import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema(
  {
    channelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel",
      required: [true, "Channel ID is required"],
    },
    programId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Program",
      required: [true, "Program ID is required"],
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
    content: {
      public_id: {
        type: String,
        required: [true, "Video public_id is required"],
      },
      url: {
        type: String,
        required: [true, "Video URL is required"],
      },
      resource_type: {
        type: String,
        default: "video",
      },
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Interview", interviewSchema);

