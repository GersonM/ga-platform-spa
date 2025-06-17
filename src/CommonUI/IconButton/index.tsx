import {Button, Tooltip} from 'antd';
import './styles.less';

interface IconButtonProps {
  icon: React.ReactNode;
  danger?: boolean;
  loading?: boolean;
  small?: boolean;
  title?: string;
  disabled?: boolean;
  type?: 'text' | 'link' | 'default' | 'dashed' | 'primary';
  onClick?: () => void;
}

const IconButton = ({title, icon, small, type = 'text', loading, ...props}: IconButtonProps) => {
  const button = (
    <Button
      size={small ? 'small' : 'middle'}
      type={type}
      loading={loading}
      className={`icon-button-wrapper ${small ? 'small' : ''}`}
      shape={'circle'}
      {...props}
    >
      {loading ? null : icon}
    </Button>
  );

  return title ? <Tooltip title={title}>{button}</Tooltip> : button;
};

export default IconButton;
