import ModuleContent from '../../../CommonUI/ModuleContent';
import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';
import {Table} from 'antd';

const WarehouseProductsManager = () => {
  return (
    <ModuleContent>
      <ContentHeader title={'Productos'} />
      <Table />
    </ModuleContent>
  );
};

export default WarehouseProductsManager;
