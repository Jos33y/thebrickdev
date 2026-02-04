/**
 * API Route: /api/send-prospect-email
 * 
 * Sends email to prospect via Resend API
 * - Logs to email_send_log table
 * - Creates activity on prospect
 * - Auto-advances stage if initial outreach
 * - Sets next follow-up date
 * 
 * Required Vercel Environment Variables:
 * - RESEND_API_KEY
 * - SUPABASE_URL
 * - SUPABASE_ANON_KEY (or SUPABASE_SERVICE_ROLE_KEY for full access)
 */

import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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

    // Validate
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

    // Send via Resend REST API
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
      
      // Log failed attempt
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

    // Get template type label for activity
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

    // Auto-advance stage and set follow-up based on email type
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
}