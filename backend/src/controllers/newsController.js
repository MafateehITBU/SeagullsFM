import News from "../models/News.js";
import Channel from "../models/Channel.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";
import path from "path";

// @desc Create a news article
// @route POST /api/news
// @access Private (Admin, SuperAdmin)
export const createNews = async (req, res) => {
  try {
    const { channelId, title, description, content } = req.body;

    if (!channelId || !title || !description || !content) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be filled",
      });
    }

    if (title.length < 10 || title.length > 150) {
      return res.status(400).json({
        success: false,
        message: "Title must be between 10 and 150 characters",
      });
    }

    if (description.length < 20 || description.length > 300) {
      return res.status(400).json({
        success: false,
        message: "Description must be between 20 and 300 characters",
      });
    }

    if (content.length < 50) {
      return res.status(400).json({
        success: false,
        message: "Content must be at least 50 characters long",
      });
    }

    // Check if channel exists
    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res
        .status(404)
        .json({ success: false, message: "Channel not found" });
    }

    // Create news article
    const news = new News({
      channelId,
      title,
      description,
      content,
    });

    // Handle image upload if provided
    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "seagulls/news",
          width: 800,
          height: 600,
          crop: "limit",
        });
        news.image = {
          public_id: result.public_id,
          url: result.secure_url,
        };
        await news.save();

        // Remove file from server after upload
        fs.unlinkSync(path.resolve(req.file.path));
      } catch (error) {
        // Remove file from server if upload fails
        fs.unlinkSync(path.resolve(req.file.path));
        throw error;
      }
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Image is required" });
    }

    res.status(201).json({
      success: true,
      message: "News article created successfully",
      data: news,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

// @desc Get news articles
// @route GET /api/news
// @access Public
export const getAllNews = async (req, res) => {
  try {
    const newsArticles = await News.find()
      .sort({ createdAt: -1 })
      .populate("channelId", "name");

    res.status(200).json({
      success: true,
      count: newsArticles.length,
      data: newsArticles,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

// @desc Get a news article by ID
// @route GET /api/news/:id
// @access Public
export const getNewsById = async (req, res) => {
  try {
    const newsId = req.params.id;
    const news = await News.findById(newsId).populate("channelId", "name");

    if (!news) {
      return res
        .status(404)
        .json({ success: false, message: "News article not found" });
    }
    res.status(200).json({
      success: true,
      data: news,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

// @desc Update a news article
// @route PUT /api/news/:id
// @access Private (Admin, SuperAdmin)
export const updateNews = async (req, res) => {
  try {
    const newsId = req.params.id;
    const { title, description, content } = req.body;
    const updateData = {};

    if (title) {
      if (title.length < 10 || title.length > 150) {
        return res.status(400).json({
          success: false,
          message: "Title must be between 10 and 150 characters",
        });
      }
      updateData.title = title;
    }

    if (description) {
      if (description.length < 20 || description.length > 300) {
        return res.status(400).json({
          success: false,
          message: "Description must be between 20 and 300 characters",
        });
      }
      updateData.description = description;
    }

    if (content) {
      if (content.length < 50) {
        return res.status(400).json({
          success: false,
          message: "Content must be at least 50 characters long",
        });
      }
      updateData.content = content;
    }

    const news = await News.findByIdAndUpdate(newsId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!news) {
      return res
        .status(404)
        .json({ success: false, message: "News article not found" });
    }

    // Handle image update if provided
    if (req.file) {
      // Delete old image from Cloudinary
      if (news.image && news.image.public_id) {
        await cloudinary.uploader.destroy(news.image.public_id);
      }
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "seagulls/news",
          width: 800,
          height: 600,
          crop: "limit",
        });
        news.image = {
          public_id: result.public_id,
          url: result.secure_url,
        };
        await news.save();
        // Remove file from server after upload
        fs.unlinkSync(path.resolve(req.file.path));
      } catch (error) {
        // Remove file from server if upload fails
        fs.unlinkSync(path.resolve(req.file.path));
        throw error;
      }
    }

    res.status(200).json({
      success: true,
      message: "News article updated successfully",
      data: news,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

// @desc Delete a news article
// @route DELETE /api/news/:id
// @access Private (Admin, SuperAdmin)
export const deleteNews = async (req, res) => {
  try {
    const newsId = req.params.id;
    const news = await News.findById(newsId);

    if (!news) {
      return res
        .status(404)
        .json({ success: false, message: "News article not found" });
    }

    // Delete image from Cloudinary if it exists
    if (news.image && news.image.public_id) {
      await cloudinary.uploader.destroy(news.image.public_id);
    }

    await News.findByIdAndDelete(newsId);

    res.status(200).json({
      success: true,
      message: "News article deleted successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};
