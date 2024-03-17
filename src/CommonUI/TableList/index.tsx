import {ColumnsType, TablePaginationConfig} from 'antd/lib/table';
import {Table, TableProps} from 'antd';
import {AnyObject} from 'antd/es/_util/type';
import {ExpandableConfig} from 'antd/lib/table/interface';

import './styles.less';

interface TableListProps {
  columns: ColumnsType<any>;
  components?: any;
  scroll?: any;
  loading?: boolean;
  small?: boolean;
  dataSource?: TableProps<AnyObject>['dataSource'];
  expandable?: ExpandableConfig<AnyObject>;
  rowKey?: string;
  pagination?: false | TablePaginationConfig;
}

const TableList = ({small, loading, columns, dataSource, expandable, rowKey = 'uuid', ...props}: TableListProps) => {
  return (
    <Table
      size={small ? 'small' : 'middle'}
      loading={loading}
      className={'table-list'}
      rowClassName={(_record, index) => (index % 2 === 0 ? 'table-row-light' : 'table-row-dark')}
      rowKey={rowKey}
      expandable={expandable}
      dataSource={dataSource}
      columns={columns}
      {...props}
    />
  );
};

export default TableList;
