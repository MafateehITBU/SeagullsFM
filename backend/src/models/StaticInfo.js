import mongoose from "mongoose";

const staticInfoSchema = new mongoose.Schema(
  {
    channelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel",
      required: [true, "Channel ID is required"],
      unique: true, // One static info per channel
    },
    aboutUS: {
      type: String,
      required: [true, "About US is required"],
      trim: true,
    },
    frequency: {
      type: String,
      required: [true, "Frequency is required"],
      trim: true,
    },
    frequencyimg: {
      public_id: {
        type: String,
        required: [true, "Frequency image public_id is required"],
      },
      url: {
        type: String,
        required: [true, "Frequency image URL is required"],
      },
    },
    socialMediaLinks: {
      type: Object,
      required: [true, "Social media links are required"],
    },
    downloadApp: {
      AppStore: {
        type: String,
        required: [true, "App Store link is required"],
        trim: true,
      },
      GooglePlay: {
        type: String,
        required: [true, "Google Play link is required"],
        trim: true,
      },
    },
    metaTags: {
      type: String,
      required: [true, "Meta tags are required"],
      trim: true,
    },
    metaDescription: {
      type: String,
      required: [true, "Meta description is required"],
      trim: true,
    },
    favIcon: {
      public_id: {
        type: String,
        required: [true, "Favicon public_id is required"],
      },
      url: {
        type: String,
        required: [true, "Favicon URL is required"],
      },
      width: {
        type: Number,
        default: null,
      },
      height: {
        type: Number,
        default: null,
      },
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("StaticInfo", staticInfoSchema);

