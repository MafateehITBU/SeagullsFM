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
    let { channelId, title, description, days, startTime, endTime } = req.body;

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
    // Handle days - can be array or string (for backward compatibility)
    let daysArray = days;
    if (typeof days === "string") {
      try {
        // Try to parse as JSON array
        daysArray = JSON.parse(days);
      } catch {
        // If not JSON, treat as single day and convert to array
        daysArray = [days.replace(/^["']|["']$/g, "").trim()];
      }
    }
    if (!Array.isArray(daysArray)) {
      daysArray = [daysArray];
    }
    // Clean each day string
    daysArray = daysArray.map(day => {
      if (typeof day === "string") {
        return day.replace(/^["']|["']$/g, "").trim();
      }
      return day;
    }).filter(day => day); // Remove empty values
    if (typeof startTime === "string") {
      startTime = startTime.replace(/^["']|["']$/g, "").trim();
    }
    if (typeof endTime === "string") {
      endTime = endTime.replace(/^["']|["']$/g, "").trim();
    }

    // Validation
    if (!channelId || !title || !description || !daysArray || daysArray.length === 0 || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "Please provide channelId, title, description, days (array), startTime, and endTime",
      });
    }

    // Images are required
    if (!req.files || !req.files.image || !req.files.image[0]) {
      return res.status(400).json({
        success: false,
        message: "Image is required",
      });
    }

    if (!req.files.programDetailsImage || !req.files.programDetailsImage[0]) {
      return res.status(400).json({
        success: false,
        message: "Program details image is required",
      });
    }

    if (description.length > 500) {
      return res.status(400).json({
        success: false,
        message: "Description cannot exceed 500 characters",
      });
    }

    // Validate days
    const validDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const invalidDays = daysArray.filter(day => !validDays.includes(day));
    if (invalidDays.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid days: ${invalidDays.join(", ")}. Days must be one or more of: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday`,
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

    // Check if channelId is a valid channel
    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(400).json({
        success: false,
        message: "Invalid channelId. Channel does not exist.",
      });
    }

    // Upload images to Cloudinary (required)
    let imageResult;
    let programDetailsImageResult;
    
    try {
      // Upload main image
      imageResult = await cloudinary.uploader.upload(req.files.image[0].path, {
        folder: "seagulls/programs",
        width: 800,
        crop: "scale",
      });
      fs.unlinkSync(req.files.image[0].path);

      // Upload program details image
      programDetailsImageResult = await cloudinary.uploader.upload(req.files.programDetailsImage[0].path, {
        folder: "seagulls/programs/details",
        width: 800,
        crop: "scale",
      });
      fs.unlinkSync(req.files.programDetailsImage[0].path);
    } catch (uploadError) {
      // Clean up uploaded files on error
      if (req.files?.image?.[0]) fs.unlinkSync(req.files.image[0].path);
      if (req.files?.programDetailsImage?.[0]) fs.unlinkSync(req.files.programDetailsImage[0].path);
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
      programDetailsImage: {
        public_id: programDetailsImageResult.public_id,
        url: programDetailsImageResult.secure_url,
      },
      description,
      days: daysArray,
      startTime,
      endTime,
    });

    await program.save();

    res.status(201).json({
      success: true,
      message: "Program created successfully",
      data: program,
    });
  } catch (error) {
    // Clean up uploaded files on error
    if (req.files?.image?.[0]) fs.unlinkSync(req.files.image[0].path);
    if (req.files?.programDetailsImage?.[0]) fs.unlinkSync(req.files.programDetailsImage[0].path);
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
    let { channelId, title, description, days, startTime, endTime } = req.body;

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
    // Handle days - can be array or string (for backward compatibility)
    let daysArray = days;
    if (days !== undefined) {
      if (typeof days === "string") {
        try {
          // Try to parse as JSON array
          daysArray = JSON.parse(days);
        } catch {
          // If not JSON, treat as single day and convert to array
          daysArray = [days.replace(/^["']|["']$/g, "").trim()];
        }
      }
      if (!Array.isArray(daysArray)) {
        daysArray = [daysArray];
      }
      // Clean each day string
      daysArray = daysArray.map(day => {
        if (typeof day === "string") {
          return day.replace(/^["']|["']$/g, "").trim();
        }
        return day;
      }).filter(day => day); // Remove empty values
    }
    if (typeof startTime === "string") {
      startTime = startTime.replace(/^["']|["']$/g, "").trim();
    }
    if (typeof endTime === "string") {
      endTime = endTime.replace(/^["']|["']$/g, "").trim();
    }

    const updateData = {};

    // Validation for provided fields
    if (title) {
      updateData.title = title;
    }

    if (description !== undefined) {
      if (description.length > 500) {
        return res.status(400).json({
          success: false,
          message: "Description cannot exceed 500 characters",
        });
      }
      updateData.description = description;
    }

    if (daysArray && daysArray.length > 0) {
      const validDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
      const invalidDays = daysArray.filter(day => !validDays.includes(day));
      if (invalidDays.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid days: ${invalidDays.join(", ")}. Days must be one or more of: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday`,
        });
      }
      updateData.days = daysArray;
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

    // Handle image uploads if provided
    if (req.files?.image?.[0]) {
      try {
        // Delete old image from cloudinary if exists
        if (program.image && program.image.public_id) {
          await cloudinary.uploader.destroy(program.image.public_id);
        }

        const result = await cloudinary.uploader.upload(req.files.image[0].path, {
          folder: "seagulls/programs",
          width: 800,
          crop: "scale",
        });

        program.image = {
          public_id: result.public_id,
          url: result.secure_url,
        };
        await program.save();

        fs.unlinkSync(req.files.image[0].path);
      } catch (uploadError) {
        if (req.files?.image?.[0]) fs.unlinkSync(req.files.image[0].path);
        console.error("Image upload error:", uploadError);
        return res.status(500).json({
          success: false,
          message: "Error uploading image",
          error: uploadError.message,
        });
      }
    }

    // Handle programDetailsImage upload if provided
    if (req.files?.programDetailsImage?.[0]) {
      try {
        // Delete old programDetailsImage from cloudinary if exists
        if (program.programDetailsImage && program.programDetailsImage.public_id) {
          await cloudinary.uploader.destroy(program.programDetailsImage.public_id);
        }

        const result = await cloudinary.uploader.upload(req.files.programDetailsImage[0].path, {
          folder: "seagulls/programs/details",
          width: 800,
          crop: "scale",
        });

        program.programDetailsImage = {
          public_id: result.public_id,
          url: result.secure_url,
        };
        await program.save();

        fs.unlinkSync(req.files.programDetailsImage[0].path);
      } catch (uploadError) {
        if (req.files?.programDetailsImage?.[0]) fs.unlinkSync(req.files.programDetailsImage[0].path);
        console.error("Program details image upload error:", uploadError);
        return res.status(500).json({
          success: false,
          message: "Error uploading program details image",
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
    // Clean up uploaded files on error
    if (req.files?.image?.[0]) fs.unlinkSync(req.files.image[0].path);
    if (req.files?.programDetailsImage?.[0]) fs.unlinkSync(req.files.programDetailsImage[0].path);
    res.status(500).json({
      success: false,
      message: "Error updating program",
      error: error.message,
    });
  }
};

// @desc    Toggle Active Status
// @route   PUT /api/program/:id/toggle-active
// @access  Private
export const toggleActive = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if Program exists
    const program = await Program.findById(id);
    if (!program) {
      return res.status(404).json({ message: "Program not found" });
    }

    // Toggle verification status
    program.isActive = !program.isActive;
    await program.save();

    return res.status(200).json({
      success: true,
      message: `Program ${
        program.isActive ? "activated" : "deactivated"
      } successfully`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error toggling Program Active Status",
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

    // Delete images from cloudinary if exists
    if (program.image && program.image.public_id) {
      try {
        await cloudinary.uploader.destroy(program.image.public_id);
      } catch (cloudinaryError) {
        console.error("Error deleting image from cloudinary:", cloudinaryError);
      }
    }

    // Delete programDetailsImage from cloudinary if exists
    if (program.programDetailsImage && program.programDetailsImage.public_id) {
      try {
        await cloudinary.uploader.destroy(program.programDetailsImage.public_id);
      } catch (cloudinaryError) {
        console.error("Error deleting program details image from cloudinary:", cloudinaryError);
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

