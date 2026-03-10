import type {TablePaginationConfig} from 'antd/lib/table';
import {Table} from 'antd';
import type {TableProps} from 'antd';
import type {AnyObject} from 'antd/es/_util/type';
import type {ExpandableConfig} from 'antd/lib/table/interface';

import './styles.less';

interface TableListProps {
  columns: any;
  components?: any;
  scroll?: any;
  footer?: any;
  customStyle?: boolean;
  loading?: boolean;
  bordered?: boolean;
  small?: boolean;
  dataSource?: TableProps['dataSource'];
  expandable?: ExpandableConfig<AnyObject>;
  rowKey?: string;
  onClick?: (record: any, index?: number) => void;
  pagination?: false | TablePaginationConfig;
}

const TableList = (
  {
    small,
    loading,
    columns,
    customStyle = false,
    dataSource,
    expandable,
    onClick,
    rowKey = 'uuid',
    ...props
  }: TableListProps) => {
  return (
    <Table
      onRow={(record, rowIndex) => {
        return {
          onClick: () => {
            if (onClick) {
              onClick(record, rowIndex);
            }
          },
        };
      }}
      size={small ? 'small' : 'middle'}
      loading={loading}
      className={customStyle ? 'table-list' : undefined}
      pagination={false}
      rowKey={rowKey}
      expandable={expandable}
      dataSource={dataSource}
      columns={columns}
      {...props}
    />
  );
};

export default TableList;
