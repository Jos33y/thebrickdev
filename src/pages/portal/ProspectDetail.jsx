/**
 * ProspectDetail - Single prospect view with email integration
 * 
 * Features:
 * - Prospect info and contact details
 * - Pipeline stage with quick actions
 * - Send Email functionality via Resend
 * - Activity timeline
 * - Convert to client option
 */

import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  PageHeader,
  Card,
  Button,
  StatusBadge,
  Modal,
  EmptyState,
  LoadingState,
  TextArea,
  Select,
} from '../../components/portal/common';
import {
  EditIcon,
  TrashIcon,
  ProspectsIcon,
  ExternalLinkIcon,
  MailIcon,
  PhoneIcon,
  GlobeIcon,
  MapPinIcon,
  PlusIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  SendIcon,
} from '../../components/common/Icons';
import {
  useProspect,
  useUpdateProspectStage,
  useAddProspectActivity,
  useDeleteProspect,
  useConvertToClient,
} from '../../hooks/useProspects';
import { formatCurrency, formatDate, formatRelativeDate } from '../../lib/formatters';
import { SendProspectEmailModal } from '../../components/portal/prospects';
import '../../styles/portal/prospects.css';

// Stage configuration
const STAGES = {
  identified: { label: 'Identified', color: 'neutral', next: 'contacted' },
  contacted: { label: 'Contacted', color: 'info', next: 'replied' },
  replied: { label: 'Replied', color: 'info', next: 'call_scheduled' },
  call_scheduled: { label: 'Call Scheduled', color: 'warning', next: 'proposal_sent' },
  proposal_sent: { label: 'Proposal Sent', color: 'warning', next: 'negotiating' },
  negotiating: { label: 'Negotiating', color: 'warning', next: 'won' },
  won: { label: 'Won', color: 'success', next: null },
  lost: { label: 'Lost', color: 'danger', next: null },
  no_response: { label: 'No Response', color: 'neutral', next: null },
};

const STAGE_ORDER = ['identified', 'contacted', 'replied', 'call_scheduled', 'proposal_sent', 'negotiating', 'won'];

// Source labels
const SOURCES = {
  craigslist: 'Craigslist',
  google_maps: 'Google Maps',
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
  upwork: 'Upwork',
  fiverr: 'Fiverr',
  referral: 'Referral',
  website: 'Website',
  cold_outreach: 'Cold Outreach',
  other: 'Other',
};

// Activity types for manual entry
const ACTIVITY_TYPES = [
  { value: 'note', label: 'Note' },
  { value: 'email_sent', label: 'Email Sent' },
  { value: 'email_received', label: 'Email Received' },
  { value: 'call', label: 'Phone Call' },
  { value: 'message_sent', label: 'Message Sent' },
  { value: 'message_received', label: 'Message Received' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'proposal', label: 'Proposal Sent' },
  { value: 'follow_up', label: 'Follow-up' },
];

const ACTIVITY_ICONS = {
  note: '📝',
  email_sent: '📤',
  email_received: '📥',
  call: '📞',
  message_sent: '💬',
  message_received: '💬',
  meeting: '🤝',
  proposal: '📄',
  stage_change: '📊',
  follow_up: '🔔',
};

const ProspectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showStageModal, setShowStageModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [showLostModal, setShowLostModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  
  // Form state
  const [activityType, setActivityType] = useState('note');
  const [activityDescription, setActivityDescription] = useState('');
  const [lostReason, setLostReason] = useState('');

  // Data hooks
  const { data: prospect, isLoading, error } = useProspect(id);
  const updateStage = useUpdateProspectStage();
  const addActivity = useAddProspectActivity();
  const deleteProspect = useDeleteProspect();
  const convertToClient = useConvertToClient();

  // Handlers
  const handleDelete = async () => {
    try {
      await deleteProspect.mutateAsync(id);
      navigate('/portal/prospects');
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleAddActivity = async () => {
    if (!activityDescription.trim()) return;
    
    try {
      await addActivity.mutateAsync({
        prospectId: id,
        activityType,
        description: activityDescription,
      });
      setShowActivityModal(false);
      setActivityDescription('');
      setActivityType('note');
    } catch (err) {
      console.error('Add activity failed:', err);
    }
  };

  const handleStageChange = async (newStage) => {
    try {
      await updateStage.mutateAsync({ id, stage: newStage });
      setShowStageModal(false);
    } catch (err) {
      console.error('Stage update failed:', err);
    }
  };

  const handleMarkLost = async () => {
    try {
      await updateStage.mutateAsync({ id, stage: 'lost', notes: lostReason });
      setShowLostModal(false);
      setLostReason('');
    } catch (err) {
      console.error('Mark lost failed:', err);
    }
  };

  const handleConvert = async () => {
    try {
      const clientData = {
        name: prospect.name,
        company: prospect.company,
        email: prospect.email,
        phone: prospect.phone,
        location: prospect.location,
        notes: `Converted from prospect. Original source: ${SOURCES[prospect.source] || prospect.source}`,
      };
      await convertToClient.mutateAsync({ prospectId: id, clientData });
      navigate('/portal/clients');
    } catch (err) {
      console.error('Convert failed:', err);
    }
  };

  const handleAdvanceStage = async () => {
    const nextStage = STAGES[prospect.stage]?.next;
    if (nextStage) {
      await handleStageChange(nextStage);
    }
  };

  // Loading state
  if (isLoading) {
    return <LoadingState text="Loading prospect..." />;
  }

  // Error state
  if (error || !prospect) {
    return (
      <div className="portal-page">
        <PageHeader title="Prospect" backLink="/portal/prospects" />
        <Card>
          <EmptyState
            icon={ProspectsIcon}
            title="Prospect not found"
            description="This prospect may have been deleted."
            action={
              <Button onClick={() => navigate('/portal/prospects')}>
                Back to Prospects
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  const currentStageIndex = STAGE_ORDER.indexOf(prospect.stage);
  const isActive = !['won', 'lost', 'no_response'].includes(prospect.stage);
  const canAdvance = isActive && STAGES[prospect.stage]?.next;

  return (
    <div className="portal-page prospect-detail">
      <PageHeader
        title={prospect.name}
        subtitle={prospect.company || SOURCES[prospect.source]}
        backLink="/portal/prospects"
        backLabel="Prospects"
        actions={
          <div className="prospect-detail__actions">
            <Button
              variant="secondary"
              icon={EditIcon}
              onClick={() => navigate(`/portal/prospects/${id}/edit`)}
            >
              Edit
            </Button>
            <Button
              variant="ghost"
              icon={TrashIcon}
              onClick={() => setShowDeleteModal(true)}
            >
              Delete
            </Button>
          </div>
        }
      />

      <div className="prospect-detail__grid">
        {/* Main Column */}
        <div className="prospect-detail__main">
          {/* Pipeline Progress */}
          <Card>
            <div className="prospect-pipeline">
              <div className="prospect-pipeline__header">
                <h3>Pipeline Stage</h3>
                <StatusBadge 
                  status={STAGES[prospect.stage]?.color || 'neutral'}
                  label={STAGES[prospect.stage]?.label || prospect.stage}
                />
              </div>
              
              {/* Stage Progress Bar */}
              {isActive && (
                <div className="prospect-pipeline__progress">
                  {STAGE_ORDER.slice(0, -1).map((stage, index) => (
                    <div 
                      key={stage}
                      className={`prospect-pipeline__step ${
                        index <= currentStageIndex ? 'prospect-pipeline__step--complete' : ''
                      } ${index === currentStageIndex ? 'prospect-pipeline__step--current' : ''}`}
                    >
                      <div className="prospect-pipeline__step-dot" />
                      <span className="prospect-pipeline__step-label">
                        {STAGES[stage]?.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Stage Actions */}
              <div className="prospect-pipeline__actions">
                {canAdvance && (
                  <Button 
                    variant="primary" 
                    onClick={handleAdvanceStage}
                    loading={updateStage.isPending}
                  >
                    Move to {STAGES[STAGES[prospect.stage].next]?.label}
                  </Button>
                )}
                
                {/* Send Email Button */}
                {isActive && prospect.email && (
                  <Button 
                    variant="secondary" 
                    icon={SendIcon}
                    onClick={() => setShowEmailModal(true)}
                  >
                    Send Email
                  </Button>
                )}
                
                {isActive && (
                  <>
                    <Button variant="secondary" onClick={() => setShowStageModal(true)}>
                      Change Stage
                    </Button>
                    <Button variant="ghost" onClick={() => setShowLostModal(true)}>
                      Mark Lost
                    </Button>
                  </>
                )}
                
                {prospect.stage === 'negotiating' && (
                  <Button 
                    variant="primary" 
                    icon={CheckCircleIcon}
                    onClick={() => setShowConvertModal(true)}
                  >
                    Convert to Client
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Activity Timeline */}
          <Card
            title="Activity"
            actions={
              <Button
                variant="secondary"
                size="sm"
                icon={PlusIcon}
                onClick={() => setShowActivityModal(true)}
              >
                Add Activity
              </Button>
            }
          >
            {prospect.activities?.length > 0 ? (
              <div className="prospect-timeline">
                {prospect.activities.map((activity) => (
                  <div key={activity.id} className="prospect-timeline__item">
                    <div className="prospect-timeline__icon">
                      {ACTIVITY_ICONS[activity.activity_type] || '📌'}
                    </div>
                    <div className="prospect-timeline__content">
                      <p className="prospect-timeline__description">
                        {activity.description}
                      </p>
                      <span className="prospect-timeline__date">
                        {formatRelativeDate(activity.created_at)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No activity yet"
                description="Add your first activity to track interactions."
                action={
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={PlusIcon}
                    onClick={() => setShowActivityModal(true)}
                  >
                    Add Activity
                  </Button>
                }
              />
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="prospect-detail__sidebar">
          {/* Contact Info */}
          <Card title="Contact">
            <div className="prospect-info">
              {prospect.email && (
                <a href={`mailto:${prospect.email}`} className="prospect-info__item">
                  <MailIcon size={16} />
                  <span>{prospect.email}</span>
                </a>
              )}
              {prospect.phone && (
                <a href={`tel:${prospect.phone}`} className="prospect-info__item">
                  <PhoneIcon size={16} />
                  <span>{prospect.phone}</span>
                </a>
              )}
              {prospect.website && (
                <a href={prospect.website} target="_blank" rel="noopener noreferrer" className="prospect-info__item">
                  <GlobeIcon size={16} />
                  <span>{prospect.website}</span>
                  <ExternalLinkIcon size={12} />
                </a>
              )}
              {prospect.location && (
                <div className="prospect-info__item">
                  <MapPinIcon size={16} />
                  <span>{prospect.location}</span>
                </div>
              )}
              {!prospect.email && !prospect.phone && !prospect.website && !prospect.location && (
                <p className="text-muted">No contact info</p>
              )}
            </div>
          </Card>

          {/* Deal Info */}
          <Card title="Deal Info">
            <div className="prospect-deal">
              <div className="prospect-deal__row">
                <span className="prospect-deal__label">Source</span>
                <span className="prospect-deal__value">{SOURCES[prospect.source] || prospect.source}</span>
              </div>
              {prospect.source_url && (
                <div className="prospect-deal__row">
                  <span className="prospect-deal__label">Source Link</span>
                  <a 
                    href={prospect.source_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="prospect-deal__link"
                  >
                    View Post <ExternalLinkIcon size={12} />
                  </a>
                </div>
              )}
              {prospect.estimated_value && (
                <div className="prospect-deal__row">
                  <span className="prospect-deal__label">Est. Value</span>
                  <span className="prospect-deal__value prospect-deal__value--highlight">
                    {formatCurrency(prospect.estimated_value, prospect.currency || 'USD')}
                  </span>
                </div>
              )}
              {prospect.project_type && (
                <div className="prospect-deal__row">
                  <span className="prospect-deal__label">Project Type</span>
                  <span className="prospect-deal__value">{prospect.project_type}</span>
                </div>
              )}
              {prospect.next_follow_up && (
                <div className="prospect-deal__row">
                  <span className="prospect-deal__label">Next Follow-up</span>
                  <span className={`prospect-deal__value ${
                    new Date(prospect.next_follow_up) < new Date() ? 'text-danger' : ''
                  }`}>
                    {formatDate(prospect.next_follow_up)}
                  </span>
                </div>
              )}
              <div className="prospect-deal__row">
                <span className="prospect-deal__label">Added</span>
                <span className="prospect-deal__value">{formatDate(prospect.created_at)}</span>
              </div>
            </div>
          </Card>

          {/* Notes */}
          {prospect.notes && (
            <Card title="Notes">
              <p className="prospect-notes">{prospect.notes}</p>
            </Card>
          )}

          {/* Converted Client Link */}
          {prospect.converted_client_id && (
            <Card title="Converted">
              <Link 
                to={`/portal/clients/${prospect.converted_client_id}`}
                className="prospect-converted-link"
              >
                <CheckCircleIcon size={16} />
                <span>View Client</span>
                <ChevronRightIcon size={14} />
              </Link>
            </Card>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Prospect"
        size="sm"
      >
        <p>Are you sure you want to delete <strong>{prospect.name}</strong>? This action cannot be undone.</p>
        <div className="modal__footer">
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDelete}
            loading={deleteProspect.isPending}
          >
            Delete
          </Button>
        </div>
      </Modal>

      {/* Add Activity Modal */}
      <Modal
        isOpen={showActivityModal}
        onClose={() => setShowActivityModal(false)}
        title="Add Activity"
        size="md"
      >
        <div className="form-grid">
          <Select
            label="Activity Type"
            value={activityType}
            onChange={(e) => setActivityType(e.target.value)}
            options={ACTIVITY_TYPES}
          />
          <TextArea
            label="Description"
            value={activityDescription}
            onChange={(e) => setActivityDescription(e.target.value)}
            placeholder="What happened?"
            rows={3}
          />
        </div>
        <div className="modal__footer">
          <Button variant="secondary" onClick={() => setShowActivityModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleAddActivity}
            loading={addActivity.isPending}
            disabled={!activityDescription.trim()}
          >
            Add Activity
          </Button>
        </div>
      </Modal>

      {/* Change Stage Modal */}
      <Modal
        isOpen={showStageModal}
        onClose={() => setShowStageModal(false)}
        title="Change Stage"
        size="sm"
      >
        <div className="stage-options">
          {Object.entries(STAGES).filter(([key]) => key !== prospect.stage && key !== 'won').map(([key, stage]) => (
            <button
              key={key}
              className="stage-option"
              onClick={() => handleStageChange(key)}
            >
              <StatusBadge status={stage.color} label={stage.label} />
            </button>
          ))}
        </div>
      </Modal>

      {/* Mark Lost Modal */}
      <Modal
        isOpen={showLostModal}
        onClose={() => setShowLostModal(false)}
        title="Mark as Lost"
        size="sm"
      >
        <TextArea
          label="Reason (optional)"
          value={lostReason}
          onChange={(e) => setLostReason(e.target.value)}
          placeholder="Why did this prospect not convert?"
          rows={3}
        />
        <div className="modal__footer">
          <Button variant="secondary" onClick={() => setShowLostModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleMarkLost}
            loading={updateStage.isPending}
          >
            Mark Lost
          </Button>
        </div>
      </Modal>

      {/* Convert to Client Modal */}
      <Modal
        isOpen={showConvertModal}
        onClose={() => setShowConvertModal(false)}
        title="Convert to Client"
        size="sm"
      >
        <p>
          Convert <strong>{prospect.name}</strong> to a client? This will:
        </p>
        <ul className="convert-checklist">
          <li>Create a new client record</li>
          <li>Copy contact information</li>
          <li>Mark this prospect as "Won"</li>
        </ul>
        <div className="modal__footer">
          <Button variant="secondary" onClick={() => setShowConvertModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            icon={CheckCircleIcon}
            onClick={handleConvert}
            loading={convertToClient.isPending}
          >
            Convert to Client
          </Button>
        </div>
      </Modal>

      {/* Send Email Modal */}
      <SendProspectEmailModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        prospect={prospect}
      />
    </div>
  );
};

export default ProspectDetail;