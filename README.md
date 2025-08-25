# ZANAYA - Last Rites Services

A comprehensive web application for booking last rites services across different religions.

## Features

- Multi-religion support (Hindu, Muslim, Christian, Sikh, Buddhist, Jain)
- Customizable kit items and services
- Professional service booking
- Email confirmation system
- Responsive design

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and update with your email configuration:

```bash
cp .env.example .env
```

Update the following variables in `.env`:

- `EMAIL_USER`: Your email address (Gmail recommended)
- `EMAIL_PASSWORD`: Your email app password (for Gmail, generate an app password)
- `ADMIN_EMAIL`: Email address where booking confirmations will be sent
- `PORT`: Server port (default: 3001)

### 3. Gmail Setup (Recommended)

For Gmail users:

1. Enable 2-factor authentication on your Google account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
   - Use this password in `EMAIL_PASSWORD`

### 4. Run the Application

#### Development Mode (Frontend + Backend)

```bash
npm run dev:full
```

This will start:
- Frontend on `http://localhost:5173`
- Backend API on `http://localhost:3001`

#### Run Frontend Only

```bash
npm run dev
```

#### Run Backend Only

```bash
npm run dev:server
```

### 5. Build for Production

```bash
npm run build
```

## API Endpoints

- `POST /api/submit-booking` - Submit a new booking
- `GET /api/health` - Health check

## Email Configuration

The system supports various email providers. Update the transporter configuration in `server/index.ts` for different providers:

```typescript
// For other email providers
const transporter = nodemailer.createTransporter({
  host: 'your-smtp-host.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});
```

## Project Structure

```
├── src/
│   ├── components/     # React components
│   ├── data/          # Static data (religions, kits, services)
│   ├── types/         # TypeScript type definitions
│   └── App.tsx        # Main application component
├── server/
│   └── index.ts       # Express server with email functionality
├── .env.example       # Environment variables template
└── README.md          # This file
```

## Troubleshooting

### Email Issues

1. **Gmail Authentication Error**: Make sure you're using an App Password, not your regular password
2. **Email Not Sending**: Check your email provider's SMTP settings
3. **Firewall Issues**: Ensure port 587 (or your SMTP port) is not blocked

### Development Issues

1. **Port Conflicts**: Change the PORT in `.env` if 3001 is already in use
2. **CORS Issues**: The frontend proxy is configured to handle API calls to the backend

## Support

For technical support or questions about the ZANAYA service, contact: +91 8273441052