import React from 'react';

interface FileSizeProps {
  size: number;
  showUnit?: boolean;
}

const FileSize = ({size, showUnit = true}: FileSizeProps) => {
  const getSize = (size: number) => {
    let unit = 'KB';
    let stepSize = size / 1000;
    if (stepSize < 1000) {
      return stepSize.toFixed(2) + unit;
    }

    unit = 'MB';
    stepSize = stepSize / 1000;
    if (stepSize < 1000) {
      return stepSize.toFixed(2) + unit;
    }

    unit = 'GB';
    stepSize = stepSize / 1000;
    if (stepSize < 1000) {
      return stepSize.toFixed(2) + (showUnit ? unit : '');
    }
  };

  return <>{getSize(size)}</>;
};

export default FileSize;
