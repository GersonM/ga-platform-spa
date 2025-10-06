import React from 'react';
import {Tag} from "antd";

interface CustomTagProps {
  children?: React.ReactNode;
  color?: string;
}

const CustomTag = ({children, color='blue', ...props}:CustomTagProps) => {
  return (
    <Tag bordered={false} style={{ margin: 0 }} color={color} {...props}>
      {children}
    </Tag>
  );
};

export default CustomTag;
