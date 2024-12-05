import {TablePaginationConfig} from 'antd/lib/table';
import {Table, TableProps} from 'antd';
import {AnyObject} from 'antd/es/_util/type';
import {ExpandableConfig} from 'antd/lib/table/interface';

import './styles.less';

interface TableListProps {
  columns: any;
  components?: any;
  scroll?: any;
  footer?: any;
  loading?: boolean;
  size?: string;
  small?: boolean;
  dataSource?: TableProps<AnyObject>['dataSource'];
  expandable?: ExpandableConfig<AnyObject>;
  rowKey?: string;
  onClick?: (record: any, index?: number) => void;
  pagination?: false | TablePaginationConfig;
}

const TableList = ({
  small,
  loading,
  columns,
  dataSource,
  expandable,
  onClick,
  size,
  rowKey = 'uuid',
  ...props
}: TableListProps) => {
  return (
    <Table
      onRow={(record, rowIndex) => {
        return {
          onClick: () => {
            onClick && onClick(record, rowIndex);
          },
        };
      }}
      size={small ? 'small' : 'middle'}
      loading={loading}
      className={'table-list'}
      rowClassName={(record, index) => {
        let rowColor = index % 2 === 0 ? 'table-row-light' : 'table-row-dark';
        if (record.is_read !== undefined) {
          rowColor += record.is_read === true ? '' : ' highlighted-row';
        }
        return rowColor;
      }}
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
