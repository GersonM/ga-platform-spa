import React from 'react';
import {Spin} from 'antd';
import './styles.css';

interface LoadingIndicatorProps {
  overlay?: boolean;
  size: 'small' | 'default' | 'large';
  visible?: boolean;
  message?: string;
}

const LoadingIndicator = ({
  overlay,
  size,
  message,
  visible = true,
}: LoadingIndicatorProps) => (
  <div
    className={`loader-container ${overlay ? 'overlay' : ''} ${
      visible ? 'show' : 'hide'
    }`}>
    <Spin size={size} />
    {message ? null : <span>{message}</span>}
  </div>
);

LoadingIndicator.defaultProps = {
  overlay: true,
  size: 'large',
};

export default LoadingIndicator;
