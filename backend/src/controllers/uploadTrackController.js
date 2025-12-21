import UploadTrack from "../models/UploadTrack.js";
import ApprovedTrack from "../models/ApprovedTrack.js";
import Channel from "../models/Channel.js";
import User from "../models/User.js";
import Admin from "../models/Admin.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";
import { sendTrackApprovalEmail } from "../utils/trackEmail.js";

// Helper function to get start of current week (Friday)
// Week resets every Friday at 00:00:00
const getWeekStart = () => {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 5 = Friday, 6 = Saturday
  let diff;
  
  if (day === 5) {
    // Today is Friday, check if it's past midnight
    diff = 0;
  } else if (day > 5) {
    // Saturday (6) or later - go back to last Friday
    diff = day - 5;
  } else {
    // Sunday (0) to Thursday (4) - go back to previous Friday
    diff = day + 2; // Sunday(0) -> 2 days back, Monday(1) -> 3 days back, etc.
  }
  
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - diff);
  weekStart.setHours(0, 0, 0, 0);
  return weekStart;
};

// Helper function to check weekly upload limit
const checkWeeklyUploadLimit = async (userId) => {
  const weekStart = getWeekStart();
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);

  const uploadsThisWeek = await UploadTrack.countDocuments({
    userId,
    createdAt: {
      $gte: weekStart,
      $lt: weekEnd,
    },
  });

  return uploadsThisWeek >= 1; // Limit is 1 track per week
};

// @desc    Upload a new track
// @route   POST /api/uploadtrack
// @access  Private (User)
export const uploadTrack = async (req, res) => {
  try {
    // Clean values
    let { channelId, songName, genre } = req.body;
    const userId = req.user.id; // Get from authenticated user

    // Additional cleaning as backup
    if (typeof channelId === "string") {
      channelId = channelId.replace(/^["']|["']$/g, "").trim();
    }
    if (typeof songName === "string") {
      songName = songName.replace(/^["']|["']$/g, "").trim();
    }

    // Validation
    if (!channelId || !songName || !genre) {
      return res.status(400).json({
        success: false,
        message: "Please provide channelId, songName, and genre",
      });
    }

    // Check weekly upload limit
    const hasReachedLimit = await checkWeeklyUploadLimit(userId);
    if (hasReachedLimit) {
      const weekStart = getWeekStart();
      const nextFriday = new Date(weekStart);
      nextFriday.setDate(weekStart.getDate() + 7);
      return res.status(429).json({
        success: false,
        message: "You have reached your weekly upload limit. You can upload 1 track per week. Limit resets on Friday.",
        resetDate: nextFriday,
      });
    }

    // Check if song file is provided
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Song file is required",
      });
    }

    // Parse genre if it's a string
    let genreArray = [];
    if (typeof genre === "string") {
      try {
        genreArray = JSON.parse(genre);
      } catch {
        genreArray = [genre];
      }
    } else if (Array.isArray(genre)) {
      genreArray = genre;
    }

    if (!Array.isArray(genreArray) || genreArray.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Genre must be an array with at least one genre",
      });
    }

    // Check if channelId is valid
    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(400).json({
        success: false,
        message: "Invalid channelId. Channel does not exist.",
      });
    }

    // Determine resource type based on file mimetype
    const isAudio = req.file.mimetype.startsWith("audio/");
    const resourceType = isAudio ? "audio" : "video";

    // Upload file to Cloudinary
    let fileResult;
    try {
      fileResult = await cloudinary.uploader.upload(req.file.path, {
        resource_type: resourceType,
        folder: `seagulls/tracks/${resourceType}`,
        chunk_size: 6000000, // 6MB chunks for large files
      });
      fs.unlinkSync(req.file.path);
    } catch (uploadError) {
      if (req.file) fs.unlinkSync(req.file.path);
      console.error("File upload error:", uploadError);
      return res.status(500).json({
        success: false,
        message: "Error uploading song file",
        error: uploadError.message,
      });
    }

    // Create new upload track
    const uploadTrack = new UploadTrack({
      channelId,
      userId,
      songName,
      songFile: {
        public_id: fileResult.public_id,
        url: fileResult.secure_url,
        resource_type: resourceType,
      },
      genre: genreArray,
      status: "Pending",
    });

    await uploadTrack.save();

    res.status(201).json({
      success: true,
      message: "Track uploaded successfully. It is now pending approval.",
      data: uploadTrack,
    });
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({
      success: false,
      message: "Error uploading track",
      error: error.message,
    });
  }
};

// @desc    Get all upload tracks
// @route   GET /api/uploadtrack
// @access  Private (Admin)
export const getUploadTracks = async (req, res) => {
  try {
    const { status, channelId, userId } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }
    if (channelId) {
      query.channelId = channelId;
    }
    if (userId) {
      query.userId = userId;
    }

    const tracks = await UploadTrack.find(query)
      .populate("channelId", "name")
      .populate("userId", "name email")
      .populate("adminId", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tracks.length,
      data: tracks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching upload tracks",
      error: error.message,
    });
  }
};

// @desc    Get user's own tracks
// @route   GET /api/uploadtrack/my-tracks
// @access  Private (User)
export const getMyTracks = async (req, res) => {
  try {
    const tracks = await UploadTrack.find({ userId: req.user.id })
      .populate("channelId", "name")
      .populate("adminId", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tracks.length,
      data: tracks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching your tracks",
      error: error.message,
    });
  }
};

// @desc    Get single upload track by ID
// @route   GET /api/uploadtrack/:id
// @access  Private (Admin or Track Owner)
export const getUploadTrackById = async (req, res) => {
  try {
    const track = await UploadTrack.findById(req.params.id)
      .populate("channelId", "name")
      .populate("userId", "name email")
      .populate("adminId", "name");

    if (!track) {
      return res.status(404).json({
        success: false,
        message: "Track not found",
      });
    }

    // Check if user is admin or track owner
    if (req.user.role !== "admin" && req.user.role !== "superadmin" && track.userId._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this track",
      });
    }

    res.status(200).json({
      success: true,
      data: track,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching track",
      error: error.message,
    });
  }
};

// @desc    Update track status (Admin only)
// @route   PUT /api/uploadtrack/:id/status
// @access  Private (Admin)
export const updateTrackStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const adminId = req.user.id;

    // Validation
    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const validStatuses = ["Pending", "Checked", "Approved", "Declined"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const track = await UploadTrack.findById(req.params.id)
      .populate("userId", "email name")
      .populate("channelId", "name");

    if (!track) {
      return res.status(404).json({
        success: false,
        message: "Track not found",
      });
    }

    // Update track status
    track.status = status;
    track.adminId = adminId;
    await track.save();

    res.status(200).json({
      success: true,
      message: `Track status updated to ${status}`,
      data: track,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating track status",
      error: error.message,
    });
  }
};

// @desc    Approve track and schedule streaming (Admin only)
// @route   POST /api/uploadtrack/:id/approve
// @access  Private (Admin)
export const approveTrack = async (req, res) => {
  try {
    const { date, time } = req.body;
    const adminId = req.user.id;

    // Validation
    if (!date || !time) {
      return res.status(400).json({
        success: false,
        message: "Date and time are required",
      });
    }

    // Validate time format
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time)) {
      return res.status(400).json({
        success: false,
        message: "Time must be in HH:MM format (24-hour)",
      });
    }

    // Validate date
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format",
      });
    }

    // Check if date is in the future
    if (dateObj < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Date must be in the future",
      });
    }

    const track = await UploadTrack.findById(req.params.id)
      .populate("userId", "email name")
      .populate("channelId", "name");

    if (!track) {
      return res.status(404).json({
        success: false,
        message: "Track not found",
      });
    }

    // Check if track is already approved
    if (track.status === "Approved") {
      return res.status(400).json({
        success: false,
        message: "Track is already approved",
      });
    }

    // Update track status
    track.status = "Approved";
    track.adminId = adminId;
    await track.save();

    // Create approved track entry
    const approvedTrack = new ApprovedTrack({
      channelId: track.channelId._id,
      trackId: track._id,
      date: dateObj,
      time,
    });

    await approvedTrack.save();

    // Send email notification to user
    try {
      await sendTrackApprovalEmail(
        track.userId.email,
        track.songName,
        dateObj,
        time,
        track.channelId.name
      );
    } catch (emailError) {
      console.error("Error sending approval email:", emailError);
      // Don't fail the request if email fails
    }

    res.status(200).json({
      success: true,
      message: "Track approved and scheduled successfully. User has been notified via email.",
      data: {
        track,
        approvedTrack,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error approving track",
      error: error.message,
    });
  }
};

// @desc    Delete upload track
// @route   DELETE /api/uploadtrack/:id
// @access  Private (Admin or Track Owner)
export const deleteUploadTrack = async (req, res) => {
  try {
    const track = await UploadTrack.findById(req.params.id);

    if (!track) {
      return res.status(404).json({
        success: false,
        message: "Track not found",
      });
    }

    // Check if user is admin or track owner
    if (req.user.role !== "admin" && req.user.role !== "superadmin" && track.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this track",
      });
    }

    // Delete file from cloudinary
    if (track.songFile && track.songFile.public_id) {
      try {
        await cloudinary.uploader.destroy(track.songFile.public_id, {
          resource_type: track.songFile.resource_type || "video",
        });
      } catch (cloudinaryError) {
        console.error("Error deleting file from cloudinary:", cloudinaryError);
      }
    }

    // Delete approved track entry if exists
    await ApprovedTrack.findOneAndDelete({ trackId: track._id });

    // Delete upload track
    await UploadTrack.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Track deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting track",
      error: error.message,
    });
  }
};

// @desc    Get approved tracks
// @route   GET /api/uploadtrack/approved/list
// @access  Public
export const getApprovedTracks = async (req, res) => {
  try {
    const { channelId, date } = req.query;
    const query = {};

    if (channelId) {
      query.channelId = channelId;
    }
    if (date) {
      const dateObj = new Date(date);
      dateObj.setHours(0, 0, 0, 0);
      const nextDay = new Date(dateObj);
      nextDay.setDate(dateObj.getDate() + 1);
      query.date = {
        $gte: dateObj,
        $lt: nextDay,
      };
    }

    const approvedTracks = await ApprovedTrack.find(query)
      .populate("channelId", "name")
      .populate({
        path: "trackId",
        populate: {
          path: "userId",
          select: "name email",
        },
      })
      .sort({ date: 1, time: 1 });

    res.status(200).json({
      success: true,
      count: approvedTracks.length,
      data: approvedTracks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching approved tracks",
      error: error.message,
    });
  }
};

