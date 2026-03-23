import {useState} from 'react';
import {Alert, Form, Typography} from 'antd';
import {TbUpload} from 'react-icons/tb';
import axios from 'axios';

import CampaignSelector from '../CampaignSelector';
import CommercialProcessSelector from '../../../CRMModule/Components/CommercialProcessSelector';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import ErrorHandler from '../../../Utils/ErrorHandler';
import FileUploader from "../../../FileManagement/Components/FileUploader";

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
        onComplete?.(response.data);
      })
      .catch(error => {
        ErrorHandler.showNotification(error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

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
        <FileUploader />
      </Form.Item>

      {result && (
        <Alert
          style={{marginBottom: 16}}
          type={'success'}
          showIcon
          message={`Importación completada`}
          description={
            typeof result === 'object' ? (
              <ul style={{margin: 0, paddingLeft: 20}}>
                {result.imported !== undefined && <li>Importados: {result.imported}</li>}
                {result.skipped !== undefined && <li>Omitidos: {result.skipped}</li>}
                {result.errors !== undefined && <li>Errores: {result.errors}</li>}
                {result.message && <li>{result.message}</li>}
              </ul>
            ) : String(result)
          }
        />
      )}

      <PrimaryButton
        block
        loading={loading}
        label={'Importar candidatos'}
        htmlType={'submit'}
        icon={<TbUpload/>}
      />
    </Form>
  );
};

export default ImportLeadsForm;
