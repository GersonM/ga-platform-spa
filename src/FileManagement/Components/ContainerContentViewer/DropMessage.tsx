import React from 'react';
import {BsCloudUpload} from 'react-icons/bs';

const DropMessage = () => {
  return (
    <div className={'drop-active-zone'}>
      <BsCloudUpload className="upload-icon" size={70} />
      Suelta los archivos aquí para subirlos
      <small>Puedes soltar varios archivos a la vez</small>
    </div>
  );
};

export default DropMessage;
