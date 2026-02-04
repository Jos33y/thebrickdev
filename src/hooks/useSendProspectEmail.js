/**
 * useSendProspectEmail - Hook for sending emails to prospects via Resend API
 * 
 * This is the ONLY file that handles email sending logic.
 * useEmailTemplates.js handles template CRUD only.
 */

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Hook: Send prospect email via Vercel API
 * 
 * The API handles:
 * - Sending via Resend
 * - Logging to email_send_log
 * - Creating activity
 * - Auto-advancing stage
 * - Setting follow-up dates
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
      // Call Vercel serverless function - it handles everything
      const response = await fetch('/api/send-prospect-email', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: prospect.email,
          toName: prospect.name,
          subject,
          body,
          prospectId: prospect.id,
          templateId: template?.id || null,
          templateType: template?.template_type || 'custom',
          fromName: settings?.owner_name || 'The Brick Dev Studios',
          fromEmail: settings?.company_email || 'developer@thebrickdev.com',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send email');
      }

      // Invalidate queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ['prospects'] });
      queryClient.invalidateQueries({ queryKey: ['prospect', prospect.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });

      setIsPending(false);
      return { success: true, data };

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