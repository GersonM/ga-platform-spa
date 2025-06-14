import {useState} from 'react';
import {Scanner} from '@yudiel/react-qr-scanner';
import {Alert, Avatar, Button, Card, Col, Divider, Form, Input, Modal, notification, Row, Select} from 'antd';
import ModuleContent from '../../../CommonUI/ModuleContent';
import axios from 'axios';

import ErrorHandler from '../../../Utils/ErrorHandler';
import type {SubscriptionMember} from '../../../Types/api';
import InvoicesTable from '../../../PaymentManagement/Components/InvoicesTable';
import ProfileDocument from '../../../CommonUI/ProfileTools/ProfileDocument';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';
import ProfileChip from "../../../CommonUI/ProfileTools/ProfileChip.tsx";
import ReportAttendance from "./ReportAttendance.tsx";

const MembersAccessControl = () => {
  const [subscriptionMember, setSubscriptionMember] = useState<SubscriptionMember>();
  const [profileDocument, setProfileDocument] = useState<string>()
  const [documentSearching, setDocumentSearching] = useState(false);
  const [profileFound, setProfileFound] = useState<any>();
  const [notFound, setNotFound] = useState<boolean>()
  const [inProcess, setInProcess] = useState(false);

  const searchExternal = () => {
    const config = {
      params: {doc_number: profileDocument}
    };

    setDocumentSearching(true);

    axios
      .get(`hr-management/profiles/external-search`, config)
      .then(response => {
        if (response) {
          setProfileFound(response.data);
        }
        setInProcess(true);
        setDocumentSearching(false);
      })
      .catch((error) => {
        setDocumentSearching(false);
        ErrorHandler.showNotification(error);
      });
  }

  const onScan = (barCode: any) => {
    axios
      .get('subscriptions/validate-member/' + barCode[0].rawValue)
      .then(response => {
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
        notification.success({message: 'Ingreso registrado', placement: 'top'});
        setSubscriptionMember(undefined);
      })
      .catch(error => {
        ErrorHandler.showNotification(error);
      });
  };

  return (
    <ModuleContent>
      <ContentHeader title={'Control de acceso'}/>
      <p>Acerca la credencial a la camara para escanearla o digital el DNI en el campo</p>
      <Row justify={'center'}>
        <Col md={12} xs={24}>
          <div>
            {!inProcess && <>
              <Scanner allowMultiple onScan={onScan}/>
              <Divider>o</Divider>
            </>
            }
            {inProcess ? (
                <>
                  {notFound == true && (
                    <>
                      <PrimaryButton block label={'Registrar persona'} onClick={searchExternal}/>
                    </>
                  )}
                  <Card>
                    <h3>Registrar ingreso</h3>
                    {profileFound && profileFound.uuid && <>
                      <ProfileChip profile={profileFound}/>
                    </>}
                    <ReportAttendance profile={profileFound} onCompleted={() => {
                      setInProcess(false);
                      setProfileFound(undefined);
                      setProfileDocument(undefined);
                    }}/>
                  </Card>
                  <Button type="link" block onClick={() => {
                    setInProcess(false);
                    setProfileFound(undefined);
                  }}>
                    Volver
                  </Button>
                </>)
              :
              <Row gutter={16}>
                <Col md={12} xs={24}>
                  <Input
                    size={"large"}
                    prefix={'DNI/CE'}
                    onChange={e => setProfileDocument(e.target.value)}
                  />
                </Col>
                <Col md={12} xs={24}>
                  <PrimaryButton
                    size={"large"} block label={'Buscar'} disabled={!profileDocument}
                    loading={documentSearching}
                    onClick={searchExternal}/>
                </Col>
              </Row>
            }
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
              <Avatar size={80} src={subscriptionMember.profile.avatar?.thumbnail}/> <br/>
              {subscriptionMember.profile.name} {subscriptionMember.profile.last_name} <br/>
              <ProfileDocument profile={subscriptionMember.profile}/> <br/>
              N° {subscriptionMember.subscription?.code}
            </h2>
            <Divider>Pagos</Divider>
            {subscriptionMember.subscription && (
              <InvoicesTable entityUuid={subscriptionMember.subscription.uuid} type={'subscription'}/>
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
                <Input.TextArea/>
              </Form.Item>
              <PrimaryButton label={'Registrar ingreso'} htmlType={'submit'} block size={'large'}/>
            </Form>
          </div>
        )}
      </Modal>
    </ModuleContent>
  );
};

export default MembersAccessControl;
