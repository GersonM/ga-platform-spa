import {useState} from 'react';
import {Alert, Col, Row, Space, Statistic} from 'antd';
import axios from 'axios';

import ModuleContent from '../../../CommonUI/ModuleContent';
import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';
import FileUploader from '../../../CommonUI/FileUploader';
import {ApiFile} from '../../../Types/api';
import ErrorHandler from '../../../Utils/ErrorHandler';
import PrimaryButton from '../../../CommonUI/PrimaryButton';

const ImportPayments = () => {
  const [responseMessages, setResponseMessages] = useState<any>();
  const [loading, setLoading] = useState(false);
  const [fileLoaded, setFileLoaded] = useState<ApiFile>();

  const importDocument = (file?: ApiFile) => {
    setLoading(true);
    if (file) {
      setFileLoaded(file);
    }
    axios
      .post('subscriptions/import-payments', {file_uuid: file ? file.uuid : fileLoaded?.uuid})
      .then(response => {
        setLoading(false);
        setResponseMessages(response.data);
      })
      .catch(error => {
        setLoading(false);
        ErrorHandler.showNotification(error);
      });
  };

  return (
    <ModuleContent>
      <ContentHeader title={'Importar pagos'} />
      {responseMessages ? (
        <div>
          <h3>Resumen de la importación</h3>
          <Space>
            <Statistic title={'Pagos creados'} value={responseMessages.payments_created} />
            <Statistic title={'Pagos actualizados'} value={responseMessages.payments_updated} />
          </Space>
          {responseMessages.failed.map((m: any, index: number) => (
            <Alert banner key={index} message={m} type={m.includes('[ERROR]') ? 'error' : 'warning'} />
          ))}
          <PrimaryButton
            loading={loading}
            label={'Realizar otra carga'}
            block
            onClick={() => setResponseMessages(undefined)}
          />
        </div>
      ) : (
        <Row justify="center">
          <Col xs={12}>
            <h2>Selecciona el archivo a importar</h2>
            <p>
              Sube un archivo en excel con la información de los pagos, la fecha de pago se considerá la que se
              especifica en la columna "Fecha estimada de pago"
            </p>
            <FileUploader onFilesUploaded={importDocument} />
            <br />
            <PrimaryButton
              disabled={!fileLoaded}
              loading={loading}
              label={'Importar documento'}
              block
              onClick={() => importDocument()}
            />
          </Col>
        </Row>
      )}
    </ModuleContent>
  );
};

export default ImportPayments;
