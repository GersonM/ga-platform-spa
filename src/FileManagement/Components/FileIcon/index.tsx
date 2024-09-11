import React from 'react';
import {SpeakerWaveIcon, VideoCameraIcon} from '@heroicons/react/24/outline';
import {PiFilePdfLight, PiFileSqlLight, PiFileXlsLight} from 'react-icons/pi';

import {File} from '../../../Types/api';

interface FileIconProps {
  file: File;
}

const FileIcon = ({file}: FileIconProps) => {
  switch (true) {
    case file.type.includes('pdf'):
      return <PiFilePdfLight className={'icon'} />;
    case file.name.includes('sql'):
      return <PiFileSqlLight className={'icon'} />;
    case file.name.includes('csv') || file.name.includes('xlsx'):
      return <PiFileXlsLight className={'icon'} />;
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
