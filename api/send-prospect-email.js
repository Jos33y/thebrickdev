/**
 * API Route: /api/send-prospect-email
 * 
 * Sends email to prospect via Resend API
 * - Logs to email_send_log table
 * - Creates activity on prospect
 * - Auto-advances stage if initial outreach
 * - Sets next follow-up date
 */

import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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

    // Send via Resend
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [to],
      reply_to: fromEmail,
      subject: subject,
      html: emailHtml,
      text: body,
    });

    if (emailError) {
      console.error('Resend error:', emailError);
      
      // Log failed attempt
      await supabase.from('email_send_log').insert({
        prospect_id: prospectId,
        template_id: templateId || null,
        to_email: to,
        to_name: toName || null,
        subject,
        body,
        status: 'failed',
        error_message: emailError.message,
      });

      return res.status(500).json({ error: emailError.message });
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
      // Advance to contacted, follow-up in 3 days
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
        from_stage: 'identified',
        to_stage: 'contacted',
      });
    } else if (templateType === 'follow_up_1') {
      // Next follow-up in 4 days
      await supabase
        .from('prospects')
        .update({ 
          next_follow_up: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        })
        .eq('id', prospectId);
    } else if (templateType === 'follow_up_2') {
      // Next follow-up in 7 days
      await supabase
        .from('prospects')
        .update({ 
          next_follow_up: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        })
        .eq('id', prospectId);
    } else if (templateType === 'follow_up_3') {
      // Clear follow-up after breakup email
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