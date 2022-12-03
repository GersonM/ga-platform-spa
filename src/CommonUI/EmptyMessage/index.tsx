import React from 'react';
import {Empty} from 'antd';

interface EmptyMessageProps {
  message: string;
}

const EmptyMessage = ({message}: EmptyMessageProps) => {
  return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={message} />;
};

export default EmptyMessage;
