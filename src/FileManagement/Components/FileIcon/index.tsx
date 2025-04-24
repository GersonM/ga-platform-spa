import React from 'react';
import {SpeakerWaveIcon, VideoCameraIcon} from '@heroicons/react/24/outline';
import {PiFile, PiFileDoc, PiFilePdf, PiFilePpt, PiFileSqlLight, PiFileXls, PiVectorThree} from 'react-icons/pi';
import {DiPhotoshop} from 'react-icons/di';

import {ApiFile} from '../../../Types/api';

interface FileIconProps {
  file: ApiFile;
  size?: number;
  width?: number;
}

const FileIcon = ({file, size = 18, width = 28}: FileIconProps) => {
  switch (true) {
    case file.type.includes('dwg'):
      return <PiVectorThree className={'icon'} size={size} />;
    case file.type.includes('pdf'):
      return <PiFilePdf className={'icon'} size={size} />;
    case file.type.includes('adobe'):
      return <DiPhotoshop size={size} />;
    case file.name.includes('sql'):
      return <PiFileSqlLight className={'icon'} size={size} />;
    case file.name.includes('csv') || file.name.includes('xlsx'):
      return <PiFileXls className={'icon'} size={size} />;
    case file.type.includes('presentation') || file.name.includes('pptx'):
      return <PiFilePpt className={'icon'} size={size} />;
    case file.type.includes('document') || file.name.includes('docx'):
      return <PiFileDoc className={'icon'} size={size} />;
    case file.name.includes('doc'):
      return <PiFileDoc className={'icon'} size={size} />;
    case file.type.includes('image'):
      return <span className="icon icon-file-image"></span>;
    case file.type.includes('zip') || file.name.includes('zip'):
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
      return <PiFile className={'icon'} size={size} />;
  }
};

export default FileIcon;
