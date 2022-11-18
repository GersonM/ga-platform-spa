import React from 'react';
import {File} from '../../../Types/api';
import {BsFileEarmarkPdf} from 'react-icons/bs';

interface FileIconProps {
  file: File;
}
const FileIcon = ({file}: FileIconProps) => {
  let icon = <span className="icon icon-file-empty"></span>;
  if (file.type.includes('pdf')) {
    icon = <BsFileEarmarkPdf className={'icon'} />;
  }

  if (file.type.includes('image')) {
    icon = <span className="icon icon-file-image"></span>;
  }

  if (file.type.includes('zip')) {
    icon = <span className="icon icon-file-zip"></span>;
  }

  if (file.type.includes('text')) {
    icon = <span className="icon icon-document"></span>;
  }

  if (file.type.includes('video')) {
    icon = <span className="icon icon-file-video"></span>;
  }
  return icon;
};

export default FileIcon;
