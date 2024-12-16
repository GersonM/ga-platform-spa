import React, {useState} from 'react';
import ModuleContent from '../../../CommonUI/ModuleContent';
import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';
import FileUploader from '../../../CommonUI/FileUploader';
import {ApiFile} from '../../../Types/api';
import axios from 'axios';
import ErrorHandler from '../../../Utils/ErrorHandler';
import {Col, Row} from 'antd';
import PrimaryButton from '../../../CommonUI/PrimaryButton';

const ImportPayments = () => {
  const [responseMessages, setResponseMessages] = useState<string[]>();
  const [loading, setLoading] = useState(false);

  const importDocument = (file: ApiFile) => {
    axios
      .post('subscriptions/import-payments')
      .then(response => {
        setResponseMessages(response.data);
      })
      .catch(error => {
        ErrorHandler.showNotification(error);
      });
  };

  return (
    <ModuleContent>
      <ContentHeader title={'Importar pagos'} />
      <Row justify="center">
        <Col xs={12}>
          <h2>Selecciona el archivo a importar</h2>
          <p>
            Sube un archivo en excel con la información de los pagos, la fecha de pago se considerá la que se especifica
            en la columna "Fecha estimada de pago"
          </p>
          <FileUploader onFilesUploaded={importDocument} />
          <br />
          <PrimaryButton label={'Importar documento'} block onClick={importDocument} />
        </Col>
      </Row>
    </ModuleContent>
  );
};

export default ImportPayments;
