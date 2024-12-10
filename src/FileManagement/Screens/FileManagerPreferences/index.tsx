import React from 'react';
import FileUploader from '../../Components/FileUploader';
import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';

const FileManagerPreferences = () => {
  return (
    <div>
      <ContentHeader title={'Configuración de almacenamiento'} />
      <FileUploader />
    </div>
  );
};

export default FileManagerPreferences;
