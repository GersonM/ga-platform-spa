import React, {useContext, useEffect, useState} from 'react';
import {Button, Progress} from 'antd';
import {AxiosProgressEvent} from 'axios';

import './styles.less';
import FileSize from '../../../CommonUI/FileSize';
import UploadContext from '../../../Context/UploadContext';
import LoadingIndicator from '../../../CommonUI/LoadingIndicator';

interface UploadInformationProps {
  files?: Array<File>;
  progress?: AxiosProgressEvent;
}

const UploadInformation = ({progress}: UploadInformationProps) => {
  const [open, setOpen] = useState(true);
  const {lastFileCompleted, fileList, isUploading} = useContext(UploadContext);

  useEffect(() => {
    console.log(fileList?.length);
    setOpen(true);
  }, [fileList]);

  if (!fileList || !open) return null;

  const total = fileList.length;
  const completed = fileList.filter(f => f.progress == 100).length;
  const percent = (completed / total) * 100;

  return (
    <div className={'upload-information-wrapper'}>
      {fileList && (
        <>
          <div className={'header'}>
            <h4>
              {percent < 100 ? 'Cargando...' : 'Terminado - '} {fileList.length} archivo{fileList.length > 1 ? 's' : ''}
            </h4>
            <Button
              onClick={() => setOpen(!open)}
              type={'link'}
              icon={<span className="button-icon-alone icon-cross"></span>}
            />
          </div>
          <ul className={'files-list'}>
            {[...fileList].reverse().map((f, index) => {
              return (
                <li key={index}>
                  {f.file.name}
                  <small>
                    {' - '}
                    {f.fileData ? <FileSize size={f.fileData.size} /> : 'Cargando...'}
                  </small>
                </li>
              );
            })}
          </ul>
        </>
      )}
      <Progress showInfo={false} gapPosition={'bottom'} percent={percent} />
      {percent.toFixed(0)}% de {total} archivos
    </div>
  );
};

export default UploadInformation;
