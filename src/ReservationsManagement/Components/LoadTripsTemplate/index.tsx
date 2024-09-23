import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {DatePicker, List} from 'antd';
import ErrorHandler from '../../../Utils/ErrorHandler';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import {Dayjs} from 'dayjs';
import Config from '../../../Config';

interface ILoadTripsTemplateProps {
  onCompleted?: () => void;
}

const LoadTripsTemplate = ({onCompleted}: ILoadTripsTemplateProps) => {
  const [templates, setTemplates] = useState<any[]>();
  const [selectedDate, setSelectedDate] = useState<Dayjs>();

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
    };

    axios
      .get(`move/templates`, config)
      .then(response => {
        if (response) {
          setTemplates(response.data);
        }
      })
      .catch(e => {
        ErrorHandler.showNotification(e);
      });

    return cancelTokenSource.cancel;
  }, []);

  const loadTemplate = (template: any) => {
    console.log(template);
    axios
      .post('move/templates/load', {...template, date_to_apply: selectedDate?.format(Config.dateFormatServer)})
      .then(response => {
        onCompleted && onCompleted();
      })
      .catch(e => {});
  };

  return (
    <div>
      Aplicación para:
      <DatePicker placeholder={'Fecha'} onChange={date => setSelectedDate(date)} />
      <List>
        {templates?.map((template, index) => (
          <List.Item
            key={index}
            extra={
              <>
                <PrimaryButton
                  onClick={() => loadTemplate(template)}
                  label={'Cargar'}
                  disabled={!selectedDate}
                  ghost
                  size={'small'}
                />
              </>
            }>
            {template.name}
          </List.Item>
        ))}
      </List>
    </div>
  );
};

export default LoadTripsTemplate;
