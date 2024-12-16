import React, {useContext} from 'react';
import FileUploader from '../../Components/FileUploader';
import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';
import UploadContext from '../../../Context/UploadContext';
import FileSize from '../../../CommonUI/FileSize';

const FileManagerPreferences = () => {
  const {fileList} = useContext(UploadContext);
  return (
    <div>
      <ContentHeader title={'Configuración de almacenamiento'} />
      <FileUploader />
      <div>
        <ul>
          {fileList?.map((item, index) => (
            <li key={index}>
              {item.file.name} - <FileSize size={item.file.size} />
              <br />
              <small>{item.hash}</small>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default FileManagerPreferences;
