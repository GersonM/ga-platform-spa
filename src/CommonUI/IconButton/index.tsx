import {Button, Tooltip} from 'antd';
import type {ReactNode} from "react";

interface IconButtonProps {
  icon: ReactNode;
  danger?: boolean;
  loading?: boolean;
  href?: string;
  target?: string;
  ghost?: boolean;
  small?: boolean;
  title?: string;
  disabled?: boolean;
  htmlType?: 'button' | 'submit';
  type?: 'text' | 'link' | 'default' | 'dashed' | 'primary';
  onClick?: () => void;
}

const IconButton = ({title, icon, small, type = 'text', loading, ...props}: IconButtonProps) => {
  const button = (
    <Button
      size={small ? 'small' : 'middle'}
      type={type}
      loading={loading}
      className={`${small ? 'small' : ''}`}
      shape={'circle'}
      style={{fontSize:19}}
      {...props}
    >
      {loading ? null : icon}
    </Button>
  );

  return title ? <Tooltip title={title}>{button}</Tooltip> : button;
};

export default IconButton;
