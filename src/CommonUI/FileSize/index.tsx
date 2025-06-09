

interface FileSizeProps {
  size: number;
  showUnit?: boolean;
  binary?: boolean;
}

const FileSize = ({size, showUnit = true, binary = false}: FileSizeProps) => {
  const _getSize = (size: number) => {
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

  const formatBytes = (bytes: number, decimals = 2) => {
    if (!+bytes) return '0 Bytes';

    const k = binary ? 1000 : 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

  return <>{formatBytes(size)}</>;
};

export default FileSize;
