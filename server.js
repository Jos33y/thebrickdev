import express from 'express';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));

// ─── API ROUTES ───────────────────────────────────────────────

// POST /api/send-invoice
app.post('/api/send-invoice', async (req, res) => {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;

  if (!RESEND_API_KEY) {
    return res.status(500).json({ error: 'RESEND_API_KEY not configured' });
  }

  try {
    const { to, subject, html, text, pdfBase64, pdfUrl, invoiceNumber } = req.body;

    if (!to || !subject || !html) {
      return res.status(400).json({ error: 'Missing required fields: to, subject, html' });
    }

    const attachments = [];

    if (pdfBase64) {
      attachments.push({
        content: pdfBase64,
        filename: `${invoiceNumber || 'invoice'}.pdf`,
      });
    } else if (pdfUrl) {
      attachments.push({
        path: pdfUrl,
        filename: `${invoiceNumber || 'invoice'}.pdf`,
      });
    }

    const emailPayload = {
      from: 'The Brick Dev Studios <developer@thebrickdev.com>',
      reply_to: 'hello@thebrickdev.com',
      to: [to],
      subject,
      html,
      text,
    };

    if (attachments.length > 0) {
      emailPayload.attachments = attachments;
    }

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
});

// POST /api/send-prospect-email
app.post('/api/send-prospect-email', async (req, res) => {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!RESEND_API_KEY) {
    return res.status(500).json({ error: 'RESEND_API_KEY not configured' });
  }

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return res.status(500).json({ error: 'Supabase environment variables not configured' });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  try {
    const {
      to,
      toName,
      subject,
      body,
      prospectId,
      templateId,
      templateType,
      fromName,
      fromEmail,
    } = req.body;

    if (!to || !subject || !body || !prospectId) {
      return res.status(400).json({
        error: 'Missing required fields: to, subject, body, prospectId'
      });
    }

    // Convert plain text to HTML
    const htmlBody = body
      .split('\n\n').map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 15px;
      line-height: 1.6;
      color: #1a1a1a;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    p { margin: 0 0 16px 0; }
    a { color: #c54b1a; }
  </style>
</head>
<body>
  ${htmlBody}
</body>
</html>`;

    // Send via Resend
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${fromName || 'The Brick Dev Studios'} <${fromEmail || 'developer@thebrickdev.com'}>`,
        reply_to: fromEmail || 'hello@thebrickdev.com',
        to: [to],
        subject,
        html: emailHtml,
        text: body,
      }),
    });

    const emailData = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error('Resend error:', emailData);

      await supabase.from('email_send_log').insert({
        prospect_id: prospectId,
        template_id: templateId || null,
        to_email: to,
        to_name: toName || null,
        subject,
        body,
        status: 'failed',
        error_message: emailData.message || 'Failed to send',
      });

      return res.status(500).json({ error: emailData.message || 'Failed to send email' });
    }

    // Log successful send
    await supabase.from('email_send_log').insert({
      prospect_id: prospectId,
      template_id: templateId || null,
      to_email: to,
      to_name: toName || null,
      subject,
      body,
      status: 'sent',
      resend_id: emailData?.id || null,
    });

    // Get template type label
    const typeLabels = {
      initial_outreach: 'Initial Outreach',
      follow_up_1: 'Follow-up #1',
      follow_up_2: 'Follow-up #2',
      follow_up_3: 'Follow-up #3',
      proposal: 'Proposal',
      custom: 'Email',
    };
    const typeLabel = typeLabels[templateType] || 'Email';

    // Log activity
    await supabase.from('prospect_activities').insert({
      prospect_id: prospectId,
      activity_type: 'email_sent',
      description: `${typeLabel} sent: "${subject}"`,
    });

    // Update last_contacted_at
    await supabase
      .from('prospects')
      .update({ last_contacted_at: new Date().toISOString() })
      .eq('id', prospectId);

    // Get current prospect stage
    const { data: prospect } = await supabase
      .from('prospects')
      .select('stage')
      .eq('id', prospectId)
      .single();

    // Auto-advance stage and set follow-up
    if (templateType === 'initial_outreach' && prospect?.stage === 'identified') {
      await supabase
        .from('prospects')
        .update({
          stage: 'contacted',
          next_follow_up: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        })
        .eq('id', prospectId);

      await supabase.from('prospect_activities').insert({
        prospect_id: prospectId,
        activity_type: 'stage_change',
        description: 'Stage: Identified → Contacted',
      });
    } else if (templateType === 'follow_up_1') {
      await supabase
        .from('prospects')
        .update({
          next_follow_up: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        })
        .eq('id', prospectId);
    } else if (templateType === 'follow_up_2') {
      await supabase
        .from('prospects')
        .update({
          next_follow_up: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        })
        .eq('id', prospectId);
    } else if (templateType === 'follow_up_3') {
      await supabase
        .from('prospects')
        .update({ next_follow_up: null })
        .eq('id', prospectId);
    }

    return res.status(200).json({
      success: true,
      message: `Email sent to ${to}`,
      emailId: emailData?.id,
    });

  } catch (error) {
    console.error('Send prospect email error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// ─── STATIC FILES ─────────────────────────────────────────────

// Serve Vite build output
app.use(express.static(path.join(__dirname, 'dist')));

// SPA fallback — all non-API routes serve index.html
app.get('{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// ─── START ────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
