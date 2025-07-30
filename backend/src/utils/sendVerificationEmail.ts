import nodemailer from "nodemailer";

export const sendVerificationEmail = async (to: string, token: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail", 
    host : "smtp.gmail.com",
    // port : 587,
    secure : true,
    auth: {
      user: "hakufofo@gmail.com",
      pass: "rijk koft cccu yoeg", 
    },
  });

const link = `http://localhost:3000/set-password?token=${token}`;
  const mailOptions = {
    from: '"PalTrainingSystem" <hakufofo@gmail.com>',
    to,
    subject: "Complete Your Account Setup",
    html: `
      <p>Hello,</p>
      <p>Please click the link below to set your password and complete your registration:</p>
      <a href="${link}">${link}</a>
      <p>If you did not request this, you can ignore the email.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};
