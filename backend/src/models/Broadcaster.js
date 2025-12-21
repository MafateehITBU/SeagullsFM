import mongoose from "mongoose";

const broadcasterSchema = new mongoose.Schema(
  {
    channelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel",
      required: [true, "Channel ID is required"],
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    image: {
      public_id: {
        type: String,
        required: [true, "Image public_id is required"],
      },
      url: {
        type: String,
        required: [true, "Image URL is required"],
      },
    },
    socialLinks: {
      ig: {
        type: String,
        default: null,
        trim: true,
      },
      FB: {
        type: String,
        default: null,
        trim: true,
      },
      YT: {
        type: String,
        default: null,
        trim: true,
      },
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Broadcaster", broadcasterSchema);

