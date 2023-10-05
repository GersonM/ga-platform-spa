import React from 'react';
import {File} from '../../../Types/api';
import {BsFileEarmarkPdf} from 'react-icons/bs';

interface FileIconProps {
  file: File;
}

const FileIcon = ({file}: FileIconProps) => {
  switch (true) {
    case file.type.includes('pdf'):
      return <BsFileEarmarkPdf className={'icon'} />;
    case file.type.includes('image'):
      return <span className="icon icon-file-image"></span>;
    case file.type.includes('zip'):
      return <span className="icon icon-file-zip"></span>;
    case file.type.includes('text'):
      return <span className="icon icon-document"></span>;
    case file.type.includes('video'):
      return <span className="icon icon-file-video"></span>;
    case file.type.includes('message'):
      return <span className="icon icon-envelope-open"></span>;
    default:
      return <span className="icon icon-file-empty"></span>;
  }
};

export default FileIcon;
