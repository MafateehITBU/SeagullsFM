import Program from "../models/Program.js";
import Channel from "../models/Channel.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";

// @desc    Create a new program
// @route   POST /api/program
// @access  Private (Admin)
export const createProgram = async (req, res) => {
  try {
    // Clean values (remove quotes if present)
    let { channelId, title, description, day, startTime, endTime, status } = req.body;

    // Additional cleaning as backup
    if (typeof channelId === "string") {
      channelId = channelId.replace(/^["']|["']$/g, "").trim();
    }
    if (typeof title === "string") {
      title = title.replace(/^["']|["']$/g, "").trim();
    }
    if (typeof description === "string") {
      description = description.replace(/^["']|["']$/g, "").trim();
    }
    if (typeof day === "string") {
      day = day.replace(/^["']|["']$/g, "").trim();
    }
    if (typeof startTime === "string") {
      startTime = startTime.replace(/^["']|["']$/g, "").trim();
    }
    if (typeof endTime === "string") {
      endTime = endTime.replace(/^["']|["']$/g, "").trim();
    }
    if (typeof status === "string") {
      status = status.replace(/^["']|["']$/g, "").trim();
    }

    // Validation
    if (!channelId || !title || !description || !day || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "Please provide channelId, title, description, day, startTime, and endTime",
      });
    }

    // Image is required
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image is required",
      });
    }

    if (description.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Description cannot exceed 100 characters",
      });
    }

    // Validate day
    const validDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    if (!validDays.includes(day)) {
      return res.status(400).json({
        success: false,
        message: "Day must be one of: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday",
      });
    }

    // Validate time format
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(startTime)) {
      return res.status(400).json({
        success: false,
        message: "Start time must be in HH:MM format (24-hour)",
      });
    }
    if (!timeRegex.test(endTime)) {
      return res.status(400).json({
        success: false,
        message: "End time must be in HH:MM format (24-hour)",
      });
    }

    // Validate that endTime is after startTime
    const [startHours, startMinutes] = startTime.split(":").map(Number);
    const [endHours, endMinutes] = endTime.split(":").map(Number);
    const startTotal = startHours * 60 + startMinutes;
    const endTotal = endHours * 60 + endMinutes;

    if (endTotal <= startTotal) {
      return res.status(400).json({
        success: false,
        message: "End time must be after start time",
      });
    }

    // Validate status
    if (status && !["active", "inactive"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be either 'active' or 'inactive'",
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

    // Upload image to Cloudinary (required)
    let imageResult;
    try {
      imageResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "seagulls/programs",
        width: 800,
        crop: "scale",
      });
      fs.unlinkSync(req.file.path);
    } catch (uploadError) {
      if (req.file) fs.unlinkSync(req.file.path);
      console.error("Image upload error:", uploadError);
      return res.status(500).json({
        success: false,
        message: "Error uploading image",
        error: uploadError.message,
      });
    }

    // Create new program
    const program = new Program({
      channelId,
      title,
      image: {
        public_id: imageResult.public_id,
        url: imageResult.secure_url,
      },
      description,
      day,
      startTime,
      endTime,
      status: status || "active",
    });

    await program.save();

    res.status(201).json({
      success: true,
      message: "Program created successfully",
      data: program,
    });
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({
      success: false,
      message: "Error creating program",
      error: error.message,
    });
  }
};

// @desc    Get all programs
// @route   GET /api/program
// @access  Public
export const getPrograms = async (req, res) => {
  try {
    const programs = await Program.find().populate("channelId", "name");
    res.status(200).json({
      success: true,
      count: programs.length,
      data: programs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching programs",
      error: error.message,
    });
  }
};

// @desc    Get a single program by ID
// @route   GET /api/program/:id
// @access  Public
export const getProgramById = async (req, res) => {
  try {
    const program = await Program.findById(req.params.id).populate("channelId", "name");
    if (!program) {
      return res.status(404).json({
        success: false,
        message: "Program not found",
      });
    }
    res.status(200).json({
      success: true,
      data: program,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching program",
      error: error.message,
    });
  }
};

// @desc    Update a program by ID
// @route   PUT /api/program/:id
// @access  Private (Admin)
export const updateProgram = async (req, res) => {
  try {
    // Clean values
    let { channelId, title, description, day, startTime, endTime, status } = req.body;

    // Additional cleaning as backup
    if (typeof channelId === "string") {
      channelId = channelId.replace(/^["']|["']$/g, "").trim();
    }
    if (typeof title === "string") {
      title = title.replace(/^["']|["']$/g, "").trim();
    }
    if (typeof description === "string") {
      description = description.replace(/^["']|["']$/g, "").trim();
    }
    if (typeof day === "string") {
      day = day.replace(/^["']|["']$/g, "").trim();
    }
    if (typeof startTime === "string") {
      startTime = startTime.replace(/^["']|["']$/g, "").trim();
    }
    if (typeof endTime === "string") {
      endTime = endTime.replace(/^["']|["']$/g, "").trim();
    }
    if (typeof status === "string") {
      status = status.replace(/^["']|["']$/g, "").trim();
    }

    const updateData = {};

    // Validation for provided fields
    if (title) {
      updateData.title = title;
    }

    if (description !== undefined) {
      if (description.length > 100) {
        return res.status(400).json({
          success: false,
          message: "Description cannot exceed 100 characters",
        });
      }
      updateData.description = description;
    }

    if (day) {
      const validDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
      if (!validDays.includes(day)) {
        return res.status(400).json({
          success: false,
          message: "Day must be one of: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday",
        });
      }
      updateData.day = day;
    }

    if (startTime) {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(startTime)) {
        return res.status(400).json({
          success: false,
          message: "Start time must be in HH:MM format (24-hour)",
        });
      }
      updateData.startTime = startTime;
    }

    if (endTime) {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(endTime)) {
        return res.status(400).json({
          success: false,
          message: "End time must be in HH:MM format (24-hour)",
        });
      }
      updateData.endTime = endTime;
    }

    // Validate that endTime is after startTime (if both are provided)
    if (updateData.startTime && updateData.endTime) {
      const [startHours, startMinutes] = updateData.startTime.split(":").map(Number);
      const [endHours, endMinutes] = updateData.endTime.split(":").map(Number);
      const startTotal = startHours * 60 + startMinutes;
      const endTotal = endHours * 60 + endMinutes;

      if (endTotal <= startTotal) {
        return res.status(400).json({
          success: false,
          message: "End time must be after start time",
        });
      }
    } else if (updateData.startTime || updateData.endTime) {
      // If only one time is being updated, get the other from existing program
      const existingProgram = await Program.findById(req.params.id);
      if (existingProgram) {
        const checkStartTime = updateData.startTime || existingProgram.startTime;
        const checkEndTime = updateData.endTime || existingProgram.endTime;
        const [startHours, startMinutes] = checkStartTime.split(":").map(Number);
        const [endHours, endMinutes] = checkEndTime.split(":").map(Number);
        const startTotal = startHours * 60 + startMinutes;
        const endTotal = endHours * 60 + endMinutes;

        if (endTotal <= startTotal) {
          return res.status(400).json({
            success: false,
            message: "End time must be after start time",
          });
        }
      }
    }

    if (status !== undefined) {
      if (!["active", "inactive"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Status must be either 'active' or 'inactive'",
        });
      }
      updateData.status = status;
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

    const program = await Program.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!program) {
      return res.status(404).json({
        success: false,
        message: "Program not found",
      });
    }

    // Handle image upload if provided
    if (req.file) {
      try {
        // Delete old image from cloudinary if exists
        if (program.image && program.image.public_id) {
          await cloudinary.uploader.destroy(program.image.public_id);
        }

        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "seagulls/programs",
          width: 800,
          crop: "scale",
        });

        program.image = {
          public_id: result.public_id,
          url: result.secure_url,
        };
        await program.save();

        fs.unlinkSync(req.file.path);
      } catch (uploadError) {
        if (req.file) fs.unlinkSync(req.file.path);
        console.error("Image upload error:", uploadError);
        return res.status(500).json({
          success: false,
          message: "Error uploading image",
          error: uploadError.message,
        });
      }
    }

    res.status(200).json({
      success: true,
      message: "Program updated successfully",
      data: program,
    });
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({
      success: false,
      message: "Error updating program",
      error: error.message,
    });
  }
};

// @desc    Delete a program by ID
// @route   DELETE /api/program/:id
// @access  Private (Admin)
export const deleteProgram = async (req, res) => {
  try {
    const program = await Program.findById(req.params.id);

    if (!program) {
      return res.status(404).json({
        success: false,
        message: "Program not found",
      });
    }

    // Delete image from cloudinary if exists
    if (program.image && program.image.public_id) {
      try {
        await cloudinary.uploader.destroy(program.image.public_id);
      } catch (cloudinaryError) {
        console.error("Error deleting image from cloudinary:", cloudinaryError);
      }
    }

    await Program.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Program deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting program",
      error: error.message,
    });
  }
};

