import Event from "../models/Event.js";
import Channel from "../models/Channel.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";

// @desc    Create a new event
// @route   POST /api/events
// @access  Private (Admin, SuperAdmin)
export const createEvent = async (req, res) => {
  try {
    const { channelId, type, title, description, startDate, endDate, address } =
      req.body;

    // Validations
    if (
      !channelId ||
      !type ||
      !title ||
      !description ||
      !startDate ||
      !endDate ||
      !address
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (title.length > 200) {
      return res.status(400).json({
        success: false,
        message: "Title cannot exceed 200 characters",
      });
    }
    if (description.length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Description cannot exceed 1000 characters",
      });
    }
    if (address.length > 300) {
      return res.status(400).json({
        success: false,
        message: "Address cannot exceed 300 characters",
      });
    }

    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({
        success: false,
        message: "Channel not found",
      });
    }

    // Create new event
    const newEvent = new Event({
      channelId,
      type,
      title,
      description,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      address,
    });

    // Handle image upload if file is provided
    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "seagulls/events",
        });
        newEvent.image = {
          public_id: result.public_id,
          url: result.secure_url,
        };
        await newEvent.save();
        // Remove file from server after upload
        fs.unlinkSync(req.file.path);
      } catch (uploadError) {
        return res.status(500).json({
          success: false,
          message: "Image upload failed",
          error: uploadError.message,
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "Event image is required",
      });
    }

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: newEvent,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating event",
      error: error.message,
    });
  }
};

// @desc    Get all events
// @route   GET /api/events
// @access  Public
export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().populate("channelId", "name");
    res.status(200).json({
      success: true,
      message: "Events fetched successfully",
      data: events,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching events",
      error: error.message,
    });
  }
};

// @desc    Get event by ID
// @route   GET /api/events/:id
// @access  Public
export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate(
      "channelId",
      "name"
    );
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Event fetched successfully",
      data: event,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching event",
      error: error.message,
    });
  }
};

// @desc Update an event
// @route PUT /api/events/:id
// @access Private (Admin, SuperAdmin)
export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    const { type, title, description, startDate, endDate, address } = req.body;

    const updatedData = {};

    if (type) updatedData.type = type;
    if (title) {
      if (title.length > 200) {
        return res.status(400).json({
          message: "Title cannot exceed 200 characters",
        });
      }
      updatedData.title = title;
    }

    if (description) {
      if (description.length > 1000) {
        return res.status(400).json({
          message: "Description cannot exceed 1000 characters",
        });
      }
      updatedData.description = description;
    }

    if (startDate) updatedData.startDate = new Date(startDate);
    if (endDate) updatedData.endDate = new Date(endDate);
    if (address) {
      if (address.length > 300) {
        return res.status(400).json({
          message: "Address cannot exceed 300 characters",
        });
      }
      updatedData.address = address;
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      updatedData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedEvent) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Handle image update if new file is provided
    if (req.file) {
      try {
        // Delete old image from Cloudinary if exists
        if (event.image && event.image.public_id) {
          await cloudinary.uploader.destroy(event.image.public_id);
        }
        // Upload new image
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "seagulls/events",
        });
        updatedEvent.image = {
          public_id: result.public_id,
          url: result.secure_url,
        };
        await updatedEvent.save();
        // Remove file from server after upload
        fs.unlinkSync(req.file.path);
      } catch (uploadError) {
        return res.status(500).json({
          message: "Image upload failed",
          error: uploadError.message,
        });
      }
    }

    res.status(200).json({
      success: true,
      message: "Event updated successfully",
      data: updatedEvent,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating event",
      error: error.message,
    });
  }
};

// @desc Delete an event
// @route DELETE /api/events/:id
// @access Private (Admin, SuperAdmin)
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    // Delete image from Cloudinary if exists
    if (event.image && event.image.public_id) {
      await cloudinary.uploader.destroy(event.image.public_id);
    }
    await Event.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting event",
      error: error.message,
    });
  }
};
