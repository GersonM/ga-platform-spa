import React from 'react';

const DropMessage = () => {
  return (
    <div className={'drop-active-zone'}>
      <span className="upload-icon icon-cloud-upload"></span>
      Suelta los archivos aquí para subirlos
      <small>Puedes soltar varios archivos a la vez</small>
    </div>
  );
};

export default DropMessage;
