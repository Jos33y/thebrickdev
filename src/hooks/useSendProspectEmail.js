/**
 * useSendProspectEmail - Hook for sending emails to prospects via Resend API
 * 
 * This is the ONLY file that handles email sending logic.
 * useEmailTemplates.js handles template CRUD only.
 */

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { addDays, format } from 'date-fns';

/**
 * Map template types to the stage they should advance to
 */
const TEMPLATE_STAGE_MAP = {
  initial_outreach: 'contacted',
  follow_up_1: 'contacted',
  follow_up_2: 'contacted',
  follow_up_3: 'no_response',
  proposal: 'proposal_sent',
  custom: null,
};

/**
 * Generate HTML email from plain text
 */
const generateEmailHTML = ({ body, companyName = 'The Brick Dev Studios' }) => {
  const htmlBody = body
    .split('\n')
    .map(line => line.trim() === '' ? '<br>' : `<p style="margin: 0 0 10px 0;">${line}</p>`)
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
  <div style="background-color: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    ${htmlBody}
    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e5e5; text-align: center; color: #888; font-size: 12px;">
      <p style="margin: 0;">Sent via ${companyName}</p>
    </div>
  </div>
</body>
</html>`;
};

/**
 * Hook: Send prospect email via Vercel API
 */
export function useSendProspectEmail() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState(null);
  const queryClient = useQueryClient();

  const reset = () => setError(null);

  const sendEmail = async ({ prospect, template, subject, body, settings }) => {
    setIsPending(true);
    setError(null);

    try {
      // Generate HTML version
      const html = generateEmailHTML({
        body,
        companyName: settings?.company_name || 'The Brick Dev Studios',
      });

      // Call Vercel serverless function
      const response = await fetch('/api/send-prospect-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: prospect.email,
          subject,
          html,
          text: body,
          replyTo: settings?.company_email || 'hello@thebrickdev.com',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send email');
      }

      // Log email in database
      await supabase
        .from('prospect_emails')
        .insert([{
          prospect_id: prospect.id,
          template_id: template?.id || null,
          template_type: template?.template_type || 'custom',
          to_email: prospect.email,
          subject,
          body,
          resend_id: data.data?.id || null,
          status: 'sent',
        }]);

      // Log activity
      await supabase
        .from('prospect_activities')
        .insert([{
          prospect_id: prospect.id,
          activity_type: 'email_sent',
          description: `Email sent: ${template?.name || 'Custom Email'} - "${subject}"`,
        }]);

      // Update last_contacted_at
      await supabase
        .from('prospects')
        .update({ last_contacted_at: new Date().toISOString() })
        .eq('id', prospect.id);

      // Handle auto-advance stage (if template specifies it)
      if (template?.template_type) {
        const nextStage = TEMPLATE_STAGE_MAP[template.template_type];
        if (nextStage && prospect.stage !== nextStage) {
          await supabase
            .from('prospects')
            .update({ stage: nextStage })
            .eq('id', prospect.id);
        }
      }

      // Set next follow-up based on template type
      const followUpDays = {
        initial_outreach: 3,
        follow_up_1: 4,
        follow_up_2: 7,
        proposal: 5,
      };
      
      const days = followUpDays[template?.template_type];
      if (days) {
        const nextFollowUp = addDays(new Date(), days);
        await supabase
          .from('prospects')
          .update({ next_follow_up: format(nextFollowUp, 'yyyy-MM-dd') })
          .eq('id', prospect.id);
      }

      // Clear follow-up for breakup email
      if (template?.template_type === 'follow_up_3') {
        await supabase
          .from('prospects')
          .update({ next_follow_up: null })
          .eq('id', prospect.id);
      }

      // Invalidate queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ['prospects'] });
      queryClient.invalidateQueries({ queryKey: ['prospect', prospect.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });

      setIsPending(false);
      return { success: true, data: data.data };

    } catch (err) {
      const errorMessage = err.message || 'Failed to send email';
      setError(errorMessage);
      setIsPending(false);
      return { success: false, error: errorMessage };
    }
  };

  return { sendEmail, isPending, error, reset };
}

export default useSendProspectEmail;