import nodemailer from 'nodemailer';

export const sendVerificationEmail = async (email, token) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: process.env.SMTP_PORT || 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // In a real scenario, CLIENT_URL would be your frontend URL (e.g. http://localhost:5173)
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const verificationUrl = `${clientUrl}/verify-email?token=${token}`;

    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@bulkmatrix.com',
      to: email,
      subject: 'BulkMatrix - Verify Your Email',
      html: `
        <h1>Email Verification</h1>
        <p>Please click the link below to verify your email address:</p>
        <a href="${verificationUrl}">${verificationUrl}</a>
      `,
    };

    if (process.env.SMTP_HOST) {
        await transporter.sendMail(mailOptions);
    } else {
        console.log(`[Dev] Mock Email sent to ${email}. Verification URL: ${verificationUrl}`);
    }
    
  } catch (error) {
    console.error('Error sending email:', error);
  }
};
