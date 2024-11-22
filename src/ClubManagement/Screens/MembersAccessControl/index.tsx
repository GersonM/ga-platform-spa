import React, {useState} from 'react';
import ModuleContent from '../../../CommonUI/ModuleContent';
import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';
import {Scanner} from '@yudiel/react-qr-scanner';
import {Col, Row} from 'antd';

const MembersAccessControl = () => {
  const [token, setToken] = useState<any[]>();

  const onScan = (barCode: any) => {
    setToken(barCode);
  };

  return (
    <ModuleContent>
      <ContentHeader title={'Control de acceso'} />
      <Row justify={'center'}>
        <Col md={12} xs={24}>
          <Scanner allowMultiple onScan={onScan} />
          <h3>Información</h3>
          {token?.map(r => {
            return r.rawValue;
          })}
        </Col>
      </Row>
    </ModuleContent>
  );
};

export default MembersAccessControl;
