import {useState} from 'react';
import {Scanner} from '@yudiel/react-qr-scanner';
import {Alert, Avatar, Col, Divider, Form, Input, Modal, notification, Row, Select, Space} from 'antd';
import ModuleContent from '../../../CommonUI/ModuleContent';
import axios from 'axios';

import ErrorHandler from '../../../Utils/ErrorHandler';
import {SubscriptionMember} from '../../../Types/api';
import InvoicesTable from '../../../PaymentManagement/Components/InvoicesTable';
import ProfileDocument from '../../../CommonUI/ProfileTools/ProfileDocument';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';

const MembersAccessControl = () => {
  const [subscriptionMember, setSubscriptionMember] = useState<SubscriptionMember>();

  const onScan = (barCode: any) => {
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

  const registerVisit = (values: any) => {
    axios
      .post('attendances', {...values, profile_uuid: subscriptionMember?.profile.uuid})
      .then(response => {
        console.log(response);
        notification.success({message: 'Ingreso registrado', placement: 'top'});
        setSubscriptionMember(undefined);
      })
      .catch(error => {
        ErrorHandler.showNotification(error);
      });
  };

  return (
    <ModuleContent>
      <ContentHeader title={'Acceso a miembros'} />
      <p>Acerca la credencial a la camara para escanearla</p>
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
              <InvoicesTable entityUuid={subscriptionMember.subscription.uuid} type={'subscription'} />
            )}
            <Form layout={'vertical'} style={{marginTop: 20}} onFinish={registerVisit}>
              <Form.Item label={'Lugar a visitar'} name={'area_uuid'}>
                <Select
                  placeholder={'Ingreso al club'}
                  options={[
                    {value: 'Restaurante', label: 'Restaurante'},
                    {value: 'Oficia de atención', label: 'Oficia de atención'},
                    {value: 'Club', label: 'Club'},
                  ]}
                  style={{width: '100%'}}
                />
              </Form.Item>
              <Form.Item label={'Observaciones (opcional)'} name={'observations'}>
                <Input.TextArea />
              </Form.Item>
              <PrimaryButton label={'Registrar ingreso'} htmlType={'submit'} block size={'large'} />
            </Form>
          </div>
        )}
      </Modal>
    </ModuleContent>
  );
};

export default MembersAccessControl;
