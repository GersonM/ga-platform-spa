import {VideoCameraIcon} from '@heroicons/react/24/outline';
import {PiFileDoc, PiFilePdf, PiFilePpt, PiFileSql, PiFileTxt, PiFileZip, PiSpeakerHigh, PiVectorThree} from 'react-icons/pi';
import {DiPhotoshop} from 'react-icons/di';
import {TbFile, TbFileTypeXls, TbPhoto} from "react-icons/tb";

import type {ApiFile} from '../../../Types/api';

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
      return <PiFileSql className={'icon'} size={size} />;
    case file.name.includes('csv') || file.name.includes('xlsx'):
      return <TbFileTypeXls className={'icon'} size={size} />;
    case file.type.includes('presentation') || file.name.includes('pptx'):
      return <PiFilePpt className={'icon'} size={size} />;
    case file.type.includes('document') || file.name.includes('docx'):
      return <PiFileDoc className={'icon'} size={size} />;
    case file.name.includes('.doc'):
      return <PiFileDoc className={'icon'} size={size} />;
    case file.type.includes('image'):
      return <TbPhoto className={'icon'} size={size}  />;
    case file.type.includes('zip') || file.name.includes('zip'):
      return <PiFileZip className={'icon'} size={size} />;
    case file.type.includes('text'):
      return <PiFileTxt className={'icon'} size={size} />;
    case file.type.includes('video'):
      return <VideoCameraIcon height={size} width={width} />;
    case file.type.includes('message'):
      return <span className="icon icon-envelope-open"></span>;
    case file.type.includes('aud'):
      return <PiSpeakerHigh className={'icon'} size={size} />;
    default:
      return <TbFile className={'icon'} size={size} />;
  }
};

export default FileIcon;
