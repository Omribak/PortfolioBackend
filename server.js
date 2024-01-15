const express = require('express');
const router = express.Router();
const cors = require('cors');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const app = express();
app.use(
  cors({
    origin: 'https://new-portfolio-vja2.onrender.com'
  })
);
app.use(express.json());
app.use('/', router);

const port = process.env.PORT;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

console.log(process.env.GMAIL_USER);

const contactEmail = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_AUTH
  }
});

contactEmail.verify((error) => {
  if (error) {
    console.log(error);
  } else {
    console.log('Mail is configured...');
  }
});

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPhoneNumber(phone) {
  const phoneRegex = /^[0-9]+$/;
  return phoneRegex.test(phone);
}

router.get('/', (req, res) => {
  return res.status(200).json({
    message: 'This is my Portfolio api'
  });
});

router.post('/contact', (req, res) => {
  const name = req.body.firstName + ' ' + req.body.Lastname;
  const { email, message, phone } = req.body;

  if (!req.body.firstName || !req.body.Lastname || !req.body.email) {
    return res.status(400).json({
      success: false,
      message: 'First name, Last name, and Email are required fields.'
    });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid email format.'
    });
  }

  if (phone && !isValidPhoneNumber(phone)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid phone number format.'
    });
  }

  if (!req.body.message) {
    return res.status(400).json({
      success: false,
      message: 'Message is a required field.'
    });
  }

  const mailOptions = {
    from: name,
    to: process.env.GMAIL_USER,
    subject: 'New Portfolio Contact Form Message',
    html: `
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Phone:</strong> ${phone}</p>
    <p><strong>Message:</strong> ${message}</p>
  `
  };

  // Send the email
  contactEmail.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: 'Failed to send email'
      });
    } else {
      console.log('Email sent: ' + info.response);
      return res.status(200).json({
        success: true,
        message: 'Email sent successfully'
      });
    }
  });
});
