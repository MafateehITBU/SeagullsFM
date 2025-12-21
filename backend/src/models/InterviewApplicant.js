import mongoose from "mongoose";
import { parsePhoneNumberFromString } from "libphonenumber-js";

const interviewApplicantSchema = new mongoose.Schema(
  {
    channelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      validate: {
        validator: function (v) {
          if (!v) return false;
          const phoneNumber = parsePhoneNumberFromString(v);
          return phoneNumber ? phoneNumber.isValid() : false;
        },
        message: "Please enter a valid international phone number",
      },
    },
    topic: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, "Topic cannot exceed 100 characters"],
    },
    socialLinks: {
      ig: {
        type: String,
        trim: true,
        default: null,
      },
      fb: {
        type: String,
        trim: true,
        default: null,
      },
      twitter: {
        type: String,
        trim: true,
        default: null,
      },
    },
    job: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, "Job cannot exceed 100 characters"],
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("InterviewApplicant", interviewApplicantSchema);
