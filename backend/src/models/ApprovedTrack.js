import mongoose from "mongoose";

const approvedTrackSchema = new mongoose.Schema(
  {
    channelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel",
      required: [true, "Channel ID is required"],
    },
    trackId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UploadTrack",
      required: [true, "Track ID is required"],
      unique: true, // One approved track entry per track
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
    time: {
      type: String,
      required: [true, "Time is required"],
      trim: true,
      validate: {
        validator: function (v) {
          // Validate time format HH:MM (24-hour format)
          return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
        },
        message: "Time must be in HH:MM format (24-hour)",
      },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("ApprovedTrack", approvedTrackSchema);

