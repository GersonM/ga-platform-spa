import React from 'react';
import ModuleContent from '../../../CommonUI/ModuleContent';
import {Card, Col, Row} from 'antd';
import ServiceStatus from '../../../FileManagement/Components/ServiceStatus';
import Helmet from 'react-helmet';

const DashboardHome = () => {
  return (
    <>
      <ModuleContent>
        <Helmet>
          <title>Dashboard</title>
        </Helmet>
        <h1>Dashboard</h1>
        <p>Aquí tienes un resumen lo que sucede en la aplicación</p>
        <Row gutter={[15, 15]}>
          <Col>
            <Card title={'File management'} size={'small'}>
              <ServiceStatus />
            </Card>
          </Col>
          <Col>
            <Card title={'Commercial'} size={'small'}></Card>
          </Col>
        </Row>
      </ModuleContent>
    </>
  );
};

export default DashboardHome;
