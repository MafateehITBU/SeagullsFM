import mongoose from "mongoose";

const channelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Channel name is required"],
      trim: true,
      maxlength: [100, "Channel name cannot exceed 100 characters"],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Channel", channelSchema);
