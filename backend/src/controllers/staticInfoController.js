import StaticInfo from "../models/StaticInfo.js";
import Channel from "../models/Channel.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";
import sizeOf from "image-size";

// @desc    Create static info
// @route   POST /api/staticinfo
// @access  Private (Admin)
export const createStaticInfo = async (req, res) => {
  try {
    // Clean values (remove quotes if present)
    let {
      channelId,
      aboutUS,
      frequency,
      socialMediaLinks,
      downloadApp,
      metaTags,
      metaDescription,
      phoneNumber,
      email,
      address,
    } = req.body;

    // Additional cleaning as backup
    if (typeof channelId === "string") {
      channelId = channelId.replace(/^["']|["']$/g, "").trim();
    }
    if (typeof aboutUS === "string") {
      aboutUS = aboutUS.replace(/^["']|["']$/g, "").trim();
    }
    if (typeof frequency === "string") {
      frequency = frequency.replace(/^["']|["']$/g, "").trim();
    }
    if (typeof metaTags === "string") {
      metaTags = metaTags.replace(/^["']|["']$/g, "").trim();
    }
    if (typeof metaDescription === "string") {
      metaDescription = metaDescription.replace(/^["']|["']$/g, "").trim();
    }
    if (typeof phoneNumber === "string") {
      phoneNumber = phoneNumber.replace(/^["']|["']$/g, "").trim();
    }
    if (typeof email === "string") {
      email = email.replace(/^["']|["']$/g, "").trim();
    }
    if (typeof address === "string") {
      address = address.replace(/^["']|["']$/g, "").trim();
    }

    // Parse JSON strings if needed
    if (typeof socialMediaLinks === "string") {
      try {
        socialMediaLinks = JSON.parse(socialMediaLinks);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: "Invalid social media links format",
        });
      }
    }

    if (typeof downloadApp === "string") {
      try {
        downloadApp = JSON.parse(downloadApp);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: "Invalid download app format",
        });
      }
    }

    // Validation
    if (
      !channelId ||
      !aboutUS ||
      !frequency ||
      !socialMediaLinks ||
      !downloadApp ||
      !metaTags ||
      !metaDescription ||
      !phoneNumber ||
      !email ||
      !address
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide all required fields: channelId, aboutUS, frequency, socialMediaLinks, downloadApp, metaTags, metaDescription, phoneNumber, email, address",
      });
    }

    // Validate email format
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email",
      });
    }

    // Validate downloadApp structure
    if (!downloadApp.AppStore || !downloadApp.GooglePlay) {
      return res.status(400).json({
        success: false,
        message: "downloadApp must contain both AppStore and GooglePlay links",
      });
    }

    // Check if frequencyimg is provided
    if (!req.files || !req.files.frequencyimg || !req.files.frequencyimg[0]) {
      return res.status(400).json({
        success: false,
        message: "Frequency image is required",
      });
    }

    // Check if favIcon is provided
    if (!req.files || !req.files.favIcon || !req.files.favIcon[0]) {
      return res.status(400).json({
        success: false,
        message: "Favicon is required",
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

    // Check if static info already exists for this channel (BEFORE file processing)
    const existingStaticInfo = await StaticInfo.findOne({ channelId });
    if (existingStaticInfo) {
      // Clean up any uploaded files if they exist
      if (req.files) {
        Object.keys(req.files).forEach((key) => {
          req.files[key].forEach((file) => {
            if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
          });
        });
      }
      return res.status(409).json({
        success: false,
        message: "Static info already exists for this channel. Only one static info per channel is allowed. Use PUT /api/staticinfo/:channelId to update instead.",
        existingStaticInfoId: existingStaticInfo._id,
      });
    }

    // Validate favIcon dimensions
    const favIconFile = req.files.favIcon[0];
    let favIconDimensions = null;
    try {
      const dimensions = sizeOf(favIconFile.path);
      favIconDimensions = { width: dimensions.width, height: dimensions.height };

      // Recommended favicon sizes: 16x16, 32x32, 48x48, or square (e.g., 64x64, 128x128)
      if (dimensions.width !== dimensions.height) {
        return res.status(400).json({
          success: false,
          message: `Favicon must be square. Current dimensions: ${dimensions.width}x${dimensions.height}. Recommended sizes: 16x16, 32x32, 48x48, 64x64, or 128x128 pixels.`,
          currentDimensions: favIconDimensions,
          recommendedSizes: [
            "16x16",
            "32x32",
            "48x48",
            "64x64",
            "128x128",
            "256x256",
          ],
        });
      }

      // Check if size is one of the recommended sizes
      const recommendedSizes = [16, 32, 48, 64, 128, 256];
      if (!recommendedSizes.includes(dimensions.width)) {
        return res.status(400).json({
          success: false,
          message: `Favicon size should be one of: 16x16, 32x32, 48x48, 64x64, 128x128, or 256x256 pixels. Current size: ${dimensions.width}x${dimensions.height}`,
          currentDimensions: favIconDimensions,
          recommendedSizes: [
            "16x16",
            "32x32",
            "48x48",
            "64x64",
            "128x128",
            "256x256",
          ],
        });
      }
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Error reading favicon dimensions",
        error: error.message,
      });
    }

    // Upload frequency image to Cloudinary
    let frequencyImgResult;
    try {
      frequencyImgResult = await cloudinary.uploader.upload(
        req.files.frequencyimg[0].path,
        {
          folder: "seagulls/staticinfo/frequency",
          width: 800,
          crop: "scale",
        }
      );
      fs.unlinkSync(req.files.frequencyimg[0].path);
    } catch (uploadError) {
      if (req.files.frequencyimg) {
        req.files.frequencyimg.forEach((file) => {
          if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        });
      }
      console.error("Frequency image upload error:", uploadError);
      return res.status(500).json({
        success: false,
        message: "Error uploading frequency image",
        error: uploadError.message,
      });
    }

    // Upload favIcon to Cloudinary
    let favIconResult;
    try {
      favIconResult = await cloudinary.uploader.upload(favIconFile.path, {
        folder: "seagulls/staticinfo/favicon",
        width: favIconDimensions.width,
        height: favIconDimensions.height,
        crop: "fill",
      });
      fs.unlinkSync(favIconFile.path);
    } catch (uploadError) {
      if (req.files.favIcon) {
        req.files.favIcon.forEach((file) => {
          if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        });
      }
      if (frequencyImgResult) {
        await cloudinary.uploader.destroy(frequencyImgResult.public_id);
      }
      console.error("Favicon upload error:", uploadError);
      return res.status(500).json({
        success: false,
        message: "Error uploading favicon",
        error: uploadError.message,
      });
    }

    // Create new static info
    const staticInfo = new StaticInfo({
      channelId,
      aboutUS,
      frequency,
      frequencyimg: {
        public_id: frequencyImgResult.public_id,
        url: frequencyImgResult.secure_url,
      },
      socialMediaLinks,
      downloadApp,
      metaTags,
      metaDescription,
      favIcon: {
        public_id: favIconResult.public_id,
        url: favIconResult.secure_url,
        width: favIconDimensions.width,
        height: favIconDimensions.height,
      },
      phoneNumber,
      email,
      address,
    });

    await staticInfo.save();

    res.status(201).json({
      success: true,
      message: "Static info created successfully",
      data: staticInfo,
      favIconDimensions: favIconDimensions,
      recommendedFavIconSizes: ["16x16", "32x32", "48x48", "64x64", "128x128", "256x256"],
    });
  } catch (error) {
    // Clean up uploaded files
    if (req.files) {
      Object.keys(req.files).forEach((key) => {
        req.files[key].forEach((file) => {
          if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        });
      });
    }

    // Handle MongoDB duplicate key error (unique constraint violation)
    if (error.code === 11000 || error.name === 'MongoServerError') {
      return res.status(409).json({
        success: false,
        message: "Static info already exists for this channel. Only one static info per channel is allowed. Use PUT /api/staticinfo/:channelId to update instead.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error creating static info",
      error: error.message,
    });
  }
};

// @desc    Get all static info
// @route   GET /api/staticinfo
// @access  Public
export const getStaticInfos = async (req, res) => {
  try {
    const staticInfos = await StaticInfo.find().populate("channelId", "name");
    res.status(200).json({
      success: true,
      count: staticInfos.length,
      data: staticInfos,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching static info",
      error: error.message,
    });
  }
};

// @desc    Get static info by channel ID
// @route   GET /api/staticinfo/:channelId
// @access  Public
export const getStaticInfoByChannelId = async (req, res) => {
  try {
    const staticInfo = await StaticInfo.findOne({
      channelId: req.params.channelId,
    }).populate("channelId", "name");
    if (!staticInfo) {
      return res.status(404).json({
        success: false,
        message: "Static info not found for this channel",
      });
    }
    res.status(200).json({
      success: true,
      data: staticInfo,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching static info",
      error: error.message,
    });
  }
};

// @desc    Update static info
// @route   PUT /api/staticinfo/:channelId
// @access  Private (Admin)
export const updateStaticInfo = async (req, res) => {
  try {
    // Clean values
    let {
      channelId,
      aboutUS,
      frequency,
      socialMediaLinks,
      downloadApp,
      metaTags,
      metaDescription,
      phoneNumber,
      email,
      address,
    } = req.body;

    // Additional cleaning as backup
    if (typeof channelId === "string") {
      channelId = channelId.replace(/^["']|["']$/g, "").trim();
    }
    if (typeof aboutUS === "string") {
      aboutUS = aboutUS.replace(/^["']|["']$/g, "").trim();
    }
    if (typeof frequency === "string") {
      frequency = frequency.replace(/^["']|["']$/g, "").trim();
    }
    if (typeof metaTags === "string") {
      metaTags = metaTags.replace(/^["']|["']$/g, "").trim();
    }
    if (typeof metaDescription === "string") {
      metaDescription = metaDescription.replace(/^["']|["']$/g, "").trim();
    }
    if (typeof phoneNumber === "string") {
      phoneNumber = phoneNumber.replace(/^["']|["']$/g, "").trim();
    }
    if (typeof email === "string") {
      email = email.replace(/^["']|["']$/g, "").trim();
    }
    if (typeof address === "string") {
      address = address.replace(/^["']|["']$/g, "").trim();
    }

    // Parse JSON strings if needed
    if (socialMediaLinks && typeof socialMediaLinks === "string") {
      try {
        socialMediaLinks = JSON.parse(socialMediaLinks);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: "Invalid social media links format",
        });
      }
    }

    if (downloadApp && typeof downloadApp === "string") {
      try {
        downloadApp = JSON.parse(downloadApp);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: "Invalid download app format",
        });
      }
    }

    const updateData = {};

    // Validation for provided fields
    if (aboutUS !== undefined) {
      updateData.aboutUS = aboutUS;
    }
    if (frequency !== undefined) {
      updateData.frequency = frequency;
    }
    if (socialMediaLinks !== undefined) {
      updateData.socialMediaLinks = socialMediaLinks;
    }
    if (downloadApp !== undefined) {
      if (!downloadApp.AppStore || !downloadApp.GooglePlay) {
        return res.status(400).json({
          success: false,
          message: "downloadApp must contain both AppStore and GooglePlay links",
        });
      }
      updateData.downloadApp = downloadApp;
    }
    if (metaTags !== undefined) {
      updateData.metaTags = metaTags;
    }
    if (metaDescription !== undefined) {
      updateData.metaDescription = metaDescription;
    }
    if (phoneNumber !== undefined) {
      updateData.phoneNumber = phoneNumber;
    }
    if (email !== undefined) {
      const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: "Please enter a valid email",
        });
      }
      updateData.email = email;
    }
    if (address !== undefined) {
      updateData.address = address;
    }
    if (channelId) {
      const channel = await Channel.findById(channelId);
      if (!channel) {
        return res.status(400).json({
          success: false,
          message: "Invalid channelId. Channel does not exist.",
        });
      }
      updateData.channelId = channelId;
    }

    // Find static info by channelId
    const staticInfo = await StaticInfo.findOneAndUpdate(
      { channelId: req.params.channelId },
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!staticInfo) {
      return res.status(404).json({
        success: false,
        message: "Static info not found for this channel",
      });
    }

    // Handle frequency image upload if provided
    if (req.files && req.files.frequencyimg && req.files.frequencyimg[0]) {
      try {
        // Delete old frequency image from cloudinary if exists
        if (staticInfo.frequencyimg && staticInfo.frequencyimg.public_id) {
          await cloudinary.uploader.destroy(staticInfo.frequencyimg.public_id);
        }

        const result = await cloudinary.uploader.upload(
          req.files.frequencyimg[0].path,
          {
            folder: "seagulls/staticinfo/frequency",
            width: 800,
            crop: "scale",
          }
        );

        staticInfo.frequencyimg = {
          public_id: result.public_id,
          url: result.secure_url,
        };
        await staticInfo.save();

        fs.unlinkSync(req.files.frequencyimg[0].path);
      } catch (uploadError) {
        if (req.files.frequencyimg) {
          req.files.frequencyimg.forEach((file) => {
            if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
          });
        }
        console.error("Frequency image upload error:", uploadError);
        return res.status(500).json({
          success: false,
          message: "Error uploading frequency image",
          error: uploadError.message,
        });
      }
    }

    // Handle favIcon upload if provided
    if (req.files && req.files.favIcon && req.files.favIcon[0]) {
      const favIconFile = req.files.favIcon[0];
      let favIconDimensions = null;

      try {
        // Validate favIcon dimensions
        const dimensions = sizeOf(favIconFile.path);
        favIconDimensions = { width: dimensions.width, height: dimensions.height };

        // Check if square
        if (dimensions.width !== dimensions.height) {
          if (req.files.frequencyimg) {
            req.files.frequencyimg.forEach((file) => {
              if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
            });
          }
          fs.unlinkSync(favIconFile.path);
          return res.status(400).json({
            success: false,
            message: `Favicon must be square. Current dimensions: ${dimensions.width}x${dimensions.height}. Recommended sizes: 16x16, 32x32, 48x48, 64x64, or 128x128 pixels.`,
            currentDimensions: favIconDimensions,
            recommendedSizes: [
              "16x16",
              "32x32",
              "48x48",
              "64x64",
              "128x128",
              "256x256",
            ],
          });
        }

        // Check if size is one of the recommended sizes
        const recommendedSizes = [16, 32, 48, 64, 128, 256];
        if (!recommendedSizes.includes(dimensions.width)) {
          if (req.files.frequencyimg) {
            req.files.frequencyimg.forEach((file) => {
              if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
            });
          }
          fs.unlinkSync(favIconFile.path);
          return res.status(400).json({
            success: false,
            message: `Favicon size should be one of: 16x16, 32x32, 48x48, 64x64, 128x128, or 256x256 pixels. Current size: ${dimensions.width}x${dimensions.height}`,
            currentDimensions: favIconDimensions,
            recommendedSizes: [
              "16x16",
              "32x32",
              "48x48",
              "64x64",
              "128x128",
              "256x256",
            ],
          });
        }

        // Delete old favIcon from cloudinary if exists
        if (staticInfo.favIcon && staticInfo.favIcon.public_id) {
          await cloudinary.uploader.destroy(staticInfo.favIcon.public_id);
        }

        // Upload new favIcon
        const result = await cloudinary.uploader.upload(favIconFile.path, {
          folder: "seagulls/staticinfo/favicon",
          width: favIconDimensions.width,
          height: favIconDimensions.height,
          crop: "fill",
        });

        staticInfo.favIcon = {
          public_id: result.public_id,
          url: result.secure_url,
          width: favIconDimensions.width,
          height: favIconDimensions.height,
        };
        await staticInfo.save();

        fs.unlinkSync(favIconFile.path);

        res.status(200).json({
          success: true,
          message: "Static info updated successfully",
          data: staticInfo,
          favIconDimensions: favIconDimensions,
          recommendedFavIconSizes: [
            "16x16",
            "32x32",
            "48x48",
            "64x64",
            "128x128",
            "256x256",
          ],
        });
        return;
      } catch (uploadError) {
        if (req.files.favIcon) {
          req.files.favIcon.forEach((file) => {
            if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
          });
        }
        console.error("Favicon upload error:", uploadError);
        return res.status(500).json({
          success: false,
          message: "Error uploading favicon",
          error: uploadError.message,
        });
      }
    }

    res.status(200).json({
      success: true,
      message: "Static info updated successfully",
      data: staticInfo,
    });
  } catch (error) {
    // Clean up uploaded files
    if (req.files) {
      Object.keys(req.files).forEach((key) => {
        req.files[key].forEach((file) => {
          if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        });
      });
    }
    res.status(500).json({
      success: false,
      message: "Error updating static info",
      error: error.message,
    });
  }
};

// @desc    Delete static info
// @route   DELETE /api/staticinfo/:channelId
// @access  Private (Admin)
export const deleteStaticInfo = async (req, res) => {
  try {
    const staticInfo = await StaticInfo.findOne({ channelId: req.params.channelId });

    if (!staticInfo) {
      return res.status(404).json({
        success: false,
        message: "Static info not found for this channel",
      });
    }

    // Delete images from cloudinary if exists
    if (staticInfo.frequencyimg && staticInfo.frequencyimg.public_id) {
      try {
        await cloudinary.uploader.destroy(staticInfo.frequencyimg.public_id);
      } catch (cloudinaryError) {
        console.error("Error deleting frequency image from cloudinary:", cloudinaryError);
      }
    }

    if (staticInfo.favIcon && staticInfo.favIcon.public_id) {
      try {
        await cloudinary.uploader.destroy(staticInfo.favIcon.public_id);
      } catch (cloudinaryError) {
        console.error("Error deleting favicon from cloudinary:", cloudinaryError);
      }
    }

    await StaticInfo.findOneAndDelete({ channelId: req.params.channelId });

    res.status(200).json({
      success: true,
      message: "Static info deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting static info",
      error: error.message,
    });
  }
};

