import {Card, Space} from 'antd';
import ModuleContent from '../../../CommonUI/ModuleContent';
import ServiceStatus from '../../../FileManagement/Components/ServiceStatus';
import MetaTitle from '../../../CommonUI/MetaTitle';

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
