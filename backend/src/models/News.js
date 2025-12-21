import mongoose from "mongoose";


export const newsSchema = new mongoose.Schema({
    channelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Channel",
        required: true,
    }, 
    title: {
        type: String,
        required: [true, "Title is required"],
        trim: true,
        maxlength: [150, "Title cannot exceed 150 characters"],
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
    description: {
        type: String,
        required: [true, "Description is required"],
        maxlength: [300, "Description cannot exceed 300 characters"],
    },
    content: {
        type: String,
        required: [true, "Content is required"],        
    },
    publishedAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});

export default mongoose.model("News", newsSchema);