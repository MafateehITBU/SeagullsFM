import Channel from "../models/Channel.js";

// @desc    Create a new channel
// @route   POST /api/channels
// @access  Private
export const createChannel = async (req, res) => {
  try {
    const { name } = req.body;
    const newChannel = new Channel({ name });
    await newChannel.save();
    res.status(201).json({ success: true, data: newChannel });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

// @desc    Get all channels
// @route   GET /api/channels
// @access  Public
export const getChannels = async (req, res) => {
  try {
    const channels = await Channel.find();
    res.status(200).json({ success: true, data: channels });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

// @desc    Get a single channel by ID
// @route   GET /api/channels/:id
// @access  Public
export const getChannelById = async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id);
    if (!channel) {
      return res
        .status(404)
        .json({ success: false, message: "Channel not found" });
    }
    res.status(200).json({ success: true, data: channel });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

// @desc    Update a channel by ID
// @route   PUT /api/channels/:id
// @access  Private
export const updateChannel = async (req, res) => {
  try {
    const { name } = req.body;
    const channel = await Channel.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true, runValidators: true }
    );
    if (!channel) {
      return res
        .status(404)
        .json({ success: false, message: "Channel not found" });
    }
    res.status(200).json({ success: true, data: channel });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

// @desc    Delete a channel by ID
// @route   DELETE /api/channels/:id
// @access  Private
export const deleteChannel = async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id);
    if (!channel) {
      return res
        .status(404)
        .json({ success: false, message: "Channel not found" });
    }

    await Channel.findByIdAndDelete(req.params.id);
    res.status(200).json({ 
        success: true, 
        message: "Channel deleted successfully" 
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};
