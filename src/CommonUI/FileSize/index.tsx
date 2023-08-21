import React from 'react';

interface FileSizeProps {
  size: number;
  showUnit?: boolean;
  binary?: boolean;
}

const FileSize = ({size, showUnit = true, binary = false}: FileSizeProps) => {
  const getSize = (size: number) => {
    const unitSize = binary ? 1024 : 1000;
    let unit = 'KB';
    let stepSize = size / unitSize;
    if (stepSize < 1000) {
      return stepSize.toFixed(2) + unit;
    }

    unit = 'MB';
    stepSize = stepSize / unitSize;
    if (stepSize < 1000) {
      return stepSize.toFixed(2) + unit;
    }

    unit = 'GB';
    stepSize = stepSize / unitSize;
    if (stepSize < unitSize) {
      return stepSize.toFixed(2) + (showUnit ? unit : '');
    }
  };

  return <>{getSize(size)}</>;
};

export default FileSize;
