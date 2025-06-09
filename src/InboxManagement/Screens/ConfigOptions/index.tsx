
import {Tabs} from 'antd';
import ConfigAccounts from './ConfigAccounts';
import ConfigProviders from './ConfigProviders';
import {useNavigate, useParams} from 'react-router-dom';
import './styles.less';
import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';

const ConfigOptions = () => {
  const params = useParams();
  const navigate = useNavigate();

  console.log(params.tab);

  return (
    <>
      <ContentHeader title={'Configuración de cuentas de correo'} />
      <Tabs
        animated={{inkBar: true, tabPane: true}}
        onChange={tab => {
          navigate(`/config/inbox-management/${tab}`);
        }}
        activeKey={params.tab}
        items={[
          {
            label: 'Proveedores',
            key: 'providers',
            children: <ConfigProviders />,
          },
          {
            label: 'Cuentas y usuarios',
            key: 'accounts',
            children: <ConfigAccounts />,
          },
        ]}
      />
    </>
  );
};

export default ConfigOptions;
