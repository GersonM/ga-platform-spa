import {useContext, useEffect, useState} from 'react';
import {Progress} from 'antd';
import {PiCheckCircleFill, PiXCircle} from 'react-icons/pi';

import './styles.less';
import FileSize from '../../../CommonUI/FileSize';
import UploadContext from '../../../Context/UploadContext';
import IconButton from '../../../CommonUI/IconButton';

const UploadInformation = () => {
  const [open, setOpen] = useState(true);
  const {fileList, progress} = useContext(UploadContext);

  useEffect(() => {
    setOpen(true);
  }, [fileList?.length]);

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
            <IconButton onClick={() => {
              setOpen(!open);
            }} type={'link'} icon={<PiXCircle size={20}/>}/>
          </div>
          <ul className={'files-list'}>
            {[...fileList].reverse().map((f, index) => {
              return (
                <li key={index}>
                  <span className={'file-name'}>
                    <span style={{flex: 1, marginRight: 10, display: 'block', wordBreak: 'break-all'}}>
                      {f.file.name}
                      <small>
                        {f.fileData ? <FileSize size={f.fileData.size}/> : 'Cargando...'}
                      </small>
                    </span>
                    {f.fileData && <PiCheckCircleFill color={'#00d800'} size={20}/>}
                  </span>
                  {!f.fileData && progress && f.hash == progress.hash &&
                    <Progress size={'small'} percent={Math.round(progress.percent * 100)}/>}
                </li>
              );
            })}
          </ul>
        </>
      )}
      <div className={'footer'}>
        {percent.toFixed(0)}% de {total} archivos
      </div>
    </div>
  );
};

export default UploadInformation;
