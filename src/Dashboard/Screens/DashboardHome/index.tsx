import {Card, Col, Row} from 'antd';
import ModuleContent from '../../../CommonUI/ModuleContent';
import ServiceStatus from '../../../FileManagement/Components/ServiceStatus';
import MetaTitle from '../../../CommonUI/MetaTitle';
import ActivityLogViewer from "../../../ActivityLog/Components/ActivityLogViewer";

import '/node_modules/react-grid-layout/css/styles.css';
import '/node_modules/react-resizable/css/styles.css';

const DashboardHome = () => {

  return (
    <>
      <ModuleContent style={{padding:'30px'}}>
        <MetaTitle title={'Dashboard'}/>
        <h1 style={{fontSize:30, fontWeight: 400}}>Dashboard</h1>
        <p>Aquí tienes un resumen lo que sucede en la aplicación</p>

        <Row gutter={[25, 25]}>
          <Col md={12}>
            <Card title={'Actividad'} size={'small'}>
              <ActivityLogViewer boxed={false} numItems={5} autoReload/>
            </Card>
          </Col>
          <Col md={12}>
            <Card title={'Almacenamiento'} size={'small'}>
              <ServiceStatus/>
            </Card>
          </Col>
        </Row>
      </ModuleContent>
    </>
  );
};

export default DashboardHome;
