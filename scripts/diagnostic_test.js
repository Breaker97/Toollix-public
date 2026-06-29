require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');

async function run() {
  console.log('--- Toollix SMTP Diagnostic Tool ---');
  
  if (!process.env.MONGODB_URI) {
    console.error('Error: MONGODB_URI not found in .env.local');
    process.exit(1);
  }

  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Database connected.');

    // Fetch settings from DB
    const Settings = mongoose.model('Settings', new mongoose.Schema({
      smtpHost: String,
      smtpPort: Number,
      smtpSecure: Boolean,
      smtpUser: String,
      smtpPass: String,
      smtpFrom: String,
    }));

    const settings = await Settings.findOne();
    if (!settings) {
      console.error('Error: No settings found in database.');
      process.exit(1);
    }

    console.log('SMTP Configuration found:');
    console.log('- Host:', settings.smtpHost);
    console.log('- Port:', settings.smtpPort);
    console.log('- User:', settings.smtpUser);
    console.log('- From:', settings.smtpFrom);

    const transporter = nodemailer.createTransport({
      host: settings.smtpHost || 'smtp.gmail.com',
      port: settings.smtpPort || 587,
      secure: settings.smtpSecure || false,
      auth: {
        user: settings.smtpUser,
        pass: settings.smtpPass,
      },
    });

    console.log('Attempting to send test email...');
    
    const info = await transporter.sendMail({
      from: settings.smtpFrom || '"Toollix Diagnostics" <support@toollix.io>',
      to: 'faizanansasri400@gmail.com',
      subject: '🚀 Toollix.io SMTP Infrastructure Test',
      text: 'This is a diagnostic message sent from the backend to verify your SMTP configuration. If you see this, your email engine is operational.',
      html: `
        <div style="font-family: sans-serif; padding: 40px; background-color: #f8fafc; border-radius: 20px; color: #1e293b;">
          <h2 style="color: #CD9A32;">Toollix Engine Verified</h2>
          <p>Your SMTP configuration is now fully operational.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
          <p style="font-size: 12px; color: #64748b;">Recipient: faizanansasri400@gmail.com</p>
          <p style="font-size: 12px; color: #64748b;">Timestamp: ${new Date().toISOString()}</p>
        </div>
      `,
    });

    console.log('SUCCESS!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);

  } catch (err) {
    console.error('CRITICAL ERROR DURING DISPATCH:');
    console.error(err);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
    process.exit(0);
  }
}

run();
