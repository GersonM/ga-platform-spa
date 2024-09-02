import React from 'react';
import {Button} from 'antd';
import './styles.less';

interface IconButtonProps {
  icon: React.ReactNode;
  danger?: boolean;
  loading?: boolean;
  small?: boolean;
  disabled?: boolean;
  type?: 'text' | 'link' | 'default' | 'dashed' | 'primary';
  onClick?: () => void;
}

const IconButton = ({icon, small, type = 'text', ...props}: IconButtonProps) => {
  return (
    <Button
      {...props}
      size={small ? 'small' : 'middle'}
      type={type}
      className={`icon-button-wrapper ${small ? 'small' : ''}`}
      shape={'circle'}>
      {icon}
    </Button>
  );
};

export default IconButton;
