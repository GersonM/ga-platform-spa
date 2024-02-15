import React from 'react';
import {ApiFile} from '../../../Types/api';
import {BsFileEarmarkPdf} from 'react-icons/bs';
import {SpeakerWaveIcon, VideoCameraIcon} from '@heroicons/react/24/outline';

interface FileIconProps {
  file: ApiFile;
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
      return <VideoCameraIcon height={45} width={28} />;
    case file.type.includes('message'):
      return <span className="icon icon-envelope-open"></span>;
    case file.type.includes('aud'):
      return <SpeakerWaveIcon className={'icon'} height={34} width={28} />;
    default:
      return <span className="icon icon-file-empty"></span>;
  }
};

export default FileIcon;
