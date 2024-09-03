import React from 'react';
import {Spin} from 'antd';
import {LoadingOutlined} from '@ant-design/icons';

import './styles.css';

interface LoadingIndicatorProps {
  overlay?: boolean;
  size: 'small' | 'default' | 'large';
  visible?: boolean;
  fitBox?: boolean;
  message?: string;
}

const LoadingIndicator = ({overlay, size, message, visible, fitBox = true}: LoadingIndicatorProps) => (
  <div
    className={`loader-container ${overlay ? 'overlay' : ''} ${visible ? 'show' : 'hide'} ${
      fitBox ? '' : 'remove-margin'
    }`}>
    <Spin size={size} indicator={<LoadingOutlined style={{fontSize: 20}} spin />} />
    {message && <span>{message}</span>}
  </div>
);

LoadingIndicator.defaultProps = {
  overlay: true,
  size: 'large',
};

export default LoadingIndicator;
