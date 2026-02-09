import mongoose from "mongoose";

const programSchema = new mongoose.Schema(
  {
    channelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel",
      required: [true, "Channel ID is required"],
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
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
    programDetailsImage: {
      public_id: {
        type: String,
        required: [true, "Program details image public_id is required"],
      },
      url: {
        type: String,
        required: [true, "Program details image URL is required"],
      },
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    days: {
      type: [String],
      required: [true, "Days are required"],
      validate: {
        validator: function (v) {
          if (!Array.isArray(v) || v.length === 0) {
            return false;
          }
          const validDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
          return v.every(day => validDays.includes(day));
        },
        message: "Days must be an array containing one or more of: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday",
      },
    },
    startTime: {
      type: String,
      required: [true, "Start time is required"],
      trim: true,
      validate: {
        validator: function (v) {
          // Validate time format HH:MM (24-hour format)
          return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
        },
        message: "Start time must be in HH:MM format (24-hour)",
      },
    },
    endTime: {
      type: String,
      required: [true, "End time is required"],
      trim: true,
      validate: {
        validator: function (v) {
          // Validate time format HH:MM (24-hour format)
          return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
        },
        message: "End time must be in HH:MM format (24-hour)",
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Validate that endTime is after startTime
programSchema.pre("save", function (next) {
  if (this.startTime && this.endTime) {
    const [startHours, startMinutes] = this.startTime.split(":").map(Number);
    const [endHours, endMinutes] = this.endTime.split(":").map(Number);
    const startTotal = startHours * 60 + startMinutes;
    const endTotal = endHours * 60 + endMinutes;

    if (endTotal <= startTotal) {
      return next(new Error("End time must be after start time"));
    }
  }
  next();
});

export default mongoose.model("Program", programSchema);

