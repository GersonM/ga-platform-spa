import {VideoCameraIcon} from '@heroicons/react/24/outline';
import {PiFileDoc, PiFilePdf, PiFileSql, PiFileTxt, PiSpeakerHigh, PiVectorThree} from 'react-icons/pi';
import {DiPhotoshop} from 'react-icons/di';
import {TbFile, TbPhoto} from "react-icons/tb";
import {RiFileExcel2Line, RiFilePpt2Line, RiFileWord2Line} from "react-icons/ri";
import {GrDocumentZip} from "react-icons/gr";

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
      return <RiFileExcel2Line color={'#148914'} className={'icon'} size={size} />;
    case file.type.includes('presentation') || file.name.includes('pptx'):
      return <RiFilePpt2Line color={'#ff5711'} className={'icon'} size={size} />;
    case file.type.includes('document') || file.name.includes('docx'):
      return <RiFileWord2Line color={'#0064b5'} className={'icon'} size={size} />;
    case file.name.includes('.doc'):
      return <PiFileDoc className={'icon'} size={size} />;
    case file.type.includes('image'):
      return <TbPhoto className={'icon'} size={size}  />;
    case file.type.includes('zip') || file.name.includes('zip'):
      return <GrDocumentZip color={'#ffba18'} className={'icon'} size={size} />;
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
