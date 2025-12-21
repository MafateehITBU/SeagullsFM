import mongoose from "mongoose";

const uploadTrackSchema = new mongoose.Schema(
  {
    channelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel",
      required: [true, "Channel ID is required"],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    songName: {
      type: String,
      required: [true, "Song name is required"],
      trim: true,
    },
    songFile: {
      public_id: {
        type: String,
        required: [true, "Song file public_id is required"],
      },
      url: {
        type: String,
        required: [true, "Song file URL is required"],
      },
      resource_type: {
        type: String,
        default: "video", // Can be "video" or "audio"
      },
    },
    genre: {
      type: [String],
      required: [true, "Genre is required"],
      validate: {
        validator: function (genres) {
          const validGenres = [
            "Pop",
            "Rock",
            "Hip Hop",
            "Rap",
            "R&B",
            "Country",
            "Jazz",
            "Classical",
            "Electronic",
            "Dance",
            "Reggae",
            "Blues",
            "Folk",
            "Metal",
            "Punk",
            "Alternative",
            "Indie",
            "Latin",
            "World",
            "Gospel",
            "Soul",
            "Funk",
            "Disco",
            "House",
            "Techno",
            "Trance",
            "Dubstep",
            "Ambient",
            "Other",
          ];
          return genres.every((genre) => validGenres.includes(genre));
        },
        message: "Invalid genre. Please select from the allowed genres.",
      },
    },
    status: {
      type: String,
      enum: {
        values: ["Pending", "Checked", "Approved", "Declined"],
        message: "Status must be one of: Pending, Checked, Approved, Declined",
      },
      default: "Pending",
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("UploadTrack", uploadTrackSchema);

