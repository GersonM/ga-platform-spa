import {useState} from 'react';
import {Alert, Form, Space, Typography} from 'antd';
import {TbUpload} from 'react-icons/tb';
import axios from 'axios';

import CampaignSelector from '../CampaignSelector';
import CommercialProcessSelector from '../../../CRMModule/Components/CommercialProcessSelector';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import ErrorHandler from '../../../Utils/ErrorHandler';
import FileUploader from "../../../FileManagement/Components/FileUploader";
import ApiFileSelector from "../../../FileManagement/Components/ApiFileSelector";
import CustomTag from "../../../CommonUI/CustomTag";
import AlertMessage from "../../../CommonUI/AlertMessage";

interface ImportLeadsFormProps {
  onComplete?: (result: any) => void;
}

const ImportLeadsForm = ({onComplete}: ImportLeadsFormProps) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = (values: any) => {
    setLoading(true);
    setResult(null);

    axios
      .post('commercial/leads/import', {
        file_uuid: values.file_uuid,
        campaign_uuid: values.campaign_uuid,
        process_uuid: values.process_uuid,
      })
      .then(response => {
        setResult(response.data);
        //onComplete?.(response.data);
      })
      .catch(error => {
        ErrorHandler.showNotification(error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  console.log(result, 'result')
  return (
    <Form form={form} layout={'vertical'} onFinish={handleSubmit}>
      <Typography.Title level={5} style={{marginTop: 0}}>
        Importar candidatos
      </Typography.Title>

      <Form.Item name={'campaign_uuid'} label={'Campaña'}>
        <CampaignSelector
          style={{width: '100%'}}
          onChange={(value, option) => {
            form.setFieldValue('campaign_uuid', value);
          }}
        />
      </Form.Item>

      <Form.Item name={'process_uuid'} label={'Proceso comercial'}>
        <CommercialProcessSelector
          style={{width: '100%'}}
          onChange={(value, option) => {
            form.setFieldValue('process_uuid', value);
          }}
        />
      </Form.Item>

      <Form.Item
        name={'file_uuid'}
        label={'Archivo (CSV o Excel)'}
        rules={[{required: true, message: 'Selecciona un archivo'}]}
      >
        <ApiFileSelector/>
      </Form.Item>
      <Form.Item label={'Orden de columnas para la importación'}>
        <Space wrap>
          <CustomTag color={'purple'}>A) Nombre</CustomTag>
          <CustomTag color={'purple'}>B) Apellidos</CustomTag>
          <CustomTag color={'purple'}>C) Email</CustomTag>
          <CustomTag color={'purple'}>D) Telefono</CustomTag>
          <CustomTag color={'purple'}>E) Tipo de documento</CustomTag>
          <CustomTag color={'purple'}>F) Número de documento</CustomTag>
          <CustomTag color={'purple'}>G) Apuntes</CustomTag>
          <CustomTag color={'purple'}>H) Fecha de creación</CustomTag>
          <CustomTag color={'purple'}>I...) Otros</CustomTag>
        </Space>
      </Form.Item>
      {result && (<>
          <Alert
            style={{marginBottom: 16}}
            type={'success'}
            showIcon
            title={`Importación completada`}
            description={
              <ul>
                <li>Importados: {result.created}</li>
                <li>Omitidos: {result.duplicates}</li>
                <li>Errores: {result.failed}</li>
                <li>Total de registros procesados: {result.total_reviewed}</li>
              </ul>
            }
          />
        </>
      )}

      {result ? <PrimaryButton
          block
          label={'Cerrar'}
          onClick={() => {
            onComplete?.(result);
          }}
        /> :
        <PrimaryButton
          block
          loading={loading}
          label={'Importar candidatos'}
          htmlType={'submit'}
          icon={<TbUpload/>}
        />
      }
    </Form>
  );
};

export default ImportLeadsForm;
