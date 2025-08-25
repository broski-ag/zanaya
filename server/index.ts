import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { BookingData } from '../src/types';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Email transporter configuration
const createTransporter = () => {
  // Check if email configuration is available
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.warn('Warning: Email configuration not found. Email functionality will be disabled.');
    return null;
  }

  return nodemailer.createTransporter({
    service: 'gmail', // You can change this to your email provider
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD, // Use app password for Gmail
    },
  });
};

// Generate email HTML content
const generateEmailHTML = (bookingData: BookingData) => {
  const { religion, selectedKitItems, selectedServices, personalInfo } = bookingData;
  
  const kitTotal = selectedKitItems.reduce((sum, item) => sum + item.price, 0);
  const servicesTotal = selectedServices.reduce((sum, service) => sum + service.price, 0);
  const grandTotal = kitTotal + servicesTotal;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .section { margin-bottom: 25px; }
        .section h3 { color: #667eea; border-bottom: 2px solid #667eea; padding-bottom: 5px; }
        .item { padding: 10px; border-left: 3px solid #667eea; margin: 10px 0; background: #f8f9fa; }
        .total { background: #667eea; color: white; padding: 15px; text-align: center; font-size: 18px; font-weight: bold; }
        .contact-info { background: #f8f9fa; padding: 15px; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🙏 ZANAYA - Last Rites Service Booking</h1>
        <p>New booking received</p>
      </div>
      
      <div class="content">
        <div class="section">
          <h3>👤 Personal Details</h3>
          <div class="contact-info">
            <p><strong>Name:</strong> ${personalInfo.name}</p>
            <p><strong>Email:</strong> ${personalInfo.email}</p>
            <p><strong>Phone:</strong> ${personalInfo.phone}</p>
            <p><strong>Address:</strong> ${personalInfo.address}</p>
          </div>
        </div>

        <div class="section">
          <h3>🕉️ Religion</h3>
          <p><strong>${religion?.name}</strong> - ${religion?.description}</p>
        </div>

        ${selectedKitItems.length > 0 ? `
        <div class="section">
          <h3>📦 Selected Kit Items</h3>
          ${selectedKitItems.map(item => `
            <div class="item">
              <strong>${item.name}</strong> - ₹${item.price}
              <br><small>${item.description}</small>
              ${item.required ? '<span style="color: red; font-size: 12px;">(Required)</span>' : ''}
            </div>
          `).join('')}
          <p><strong>Kit Subtotal: ₹${kitTotal}</strong></p>
        </div>
        ` : ''}

        ${selectedServices.length > 0 ? `
        <div class="section">
          <h3>🔧 Additional Services</h3>
          ${selectedServices.map(service => `
            <div class="item">
              <strong>${service.name}</strong> - ₹${service.price}
              <br><small>${service.description}</small>
              ${service.duration ? `<br><small>Duration: ${service.duration}</small>` : ''}
            </div>
          `).join('')}
          <p><strong>Services Subtotal: ₹${servicesTotal}</strong></p>
        </div>
        ` : ''}

        <div class="total">
          GRAND TOTAL: ₹${grandTotal}
        </div>

        <div class="section">
          <p><strong>Next Steps:</strong></p>
          <ul>
            <li>Contact the customer within 30 minutes</li>
            <li>Confirm all details and timing</li>
            <li>Arrange for the selected services</li>
            <li>Coordinate with the appropriate religious authorities</li>
          </ul>
        </div>
      </div>
    </body>
    </html>
  `;
};

// API endpoint to handle booking submissions
app.post('/api/submit-booking', async (req, res) => {
  try {
    const bookingData: BookingData = req.body;

    // Validate required fields
    if (!bookingData.personalInfo.name || !bookingData.personalInfo.name.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name is required' 
      });
    }

    if (!bookingData.personalInfo.email || !bookingData.personalInfo.email.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(bookingData.personalInfo.email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please enter a valid email address' 
      });
    }

    if (!bookingData.personalInfo.address || !bookingData.personalInfo.address.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Address is required' 
      });
    }

    if (!bookingData.personalInfo.phone || !bookingData.personalInfo.phone.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Phone number is required' 
      });
    }

    if (!bookingData.religion) {
      return res.status(400).json({ 
        success: false, 
        message: 'Religion selection is required' 
      });
    }

    // Create email transporter
    const transporter = createTransporter();

    // Send email only if transporter is available
    if (transporter) {
      try {
        // Email content
        const emailHTML = generateEmailHTML(bookingData);
        
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER, // Send to admin email
          subject: `New ZANAYA Booking - ${bookingData.personalInfo.name}`,
          html: emailHTML,
        };

        // Send email
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
      } catch (emailError) {
        console.error('Error sending email:', emailError);
        // Don't fail the entire request if email fails
      }
    } else {
      console.log('Email not configured - booking saved without email notification');
    }

    // Log booking for debugging (in production, save to database)
    console.log('New booking received:', {
      timestamp: new Date().toISOString(),
      customer: bookingData.personalInfo.name,
      religion: bookingData.religion.name,
      total: bookingData.selectedKitItems.reduce((sum, item) => sum + item.price, 0) + 
             bookingData.selectedServices.reduce((sum, service) => sum + service.price, 0)
    });

    res.json({ 
      success: true, 
      message: 'Booking submitted successfully. You will be contacted shortly.' 
    });

  } catch (error) {
    console.error('Error processing booking:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to process booking. Please try again.' 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`✅ ZANAYA Backend Server running on port ${PORT}`);
  console.log(`📧 Email configured: ${process.env.EMAIL_USER ? 'Yes' : 'No'}`);
  console.log(`🔗 API endpoint: http://localhost:${PORT}/api`);
});