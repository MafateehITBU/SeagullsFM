import InterviewApplicant from "../models/InterviewApplicant.js";
import Channel from "../models/Channel.js";
import { parsePhoneNumberFromString } from "libphonenumber-js";

// @desc   Create a new interview applicant
// @route  POST /api/interview-applicant
// @access Public
export const createInterviewApplicant = async (req, res) => {
  try {
    const { channelId, name, email, phoneNumber, topic, socialLinks, job } =
      req.body;

    if (!channelId || !name || !email || !phoneNumber || !topic || !job) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Check if the channel exists
    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res
        .status(404)
        .json({ success: false, message: "Channel not found" });
    }

    // Validations
    if (name.length < 2 || name.length > 50) {
      return res.status(400).json({
        success: false,
        message: "Name must be between 2 and 50 characters",
      });
    }

    // Validate email format
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Please enter a valid email" });
    }

    // validate phone number
    const phoneNum = parsePhoneNumberFromString(phoneNumber);
    if (!phoneNum || !phoneNum.isValid()) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid international phone number",
      });
    }

    if (topic.length < 5 || topic.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Topic must be between 5 and 100 characters",
      });
    }

    if (job.length < 2 || job.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Job must be between 2 and 100 characters",
      });
    }

    // validate social links (if provided)
    const socialLinkFields = ["ig", "fb", "twitter"];
    for (const field of socialLinkFields) {
      if (socialLinks && socialLinks[field]) {
        if (socialLinks[field].length < 5 || socialLinks[field].length > 100) {
          return res.status(400).json({
            success: false,
            message: `${field} link must be between 5 and 100 characters`,
          });
        }
      }
    }

    const newApplicant = new InterviewApplicant({
      channelId,
      name,
      email,
      phoneNumber,
      topic,
      socialLinks,
      job,
    });

    await newApplicant.save();
    res.status(201).json({
      success: true,
      message: "Interview applicant created successfully",
      data: newApplicant,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating interview applicant",
      error: error.message,
    });
  }
};

// @desc  Get all interview applicants
// @route  GET /api/interview-applicant
// @access Private (Admin, SuperAdmin)
export const getAllInterviewApplicants = async (req, res) => {
  try {
    const applicants = await InterviewApplicant.find().populate(
      "channelId",
      "name"
    );
    res.status(200).json({
      success: true,
      count: applicants.length,
      data: applicants,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching interview applicants",
      error: error.message,
    });
  }
};

// @desc  Get interview applicants by ID
// @route  GET /api/interview-applicant/:id
// @access Private (Admin, SuperAdmin)
export const getInterviewApplicantById = async (req, res) => {
  try {
    const applicant = await InterviewApplicant.findById(req.params.id).populate(
      "channelId",
      "name"
    );
    if (!applicant) {
      return res
        .status(404)
        .json({ success: false, message: "Interview applicant not found" });
    }
    res.status(200).json({
      success: true,
      data: applicant,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching interview applicant",
      error: error.message,
    });
  }
};

// @desc Update interview applicant status
// @route PUT /api/interview-applicant/:id
// @access Private (Admin, SuperAdmin)
export const updateInterviewApplicantStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["pending", "approved", "rejected"];
    const lowercaseStatus = status.toLowerCase();

    if (!validStatuses.includes(lowercaseStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }
    const applicant = await InterviewApplicant.findById(req.params.id);
    if (!applicant) {
      return res
        .status(404)
        .json({ success: false, message: "Interview applicant not found" });
    }
    applicant.status = lowercaseStatus;
    await applicant.save();
    res.status(200).json({
      success: true,
      message: "Interview applicant status updated successfully",
      data: applicant,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating interview applicant status",
      error: error.message,
    });
  }
};

// @desc  Delete interview applicant by ID
// @route  DELETE /api/interview-applicant/:id
// @access Private (Admin, SuperAdmin)
export const deleteInterviewApplicant = async (req, res) => {
  try {
    const applicant = await InterviewApplicant.findById(req.params.id);
    if (!applicant) {
      return res
        .status(404)
        .json({ success: false, message: "Interview applicant not found" });
    }
    await InterviewApplicant.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      message: "Interview applicant deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting interview applicant",
      error: error.message,
    });
  }
};
