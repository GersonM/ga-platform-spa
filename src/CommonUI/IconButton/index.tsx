import React from 'react';
import {Button} from 'antd';
import './styles.less';

interface IconButtonProps {
  icon: React.ReactNode;
  danger?: boolean;
  loading?: boolean;
  small?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

const IconButton = ({icon, small, ...props}: IconButtonProps) => {
  return (
    <Button
      {...props}
      size={small ? 'small' : 'middle'}
      type={'text'}
      className={`icon-button-wrapper ${small ? 'small' : ''}`}
      shape={'circle'}>
      {icon}
    </Button>
  );
};

export default IconButton;
