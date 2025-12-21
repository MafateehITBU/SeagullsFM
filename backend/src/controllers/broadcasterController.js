import Broadcaster from "../models/Broadcaster.js";
import Channel from "../models/Channel.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";

// @desc    Create a new broadcaster
// @route   POST /api/broadcaster
// @access  Private (Admin)
export const createBroadcaster = async (req, res) => {
  try {
    // Clean values (remove quotes if present)
    let { channelId, name, socialLinks, description } = req.body;
    
    // Additional cleaning as backup
    if (typeof channelId === 'string') {
      channelId = channelId.replace(/^["']|["']$/g, '').trim();
    }
    if (typeof name === 'string') {
      name = name.replace(/^["']|["']$/g, '').trim();
    }
    if (typeof description === 'string') {
      description = description.replace(/^["']|["']$/g, '').trim();
    }

    // Validation
    if (!channelId || !name) {
      return res.status(400).json({
        success: false,
        message: "Please provide channelId and name",
      });
    }

    // Image is required
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image is required",
      });
    }

    if (name.length > 50) {
      return res.status(400).json({
        success: false,
        message: "Name cannot exceed 50 characters",
      });
    }

    if (description && description.length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Description cannot exceed 1000 characters",
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

    // Parse socialLinks if provided as string
    let parsedSocialLinks = {};
    if (socialLinks) {
      try {
        parsedSocialLinks =
          typeof socialLinks === "string" ? JSON.parse(socialLinks) : socialLinks;
      } catch (error) {
        parsedSocialLinks = {};
      }
    }

    // Upload image to Cloudinary (required)
    let imageResult;
    try {
      imageResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "seagulls/broadcasters",
        width: 500,
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

    // Create new broadcaster with image
    const broadcaster = new Broadcaster({
      channelId,
      name,
      image: {
        public_id: imageResult.public_id,
        url: imageResult.secure_url,
      },
      socialLinks: parsedSocialLinks,
      description: description || "",
    });

    await broadcaster.save();

    res.status(201).json({
      success: true,
      message: "Broadcaster created successfully",
      data: broadcaster,
    });
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({
      success: false,
      message: "Error creating broadcaster",
      error: error.message,
    });
  }
};

// @desc    Get all broadcasters
// @route   GET /api/broadcaster
// @access  Public
export const getBroadcasters = async (req, res) => {
  try {
    const broadcasters = await Broadcaster.find().populate("channelId", "name");
    res.status(200).json({
      success: true,
      count: broadcasters.length,
      data: broadcasters,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching broadcasters",
      error: error.message,
    });
  }
};

// @desc    Get a single broadcaster by ID
// @route   GET /api/broadcaster/:id
// @access  Public
export const getBroadcasterById = async (req, res) => {
  try {
    const broadcaster = await Broadcaster.findById(req.params.id).populate(
      "channelId",
      "name"
    );
    if (!broadcaster) {
      return res.status(404).json({
        success: false,
        message: "Broadcaster not found",
      });
    }
    res.status(200).json({
      success: true,
      data: broadcaster,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching broadcaster",
      error: error.message,
    });
  }
};

// @desc    Update a broadcaster by ID
// @route   PUT /api/broadcaster/:id
// @access  Private (Admin)
export const updateBroadcaster = async (req, res) => {
  try {
    const { channelId, name, socialLinks, description } = req.body;
    const updateData = {};

    // Validation for provided fields
    if (name) {
      if (name.length > 50) {
        return res.status(400).json({
          success: false,
          message: "Name cannot exceed 50 characters",
        });
      }
      updateData.name = name;
    }

    if (description !== undefined) {
      if (description.length > 1000) {
        return res.status(400).json({
          success: false,
          message: "Description cannot exceed 1000 characters",
        });
      }
      updateData.description = description;
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

    if (socialLinks) {
      try {
        const parsedSocialLinks =
          typeof socialLinks === "string" ? JSON.parse(socialLinks) : socialLinks;
        updateData.socialLinks = parsedSocialLinks;
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: "Invalid socialLinks format",
        });
      }
    }

    const broadcaster = await Broadcaster.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!broadcaster) {
      return res.status(404).json({
        success: false,
        message: "Broadcaster not found",
      });
    }

    // Handle image upload if provided
    if (req.file) {
      try {
        // Delete old image from cloudinary if exists
        if (broadcaster.image && broadcaster.image.public_id) {
          await cloudinary.uploader.destroy(broadcaster.image.public_id);
        }

        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "seagulls/broadcasters",
          width: 500,
          crop: "scale",
        });

        broadcaster.image = {
          public_id: result.public_id,
          url: result.secure_url,
        };
        await broadcaster.save();

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
      message: "Broadcaster updated successfully",
      data: broadcaster,
    });
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({
      success: false,
      message: "Error updating broadcaster",
      error: error.message,
    });
  }
};

// @desc    Delete a broadcaster by ID
// @route   DELETE /api/broadcaster/:id
// @access  Private (Admin)
export const deleteBroadcaster = async (req, res) => {
  try {
    const broadcaster = await Broadcaster.findById(req.params.id);

    if (!broadcaster) {
      return res.status(404).json({
        success: false,
        message: "Broadcaster not found",
      });
    }

    // Delete image from cloudinary if exists
    if (broadcaster.image && broadcaster.image.public_id) {
      try {
        await cloudinary.uploader.destroy(broadcaster.image.public_id);
      } catch (cloudinaryError) {
        console.error("Error deleting image from cloudinary:", cloudinaryError);
      }
    }

    await Broadcaster.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Broadcaster deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting broadcaster",
      error: error.message,
    });
  }
};

