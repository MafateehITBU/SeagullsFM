import mongoose from "mongoose";

export const eventSchema = new mongoose.Schema(
  {
    channelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel",
    },
    type: {
      type: String,
      enum: {
        values: ["event", "partnership"],
        message: "Type must be either 'event' or 'partnership'",
      },
      required: [true, "Event type is required"],
    },
    title: {
      type: String,
      required: [true, "Event title is required"],
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Event description is required"],
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    startDate: {
      type: Date,
      required: [true, "Event date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "Event end date is required"],
    },
    address: {
      type: String,
      required: [true, "Event address is required"],
      maxlength: [300, "Address cannot exceed 300 characters"],
    },
    image: {
      public_id: {
        type: String,
        default: null,
      },
      url: {
        type: String,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Event", eventSchema);
