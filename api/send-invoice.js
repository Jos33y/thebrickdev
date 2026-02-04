// api/send-invoice.js
// This becomes: POST /api/send-invoice
// 
// Supports PDF attachment via:
// - pdfBase64: base64 encoded PDF content
// - pdfUrl: URL to hosted PDF file

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;

  if (!RESEND_API_KEY) {
    return res.status(500).json({ error: 'RESEND_API_KEY not configured' });
  }

  try {
    const { to, subject, html, text, pdfBase64, pdfUrl, invoiceNumber } = req.body;

    // Validate
    if (!to || !subject || !html) {
      return res.status(400).json({ error: 'Missing required fields: to, subject, html' });
    }

    // Build attachments array if PDF provided
    const attachments = [];
    
    if (pdfBase64) {
      // Base64 encoded PDF from client
      attachments.push({
        content: pdfBase64,
        filename: `${invoiceNumber || 'invoice'}.pdf`,
      });
    } else if (pdfUrl) {
      // Remote PDF URL
      attachments.push({
        path: pdfUrl,
        filename: `${invoiceNumber || 'invoice'}.pdf`,
      });
    }

    // Build email payload
    const emailPayload = {
      from: 'The Brick Dev Studios <developer@thebrickdev.com>',
      reply_to: 'hello@thebrickdev.com',
      to: [to],
      subject,
      html,
      text,
    };

    // Add attachments if present
    if (attachments.length > 0) {
      emailPayload.attachments = attachments;
    }

    // Send via Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Resend error:', data);
      return res.status(400).json({ error: data.message || 'Failed to send email' });
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}