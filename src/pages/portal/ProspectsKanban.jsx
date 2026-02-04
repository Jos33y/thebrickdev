/**
 * ProspectsKanban - Visual pipeline board view
 * 
 * Matches the CSS structure in kanban.css
 */

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PageHeader,
  Card,
  Button,
  LoadingState,
  EmptyState,
} from '../../components/portal/common';
import {
  PlusIcon,
  ProspectsIcon,
  ListIcon,
} from '../../components/common/Icons';
import {
  useProspects,
  useUpdateProspectStage,
} from '../../hooks/useProspects';
import { formatCurrency, formatRelativeDate } from '../../lib/formatters';
import '../../styles/portal/kanban.css';

// Active pipeline stages (horizontal columns)
const PIPELINE_STAGES = [
  { id: 'identified', label: 'Identified' },
  { id: 'contacted', label: 'Contacted' },
  { id: 'replied', label: 'Replied' },
  { id: 'call_scheduled', label: 'Call Scheduled' },
  { id: 'proposal_sent', label: 'Proposal' },
  { id: 'negotiating', label: 'Negotiating' },
];

// Closed stages (shown at bottom)
const CLOSED_STAGES = [
  { id: 'won', label: 'Won' },
  { id: 'lost', label: 'Lost' },
  { id: 'no_response', label: 'No Response' },
];

// Source abbreviations
const SOURCE_ABBREV = {
  craigslist: 'CL',
  google_maps: 'GM',
  instagram: 'IG',
  linkedin: 'LI',
  upwork: 'UW',
  fiverr: 'FV',
  referral: 'REF',
  website: 'WEB',
  cold_outreach: 'CO',
  other: 'OTH',
};

const ProspectsKanban = () => {
  const navigate = useNavigate();
  const { data: prospects, isLoading, error } = useProspects();
  const updateStage = useUpdateProspectStage();
  
  const [dragOverStage, setDragOverStage] = useState(null);

  // Group prospects by stage
  const getProspectsByStage = (stageId) => {
    return prospects?.filter(p => p.stage === stageId) || [];
  };

  // Calculate stage value
  const getStageValue = (stageId) => {
    return getProspectsByStage(stageId).reduce((sum, p) => sum + (p.estimated_value || 0), 0);
  };

  // Drag handlers
  const handleDragStart = (e, prospect) => {
    e.dataTransfer.setData('prospectId', prospect.id);
    e.dataTransfer.setData('currentStage', prospect.stage);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, stageId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverStage(stageId);
  };

  const handleDragLeave = () => {
    setDragOverStage(null);
  };

  const handleDrop = async (e, newStage) => {
    e.preventDefault();
    setDragOverStage(null);
    
    const prospectId = e.dataTransfer.getData('prospectId');
    const currentStage = e.dataTransfer.getData('currentStage');
    
    if (currentStage !== newStage) {
      try {
        await updateStage.mutateAsync({ id: prospectId, stage: newStage });
      } catch (err) {
        console.error('Failed to update stage:', err);
      }
    }
  };

  // Loading
  if (isLoading) {
    return <LoadingState text="Loading pipeline..." />;
  }

  // Error
  if (error) {
    return (
      <div className="portal-page prospects-kanban">
        <PageHeader title="Sales Pipeline" />
        <div className="prospects-kanban__error">Failed to load prospects</div>
      </div>
    );
  }

  const activeCount = prospects?.filter(p => 
    !['won', 'lost', 'no_response'].includes(p.stage)
  ).length || 0;

  return (
    <div className="portal-page prospects-kanban">
      <PageHeader
        title="Sales Pipeline"
        subtitle={`${activeCount} prospects in pipeline`}
        actions={
          <div className="prospects-kanban__header-actions">
            <Button
              variant="secondary"
              icon={ListIcon}
              onClick={() => navigate('/portal/prospects')}
            >
              List View
            </Button>
            <Button
              variant="primary"
              icon={PlusIcon}
              onClick={() => navigate('/portal/prospects/new')}
            >
              Add Prospect
            </Button>
          </div>
        }
      />

      <div className="kanban-board">
        {/* Active Pipeline Columns */}
        <div className="kanban-board__columns">
          {PIPELINE_STAGES.map((stage) => {
            const stageProspects = getProspectsByStage(stage.id);
            const stageValue = getStageValue(stage.id);
            
            return (
              <div
                key={stage.id}
                className={`kanban-column ${dragOverStage === stage.id ? 'kanban-column--drag-over' : ''}`}
                onDragOver={(e) => handleDragOver(e, stage.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, stage.id)}
              >
                <div className="kanban-column__header">
                  <div className="kanban-column__title">
                    <span className={`kanban-column__dot kanban-column__dot--${stage.id}`} />
                    {stage.label}
                    <span className="kanban-column__count">{stageProspects.length}</span>
                  </div>
                  {stageValue > 0 && (
                    <span className="kanban-column__value">
                      {formatCurrency(stageValue, 'USD')}
                    </span>
                  )}
                </div>

                <div className="kanban-column__cards">
                  {stageProspects.length === 0 ? (
                    <div className="kanban-column__empty">No prospects</div>
                  ) : (
                    stageProspects.map((prospect) => (
                      <KanbanCard
                        key={prospect.id}
                        prospect={prospect}
                        onDragStart={handleDragStart}
                        onClick={() => navigate(`/portal/prospects/${prospect.id}`)}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Closed Deals Section */}
        <div className="kanban-board__closed">
          <div className="kanban-board__closed-header">Closed</div>
          <div className="kanban-board__closed-columns">
            {CLOSED_STAGES.map((stage) => {
              const stageProspects = getProspectsByStage(stage.id);
              const stageValue = getStageValue(stage.id);
              
              return (
                <div
                  key={stage.id}
                  className={`kanban-column kanban-column--compact ${dragOverStage === stage.id ? 'kanban-column--drag-over' : ''}`}
                  onDragOver={(e) => handleDragOver(e, stage.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, stage.id)}
                >
                  <div className="kanban-column__header">
                    <div className="kanban-column__title">
                      <span className={`kanban-column__dot kanban-column__dot--${stage.id}`} />
                      {stage.label}
                      <span className="kanban-column__count">{stageProspects.length}</span>
                    </div>
                    {stageValue > 0 && (
                      <span className="kanban-column__value">
                        {formatCurrency(stageValue, 'USD')}
                      </span>
                    )}
                  </div>

                  <div className="kanban-column__cards">
                    {stageProspects.length === 0 ? (
                      <div className="kanban-column__empty">Empty</div>
                    ) : (
                      stageProspects.map((prospect) => (
                        <div
                          key={prospect.id}
                          className="kanban-card kanban-card--compact"
                          onClick={() => navigate(`/portal/prospects/${prospect.id}`)}
                        >
                          <span className="kanban-card__name">{prospect.name}</span>
                          {prospect.estimated_value > 0 && (
                            <span className="kanban-card__value">
                              {formatCurrency(prospect.estimated_value, prospect.currency || 'USD')}
                            </span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * KanbanCard Component
 */
const KanbanCard = ({ prospect, onDragStart, onClick }) => {
  const isOverdue = prospect.next_follow_up && new Date(prospect.next_follow_up) < new Date();

  return (
    <div
      className={`kanban-card ${isOverdue ? 'kanban-card--overdue' : ''}`}
      draggable
      onDragStart={(e) => onDragStart(e, prospect)}
      onClick={onClick}
    >
      <div className="kanban-card__header">
        <span className="kanban-card__name">{prospect.name}</span>
        {prospect.estimated_value > 0 && (
          <span className="kanban-card__value">
            {formatCurrency(prospect.estimated_value, prospect.currency || 'USD')}
          </span>
        )}
      </div>

      {prospect.company && (
        <div className="kanban-card__company">{prospect.company}</div>
      )}

      <div className="kanban-card__meta">
        <span className={`kanban-card__source kanban-card__source--${prospect.source}`}>
          {SOURCE_ABBREV[prospect.source] || prospect.source}
        </span>
        {prospect.project_type && (
          <span className="kanban-card__type">{prospect.project_type}</span>
        )}
      </div>

      {(prospect.next_follow_up || prospect.last_contacted_at) && (
        <div className="kanban-card__footer">
          {prospect.next_follow_up && (
            <span className={`kanban-card__followup ${isOverdue ? 'kanban-card__followup--overdue' : ''}`}>
              Follow-up: {formatRelativeDate(prospect.next_follow_up)}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default ProspectsKanban;