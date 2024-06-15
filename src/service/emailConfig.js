const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const { emailType, emailContent } = require("../utils/emailType");
const { StatusCodes } = require("http-status-codes");

const HttpStatus = require("http-status-codes");
dotenv.config();

const ERROR_MESSAGES = {
  SENDING_EMAIL: "Failed to send email"
};

const SUCCESS_MESSAGES = {
  EMAIL_SENT_SUCCESSFULLY: "Email sent successfully",
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "sandbox.smtp.gmail.com",
  port: 587,
  auth: {
    user: process.env.EMAIL_USER, //falta user
    pass: process.env.EMAIL_PASSWORD, //falta password
  },
});

function sendMail(emailType, to, res, token) {
  const emailInfo = emailContent[emailType];
  let html = "";

  if (typeof emailInfo.html === "function") {
    html = emailInfo.html(token || "");
  } else {
    html = emailInfo.html || "";
  }

  const mailOptions = {
    to,
    subject: emailInfo.subject,
    html,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res
        .status(HttpStatus.UNPROCESSABLE_ENTITY)
        .json({ message: ERROR_MESSAGES.SENDING_EMAIL, error: error.message });
    } else {
      return res
        .status(HttpStatus.OK)
        .json({ message: SUCCESS_MESSAGES.EMAIL_SENT_SUCCESSFULLY });
    }
  });
}

module.exports = { sendMail };
