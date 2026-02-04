/**
 * SendProspectEmailModal - Modal for sending emails to prospects
 */

import { useState, useEffect } from 'react';
import { Modal, Button, Select, Input, TextArea } from '../../portal/common';
import { useTemplatesForProspect, replaceTemplateVariables, buildTemplateVariables } from '../../../hooks/useEmailTemplates';
import { useSendProspectEmail } from '../../../hooks/useSendProspectEmail';
import { useSettings } from '../../../hooks/useSettings';
import { EMAIL_TEMPLATE_TYPE_LABELS } from '../../../lib/constants';
import { SendIcon, AlertIcon, CheckCircleIcon } from '../../common/Icons';

export function SendProspectEmailModal({ isOpen, onClose, prospect, onSuccess }) {
  const { data: settings } = useSettings();
  const { data: templates, isLoading: templatesLoading } = useTemplatesForProspect(prospect);
  const { sendEmail, isPending, error, reset } = useSendProspectEmail();

  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [toEmail, setToEmail] = useState('');
  const [success, setSuccess] = useState(false);

  // Initialize email when prospect changes
  useEffect(() => {
    if (prospect?.email) {
      setToEmail(prospect.email);
    }
  }, [prospect]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedTemplateId('');
      setSubject('');
      setBody('');
      setSuccess(false);
      reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]); // Remove reset from deps - it's not memoized

  // Handle template selection
  const handleTemplateChange = (e) => {
    const templateId = e.target.value;
    setSelectedTemplateId(templateId);

    if (templateId) {
      const template = templates?.find(t => t.id === templateId);
      if (template) {
        const variables = buildTemplateVariables(prospect, settings);
        setSubject(replaceTemplateVariables(template.subject, variables));
        setBody(replaceTemplateVariables(template.body, variables));
      }
    } else {
      setSubject('');
      setBody('');
    }
  };

  // Get selected template object
  const selectedTemplate = templates?.find(t => t.id === selectedTemplateId);

  // Handle send
  const handleSend = async () => {
    if (!toEmail || !subject || !body) return;

    const result = await sendEmail({
      prospect: { ...prospect, email: toEmail },
      template: selectedTemplate,
      subject,
      body,
      settings,
    });

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 1500);
    }
  };

  // Build template options for Select component (uses options prop, not children)
  const templateOptions = [
    { value: '', label: 'Select a template...' },
    ...(templates?.map(t => ({
      value: t.id,
      label: `${EMAIL_TEMPLATE_TYPE_LABELS[t.template_type] || t.template_type}${t.source_filter ? ` (${t.source_filter})` : ''}`,
    })) || [])
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Send Email to ${prospect?.name || 'Prospect'}`}
      size="lg"
    >
      <div className="send-email-form">
        {success ? (
          <div className="send-email-form__success">
            <CheckCircleIcon size={48} />
            <h3>Email Sent!</h3>
            <p>Your email has been sent successfully.</p>
            {selectedTemplate?.auto_advance_stage && (
              <p className="send-email-form__success-note">
                Stage will be updated automatically.
              </p>
            )}
            {selectedTemplate?.auto_follow_up_days && (
              <p className="send-email-form__success-note">
                Follow-up scheduled in {selectedTemplate.auto_follow_up_days} days.
              </p>
            )}
          </div>
        ) : (
          <>
            {/* Template Selection - uses options prop */}
            <Select
              label="Template"
              value={selectedTemplateId}
              onChange={handleTemplateChange}
              options={templateOptions}
              disabled={templatesLoading}
              placeholder="Select a template..."
              hint={selectedTemplate?.auto_advance_stage ? 'This will auto-advance the prospect stage' : undefined}
            />

            {/* To Email */}
            <Input
              label="To"
              type="email"
              value={toEmail}
              onChange={(e) => setToEmail(e.target.value)}
              placeholder="recipient@example.com"
            />

            {/* Subject */}
            <Input
              label="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject..."
            />

            {/* Body */}
            <TextArea
              label="Message"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your message..."
              rows={10}
            />

            {/* Template Variables Help */}
            <div className="send-email-form__variables">
              <span className="send-email-form__variables-label">Available variables:</span>
              <div className="send-email-form__variables-list">
                <code>{'{{prospect_name}}'}</code>
                <code>{'{{company}}'}</code>
                <code>{'{{my_name}}'}</code>
                <code>{'{{my_company}}'}</code>
                <code>{'{{my_email}}'}</code>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="send-email-form__error">
                <AlertIcon size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Actions */}
            <div className="send-email-form__actions">
              <Button variant="secondary" onClick={onClose} disabled={isPending}>
                Cancel
              </Button>
              <Button
                variant="primary"
                icon={SendIcon}
                onClick={handleSend}
                disabled={!toEmail || !subject || !body || isPending}
                loading={isPending}
              >
                {isPending ? 'Sending...' : 'Send Email'}
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

export default SendProspectEmailModal;