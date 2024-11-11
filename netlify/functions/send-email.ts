import { Handler } from '@netlify/functions';
import * as nodemailer from 'nodemailer';

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const handler: Handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed'
    };
  }

  try {
    const { to, subject, body } = JSON.parse(event.body || '{}');

    // Validate required fields
    if (!to || !subject || !body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    // Send mail with defined transport object
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"Loopcore" <notifications@loopcore.app>',
      to,
      subject,
      text: body,
      html: body.replace(/\n/g, '<br>')
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Email sent successfully' })
    };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to send email' })
    };
  }
};

export { handler };