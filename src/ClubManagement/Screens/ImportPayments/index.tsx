import {useState} from 'react';
import {Alert, Col, Divider, Row, Space, Statistic, Tag} from 'antd';
import axios from 'axios';

import ModuleContent from '../../../CommonUI/ModuleContent';
import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';
import ErrorHandler from '../../../Utils/ErrorHandler';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import FileUploader from "../../../FileManagement/Components/FileUploader";

const ImportPayments = () => {
  const [responseMessages, setResponseMessages] = useState<any>();
  const [loading, setLoading] = useState(false);
  const [fileLoaded, setFileLoaded] = useState<string>();

  const importDocument = (fileUuid?: string) => {
    setLoading(true);
    setFileLoaded(fileUuid);
    axios
      .post('subscriptions/import-payments', {file_uuid: fileUuid})
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
      {responseMessages ? (
        <>
          <h3>Resumen de la importación</h3>
          <Space>
            <Statistic title={'Pagos creados'} value={responseMessages.payments_created} />
            <Statistic title={'Pagos actualizados'} value={responseMessages.payments_updated} />
          </Space>
          {responseMessages.log.map((m: any, index: number) => (
            <Alert banner key={index} message={m} type={'info'} />
          ))}
          {responseMessages.failed.map((m: any, index: number) => (
            <Alert banner key={index} message={m} type={m.includes('[ERROR]') ? 'error' : 'warning'} />
          ))}
          <PrimaryButton
            loading={loading}
            label={'Realizar otra carga'}
            block
            onClick={() => setResponseMessages(undefined)}
          />
        </>
      ) : (
        <Row justify="center">
          <Col xs={16}>
            <h2>Selecciona el archivo a importar</h2>
            <p>
              Sube un archivo en excel con la información de los pagos, la fecha de pago se considerá la que se
              especifica en la columna "Fecha estimada de pago"
            </p>
            <p><small>Orden de valores claves en el excel</small></p>
            <Space split={<Divider type={'vertical'} />}>
              <div><Tag color={'purple'}>A</Tag> ID Transacción</div>
              <div><Tag color={'purple'}>B</Tag> N° tarjeta</div>
              <div><Tag color={'purple'}>C</Tag> Cod. Autorización</div>
              <div><Tag color={'purple'}>F</Tag> DNI</div>
              <div><Tag color={'purple'}>O</Tag> Fecha pago</div>
              <div><Tag color={'purple'}>Y</Tag> Boleta</div>
            </Space>
            <br/>
            <br/>
            <FileUploader onChange={importDocument} onFilesUploaded={importDocument} />
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
