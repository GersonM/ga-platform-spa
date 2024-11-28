import React, {useState} from 'react';
import {Scanner} from '@yudiel/react-qr-scanner';
import {Alert, Avatar, Col, Divider, Modal, Row, Tag} from 'antd';
import ModuleContent from '../../../CommonUI/ModuleContent';
import axios from 'axios';

import ErrorHandler from '../../../Utils/ErrorHandler';
import {Profile, SubscriptionMember} from '../../../Types/api';
import InvoicesTable from '../../../PaymentManagement/Components/InvoicesTable';
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
            {subscriptionMember.suspended_at && (
              <Alert
                style={{marginBottom: 10}}
                type={'error'}
                message={'Suspendido desde ' + subscriptionMember.suspended_at}
                showIcon
              />
            )}
            <h2 style={{textAlign: 'center'}}>
              <Avatar size={80} src={subscriptionMember.profile.avatar?.thumbnail} /> <br />
              {subscriptionMember.profile.name} {subscriptionMember.profile.last_name} <br />
              <ProfileDocument profile={subscriptionMember.profile} /> <br />
              N° {subscriptionMember.subscription?.code}
            </h2>
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
