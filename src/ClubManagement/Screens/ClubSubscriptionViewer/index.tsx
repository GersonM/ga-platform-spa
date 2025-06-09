
import {useParams} from 'react-router-dom';

import ModuleContent from '../../../CommonUI/ModuleContent';
import PersonSubscription from '../../../PaymentManagement/Components/PersonSubscription';

const ClubSubscription = () => {
  const params = useParams();
  return (
    <ModuleContent>{params.subscription && <PersonSubscription profileUuid={params.subscription} />}</ModuleContent>
  );
};

export default ClubSubscription;
