import React, {useState} from 'react';
import {Scanner} from '@yudiel/react-qr-scanner';
import {Col, Divider, Modal, Row} from 'antd';
import ModuleContent from '../../../CommonUI/ModuleContent';
import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';
import axios from 'axios';
import ErrorHandler from '../../../Utils/ErrorHandler';
import {Profile, SubscriptionMember} from '../../../Types/api';
import InvoiceTablePayments from '../../../PaymentManagement/Components/InvoiceTablePayments';
import InvoicesTable from '../../../PaymentManagement/Components/InvoicesTable';
import ProfileChip from '../../../CommonUI/ProfileTools/ProfileChip';
import ProfileDocument from '../../../CommonUI/ProfileTools/ProfileDocument';
import ProfileCard from '../../../AccountManagement/Components/ProfileCard';

const MembersAccessControl = () => {
  const [token, setToken] = useState<any[]>();
  const [profile, setProfile] = useState<Profile>();
  const [subscriptionMember, setSubscriptionMember] = useState<SubscriptionMember>();

  const onScan = (barCode: any) => {
    setToken(barCode);
    axios
      .get('subscriptions/validate-member/' + barCode[0].rawValue)
      .then(response => {
        console.log(response);
        setSubscriptionMember(response.data);
      })
      .catch(error => {
        ErrorHandler.showNotification(error);
      });
  };

  return (
    <ModuleContent>
      <Row justify={'center'}>
        <Col md={12} xs={24}>
          <div>
            <Scanner allowMultiple onScan={onScan} />
          </div>
        </Col>
      </Row>
      <Modal open={!!subscriptionMember} onCancel={() => setSubscriptionMember(undefined)} footer={false}>
        {subscriptionMember && (
          <div>
            <ProfileCard allowEdit={false} profile={subscriptionMember.profile} />
            <h3 style={{textAlign: 'center'}}>
              <ProfileDocument profile={subscriptionMember.profile} />
            </h3>
            <Divider>Pagos</Divider>
            {subscriptionMember.subscription && (
              <InvoicesTable entityUuid={subscriptionMember.subscription.uuid} {...profile} />
            )}
          </div>
        )}
      </Modal>
    </ModuleContent>
  );
};

export default MembersAccessControl;
