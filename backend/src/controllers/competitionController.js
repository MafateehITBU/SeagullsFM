import Competition from "../models/Competition.js";
import CompetitionUser from "../models/CompetitionUser.js";
import User from "../models/User.js";
import Channel from "../models/Channel.js";

// @desc   Create a new competition
// @route  POST /api/competition
// @access Private (Admin, SuperAdmin)
export const createCompetition = async (req, res) => {
  try {
    const { channelId, title, description, startDate, endDate } = req.body;

    // Validate required fields
    if (!channelId || !title || !description || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check if channel exists
    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({
        success: false,
        message: "Channel not found",
      });
    }

    // Validate date range and start date must be today or future
    const now = new Date();
    if (new Date(startDate) < now) {
      return res.status(400).json({
        success: false,
        message: "Start date must be today or a future date",
      });
    }

    if (new Date(endDate) <= new Date(startDate)) {
      return res.status(400).json({
        success: false,
        message: "End date must be after start date",
      });
    }

    // Create new competition
    const newCompetition = new Competition({
      channelId,
      title,
      description,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });

    await newCompetition.save();

    res.status(201).json({
      success: true,
      message: "Competition created successfully",
      competition: newCompetition,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating competition",
      error: error.message,
    });
  }
};

// @desc  Get all competitions along with user submissions
// @route GET /api/competitions
// @access Private (Admin, SuperAdmin)
export const getAllCompetitions = async (req, res) => {
  try {
    const competitions = await Competition.find().lean();
    const competitionsWithSubmissions = await Promise.all(
      competitions.map(async (competition) => {
        const submissions = await CompetitionUser.find({
          competitionId: competition._id,
        }).populate("userId", "name email");

        return {
          ...competition,
          submissions,
        };
      })
    );

    res.status(200).json({
      success: true,
      message: "Competitions fetched successfully",
      data: competitionsWithSubmissions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching competitions",
      error: error.message,
    });
  }
};

// @desc   Get competition details along with user submissions
// @route  GET /api/competition/:id/submissions
// @access Private (Admin, SuperAdmin)
export const getCompetitionDetailsWithSubmissions = async (req, res) => {
  try {
    const competitionId = req.params.id;
    const competition = await Competition.findById(competitionId);

    if (!competition) {
      return res.status(404).json({
        success: false,
        message: "Competition not found",
      });
    }

    // Fetch user submissions for the competition and populate user details
    const submissions = await CompetitionUser.find({ competitionId }).populate(
      "userId",
      "name email"
    );

    res.status(200).json({
      success: true,
      competition,
      submissions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching competition details",
      error: error.message,
    });
  }
};

// @desc Get competition details by ID
// @route GET /api/competition/:id
// @access Public
export const getCompetitionById = async (req, res) => {
  try {
    const competitionId = req.params.id;
    const competition = await Competition.findById(competitionId);
    if (!competition) {
      return res.status(404).json({
        success: false,
        message: "Competition not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Competition fetched successfully",
      data: competition,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching competition",
      error: error.message,
    });
  }
};

// @desc Update competition details
// @route PUT /api/competition/:id
// @access Private (Admin, SuperAdmin)
export const updateCompetition = async (req, res) => {
  try {
    const competitionId = req.params.id;
    const { title, description, startDate, endDate } = req.body;
    const competition = await Competition.findById(competitionId);

    if (!competition) {
      return res.status(404).json({
        success: false,
        message: "Competition not found",
      });
    }

    // Update competition fields
    competition.title = title || competition.title;
    competition.description = description || competition.description;
    // Validate and update dates if provided
    if (startDate) {
      const now = new Date();
      if (new Date(startDate) < now) {
        return res.status(400).json({
          success: false,
          message: "Start date must be today or a future date",
        });
      }
      competition.startDate = new Date(startDate);
    }
    if (endDate) {
      if (new Date(endDate) <= new Date(competition.startDate)) {
        return res.status(400).json({
          success: false,
          message: "End date must be after start date",
        });
      }
      competition.endDate = new Date(endDate);
    }

    await competition.save();

    res.status(200).json({
      success: true,
      message: "Competition updated successfully",
      data: competition,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating competition",
      error: error.message,
    });
  }
};

// @desc Add user submission to a competition
// @route POST /api/competition/:id/submit
// @access Private (Authenticated Users)
export const addCompetitionSubmission = async (req, res) => {
  try {
    const competitionId = req.params.id;
    const userId = req.user.id;
    const { answer } = req.body;

    // Validate required fields
    if (!answer) {
      return res.status(400).json({
        success: false,
        message: "Answer is required",
      });
    }

    // Check if competition exists
    const competition = await Competition.findById(competitionId);
    if (!competition) {
      return res.status(404).json({
        success: false,
        message: "Competition not found",
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Create new competition submission
    const newSubmission = new CompetitionUser({
      competitionId,
      userId,
      answer,
    });

    await newSubmission.save();

    res.status(201).json({
      success: true,
      message: "Submission added successfully",
      submission: newSubmission,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error adding submission",
      error: error.message,
    });
  }
};

// @desc Delete a competition with all its submissions
// @route DELETE /api/competition/:id
// @access Private (Admin, SuperAdmin)
export const deleteCompetition = async (req, res) => {
  try {
    const competitionId = req.params.id;
    const competition = await Competition.findById(competitionId);

    if (!competition) {
      return res.status(404).json({
        success: false,
        message: "Competition not found",
      });
    }

    // Delete all submissions related to the competition
    await CompetitionUser.deleteMany({ competitionId });

    // Delete the competition
    await Competition.findByIdAndDelete(competitionId);

    res.status(200).json({
      success: true,
      message: "Competition and its submissions deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting competition",
      error: error.message,
    });
  }
};
