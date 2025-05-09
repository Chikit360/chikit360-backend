const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
          user: 'vella.frami@ethereal.email',
          pass: 'DBYv2zHPaF92G2zgQB'
      }
  });
    

    const mailOptions = {
      from: process.env.EMAIL_FROM , // or process.env.EMAIL_USERNAME
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (err) {
    console.error("Error sending email:", err);
  }
};

module.exports = sendEmail;
