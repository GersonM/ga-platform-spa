import {useState} from 'react';
import {Alert, Col, Divider, Row, Space, Statistic, Tag} from 'antd';
import axios from 'axios';

import ModuleContent from '../../../CommonUI/ModuleContent';
import ErrorHandler from '../../../Utils/ErrorHandler';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import FileUploader from "../../../FileManagement/Components/FileUploader";
import CustomTag from "../../../CommonUI/CustomTag";

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
            <Statistic title={'Total entradas'} value={responseMessages.total_reviewed}/>
            <Statistic title={'Pagos creados'} value={responseMessages.payments_created}/>
            <Statistic title={'Pagos actualizados'} value={responseMessages.payments_updated}/>
            <Divider type={'vertical'}/>
            <Statistic title={'Errores encontrados'}
                       value={responseMessages.failed.filter((e: string) => e.includes('[ERROR]')).length}/>
          </Space>
          {responseMessages.failed.map((m: any, index: number) => (
            <Alert banner key={index} message={m} type={m.includes('[ERROR]') ? 'error' : 'warning'}/>
          ))}
          {responseMessages.log.map((m: any, index: number) => (
            <Alert banner key={index} message={m} type={'info'}/>
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
            <p>
              Orden de valores claves en el documento a subir, por favor, verifica que la información esté organizada de esta manera</p>
            <code>
              <Space>
                <CustomTag color={'purple'}>A) ID Subscripción</CustomTag>
                <CustomTag color={'purple'}>B) Nombres</CustomTag>
                <CustomTag color={'purple'}>C) DNI</CustomTag>
                <CustomTag color={'purple'}>D) Periodo</CustomTag>
                <CustomTag color={'purple'}>E) Fecha de pago</CustomTag>
                <CustomTag color={'purple'}>F) Médio de pago</CustomTag>
                <CustomTag color={'purple'}>G) N° Operación</CustomTag>
                <CustomTag color={'purple'}>H) Monto</CustomTag>
                <CustomTag color={'purple'}>I) Boleta</CustomTag>
              </Space>
            </code>
            <br/>
            <br/>
            <FileUploader onChange={importDocument}/>
            <br/>
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
