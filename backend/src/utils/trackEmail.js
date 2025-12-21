import { transporter } from "./nodemailer.js";

// @desc    Send email notification to user when track is approved
export const sendTrackApprovalEmail = async (userEmail, songName, date, time, channelName) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: `Your Track "${songName}" Has Been Approved!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4CAF50;">Track Approved! 🎵</h2>
          <p>Dear User,</p>
          <p>Great news! Your track <strong>"${songName}"</strong> has been approved and will be streamed on <strong>${channelName}</strong>.</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Streaming Details:</h3>
            <p><strong>Date:</strong> ${new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p><strong>Time:</strong> ${time}</p>
            <p><strong>Channel:</strong> ${channelName}</p>
          </div>
          
          <p>Thank you for your submission!</p>
          <p>Best regards,<br>SeagullsFM Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Track approval email sent to ${userEmail}`);
  } catch (error) {
    console.error("Error sending track approval email:", error);
    throw error;
  }
};

