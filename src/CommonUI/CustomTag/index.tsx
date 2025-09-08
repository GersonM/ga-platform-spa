import React from 'react';
import {Tag} from "antd";

interface CustomTagProps {
  children?: React.ReactNode;
  color?: string;
}

const CustomTag = ({children, ...props}:CustomTagProps) => {
  return (
    <Tag bordered={false} style={{ margin: 0 }} {...props}>
      {children}
    </Tag>
  );
};

export default CustomTag;
