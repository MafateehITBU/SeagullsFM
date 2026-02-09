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

    // Validate coverImage is required
    if (!req.files || !req.files.coverImage || !req.files.coverImage[0]) {
      return res.status(400).json({
        success: false,
        message: "Cover image is required",
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

    // Handle coverImage upload
    try {
      const coverImageResult = await cloudinary.uploader.upload(
        req.files.coverImage[0].path,
        {
          folder: "seagulls/events/cover",
        }
      );
      newEvent.coverImage = {
        public_id: coverImageResult.public_id,
        url: coverImageResult.secure_url,
      };
      fs.unlinkSync(req.files.coverImage[0].path);
    } catch (uploadError) {
      if (req.files?.coverImage?.[0]) fs.unlinkSync(req.files.coverImage[0].path);
      return res.status(500).json({
        success: false,
        message: "Cover image upload failed",
        error: uploadError.message,
      });
    }

    // Handle images array upload (optional)
    if (req.files && req.files.images && req.files.images.length > 0) {
      try {
        const imageUploadPromises = req.files.images.map(async (file) => {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "seagulls/events/images",
          });
          fs.unlinkSync(file.path);
          return {
            public_id: result.public_id,
            url: result.secure_url,
          };
        });

        newEvent.images = await Promise.all(imageUploadPromises);
      } catch (uploadError) {
        // Clean up uploaded files on error
        if (req.files?.images) {
          req.files.images.forEach((file) => {
            if (file.path) fs.unlinkSync(file.path);
          });
        }
        return res.status(500).json({
          success: false,
          message: "Images upload failed",
          error: uploadError.message,
        });
      }
    }

    await newEvent.save();

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
        return res
          .status(400)
          .json({ message: "Title cannot exceed 200 characters" });
      }
      updatedData.title = title;
    }

    if (description) {
      if (description.length > 1000) {
        return res
          .status(400)
          .json({ message: "Description cannot exceed 1000 characters" });
      }
      updatedData.description = description;
    }

    // Resolve final dates (new or existing)
    const effectiveStartDate = startDate
      ? new Date(startDate)
      : event.startDate;
    const effectiveEndDate = endDate ? new Date(endDate) : event.endDate;

    // Validate dates only if both exist
    if (
      effectiveStartDate &&
      effectiveEndDate &&
      effectiveStartDate > effectiveEndDate
    ) {
      return res.status(400).json({
        message: "Start date cannot be after end date",
      });
    }

    if (startDate) updatedData.startDate = new Date(startDate);
    if (endDate) updatedData.endDate = new Date(endDate);

    if (address) {
      if (address.length > 300) {
        return res
          .status(400)
          .json({ message: "Address cannot exceed 300 characters" });
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

    // Handle coverImage update if new file is provided
    if (req.files && req.files.coverImage && req.files.coverImage[0]) {
      try {
        // Delete old coverImage from Cloudinary if exists
        if (event.coverImage && event.coverImage.public_id) {
          await cloudinary.uploader.destroy(event.coverImage.public_id);
        }
        // Upload new coverImage
        const coverImageResult = await cloudinary.uploader.upload(
          req.files.coverImage[0].path,
          {
            folder: "seagulls/events/cover",
          }
        );

        updatedEvent.coverImage = {
          public_id: coverImageResult.public_id,
          url: coverImageResult.secure_url,
        };

        await updatedEvent.save();
        // Remove file from server after upload
        fs.unlinkSync(req.files.coverImage[0].path);
      } catch (uploadError) {
        if (req.files?.coverImage?.[0]) fs.unlinkSync(req.files.coverImage[0].path);
        return res.status(500).json({
          success: false,
          message: "Cover image upload failed",
          error: uploadError.message,
        });
      }
    }

    // Handle deleted images first (before adding new ones)
    if (req.body.deletedImages) {
      try {
        let deletedImageUrls = [];
        if (Array.isArray(req.body.deletedImages)) {
          deletedImageUrls = req.body.deletedImages;
        } else if (typeof req.body.deletedImages === 'string') {
          try {
            deletedImageUrls = JSON.parse(req.body.deletedImages);
          } catch {
            deletedImageUrls = [req.body.deletedImages];
          }
        }

        if (deletedImageUrls.length > 0) {
          // Find and delete images from Cloudinary by matching URLs
          const imagesToKeep = (updatedEvent.images || []).filter((img) => {
            const shouldKeep = !deletedImageUrls.includes(img.url);
            if (!shouldKeep && img.public_id) {
              // Delete from Cloudinary
              cloudinary.uploader.destroy(img.public_id).catch((err) => {
                console.error(`Error deleting image ${img.public_id} from cloudinary:`, err);
              });
            }
            return shouldKeep;
          });

          updatedEvent.images = imagesToKeep;
          await updatedEvent.save();
        }
      } catch (deleteError) {
        console.error("Error deleting images:", deleteError);
        // Continue with update even if deletion fails
      }
    }

    // Handle images array update if new files are provided
    if (req.files && req.files.images && req.files.images.length > 0) {
      try {
        // Upload new images
        const imageUploadPromises = req.files.images.map(async (file) => {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "seagulls/events/images",
          });
          fs.unlinkSync(file.path);
          return {
            public_id: result.public_id,
            url: result.secure_url,
          };
        });

        const newImages = await Promise.all(imageUploadPromises);
        
        // Append new images to existing ones (after deletion)
        updatedEvent.images = [...(updatedEvent.images || []), ...newImages];
        
        await updatedEvent.save();
      } catch (uploadError) {
        // Clean up uploaded files on error
        if (req.files?.images) {
          req.files.images.forEach((file) => {
            if (file.path) fs.unlinkSync(file.path);
          });
        }
        return res.status(500).json({
          success: false,
          message: "Images upload failed",
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
    // Delete coverImage from Cloudinary if exists
    if (event.coverImage && event.coverImage.public_id) {
      try {
        await cloudinary.uploader.destroy(event.coverImage.public_id);
      } catch (cloudinaryError) {
        console.error("Error deleting cover image from cloudinary:", cloudinaryError);
      }
    }

    // Delete all images from Cloudinary if they exist
    if (event.images && event.images.length > 0) {
      try {
        const deletePromises = event.images
          .filter((img) => img.public_id)
          .map((img) => cloudinary.uploader.destroy(img.public_id));
        await Promise.all(deletePromises);
      } catch (cloudinaryError) {
        console.error("Error deleting images from cloudinary:", cloudinaryError);
      }
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
