import React from 'react';
import {SpeakerWaveIcon, VideoCameraIcon} from '@heroicons/react/24/outline';
import {PiFilePdfLight, PiFileSqlLight, PiFileXlsLight, PiThreeD} from 'react-icons/pi';

import {File} from '../../../Types/api';

interface FileIconProps {
  file: File;
  size?: number;
  width?: number;
}

const FileIcon = ({file, size = 18, width = 28}: FileIconProps) => {
  switch (true) {
    case file.type.includes('dwg'):
      return <PiThreeD className={'icon'} size={size} />;
    case file.type.includes('pdf'):
      //case file.name.includes('.pdf'):
      return <PiFilePdfLight className={'icon'} size={size} />;
    case file.name.includes('sql'):
      return <PiFileSqlLight className={'icon'} size={size} />;
    case file.name.includes('csv') || file.name.includes('xlsx'):
      return <PiFileXlsLight className={'icon'} size={size} />;
    case file.type.includes('image'):
      return <span className="icon icon-file-image"></span>;
    case file.type.includes('zip'):
      return <span className="icon icon-file-zip"></span>;
    case file.type.includes('text'):
      return <span className="icon icon-document"></span>;
    case file.type.includes('video'):
      return <VideoCameraIcon height={size} width={width} />;
    case file.type.includes('message'):
      return <span className="icon icon-envelope-open"></span>;
    case file.type.includes('aud'):
      return <SpeakerWaveIcon className={'icon'} height={size} width={width} />;
    default:
      return <span className="icon icon-file-empty"></span>;
  }
};

export default FileIcon;
