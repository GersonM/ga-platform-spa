import React from 'react';
import ModuleContent from '../../../CommonUI/ModuleContent';
import PersonSubscription from '../../../PaymentManagement/Components/PersonSubscription';
import {useParams} from 'react-router-dom';

const ClubSubscription = () => {
  const params = useParams();
  return (
    <ModuleContent>{params.subscription && <PersonSubscription profileUuid={params.subscription} />}</ModuleContent>
  );
};

export default ClubSubscription;
