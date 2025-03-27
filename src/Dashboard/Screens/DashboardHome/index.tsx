import React, {useEffect, useState} from 'react';
import ModuleContent from '../../../CommonUI/ModuleContent';
import {Card, Col, Row, Space} from 'antd';
import ServiceStatus from '../../../FileManagement/Components/ServiceStatus';
import Helmet from 'react-helmet';
import MetaTitle from '../../../CommonUI/MetaTitle';
import axios from 'axios';

const DashboardHome = () => {
  return (
    <>
      <ModuleContent>
        <MetaTitle title={'Dashboard'} />
        <h1>Dashboard</h1>
        <p>Aquí tienes un resumen lo que sucede en la aplicación</p>
        <Space>
          <Card title={'File management'} size={'small'}>
            <ServiceStatus />
          </Card>
        </Space>
      </ModuleContent>
    </>
  );
};

export default DashboardHome;
