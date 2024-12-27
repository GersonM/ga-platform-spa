import React, {useContext} from 'react';
import FileUploader from '../../Components/FileUploader';
import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';
import UploadContext from '../../../Context/UploadContext';
import FileSize from '../../../CommonUI/FileSize';
import LoadingIndicator from '../../../CommonUI/LoadingIndicator';

const FileManagerPreferences = () => {
  const {fileList, isUploading} = useContext(UploadContext);
  return (
    <div>
      <ContentHeader title={'Configuración de almacenamiento'} />
      <LoadingIndicator message={'Uploading...'} overlay={false} visible={isUploading} />
      <FileUploader showPreview multiple onChange={uuid => console.log('uploaded', uuid)} />
      <div>
        <ul>
          {fileList?.map((item, index) => (
            <li key={index}>
              {item.file.name} - <FileSize size={item.file.size} />
              <br />
              <small>
                {item.hash} | {item.progress}
              </small>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default FileManagerPreferences;
