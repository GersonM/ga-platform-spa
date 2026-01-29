import {Button} from 'antd';
import type {ReactNode} from "react";
import type {SizeType} from 'antd/es/config-provider/SizeContext';

interface PrimaryButtonProps {
  label?: string;
  className?: string;
  href?: string;
  shape?: 'circle' | 'default' | 'round';
  htmlType?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  children?: ReactNode;
  style?: object;
  height?: number;
  ghost?: boolean;
  danger?: boolean;
  icon?: ReactNode;
  onClick?: any;
  props?: object;
  size?: SizeType;
  loading?: boolean;
  block?: boolean;
}

const PrimaryButton = ({label, size, disabled, children, icon, href, onClick, shape = 'round', ...props}: PrimaryButtonProps) => {
  return (
    <Button
      disabled={disabled}
      type="primary"
      icon={icon}
      href={href}
      size={size}
      shape={shape}
      onClick={onClick}
      {...props}>
      {label || children}
    </Button>
  );
};

export default PrimaryButton;
