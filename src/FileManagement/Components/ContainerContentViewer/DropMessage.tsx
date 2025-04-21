import React from 'react';
import {PiUploadDuotone} from 'react-icons/pi';

const DropMessage = () => {
  return (
    <div className={'drop-active-zone'}>
      <PiUploadDuotone className="upload-icon" size={70} />
      Suelta los archivos aquí para subirlos
      <small>Puedes soltar varios archivos a la vez</small>
    </div>
  );
};

export default DropMessage;
