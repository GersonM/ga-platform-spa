import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {MovePassenger} from '../../../Types/api';
import ErrorHandler from '../../../Utils/ErrorHandler';
import {Dayjs} from 'dayjs';
import Config from '../../../Config';
import {List} from 'antd';
import PrimaryButton from '../../../CommonUI/PrimaryButton';

interface PrintContractsDocumentsProps {
  date?: Dayjs;
}

const PrintContractsDocuments = ({date}: PrintContractsDocumentsProps) => {
  const [passengers, setPassengers] = useState<MovePassenger[]>();

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
      params: {date: date?.format(Config.dateFormatServer)},
    };

    axios
      .get(`move/passengers`, config)
      .then(response => {
        if (response) {
          setPassengers(response.data);
        }
      })
      .catch(e => {
        ErrorHandler.showNotification(e);
      });

    return cancelTokenSource.cancel;
  }, []);

  return (
    <div>
      <List>
        {passengers?.map((p, index) => {
          return (
            <List.Item
              key={index}
              extra={
                <>
                  <PrimaryButton
                    ghost
                    label={'Imprimir'}
                    size={'small'}
                    onClick={() => {
                      console.log(p.profile?.commercial_client?.contracts);
                    }}
                  />
                </>
              }>
              {p.profile?.name}
            </List.Item>
          );
        })}
      </List>
    </div>
  );
};

export default PrintContractsDocuments;
