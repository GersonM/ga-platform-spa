import React, {useEffect, useState} from 'react';
import {Button, Progress} from 'antd';
import {AxiosProgressEvent} from 'axios';

import './styles.less';
import FileSize from '../../../CommonUI/FileSize';
import {UploadQueueItem} from '../../../Types/api';

interface UploadInformationProps {
  files?: UploadQueueItem[];
  progress?: AxiosProgressEvent;
}

const UploadManager = ({files, progress}: UploadInformationProps) => {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    setOpen(true);
  }, [files]);

  if (!open) return null;

  const total = 0; //progress.total || 100;
  const percent = 0; //(progress.loaded / total) * 100;

  return (
    <div className={'upload-information-wrapper'}>
      {files && (
        <>
          <div className={'header'}>
            <h4>
              {percent < 100 ? 'Cargando...' : 'Terminado'} {' - '} {files.length} archivo{files.length > 1 ? 's' : ''}
            </h4>
            <Button
              onClick={() => setOpen(!open)}
              type={'link'}
              icon={<span className="button-icon-alone icon-cross"></span>}
            />
          </div>
          <ul className={'files-list'}>
            {files.map((f, index) => {
              return (
                <li key={index}>
                  {f.file.name}
                  <small>
                    {' - '}
                    <FileSize size={f.file.size} />
                  </small>
                </li>
              );
            })}
          </ul>
        </>
      )}
      <Progress showInfo={false} gapPosition={'bottom'} percent={percent} />
      {percent.toFixed(0)}% de <FileSize size={total} />
    </div>
  );
};

export default UploadManager;
