import Interview from "../models/Interview.js";
import Channel from "../models/Channel.js";
import Program from "../models/Program.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";

// @desc    Create a new interview
// @route   POST /api/interview
// @access  Private (Admin)
export const createInterview = async (req, res) => {
  try {
    // Clean values (remove quotes if present)
    let { channelId, programId, title, date, description } = req.body;

    // Additional cleaning as backup
    if (typeof channelId === "string") {
      channelId = channelId.replace(/^["']|["']$/g, "").trim();
    }
    if (typeof programId === "string") {
      programId = programId.replace(/^["']|["']$/g, "").trim();
    }
    if (typeof title === "string") {
      title = title.replace(/^["']|["']$/g, "").trim();
    }
    if (typeof date === "string") {
      date = date.replace(/^["']|["']$/g, "").trim();
    }
    if (typeof description === "string") {
      description = description.replace(/^["']|["']$/g, "").trim();
    }

    // Validation
    if (!channelId || !programId || !title || !date || !description) {
      return res.status(400).json({
        success: false,
        message: "Please provide channelId, programId, title, date, and description",
      });
    }

    // Video content is required
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Video content is required",
      });
    }

    // Validate date format
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Please use a valid date (YYYY-MM-DD or ISO format)",
      });
    }

    // Check if channelId is a valid channel
    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(400).json({
        success: false,
        message: "Invalid channelId. Channel does not exist.",
      });
    }

    // Check if programId is a valid program
    const program = await Program.findById(programId);
    if (!program) {
      return res.status(400).json({
        success: false,
        message: "Invalid programId. Program does not exist.",
      });
    }

    // Verify program belongs to the same channel
    if (program.channelId.toString() !== channelId) {
      return res.status(400).json({
        success: false,
        message: "Program does not belong to the specified channel",
      });
    }

    // Upload video to Cloudinary (required)
    let videoResult;
    try {
      videoResult = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "video",
        folder: "seagulls/interviews",
        chunk_size: 6000000, // 6MB chunks for large videos
      });
      fs.unlinkSync(req.file.path);
    } catch (uploadError) {
      if (req.file) fs.unlinkSync(req.file.path);
      console.error("Video upload error:", uploadError);
      return res.status(500).json({
        success: false,
        message: "Error uploading video",
        error: uploadError.message,
      });
    }

    // Create new interview
    const interview = new Interview({
      channelId,
      programId,
      title,
      date: dateObj,
      content: {
        public_id: videoResult.public_id,
        url: videoResult.secure_url,
        resource_type: videoResult.resource_type,
      },
      description,
    });

    await interview.save();

    res.status(201).json({
      success: true,
      message: "Interview created successfully",
      data: interview,
    });
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({
      success: false,
      message: "Error creating interview",
      error: error.message,
    });
  }
};

// @desc    Get all interviews
// @route   GET /api/interview
// @access  Public
export const getInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find()
      .populate("channelId", "name")
      .populate("programId", "title");
    res.status(200).json({
      success: true,
      count: interviews.length,
      data: interviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching interviews",
      error: error.message,
    });
  }
};

// @desc    Get a single interview by ID
// @route   GET /api/interview/:id
// @access  Public
export const getInterviewById = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id)
      .populate("channelId", "name")
      .populate("programId", "title");
    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }
    res.status(200).json({
      success: true,
      data: interview,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching interview",
      error: error.message,
    });
  }
};

// @desc    Update an interview by ID
// @route   PUT /api/interview/:id
// @access  Private (Admin)
export const updateInterview = async (req, res) => {
  try {
    // Clean values
    let { channelId, programId, title, date, description } = req.body;

    // Additional cleaning as backup
    if (typeof channelId === "string") {
      channelId = channelId.replace(/^["']|["']$/g, "").trim();
    }
    if (typeof programId === "string") {
      programId = programId.replace(/^["']|["']$/g, "").trim();
    }
    if (typeof title === "string") {
      title = title.replace(/^["']|["']$/g, "").trim();
    }
    if (typeof date === "string") {
      date = date.replace(/^["']|["']$/g, "").trim();
    }
    if (typeof description === "string") {
      description = description.replace(/^["']|["']$/g, "").trim();
    }

    const updateData = {};

    // Validation for provided fields
    if (title) {
      updateData.title = title;
    }

    if (description !== undefined) {
      updateData.description = description;
    }

    if (date) {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid date format. Please use a valid date (YYYY-MM-DD or ISO format)",
        });
      }
      updateData.date = dateObj;
    }

    if (channelId) {
      // Check if channelId is a valid channel
      const channel = await Channel.findById(channelId);
      if (!channel) {
        return res.status(400).json({
          success: false,
          message: "Invalid channelId. Channel does not exist.",
        });
      }
      updateData.channelId = channelId;
    }

    if (programId) {
      // Check if programId is a valid program
      const program = await Program.findById(programId);
      if (!program) {
        return res.status(400).json({
          success: false,
          message: "Invalid programId. Program does not exist.",
        });
      }
      updateData.programId = programId;

      // If channelId is also being updated, verify program belongs to channel
      // Otherwise, verify program belongs to existing interview's channel
      const existingInterview = await Interview.findById(req.params.id);
      const checkChannelId = updateData.channelId || (existingInterview && existingInterview.channelId.toString());
      
      if (checkChannelId && program.channelId.toString() !== checkChannelId) {
        return res.status(400).json({
          success: false,
          message: "Program does not belong to the specified channel",
        });
      }
    }

    const interview = await Interview.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    // Handle video upload if provided
    if (req.file) {
      try {
        // Delete old video from cloudinary if exists
        if (interview.content && interview.content.public_id) {
          await cloudinary.uploader.destroy(interview.content.public_id, {
            resource_type: "video",
          });
        }

        const result = await cloudinary.uploader.upload(req.file.path, {
          resource_type: "video",
          folder: "seagulls/interviews",
          chunk_size: 6000000, // 6MB chunks for large videos
        });

        interview.content = {
          public_id: result.public_id,
          url: result.secure_url,
          resource_type: result.resource_type,
        };
        await interview.save();

        fs.unlinkSync(req.file.path);
      } catch (uploadError) {
        if (req.file) fs.unlinkSync(req.file.path);
        console.error("Video upload error:", uploadError);
        return res.status(500).json({
          success: false,
          message: "Error uploading video",
          error: uploadError.message,
        });
      }
    }

    res.status(200).json({
      success: true,
      message: "Interview updated successfully",
      data: interview,
    });
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({
      success: false,
      message: "Error updating interview",
      error: error.message,
    });
  }
};

// @desc    Delete an interview by ID
// @route   DELETE /api/interview/:id
// @access  Private (Admin)
export const deleteInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    // Delete video from cloudinary if exists
    if (interview.content && interview.content.public_id) {
      try {
        await cloudinary.uploader.destroy(interview.content.public_id, {
          resource_type: "video",
        });
      } catch (cloudinaryError) {
        console.error("Error deleting video from cloudinary:", cloudinaryError);
      }
    }

    await Interview.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Interview deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting interview",
      error: error.message,
    });
  }
};

