import {Button} from 'antd';
import type {ReactNode} from "react";
import type {SizeType} from 'antd/es/config-provider/SizeContext';
import './styles.less';

interface PrimaryButtonProps {
  label?: string;
  className?: string;
  href?: string;
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

const PrimaryButton = ({label, size, disabled, children, icon, href, onClick, ...props}: PrimaryButtonProps) => {
  return (
    <Button
      className={'primary-button'}
      disabled={disabled}
      type="primary"
      icon={icon}
      href={href}
      size={size}
      onClick={onClick}
      {...props}>
      {label || children}
    </Button>
  );
};

export default PrimaryButton;
