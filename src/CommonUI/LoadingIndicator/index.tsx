import React from 'react';
import {Spin} from 'antd';
import {LoadingOutlined} from '@ant-design/icons';

import './styles.css';

interface LoadingIndicatorProps {
  overlay?: boolean;
  size: 'small' | 'default' | 'large';
  visible?: boolean;
  message?: string;
}

const LoadingIndicator = ({overlay, size, message, visible}: LoadingIndicatorProps) => (
  <div className={`loader-container ${overlay ? 'overlay' : ''} ${visible ? 'show' : 'hide'}`}>
    <Spin size={size} indicator={<LoadingOutlined style={{fontSize: 20}} spin />} />
    {message && <span>{message}</span>}
  </div>
);

LoadingIndicator.defaultProps = {
  overlay: true,
  size: 'large',
};

export default LoadingIndicator;
