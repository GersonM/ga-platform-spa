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
  const [inProcess, setInProcess] = useState(false);

  const searchExternal = (values: any) => {
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
        setInProcess(true);
        setDocumentSearching(false);
        ErrorHandler.showNotification(error);
      });
  }

  const onScan = (barCode: any) => {
    axios
      .get('subscriptions/validate-member/' + barCode[0].rawValue)
      .then(response => {
        setSubscriptionMember(response.data);
        setInProcess(true);
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
                  <Card title={'Registro de acceso'}>
                    <ReportAttendance subscription={subscriptionMember} profile={profileFound} onCompleted={() => {
                      setInProcess(false);
                      setProfileFound(undefined);
                      setProfileDocument(undefined);
                    }}/>
                  </Card><br/>
                  <Button size={"large"} block onClick={() => {
                    setInProcess(false);
                    setProfileFound(undefined);
                    setSubscriptionMember(undefined);
                  }}>
                    Terminar
                  </Button>
                </>)
              :
              <Form onFinish={searchExternal}>
                <Row gutter={16}>
                  <Col md={12} xs={24}>
                    <Form.Item name={'doc_number'}>
                      <Input
                        size={"large"}
                        prefix={'DNI/CE'}
                        onChange={e => setProfileDocument(e.target.value)}
                      />
                    </Form.Item>
                  </Col>
                  <Col md={12} xs={24}>
                    <PrimaryButton
                      htmlType={'submit'}
                      size={"large"} block label={'Buscar'} disabled={!profileDocument}
                      loading={documentSearching}/>
                  </Col>
                </Row>
              </Form>
            }
          </div>
        </Col>
      </Row>
    </ModuleContent>
  );
};

export default MembersAccessControl;
