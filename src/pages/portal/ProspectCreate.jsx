/**
 * ProspectCreate - Add new prospect page
 */

import { PageHeader } from '../../components/portal/common';
import ProspectForm from '../../components/portal/prospects/ProspectForm';

const ProspectCreate = () => {
  return (
    <div className="portal-page">
      <PageHeader
        title="Add Prospect"
        subtitle="Track a new lead"
        backLink="/portal/prospects"
        backLabel="Prospects"
      />
      <ProspectForm />
    </div>
  );
};

export default ProspectCreate;