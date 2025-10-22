import React from 'react';
import {Pagination} from "antd";
import type {ResponsePagination} from "../../Types/api.tsx";

interface TablePaginationProps {
  pagination?: ResponsePagination;
  onChange?: (page: number) => void;
  showTotal?: boolean;
  showSizeChanger?: boolean;
}

const TablePagination = ({pagination, showTotal = true, showSizeChanger = false, ...props}: TablePaginationProps) => {
  return (
    <Pagination
      style={{marginTop: 10}}
      align={'center'}
      total={pagination?.total}
      showTotal={showTotal ? (total) => `${total} en la consulta actual` : undefined}
      pageSize={pagination?.per_page}
      current={pagination?.current_page}
      {...props}/>
  );
};

export default TablePagination;
