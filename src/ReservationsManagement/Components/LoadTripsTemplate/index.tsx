import {useEffect, useState} from 'react';
import axios from 'axios';
import {TrashIcon} from '@heroicons/react/24/outline';
import {PiCheck} from 'react-icons/pi';
import {Dayjs} from 'dayjs';
import {DatePicker, List, Space} from 'antd';

import ErrorHandler from '../../../Utils/ErrorHandler';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import Config from '../../../Config';
import LoadingIndicator from '../../../CommonUI/LoadingIndicator';

interface ILoadTripsTemplateProps {
  onCompleted?: () => void;
}

const LoadTripsTemplate = ({onCompleted}: ILoadTripsTemplateProps) => {
  const [templates, setTemplates] = useState<any[]>();
  const [selectedDate, setSelectedDate] = useState<Dayjs|null>();
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(false);
  const [loadingTemplate, setLoadingTemplate] = useState(false);

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
    };
    setLoading(true);
    axios
      .get(`move/templates`, config)
      .then(_response => {
        setLoading(false);
        if (_response) {
          setTemplates(_response.data);
        }
      })
      .catch(_e => {
        setLoading(false);
        ErrorHandler.showNotification(_e);
      });

    return cancelTokenSource.cancel;
  }, [reload]);

  const loadTemplate = (template: any) => {
    console.log(template);
    setLoadingTemplate(true);
    axios
      .post('move/templates/load', {...template, date_to_apply: selectedDate?.format(Config.dateFormatServer)})
      .then(_response => {
        setLoadingTemplate(false);
        if(onCompleted) {
          onCompleted();
        }
      })
      .catch(_e => {
        setLoadingTemplate(false);
        ErrorHandler.showNotification(_e);
      });
  };

  const deleteTemplate = (template: any) => {
    axios
      .delete(`move/templates/${template.date}`, {
        ...template,
        date_to_apply: selectedDate?.format(Config.dateFormatServer),
      })
      .then(_response => {
        setReload(!reload);
      })
      .catch(_e => {});
  };

  return (
    <>
      <p>Elige la fecha y luego la plantilla que quieres cargar</p>
      <LoadingIndicator visible={loadingTemplate} message={'Aplicando plantilla'} />
      <DatePicker placeholder={'Fecha'} onChange={date => setSelectedDate(date)} />
      <List loading={loading}>
        {templates?.map((template, index) => (
          <List.Item
            key={index}
            extra={
              <Space>
                <PrimaryButton
                  onClick={() => loadTemplate(template)}
                  label={'Cargar'}
                  loading={loadingTemplate}
                  icon={<PiCheck size={16} />}
                  disabled={!selectedDate}
                  ghost
                  size={'small'}
                />
                <PrimaryButton
                  icon={<TrashIcon />}
                  danger
                  onClick={() => deleteTemplate(template)}
                  label={'Borrar'}
                  ghost
                  size={'small'}
                />
              </Space>
            }>
            {template.name}
          </List.Item>
        ))}
      </List>
    </>
  );
};

export default LoadTripsTemplate;
