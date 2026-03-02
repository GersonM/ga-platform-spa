import React from 'react';
import {Pagination} from "antd";
import type {ResponsePagination} from "../../Types/api.tsx";

interface TablePaginationProps {
  pagination?: ResponsePagination;
  onChange?: (page: number, size: number) => void;
  showTotal?: boolean;
  showSizeChanger?: boolean;
}

const TablePagination = ({pagination, showTotal = true, showSizeChanger = true, ...props}: TablePaginationProps) => {
  return (
    <Pagination
      style={{margin: '10px 0'}}
      align={'center'}
      total={pagination?.total}
      showSizeChanger={showSizeChanger}
      showTotal={showTotal ? (total) => `${total} en total` : undefined}
      pageSize={pagination?.per_page}
      current={pagination?.current_page}
      {...props}/>
  );
};

export default TablePagination;
