/**
 * ProspectEdit - Edit prospect page
 */

import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader, LoadingState, EmptyState, Card, Button } from '../../components/portal/common';
import { ProspectsIcon } from '../../components/common/Icons';
import ProspectForm from '../../components/portal/prospects/ProspectForm';
import { useProspect } from '../../hooks/useProspects';

const ProspectEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: prospect, isLoading, error } = useProspect(id);

  if (isLoading) {
    return <LoadingState text="Loading prospect..." />;
  }

  if (error || !prospect) {
    return (
      <div className="portal-page">
        <PageHeader title="Edit Prospect" backLink="/portal/prospects" />
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

  return (
    <div className="portal-page">
      <PageHeader
        title="Edit Prospect"
        subtitle={prospect.name}
        backLink={`/portal/prospects/${id}`}
        backLabel="Back"
      />
      <ProspectForm 
        prospect={prospect} 
        onSuccess={() => navigate(`/portal/prospects/${id}`)}
      />
    </div>
  );
};

export default ProspectEdit;