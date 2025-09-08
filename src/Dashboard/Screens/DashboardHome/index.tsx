import {Card, Col, Row, Space} from 'antd';
import ModuleContent from '../../../CommonUI/ModuleContent';
import ServiceStatus from '../../../FileManagement/Components/ServiceStatus';
import MetaTitle from '../../../CommonUI/MetaTitle';
import ActivityLogViewer from "../../../ActivityLog/Components/ActivityLogViewer";

const DashboardHome = () => {
  return (
    <>
      <ModuleContent>
        <MetaTitle title={'Dashboard'}/>
        <h1>Dashboard</h1>
        <p>Aquí tienes un resumen lo que sucede en la aplicación</p>
        <Row gutter={[25, 25]}>
          <Col span={12}>
            <Card title={'Actividad'} size={'small'}>
              <ActivityLogViewer boxed={false} numItems={5} autoReload/>
            </Card>
          </Col>
          <Col span={12}>
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
