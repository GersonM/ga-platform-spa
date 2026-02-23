import React from 'react';
import {Tag} from "antd";

interface CustomTagProps {
  children?: React.ReactNode;
  style?: React.CSSProperties;
  color?: string;
  variant?: 'filled' | 'outlined' | 'solid' | undefined;
}

const CustomTag = ({children, color = 'blue', variant = 'filled', ...props}: CustomTagProps) => {
  return (
    <Tag variant={variant} style={{margin: 0}} color={color} {...props}>
      {children}
    </Tag>
  );
};

export default CustomTag;
