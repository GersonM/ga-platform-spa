import React, {useState} from 'react';
import {Modal} from 'antd';

import ModuleContent from '../../../CommonUI/ModuleContent';
import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';
import CreateSubscriptionForm from '../../Components/CreateSubscriptionForm';

const ClubMembersManagement = () => {
  const [openAddSubscription, setOpenAddSubscription] = useState(false);
  return (
    <ModuleContent>
      <ContentHeader title={'Socios'} onAdd={() => setOpenAddSubscription(true)} />

      <Modal open={openAddSubscription} onCancel={() => setOpenAddSubscription(false)} footer={null}>
        <CreateSubscriptionForm onComplete={() => setOpenAddSubscription(false)} />
      </Modal>
    </ModuleContent>
  );
};

export default ClubMembersManagement;
