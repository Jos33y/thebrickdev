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

// ─── HELPERS ──────────────────────────────────────────────────

function getSupabaseAdmin() {
  const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY;
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error('Supabase environment variables not configured');
  }
  return createClient(SUPABASE_URL, SUPABASE_KEY);
}

// ─── API ROUTES ───────────────────────────────────────────────

// POST /api/send-invoice
app.post('/api/send-invoice', async (req, res) => {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;

  if (!RESEND_API_KEY) {
    return res.status(500).json({ error: 'RESEND_API_KEY not configured' });
  }

  try {
    const { to, subject, html, text, pdfBase64, pdfUrl, invoiceNumber, from, replyTo } = req.body;

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
      from: from || 'Billing @ The Brick Dev <billing@thebrickdev.com>',
      reply_to: replyTo || 'billing@thebrickdev.com',
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
  const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY;

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

// POST /api/create-payment-link
//
// Body: { invoice_id: uuid }
//
// Fetches the invoice + client from Supabase, calls Flutterwave to generate
// a hosted payment link, stores link URL + tx_ref on the invoice row, returns them.
//
// Env vars needed:
//   FLUTTERWAVE_SECRET_KEY  (test key first, swap for live later)
//   APP_URL                 (e.g. https://thebrickdev.com)
//   VITE_SUPABASE_URL
//   SUPABASE_SECRET_KEY
app.post('/api/create-payment-link', async (req, res) => {
  const FLUTTERWAVE_SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY;
  const APP_URL = process.env.APP_URL || 'https://thebrickdev.com';

  if (!FLUTTERWAVE_SECRET_KEY) {
    return res.status(500).json({ error: 'FLUTTERWAVE_SECRET_KEY not configured' });
  }

  try {
    const { invoice_id } = req.body;

    if (!invoice_id) {
      return res.status(400).json({ error: 'Missing required field: invoice_id' });
    }

    const supabase = getSupabaseAdmin();

    // 1. Fetch invoice + client + settings.logo_url
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select(`
        id,
        invoice_number,
        public_token,
        project_reference,
        currency,
        total,
        amount_paid,
        status,
        client:clients (
          id,
          name,
          email,
          phone,
          company
        )
      `)
      .eq('id', invoice_id)
      .single();

    if (invoiceError || !invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Fetch logo from settings (fall back to production if not set).
    // Never use APP_URL for the logo - it might be localhost, which
    // Flutterwave's servers can't reach when rendering the checkout page.
    const { data: settingsRow } = await supabase
      .from('settings')
      .select('logo_url')
      .limit(1)
      .maybeSingle();

    const logoUrl =
      settingsRow?.logo_url ||
      'https://thebrickdev.com/apple-touch-icon.png';

    // 2. Validate
    if (!invoice.client) {
      return res.status(400).json({ error: 'Invoice has no client attached' });
    }
    if (!invoice.client.email) {
      return res.status(400).json({ error: 'Client email is required for payment links' });
    }
    if (invoice.status === 'paid') {
      return res.status(400).json({ error: 'Invoice is already fully paid' });
    }

    const total = Number(invoice.total || 0);
    const paid = Number(invoice.amount_paid || 0);
    const outstanding = Number((total - paid).toFixed(2));

    if (outstanding <= 0) {
      return res.status(400).json({ error: 'Nothing outstanding on this invoice' });
    }

    // 3. Build unique tx_ref (allows regeneration if needed)
    const tx_ref = `${invoice.invoice_number}-${Date.now()}`;

    // 4. Choose payment options by currency.
    //
    // Per Flutterwave v3 payment_options docs, values are specific:
    //   - card        = International + local card payments
    //   - account     = UK/EU Pay With Bank (via token.io) — enable on dashboard
    //   - banktransfer= NGN Pay With Bank Transfer (PWBT) via NUBAN — NGN only
    //   - ussd        = Nigerian USSD codes
    //   - mobilemoney = Ghana/Kenya/etc mobile money
    //
    // Defaults matched to what The Brick Dev has enabled on dashboard:
    //   GBP/EUR → card, account (UK/EU bank via token.io)
    //   NGN     → card, banktransfer, ussd (full Nigerian rails)
    //   USD     → card (safest international rail)
    //
    // Note: if "Enable Dashboard Payment Options" is ON in Flutterwave dashboard,
    // this field is ignored and dashboard settings win. Turn it off for
    // per-invoice control.
    let payment_options = 'card';
    if (invoice.currency === 'NGN') {
      payment_options = 'card, banktransfer, ussd';
    } else if (invoice.currency === 'GBP' || invoice.currency === 'EUR') {
      payment_options = 'card, account';
    }

    // 5. Build the Flutterwave payload.
    // Flutterwave appends `?status=successful&tx_ref=...&transaction_id=...`
    // to the redirect_url automatically. The invoice page reads those params.
    const redirect_url = `${APP_URL}/invoice/${invoice.public_token}`;

    const flutterwavePayload = {
      tx_ref,
      amount: String(outstanding),
      currency: invoice.currency || 'USD',
      redirect_url,
      payment_options,
      customer: {
        email: invoice.client.email,
        phonenumber: invoice.client.phone || '',
        name: invoice.client.name,
      },
      customizations: {
        title: invoice.project_reference || `Invoice ${invoice.invoice_number}`,
        description: `Payment for invoice ${invoice.invoice_number}`,
        logo: logoUrl,
      },
      meta: {
        invoice_id: invoice.id,
        invoice_number: invoice.invoice_number,
        client_id: invoice.client.id,
        public_token: invoice.public_token,
      },
    };

    // 6. Call Flutterwave
    const fwResponse = await fetch('https://api.flutterwave.com/v3/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(flutterwavePayload),
    });

    const fwData = await fwResponse.json();

    if (!fwResponse.ok || fwData.status !== 'success') {
      console.error('Flutterwave error:', fwData);
      return res.status(400).json({
        error: fwData.message || 'Failed to create payment link',
        details: fwData,
      });
    }

    const payment_link_url = fwData.data?.link;

    if (!payment_link_url) {
      return res.status(500).json({ error: 'Flutterwave returned no link', details: fwData });
    }

    // 7. Save to the invoice
    const { error: updateError } = await supabase
      .from('invoices')
      .update({
        payment_link_url,
        payment_link_ref: tx_ref,
        payment_link_provider: 'flutterwave',
      })
      .eq('id', invoice.id);

    if (updateError) {
      console.error('Failed to persist payment link:', updateError);
      // Still return the link so the user isn't blocked, but flag it
      return res.status(200).json({
        success: true,
        payment_link_url,
        payment_link_ref: tx_ref,
        warning: 'Link created but not saved to invoice. Save manually.',
      });
    }

    return res.status(200).json({
      success: true,
      payment_link_url,
      payment_link_ref: tx_ref,
    });
  } catch (error) {
    console.error('Create payment link error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// POST /api/webhooks/flutterwave
//
// Receives Flutterwave webhook events (primarily `charge.completed`).
// Full audit trail: every event is logged to flutterwave_webhook_events
// regardless of outcome. Idempotent: duplicate webhooks are detected via
// provider_transaction_id and skipped safely.
//
// Security flow:
//   1. Verify `verif-hash` header against FLUTTERWAVE_WEBHOOK_SECRET
//   2. Log event to audit table (even if hash fails, for forensics)
//   3. If hash fails, reject with 401
//   4. For successful charges, verify server-side via /transactions/:id/verify
//      (never trust webhook payload alone - Flutterwave docs recommend this)
//   5. Only then create payment records and update invoice
//
// Idempotency: provider_transaction_id (Flutterwave's data.id) is unique.
// If a payment already exists with that id, we skip and return 200 so
// Flutterwave stops retrying.
//
// Env vars:
//   FLUTTERWAVE_SECRET_KEY       (for /verify call)
//   FLUTTERWAVE_WEBHOOK_SECRET   (must match what's set in FW dashboard)
app.post('/api/webhooks/flutterwave', async (req, res) => {
  const WEBHOOK_SECRET = process.env.FLUTTERWAVE_WEBHOOK_SECRET;
  const FLW_SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY;

  const providedHash = req.headers['verif-hash'];
  const hashValid = Boolean(WEBHOOK_SECRET && providedHash === WEBHOOK_SECRET);

  const payload = req.body || {};
  const data = payload.data || {};

  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch (err) {
    console.error('Webhook: Supabase not configured', err);
    return res.status(500).json({ error: 'Server misconfigured' });
  }

  // 1. Always log the event first (audit trail)
  const { data: eventRow, error: logError } = await supabase
    .from('flutterwave_webhook_events')
    .insert({
      event_type: payload.event || 'unknown',
      tx_ref: data.tx_ref || null,
      flutterwave_tx_id: data.id || null,
      invoice_id: data.meta?.invoice_id || null,
      status: data.status || null,
      amount: data.amount || null,
      currency: data.currency || null,
      payment_type: data.payment_type || null,
      charged_amount: data.charged_amount || null,
      raw_payload: payload,
      verif_hash_valid: hashValid,
    })
    .select()
    .single();

  if (logError) {
    console.error('Webhook: failed to log event', logError);
    // Log failure isn't fatal - continue processing
  }

  const eventId = eventRow?.id;

  // Helper to mark event processed with an optional error message
  async function markProcessed(errorMessage = null) {
    if (!eventId) return;
    await supabase
      .from('flutterwave_webhook_events')
      .update({
        processed: true,
        processed_at: new Date().toISOString(),
        error_message: errorMessage,
      })
      .eq('id', eventId);
  }

  // 2. Reject if signature invalid
  if (!hashValid) {
    await markProcessed('Invalid verif-hash');
    return res.status(401).json({ error: 'Invalid webhook signature' });
  }

  // 3. Only act on successful charge.completed events
  if (payload.event !== 'charge.completed' || data.status !== 'successful') {
    await markProcessed(`Ignored: event=${payload.event}, status=${data.status}`);
    return res.status(200).json({ received: true, action: 'ignored' });
  }

  try {
    // 4. Idempotency check - already processed this Flutterwave transaction?
    const { data: existing } = await supabase
      .from('payment_platform_details')
      .select('id, payment_id')
      .eq('provider_transaction_id', String(data.id))
      .maybeSingle();

    if (existing) {
      await markProcessed('Duplicate - already processed');
      return res.status(200).json({
        received: true,
        action: 'duplicate',
        payment_id: existing.payment_id,
      });
    }

    // 5. Server-side verification (don't trust webhook payload alone)
    if (!FLW_SECRET_KEY) {
      await markProcessed('FLUTTERWAVE_SECRET_KEY not configured');
      return res.status(500).json({ error: 'Cannot verify transaction' });
    }

    const verifyResponse = await fetch(
      `https://api.flutterwave.com/v3/transactions/${data.id}/verify`,
      { headers: { Authorization: `Bearer ${FLW_SECRET_KEY}` } }
    );
    const verifyData = await verifyResponse.json();

    if (
      verifyData.status !== 'success' ||
      verifyData.data?.status !== 'successful'
    ) {
      await markProcessed(`Verification failed: ${JSON.stringify(verifyData).slice(0, 500)}`);
      return res.status(400).json({ error: 'Transaction verification failed' });
    }

    const verified = verifyData.data;

    // 6. Locate the invoice - prefer meta.invoice_id, fall back to tx_ref
    let invoice = null;

    if (data.meta?.invoice_id) {
      const { data: inv } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', data.meta.invoice_id)
        .maybeSingle();
      invoice = inv;
    }

    if (!invoice && data.tx_ref) {
      const { data: inv } = await supabase
        .from('invoices')
        .select('*')
        .eq('payment_link_ref', data.tx_ref)
        .maybeSingle();
      invoice = inv;
    }

    if (!invoice) {
      await markProcessed(`Invoice not found for tx_ref=${data.tx_ref}`);
      // Return 200 so Flutterwave doesn't retry indefinitely for a payment
      // we can't reconcile. The audit log preserves the payload for manual review.
      return res.status(200).json({
        received: true,
        action: 'unreconciled',
        warning: 'No matching invoice',
      });
    }

    // 7. Extract verified amounts (use /verify response, not webhook)
    const receivedAmount = Number(verified.amount || 0);
    const chargedAmount = Number(verified.charged_amount || receivedAmount);
    const appFee = Number(verified.app_fee || 0);
    const currency = verified.currency || invoice.currency;
    const paymentMethod = verified.payment_type || 'unknown';
    const receivedDate = verified.created_at
      ? new Date(verified.created_at).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];

    // 8. Insert payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        invoice_id: invoice.id,
        payment_type: 'platform',
        amount_received: receivedAmount,
        currency_received: currency,
        received_date: receivedDate,
        status: 'cleared',
        cleared_date: receivedDate,
        notes: `Flutterwave ${paymentMethod} charge. flw_ref: ${verified.flw_ref || 'n/a'}`,
      })
      .select()
      .single();

    if (paymentError) {
      await markProcessed(`Payment insert failed: ${paymentError.message}`);
      return res.status(500).json({ error: 'Failed to record payment' });
    }

    // 9. Insert platform details
    const { error: detailsError } = await supabase
      .from('payment_platform_details')
      .insert({
        payment_id: payment.id,
        platform: 'flutterwave',
        transaction_reference: data.tx_ref,       // OUR tx_ref (BRK-...)
        provider_transaction_id: String(data.id), // Flutterwave's numeric ID (API verify)
        provider_reference: verified.flw_ref,     // Flutterwave's flw_ref (human-readable)
        charged_amount: chargedAmount,
        provider_fee: appFee,
        payment_method: paymentMethod,
      });

    if (detailsError) {
      await markProcessed(`Platform details insert failed: ${detailsError.message}`);
      return res.status(500).json({ error: 'Failed to record platform details' });
    }

    // 10. Update invoice status + amount_paid
    const newAmountPaid = Number(
      (Number(invoice.amount_paid || 0) + receivedAmount).toFixed(2)
    );
    const total = Number(invoice.total || 0);
    const isFullyPaid = newAmountPaid >= total;
    const newStatus = isFullyPaid ? 'paid' : 'partially_paid';

    await supabase
      .from('invoices')
      .update({
        status: newStatus,
        amount_paid: newAmountPaid,
        paid_at: isFullyPaid ? new Date().toISOString() : invoice.paid_at,
      })
      .eq('id', invoice.id);

    // 11. Link the webhook event to the created payment + invoice for audit
    if (eventId) {
      await supabase
        .from('flutterwave_webhook_events')
        .update({
          processed: true,
          processed_at: new Date().toISOString(),
          invoice_id: invoice.id,
        })
        .eq('id', eventId);
    }

    console.log(
      `Webhook processed: invoice=${invoice.invoice_number} ` +
      `amount=${receivedAmount}${currency} status=${newStatus}`
    );

    return res.status(200).json({
      received: true,
      action: 'processed',
      payment_id: payment.id,
      invoice_id: invoice.id,
      invoice_status: newStatus,
    });
  } catch (error) {
    console.error('Webhook processing error:', error);
    await markProcessed(`Exception: ${error.message}`);
    // Return 500 so Flutterwave retries. Idempotency check protects duplicates.
    return res.status(500).json({ error: error.message || 'Webhook processing failed' });
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
