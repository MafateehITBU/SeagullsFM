import Advertisement from "../models/Advertisement.js";
import Channel from "../models/Channel.js";

// @desc    Create a new advertisement
// @route   POST /api/advertisements
// @access  Public
export const createAdvertisement = async (req, res) => {
  try {
    const { channelId, name, email, phoneNumber, message } = req.body;

    // validations
    if (!name || !email || !phoneNumber || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (name.length > 100) {
      return res
        .status(400)
        .json({ message: "Name cannot exceed 100 characters" });
    }

    if (email.length > 100) {
      return res
        .status(400)
        .json({ message: "Email cannot exceed 100 characters" });
    }

    if (message.length > 500) {
      return res
        .status(400)
        .json({ message: "Message cannot exceed 500 characters" });
    }

    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    const newAdvertisement = new Advertisement({
      channelId,
      name,
      email,
      phoneNumber,
      message,
    });
    const savedAdvertisement = await newAdvertisement.save();

    res.status(201).json({
      success: true,
      message: "Advertisement created successfully",
      data: savedAdvertisement,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc Get all Advertisements
// @route GET /api/advertisements
// @access Private (Admin, SuperAdmin)
export const getAllAdvertisements = async (req, res) => {
  try {
    const advertisements = await Advertisement.find().populate(
      "channelId",
      "name"
    );
    res.status(200).json({
      success: true,
      message: "Advertisements fetched successfully",
      data: advertisements,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc Get Advertisement by ID
// @route GET /api/advertisements/:id
// @access Private (Admin, SuperAdmin)
export const getAdvertisementById = async (req, res) => {
  try {
    const advertisement = await Advertisement.findById(req.params.id).populate(
      "channelId",
      "name"
    );
    if (!advertisement) {
      return res.status(404).json({ message: "Advertisement not found" });
    }
    res.status(200).json({
      success: true,
      message: "Advertisement fetched successfully",
      data: advertisement,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc Delete Advertisement by ID
// @route DELETE /api/advertisements/:id
// @access Private (Admin, SuperAdmin)
export const deleteAdvertisementById = async (req, res) => {
  try {
    const advertisement = await Advertisement.findById(req.params.id);
    if (!advertisement) {
      return res.status(404).json({ message: "Advertisement not found" });
    }
    await Advertisement.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      message: "Advertisement deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
